import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
// @ts-ignore
import pdf from "pdf-parse";
import mammoth from "mammoth";

// We support custom env variable or local env loading
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Warning: GEMINI_API_KEY env variable is not set. Embedding calls will fail unless provided.");
}

const DB_PATH = path.join(process.cwd(), "knowledge.db");
const ARTICLES_DIR = path.join(process.cwd(), "knowledge/articles");
const TEMPLATES_MAP_PATH = path.join(process.cwd(), "knowledge/templates-map.json");

// Helper to chunk text
function chunkText(text: string, chunkSize = 1200, overlap = 200): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentChunkWords: string[] = [];
  let currentLength = 0;

  for (const word of words) {
    currentChunkWords.push(word);
    currentLength += word.length + 1; // plus space

    if (currentLength >= chunkSize) {
      chunks.push(currentChunkWords.join(" "));
      // overlap: keep last N words
      const overlapWordsCount = Math.floor(words.length * (overlap / chunkSize)) || 5;
      currentChunkWords = currentChunkWords.slice(-Math.min(currentChunkWords.length, overlapWordsCount));
      currentLength = currentChunkWords.join(" ").length;
    }
  }

  if (currentChunkWords.length > 0) {
    chunks.push(currentChunkWords.join(" "));
  }

  return chunks.filter(c => c.trim().length > 20); // ignore tiny chunks
}

// Fetch embeddings from Gemini API
async function getEmbedding(text: string, apiKey: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-multilingual-embedding-002:embedContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: {
        parts: [{ text }],
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini Embedding API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  if (!data.embedding?.values) {
    throw new Error(`Invalid response structure from Gemini API: ${JSON.stringify(data)}`);
  }

  return data.embedding.values;
}

// Main parser
async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const fileBuffer = fs.readFileSync(filePath);

  if (ext === ".txt") {
    return fileBuffer.toString("utf-8");
  } else if (ext === ".pdf") {
    const data = await pdf(fileBuffer);
    return data.text;
  } else if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } else if (ext === ".html" || ext === ".htm") {
    // Basic HTML tag stripping
    const html = fileBuffer.toString("utf-8");
    return html.replace(/<[^>]*>/g, " ");
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

async function main() {
  const apiKey = GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is required to run the indexer.");
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

  // 2. Process articles
  if (!fs.existsSync(ARTICLES_DIR)) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return [".txt", ".pdf", ".docx", ".html"].includes(ext);
  });

  if (files.length === 0) {
    console.log("No articles found in knowledge/articles. Put files there first.");
    return;
  }

  console.log(`Found ${files.length} files to index. Processing...`);

  const insertChunk = db.prepare(`
    INSERT INTO chunks (content, source_file, embedding)
    VALUES (?, ?, ?)
  `);

  let totalChunks = 0;

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    console.log(`Parsing ${file}...`);
    try {
      const fullText = await extractText(filePath);
      const chunks = chunkText(fullText);
      console.log(`Splitted into ${chunks.length} chunks. Indexing...`);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        process.stdout.write(`  Processing chunk ${i+1}/${chunks.length}...\r`);
        try {
          const embedding = await getEmbedding(chunk, apiKey);
          insertChunk.run(chunk, file, JSON.stringify(embedding));
          totalChunks++;
        } catch (err) {
          console.error(`\nFailed to generate embedding for chunk ${i+1} of file ${file}:`, err);
        }
      }
      console.log(`\nFinished ${file}.`);
    } catch (err) {
      console.error(`Error processing file ${file}:`, err);
    }
  }

  console.log(`\nIndexing completed successfully! Total chunks in database: ${totalChunks}`);
  db.close();
}

main().catch(err => {
  console.error("Indexing failed:", err);
  process.exit(1);
});
