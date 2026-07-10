import { afterEach, describe, expect, it, vi } from "vitest";
import { getAiChatLogDbPath, getKnowledgeDbPath, getRequiredSecret, getSiteOrigin } from "@/lib/runtime-config";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllEnvs();
});

describe("runtime configuration", () => {
  it("derives persistent database paths from DATA_DIR", () => {
    process.env.DATA_DIR = "/srv/data";
    delete process.env.KNOWLEDGE_DB_PATH;
    delete process.env.AI_CHAT_LOG_DB_PATH;
    expect(getKnowledgeDbPath()).toBe("/srv/data/knowledge.db");
    expect(getAiChatLogDbPath()).toBe("/srv/data/ai-chat-log.db");
  });

  it("rejects weak production secrets", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.JWT_SECRET = "short";
    expect(() => getRequiredSecret("JWT_SECRET")).toThrow("at least 32");
  });

  it("normalizes the configured site origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://ufms-help.ru/path";
    expect(getSiteOrigin()).toBe("https://ufms-help.ru");
  });
});
