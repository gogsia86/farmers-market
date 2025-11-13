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
  static async get<T>(key: string): Promise<T | null> {
    // Try Redis first
    if (this.isRedisConnected && this.redis) {
      try {
        const value = await this.redis.get(key);
        if (value) {
          return JSON.parse(value);
        }
      } catch (error) {
        console.error("Redis get error:", error);
      }
    }

    // Fallback to memory cache
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expires) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set item in cache
   */
  static async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const ttl = this.calculateTTL(options);
    const expires = Date.now() + ttl * 1000;
    const tags = options.tags || [];

    // Set in Redis
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.setEx(key, ttl, JSON.stringify(value));
        // Store tags separately for invalidation
        if (tags.length > 0) {
          for (const tag of tags) {
            await this.redis.sAdd(`tag:${tag}`, key);
          }
        }
      } catch (error) {
        console.error("Redis set error:", error);
      }
    }

    // Set in memory cache
    this.memoryCache.set(key, { data: value, expires, tags });
  }

  /**
   * Delete item from cache
   */
  static async delete(key: string): Promise<void> {
    // Delete from Redis
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.del(key);
      } catch (error) {
        console.error("Redis delete error:", error);
      }
    }

    // Delete from memory
    this.memoryCache.delete(key);
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
  static async clear(): Promise<void> {
    // Clear Redis
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.flushDb();
      } catch (error) {
        console.error("Redis clear error:", error);
      }
    }

    // Clear memory
    this.memoryCache.clear();
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
