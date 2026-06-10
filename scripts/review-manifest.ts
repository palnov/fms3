import fs from "fs";
import path from "path";

function runReview() {
  const manifestPath = path.join(process.cwd(), "knowledge/downloads-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("Манифест загрузок не найден.");
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const entries = Object.entries(manifest) as [string, any][];

  console.log(`=== ОБЗОР ФАЙЛОВ В МАНИФЕСТЕ ===`);
  console.log(`Всего записей в манифесте: ${entries.length}\n`);

  const stats = {
    indexed: 0,
    downloaded: 0,
    failed: 0,
    unknown: 0
  };

  const failedFiles: string[] = [];
  const downloadedFiles: string[] = [];

  for (const [filename, meta] of entries) {
    const status = meta.status;
    if (status === "indexed") {
      stats.indexed++;
    } else if (status === "downloaded") {
      stats.downloaded++;
      downloadedFiles.push(`${meta.title} (${filename})`);
    } else if (status === "failed") {
      stats.failed++;
      failedFiles.push(`${meta.title} (${filename}) -> URL: ${meta.original_url}`);
    } else {
      stats.unknown++;
    }
  }

  console.log(`📊 Статистика статусов:`);
  console.log(`  - Успешно векторизовано (indexed): ${stats.indexed}`);
  console.log(`  - Скачано, ожидает векторизации (downloaded): ${stats.downloaded}`);
  console.log(`  - Ошибка (failed): ${stats.failed}`);
  if (stats.unknown > 0) {
    console.log(`  - Без статуса: ${stats.unknown}`);
  }

  if (downloadedFiles.length > 0) {
    console.log(`\n⏳ Файлы, готовые к векторизации (downloaded):`);
    downloadedFiles.slice(0, 10).forEach(f => console.log(`  * ${f}`));
    if (downloadedFiles.length > 10) {
      console.log(`  ... и еще ${downloadedFiles.length - 10} файлов.`);
    }
  }

  if (failedFiles.length > 0) {
    console.log(`\n❌ Файлы со статусом ошибки (failed):`);
    failedFiles.slice(0, 10).forEach(f => console.log(`  * ${f}`));
    if (failedFiles.length > 10) {
      console.log(`  ... и еще ${failedFiles.length - 10} файлов.`);
    }
  }

  const sourcesPath = path.join(process.cwd(), "knowledge/crawled-sources.json");
  if (fs.existsSync(sourcesPath)) {
    const sources = JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));
    const srcEntries = Object.entries(sources) as [string, any][];
    const srcStats = {
      indexed: 0,
      downloaded: 0,
      scanned: 0,
      queued: 0
    };
    for (const [, src] of srcEntries) {
      if (src.status === "indexed") srcStats.indexed++;
      else if (src.status === "downloaded") srcStats.downloaded++;
      else if (src.status === "scanned") srcStats.scanned++;
      else srcStats.queued++;
    }
    console.log(`\n📊 Статусы источников в crawled-sources.json:`);
    console.log(`  - Полностью в RAG: ${srcStats.indexed}`);
    console.log(`  - Скачано (есть готовые файлы): ${srcStats.downloaded}`);
    console.log(`  - Просканировано: ${srcStats.scanned}`);
    console.log(`  - В очереди: ${srcStats.queued}`);
  }
}

runReview();
