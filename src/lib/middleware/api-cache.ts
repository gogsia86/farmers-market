/**
 * ⚡ API CACHE MIDDLEWARE - DIVINE RESPONSE OPTIMIZATION
 *
 * Redis-powered API response caching with agricultural consciousness
 *
 * Divine Patterns Applied:
 * - Stale-while-revalidate for instant responses
 * - Agricultural seasonal awareness (shorter TTL during harvest)
 * - Multi-layer caching (Redis + CDN headers)
 * - Automatic cache invalidation by tags
 * - Performance reality bending (50ms target response time)
 *
 * Features:
 * - GET request caching with smart TTL
 * - Cache-Control header management
 * - ETag generation for conditional requests
 * - Compression-aware caching
 * - Agricultural route awareness
 *
 * @module ApiCacheMiddleware
 */

import type { NextRequest, NextResponse } from "next/server";
import { cacheService, CacheKeys } from "@/lib/cache/cache-service";
import { logger } from "@/lib/monitoring/logger";
import crypto from "crypto";

// ============================================================================
// TYPES
// ============================================================================

interface CacheConfig {
  ttl: number; // Time to live in seconds
  staleWhileRevalidate?: number; // Stale time in seconds
  tags?: string[]; // Cache tags for invalidation
  varyBy?: string[]; // Headers to vary cache by
  seasonal?: boolean; // Agricultural seasonal awareness
}

interface CachedResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
  etag: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: string;
}

// ============================================================================
// CACHE CONFIGURATION BY ROUTE PATTERN
// ============================================================================

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 300, // 5 minutes
  staleWhileRevalidate: 60, // 1 minute stale
  tags: [],
  varyBy: ["accept", "accept-encoding"],
};

/**
 * Route-specific cache configurations
 * Uses agricultural consciousness for seasonal products
 */
const ROUTE_CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Public data - longer cache
  "/api/farms": {
    ttl: 600, // 10 minutes
    staleWhileRevalidate: 120,
    tags: ["farms", "public"],
    seasonal: false,
  },
  "/api/products": {
    ttl: 300, // 5 minutes
    staleWhileRevalidate: 60,
    tags: ["products", "public"],
    seasonal: true, // Shorter TTL during harvest season
  },
  "/api/marketplace": {
    ttl: 300,
    staleWhileRevalidate: 60,
    tags: ["marketplace", "public"],
    seasonal: true,
  },

  // Individual resources - medium cache
  "/api/farms/[id]": {
    ttl: 900, // 15 minutes
    staleWhileRevalidate: 180,
    tags: ["farms"],
  },
  "/api/products/[id]": {
    ttl: 600, // 10 minutes
    staleWhileRevalidate: 120,
    tags: ["products"],
  },

  // Search - shorter cache (dynamic)
  "/api/search": {
    ttl: 180, // 3 minutes
    staleWhileRevalidate: 30,
    tags: ["search", "public"],
  },

  // Dashboard data - very short cache
  "/api/farmer/dashboard": {
    ttl: 60, // 1 minute
    staleWhileRevalidate: 15,
    tags: ["dashboard", "farmer"],
    varyBy: ["authorization"],
  },
  "/api/admin/dashboard": {
    ttl: 30, // 30 seconds
    staleWhileRevalidate: 10,
    tags: ["dashboard", "admin"],
    varyBy: ["authorization"],
  },

  // Stats - medium cache
  "/api/stats": {
    ttl: 300,
    staleWhileRevalidate: 60,
    tags: ["stats", "public"],
  },
};

// ============================================================================
// CACHE STATISTICS
// ============================================================================

class CacheStatsTracker {
  private hits: number = 0;
  private misses: number = 0;

  recordHit(): void {
    this.hits++;
  }

  recordMiss(): void {
    this.misses++;
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(2) : "0.00";

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: `${hitRate}%`,
    };
  }

  reset(): void {
    this.hits = 0;
    this.misses = 0;
  }
}

const statsTracker = new CacheStatsTracker();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate cache key from request
 */
function generateCacheKey(
  request: NextRequest,
  config: CacheConfig
): string {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const searchParams = url.searchParams.toString();

  // Base key
  let key = `api:${pathname}`;

  // Add query params
  if (searchParams) {
    key += `:${searchParams}`;
  }

  // Vary by specific headers
  if (config.varyBy) {
    const varyValues = config.varyBy
      .map((header) => {
        const value = request.headers.get(header);
        return value ? `${header}:${value}` : null;
      })
      .filter(Boolean)
      .join(":");

    if (varyValues) {
      key += `:${varyValues}`;
    }
  }

  return key;
}

/**
 * Generate ETag from response body
 */
function generateETag(body: string): string {
  return `"${crypto.createHash("md5").update(body).digest("hex")}"`;
}

/**
 * Get cache configuration for route
 */
function getCacheConfig(pathname: string): CacheConfig | null {
  // Check exact match first
  if (ROUTE_CACHE_CONFIGS[pathname]) {
    return ROUTE_CACHE_CONFIGS[pathname];
  }

  // Check pattern matches (e.g., /api/farms/[id])
  for (const [pattern, config] of Object.entries(ROUTE_CACHE_CONFIGS)) {
    if (pattern.includes("[id]")) {
      const regex = new RegExp(`^${pattern.replace(/\[id\]/g, "[^/]+")}$`);
      if (regex.test(pathname)) {
        return config;
      }
    }
  }

  return null;
}

/**
 * Calculate seasonal TTL adjustment
 */
