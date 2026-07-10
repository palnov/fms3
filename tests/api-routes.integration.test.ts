import fs from "fs";
import os from "os";
import path from "path";
import Database from "better-sqlite3";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { GET as health } from "@/app/api/health/route";
import { POST as submitLead } from "@/app/api/leads/route";
import { closeRedisClient } from "@/lib/redis";

describe("API validation", () => {
  it("rejects malformed lead payloads before external work", async () => {
    const response = await submitLead(new Request("https://ufms-help.ru/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "", phone: "", question: "" }),
    }));
    expect(response.status).toBe(400);
  });
});

describe.skipIf(!process.env.TEST_REDIS_URL)("health API", () => {
  let directory = "";

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "fms3-health-"));
    const dbPath = path.join(directory, "knowledge.db");
    const db = new Database(dbPath);
    db.exec("CREATE TABLE readiness (id INTEGER);");
    db.close();
    vi.stubEnv("REDIS_URL", process.env.TEST_REDIS_URL || "");
    vi.stubEnv("KNOWLEDGE_DB_PATH", dbPath);
  });

  afterAll(async () => {
    await closeRedisClient();
    vi.unstubAllEnvs();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  it("reports ready only when Redis and knowledge storage respond", async () => {
    const response = await health();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "ok", components: { redis: true, knowledge: true } });
  });
});
