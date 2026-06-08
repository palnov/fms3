import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import crypto from "crypto";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SECRET_KEY = process.env.JWT_SECRET || "fms3-secret-key-129837192837"; // fallback for signing cookies

interface ChunkRow {
  id: number;
  content: string;
  source_file: string;
  embedding: string; // JSON string of number[]
}

interface TemplateRow {
  id: string;
  title: string;
  file_path: string;
  sample_path: string;
  keywords: string;
}

// Cosine similarity between two vectors
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

// Get embeddings from Gemini API
async function getQueryEmbedding(text: string, apiKey: string): Promise<number[]> {
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
    throw new Error("Invalid embedding response");
  }
  return data.embedding.values;
}

// Generate text with OpenRouter API
async function generateAnswer(prompt: string, apiKey: string): Promise<string> {
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://fms3.ru", // Optional, for OpenRouter rankings
      "X-Title": "FMS3 Migration Assistant" // Optional
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

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter Generation API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Invalid OpenRouter generation response");
  }
  return text;
}

// Simple prompt injection detection
function isUnsafeQuery(query: string): boolean {
  const unsafePatterns = [
    /ignore/i,
    /system prompt/i,
    /instruction/i,
    /write code/i,
    /пиши код/i,
    /разработчик/i,
    /sql injection/i,
  ];

  return unsafePatterns.some((pattern) => pattern.test(query));
}

// Basic topic validation
function isMigrationRelated(query: string): boolean {
  const keywords = [
    "рвп", "внж", "гражданств", "патент", "миграци", "закон", "виз", "паспорт",
    "квот", "супруг", "брак", "переезд", "рф", "росси", "документ", "бланк",
    "заявлен", "образец", "экзамен", "пошлин", "пребыван", "мвд", "гувм"
  ];
  const queryLower = query.toLowerCase();
  return keywords.some((kw) => queryLower.includes(kw));
}

// Cookie limits helpers
function signToken(count: number, resetTime: number): string {
  const data = `${count}:${resetTime}`;
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(data).digest("hex");
  return `${data}.${signature}`;
}

function verifyToken(token: string): { count: number; resetTime: number } | null {
  try {
    const [data, signature] = token.split(".");
    const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(data).digest("hex");
    if (signature !== expectedSignature) return null;

    const [countStr, resetTimeStr] = data.split(":");
    return {
      count: parseInt(countStr, 10),
      resetTime: parseInt(resetTimeStr, 10),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || !question.trim()) {
      return NextResponse.json({ error: "Вопрос не может быть пустым." }, { status: 400 });
    }

    if (question.length > 500) {
      return NextResponse.json({ error: "Вопрос слишком длинный. Максимум 500 символов." }, { status: 400 });
    }

    // 1. Rate Limiting check
    const cookiesHeader = request.headers.get("cookie") || "";
    const limitCookieName = "ai_limit_token";
    const match = cookiesHeader.match(new RegExp(`(^|;)\\s*${limitCookieName}\\s*=\\s*([^;]+)`));
    const token = match ? decodeURIComponent(match[2]) : null;

    const now = Date.now();
    let limitData = token ? verifyToken(token) : null;

    if (!limitData || now > limitData.resetTime) {
      // First request or timer expired (reset daily)
      limitData = {
        count: 0,
        resetTime: now + 24 * 60 * 60 * 1000,
      };
    }

    if (limitData.count >= 20) {
      return NextResponse.json(
        {
          error: "Вы превысили лимит бесплатных вопросов на сегодня (максимум 20).",
          isLimitReached: true,
          text: "К сожалению, вы исчерпали дневной лимит в 20 бесплатных вопросов. Для детального решения вашего вопроса мы рекомендуем связаться с нашим дежурным юристом.",
          showLeadForm: true
        },
        { status: 429 }
      );
    }

    // Increment count
    limitData.count += 1;
    const nextLimitToken = signToken(limitData.count, limitData.resetTime);

    // 2. Security Checks
    if (isUnsafeQuery(question)) {
      const response = NextResponse.json(
        {
          text: "Извините, я могу отвечать только на корректные вопросы по миграционному законодательству РФ. Моя система зафиксировала потенциально небезопасный запрос.",
          sources: []
        }
      );
      response.headers.set("Set-Cookie", `${limitCookieName}=${encodeURIComponent(nextLimitToken)}; Path=/; HttpOnly; Max-Age=${24 * 60 * 60}; SameSite=Lax`);
      return response;
    }

    if (!isMigrationRelated(question)) {
      const response = NextResponse.json(
        {
          text: "Я — специализированный ИИ-консультант по вопросам миграции в РФ. К сожалению, я не могу помочь с темами, не связанными с миграционным правом (РВП, ВНЖ, гражданство, патенты и т.д.). Пожалуйста, задайте вопрос по теме миграции.",
          sources: []
        }
      );
      response.headers.set("Set-Cookie", `${limitCookieName}=${encodeURIComponent(nextLimitToken)}; Path=/; HttpOnly; Max-Age=${24 * 60 * 60}; SameSite=Lax`);
      return response;
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY env variable");
      return NextResponse.json({ error: "ИИ-ассистент временно недоступен (не настроен API ключ для эмбеддингов)." }, { status: 500 });
    }

    if (!openrouterApiKey) {
      console.error("Missing OPENROUTER_API_KEY env variable");
      return NextResponse.json({ error: "ИИ-ассистент временно недоступен (не настроен API ключ OpenRouter)." }, { status: 500 });
    }

    // 3. Connect to SQLite DB
    const dbPath = path.join(process.cwd(), "knowledge.db");
    if (!fs.existsSync(dbPath)) {
      console.error("knowledge.db file not found");
      return NextResponse.json({ error: "База знаний еще не проиндексирована." }, { status: 500 });
    }

    const db = new Database(dbPath, { readonly: true });

    // 4. Retrieve context using Embeddings (RAG)
    const queryVector = await getQueryEmbedding(question, GEMINI_API_KEY);

    // Fetch all chunks to compute similarity
    const allChunks = db.prepare("SELECT id, content, source_file, embedding FROM chunks").all() as ChunkRow[];

    const scoredChunks = allChunks.map((chunk) => {
      const embedding = JSON.parse(chunk.embedding) as number[];
      const similarity = cosineSimilarity(queryVector, embedding);
      return { ...chunk, similarity };
    });

    // Sort and pick top 4
    scoredChunks.sort((a, b) => b.similarity - a.similarity);
    const topChunks = scoredChunks.slice(0, 4).filter(c => c.similarity > 0.65); // only keep relevant chunks

    // 5. Keyword search for downloadable templates
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

    // 6. Build prompt for Gemini
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

    const answer = await generateAnswer(systemPrompt, openrouterApiKey);

    // 7. Send Response with cookie headers
    const response = NextResponse.json({
      text: answer.replace("[CTA_LAWYER_FORM]", "").trim(),
      sources: Array.from(new Set(topChunks.map(c => c.source_file))),
      showLeadForm: answer.includes("[CTA_LAWYER_FORM]") || limitData.count >= 15, // show lead form if template matching occurred or if limit is getting close
      remainingRequests: 20 - limitData.count
    });

    response.headers.set("Set-Cookie", `${limitCookieName}=${encodeURIComponent(nextLimitToken)}; Path=/; HttpOnly; Max-Age=${24 * 60 * 60}; SameSite=Lax`);
    return response;

  } catch (error: any) {
    console.error("Consultant API Error:", error);
    return NextResponse.json(
      { error: "Произошла внутренняя ошибка сервера. Пожалуйста, попробуйте позже." },
      { status: 500 }
    );
  }
}
