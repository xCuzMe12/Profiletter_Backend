import { Redis } from "ioredis";
import { env } from "../config/env.js";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
  }
  return redis;
}

export async function pingRedis(): Promise<boolean> {
  try {
    const client = getRedis();
    if (client.status !== "ready") {
      await client.connect();
    }
    const result = await client.ping();
    return result === "PONG";
  } catch {
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
