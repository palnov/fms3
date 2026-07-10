import path from "path";

const MIN_SECRET_LENGTH = 32;

function cleanEnv(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getDataDir() {
  return cleanEnv("DATA_DIR") || (process.env.NODE_ENV === "production" ? "/data" : process.cwd());
}

export function getKnowledgeDbPath() {
  return cleanEnv("KNOWLEDGE_DB_PATH") || path.join(getDataDir(), "knowledge.db");
}

export function getAiChatLogDbPath() {
  return cleanEnv("AI_CHAT_LOG_DB_PATH") || path.join(getDataDir(), "ai-chat-log.db");
}

export function getRedisUrl() {
  const value = cleanEnv("REDIS_URL");
  if (!value) throw new Error("REDIS_URL is not configured.");
  return value;
}

export function getRequiredSecret(name: "JWT_SECRET" | "RATE_LIMIT_SECRET" | "ADMIN_SECRET") {
  const value = cleanEnv(name);
  if (!value) throw new Error(`${name} is not configured.`);
  if (process.env.NODE_ENV === "production" && value.length < MIN_SECRET_LENGTH) {
    throw new Error(`${name} must contain at least ${MIN_SECRET_LENGTH} characters.`);
  }
  return value;
}

export function getSiteOrigin() {
  const url = new URL(cleanEnv("NEXT_PUBLIC_SITE_URL") || "https://fms3.ru");
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https.");
  }
  return url.origin;
}

export function getPublicRuntimeConfig() {
  return {
    siteOrigin: getSiteOrigin(),
    knowledgeDbPath: getKnowledgeDbPath(),
    aiChatLogDbPath: getAiChatLogDbPath(),
  };
}
