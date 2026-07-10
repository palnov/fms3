import { createClient, type RedisClientType } from "redis";
import { getRedisUrl } from "@/lib/runtime-config";

// The Redis package models an unextended RESP3 client with empty module/function/script maps.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type RedisClient = RedisClientType<{}, {}, {}, 3, {}>;

let client: RedisClient | null = null;
let connecting: Promise<RedisClient> | null = null;

export async function getRedisClient(): Promise<RedisClient> {
  if (client?.isReady) return client;
  if (connecting) return connecting;

  const nextClient = createClient({
    url: getRedisUrl(),
    socket: {
      connectTimeout: 3_000,
      reconnectStrategy(retries) {
        if (retries >= 3) return new Error("Redis is unavailable after 3 reconnect attempts.");
        return Math.min(100 * 2 ** retries, 3_000);
      },
    },
  });

  nextClient.on("error", (error) => {
    console.error("Redis connection error", error instanceof Error ? error.message : "unknown error");
  });

  connecting = nextClient.connect().then(() => {
    client = nextClient;
    return nextClient;
  }).finally(() => {
    connecting = null;
  });

  return connecting;
}

export async function closeRedisClient() {
  if (!client?.isOpen) return;
  await client.close();
  client = null;
}
