/**
 * 🛡️ ADVANCED RATE LIMITING - REDIS-BACKED WITH UPSTASH
 *
 * Production-grade rate limiting for the Farmers Market Platform
 * Supports both in-memory (development) and Redis (production) storage
 *
 * Features:
 * - Distributed rate limiting via Redis (Upstash)
 * - Sliding window algorithm
 * - IP-based and user-based limiting
 * - Automatic fallback to in-memory store
 * - Multiple rate limit profiles
 * - Request tracking and analytics
 *
 * Architecture:
 * - Development: In-memory LRU cache
 * - Production: Redis via @upstash/ratelimit
 * - Fallback: Graceful degradation if Redis unavailable
 *
 * @reference .cursorrules - Security Enhancement Protocol
 * @reference https://upstash.com/docs/redis/sdks/ratelimit/overview
 */

import { createLogger } from '@/lib/monitoring/logger';
import type { NextRequest } from 'next/server';

// ============================================================================
// LOGGER
// ============================================================================

const logger = createLogger('RateLimit');

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Custom identifier (defaults to IP) */
  identifier?: string;
  /** Skip rate limiting (for testing) */
  skip?: boolean;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of requests remaining in current window */
  remaining: number;
  /** Time until rate limit resets (in milliseconds) */
  resetTime: number;
  /** Current request count */
  current: number;
  /** Maximum requests allowed */
  limit: number;
  /** Whether Redis is being used (vs in-memory) */
  isRedis: boolean;
}

interface InMemoryStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// ============================================================================
// REDIS CLIENT (UPSTASH)
// ============================================================================

let upstashRateLimit: any = null;
let upstashRedis: any = null;
let isRedisAvailable = false;

/**
 * Initialize Redis-backed rate limiter using Upstash
 */
async function initializeRedisRateLimit() {
  // Check if Redis is configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN;

  if (!redisUrl || !redisToken) {
    logger.info('Redis not configured - using in-memory rate limiting');
    return false;
  }

  try {
    // Dynamically import Upstash packages
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');

    // Initialize Redis client
    upstashRedis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    // Test connection
    await upstashRedis.ping();

    // Initialize rate limiter
    upstashRateLimit = new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(10, '1 m'), // Default: 10 requests per minute
      analytics: true,
      prefix: 'ratelimit',
    });

    isRedisAvailable = true;
    logger.info('Redis-backed rate limiting initialized (Upstash)');
    return true;
  } catch (error) {
    logger.warn('Failed to initialize Redis rate limiting, falling back to in-memory', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    isRedisAvailable = false;
    return false;
  }
}

// Initialize on module load
initializeRedisRateLimit();

// ============================================================================
// IN-MEMORY FALLBACK STORE
// ============================================================================

const inMemoryStore: InMemoryStore = {};

// Cleanup old entries every minute (only in non-test environments)
if (process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    const now = Date.now();
    Object.keys(inMemoryStore).forEach((key: any) => {
      const entry = inMemoryStore[key];
      if (entry && entry.resetTime < now) {
        delete inMemoryStore[key];
      }
    });
  }, 60000);
}

/**
 * In-memory rate limiter (fallback)
 */
function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `${identifier}:${config.windowMs}`;

  // Get or create entry
  if (!inMemoryStore[key] || inMemoryStore[key].resetTime < now) {
    inMemoryStore[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    };

    // Handle zero max requests case
    const allowed = config.maxRequests === 0 ? false : true;

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - 1),
      resetTime: config.windowMs,
      current: 1,
      limit: config.maxRequests,
      isRedis: false,
    };
  }

  // Increment count
  inMemoryStore[key].count++;
  const current = inMemoryStore[key].count;
  const allowed = current <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - current);
  const resetTime = inMemoryStore[key].resetTime - now;

  return {
    allowed,
    remaining,
    resetTime,
    current,
    limit: config.maxRequests,
    isRedis: false,
  };
}

/**
 * Redis-backed rate limiter (Upstash)
 */
async function checkRateLimitRedis(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    if (!upstashRateLimit) {
      throw new Error('Upstash rate limiter not initialized');
    }

    // Create custom rate limiter for this config
    const { Ratelimit } = await import('@upstash/ratelimit');
    const customLimiter = new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(
        config.maxRequests,
        `${Math.floor(config.windowMs / 1000)} s`
      ),
      analytics: true,
      prefix: 'ratelimit',
    });

    // Check rate limit
    const result = await customLimiter.limit(identifier);

    return {
      allowed: result.success,
      remaining: result.remaining,
      resetTime: result.reset - Date.now(), // Convert to milliseconds until reset
      current: config.maxRequests - result.remaining,
      limit: config.maxRequests,
      isRedis: true,
    };
  } catch (error) {
    logger.error('Redis rate limit check failed, falling back to in-memory', {
      error: error instanceof Error ? error.message : 'Unknown error',
      identifier,
    });

    // Fallback to in-memory
    return checkRateLimitInMemory(identifier, config);
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Check if a request should be rate limited (async version)
 *
 * Automatically uses Redis if available, falls back to in-memory
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimitAsync(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Skip rate limiting if configured
  if (config.skip || process.env.DISABLE_RATE_LIMITING === 'true') {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: config.windowMs,
      current: 0,
      limit: config.maxRequests,
      isRedis: false,
    };
  }

  // Use Redis if available, otherwise use in-memory
  if (isRedisAvailable) {
    return await checkRateLimitRedis(identifier, config);
  }

  return checkRateLimitInMemory(identifier, config);
}

