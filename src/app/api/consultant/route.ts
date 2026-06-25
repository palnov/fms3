import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import crypto from "crypto";
import { getQueryEmbedding } from "@/lib/query-embedding";
import {
  asTrimmedString,
  checkRateLimit,
  getClientIp,
  hashRateLimitKey,
  rateLimitHeaders,
  readJsonBody,
} from "@/lib/security";

interface ChunkRow {
  id: number;
  content: string;
  source_file: string;
  embedding: string; // JSON string of number[]
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

const CONSULTANT_DAILY_LIMIT = 10;
const DAY_MS = 24 * 60 * 60 * 1000;
const REQUEST_BODY_LIMIT_BYTES = 2 * 1024;
const OPENROUTER_TIMEOUT_MS = 25_000;
const ALLOWED_LANGUAGES = new Set(["ru", "en", "tg", "uz", "ro", "kk"]);

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

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// Generate text with OpenRouter API
async function generateAnswer(prompt: string, apiKey: string): Promise<string> {
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
  const response = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://fms3.ru",
      "X-Title": "FMS3 Migration Assistant"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1200,
    }),
  }, OPENROUTER_TIMEOUT_MS);

  if (!response.ok) {
    console.warn("OpenRouter chat request failed", { status: response.status, model });
    throw new Error(`OpenRouter chat request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    console.warn("OpenRouter chat returned an error", { model });
    throw new Error("OpenRouter chat returned an error.");
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text || typeof text !== "string") {
    throw new Error("Invalid response structure from OpenRouter chat.");
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
    // Russian
    "рвп", "внж", "гражданств", "патент", "миграци", "закон", "виз", "паспорт",
    "квот", "супруг", "брак", "переезд", "рф", "росси", "документ", "бланк",
    "заявлен", "образец", "экзамен", "пошлин", "пребыван", "мвд", "гувм",
    // English
    "trp", "residence", "citizenship", "patent", "migration", "law", "visa", "passport",
    "quota", "spouse", "marriage", "relocation", "russia", "document", "form", "application",
    "sample", "exam", "fee", "stay", "mvd", "guvm",
    // Tajik
    "шаҳрвандӣ", "муҳоҷират", "қонун", "раводид", "шиноснома", "ҳамсар", "издивоҷ",
    "кӯчидан", "ҳуҷҷат", "варақа", "ариза", "намуна", "имтиҳон", "боҷ", "иқомат", "вкд",
    // Uzbek
    "fuqarolik", "migratsiya", "qonun", "pasport", "nikoh", "ko'chish",
    "hujjat", "ariza", "namuna", "imtihon", "boj", "istiqomat",
    // Moldovan/Romanian
    "sedere", "cetatenie", "brevet", "migratie", "lege", "pasaport", "casatorie",
    "relocare", "formular", "cerere", "mostra", "examen", "taxa",
    // Kazakh
    "азаматтық", "көші-қон", "заң", "жұбайы", "неке", "көшу", "құжат", "өтініш",
    "үлгі", "емтихан", "алым", "тұру", "іім"
  ];
  const queryLower = query.toLowerCase();
  return keywords.some((kw) => queryLower.includes(kw));
}

// Cookie limits helpers
function getSecretKey(): string {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return secretKey;
}

function signToken(count: number, resetTime: number, secretKey: string): string {
  const data = `${count}:${resetTime}`;
  const signature = crypto.createHmac("sha256", secretKey).update(data).digest("hex");
  return `${data}.${signature}`;
}

function verifyToken(token: string, secretKey: string): { count: number; resetTime: number } | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSignature = crypto.createHmac("sha256", secretKey).update(data).digest("hex");
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const [countStr, resetTimeStr] = data.split(":");
    return {
      count: parseInt(countStr, 10),
      resetTime: parseInt(resetTimeStr, 10),
    };
  } catch {
    return null;
  }
}

function createLimitCookie(name: string, value: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Max-Age=${24 * 60 * 60}; SameSite=Lax${secure}`;
}

function createAnonymousCookie(name: string, value: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Max-Age=${365 * 24 * 60 * 60}; SameSite=Lax${secure}`;
}

function getCookieValue(cookiesHeader: string, name: string): string | null {
  const match = cookiesHeader.match(new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function applyLimitHeaders(response: NextResponse, limitCookie: string, anonymousCookie: string, rateLimit: ReturnType<typeof checkRateLimit>) {
  response.headers.set("Set-Cookie", limitCookie);
  response.headers.append("Set-Cookie", anonymousCookie);
  Object.entries(rateLimitHeaders(rateLimit)).forEach(([key, value]) => response.headers.set(key, value));
}

function getStrictestRateLimit(...limits: Array<ReturnType<typeof checkRateLimit>>) {
  return limits.reduce((strictest, current) => {
    if (!current.allowed) return current;
    return current.remaining < strictest.remaining ? current : strictest;
  });
}

export async function POST(request: Request) {
  try {
    const secretKey = getSecretKey();
    const body = await readJsonBody<{ question?: unknown; language?: unknown }>(request, REQUEST_BODY_LIMIT_BYTES);
    if (!body) {
      return NextResponse.json({ error: "Некорректный или слишком большой запрос." }, { status: 400 });
    }

    const question = asTrimmedString(body.question, 500);
    if (!question) {
      return NextResponse.json({ error: "Вопрос не может быть пустым." }, { status: 400 });
    }

    const requestedLanguage = typeof body.language === "string" ? body.language : "ru";
    const language = ALLOWED_LANGUAGES.has(requestedLanguage) ? requestedLanguage : "ru";

    // Map language codes to names for the LLM
    const languageNames: Record<string, string> = {
      ru: "русский",
      en: "английский (English)",
      tg: "таджикский (Тоҷикӣ)",
      uz: "узбекский (O'zbekcha)",
      ro: "молдавский/румынский (Română)",
      kk: "казахский (Қазақша)",
    };
    const targetLang = languageNames[language] || "русский";

    // 1. Rate Limiting check
    const cookiesHeader = request.headers.get("cookie") || "";
    const limitCookieName = "ai_limit_token";
    const anonymousCookieName = "ai_client_id";
    const token = getCookieValue(cookiesHeader, limitCookieName);
    const anonymousId = getCookieValue(cookiesHeader, anonymousCookieName) || crypto.randomUUID();

    const now = Date.now();
    let limitData = token ? verifyToken(token, secretKey) : null;

    if (!limitData || now > limitData.resetTime) {
      // First request or timer expired (reset daily)
      limitData = {
        count: 0,
        resetTime: now + DAY_MS,
      };
    }

    const ipRateLimit = checkRateLimit(
      hashRateLimitKey(["consultant", "ip", getClientIp(request)]),
      CONSULTANT_DAILY_LIMIT,
      DAY_MS,
    );
    const anonymousRateLimit = checkRateLimit(
      hashRateLimitKey(["consultant", "anonymous", anonymousId]),
      CONSULTANT_DAILY_LIMIT,
      DAY_MS,
    );
    const rateLimit = getStrictestRateLimit(ipRateLimit, anonymousRateLimit);

    if (!rateLimit.allowed || limitData.count >= CONSULTANT_DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: `Вы превысили лимит бесплатных вопросов на сегодня (максимум ${CONSULTANT_DAILY_LIMIT}).`,
          isLimitReached: true,
          text: `К сожалению, вы исчерпали дневной лимит в ${CONSULTANT_DAILY_LIMIT} бесплатных вопросов. Для детального решения вашего вопроса мы рекомендуем связаться с нашим юристом.`,
          showLeadForm: true
        },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    // Increment count
    limitData.count = Math.max(limitData.count + 1, CONSULTANT_DAILY_LIMIT - rateLimit.remaining);
    const nextLimitToken = signToken(limitData.count, limitData.resetTime, secretKey);
    const limitCookie = createLimitCookie(limitCookieName, nextLimitToken);
    const anonymousCookie = createAnonymousCookie(anonymousCookieName, anonymousId);

    // 2. Security Checks
    if (isUnsafeQuery(question)) {
      const response = NextResponse.json(
        {
          text: "Извините, я могу отвечать только на корректные вопросы по миграционному законодательству РФ. Моя система зафиксировала потенциально небезопасный запрос.",
          sources: []
        }
      );
      applyLimitHeaders(response, limitCookie, anonymousCookie, rateLimit);
      return response;
    }

    if (!isMigrationRelated(question)) {
      const response = NextResponse.json(
        {
          text: "Я — специализированный ИИ-консультант по вопросам миграции в РФ. К сожалению, я не могу помочь с темами, не связанными с миграционным правом (РВП, ВНЖ, гражданство, патенты и т.д.). Пожалуйста, задайте вопрос по теме миграции.",
          sources: []
        }
      );
      applyLimitHeaders(response, limitCookie, anonymousCookie, rateLimit);
      return response;
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openrouterApiKey) {
      console.error("Missing OPENROUTER_API_KEY env variable");
      return NextResponse.json({ error: "ИИ-ассистент временно недоступен (не настроен API ключ OpenRouter)." }, { status: 500 });
    }

    // 3. Connect to SQLite DB
    const dbPath = process.env.KNOWLEDGE_DB_PATH || path.join(process.cwd(), "knowledge.db");
    if (!fs.existsSync(dbPath)) {
      console.error("knowledge.db file not found", { dbPath });
      return NextResponse.json({ error: "База знаний еще не проиндексирована." }, { status: 500 });
    }

    const db = new Database(dbPath, { readonly: true });

    // 4. Retrieve context using Embeddings (RAG)
    const queryVector = await getQueryEmbedding(question, openrouterApiKey);

    // Fetch all chunks to compute similarity
    const allChunks = db.prepare("SELECT id, content, source_file, embedding, source_url, local_download_url FROM chunks").all() as ChunkRow[];

    const scoredChunks = allChunks.map((chunk) => {
      const embedding = JSON.parse(chunk.embedding) as number[];
      const similarity = cosineSimilarity(queryVector, embedding);
      return { ...chunk, similarity };
    });

    // Sort and pick top 4
    scoredChunks.sort((a, b) => b.similarity - a.similarity);
    const topChunks = scoredChunks.slice(0, 4).filter(c => c.similarity > 0.40); // only keep relevant chunks

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
1. Используй ТОЛЬКО информацию из "БАЗЫ ЗНАНИЙ" ниже. Не выдумывай юридические факты. Если в вопросе пользователя упоминается конкретная страна, а в БАЗЕ ЗНАНИЙ нет прямого упоминания этой страны или её визового статуса, ты должен:
   - Ответить в общих терминах на основе имеющихся в базе знаний законов (например, объяснить правила для граждан, «прибывших в порядке, не требующем получения визы»).
   - Явно и вежливо указать, что точной информации по конкретной стране (в данном случае [Название Страны]) в твоей базе знаний нет.
   - Порекомендовать обратиться к юристу для уточнения статуса этой страны.
2. ОБЯЗАТЕЛЬНО отвечай на языке: ${targetLang}. Весь твой ответ, включая рекомендации, списки и объяснения, должен быть написан на этом языке. При этом основывайся на законах РФ из БАЗЫ ЗНАНИЙ (переводи термины и положения законов на язык ответа корректно). Будь вежлив, используй форматирование markdown (списки, жирный шрифт) для улучшения читаемости.
3. Если пользователю нужен бланк, шаблон или образец документа, и он есть в разделе "ДОСТУПНЫЕ ШАБЛОНЫ", обязательно выведи ссылки на него в таком формате:
   "Вы можете скачать нужные бланки:
   - [Скачать бланк заявления на РВП по браку](/templates/rvp-brak-blank.docx)
   - [Скачать образец заполнения](/templates/rvp-brak-sample.pdf)"
   (Формат ссылок и путей оставь без изменений, но текст вокруг них переведи на язык ответа).
4. В самом конце ответа ОБЯЗАТЕЛЬНО ненавязчиво предложи бесплатную помощь юриста на языке: ${targetLang}, так как законы сложны, а инспекторы часто придираются к деталям.
5. Закончи свой ответ строго специальным служебным тегом: [CTA_LAWYER_FORM] на новой строке. Этот тег укажет интерфейсу отрендерить форму обратной связи.

БАЗА ЗНАНИЙ:
${contextText || "Нет доступных выдержек из законов под этот запрос."}

${matchedTemplates.length > 0 ? `ДОСТУПНЫЕ ШАБЛОНЫ:\n${templatesText}` : ""}

ВОПРОС ПОЛЬЗОВАТЕЛЯ:
"${question}"

Ответ:`;

    const answer = await generateAnswer(systemPrompt, openrouterApiKey);

    // Dedup by source_file and build the array of source info
    const uniqueSourcesMap = new Map<string, { name: string; parent_url?: string | null; download_url?: string | null }>();
    for (const chunk of topChunks) {
      if (!uniqueSourcesMap.has(chunk.source_file)) {
        uniqueSourcesMap.set(chunk.source_file, {
          name: chunk.source_file,
          parent_url: chunk.source_url,
          download_url: chunk.local_download_url,
        });
      }
    }
    const sources = Array.from(uniqueSourcesMap.values());

    // 7. Send Response with cookie headers
    const response = NextResponse.json({
      text: answer.replace(/\[CTA_LAWYER_FORM\]/gi, "").trim(),
      sources: sources,
      showLeadForm: answer.toLowerCase().includes("[cta_lawyer_form]") || rateLimit.remaining <= 2,
      remainingRequests: rateLimit.remaining
    });

    applyLimitHeaders(response, limitCookie, anonymousCookie, rateLimit);
    return response;

  } catch (error: unknown) {
    console.error("Consultant API Error:", error);
    return NextResponse.json(
      { error: "Произошла внутренняя ошибка сервера. Пожалуйста, попробуйте позже." },
      { status: 500 }
    );
  }
}
