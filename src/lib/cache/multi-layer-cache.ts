/**
 * MULTI-LAYER CACHE WITH DIVINE CONSCIOUSNESS
 * Hierarchical caching system: Memory → Redis → Database
 */

import { logger } from "../monitoring/logger";

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  layer?: "memory" | "redis" | "all";
  seasonalAware?: boolean;
  agriculturalContext?: string;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  metadata?: {
    season?: string;
    agriculturalContext?: string;
  };
}

class MultiLayerCache {
  // L1: In-Memory Cache (Map-based)
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly maxMemorySize = 1000; // Max entries in memory

  // Default TTLs by layer
  private readonly defaultTTL = {
    memory: 300, // 5 minutes
    redis: 3600, // 1 hour
  };

  /**
   * GET VALUE FROM MULTI-LAYER CACHE
   * Checks L1 → L2 → Returns null
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    // L1: Check memory cache first
    const memoryResult = this.getFromMemory<T>(key);
    if (memoryResult !== null) {
      logger.debug("Cache hit: Memory (L1)", { key });
      return memoryResult;
    }

    // L2: Check Redis cache
    if (options?.layer !== "memory") {
      const redisResult = await this.getFromRedis<T>(key);
      if (redisResult !== null) {
        logger.debug("Cache hit: Redis (L2)", { key });

        // Promote to L1
        this.setInMemory(key, redisResult, this.defaultTTL.memory);
        return redisResult;
      }
    }

    logger.debug("Cache miss: All layers", { key });
    return null;
  }

  /**
   * SET VALUE IN MULTI-LAYER CACHE
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || this.defaultTTL.redis;
    const layer = options?.layer || "all";

    // L1: Memory
    if (layer === "all" || layer === "memory") {
      this.setInMemory(
        key,
        value,
        Math.min(ttl, this.defaultTTL.memory),
        options
      );
    }

    // L2: Redis
    if (layer === "all" || layer === "redis") {
      await this.redisClient.set(key, value, ttl);
    }

    logger.debug("Cache set", { key, layer, ttl });
  }

  /**
   * DELETE FROM ALL CACHE LAYERS
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await redisClient.del(key);
    logger.debug("Cache deleted", { key });
  }

  /**
   * DELETE PATTERN ACROSS ALL LAYERS
   */
  async deletePattern(pattern: string): Promise<void> {
    // Memory: Find matching keys
    const memoryKeys = Array.from(this.memoryCache.keys());
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));

    memoryKeys.forEach((key) => {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    });

    // Redis: Delete pattern
    await redisClient.deletePattern(pattern);

    logger.debug("Cache pattern deleted", { pattern });
  }

  /**
   * GET OR SET (Cache-Aside Pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - generate value
    const value = await factory();

    // Store in cache
    await this.set(key, value, options);

    return value;
  }

  /**
   * SEASONAL CACHE INVALIDATION
   * Invalidate all seasonal caches when season changes
   */
  async invalidateSeasonalCaches(season: string): Promise<void> {
    logger.info("Invalidating seasonal caches", { season });

    // Pattern: Any cache key with seasonal context
    await this.deletePattern("*:seasonal:*");
    await this.deletePattern(`*:${season}:*`);
  }

  /**
   * AGRICULTURAL CACHE INVALIDATION
   * Invalidate farm-specific caches
   */
  async invalidateFarmCaches(farmId: string): Promise<void> {
    logger.info("Invalidating farm caches", { farmId });

    await this.deletePattern(`farm:${farmId}:*`);
    await this.deletePattern(`*:farmId:${farmId}:*`);
  }

  /**
   * CLEAR ALL CACHES (Use with caution!)
   */
  async clearAll(): Promise<void> {
    logger.warn("Clearing all caches");

    this.memoryCache.clear();
    await redisClient.deletePattern("*");
  }

  /**
   * GET CACHE STATISTICS
   */
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      memoryMax: this.maxMemorySize,
      memoryUtilization: (this.memoryCache.size / this.maxMemorySize) * 100,
      redisConnected: redisClient.getConnectionStatus(),
    };
  }

  // ============================================
  // PRIVATE METHODS - L1 Memory Cache
  // ============================================

  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);

    if (!entry) return null;

    // Check expiration
    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl * 1000) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  private setInMemory<T>(
    key: string,
    value: T,
    ttl: number,
    options?: CacheOptions
  ): void {
    // Evict oldest entry if cache is full
    if (this.memoryCache.size >= this.maxMemorySize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl,
      metadata: options?.seasonalAware
        ? {
            season: options.agriculturalContext,
          }
        : undefined,
    };

    this.memoryCache.set(key, entry);
  }

  // ============================================
  // PRIVATE METHODS - L2 Redis Cache
  // ============================================

  private async getFromRedis<T>(key: string): Promise<T | null> {
    return await redisClient.get<T>(key);
  }

  private async setInRedis<T>(
    key: string,
    value: T,
    ttl: number,
    options?: CacheOptions
  ): Promise<void> {
    await redisClient.set(key, value, ttl);
  }
}

// Singleton instance
export const cache = new MultiLayerCache();

// Cache key builders
export const cacheKeys = {
  farm: (id: string) => `farm:${id}`,
  farmProducts: (farmId: string) => `farm:${farmId}:products`,
  farmReviews: (farmId: string) => `farm:${farmId}:reviews`,
  product: (id: string) => `product:${id}`,
  user: (id: string) => `user:${id}`,
  userFarms: (userId: string) => `user:${userId}:farms`,
  userOrders: (userId: string) => `user:${userId}:orders`,
  searchResults: (query: string, filters: string) =>
    `search:${query}:${filters}`,
  seasonalProducts: (season: string, farmId?: string) =>
    farmId
      ? `seasonal:${season}:farm:${farmId}:products`
      : `seasonal:${season}:products`,
};