/**
 * Check if a request should be rate limited (synchronous version)
 *
 * Uses in-memory store only. For async/Redis support, use checkRateLimitAsync
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  if (config.skip || process.env.DISABLE_RATE_LIMITING === 'true') {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: config.windowMs,
      current: 0,
      limit: config.maxRequests,
      isRedis: false,
    };
  }

  return checkRateLimitInMemory(identifier, config);
}

/**
 * Synchronous rate limit check (in-memory only)
 * Use for middleware where async is not supported
 */
export function checkRateLimitSync(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  if (config.skip || process.env.DISABLE_RATE_LIMITING === 'true') {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: config.windowMs,
      current: 0,
      limit: config.maxRequests,
      isRedis: false,
    };
  }

  return checkRateLimitInMemory(identifier, config);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract client IP from Next.js request
 *
 * Checks multiple headers in priority order:
 * 1. X-Forwarded-For (most common behind proxies)
 * 2. X-Real-IP (nginx)
 * 3. CF-Connecting-IP (Cloudflare)
 * 4. request.ip (direct)
 *
 * @param request - Next.js request object
 * @returns Client IP address
 */
export function getClientIp(request: NextRequest): string {
  // Check X-Forwarded-For header
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP if multiple are present
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  // Check X-Real-IP header
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim() ?? 'unknown';
  }

  // Check Cloudflare header
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim() ?? 'unknown';
  }

  // Fallback to unknown if no IP headers found
  return 'unknown';
}

/**
 * Get user identifier for rate limiting
 * Uses user ID if authenticated, otherwise falls back to IP
 *
 * @param request - Next.js request object
 * @param userId - Optional user ID from session
 * @returns Identifier for rate limiting
 */
export function getRateLimitIdentifier(
  request: NextRequest,
  userId?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }

  return `ip:${getClientIp(request)}`;
}

// ============================================================================
// RATE LIMIT PROFILES
// ============================================================================

/**
 * Pre-configured rate limit profiles for common scenarios
 */
export const RateLimitProfiles = {
  /** Strict: 10 requests per hour (sensitive operations) */
  STRICT: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
  },

  /** Standard: 100 requests per minute (API endpoints) */
  STANDARD: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },

  /** Relaxed: 500 requests per minute (read-only endpoints) */
  RELAXED: {
    maxRequests: 500,
    windowMs: 60 * 1000,
  },

  /** Generous: 1000 requests per minute (public content) */
  GENEROUS: {
    maxRequests: 1000,
    windowMs: 60 * 1000,
  },

  /** Authentication: 5 login attempts per 15 minutes */
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  },

  /** Password Reset: 3 attempts per hour */
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
  },

  /** Email Sending: 10 emails per hour */
  EMAIL: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
  },

  /** File Upload: 20 uploads per hour */
  UPLOAD: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000,
  },
} as const;

/**
 * Default rate limit for API routes
 */
export const API_RATE_LIMIT: RateLimitConfig = RateLimitProfiles.STANDARD;

/**
 * Rate limit for login attempts
 */
export const LOGIN_RATE_LIMIT: RateLimitConfig = RateLimitProfiles.AUTH;

/**
 * Rate limit for sensitive operations
 */
export const SENSITIVE_RATE_LIMIT: RateLimitConfig = RateLimitProfiles.STRICT;

// ============================================================================
// RATE LIMIT RESPONSE HELPER
// ============================================================================

/**
 * Create a rate limit exceeded response
 *
 * @param result - Rate limit result
 * @returns NextResponse with 429 status
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil(result.resetTime / 1000); // Convert to seconds

  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toString(),
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}

/**
 * Add rate limit headers to a response
 *
 * @param response - Response to add headers to
 * @param result - Rate limit result
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): void {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

  if (!result.allowed) {
    const retryAfter = Math.ceil(result.resetTime / 1000);
    response.headers.set('Retry-After', retryAfter.toString());
  }
}

/**
 * Check Redis availability status
 */
export function isRedisRateLimitEnabled(): boolean {
  return isRedisAvailable;
}

/**
 * Force re-initialization of Redis connection
 */
export async function reinitializeRedisRateLimit(): Promise<boolean> {
  return await initializeRedisRateLimit();
}

/**
 * Clear all rate limits from in-memory store
 * Useful for testing
 */
export function clearAllRateLimits(): void {
  Object.keys(inMemoryStore).forEach((key: any) => {
    delete inMemoryStore[key];
  });
}

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual intervention
 */
export function resetRateLimit(identifier: string, config: RateLimitConfig): void {
  // Try all possible window sizes since we might not know the exact one
  Object.keys(inMemoryStore).forEach((key: any) => {
    if (key.startsWith(`${identifier}:`)) {
      delete inMemoryStore[key];
    }
  });
}

/**
 * Get current rate limit status for an identifier without incrementing
 * Useful for monitoring or displaying limits to users
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult | null {
  const now = Date.now();
  const key = `${identifier}:${config.windowMs}`;

  const entry = inMemoryStore[key];

  if (!entry || entry.resetTime < now) {
    return null;
  }

  return {
    allowed: entry.count < config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime - now,
    current: entry.count,
    limit: config.maxRequests,
    isRedis: false,
  };
}

/**
 * Divine rate limiting achieved ✨
 * Redis-backed with Upstash for distributed systems
 * Automatic fallback to in-memory for resilience
 * Production-ready with multiple rate limit profiles
 */
