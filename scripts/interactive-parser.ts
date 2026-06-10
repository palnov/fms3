import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

// Helper to sanitize filename
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]/g, "_")
    .replace(/__+/g, "_")
    .substring(0, 100);
}

// Helper to make absolute URL
function makeAbsolute(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

async function main() {
  const targetUrl = process.argv[2];
  if (!targetUrl) {
    console.error("Usage: npx tsx scripts/interactive-parser.ts <URL>");
    process.exit(1);
  }

  console.log(`Fetching page: ${targetUrl}...`);
  let html = "";
  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    html = await response.text();
  } catch (err: any) {
    console.error(`Error loading page: ${err.message}`);
    process.exit(1);
  }

  const $ = cheerio.load(html);
  
  // Find page title
  const pageTitle = $("title").text().trim() || "Web Page";
  console.log(`Page Title: "${pageTitle}"`);

  // Discovered documents
  const links: { title: string; url: string; ext: string }[] = [];

  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const absoluteUrl = makeAbsolute(href, targetUrl);
    const text = $(el).text().replace(/\s+/g, " ").trim() || "No text";
    
    // Check extension
    const urlPath = new URL(absoluteUrl).pathname;
    const ext = path.extname(urlPath).toLowerCase();

    if ([".pdf", ".docx", ".doc", ".txt"].includes(ext)) {
      links.push({ title: text, url: absoluteUrl, ext });
    } else if (href.includes("/law/") || href.includes("/document/") || absoluteUrl !== targetUrl) {
      // Also look for potential HTML articles (heuristic)
      if (ext === ".html" || ext === ".htm" || ext === "") {
        // Only include if it looks like a specific page, not main domain
        const parsedUrl = new URL(absoluteUrl);
        if (parsedUrl.pathname.length > 2 && parsedUrl.hostname === new URL(targetUrl).hostname) {
          links.push({ title: `HTML: ${text}`, url: absoluteUrl, ext: ".html" });
        }
      }
    }
  });

  // Filter duplicates
  const uniqueLinks = links.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

  if (uniqueLinks.length === 0) {
    console.log("No downloadable files or sub-articles found on this page.");
    process.exit(0);
  }

  console.log(`\nDiscovered ${uniqueLinks.length} items on the page:`);
  uniqueLinks.forEach((link, index) => {
    console.log(`[${index + 1}] ${link.ext.toUpperCase().replace(".", "")}: ${link.title} (${link.url})`);
  });

  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(
    '\nEnter comma-separated numbers to download (e.g. "1,3,5") or "all" to download everything: '
  );
  rl.close();

  let selectedIndices: number[] = [];
  if (answer.trim().toLowerCase() === "all") {
    selectedIndices = uniqueLinks.map((_, i) => i);
  } else {
    selectedIndices = answer
      .split(",")
      .map(num => parseInt(num.trim(), 10) - 1)
      .filter(index => index >= 0 && index < uniqueLinks.length);
  }

  if (selectedIndices.length === 0) {
    console.log("No valid items selected. Exiting.");
    process.exit(0);
  }

  // Ensure download folder exists
  const downloadDir = path.join(process.cwd(), "public/downloads");
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  // Manifest path
  const manifestPath = path.join(process.cwd(), "knowledge/downloads-manifest.json");
  let manifest: Record<string, { original_url: string; parent_page_url: string; download_path: string; title: string }> = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch {
      manifest = {};
    }
  }

  console.log(`\nDownloading ${selectedIndices.length} items...`);

  for (const index of selectedIndices) {
    const item = uniqueLinks[index];
    const parsedUrl = new URL(item.url);
    let filename = path.basename(parsedUrl.pathname);
    
    if (!filename || item.ext === ".html") {
      filename = sanitizeFilename(item.title) + (item.ext || ".txt");
    } else {
      filename = sanitizeFilename(filename);
    }

    const localFilePath = path.join(downloadDir, filename);

    console.log(`Downloading: ${item.title} -> ${filename}...`);

    try {
      const response = await fetch(item.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      if (item.ext === ".html" || item.ext === ".htm") {
        // Clean HTML to pure text
        const pageHtml = await response.text();
        const page$ = cheerio.load(pageHtml);
        
        // Strip boilerplates
        page$("script, style, iframe, noscript, svg, nav, header, footer, .menu, .sidebar, .nav, #header, #footer").remove();
        
        // Try to find main article or default to body
        const mainContent = page$("main, article, .content, #content, .post").first().text().trim() || page$("body").text().trim();
        const cleanedText = mainContent.replace(/\s+/g, " ");

        // Save as a text file
        const txtFilename = filename.replace(/\.html?$/i, ".txt");
        const txtFilePath = path.join(downloadDir, txtFilename);
        
        fs.writeFileSync(txtFilePath, cleanedText);
        
        manifest[txtFilename] = {
          original_url: item.url,
          parent_page_url: targetUrl,
          download_path: `/downloads/${txtFilename}`,
          title: item.title.replace("HTML: ", "").trim(),
        };
        console.log(`Saved as cleaned text: ${txtFilename}`);
      } else {
        // Download binary file
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(localFilePath, Buffer.from(buffer));

        manifest[filename] = {
          original_url: item.url,
          parent_page_url: targetUrl,
          download_path: `/downloads/${filename}`,
          title: item.title,
        };
        console.log(`Saved file: ${filename}`);
      }
    } catch (err: any) {
      console.error(`Failed to download ${item.url}: ${err.message}`);
    }
  }

  // Save manifest
  const manifestDir = path.dirname(manifestPath);
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("\nFinished downloading. Manifest updated.");
}

main().catch(err => {
  console.error("Parser runtime error:", err);
});
