import { createClient } from "redis";

// This prevents multiple connections during Next.js Hot Reloads
const globalForRedis = global as unknown as {
  redis: ReturnType<typeof createClient>;
};

export const redis =
  globalForRedis.redis ||
  createClient({
    url: process.env.REDIS_URL,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

if (!redis.isOpen) {
  redis.connect().catch(console.error);
}
