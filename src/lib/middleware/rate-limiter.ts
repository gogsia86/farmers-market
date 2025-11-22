/**
 * RATE LIMITING MIDDLEWARE
 * Divine protection against API abuse with Redis-based distributed tracking
 *
 * Features:
 * - Redis-based distributed rate limiting
 * - In-memory fallback when Redis unavailable
 * - Configurable time windows and limits
 * - IP-based and user-based tracking
 * - Rate limit headers (X-RateLimit-*)
 */

import { NextRequest, NextResponse } from "next/server";
import { redisClient } from "@/lib/cache/redis-client";

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string; // Redis key prefix
  message?: string; // Custom error message
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in milliseconds
  retryAfter?: number; // Seconds until reset
}

/**
 * Rate Limiter Class
 * Handles rate limiting with Redis (distributed) or memory (single instance)
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private memoryStore = new Map<string, number[]>();

  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: "rl",
      message: "Too many requests, please try again later",
      ...config,
    };
  }

  /**
   * Check if request is within rate limit
   */
  async check(request: NextRequest): Promise<RateLimitResult> {
    const identifier = this.getIdentifier(request);
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Try Redis first (distributed rate limiting)
    if (redisClient.getConnectionStatus()) {
      return await this.checkWithRedis(key, now, windowStart);
    }

    // Fallback to memory (single instance only)
    return this.checkWithMemory(key, now, windowStart);
  }

  /**
   * Check rate limit using Redis (distributed)
   */
  private async checkWithRedis(
    key: string,
    now: number,
    windowStart: number,
  ): Promise<RateLimitResult> {
    try {
      // Redis sorted set approach - stores timestamps as scores
      const redisKey = `rate_limit:${key}`;

      // Remove old entries outside the time window
      // Note: We'll use a simple counter approach for now
      const countKey = `${redisKey}:count`;
      const resetKey = `${redisKey}:reset`;

      // Get current count
      const currentCountStr = await redisClient.get<string>(countKey);
      const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;

      // Get reset time
      const resetTimeStr = await redisClient.get<string>(resetKey);
      const resetTime = resetTimeStr ? parseInt(resetTimeStr, 10) : now + this.config.windowMs;

      // If reset time has passed, reset the counter
      if (now >= resetTime) {
        await redisClient.set(countKey, "1", Math.ceil(this.config.windowMs / 1000));
        const newResetTime = now + this.config.windowMs;
        await redisClient.set(resetKey, newResetTime.toString(), Math.ceil(this.config.windowMs / 1000));

        return {
          success: true,
          limit: this.config.maxRequests,
          remaining: this.config.maxRequests - 1,
          reset: newResetTime,
        };
      }

      // Check if limit exceeded
      if (currentCount >= this.config.maxRequests) {
        const retryAfter = Math.ceil((resetTime - now) / 1000);

        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          reset: resetTime,
          retryAfter,
        };
      }

      // Increment counter
      const newCount = currentCount + 1;
      await redisClient.set(countKey, newCount.toString(), Math.ceil(this.config.windowMs / 1000));

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - newCount,
        reset: resetTime,
      };
    } catch (error) {
      console.error("Redis rate limit error:", error);
      // Fallback to memory on Redis error
      return this.checkWithMemory(key, now, windowStart);
    }
  }

  /**
   * Check rate limit using in-memory storage (single instance)
   */
  private checkWithMemory(
    key: string,
    now: number,
    windowStart: number,
  ): RateLimitResult {
    // Get existing timestamps for this key
    const timestamps = this.memoryStore.get(key) || [];

    // Remove timestamps outside the time window
    const validTimestamps = timestamps.filter((ts) => ts > windowStart);

    // Check if limit exceeded
    if (validTimestamps.length >= this.config.maxRequests) {
      const oldestTimestamp = validTimestamps[0];
      const resetTime = oldestTimestamp + this.config.windowMs;
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        reset: resetTime,
        retryAfter,
      };
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.memoryStore.set(key, validTimestamps);

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      this.cleanupMemoryStore(windowStart);
    }

    return {
      success: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - validTimestamps.length,
      reset: now + this.config.windowMs,
    };
  }

  /**
   * Get identifier for rate limiting (IP or user ID)
   */
  private getIdentifier(request: NextRequest): string {
    // Try to get user ID from headers (set by auth middleware)
    const userId = request.headers.get("x-user-id");
    if (userId) {
      return `user:${userId}`;
    }

    // Fall back to IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip") ||
               request.ip ||
               "unknown";

    return `ip:${ip}`;
  }

  /**
   * Clean up old entries from memory store
   */
  private cleanupMemoryStore(windowStart: number): void {
    for (const [key, timestamps] of this.memoryStore.entries()) {
      const validTimestamps = timestamps.filter((ts) => ts > windowStart);
      if (validTimestamps.length === 0) {
        this.memoryStore.delete(key);
      } else {
        this.memoryStore.set(key, validTimestamps);
      }
    }
  }

  /**
   * Clear all rate limit data (for testing)
   */
  clear(): void {
    this.memoryStore.clear();
  }
}

/**
 * Preset rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict - Very limited (for sensitive operations)
  strict: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    keyPrefix: "rl:strict",
    message: "Too many requests to sensitive endpoint",
  }),

  // Auth - Login/signup attempts
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: "rl:auth",
    message: "Too many authentication attempts",
  }),

  // API - General API endpoints
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyPrefix: "rl:api",
    message: "API rate limit exceeded",
  }),

  // Public - Public endpoints (more lenient)
  public: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    keyPrefix: "rl:public",
    message: "Rate limit exceeded",
  }),
};

/**
 * Create rate limit response with proper headers
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  message?: string,
): NextResponse {
  const response = NextResponse.json(
    {
      error: message || "Too many requests",
      retryAfter: result.retryAfter,
    },
    { status: 429 },
  );

  // Add rate limit headers
  response.headers.set("X-RateLimit-Limit", result.limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset.toString());

  if (result.retryAfter) {
    response.headers.set("Retry-After", result.retryAfter.toString());
  }

  return response;
}

/**
 * Add rate limit headers to successful response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
): NextResponse {
  response.headers.set("X-RateLimit-Limit", result.limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset.toString());
  return response;
}

/**
 * Rate limit middleware wrapper for API routes
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const rateLimit = await rateLimiters.api.check(request);
 *   if (!rateLimit.success) {
 *     return createRateLimitResponse(rateLimit);
 *   }
 *   // Process request...
 * }
 */
export async function withRateLimit(
  request: NextRequest,
  limiter: RateLimiter,
  handler: (request: NextRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  const result = await limiter.check(request);

  if (!result.success) {
    return createRateLimitResponse(result);
  }

  const response = await handler(request);
  return addRateLimitHeaders(response, result);
}
