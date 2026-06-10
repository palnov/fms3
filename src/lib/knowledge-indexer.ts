import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import Database from "better-sqlite3";

// Polyfill DOMMatrix for PDF parsing in Node.js
if (typeof global.DOMMatrix === "undefined") {
  // @ts-expect-error pdf-parse expects a browser DOMMatrix implementation.
  global.DOMMatrix = class DOMMatrix {};
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function extractTextFromBinaryDoc(buffer: Buffer): string {
  const chunks: string[] = [];
  let currentChunk: number[] = [];
  const chunkSize = 10000;

  for (let i = 0; i < buffer.length - 1; i += 2) {
    const charCode = buffer.readUInt16LE(i);
    // Support Cyrillic (0x0400-0x04FF), basic Latin (0x0020-0x007E), and spacing characters
    if (
      (charCode >= 0x0400 && charCode <= 0x04FF) ||
      (charCode >= 0x0020 && charCode <= 0x007E) ||
      charCode === 0x000A ||
      charCode === 0x000D ||
      charCode === 0x0009
    ) {
      currentChunk.push(charCode);
    } else {
      if (currentChunk.length > 0 && currentChunk[currentChunk.length - 1] !== 32) {
        currentChunk.push(32); // 32 is space charCode
      }
    }

    if (currentChunk.length >= chunkSize) {
      chunks.push(String.fromCharCode(...currentChunk));
      currentChunk = [];
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(String.fromCharCode(...currentChunk));
  }

  return chunks.join("").replace(/\s+/g, " ").trim();
}

export function chunkText(text: string, chunkSize = 1200, overlap = 200): string[] {
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
      const overlapWordsCount = Math.floor(currentChunkWords.length * (overlap / chunkSize)) || 5;
      currentChunkWords = currentChunkWords.slice(-Math.min(currentChunkWords.length, overlapWordsCount));
      currentLength = currentChunkWords.join(" ").length;
    }
  }

  if (currentChunkWords.length > 0) {
    chunks.push(currentChunkWords.join(" "));
  }

  return chunks.filter(c => c.trim().length > 20); // ignore tiny chunks
}

export async function getEmbedding(text: string, openRouterApiKey?: string): Promise<number[]> {
  const orKey = openRouterApiKey || process.env.OPENROUTER_API_KEY;
  if (!orKey) {
    throw new Error("OpenRouter API key is not configured.");
  }

  const url = "https://openrouter.ai/api/v1/embeddings";
  const maxRetries = 5;
  let attempt = 0;

  while (true) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${orKey}`,
        },
        body: JSON.stringify({
          model: "openai/text-embedding-3-large",
          input: text,
          dimensions: 3072,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter HTTP error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`OpenRouter API error: ${JSON.stringify(data.error)}`);
      }

      const embedding = data.data?.[0]?.embedding;
      if (!embedding) {
        throw new Error(`Invalid response structure from OpenRouter: ${JSON.stringify(data)}`);
      }
      return embedding;
    } catch (err: unknown) {
      attempt++;
      const errorMessage = getErrorMessage(err);
      const isTransient = 
        errorMessage.includes("500") ||
        errorMessage.includes("502") ||
        errorMessage.includes("503") ||
        errorMessage.includes("504") ||
        errorMessage.includes("429") ||
        errorMessage.toLowerCase().includes("fetch failed") ||
        errorMessage.toLowerCase().includes("timeout") ||
        errorMessage.toLowerCase().includes("econnreset") ||
        errorMessage.toLowerCase().includes("econnrefused") ||
        errorMessage.toLowerCase().includes("enotfound");

      if (isTransient && attempt <= maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`Embedding failed (attempt ${attempt}/${maxRetries}): ${errorMessage}. Retrying in ${Math.round(backoffMs)}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }

      console.error("Embedding generation failed:", errorMessage);
      throw err;
    }
  }
}


