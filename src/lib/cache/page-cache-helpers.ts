/**
 * 📄 PAGE CACHE HELPERS
 * Optimized caching strategies for slow-loading pages
 *
 * Features:
 * - Page-level caching with smart TTL
 * - Query parameter normalization
 * - Cache warming strategies
 * - Invalidation patterns
 * - Performance monitoring
 */

import { logger } from "@/lib/logger";
import { cache, CacheKeys, CacheTTL } from "./index";

/**
 * Cache key generator for pages
 */
export class PageCacheKeys {
  /**
   * Browse Farms page with filters
   */
  static browseFarms(filters?: {
    page?: number;
    search?: string;
    state?: string;
    certifications?: string[];
  }): string {
    const normalized = {
      page: filters?.page || 1,
      search: filters?.search?.toLowerCase().trim() || "",
      state: filters?.state || "",
      certifications: filters?.certifications?.sort().join(",") || "",
    };
    return `page:farms:${JSON.stringify(normalized)}`;
  }

  /**
   * Browse Products page with filters
   */
  static browseProducts(filters?: {
    page?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    farmId?: string;
  }): string {
    const normalized = {
      page: filters?.page || 1,
      search: filters?.search?.toLowerCase().trim() || "",
      category: filters?.category || "",
      minPrice: filters?.minPrice || 0,
      maxPrice: filters?.maxPrice || 0,
      farmId: filters?.farmId || "",
    };
    return `page:products:${JSON.stringify(normalized)}`;
  }

  /**
   * FAQ page (static content)
   */
  static faq(): string {
    return "page:faq:content";
  }

  /**
   * About page (static content)
   */
  static about(): string {
    return "page:about:content";
  }

  /**
   * How It Works page (static content)
   */
  static howItWorks(): string {
    return "page:how-it-works:content";
  }

  /**
   * Find Markets page with location
   */
  static findMarkets(location?: {
    lat?: number;
    lng?: number;
    radius?: number;
  }): string {
    if (!location?.lat || !location?.lng) {
      return "page:markets:default";
    }
    return `page:markets:${location.lat},${location.lng}:${location.radius || 25}`;
  }

  /**
   * Homepage data
   */
  static homepage(): string {
    return "page:homepage:data";
  }
}

/**
 * TTL strategies for different page types
 */
export const PageCacheTTL = {
  // Dynamic pages with frequent updates
  BROWSE_FARMS: CacheTTL.MEDIUM, // 30 minutes
  BROWSE_PRODUCTS: CacheTTL.MEDIUM, // 30 minutes
  FIND_MARKETS: CacheTTL.LONG, // 2 hours

  // Semi-static pages
  HOMEPAGE: CacheTTL.SHORT, // 5 minutes (featured content changes)
  FAQ: CacheTTL.DAY, // 24 hours (rarely changes)
  ABOUT: CacheTTL.DAY, // 24 hours
  HOW_IT_WORKS: CacheTTL.DAY, // 24 hours

  // User-specific pages
  DASHBOARD: CacheTTL.SHORT, // 5 minutes
  ORDERS: CacheTTL.SHORT, // 5 minutes
} as const;

/**
 * Page cache service with performance monitoring
 */
export class PageCacheService {
  /**
   * Get cached page data or fetch and cache
   */
  static async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CacheTTL.MEDIUM,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      // Try to get from cache
      const cached = await cache.get<T>(key);

      if (cached !== null) {
        const duration = Date.now() - startTime;
        logger.debug("Page cache hit", {
          key,
          duration,
          durationMs: `${duration}ms`,
          source: "cache",
        });
        return cached;
      }

      // Cache miss - fetch fresh data
      logger.debug("Page cache miss", { key });
      const data = await fetcher();

      // Cache for next time
      await cache.set(key, data, ttl);

