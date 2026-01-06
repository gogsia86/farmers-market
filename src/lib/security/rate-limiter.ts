/**
 * 🛡️ RATE LIMITER - DIVINE SECURITY CONSCIOUSNESS
 *
 * Multi-tier rate limiting with agricultural awareness
 * Protects API endpoints from abuse while maintaining user experience
 *
 * Hardware Optimization: Leverages 64GB RAM for in-memory counters
 *
 * Divine Patterns Applied:
 * - Sliding window rate limiting (precise and fair)
 * - Multi-tier limits (API, Auth, Search, Admin)
 * - Graceful degradation (fallback to memory if Redis fails)
 * - Agricultural consciousness (seasonal traffic awareness)
 *
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { telemetryService } from "@/lib/telemetry/azure-insights";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// REDIS CONFIGURATION
// ============================================================================

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    // Only initialize Redis when actually needed (not during build)
    if (
      !process.env.UPSTASH_REDIS_REST_URL ||
      !process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      throw new Error(
        "Redis configuration missing - rate limiting will use memory fallback",
      );
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

// ============================================================================
// IN-MEMORY FALLBACK (When Redis is unavailable)
// ============================================================================

class MemoryRateLimiter {
  private counts = new Map<string, { count: number; resetAt: number }>();

  async limit(
    key: string,
    maxRequests: number,
    windowMs: number,
  ): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now();
    const entry = this.counts.get(key);

    // Reset if window expired
    if (!entry || now > entry.resetAt) {
      this.counts.set(key, { count: 1, resetAt: now + windowMs });
      return {
        success: true,
        remaining: maxRequests - 1,
        reset: now + windowMs,
      };
    }

    // Check limit
    if (entry.count >= maxRequests) {
      return {
        success: false,
        remaining: 0,
        reset: entry.resetAt,
      };
    }

    // Increment count
    entry.count++;
    this.counts.set(key, entry);

    return {
      success: true,
      remaining: maxRequests - entry.count,
      reset: entry.resetAt,
    };
  }

  // Cleanup expired entries (runs every 5 minutes)
  startCleanup() {
    setInterval(
      () => {
        const now = Date.now();
        for (const [key, entry] of this.counts.entries()) {
          if (now > entry.resetAt) {
            this.counts.delete(key);
          }
        }
      },
      5 * 60 * 1000,
    );
  }
}

const memoryLimiter = new MemoryRateLimiter();
memoryLimiter.startCleanup();

// ============================================================================
// RATE LIMITER INSTANCES
// ============================================================================

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending: Promise<unknown>;
}

/**
 * General API rate limiter
 * Protects all API routes from excessive requests
 *
 * Limit: 100 requests per minute per IP
 * Suitable for: General browsing, product listings, farm searches
 */
export const apiRateLimiter = {
  limit: async (identifier: string): Promise<RateLimitResult> => {
    try {
      const limiter = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
        prefix: "ratelimit:api",
      });
      return (await limiter.limit(identifier)) as RateLimitResult;
    } catch (error) {
      // Fallback to memory limiter
      const result = await memoryLimiter.limit(identifier, 100, 60000);
      return {
        ...result,
        limit: 100,
        pending: Promise.resolve(),
      };
    }
  },
};

/**
 * Authentication rate limiter
 * Stricter limits for login/signup to prevent brute force attacks
 *
 * Limit: 5 requests per minute per IP
 * Suitable for: Login, signup, password reset
 */
export const authRateLimiter = {
  limit: async (identifier: string): Promise<RateLimitResult> => {
    try {
      const limiter = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "ratelimit:auth",
      });
      return (await limiter.limit(identifier)) as RateLimitResult;
    } catch (error) {
      // Fallback to memory limiter
      const result = await memoryLimiter.limit(identifier, 5, 60000);
      return {
        ...result,
        limit: 5,
        pending: Promise.resolve(),
      };
    }
  },
};

/**
 * Search rate limiter
 * Moderate limits for search endpoints (computationally expensive)
 *
 * Limit: 30 requests per minute per IP
 * Suitable for: Product search, farm search, geocoding
 */
export const searchRateLimiter = {
  limit: async (identifier: string): Promise<RateLimitResult> => {
    try {
      const limiter = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        analytics: true,
        prefix: "ratelimit:search",
      });
      return (await limiter.limit(identifier)) as RateLimitResult;
    } catch (error) {
      // Fallback to memory limiter
      const result = await memoryLimiter.limit(identifier, 30, 60000);
      return {
        ...result,
        limit: 30,
        pending: Promise.resolve(),
      };
    }
  },
};