export async function ocrPdfWithGemini(
  fileBuffer: Buffer,
  geminiApiKey?: string,
  openRouterApiKey?: string
): Promise<string> {
  const base64Data = fileBuffer.toString("base64");
  const gKey = geminiApiKey || process.env.GEMINI_API_KEY;
  
  if (gKey) {
    try {
      console.log("Attempting PDF OCR via direct Gemini API...");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${gKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Распознай и извлеки весь текст из этого PDF-документа. Воспроизведи все таблицы, списки, официальные реквизиты, номера страниц и текстовое содержимое с сохранением структуры. Ответ должен содержать исключительно распознанный текст документа без каких-либо твоих комментариев, пояснений или разметки markdown (вроде блоков ```)."
                  },
                  {
                    inlineData: {
                      mimeType: "application/pdf",
                      data: base64Data
                    }
                  }
                ]
              }
            ]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          console.log(`Direct Gemini OCR successful. Extracted ${text.length} characters.`);
          return text;
        }
      } else {
        const errText = await response.text();
        console.warn(`Direct Gemini OCR API failed: ${response.status} - ${errText}`);
      }
    } catch (err: unknown) {
      console.warn("Direct Gemini OCR exception:", getErrorMessage(err));
    }
  }

  const orKey = openRouterApiKey || process.env.OPENROUTER_API_KEY;
  if (orKey) {
    const modelsToTry = [
      "meta-llama/llama-3.2-11b-vision-instruct",
      "google/gemini-2.5-flash",
      "meta-llama/llama-3.2-90b-vision-instruct",
      "openai/gpt-4o-mini"
    ];

    for (const model of modelsToTry) {
      try {
        console.log(`Attempting PDF OCR via OpenRouter (${model})...`);
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${orKey}`,
            "HTTP-Referer": "https://fms3.ru",
            "X-Title": "FMS3 Migration Assistant"
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Распознай и извлеки весь текст из этого PDF-документа. Воспроизведи все таблицы, списки, официальные реквизиты, номера страниц и текстовое содержимое с сохранением структуры. Ответ должен содержать исключительно распознанный текст документа без каких-либо твоих комментариев, пояснений или разметки markdown (вроде блоков ```)."
                  },
                  {
                    type: "file",
                    file: {
                      filename: "document.pdf",
                      file_data: `data:application/pdf;base64,${base64Data}`
                    }
                  }
                ]
              }
            ],
            temperature: 0.2,
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text && text.trim().length > 0) {
            console.log(`OpenRouter OCR successful (${model}). Extracted ${text.length} characters.`);
            return text;
          }
        } else {
          const errText = await response.text();
          console.warn(`OpenRouter OCR API failed for ${model}: ${response.status} - ${errText}`);
        }
      } catch (err: unknown) {
        console.warn(`OpenRouter OCR exception for ${model}:`, getErrorMessage(err));
      }
    }
  }

  throw new Error("Не удалось распознать PDF файл (ошибка парсинга и отсутствие рабочих ключей Gemini/OpenRouter для OCR)");
}

export async function extractText(
  filePath: string,
  geminiApiKey?: string,
  openRouterApiKey?: string
): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const fileBuffer = fs.readFileSync(filePath);

  if (ext === ".txt") {
    return fileBuffer.toString("utf-8");
  } else if (ext === ".pdf") {
    let pdfText = "";
    let useOcr = false;
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: fileBuffer });
      const textResult = await parser.getText();
      await parser.destroy();
      pdfText = textResult.text || "";
      
      const cleanText = pdfText.trim();
      const pageCount = textResult.pages?.length || 1;
      // Heuristic: if very short or low text density, fallback to Gemini OCR
      if (cleanText.length < 200 || cleanText.length / pageCount < 100) {
        console.warn(`PDF ${filePath} has low text density (length: ${cleanText.length}, pages: ${pageCount}). Falling back to OCR.`);
        useOcr = true;
      }
    } catch (err: unknown) {
      console.warn(`Standard PDF parsing failed for ${filePath}: ${getErrorMessage(err)}. Falling back to OCR...`);
      useOcr = true;
    }

    if (useOcr) {
      try {
        pdfText = await ocrPdfWithGemini(fileBuffer, geminiApiKey, openRouterApiKey);
      } catch (ocrErr: unknown) {
        console.warn(`OCR fallback failed for ${filePath}: ${getErrorMessage(ocrErr)}. Falling back to standard PDF parsed text or filename metadata.`);
        // If standard parser extracted some text (even if low density), use it as fallback
        if (pdfText && pdfText.trim().length > 20) {
          return pdfText;
        }
        // As a last resort, use filename to avoid failing the vectorization process entirely
        const baseName = path.basename(filePath);
        return `Документ: ${baseName}. Содержимое недоступно для текстового распознавания (сканированный файл без текстового слоя).`;
      }
    }

    return pdfText;
  } else if (ext === ".docx") {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } catch {
      console.warn(`Mammoth failed on ${filePath}, falling back to binary doc parser...`);
      return extractTextFromBinaryDoc(fileBuffer);
    }
  } else if (ext === ".doc") {
    return extractTextFromBinaryDoc(fileBuffer);
  } else if (ext === ".html" || ext === ".htm") {
    const html = fileBuffer.toString("utf-8");
    return html.replace(/<[^>]*>/g, " ");
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

export async function indexFileContent(
  filename: string,
  fullText: string,
  db: Database.Database,
  openRouterApiKey: string,
  sourceUrl: string | null,
  localDownloadUrl: string | null,
  logCallback?: (msg: string) => void
): Promise<number> {
  const chunks = chunkText(fullText);
  if (logCallback) logCallback(`Разбито на ${chunks.length} фрагментов.`);

  const insertChunk = db.prepare(`
    INSERT INTO chunks (content, source_file, embedding, source_url, local_download_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  let count = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (logCallback) logCallback(`  Индексация чанка ${i + 1}/${chunks.length}...`);
    try {
      const embedding = await getEmbedding(chunk, openRouterApiKey);
      insertChunk.run(chunk, filename, JSON.stringify(embedding), sourceUrl, localDownloadUrl);
      count++;
    } catch (err: unknown) {
      if (logCallback) logCallback(`  Ошибка чанка ${i + 1}: ${getErrorMessage(err)}`);
      throw err;
    }
  }

  return count;
}
