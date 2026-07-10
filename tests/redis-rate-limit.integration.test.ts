import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeRedisClient, getRedisClient } from "@/lib/redis";
import { consumeRateLimit } from "@/lib/security";

const hasRedis = Boolean(process.env.TEST_REDIS_URL);

describe.skipIf(!hasRedis)("Redis rate limiting", () => {
  beforeAll(() => {
    process.env.REDIS_URL = process.env.TEST_REDIS_URL;
  });

  afterAll(async () => {
    await closeRedisClient();
  });

  it("shares an atomic fixed-window counter", async () => {
    const redis = await getRedisClient();
    const key = `integration-${crypto.randomUUID()}`;
    const first = await consumeRateLimit(redis, key, 2, 30_000);
    const second = await consumeRateLimit(redis, key, 2, 30_000);
    const third = await consumeRateLimit(redis, key, 2, 30_000);
    expect(first.allowed).toBe(true);
    expect(second.remaining).toBe(0);
    expect(third.allowed).toBe(false);
  });
});