      const duration = Date.now() - startTime;
      logger.debug("Page cached", {
        key,
        duration,
        durationMs: `${duration}ms`,
        ttl: `${ttl}s`,
        source: "database",
      });

      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Page cache error", {
        key,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // On error, still try to fetch without caching
      return fetcher();
    }
  }

  /**
   * Invalidate page cache by pattern
   */
  static async invalidate(pattern: string): Promise<void> {
    try {
      await cache.invalidatePattern(pattern);
      logger.info("Page cache invalidated", { pattern });
    } catch (error) {
      logger.error("Page cache invalidation error", {
        pattern,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Invalidate all farm-related pages
   */
  static async invalidateFarmPages(): Promise<void> {
    await this.invalidate("page:farms:*");
    await this.invalidate("page:homepage:*");
    logger.info("Invalidated farm pages cache");
  }

  /**
   * Invalidate all product-related pages
   */
  static async invalidateProductPages(): Promise<void> {
    await this.invalidate("page:products:*");
    await this.invalidate("page:homepage:*");
    logger.info("Invalidated product pages cache");
  }

  /**
   * Warm cache for common pages
   */
  static async warmCache(
    fetchers: Array<{
      key: string;
      fetcher: () => Promise<unknown>;
      ttl: number;
    }>,
  ): Promise<void> {
    logger.info("Warming page cache", { count: fetchers.length });

    const results = await Promise.allSettled(
      fetchers.map(async ({ key, fetcher, ttl }) => {
        try {
          const data = await fetcher();
          await cache.set(key, data, ttl);
          return { key, status: "success" };
        } catch (error) {
          logger.error("Cache warming error", {
            key,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          return { key, status: "error" };
        }
      }),
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    logger.info("Cache warming completed", {
      total: fetchers.length,
      successful,
      failed: fetchers.length - successful,
    });
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    return cache.getStats();
  }
}

/**
 * Decorator for caching page data
 */
export function withPageCache<T>(
  keyGenerator: () => string,
  ttl: number = CacheTTL.MEDIUM,
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator();
      return PageCacheService.getOrFetch<T>(
        key,
        () => originalMethod.apply(this, args),
        ttl,
      );
    };

    return descriptor;
  };
}

/**
 * Helper to cache API responses
 */
export async function cacheApiResponse<T>(
  request: Request,
  fetcher: () => Promise<T>,
  ttl: number = CacheTTL.SHORT,
): Promise<T> {
  const url = new URL(request.url);
  const cacheKey = `api:${url.pathname}:${url.search}`;

  return PageCacheService.getOrFetch(cacheKey, fetcher, ttl);
}

/**
 * React Server Component cache helper
 */
export async function getCachedData<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    tags?: string[];
  } = {},
): Promise<T> {
  const { ttl = CacheTTL.MEDIUM } = options;

  return PageCacheService.getOrFetch(cacheKey, fetcher, ttl);
}

/**
 * Invalidation helpers for common operations
 */
export const InvalidationHelpers = {
  /**
   * Invalidate when a farm is created/updated/deleted
   */
  onFarmChange: async (farmId?: string) => {
    await PageCacheService.invalidateFarmPages();
    if (farmId) {
      await cache.delete(CacheKeys.farm(farmId));
    }
  },

  /**
   * Invalidate when a product is created/updated/deleted
   */
  onProductChange: async (productId?: string, farmId?: string) => {
    await PageCacheService.invalidateProductPages();
    if (productId) {
      await cache.delete(CacheKeys.product(productId));
    }
    if (farmId) {
      await cache.delete(CacheKeys.productsByFarm(farmId));
    }
  },

  /**
   * Invalidate when an order is placed
   */
  onOrderPlaced: async (userId: string) => {
    await cache.delete(CacheKeys.userOrders(userId));
    // Invalidate product inventory caches
    await PageCacheService.invalidateProductPages();
  },

  /**
   * Invalidate user-specific caches
   */
  onUserUpdate: async (userId: string) => {
    await cache.delete(CacheKeys.user(userId));
    await cache.delete(CacheKeys.userSession(userId));
    await cache.delete(CacheKeys.userOrders(userId));
  },
};

/**
 * Example usage in a page:
 *
 * ```typescript
 * import { getCachedData, PageCacheKeys, PageCacheTTL } from '@/lib/cache/page-cache-helpers';
 *
 * export default async function FarmsPage({ searchParams }) {
 *   const farms = await getCachedData(
 *     PageCacheKeys.browseFarms(searchParams),
 *     () => database.farm.findMany({ where: buildWhereClause(searchParams) }),
 *     { ttl: PageCacheTTL.BROWSE_FARMS }
 *   );
 *
 *   return <FarmsGrid farms={farms} />;
 * }
 * ```
 */
