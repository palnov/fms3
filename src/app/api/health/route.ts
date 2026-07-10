import fs from "fs";
import Database from "better-sqlite3";
import { getRedisClient } from "@/lib/redis";
import { getKnowledgeDbPath } from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const components = { redis: false, knowledge: false };
  try {
    const redis = await getRedisClient();
    components.redis = (await redis.ping()) === "PONG";
  } catch {}

  let database: Database.Database | null = null;
  try {
    const dbPath = getKnowledgeDbPath();
    if (fs.existsSync(dbPath)) {
      database = new Database(dbPath, { readonly: true, fileMustExist: true });
      database.prepare("SELECT 1").get();
      components.knowledge = true;
    }
  } catch {
    components.knowledge = false;
  } finally {
    database?.close();
  }

  const healthy = components.redis && components.knowledge;
  return Response.json({ status: healthy ? "ok" : "degraded", components }, {
    status: healthy ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
