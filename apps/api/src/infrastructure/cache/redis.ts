import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://redis:6379";

let lastErrorLogAt = 0;
const ERROR_LOG_INTERVAL_MS = 30_000;
const CONNECTION_COOLDOWN_MS = 10_000;

function logRedisError(message: string, error?: unknown) {
  const now = Date.now();
  if (now - lastErrorLogAt < ERROR_LOG_INTERVAL_MS) return;
  lastErrorLogAt = now;
  const detail = error instanceof Error ? error.message : String(error ?? "unknown error");
  console.warn(`[redis] ${message}; PostgreSQL fallback remains enabled`, detail);
}

export const redisClient = new Redis(redisUrl, {
  lazyConnect: true,
  connectTimeout: 1_500,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy: (attempt) => Math.min(attempt * 500, 5_000),
});

let connectionBlockedUntil = 0;

redisClient.on("connect", () => console.info("[redis] connected"));
redisClient.on("ready", () => {
  connectionBlockedUntil = 0;
  console.info("[redis] ready");
});
redisClient.on("error", (error) => logRedisError("connection error", error));

let connectionAttempt: Promise<boolean> | null = null;

export async function ensureRedisReady(): Promise<boolean> {
  if (redisClient.status === "ready") return true;
  if (redisClient.status === "end") return false;
  if (Date.now() < connectionBlockedUntil) return false;

  if (!connectionAttempt) {
    connectionAttempt = redisClient
      .connect()
      .then(() => redisClient.status === "ready")
      .catch((error) => {
        connectionBlockedUntil = Date.now() + CONNECTION_COOLDOWN_MS;
        logRedisError("unavailable", error);
        return false;
      })
      .finally(() => {
        connectionAttempt = null;
      });
  }

  return connectionAttempt;
}

export async function pingRedis(): Promise<boolean> {
  if (!(await ensureRedisReady())) return false;
  try {
    return (await redisClient.ping()) === "PONG";
  } catch (error) {
    logRedisError("health check failed", error);
    return false;
  }
}
