/**
 * 🎯 MIDDLEWARE EXPORTS - DIVINE REQUEST PROCESSING
 *
 * Centralized middleware exports for the Farmers Market Platform
 *
 * Available Middleware:
 * - API Caching: Redis-powered response caching with stale-while-revalidate
 * - Compression: Brotli/Gzip compression for bandwidth optimization
 * - Rate Limiting: Request rate limiting (from rate-limiter.ts)
 * - Route Configuration: RBAC and route protection utilities
 *
 * Usage:
 * ```typescript
 * import { withApiCache, withCompression } from "@/lib/middleware";
 *
 * export const GET = withApiCache(
 *   withCompression(async (request) => {
 *     // Your handler logic
 *   })
 * );
 * ```
 *
 * @module Middleware
 */

// ============================================================================
// API CACHE MIDDLEWARE
// ============================================================================

export {
  CacheKeys,
  getCacheStats,
  invalidateCacheByPattern,
  invalidateCacheByTag,
  resetCacheStats,
  withApiCache,
} from "./api-cache";

export type { CacheConfig, CachedResponse, CacheStats } from "./api-cache";

// Import for use in this file
import type { CompressionConfig } from "./compression";

// ============================================================================
// COMPRESSION MIDDLEWARE
// ============================================================================

export {
  createCompressedResponse,
  getCompressionStats,
  resetCompressionStats,
  withCompression,
} from "./compression";

export type {
  CompressionAlgorithm,
  CompressionConfig,
  CompressionStats,
} from "./compression";

// ============================================================================
// RATE LIMITING
// ============================================================================

export {
  addRateLimitHeaders,
  createRateLimitResponse,
  rateLimiters,
  withRateLimit,
} from "./rate-limiter";
export type { RateLimitConfig, RateLimitResult } from "./rate-limiter";

// ============================================================================
// ROUTE CONFIGURATION & RBAC
// ============================================================================

export {
  API_ROUTES,
  AUTH_ROUTES,
  getAccessDeniedUrl,
  getDefaultRedirectUrl,
  getLoginUrl,
  getRequiredRoles,
  hasRequiredRole,
  isActionRestricted,
  isAgriculturalRoute,
  isApiRoute,
  isAuthRoute,
  // Helper functions
  isPublicRoute,
  isSystemRoute,
  PROTECTED_ROUTES,
  // Route arrays
  PUBLIC_ROUTES,
  RESTRICTED_ACTIONS,
  SYSTEM_ROUTES,
} from "./route-config";

// ============================================================================
// MIDDLEWARE COMPOSITION UTILITIES
// ============================================================================

/**
 * Compose multiple middleware functions into one
 *
 * @example
 * ```typescript
 * const composedMiddleware = composeMiddleware(
 *   withApiCache,
 *   withCompression
 * );
 *
 * export const GET = composedMiddleware(async (request) => {
 *   return NextResponse.json({ data: "Hello" });
 * });
 * ```
 */
export function composeMiddleware<T extends (...args: any[]) => any>(
  ...middlewares: Array<(handler: T) => T>
): (handler: T) => T {
  return (handler: T): T => {
    return middlewares.reduceRight(
      (composed, middleware) => middleware(composed),
      handler,
    ) as T;
  };
}

/**
 * Middleware configuration presets for common use cases
 */
export const MIDDLEWARE_PRESETS = {
  /**
   * Optimized for public API endpoints
   * - Cache enabled (10 min)
   * - Compression enabled
   */
  publicApi: {
    cache: {
      ttl: 600,
      staleWhileRevalidate: 120,
      tags: ["public"],
    },
    compression: {
      threshold: 1024,
      level: 6,
    },
  },

  /**
   * Optimized for private/authenticated API endpoints
   * - Cache enabled (1 min)
   * - Compression enabled
   * - Vary by authorization header
   */
  privateApi: {
    cache: {
      ttl: 60,
      staleWhileRevalidate: 15,
      tags: ["private"],
      varyBy: ["authorization"],
    },
    compression: {
      threshold: 512,
      level: 4,
    },
  },

  /**
   * Optimized for static content
   * - Long cache (1 hour)
   * - Aggressive compression
   */
  static: {
    cache: {
      ttl: 3600,
      staleWhileRevalidate: 600,
      tags: ["static"],
    },
    compression: {
      threshold: 512,
      level: 9,
    },
  },

  /**
   * Optimized for dynamic content
   * - Short cache (30 sec)
   * - Fast compression
   */
  dynamic: {
    cache: {
      ttl: 30,
      staleWhileRevalidate: 10,
      tags: ["dynamic"],
    },
    compression: {
      threshold: 1024,
      level: 3,
    },
  },

  /**
   * No caching, only compression
   */
  compressionOnly: {
    cache: null,
    compression: {
      threshold: 1024,
      level: 6,
    },
  },
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Check if middleware feature is enabled via environment variables
 */
export function isMiddlewareEnabled(feature: "cache" | "compression"): boolean {
  const envVar = `ENABLE_${feature.toUpperCase()}_MIDDLEWARE`;
  const value = process.env[envVar];

  // Default to disabled for now (opt-in)
  if (value === undefined) {
    return false;
  }

  return value === "true" || value === "1";
}

/**
 * Conditionally apply middleware based on feature flags
 *
 * @example
 * ```typescript
 * export const GET = applyMiddleware(
 *   async (request) => NextResponse.json({ data: "Hello" }),
 *   { cache: true, compression: true }
 * );
 * ```
 */
export function applyMiddleware<T extends (...args: any[]) => any>(
  handler: T,
  options: {
    cache?: boolean;
    compression?: boolean | Partial<CompressionConfig>;
  } = {},
): T {
  let wrapped = handler;

  // Apply cache middleware if enabled
  if (options.cache && isMiddlewareEnabled("cache")) {
    // Import withApiCache locally to avoid circular deps
    const { withApiCache: cacheMiddleware } = require("./api-cache");
    wrapped = cacheMiddleware(wrapped) as T;
  }

  // Apply compression middleware if enabled
  if (options.compression && isMiddlewareEnabled("compression")) {
    const compressionConfig =
      typeof options.compression === "object" ? options.compression : undefined;
    // Import withCompression locally to avoid circular deps
    const { withCompression: compressionMiddleware } = require("./compression");
    wrapped = compressionMiddleware(wrapped, compressionConfig) as T;
  }

  return wrapped;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Re-export UserRole from route-config for convenience
export type { UserRole } from "@/types/core-entities";
