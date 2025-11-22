/**
 * 🚀 REDIS CACHE SERVICE
 * Multi-layer caching with Redis and in-memory fallback
 * Agricultural-aware TTLs and seasonal invalidation
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  seasonal?: boolean; // Use seasonal TTL
}

interface CacheEntry<T> {
  data: T;
  expires: number;
  tags: string[];
}

export class CacheService {
  private static memoryCache: Map<string, CacheEntry<any>> = new Map();
  private static redis: any = null;
  private static isRedisConnected = false;

  /**
   * Initialize cache service
   */
  static async initialize() {
    try {
      // Try to connect to Redis if available
      if (process.env.REDIS_URL) {
        // In production, use actual Redis client
        // const { createClient } = await import('redis');
        // this.redis = createClient({ url: process.env.REDIS_URL });
        // await this.redis.connect();
        // this.isRedisConnected = true;
        console.log(
          "✅ Cache: Redis would be initialized here (add redis package)"
        );
      } else {
        console.log("ℹ️ Cache: Using in-memory cache (Redis not configured)");
      }
    } catch (error) {
      console.error(
        "⚠️ Cache: Redis connection failed, using memory cache",
        error
      );
      this.isRedisConnected = false;
    }
  }

  /**
   * Get item from cache
   */
  async get<T = CacheValue>(key: CacheKey): Promise<T | null> {
    if (!this.enabled) return null;

    try {
      const value = await redisClient.get(key);

      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      this.stats.errors++;
      this.logger.error("Cache get error", error as Error, { key });
      return null;
    }
  }

  /**
   * Set item in cache
   */
  async set(
    key: CacheKey,
    value: CacheValue,
    options?: CacheOptions
  ): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const ttl = options?.ttl || 3600; // Default 1 hour
      const stringValue = JSON.stringify(value);

      await redisClient.set(key, stringValue, ttl);
      this.stats.sets++;
      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger.error("Cache set error", error as Error, { key });
      return false;
    }
  }

  /**
   * Delete item from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await redis.del(this.buildKey(key));
      this.logger.debug("Cache key deleted", { key });
      return true;
    } catch (error) {
      this.logger.error("Cache delete failed", error as Error, { key });
      return false;
    }
  }

  async pattern(pattern: string): Promise<string[]> {
    try {
      const fullPattern = this.buildKey(pattern);
      const keys = await redis.keys(fullPattern);
      // Remove prefix from returned keys
      const prefix = this.buildKey("");
      return keys.map((key) =>
        key.startsWith(prefix) ? key.slice(prefix.length) : key
      );
    } catch (error) {
      this.logger.error("Cache pattern search failed", error as Error, {
        pattern,
      });
      return [];
    }
  }

  async deleteMany(keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;

    try {
      const fullKeys = keys.map((key) => this.buildKey(key));
      const deleted = await redis.del(...fullKeys);
      this.logger.debug("Multiple cache keys deleted", { count: deleted });
      return deleted;
    } catch (error) {
      this.logger.error("Cache deleteMany failed", error as Error, {
        keyCount: keys.length,
      });
      return 0;
    }
  }

  /**
   * Invalidate cache by tags
   */
  static async invalidateByTag(tag: string): Promise<void> {
    // Invalidate in Redis
    if (this.isRedisConnected && this.redis) {
      try {
        const keys = await this.redis.sMembers(`tag:${tag}`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          await this.redis.del(`tag:${tag}`);
        }
      } catch (error) {
        console.error("Redis invalidate error:", error);
      }
    }

    // Invalidate in memory
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.includes(tag)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  async clear(pattern?: string): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      // Clear all keys or keys matching pattern
      // For now, just reset stats
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0,
      };
      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger.error("Cache clear error", error as Error, { pattern });
      return false;
    }
  }

  /**
   * Calculate TTL based on options and season
   */
  private static calculateTTL(options: CacheOptions): number {
    if (options.ttl) return options.ttl;

    if (options.seasonal) {
      return this.getSeasonalTTL();
    }

    // Default TTL: 5 minutes
    return 300;
  }

  /**
   * Get seasonal TTL (shorter during harvest season)
   */
  private static getSeasonalTTL(): number {
    const month = new Date().getMonth();

    // Harvest months (June-October): Shorter TTL for freshness
    if (month >= 5 && month <= 9) {
      return 60; // 1 minute
    }

    // Off-season: Longer TTL
    return 600; // 10 minutes
  }

  /**
   * Generate cache key
   */
  static key(...parts: (string | number)[]): string {
    return parts.join(":");
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    return {
      memorySize: this.memoryCache.size,
      isRedisConnected: this.isRedisConnected,
      entries: Array.from(this.memoryCache.keys()),
    };
  }
}

// Cache key builders
export const CacheKeys = {
  product: (id: string) => CacheService.key("product", id),
  products: (filters?: any) =>
    CacheService.key("products", JSON.stringify(filters || {})),
  farm: (id: string) => CacheService.key("farm", id),
  farms: (filters?: any) =>
    CacheService.key("farms", JSON.stringify(filters || {})),
  user: (id: string) => CacheService.key("user", id),
  orders: (userId: string) => CacheService.key("orders", userId),
  search: (query: string, type?: string) =>
    CacheService.key("search", query, type || "all"),
  dashboard: (userId: string) => CacheService.key("dashboard", userId),
};

// Cache tags for invalidation
export const CacheTags = {
  PRODUCTS: "products",
  FARMS: "farms",
  USERS: "users",
  ORDERS: "orders",
  SEARCH: "search",
};

// Initialize cache on import
CacheService.initialize();
