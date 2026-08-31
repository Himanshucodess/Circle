import { ensureRedisReady, pingRedis, redisClient } from "./redis";

const shouldLogCache = process.env.CACHE_DEBUG === "true" || process.env.NODE_ENV !== "production";

function logCache(message: string, key: string) {
  if (shouldLogCache) console.info(`[cache] ${message}`, key);
}

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    if (!(await ensureRedisReady())) return null;
    try {
      const value = await redisClient.get(key);
      if (value === null) {
        logCache("miss", key);
        return null;
      }
      logCache("hit", key);
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn("[cache] read failed; using PostgreSQL", error instanceof Error ? error.message : error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (!(await ensureRedisReady())) return;
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error) {
      console.warn("[cache] write failed; continuing without cache", error instanceof Error ? error.message : error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!(await ensureRedisReady())) return;
    try {
      await redisClient.del(key);
    } catch (error) {
      console.warn("[cache] delete failed; continuing", error instanceof Error ? error.message : error);
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    if (!(await ensureRedisReady())) return;
    try {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await redisClient.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;
        if (keys.length) await redisClient.del(...keys);
      } while (cursor !== "0");
    } catch (error) {
      console.warn("[cache] pattern invalidation failed; continuing", error instanceof Error ? error.message : error);
    }
  }

  async isHealthy(): Promise<boolean> {
    return pingRedis();
  }
}

export const cacheService = new CacheService();
