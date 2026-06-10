import fs from "fs";
import path from "path";

function runFix() {
  const manifestPath = path.join(process.cwd(), "knowledge/downloads-manifest.json");
  const downloadsDir = path.join(process.cwd(), "public/downloads");

  if (!fs.existsSync(manifestPath)) {
    console.error("Манифест не найден.");
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  let updated = false;

  console.log("=== ЗАПУСК СКРИПТА ИСПРАВЛЕНИЯ ОШИБОК ===");

  // 1. Fix the specific ._seva file issue if it exists
  const oldKey = "UFMS_Rossii_po_Respublike_Krim_i_g._Seva._seva";
  const newKey = "UFMS_Rossii_po_Respublike_Krim_i_g._Seva.txt";
  const oldPath = path.join(downloadsDir, oldKey);
  const newPath = path.join(downloadsDir, newKey);

  if (manifest[oldKey]) {
    console.log(`🔧 Найдена запись с неверным расширением: ${oldKey}`);
    if (fs.existsSync(oldPath)) {
      try {
        fs.renameSync(oldPath, newPath);
        console.log(`  -> Файл переименован на диске в ${newKey}`);
      } catch (err: any) {
        console.error(`  -> Ошибка переименования: ${err.message}`);
      }
    }
    
    // Copy to new key and delete old key
    manifest[newKey] = {
      ...manifest[oldKey],
      download_path: `/downloads/${newKey}`,
      status: "downloaded"
    };
    delete manifest[oldKey];
    updated = true;
    console.log("  -> Запись в манифесте обновлена и статус сброшен на 'downloaded'");
  }

  // 2. Scan other 'failed' files and reset to 'downloaded' if they exist on disk
  const entries = Object.entries(manifest) as [string, any][];
  let resetCount = 0;

  for (const [filename, meta] of entries) {
    if (meta.status === "failed") {
      const filePath = path.join(downloadsDir, filename);
      if (fs.existsSync(filePath)) {
        meta.status = "downloaded";
        delete meta.error; // clear error message if any
        resetCount++;
        updated = true;
      }
    }
  }

  console.log(`🔧 Сброшен статус с 'failed' на 'downloaded' для ${resetCount} файлов, существующих на диске.`);

  if (updated) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log("✅ Манифест успешно сохранен.");

    // 3. Update crawled-sources.json status & hasErrors flags
    const sourcesPath = path.join(process.cwd(), "knowledge/crawled-sources.json");
    if (fs.existsSync(sourcesPath)) {
      try {
        const sources = JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));
        let sourcesUpdated = false;

        for (const [parentUrl, src] of Object.entries(sources) as [string, any][]) {
          const pageEntries = Object.values(manifest).filter((m: any) => m.parent_page_url === parentUrl);
          if (pageEntries.length > 0) {
            const allIndexed = pageEntries.every((m: any) => m.status === "indexed");
            const hasErrors = pageEntries.some((m: any) => m.status === "failed");
            const newStatus = allIndexed ? "indexed" : "downloaded";

            if (src.status !== newStatus || src.hasErrors !== hasErrors) {
              src.status = newStatus;
              src.hasErrors = hasErrors;
              sourcesUpdated = true;
            }
          }
        }

        if (sourcesUpdated) {
          fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));
          console.log("✅ Статусы в crawled-sources.json синхронизированы.");
        }
      } catch (e: any) {
        console.error("Ошибка обновления crawled-sources.json:", e.message);
      }
    }
  } else {
    console.log("Изменений не требуется.");
  }
}

runFix();
