import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { extractText } from "@/lib/knowledge-indexer";



function makeAbsolute(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

// Check link content type using a fast HEAD request
async function getLinkContentType(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeout);

    return response.headers.get("content-type") || "";
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const { url, forceScan } = await request.json();

    if (!url || !url.trim()) {
      return NextResponse.json({ error: "URL не может быть пустым." }, { status: 400 });
    }

    // Check if url is already downloaded/indexed and we don't forceScan
    if (!forceScan) {
      const manifestPath = path.join(process.cwd(), "knowledge/downloads-manifest.json");
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
          const parentEntry = Object.entries(manifest).find(
            ([_, m]: [string, any]) => m.original_url === url && m.parent_page_url === url
          );
          if (parentEntry) {
            const [filename, meta] = parentEntry as [string, any];
            const downloadDir = path.join(process.cwd(), "public/downloads");
            const filePath = path.join(downloadDir, filename);
            if (fs.existsSync(filePath)) {
              console.log(`Serving scanned data from cache for: ${url}`);
              const extractedText = fs.readFileSync(filePath, "utf-8");
              
              const pageFiles = Object.entries(manifest)
                .filter(([_, m]: [string, any]) => m.parent_page_url === url && m.original_url !== url)
                .map(([fName, m]: [string, any]) => ({
                  title: m.title,
                  url: m.original_url,
                  type: fName.toLowerCase().endsWith(".txt") ? "html_page" : "document",
                  contentType: fName.toLowerCase().endsWith(".txt") ? "text/plain" : "application/octet-stream",
                  status: m.status || "downloaded",
                  checked: m.status === "failed",
                }));

              return NextResponse.json({
                title: meta.title,
                extractedText,
                links: pageFiles,
                fromCache: true,
                status: meta.status,
              });
            }
          }
        } catch (e) {
          console.error("Cache read error:", e);
        }
      }
    }

    console.log(`Scanning URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Не удалось загрузить страницу: ${response.status} ${response.statusText}` }, { status: 400 });
    }

    const contentType = response.headers.get("content-type") || "";
    const cLower = contentType.toLowerCase();
    const urlParsed = new URL(url);
    const urlPathname = urlParsed.pathname.toLowerCase();

    // Determine if the URL contains a document based on Content-Type or file extension
    const isDocument = 
      [".pdf", ".docx", ".doc", ".xlsx", ".xls", ".txt"].some(ext => urlPathname.endsWith(ext)) ||
      cLower.includes("pdf") || 
      cLower.includes("msword") || 
      cLower.includes("officedocument") || 
      cLower.includes("octet-stream");

    if (isDocument) {
      console.log(`URL is a direct document: ${url} (Content-Type: ${contentType})`);
      const arrayBuffer = await response.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      
      const filename = path.basename(urlPathname) || "document";
      // Ensure we preserve extension if we know it from content-type
      let resolvedFilename = filename;
      if (!path.extname(filename)) {
        if (cLower.includes("pdf")) {
          resolvedFilename += ".pdf";
        } else if (cLower.includes("docx")) {
          resolvedFilename += ".docx";
        } else if (cLower.includes("doc")) {
          resolvedFilename += ".doc";
        } else if (cLower.includes("text/plain")) {
          resolvedFilename += ".txt";
        }
      }

      const tempDownloadDir = path.join(process.cwd(), "public/downloads");
      if (!fs.existsSync(tempDownloadDir)) {
        fs.mkdirSync(tempDownloadDir, { recursive: true });
      }
      
      // Write to a temporary file
      const tempPath = path.join(tempDownloadDir, `temp_scan_${Date.now()}_${resolvedFilename}`);
      fs.writeFileSync(tempPath, fileBuffer);
      
      let extractedText = "";
      try {
        extractedText = await extractText(tempPath, process.env.GEMINI_API_KEY, process.env.OPENROUTER_API_KEY);
      } catch (err: any) {
        console.error("Temp document extraction failed:", err);
        extractedText = `[Ошибка извлечения текста: ${err.message}]`;
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
      
      const title = resolvedFilename;
      
      // Update queue status in crawled-sources.json
      const sourcesPath = path.join(process.cwd(), "knowledge/crawled-sources.json");
      let sources: Record<string, any> = {};
      if (fs.existsSync(sourcesPath)) {
        try {
          sources = JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));
        } catch {}
      }
      
      sources[url] = {
        title,
        status: "scanned",
        parentUrl: null,
      };
      fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));
      
      return NextResponse.json({
        title,
        extractedText,
        links: [], // No sublinks for direct document
      });
    }

    const buffer = await response.arrayBuffer();
    
    // Detect charset
    const contentTypeHeader = response.headers.get("content-type") || "";
    let charset = "utf-8";
    const charsetMatch = contentTypeHeader.match(/charset=([\w-]+)/i);
    if (charsetMatch) {
      charset = charsetMatch[1].toLowerCase();
    } else {
      const tempText = new TextDecoder("utf-8").decode(buffer);
      const metaMatch = tempText.match(/<meta[^>]*charset=["']?([\w-]+)["']?/i) || 
                        tempText.match(/<meta[^>]*http-equiv=["']?Content-Type["']?[^>]*content=["']?[^;]+;\s*charset=([\w-]+)["']?/i);
      if (metaMatch) {
        charset = metaMatch[1].toLowerCase();
      }
    }

    console.log(`Detected charset for ${url}: ${charset}`);

    let html = "";
    try {
      html = new TextDecoder(charset).decode(buffer);
    } catch {
      html = new TextDecoder("utf-8").decode(buffer);
    }

    const $ = cheerio.load(html);

    const title = $("title").text().trim() || "Без названия";

    // Clean body HTML for raw text extraction
    const page$ = cheerio.load(html);
    
    // Remove unwanted elements commonly found on Russian gov / legal portals
    page$(
      "script, style, iframe, noscript, svg, nav, header, footer, .menu, .sidebar, .nav, " +
      "#header, #footer, .breadcrumbs, .breadcrumb, .social-links, .share, .tags, .print-btn, " +
      ".reklama, .banner, .banners, .ads, .auth-block, .search-form, .search-block, " +
      ".user-menu, .pagination, .comments, .comment, #comments, #sidebar, .related-links"
    ).remove();

    // Select the main content block
    let mainContentBlock = page$("main, article, [role='main'], .content, #content, .post, .article").first();
    if (mainContentBlock.length === 0) {
      mainContentBlock = page$("body");
    }

    // Heuristically remove blocks inside main content that have too many links (link density > 0.6)
    // to filter out navigation structures and site menus left inside the body
    mainContentBlock.find("div, ul, ol").each((_, el) => {
      const element = page$(el);
      const textLength = element.text().trim().length;
      if (textLength > 50) {
        let linksLength = 0;
        element.find("a").each((_, aEl) => {
          linksLength += page$(aEl).text().trim().length;
        });
        if (linksLength / textLength > 0.6) {
          element.remove();
        }
      }
    });

    const mainContent = mainContentBlock.text().trim();
    const cleanedText = mainContent.replace(/\s+/g, " ");

    const hostname = new URL(url).hostname;

    // Discovered links
    const rawLinks: { title: string; url: string }[] = [];
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      const absoluteUrl = makeAbsolute(href, url);
      // Skip anchors or self-referential links
      if (absoluteUrl.split("#")[0] === url.split("#")[0]) return;

      const text = $(el).text().replace(/\s+/g, " ").trim() || "Без текста";
      rawLinks.push({ title: text, url: absoluteUrl });
    });

    // Dedup links
    const uniqueLinks = rawLinks.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

    console.log(`Discovered ${uniqueLinks.length} unique links. Running HEAD classification...`);

    // Perform checks in parallel with limit to avoid bottleneck
    const checkedLinks = await Promise.all(
      uniqueLinks.map(async (link) => {
        const parsed = new URL(link.url);
        const pathname = parsed.pathname.toLowerCase();
        
        // 1. Direct match extensions
        if ([".pdf", ".docx", ".doc", ".xlsx", ".xls", ".txt"].some(ext => pathname.endsWith(ext))) {
          return { ...link, type: "document", contentType: "extension-matched" };
        }

        const isSuspicious = 
          [ "file", "download", "application", "document" ].some(k => pathname.includes(k)) ||
          !pathname.includes("."); // no extension at all

        if (isSuspicious) {
          const contentType = await getLinkContentType(link.url);
          const cLower = contentType.toLowerCase();
          
          if (cLower.includes("pdf") || cLower.includes("msword") || cLower.includes("officedocument") || cLower.includes("octet-stream")) {
            return { ...link, type: "document", contentType };
          }

          // Fallback if HEAD request timed out/failed but URL clearly points to a file/document path
          if (!contentType && (pathname.includes("/files/") || pathname.includes("/download") || pathname.includes("/application/"))) {
            return { ...link, type: "document", contentType: "fallback-url-matched" };
          }
        }

        // 2. Otherwise treat as potential HTML sub-page if it is on the same domain or related Subdomain
        const isSameDomain = parsed.hostname.endsWith(hostname) || hostname.endsWith(parsed.hostname);
        if (isSameDomain && !pathname.endsWith(".png") && !pathname.endsWith(".jpg") && !pathname.endsWith(".jpeg") && !pathname.endsWith(".gif")) {
          return { ...link, type: "html_page", contentType: "html" };
        }

        return { ...link, type: "other", contentType: "unknown" };
      })
    );

    // Update queue status in crawled-sources.json
    const sourcesPath = path.join(process.cwd(), "knowledge/crawled-sources.json");
    let sources: Record<string, any> = {};
    if (fs.existsSync(sourcesPath)) {
      try {
        sources = JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));
      } catch {}
    }

    // Read manifest
    const manifestPath = path.join(process.cwd(), "knowledge/downloads-manifest.json");
    let manifest: Record<string, any> = {};
    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      } catch {}
    }

    const pageEntries = Object.values(manifest).filter((m: any) => m.parent_page_url === url);
    let derivedStatus = "scanned";
    let hasErrors = false;
    if (pageEntries.length > 0) {
      const allIndexed = pageEntries.every((m: any) => m.status === "indexed");
      derivedStatus = allIndexed ? "indexed" : "downloaded";
      hasErrors = pageEntries.some((m: any) => m.status === "failed");
    }

    sources[url] = {
      title,
      status: derivedStatus,
      parentUrl: sources[url]?.parentUrl || null,
      hasErrors,
    };
    fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));


    // Filter out "other" unless it matched a document
    const filteredLinks = checkedLinks
      .filter(l => l.type === "document" || l.type === "html_page")
      .map(link => {
        const fileMeta = Object.values(manifest).find((m: any) => m.original_url === link.url);
        return {
          ...link,
          status: fileMeta ? fileMeta.status : null,
        };
      });

    const parentEntry = Object.entries(manifest).find(
      ([_, m]: [string, any]) => m.original_url === url && m.parent_page_url === url
    );
    const parentStatus = parentEntry ? (parentEntry[1] as any).status : null;

    return NextResponse.json({
      title,
      extractedText: cleanedText,
      links: filteredLinks,
      status: parentStatus,
    });

  } catch (error: any) {
    console.error("Scan API Error:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера: " + error.message }, { status: 500 });
  }
}
