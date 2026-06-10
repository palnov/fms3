import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";


function sanitizeFilename(name: string): string {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  
  const sanitizedBase = base
    .replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]/g, "_")
    .replace(/__+/g, "_")
    .substring(0, 80);
    
  const sanitizedExt = ext.replace(/[^a-zA-Z0-9.]/g, "");
  return sanitizedBase + sanitizedExt;
}


export async function POST(request: Request) {
  try {
    const { parentUrl, parentTitle, parentText, shouldIndexParent, selectedFiles } = await request.json();

    const logs: string[] = [];
    logs.push(`Запуск скачивания файлов для источника: ${parentUrl}`);

    // Ensure downloads folder exists
    const downloadDir = path.join(process.cwd(), "public/downloads");
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // Load downloads manifest
    const manifestPath = path.join(process.cwd(), "knowledge/downloads-manifest.json");
    let manifest: Record<string, { original_url: string; parent_page_url: string; download_path: string; title: string; status: "downloaded" | "indexed" | "failed"; error?: string }> = {};
    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      } catch {
        manifest = {};
      }
    }

    // Save parent page text if requested
    if (shouldIndexParent && parentText && parentText.trim()) {
      logs.push(`Сохранение текста основной статьи: "${parentTitle}"...`);
      const safeParentName = sanitizeFilename(parentTitle) + ".txt";
      const filePath = path.join(downloadDir, safeParentName);
      
      fs.writeFileSync(filePath, parentText);
      manifest[safeParentName] = {
        original_url: parentUrl,
        parent_page_url: parentUrl,
        download_path: `/downloads/${safeParentName}`,
        title: parentTitle,
        status: "downloaded", // Marked as downloaded (needs vectorization)
      };
      logs.push(`Статья "${parentTitle}" сохранена локально как ${safeParentName}.`);
    }

    // Process selected files
    for (const file of selectedFiles) {
      logs.push(`Скачивание: ${file.title}...`);
      
      // Clean up any existing entries for this original url in the manifest to avoid duplicates
      for (const key of Object.keys(manifest)) {
        if (manifest[key].original_url === file.url) {
          const oldPath = manifest[key].download_path;
          if (oldPath) {
            const fullOldPath = path.join(process.cwd(), "public", oldPath);
            if (fs.existsSync(fullOldPath)) {
              try { fs.unlinkSync(fullOldPath); } catch {}
            }
          }
          delete manifest[key];
        }
      }

      const parsedUrl = new URL(file.url);
      
      let ext = path.extname(parsedUrl.pathname).toLowerCase();
      const validExtensions = [".pdf", ".docx", ".doc", ".xlsx", ".xls", ".txt", ".html", ".htm"];
      if (!validExtensions.includes(ext)) {
        ext = file.type === "document" ? ".pdf" : ".txt";
      }

      let filename = path.basename(parsedUrl.pathname);
      if (!filename || filename.length < 3) {
        filename = sanitizeFilename(file.title) + ext;
      } else {
        filename = sanitizeFilename(filename);
        if (!filename.endsWith(ext)) {
          filename += ext;
        }
      }

      const localFilePath = path.join(downloadDir, filename);

      try {
        const response = await fetch(file.url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP статус ${response.status}`);
        }

        if (file.type === "html_page") {
          // Clean HTML page and save as txt
          const buffer = await response.arrayBuffer();
          
          const contentType = response.headers.get("content-type") || "";
          let charset = "utf-8";
          const charsetMatch = contentType.match(/charset=([\w-]+)/i);
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
          
          let pageHtml = "";
          try {
            pageHtml = new TextDecoder(charset).decode(buffer);
          } catch {
            pageHtml = new TextDecoder("utf-8").decode(buffer);
          }

          const page$ = cheerio.load(pageHtml);
          page$("script, style, iframe, noscript, svg, nav, header, footer, .menu, .sidebar, .nav").remove();
          
          const mainContent = page$("main, article, .content, #content, .post").first().text().trim() || page$("body").text().trim();
          const fullText = mainContent.replace(/\s+/g, " ");

          const txtFilename = filename.replace(/\.html?$/i, ".txt");
          const txtFilePath = path.join(downloadDir, txtFilename);
          fs.writeFileSync(txtFilePath, fullText);

          manifest[txtFilename] = {
            original_url: file.url,
            parent_page_url: parentUrl,
            download_path: `/downloads/${txtFilename}`,
            title: file.title.replace("HTML: ", "").trim(),
            status: "downloaded",
          };
          logs.push(`Страница "${file.title}" сохранена локально.`);

        } else {
          // Document binary download
          const contentType = response.headers.get("content-type") || "";
          const contentDisposition = response.headers.get("content-disposition") || "";
          
          let finalFilename = filename;
          
          // Match standard filename="..." or filename*=UTF-8''...
          const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\r\n]+)["']?/i);
          if (filenameMatch && filenameMatch[1]) {
            try {
              const decoded = decodeURIComponent(filenameMatch[1]);
              if (decoded) {
                finalFilename = sanitizeFilename(decoded);
              }
            } catch {
              finalFilename = sanitizeFilename(filenameMatch[1]);
            }
          }

          // Fallback if no filename in content-disposition
          if (finalFilename === filename) {
            if (contentType.includes("pdf") && !filename.endsWith(".pdf")) {
              finalFilename = filename.replace(/\.[^/.]+$/, "") + ".pdf";
            } else if ((contentType.includes("word") || contentType.includes("officedocument.word")) && !filename.endsWith(".docx") && !filename.endsWith(".doc")) {
              finalFilename = filename.replace(/\.[^/.]+$/, "") + ".docx";
            }
          }

          const finalFilePath = path.join(downloadDir, finalFilename);
          const buffer = await response.arrayBuffer();
          fs.writeFileSync(finalFilePath, Buffer.from(buffer));

          manifest[finalFilename] = {
            original_url: file.url,
            parent_page_url: parentUrl,
            download_path: `/downloads/${finalFilename}`,
            title: file.title,
            status: "downloaded",
          };
          logs.push(`Файл ${finalFilename} сохранен локально.`);
        }

      } catch (err: any) {
        logs.push(`Ошибка скачивания ссылки ${file.url}: ${err.message}`);
        
        let filename = path.basename(parsedUrl.pathname);
        if (!filename || filename.length < 3) {
          filename = sanitizeFilename(file.title);
        } else {
          filename = sanitizeFilename(filename);
        }
        let ext = file.type === "document" ? ".pdf" : ".txt";
        if (!filename.endsWith(ext)) {
          filename += ext;
        }

        manifest[filename] = {
          original_url: file.url,
          parent_page_url: parentUrl,
          download_path: "",
          title: file.title,
          status: "failed",
        };
      }
    }

    // Save manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    // Update queue status in crawled-sources.json with dynamic status & errors
    const sourcesPath = path.join(process.cwd(), "knowledge/crawled-sources.json");
    if (fs.existsSync(sourcesPath)) {
      try {
        const sources = JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));
        if (sources[parentUrl]) {
          const pageEntries = Object.values(manifest).filter((m: any) => m.parent_page_url === parentUrl);
          const allIndexed = pageEntries.length > 0 && pageEntries.every((m: any) => m.status === "indexed");
          
          sources[parentUrl].status = allIndexed ? "indexed" : "downloaded";
          sources[parentUrl].hasErrors = pageEntries.some((m: any) => m.status === "failed");
          
          fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));
        }
      } catch (e: any) {
        logs.push(`Не удалось обновить статус очереди: ${e.message}`);
      }
    }

    logs.push("Скачивание полностью завершено! Данные готовы к векторизации.");
    return NextResponse.json({ success: true, logs });

  } catch (error: any) {
    console.error("Download API Error:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера: " + error.message }, { status: 500 });
  }
}
