import { getEmbedding } from "../src/lib/knowledge-indexer";
import fs from "fs";
import path from "path";

// Simple custom .env parser
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

async function runTest() {
  const openRouterKey = process.env.OPENROUTER_API_KEY || "";

  console.log("=== Testing embedding via OpenRouter (openai/text-embedding-3-large, 3072 dims) ===");
  try {
    const start = Date.now();
    const embedding = await getEmbedding("Привет, это тестовый запрос для проверки векторизации напрямую через OpenRouter (text-embedding-3-large).", openRouterKey);
    console.log(`✅ Success! Embedding length: ${embedding.length}, Time taken: ${Date.now() - start}ms`);
    console.log(`First 5 values:`, embedding.slice(0, 5));
    
    if (embedding.length !== 3072) {
      console.error(`❌ Error: Expected embedding size 3072, but got ${embedding.length}`);
    }
  } catch (err: any) {
    console.error(`❌ Failed: ${err.message}`);
  }
}

runTest();
