import Database from "better-sqlite3";
import path from "path";

async function run() {
  const dbPath = path.join(process.cwd(), "knowledge.db");
  const db = new Database(dbPath, { readonly: true });

  console.log("=== Searching database for ВНЖ files and chunks ===");

  // Find files in chunks
  const files = db.prepare("SELECT DISTINCT source_file FROM chunks").all() as { source_file: string }[];
  console.log(`Total files indexed: ${files.length}`);
  console.log("First 20 files:");
  console.log(files.slice(0, 20).map(f => f.source_file));

  // Search by filename
  const vnjFiles = files.filter(f => f.source_file.toLowerCase().includes("вид") || f.source_file.toLowerCase().includes("vnzh"));
  console.log("\nMatching files:", vnjFiles);

  // Search chunk content for keyword
  const chunks = db.prepare("SELECT content, source_file FROM chunks WHERE content LIKE '%вид на жительство%' LIMIT 5").all() as { content: string, source_file: string }[];
  console.log(`\nFound ${chunks.length} chunks containing 'вид на жительство':`);
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Chunk ${i+1} [${chunks[i].source_file}]: ${chunks[i].content.slice(0, 200)}...\n`);
  }

  // Get templates
  const templates = db.prepare("SELECT * FROM templates").all();
  console.log(`\nTotal templates: ${templates.length}`);
  console.log(templates.slice(0, 10));

  db.close();
}

run().catch(console.error);
