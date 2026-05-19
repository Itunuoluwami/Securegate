import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Simple in-memory fallback rate limiter for local development/testing when Upstash is not configured.
type RateLimitRecord = {
  timestamps: number[];
};

const inMemoryStore = new Map<string, RateLimitRecord>();

// Clean up memory store periodically to prevent memory leaks
if (typeof global !== "undefined") {
  const g = global as typeof globalThis & {
    memoryStoreCleanupInterval?: ReturnType<typeof setInterval>;
  };
  if (!g.memoryStoreCleanupInterval) {
    g.memoryStoreCleanupInterval = setInterval(() => {
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;
      inMemoryStore.forEach((record, key) => {
        const active = record.timestamps.filter((t) => now - t < tenMinutes);
        if (active.length === 0) {
          inMemoryStore.delete(key);
        } else {
          record.timestamps = active;
        }
      });
    }, 60000); // clean every minute
  }
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function rateLimit(ip: string, action: string): Promise<RateLimitResult> {
  const limitCount = 5;
  const windowMs = 10 * 60 * 1000; // 10 minutes

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const hasUpstash =
    redisUrl &&
    redisUrl !== "https://your-upstash-redis-url.upstash.io" &&
    redisToken &&
    redisToken !== "your-upstash-redis-token";

  if (hasUpstash) {
    try {
      const redis = new Redis({
        url: redisUrl,
        token: redisToken,
      });

      // 5 requests per 10 minutes
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limitCount, "10 m"),
        analytics: true,
        prefix: `@upstash/ratelimit/securegate/${action}`,
      });

      const { success, limit, remaining, reset } = await ratelimit.limit(ip);
      return { success, limit, remaining, reset };
    } catch (err) {
      console.error("Upstash Redis connection error, falling back to in-memory ratelimit:", err);
    }
  }

  // Fallback: In-memory sliding window rate limiter
  const key = `${action}:${ip}`;
  const now = Date.now();
  
  if (!inMemoryStore.has(key)) {
    inMemoryStore.set(key, { timestamps: [] });
  }

  const record = inMemoryStore.get(key)!;
  
  // Filter out timestamps outside the 10-minute window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length < limitCount) {
    record.timestamps.push(now);
    return {
      success: true,
      limit: limitCount,
      remaining: limitCount - record.timestamps.length,
      reset: now + windowMs,
    };
  }

  // Rate limited
  const oldestTimestamp = record.timestamps[0];
  return {
    success: false,
    limit: limitCount,
    remaining: 0,
    reset: oldestTimestamp + windowMs,
  };
}
