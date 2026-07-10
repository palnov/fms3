import { afterEach, describe, expect, it, vi } from "vitest";
import { consumeRateLimit, isTrustedMutationOrigin, readJsonBody, readRateLimitStatus, type RateLimitStore } from "@/lib/security";

function store(values: { count?: number; ttl?: number } = {}): RateLimitStore {
  return {
    async eval() { return [values.count ?? 1, values.ttl ?? 60_000]; },
    async get() { return values.count ? String(values.count) : null; },
    async pTTL() { return values.ttl ?? -1; },
  };
}

afterEach(() => vi.unstubAllEnvs());

describe("security helpers", () => {
  it("maps an atomic Redis result to rate-limit headers state", async () => {
    const result = await consumeRateLimit(store({ count: 3, ttl: 30_000 }), "key", 3, 60_000);
    expect(result).toMatchObject({ allowed: true, remaining: 0, limit: 3 });
  });

  it("blocks a counter after the configured limit", async () => {
    const result = await consumeRateLimit(store({ count: 4 }), "key", 3, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("reads a missing counter without consuming quota", async () => {
    const result = await readRateLimitStatus(store(), "key", 10, 60_000);
    expect(result).toMatchObject({ allowed: true, remaining: 10 });
  });

  it("rejects oversized JSON bodies", async () => {
    const request = new Request("https://fms3.ru/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "too long" }),
    });
    expect(await readJsonBody(request, 4)).toBeNull();
  });

  it("accepts only the canonical mutation origin in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fms3.ru");
    expect(isTrustedMutationOrigin(new Request("https://internal/admin", { headers: { origin: "https://fms3.ru" } }))).toBe(true);
    expect(isTrustedMutationOrigin(new Request("https://internal/admin", { headers: { origin: "https://evil.example" } }))).toBe(false);
  });
});
