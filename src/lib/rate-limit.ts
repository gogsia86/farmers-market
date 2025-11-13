/**
 * 🛡️ RATE LIMITING UTILITY
 * Protects against brute force attacks and API abuse
 *
 * Features:
 * - IP-based rate limiting
 * - Configurable time windows
 * - Memory storage (upgrade to Redis in production)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production for distributed systems)
const store: RateLimitStore = {};

// Cleanup old entries every minute
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    const entry = store[key];
    if (entry && entry.resetTime < now) {
      delete store[key];
    }
  });
}, 60000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Custom identifier (defaults to IP)
   */
  identifier?: string;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;

  /**
   * Number of requests remaining in current window
   */
  remaining: number;

  /**
   * Time until rate limit resets (in seconds)
   */
  resetTime: number;

  /**
   * Current request count
   */
  current: number;

  /**
   * Maximum requests allowed
   */
  limit: number;
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `${identifier}:${config.windowMs}`;

  // Get or create entry
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    };

    const allowed = 1 <= config.maxRequests;

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - 1),
      resetTime: Math.ceil(config.windowMs / 1000),
      current: 1,
      limit: config.maxRequests,
    };
  }

  // Increment count
  store[key].count++;

  const allowed = store[key].count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - store[key].count);
  const resetTime = Math.ceil((store[key].resetTime - now) / 1000);

  return {
    allowed,
    remaining,
    resetTime,
    current: store[key].count,
    limit: config.maxRequests,
  };
}

/**
 * Middleware helper to get client IP address
 */
export function getClientIp(request: Request): string {
  // Check various headers for the real IP (in case behind proxy/CDN)
  const headers = request.headers;

  return (
    (headers.get("x-forwarded-for")?.split(",")[0] ?? "").trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") || // Cloudflare
    headers.get("x-client-ip") ||
    "unknown"
  );
}

/**
 * Pre-configured rate limit for login attempts
 * 5 attempts per 15 minutes per IP
 */
export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

/**
 * Pre-configured rate limit for API endpoints
 * 100 requests per minute per IP
 */
export const API_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Pre-configured rate limit for sensitive operations
 * 10 requests per hour per user
 */
export const SENSITIVE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
};

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual resets
 */
export function resetRateLimit(identifier: string, windowMs: number): void {
  const key = `${identifier}:${windowMs}`;
  delete store[key];
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult | null {
  const now = Date.now();
  const key = `${identifier}:${config.windowMs}`;

  if (!store[key] || store[key].resetTime < now) {
    return null;
  }

  const remaining = Math.max(0, config.maxRequests - store[key].count);
  const resetTime = Math.ceil((store[key].resetTime - now) / 1000);

  return {
    allowed: store[key].count <= config.maxRequests,
    remaining,
    resetTime,
    current: store[key].count,
    limit: config.maxRequests,
  };
}

/**
 * Clear all rate limit data (for testing)
 */
export function clearAllRateLimits(): void {
  Object.keys(store).forEach((key) => delete store[key]);
}