function getSeasonalTTL(baseTTL: number): number {
  const month = new Date().getMonth();

  // Harvest months (June-October): Reduce TTL by 50% for freshness
  if (month >= 5 && month <= 9) {
    return Math.floor(baseTTL * 0.5);
  }

  // Off-season: Use base TTL
  return baseTTL;
}

/**
 * Check if request should be cached
 */
function shouldCacheRequest(request: NextRequest): boolean {
  // Only cache GET requests
  if (request.method !== "GET") {
    return false;
  }

  // Don't cache authenticated requests with sensitive data
  const authHeader = request.headers.get("authorization");
  if (authHeader && request.nextUrl.pathname.includes("/orders")) {
    return false;
  }

  // Don't cache if cache-control: no-cache
  const cacheControl = request.headers.get("cache-control");
  if (cacheControl?.includes("no-cache")) {
    return false;
  }

  return true;
}

/**
 * Build Cache-Control header
 */
function buildCacheControlHeader(config: CacheConfig): string {
  const directives = [`max-age=${config.ttl}`, "public"];

  if (config.staleWhileRevalidate) {
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }

  return directives.join(", ");
}

// ============================================================================
// MAIN API CACHE MIDDLEWARE
// ============================================================================

/**
 * API Cache Middleware
 *
 * Caches GET API responses with Redis and sets appropriate HTTP headers
 *
 * @example
 * ```typescript
 * // In API route
 * import { withApiCache } from "@/lib/middleware/api-cache";
 *
 * export const GET = withApiCache(async (request: NextRequest) => {
 *   const data = await fetchData();
 *   return NextResponse.json(data);
 * });
 * ```
 */
export function withApiCache(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const pathname = new URL(request.url).pathname;

    // Check if caching is enabled and applicable
    if (!shouldCacheRequest(request)) {
      return handler(request);
    }

    // Get cache configuration
    const cacheConfig = getCacheConfig(pathname) || DEFAULT_CACHE_CONFIG;

    // Apply seasonal adjustment if configured
    if (cacheConfig.seasonal) {
      cacheConfig.ttl = getSeasonalTTL(cacheConfig.ttl);
    }

    // Generate cache key
    const cacheKey = generateCacheKey(request, cacheConfig);

    // Check for cached response
    const cached = await cacheService.get<CachedResponse>(cacheKey);

    if (cached) {
      // Check ETag for conditional requests
      const ifNoneMatch = request.headers.get("if-none-match");
      if (ifNoneMatch && ifNoneMatch === cached.etag) {
        statsTracker.recordHit();
        return new Response(null, {
          status: 304,
          headers: {
            "X-Cache": "HIT",
            "X-Cache-Key": cacheKey,
            ETag: cached.etag,
          },
        });
      }

      // Return cached response
      statsTracker.recordHit();

      const age = Math.floor((Date.now() - cached.timestamp) / 1000);
      const isStale = age > cacheConfig.ttl;

      return new Response(cached.body, {
        status: cached.status,
        headers: {
          ...cached.headers,
          "X-Cache": isStale ? "STALE" : "HIT",
          "X-Cache-Age": age.toString(),
          "X-Cache-Key": cacheKey,
          Age: age.toString(),
          ETag: cached.etag,
        },
      });
    }

    // Cache miss - execute handler
    statsTracker.recordMiss();
    const response = await handler(request);

    // Cache the response (only if successful)
    if (response.status === 200) {
      try {
        const body = await response.text();
        const etag = generateETag(body);

        const cachedResponse: CachedResponse = {
          status: response.status,
          headers: {
            "Content-Type": response.headers.get("content-type") || "application/json",
            "Cache-Control": buildCacheControlHeader(cacheConfig),
          },
          body,
          timestamp: Date.now(),
          etag,
        };

        // Store in cache
        await cacheService.set(cacheKey, cachedResponse, {
          ttl: cacheConfig.ttl + (cacheConfig.staleWhileRevalidate || 0),
          tags: cacheConfig.tags,
        });

        // Return response with cache headers
        return new Response(body, {
          status: response.status,
          headers: {
            ...cachedResponse.headers,
            "X-Cache": "MISS",
            "X-Cache-Key": cacheKey,
            ETag: etag,
          },
        });
      } catch (error) {
        logger.error("Failed to cache API response", error as Error, {
          pathname,
        });
        return response;
      }
    }

    // Don't cache error responses
    return response;
  };
}

/**
 * Invalidate cache by tag
 *
 * @example
 * ```typescript
 * // After creating a new product
 * await invalidateCacheByTag("products");
 * ```
 */
export async function invalidateCacheByTag(tag: string): Promise<void> {
  try {
    await cacheService.invalidateByTag(tag);
    logger.info("Cache invalidated by tag", { tag });
  } catch (error) {
    logger.error("Failed to invalidate cache by tag", error as Error, { tag });
  }
}

/**
 * Invalidate cache by key pattern
 *
 * @example
 * ```typescript
 * // Invalidate all farm-related caches
 * await invalidateCacheByPattern("api:/api/farms*");
 * ```
 */
export async function invalidateCacheByPattern(pattern: string): Promise<void> {
  try {
    await cacheService.deletePattern(pattern);
    logger.info("Cache invalidated by pattern", { pattern });
  } catch (error) {
    logger.error("Failed to invalidate cache by pattern", error as Error, {
      pattern,
    });
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  return statsTracker.getStats();
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
  statsTracker.reset();
}

// ============================================================================
// EXPORTS
// ============================================================================

export { CacheKeys };
export type { CacheConfig, CachedResponse, CacheStats };