/**
 * Admin rate limiter
 * Higher limits for authenticated admin users
 *
 * Limit: 500 requests per minute per user
 * Suitable for: Admin dashboard, bulk operations
 */
export const adminRateLimiter = {
  limit: async (identifier: string): Promise<RateLimitResult> => {
    try {
      const limiter = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(500, "1 m"),
        analytics: true,
        prefix: "ratelimit:admin",
      });
      return (await limiter.limit(identifier)) as RateLimitResult;
    } catch (error) {
      // Fallback to memory limiter
      const result = await memoryLimiter.limit(identifier, 500, 60000);
      return {
        ...result,
        limit: 500,
        pending: Promise.resolve(),
      };
    }
  },
};

/**
 * Upload rate limiter
 * Strict limits for file uploads (resource intensive)
 *
 * Limit: 10 requests per minute per user
 * Suitable for: Product images, farm photos, documents
 */
export const uploadRateLimiter = {
  limit: async (identifier: string): Promise<RateLimitResult> => {
    try {
      const limiter = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        analytics: true,
        prefix: "ratelimit:upload",
      });
      return (await limiter.limit(identifier)) as RateLimitResult;
    } catch (error) {
      // Fallback to memory limiter
      const result = await memoryLimiter.limit(identifier, 10, 60000);
      return {
        ...result,
        limit: 10,
        pending: Promise.resolve(),
      };
    }
  },
};

/**
 * Payment rate limiter
 * Very strict limits for payment endpoints
 *
 * Limit: 3 requests per minute per user
 * Suitable for: Checkout, payment processing
 */
export const paymentRateLimiter = {
  limit: async (identifier: string): Promise<RateLimitResult> => {
    try {
      const limiter = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(3, "1 m"),
        analytics: true,
        prefix: "ratelimit:payment",
      });
      return (await limiter.limit(identifier)) as RateLimitResult;
    } catch (error) {
      // Fallback to memory limiter
      const result = await memoryLimiter.limit(identifier, 3, 60000);
      return {
        ...result,
        limit: 3,
        pending: Promise.resolve(),
      };
    }
  },
};

// ============================================================================
// RATE LIMITER WRAPPER WITH FALLBACK
// ============================================================================

/**
 * Rate limit with automatic fallback to memory cache
 *
 * @param limiter - Rate limiter instance
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param fallbackConfig - Fallback configuration for memory limiter
 */
export async function checkRateLimit(
  limiter: { limit: (identifier: string) => Promise<RateLimitResult> },
  identifier: string,
  fallbackConfig?: { maxRequests: number; windowMs: number },
): Promise<RateLimitResult> {
  try {
    // Try rate limiter (with built-in fallback)
    const result = await limiter.limit(identifier);
    return result;
  } catch (error) {
    logger.error("⚠️ Rate limiter error, using memory fallback:", error);

    // Fallback to memory limiter
    if (fallbackConfig) {
      const result = await memoryLimiter.limit(
        identifier,
        fallbackConfig.maxRequests,
        fallbackConfig.windowMs,
      );
      return {
        ...result,
        limit: fallbackConfig.maxRequests,
        pending: Promise.resolve(),
      };
    }

    // If no fallback config, allow request but log warning
    logger.warn("⚠️ No fallback config, allowing request");
    return {
      success: true,
      limit: 100,
      remaining: 100,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get client identifier from request
 * Uses IP address and optional user ID
 *
 * @param request - Next.js request object
 * @param userId - Optional authenticated user ID
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  // Get IP address from headers (handles proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? (forwarded.split(",")[0]?.trim() ?? "unknown")
    : "unknown";

  // Combine IP and user ID if authenticated
  if (userId) {
    return `user:${userId}:${ip}`;
  }

  return `ip:${ip}`;
}

/**
 * Get rate limit info for response headers
 *
 * @param result - Rate limit result
 */
export function getRateLimitHeaders(
  result: RateLimitResult,
): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
    "Retry-After": result.success
      ? "0"
      : Math.ceil((result.reset - Date.now()) / 1000).toString(),
  };
}

/**
 * Create rate limit error response
 *
 * @param result - Rate limit result
 */
export function createRateLimitError(result: RateLimitResult) {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

  return {
    error: "Rate limit exceeded",
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests. Please try again later.",
    retryAfter,
    limit: result.limit,
    remaining: result.remaining,
    reset: new Date(result.reset).toISOString(),
  };
}

