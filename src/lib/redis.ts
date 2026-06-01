import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

const mockRedis = {
  get: async () => null,
  setex: async () => "OK",
  set: async () => "OK",
  del: async () => 1,
  exists: async () => 0,
  on: () => mockRedis,
} as unknown as Redis;

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn("[Redis] No REDIS_URL set, using in-memory fallback");
    return mockRedis;
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 1,
    retryStrategy() { return null; },
    lazyConnect: true,
  });

  client.connect().catch(() => {
    console.warn("[Redis] Connection failed, using in-memory fallback");
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
