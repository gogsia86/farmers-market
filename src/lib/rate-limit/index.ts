/**
 * 🛡️ RATE LIMITING MIDDLEWARE
 * Multi-layer rate limiting with Redis (Upstash) and in-memory fallback
 *
 * Features:
 * - Per-user and per-IP rate limiting
 * - Different limits for different endpoints
 * - Redis-backed for distributed systems
 * - In-memory fallback for development
 * - Cost-aware limits for AI endpoints
 *
 * @module lib/rate-limit
 */

import { createLogger } from "@/lib/utils/logger";
import { NextRequest } from "next/server";

const logger = createLogger("RateLimit");

// ============================================================================
// Types
// ============================================================================

export interface RateLimitConfig {
  uniqueTokenPerInterval: number; // Max unique keys to track
  interval: number; // Time window in milliseconds
  max: number; // Max requests per interval
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp when limit resets
  retryAfter?: number; // Seconds to wait before retry
}

export interface RateLimitOptions {
  identifier?: string; // User ID, IP, or custom identifier
  headers?: boolean; // Include rate limit headers in response
}

// ============================================================================
// Rate Limit Configurations by Endpoint
// ============================================================================

export const RATE_LIMITS = {
  // AI Endpoints (cost-sensitive)
  AI_PRODUCT_DESCRIPTION: {
    interval: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 requests per hour
    uniqueTokenPerInterval: 500,
  } as RateLimitConfig,

  AI_PRICING: {
    interval: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 requests per hour
    uniqueTokenPerInterval: 500,
  } as RateLimitConfig,

  AI_ADVISOR: {
    interval: 60 * 60 * 1000, // 1 hour
    max: 30, // 30 conversations per hour
    uniqueTokenPerInterval: 500,
  } as RateLimitConfig,

  AI_PEST_IDENTIFY: {
    interval: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 image analyses per hour (vision is expensive)
    uniqueTokenPerInterval: 500,
  } as RateLimitConfig,

  // API Endpoints (standard)
  API_DEFAULT: {
    interval: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    uniqueTokenPerInterval: 500,
  } as RateLimitConfig,

  // Authentication endpoints (strict)
  AUTH: {
    interval: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    uniqueTokenPerInterval: 500,
  } as RateLimitConfig,
} as const;

// ============================================================================
// Redis Client (Upstash compatible)
// ============================================================================

let redisClient: any = null;

async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;

  if (!redisUrl) {
    logger.warn("No Redis URL configured, using in-memory rate limiting");
    return null;
  }

  try {
    // Try to use Upstash Redis REST client if available
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const { Redis } = await import("@upstash/redis");
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      logger.info("Using Upstash Redis for rate limiting");
    } else {
      // Fallback to ioredis for standard Redis
      const { default: IORedis } = await import("ioredis");
      redisClient = new IORedis(redisUrl);
      logger.info("Using standard Redis for rate limiting");
    }

    return redisClient;
  } catch (error) {
    logger.error("Failed to initialize Redis client", { error });
    return null;
  }
}

// ============================================================================
// In-Memory Rate Limiter (Fallback)
// ============================================================================

class InMemoryRateLimiter {
  private cache: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  async check(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const resetTime = now + config.interval;

    const existing = this.cache.get(key);

    if (!existing || existing.resetTime < now) {
      // New window or expired
      this.cache.set(key, { count: 1, resetTime });

      return {
        success: true,
        limit: config.max,
        remaining: config.max - 1,
        reset: Math.floor(resetTime / 1000),
      };
    }

    if (existing.count >= config.max) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((existing.resetTime - now) / 1000);

      return {
        success: false,
        limit: config.max,
        remaining: 0,
        reset: Math.floor(existing.resetTime / 1000),
        retryAfter,
      };
    }

    // Increment count
    existing.count += 1;
    this.cache.set(key, existing);

    return {
      success: true,
      limit: config.max,
      remaining: config.max - existing.count,
      reset: Math.floor(existing.resetTime / 1000),
    };
  }

  private cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.cache.entries()) {
      if (value.resetTime < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cleaned up ${cleaned} expired rate limit entries`);
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

const memoryLimiter = new InMemoryRateLimiter();

// ============================================================================
// Redis Rate Limiter
// ============================================================================

async function checkRedisRateLimit(
  redis: any,
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowKey = `ratelimit:${key}`;

  try {
    // Use Redis pipeline for atomic operations
    const results = await redis
      .multi()
      .incr(windowKey)
      .pttl(windowKey)
      .exec();

    const count = results[0][1] as number;
    let ttl = results[1][1] as number;

    // If no TTL is set, set one
    if (ttl === -1) {
      await redis.pexpire(windowKey, config.interval);
      ttl = config.interval;
    }

    const resetTime = now + ttl;

    if (count > config.max) {
      // Rate limit exceeded
      return {
        success: false,
        limit: config.max,
        remaining: 0,
        reset: Math.floor(resetTime / 1000),
        retryAfter: Math.ceil(ttl / 1000),
      };
    }

    return {
      success: true,
      limit: config.max,
      remaining: Math.max(0, config.max - count),
      reset: Math.floor(resetTime / 1000),
    };
  } catch (error) {
    logger.error("Redis rate limit check failed, falling back to memory", { error });
    return memoryLimiter.check(key, config);
  }
}

// ============================================================================
// Main Rate Limiter
// ============================================================================

export class RateLimiter {
  constructor(private config: RateLimitConfig) {}

  async check(
    identifier: string,
    options?: RateLimitOptions
  ): Promise<RateLimitResult> {
    const key = options?.identifier || identifier;
    const redis = await getRedisClient();

    if (redis) {
      return checkRedisRateLimit(redis, key, this.config);
    }

    return memoryLimiter.check(key, this.config);
  }
}

// ============================================================================
// Request Helper Functions
// ============================================================================

/**
 * Extract identifier from request (user ID or IP)
 */
export function getIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from various headers
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "anonymous";

  return `ip:${ip}`;
}

/**
 * Apply rate limit to request
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): Promise<RateLimitResult> {
  const identifier = getIdentifier(request, userId);
  const limiter = new RateLimiter(config);
  const result = await limiter.check(identifier);

  logger.debug("Rate limit check", {
    identifier,
    success: result.success,
    remaining: result.remaining,
    limit: result.limit,
  });

  return result;
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };

  if (result.retryAfter) {
    headers["Retry-After"] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Check rate limit and throw error if exceeded
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): Promise<void> {
  const result = await rateLimit(request, config, userId);

  if (!result.success) {
    const error = new Error("Rate limit exceeded");
    (error as any).statusCode = 429;
    (error as any).rateLimitResult = result;
    throw error;
  }
}

// ============================================================================
// Exports
// ============================================================================

export { memoryLimiter };

// Cleanup on process exit
if (typeof process !== "undefined") {
  process.on("SIGTERM", () => {
    memoryLimiter.destroy();
    if (redisClient) {
      redisClient.quit?.();
    }
  });
}
