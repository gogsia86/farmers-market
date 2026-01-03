/**
 * 🌾 BIODYNAMIC CACHE SYSTEM
 * Agricultural-aware caching with seasonal patterns and quantum performance
 * Multi-layer: L1 (Memory) + L2 (Redis)
 */

import { createLogger } from "@/lib/utils/logger";
import { MemoryCache } from "./memory";
import { redisClient } from "./redis-client";

// Create dedicated logger for cache operations
const cacheLogger = createLogger("BiodynamicCache");

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  seasonal?: boolean; // Apply seasonal TTL adjustments
  farmId?: string; // For farm-specific caching
  tags?: string[]; // Cache tags for invalidation
}

export interface CachedData<T> {
  data: T;
  cached: true;
  timestamp: number;
  expiresAt: number;
}

/**
 * Biodynamic Cache Manager
 * Multi-layer caching with agricultural awareness
 */
export class BiodynamicCacheManager {
  private readonly memoryCache: MemoryCache;
  private readonly defaultTTL = 300; // 5 minutes
  private readonly tagPrefix = "tag:";

  constructor() {
    this.memoryCache = new MemoryCache();
  }

  /**
   * Get value from cache (L1: Memory, L2: Redis)
   */
  async get<T>(key: string): Promise<T | null> {
    // L1: Check memory cache (fastest)
    const memoryValue = this.memoryCache.get<T>(key);
    if (memoryValue !== null) {
      cacheLogger.debug(`L1 Cache HIT`, { key });
      return memoryValue;
    }

    // L2: Check Redis cache
    const redisValue = await redisClient.get<T>(key);
    if (redisValue !== null) {
      cacheLogger.debug(`L2 Cache HIT (Redis)`, { key });
      // Populate L1 cache
      this.memoryCache.set(key, redisValue, 300); // Max 5 min in memory
      return redisValue;
    }

    cacheLogger.debug(`Cache MISS`, { key });
    return null;
  }

  /**
   * Set value in cache (L1: Memory, L2: Redis)
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    const ttl = this.calculateTTL(options);

    // Store in L1 (memory) cache - max 5 min to prevent memory bloat
    this.memoryCache.set(key, value, Math.min(ttl, 300));

    // Store in L2 (Redis) cache
    const redisSuccess = await redisClient.set(key, value, ttl);

    if (redisSuccess) {
      cacheLogger.debug(`Cached in L1+L2`, { key, ttl });

      // Store tag associations in Redis
      if (options.tags && options.tags.length > 0) {
        await this.associateTags(key, options.tags, ttl);
      }
    } else {
      cacheLogger.warn(`Cached in L1 only (Redis unavailable)`, { key });
    }
  }

  /**
   * Get or compute value with caching
   */
  async getOrSet<T>(
    key: string,
    compute: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Compute value
    cacheLogger.debug(`Computing value`, { key });
    const value = await compute();

    // Store in cache
    await this.set(key, value, options);

    return value;
  }

  /**
   * Invalidate cache by key
   */
  async invalidate(key: string): Promise<void> {
    this.memoryCache.invalidate(key);
    await redisClient.delete(key);
    cacheLogger.debug(`Invalidated`, { key });
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    this.memoryCache.invalidatePattern(pattern);
    const deletedCount = await redisClient.deletePattern(pattern);
    cacheLogger.debug(`Invalidated pattern`, { pattern, deletedCount });
  }

  /**
   * Invalidate cache by tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    const tagKey = this.getTagKey(tag);

    // Get all keys associated with this tag from Redis
    const keysJson = await redisClient.get<string[]>(tagKey);

    if (keysJson && Array.isArray(keysJson)) {
      cacheLogger.debug(`Invalidating tag`, { tag, keyCount: keysJson.length });

      // Delete all associated keys
      for (const key of keysJson) {
        await this.invalidate(key);
      }

      // Delete the tag key itself
      await redisClient.delete(tagKey);
    } else {
      cacheLogger.debug(`Tag not found`, { tag });
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    // Note: We don't clear ALL of Redis, just invalidate patterns
    await this.invalidatePattern("biodynamic:*");
    cacheLogger.info("Cache cleared");
  }

  /**
   * Associate cache key with tags
   */
  private async associateTags(
    key: string,
    tags: string[],
    ttl: number,
  ): Promise<void> {
    for (const tag of tags) {
      const tagKey = this.getTagKey(tag);

      // Get existing keys for this tag
      const existingKeys = (await redisClient.get<string[]>(tagKey)) || [];

      // Add current key if not already present
      if (!existingKeys.includes(key)) {
        existingKeys.push(key);
        await redisClient.set(tagKey, existingKeys, ttl);
      }
    }
  }

  /**
   * Get tag key for Redis
   */
  private getTagKey(tag: string): string {
    return `${this.tagPrefix}${tag}`;
  }

  /**
   * Calculate TTL with seasonal awareness
   */
  private calculateTTL(options: CacheOptions): number {
    let ttl = options.ttl || this.defaultTTL;

    if (options.seasonal) {
      const season = this.getCurrentSeason();
      const seasonalMultiplier = this.getSeasonalMultiplier(season);
      ttl = Math.floor(ttl * seasonalMultiplier);
    }

    return ttl;
  }

  /**
   * Get current agricultural season
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth();

    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }

  /**
   * Get seasonal cache TTL multiplier
   */
  private getSeasonalMultiplier(season: string): number {
    // Longer cache during off-season, shorter during peak season
    switch (season) {
      case "SPRING":
        return 0.5; // Peak planting - fresh data
      case "SUMMER":
        return 0.7; // Growth season - frequent updates
      case "FALL":
        return 1; // Harvest - normal caching
      case "WINTER":
        return 1.5; // Off-season - can cache longer
      default:
        return 1;
    }
  }

  /**
   * Generate agricultural-aware cache key
   */
  static generateKey(
    resource: string,
    id?: string,
    params?: Record<string, any>,
  ): string {
    const parts = ["biodynamic", resource];

    if (id) {
      parts.push(id);
    }

    if (params) {
      const sortedParams = Object.keys(params)
        .sort((a, b) => a.localeCompare(b))
        .map((key) => `${key}:${params[key]}`)
        .join(":");
      parts.push(sortedParams);
    }

    return parts.join(":");
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    redisConnected: boolean;
    memorySize: number;
  } {
    return {
      redisConnected: redisClient.getConnectionStatus(),
      memorySize: this.memoryCache.size(),
    };
  }
}

// Singleton instance
export const biodynamicCache = new BiodynamicCacheManager();
