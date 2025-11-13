/**
 * ⚡ DIVINE CACHE UTILITY
 * Quantum caching with agricultural consciousness and biodynamic TTL
 */

import { getRedisCache } from "@/lib/cache/redis";

type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

/**
 * In-memory cache with agricultural consciousness
 */
class BiodynamicCache {
  private readonly cache: Map<string, { value: unknown; expiresAt: number }> =
    new Map();

  constructor() {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Set cache value with optional TTL
   */
  async set(
    key: string,
    value: unknown,
    ttlSeconds: number = 3600
  ): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get cache value
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Check if key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    const cached = this.cache.get(key);
    if (!cached) return false;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get or set pattern (fetch if not cached)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Set with seasonal awareness
   * Longer TTL for stable seasonal data
   */
  async setSeasonalData(
    key: string,
    value: unknown,
    season: Season
  ): Promise<void> {
    const seasonalTTL = {
      SPRING: 7 * 24 * 3600, // 1 week
      SUMMER: 14 * 24 * 3600, // 2 weeks
      FALL: 7 * 24 * 3600, // 1 week
      WINTER: 30 * 24 * 3600, // 1 month (longer rest period)
    };

    await this.set(key, value, seasonalTTL[season]);
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Adapter interface for cache providers
interface CacheAdapter {
  set(
    key: string,
    value: unknown,
    ttlSeconds?: number
  ): Promise<void | boolean>;
  get<T = unknown>(key: string): Promise<T | null>;
  delete(key: string): Promise<void | boolean>;
  clear(): Promise<void | boolean>;
  has(key: string): Promise<boolean>;
  getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T>;
  setSeasonalData(
    key: string,
    value: unknown,
    season: "SPRING" | "SUMMER" | "FALL" | "WINTER"
  ): Promise<void | boolean>;
  invalidatePattern(pattern: string): Promise<void | number>;
  getStats(): unknown;
}

class RedisCacheAdapter implements CacheAdapter {
  private readonly svc = getRedisCache();

  async set(key: string, value: unknown, ttlSeconds: number = 3600) {
    await this.svc.set(key, value, { ttl: ttlSeconds });
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    return this.svc.get<T>(key);
  }

  async delete(key: string) {
    await this.svc.delete(key);
  }

  async clear() {
    await this.svc.flushAll();
  }

  async has(key: string): Promise<boolean> {
    return this.svc.exists(key);
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    return this.svc.getOrSet<T>(key, fetcher, { ttl: ttlSeconds });
  }

  async setSeasonalData(key: string, value: unknown, season: Season) {
    const seasonalTTL = {
      SPRING: 7 * 24 * 3600,
      SUMMER: 14 * 24 * 3600,
      FALL: 7 * 24 * 3600,
      WINTER: 30 * 24 * 3600,
    } as const;
    await this.set(key, value, seasonalTTL[season]);
  }

  async invalidatePattern(pattern: string) {
    await this.svc.deletePattern(pattern);
  }

  getStats() {
    return { provider: "redis" };
  }
}

// Singleton instance - select Redis in production if configured
const isRedisEnabled = Boolean(process.env.REDIS_HOST);
const cache: CacheAdapter = isRedisEnabled
  ? new RedisCacheAdapter()
  : new BiodynamicCache();

/**
 * Cache key generators for consistent naming
 */
export const CacheKeys = {
  // Product caching
  product: (id: string) => `product:${id}`,
  productsByFarm: (farmId: string) => `products:farm:${farmId}`,
  productsByCategory: (category: string) => `products:category:${category}`,

  // Farm caching
  farm: (id: string) => `farm:${id}`,
  farmsByRegion: (region: string) => `farms:region:${region}`,

  // Order caching
  order: (id: string) => `order:${id}`,
  userOrders: (userId: string) => `orders:user:${userId}`,

  // User caching
  user: (id: string) => `user:${id}`,
  userSession: (userId: string) => `session:${userId}`,

  // Seasonal data
  seasonalCrops: (season: string) => `crops:season:${season}`,
  seasonalProducts: (season: string) => `products:season:${season}`,

  // Analytics
  analytics: (type: string, date: string) => `analytics:${type}:${date}`,
};

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 2 * 3600, // 2 hours
  DAY: 24 * 3600, // 1 day
  WEEK: 7 * 24 * 3600, // 1 week
  SEASONAL: 30 * 24 * 3600, // 1 month
};

export { cache };
export default cache;
