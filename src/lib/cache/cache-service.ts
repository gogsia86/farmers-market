/**
 * 🚀 REDIS CACHE SERVICE
 * Multi-layer caching with Redis and in-memory fallback
 * Agricultural-aware TTLs and seasonal invalidation
 */

import { logger } from '@/lib/monitoring/logger';
import { redisClient } from "./redis-client";
import type {
  CacheKey,
  CacheOptions,
  CacheStats,
  CacheValue,
  ICacheService,
} from "./types";

export class CacheService implements ICacheService {
  private enabled: boolean = true;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
  };
  private logger = logger;
  private keyPrefix: string = "fm:";

  constructor() {
    this.initialize();
  }

  /**
   * Initialize cache service
   */
  private async initialize(): Promise<void> {
    try {
      const isConnected = redisClient.getConnectionStatus();
      if (isConnected) {
        this.logger.info("✅ Cache: Redis connected successfully");
      } else {
        this.logger.warn(
          "⚠️ Cache: Redis not connected, cache operations may be limited",
        );
      }
    } catch (error) {
      this.logger.error(
        "⚠️ Cache: Initialization failed, cache disabled",
        error as Error,
      );
      this.enabled = false;
    }
  }

  /**
   * Get item from cache
   */
  async get<T = CacheValue>(key: CacheKey): Promise<T | null> {
    if (!this.enabled) return null;

    try {
      const fullKey = this.buildKey(key);
      const value = await redisClient.get<T>(fullKey);

      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return value;
    } catch (error) {
      this.stats.errors++;
      this.logger.error("Cache get error", {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Set item in cache
   */
  async set(
    key: CacheKey,
    value: CacheValue,
    options?: CacheOptions,
  ): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const fullKey = this.buildKey(key);
      const ttl = this.calculateTTL(options);

      const success = await redisClient.set(fullKey, value, ttl);

      if (success) {
        this.stats.sets++;
      }

      return success;
    } catch (error) {
      this.stats.errors++;
      this.logger.error("Cache set error", {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Delete item from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const fullKey = this.buildKey(key);
      await redisClient.delete(fullKey);
      this.stats.deletes++;
      this.logger.debug("Cache key deleted", { key });
      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger.error("Cache delete failed", {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Delete pattern from cache
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.enabled) return 0;

    try {
      const fullPattern = this.buildKey(pattern);
      const deleted = await redisClient.deletePattern(fullPattern);
      this.stats.deletes += deleted;
      this.logger.debug("Cache pattern deleted", { pattern, count: deleted });
      return deleted;
    } catch (error) {
      this.stats.errors++;
      this.logger.error("Cache deletePattern failed", {
        pattern,
        error: error instanceof Error ? error.message : String(error)
      });
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: CacheKey): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const fullKey = this.buildKey(key);
      return await redisClient.exists(fullKey);
    } catch (error) {
      this.stats.errors++;
      this.logger.error("Cache exists check failed", {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Clear all cache or pattern
   */
  async clear(pattern?: string): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      if (pattern) {
        await this.deletePattern(pattern);
      } else {
        await this.deletePattern("*");
      }

      this.logger.info("Cache cleared", { pattern: pattern || "all" });
      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger.error("Cache clear error", {
        pattern,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTag(tag: string): Promise<void> {
    try {
      const pattern = `*:tag:${tag}:*`;
      await this.deletePattern(pattern);
      this.logger.info("Cache invalidated by tag", { tag });
    } catch (error) {
      this.logger.error("Tag invalidation failed", {
        tag,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      redisConnected: redisClient.getConnectionStatus().connected,
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Build full cache key with prefix
   */
  private buildKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Calculate TTL based on options and season
   */
  private calculateTTL(options?: CacheOptions): number {
    if (options?.ttl) return options.ttl;

    if (options?.seasonal) {
      return this.getSeasonalTTL();
    }

    // Default TTL: 5 minutes
    return 300;
  }

  /**
   * Get seasonal TTL (shorter during harvest season)
   */
  private getSeasonalTTL(): number {
    const month = new Date().getMonth();

    // Harvest months (June-October): Shorter TTL for freshness
    if (month >= 5 && month <= 9) {
      return 60; // 1 minute
    }

    // Off-season: Longer TTL
    return 600; // 10 minutes
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const cacheService = new CacheService();

// ============================================
// CACHE KEY BUILDERS
// ============================================

export const CacheKeys = {
  product: (id: string): string => `product:${id}`,
  products: (filters?: Record<string, unknown>): string =>
    `products:${JSON.stringify(filters || {})}`,
  farm: (id: string): string => `farm:${id}`,
  farms: (filters?: Record<string, unknown>): string =>
    `farms:${JSON.stringify(filters || {})}`,
  user: (id: string): string => `user:${id}`,
  orders: (userId: string): string => `orders:${userId}`,
  search: (query: string, type?: string): string =>
    `search:${query}:${type || "all"}`,
  dashboard: (userId: string): string => `dashboard:${userId}`,
};

// ============================================
// CACHE TAGS FOR INVALIDATION
// ============================================

export const CacheTags = {
  PRODUCTS: "products",
  FARMS: "farms",
  USERS: "users",
  ORDERS: "orders",
  SEARCH: "search",
} as const;
