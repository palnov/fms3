import { getEmbedding } from "../src/lib/knowledge-indexer";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  }
}
loadEnv();

interface ChunkRow {
  id: number;
  content: string;
  source_file: string;
  embedding: string;
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  if (vecA.length !== vecB.length) return 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function run() {
  const openRouterKey = process.env.OPENROUTER_API_KEY || "";
  const question = "как приехать гражданину узбекистана в рф чтобы работать";
  const dbPath = path.join(process.cwd(), "knowledge.db");
  const db = new Database(dbPath, { readonly: true });

  console.log(`Query: "${question}"`);
  const queryVector = await getEmbedding(question, openRouterKey);

  const allChunks = db.prepare("SELECT id, content, source_file, embedding FROM chunks").all() as ChunkRow[];
  const scoredChunks = allChunks.map((chunk) => {
    const embedding = JSON.parse(chunk.embedding) as number[];
    const similarity = cosineSimilarity(queryVector, embedding);
    return { ...chunk, similarity };
  });

  scoredChunks.sort((a, b) => b.similarity - a.similarity);

  console.log("\nTop 5 matched chunks:");
  for (let i = 0; i < 5; i++) {
    const c = scoredChunks[i];
    console.log(`\nRank ${i+1}: file=${c.source_file}, score=${c.similarity.toFixed(4)}`);
    console.log(`Content: ${c.content.slice(0, 300)}...`);
  }

  db.close();
}

run().catch(console.error);
