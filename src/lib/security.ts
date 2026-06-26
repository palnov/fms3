import crypto from "crypto";
import path from "path";
import Database from "better-sqlite3";

const RATE_LIMIT_DB_PATH = process.env.RATE_LIMIT_DB_PATH || path.join(process.cwd(), "security-rate-limit.db");
const DEFAULT_JSON_LIMIT_BYTES = 16 * 1024;

type RateLimitRow = {
  count: number;
  reset_at: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

let rateLimitDb: Database.Database | null = null;

function getRateLimitDb() {
  if (!rateLimitDb) {
    rateLimitDb = new Database(RATE_LIMIT_DB_PATH);
    rateLimitDb.pragma("journal_mode = WAL");
    rateLimitDb
      .prepare(
        `CREATE TABLE IF NOT EXISTS rate_limits (
          key TEXT PRIMARY KEY,
          count INTEGER NOT NULL,
          reset_at INTEGER NOT NULL
        )`,
      )
      .run();
    rateLimitDb.prepare("CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at)").run();
  }

  return rateLimitDb;
}

function getHashSecret() {
  const secret = process.env.RATE_LIMIT_SECRET || process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("RATE_LIMIT_SECRET or JWT_SECRET is required in production.");
  }

  return "development-rate-limit-secret";
}

export function hashRateLimitKey(parts: Array<string | number | null | undefined>) {
  const normalized = parts.map((part) => String(part ?? "")).join(":");
  return crypto.createHmac("sha256", getHashSecret()).update(normalized).digest("hex");
}

export function getClientIp(request: Request) {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp =
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();

  return forwardedFor || realIp || "unknown";
}

export function checkContentLength(request: Request, maxBytes = DEFAULT_JSON_LIMIT_BYTES) {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return true;

  const parsed = Number(contentLength);
  return Number.isFinite(parsed) && parsed <= maxBytes;
}

export async function readJsonBody<T>(request: Request, maxBytes = DEFAULT_JSON_LIMIT_BYTES): Promise<T | null> {
  if (!checkContentLength(request, maxBytes)) {
    return null;
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > maxBytes) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as T;
  } catch {
    return null;
  }
}

export function asTrimmedString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;

  return trimmed;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const db = getRateLimitDb();
  const now = Date.now();
  const resetAt = now + windowMs;

  db.prepare("DELETE FROM rate_limits WHERE reset_at <= ?").run(now);

  const existing = db.prepare("SELECT count, reset_at FROM rate_limits WHERE key = ?").get(key) as
    | RateLimitRow
    | undefined;

  if (!existing || existing.reset_at <= now) {
    db.prepare(
      `INSERT INTO rate_limits (key, count, reset_at)
       VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET count = excluded.count, reset_at = excluded.reset_at`,
    ).run(key, resetAt);

    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: existing.reset_at,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.reset_at - now) / 1000)),
    };
  }

  const nextCount = existing.count + 1;
  db.prepare("UPDATE rate_limits SET count = ? WHERE key = ?").run(nextCount, key);

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - nextCount),
    resetAt: existing.reset_at,
    retryAfterSeconds: 0,
  };
}

export function getRateLimitStatus(key: string, limit: number, windowMs: number): RateLimitResult {
  const db = getRateLimitDb();
  const now = Date.now();
  const resetAt = now + windowMs;

  db.prepare("DELETE FROM rate_limits WHERE reset_at <= ?").run(now);

  const existing = db.prepare("SELECT count, reset_at FROM rate_limits WHERE key = ?").get(key) as
    | RateLimitRow
    | undefined;

  if (!existing || existing.reset_at <= now) {
    return {
      allowed: true,
      limit,
      remaining: limit,
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  const remaining = Math.max(0, limit - existing.count);

  return {
    allowed: existing.count < limit,
    limit,
    remaining,
    resetAt: existing.reset_at,
    retryAfterSeconds: remaining > 0 ? 0 : Math.max(1, Math.ceil((existing.reset_at - now) / 1000)),
  };
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.allowed ? {} : { "Retry-After": String(result.retryAfterSeconds) }),
  };
}
