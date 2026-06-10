import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { indexFileContent, extractText } from "../src/lib/knowledge-indexer";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error("Warning: OPENROUTER_API_KEY env variable is not set. Embedding calls will fail unless provided.");
}

const DB_PATH = path.join(process.cwd(), "knowledge.db");
const ARTICLES_DIR = path.join(process.cwd(), "knowledge/articles");
const TEMPLATES_MAP_PATH = path.join(process.cwd(), "knowledge/templates-map.json");

async function main() {
  const apiKey = OPENROUTER_API_KEY || "";
  if (!apiKey) {
    console.error("Error: OPENROUTER_API_KEY is required to run the indexer.");
    process.exit(1);
  }

  console.log("Initializing database connection...");
  const db = new Database(DB_PATH);

  // Enable WAL mode for performance
  db.pragma("journal_mode = WAL");

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      source_file TEXT NOT NULL,
      embedding TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      file_path TEXT NOT NULL,
      sample_path TEXT NOT NULL,
      keywords TEXT NOT NULL
    );
  `);

  // Dynamically add columns if they don't exist
  try {
    db.exec("ALTER TABLE chunks ADD COLUMN source_url TEXT");
  } catch {
    // Ignore error if column already exists
  }
  try {
    db.exec("ALTER TABLE chunks ADD COLUMN local_download_url TEXT");
  } catch {
    // Ignore error if column already exists
  }

  console.log("Database initialized.");

  // Clear existing entries
  db.prepare("DELETE FROM chunks").run();
  db.prepare("DELETE FROM templates").run();

  // 1. Process templates map
  if (fs.existsSync(TEMPLATES_MAP_PATH)) {
    console.log("Loading templates map...");
    const templatesList = JSON.parse(fs.readFileSync(TEMPLATES_MAP_PATH, "utf-8"));
    const insertTemplate = db.prepare(`
      INSERT INTO templates (id, title, file_path, sample_path, keywords)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const t of templatesList) {
      insertTemplate.run(t.id, t.title, t.file_path, t.sample_path, t.keywords);
    }
    console.log(`Inserted ${templatesList.length} templates.`);
  }

  // 2. Process articles and downloads
  const DOWNLOADS_DIR = path.join(process.cwd(), "public/downloads");
  const MANIFEST_PATH = path.join(process.cwd(), "knowledge/downloads-manifest.json");

  let manifest: Record<string, { original_url: string; parent_page_url: string; download_path: string; title: string; status?: "downloaded" | "indexed" }> = {};
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    } catch {
      manifest = {};
    }
  }

  const articleFiles = fs.existsSync(ARTICLES_DIR) 
    ? fs.readdirSync(ARTICLES_DIR).map(f => ({ name: f, dir: ARTICLES_DIR })) 
    : [];
  const downloadFiles = fs.existsSync(DOWNLOADS_DIR) 
    ? fs.readdirSync(DOWNLOADS_DIR).map(f => ({ name: f, dir: DOWNLOADS_DIR })) 
    : [];

  const files = [...articleFiles, ...downloadFiles].filter(file => {
    const ext = path.extname(file.name).toLowerCase();
    return [".txt", ".pdf", ".docx", ".html"].includes(ext);
  });

  if (files.length === 0) {
    console.log("No articles or downloaded files found to index.");
    return;
  }

  console.log(`Found ${files.length} files to index. Processing...`);

  let totalChunks = 0;

  for (const file of files) {
    const filePath = path.join(file.dir, file.name);
    console.log(`Parsing ${file.name} from ${path.basename(file.dir)}...`);
    try {
      const fullText = await extractText(filePath);
      
      const fileMeta = manifest[file.name];
      const sourceUrl = fileMeta ? fileMeta.parent_page_url : null;
      const localDownloadUrl = fileMeta ? fileMeta.download_path : null;

      const chunksIndexed = await indexFileContent(
        file.name,
        fullText,
        db,
        apiKey,
        sourceUrl,
        localDownloadUrl,
        (msg) => console.log(msg)
      );

      if (fileMeta) {
        manifest[file.name].status = "indexed";
      }

      totalChunks += chunksIndexed;
      console.log(`Finished ${file.name}.`);
    } catch (err) {
      console.error(`Error processing file ${file.name}:`, err);
    }
  }

  // Save manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  // Update parent page statuses in crawled-sources.json
  const sourcesPath = path.join(process.cwd(), "knowledge/crawled-sources.json");
  if (fs.existsSync(sourcesPath)) {
    try {
      const sources = JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));
      for (const parentUrl of Object.keys(sources)) {
        const pageFiles = Object.values(manifest).filter(m => m.parent_page_url === parentUrl);
        const hasPendingFiles = pageFiles.some(m => m.status === "downloaded");
        if (!hasPendingFiles && pageFiles.length > 0) {
          sources[parentUrl].status = "indexed";
        }
      }
      fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));
    } catch (e: any) {
      console.error("Failed to update crawled sources status:", e.message);
    }
  }

  console.log(`\nIndexing completed successfully! Total chunks in database: ${totalChunks}`);
  db.close();
}

main().catch(err => {
  console.error("Indexing failed:", err);
  process.exit(1);
});
