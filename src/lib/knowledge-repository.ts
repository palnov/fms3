import fs from "fs";
import Database from "better-sqlite3";
import { getKnowledgeDbPath } from "@/lib/runtime-config";

export type KnowledgeChunk = {
  id: number;
  content: string;
  source_file: string;
  embedding: number[];
  source_url?: string | null;
  local_download_url?: string | null;
};

export type KnowledgeTemplate = {
  id: string;
  title: string;
  file_path: string;
  sample_path: string;
  keywords: string;
};

type StoredChunk = Omit<KnowledgeChunk, "embedding"> & { embedding: string };
type KnowledgeIndex = { modifiedAt: number; chunks: KnowledgeChunk[]; templates: KnowledgeTemplate[] };

let cachedIndex: KnowledgeIndex | null = null;

function loadKnowledgeIndex(): KnowledgeIndex {
  const dbPath = getKnowledgeDbPath();
  const modifiedAt = fs.statSync(dbPath).mtimeMs;
  if (cachedIndex?.modifiedAt === modifiedAt) return cachedIndex;

  const database = new Database(dbPath, { readonly: true, fileMustExist: true });
  try {
    const storedChunks = database.prepare(
      "SELECT id, content, source_file, embedding, source_url, local_download_url FROM chunks",
    ).all() as StoredChunk[];
    const templates = database.prepare(
      "SELECT id, title, file_path, sample_path, keywords FROM templates",
    ).all() as KnowledgeTemplate[];
    const chunks = storedChunks.flatMap((chunk) => {
      try {
        const embedding = JSON.parse(chunk.embedding) as unknown;
        return Array.isArray(embedding) && embedding.every((value) => typeof value === "number")
          ? [{ ...chunk, embedding }]
          : [];
      } catch {
        return [];
      }
    });

    cachedIndex = { modifiedAt, chunks, templates };
    return cachedIndex;
  } finally {
    database.close();
  }
}

function cosineSimilarity(vecA: number[], vecB: number[]) {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < vecA.length; index += 1) {
    dotProduct += vecA[index] * vecB[index];
    normA += vecA[index] * vecA[index];
    normB += vecB[index] * vecB[index];
  }
  return normA === 0 || normB === 0 ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function retrieveKnowledge(queryVector: number[], queryText: string, limit = 4, threshold = 0.4) {
  const index = loadKnowledgeIndex();
  const best: Array<KnowledgeChunk & { similarity: number }> = [];

  for (const chunk of index.chunks) {
    const similarity = cosineSimilarity(queryVector, chunk.embedding);
    if (similarity <= threshold) continue;
    const candidate = { ...chunk, similarity };
    const insertAt = best.findIndex((item) => similarity > item.similarity);
    if (insertAt === -1) best.push(candidate);
    else best.splice(insertAt, 0, candidate);
    if (best.length > limit) best.pop();
  }

  const questionWords = queryText.toLowerCase().split(/\s+/).filter((word) => word.length > 1);
  const matchedTemplates = index.templates.filter((template) =>
    template.keywords.toLowerCase().split(/,\s*/).some((keyword) =>
      questionWords.some((word) => word.includes(keyword) || keyword.includes(word)),
    ),
  );

  return { chunks: best, templates: matchedTemplates };
}

export function clearKnowledgeCacheForTests() {
  cachedIndex = null;
}
