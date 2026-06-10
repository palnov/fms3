import { getEmbedding } from "../src/lib/knowledge-indexer";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import crypto from "crypto";

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
  source_url?: string | null;
  local_download_url?: string | null;
}

interface TemplateRow {
  id: string;
  title: string;
  file_path: string;
  sample_path: string;
  keywords: string;
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

async function generateAnswer(prompt: string, apiKey: string): Promise<string> {
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
  console.log(`Calling OpenRouter model: ${model}...`);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://fms3.ru",
      "X-Title": "FMS3 Migration Assistant"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } else {
    throw new Error(`OpenRouter status: ${response.status} - ${await response.text()}`);
  }
}

async function run() {
  const openRouterKey = process.env.OPENROUTER_API_KEY || "";
  const question = "как получить внж";
  const dbPath = path.join(process.cwd(), "knowledge.db");
  const db = new Database(dbPath, { readonly: true });

  const queryVector = await getEmbedding(question, openRouterKey);
  console.log("Vector generated.");

  const allChunks = db.prepare("SELECT id, content, source_file, embedding, source_url, local_download_url FROM chunks").all() as ChunkRow[];
  const scoredChunks = allChunks.map((chunk) => {
    const embedding = JSON.parse(chunk.embedding) as number[];
    const similarity = cosineSimilarity(queryVector, embedding);
    return { ...chunk, similarity };
  });

  scoredChunks.sort((a, b) => b.similarity - a.similarity);
  const topChunks = scoredChunks.slice(0, 4).filter(c => c.similarity > 0.65);

  const allTemplates = db.prepare("SELECT id, title, file_path, sample_path, keywords FROM templates").all() as TemplateRow[];
  const matchedTemplates: TemplateRow[] = [];

  const questionWords = question.toLowerCase().split(/\s+/);
  for (const temp of allTemplates) {
    const keywordsList = temp.keywords.toLowerCase().split(/,\s*/);
    const hasMatch = keywordsList.some((kw: string) => questionWords.some((qw: string) => qw.includes(kw) || kw.includes(qw)));
    if (hasMatch) {
      matchedTemplates.push(temp);
    }
  }

  db.close();

  console.log(`Matched ${topChunks.length} chunks and ${matchedTemplates.length} templates.`);

  const contextText = topChunks.map(c => `[Файл: ${c.source_file}]\n${c.content}`).join("\n\n");
  const templatesText = matchedTemplates.map(t => `- **${t.title}**: Бланк: [Скачать](${t.file_path}), Образец заполнения: [Скачать](${t.sample_path})`).join("\n");

  const systemPrompt = `Ты — профессиональный ИИ-консультант по миграционным вопросам в РФ на сайте "Миграция в Россию".
Твоя задача — давать четкие, структурированные и юридически точные ответы на основе предоставленного контекста.

ПРАВИЛА ОТВЕТА:
1. Используй ТОЛЬКО информацию из "БАЗЫ ЗНАНИЙ" ниже. Не выдумывай факты. Если информации нет в контексте, вежливо скажи, что не обладаешь точными данными и порекомендуй проконсультироваться у юриста.
2. Отвечай на русском языке. Будь вежлив, используй форматирование markdown (списки, жирный шрифт) для улучшения читаемости.
3. Если пользователю нужен бланк, шаблон или образец документа, и он есть в разделе "ДОСТУПНЫЕ ШАБЛОНЫ", обязательно выведи ссылки на него в таком формате:
   "Вы можете скачать нужные бланки:
   - [Скачать бланк заявления на РВП по браку](/templates/rvp-brak-blank.docx)
   - [Скачать образец заполнения](/templates/rvp-brak-sample.pdf)"
4. В самом конце ответа ОБЯЗАТЕЛЬНО ненавязчиво предложи бесплатную помощь юриста, так как законы сложны, а инспекторы часто придираются к деталям.
5. Закончи свой ответ строго специальным служебным тегом: [CTA_LAWYER_FORM] на новой строке. Этот тег укажет интерфейсу отрендерить форму обратной связи.

БАЗА ЗНАНИЙ:
${contextText || "Нет доступных выдержек из законов под этот запрос."}

${matchedTemplates.length > 0 ? `ДОСТУПНЫЕ ШАБЛОНЫ:\n${templatesText}` : ""}

ВОПРОС ПОЛЬЗОВАТЕЛЯ:
"${question}"

Ответ:`;

  const answer = await generateAnswer(systemPrompt, openRouterKey);
  console.log("\n=== Generated Answer ===\n");
  console.log(answer);
  console.log("\n=== Sources ===\n");
  console.log(topChunks.map(c => c.source_file));
}

run().catch(console.error);
