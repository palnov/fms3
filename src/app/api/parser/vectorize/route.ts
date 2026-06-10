import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { indexFileContent, extractText } from "@/lib/knowledge-indexer";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
  if (!OPENROUTER_API_KEY) {
    return new Response(
      "Ошибка: Ключ OPENROUTER_API_KEY не задан в переменных окружения. Векторизация невозможна.",
      { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendLog = (msg: string) => {
        controller.enqueue(encoder.encode(msg + "\n"));
      };

      try {
        sendLog("Запуск векторизации локально сохраненных файлов...");

        const manifestPath = path.join(process.cwd(), "knowledge/downloads-manifest.json");
        if (!fs.existsSync(manifestPath)) {
          sendLog("Файл манифеста не найден. Нет файлов для векторизации.");
          controller.close();
          return;
        }

        let manifest: Record<string, { original_url: string; parent_page_url: string; download_path: string; title: string; status: "downloaded" | "indexed" | "failed" }> = {};
        try {
          manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        } catch (err: any) {
          sendLog("Ошибка чтения манифеста: " + err.message);
          controller.close();
          return;
        }

        // Find all files with "downloaded" or "failed" status
        const pendingFiles = Object.entries(manifest).filter(([_, meta]) => meta.status === "downloaded" || meta.status === "failed");

        if (pendingFiles.length === 0) {
          sendLog("Все файлы уже векторизованы. Нет новых данных.");
          controller.close();
          return;
        }

        sendLog(`Найдено файлов для векторизации: ${pendingFiles.length}`);

        const dbPath = path.join(process.cwd(), "knowledge.db");
        const db = new Database(dbPath);
        db.pragma("journal_mode = WAL");

        // Process each file
        const downloadDir = path.join(process.cwd(), "public/downloads");
        
        for (const [filename, meta] of pendingFiles) {
          if (req.signal?.aborted) {
            sendLog("🛑 Процесс отменен пользователем. Остановка бэкенда.");
            break;
          }
          sendLog(`Векторизация: "${meta.title}" (${filename})...`);
          const filePath = path.join(downloadDir, filename);

          if (!fs.existsSync(filePath)) {
            sendLog(`⚠️ Ошибка: файл не найден локально: ${filename}. Пропуск.`);
            continue;
          }

          try {
            // 1. Extract text from cached file
            const text = await extractText(filePath, GEMINI_API_KEY, OPENROUTER_API_KEY);
            
            // 2. Clear old chunks from DB to prevent duplication
            db.prepare("DELETE FROM chunks WHERE source_file = ?").run(filename);

            // 3. Chunk, embed, and write to DB
            const chunkCount = await indexFileContent(
              filename,
              text,
              db,
              OPENROUTER_API_KEY,
              meta.parent_page_url,
              meta.download_path,
              (msg) => sendLog(`  -> ${msg}`)
            );

            // 4. Update manifest status
            manifest[filename].status = "indexed";
            // Save updated manifest immediately so we don't lose progress if subsequent files fail
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
            sendLog(`Файл "${meta.title}" успешно проиндексирован (${chunkCount} чанков).`);
          } catch (err: any) {
            sendLog(`❌ Ошибка векторизации ${filename}: ${err.message}`);
            manifest[filename].status = "failed";
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
            
            if (
              err.message.includes("429") || 
              err.message.toLowerCase().includes("limit") || 
              err.message.toLowerCase().includes("quota") ||
              err.message.toLowerCase().includes("fetch failed") ||
              err.message.toLowerCase().includes("enotfound") ||
              err.message.toLowerCase().includes("econnrefused") ||
              err.message.toLowerCase().includes("econnreset") ||
              err.message.toLowerCase().includes("etimeout") ||
              err.message.toLowerCase().includes("connection reset")
            ) {
              sendLog("🛑 Прерывание глобального процесса векторизации из-за сетевой ошибки или лимитов API.");
              break;
            }
          }
        }

        // Save updated manifest at the end too
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

        // Update parent page statuses in crawled-sources.json
        const sourcesPath = path.join(process.cwd(), "knowledge/crawled-sources.json");
        if (fs.existsSync(sourcesPath)) {
          try {
            const sources = JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));
            
            for (const [parentUrl, src] of Object.entries(sources) as [string, any][]) {
              // If the page is marked as downloaded, check if ALL files belonging to this page are now indexed
              if (src.status === "downloaded") {
                const pageFiles = Object.values(manifest).filter(m => m.parent_page_url === parentUrl);
                const hasPendingFiles = pageFiles.some(m => m.status === "downloaded");

                if (!hasPendingFiles && pageFiles.length > 0) {
                  sources[parentUrl].status = "indexed";
                  sendLog(`Связанный источник "${src.title}" теперь полностью проиндексирован (В RAG).`);
                }
              }
            }

            fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));
          } catch (e: any) {
            sendLog(`Не удалось обновить статусы источников: ${e.message}`);
          }
        }

        db.close();
        sendLog("Векторизация успешно завершена!");

      } catch (error: any) {
        sendLog(`Внутренняя ошибка сервера: ${error.message}`);
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