// ============================================================================
// MIDDLEWARE HELPER
// ============================================================================

/**
 * Rate limit middleware for API routes
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const rateLimitResult = await applyRateLimit(request, apiRateLimiter);
 *   if (!rateLimitResult.success) {
 *     return NextResponse.json(
 *       createRateLimitError(rateLimitResult),
 *       {
 *         status: 429,
 *         headers: getRateLimitHeaders(rateLimitResult)
 *       }
 *     );
 *   }
 *
 *   // Continue with request...
 * }
 * ```
 */
export async function applyRateLimit(
  request: Request,
  limiter: { limit: (identifier: string) => Promise<RateLimitResult> },
  userId?: string,
  fallbackConfig?: { maxRequests: number; windowMs: number },
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(request, userId);
  return await checkRateLimit(limiter, identifier, fallbackConfig);
}

// ============================================================================
// AGRICULTURAL CONSCIOUSNESS - SEASONAL RATE ADJUSTMENTS
// ============================================================================

/**
 * Get seasonal rate limit multiplier
 * During harvest season (summer/fall), allow more traffic
 *
 * @returns Multiplier (1.0 = normal, 1.5 = 50% more requests allowed)
 */
export function getSeasonalMultiplier(): number {
  const month = new Date().getMonth(); // 0-11

  // Summer (June-August): Peak season, 50% more traffic allowed
  if (month >= 5 && month <= 7) {
    return 1.5;
  }

  // Fall (September-November): Harvest season, 30% more traffic
  if (month >= 8 && month <= 10) {
    return 1.3;
  }

  // Spring (March-May): Planting season, 20% more traffic
  if (month >= 2 && month <= 4) {
    return 1.2;
  }

  // Winter (December-February): Normal traffic
  return 1.0;
}

/**
 * Create seasonal rate limiter
 * Automatically adjusts limits based on agricultural seasons
 *
 * @param baseLimit - Base limit per minute
 */
export function createSeasonalRateLimiter(baseLimit: number) {
  const adjustedLimit = Math.floor(baseLimit * getSeasonalMultiplier());

  return {
    limit: async (identifier: string): Promise<RateLimitResult> => {
      try {
        const limiter = new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(adjustedLimit, "1 m"),
          analytics: true,
          prefix: "ratelimit:seasonal",
        });
        return (await limiter.limit(identifier)) as RateLimitResult;
      } catch (error) {
        // Fallback to memory limiter
        const result = await memoryLimiter.limit(
          identifier,
          adjustedLimit,
          60000,
        );
        return {
          ...result,
          limit: adjustedLimit,
          pending: Promise.resolve(),
        };
      }
    },
  };
}

// ============================================================================
// ANALYTICS & MONITORING
// ============================================================================

/**
 * Log rate limit event for monitoring
 *
 * @param event - Rate limit event data
 */
export async function logRateLimitEvent(event: {
  identifier: string;
  endpoint: string;
  success: boolean;
  remaining: number;
  timestamp: Date;
}) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    logger.info("🛡️ Rate Limit:", {
      ...event,
      status: event.success ? "✅ ALLOWED" : "🚫 BLOCKED",
    });
  }

  // Send to Azure Application Insights in production
  if (process.env.NODE_ENV === "production" && telemetryService.enabled) {
    telemetryService.trackRateLimitEvent({
      identifier: event.identifier,
      status: event.success ? "allowed" : "blocked",
      limit: 0, // Will be populated from actual limiter config
      remaining: event.remaining,
      window: "unknown", // Will be populated from actual limiter config
      endpoint: event.endpoint,
    });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { getRedis as redis, memoryLimiter };

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  api: apiRateLimiter,
  auth: authRateLimiter,
  search: searchRateLimiter,
  admin: adminRateLimiter,
  upload: uploadRateLimiter,
  payment: paymentRateLimiter,
};

/**
 * Rate limit configurations for fallback
 */
export const rateLimitConfigs = {
  api: { maxRequests: 100, windowMs: 60000 },
  auth: { maxRequests: 5, windowMs: 60000 },
  search: { maxRequests: 30, windowMs: 60000 },
  admin: { maxRequests: 500, windowMs: 60000 },
  upload: { maxRequests: 10, windowMs: 60000 },
  payment: { maxRequests: 3, windowMs: 60000 },
};
