import crypto from "crypto";
import { getRedisClient } from "@/lib/redis";
import { getRequiredSecret, getSiteOrigin } from "@/lib/runtime-config";

const DEFAULT_JSON_LIMIT_BYTES = 16 * 1024;

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

const CONSUME_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('PTTL', KEYS[1])
return {count, ttl}
`;

export type RateLimitStore = {
  eval(script: string, options: { keys: string[]; arguments: string[] }): Promise<unknown>;
  get(key: string): Promise<string | null>;
  pTTL(key: string): Promise<number>;
};

export function hashRateLimitKey(parts: Array<string | number | null | undefined>) {
  const normalized = parts.map((part) => String(part ?? "")).join(":");
  const secret = process.env.NODE_ENV === "production"
    ? process.env.RATE_LIMIT_SECRET?.trim() ? getRequiredSecret("RATE_LIMIT_SECRET") : getRequiredSecret("JWT_SECRET")
    : process.env.RATE_LIMIT_SECRET?.trim() || process.env.JWT_SECRET?.trim() || "development-rate-limit-secret";
  return crypto.createHmac("sha256", secret).update(normalized).digest("hex");
}

export function getClientIp(request: Request) {
  const headers = request.headers;
  return headers.get("cf-connecting-ip") || headers.get("x-real-ip") || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function consumeRateLimit(store: RateLimitStore, key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const result = await store.eval(CONSUME_SCRIPT, {
    keys: [`fms3:rate-limit:${key}`],
    arguments: [String(windowMs)],
  }) as [number, number];
  const count = Number(result[0]);
  const ttl = Math.max(Number(result[1]), 1);
  const remaining = Math.max(0, limit - count);
  const allowed = count <= limit;
  return { allowed, limit, remaining, resetAt: Date.now() + ttl, retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil(ttl / 1000)) };
}

export async function readRateLimitStatus(store: RateLimitStore, key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const redisKey = `fms3:rate-limit:${key}`;
  const [rawCount, rawTtl] = await Promise.all([store.get(redisKey), store.pTTL(redisKey)]);
  const count = Math.max(0, Number(rawCount || 0));
  const ttl = rawTtl > 0 ? rawTtl : windowMs;
  const remaining = Math.max(0, limit - count);
  const allowed = count < limit;
  return { allowed, limit, remaining, resetAt: Date.now() + ttl, retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil(ttl / 1000)) };
}

export async function checkRateLimit(key: string, limit: number, windowMs: number) {
  return consumeRateLimit(await getRedisClient(), key, limit, windowMs);
}

export async function getRateLimitStatus(key: string, limit: number, windowMs: number) {
  return readRateLimitStatus(await getRedisClient(), key, limit, windowMs);
}

export function checkContentLength(request: Request, maxBytes = DEFAULT_JSON_LIMIT_BYTES) {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return true;
  const parsed = Number(contentLength);
  return Number.isFinite(parsed) && parsed <= maxBytes;
}

export async function readJsonBody<T>(request: Request, maxBytes = DEFAULT_JSON_LIMIT_BYTES): Promise<T | null> {
  if (!checkContentLength(request, maxBytes)) return null;
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > maxBytes) return null;
  try { return JSON.parse(rawBody) as T; } catch { return null; }
}

export function asTrimmedString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= maxLength ? trimmed : null;
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.allowed ? {} : { "Retry-After": String(result.retryAfterSeconds) }),
  };
}

export function isTrustedMutationOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const normalized = new URL(origin).origin;
    if (normalized === getSiteOrigin()) return true;
    return process.env.NODE_ENV !== "production" && normalized === new URL(request.url).origin;
  } catch {
    return false;
  }
}
