/**
 * 🚀 MULTI-LAYER CACHE SERVICE - CLAUDE SONNET 4.5 OPTIMIZED
 *
 * Advanced caching with agricultural consciousness and quantum performance
 *
 * Architecture:
 * - L1: In-memory LRU cache (fastest, 64GB RAM optimized)
 * - L2: Redis cache (distributed, persistent)
 * - Automatic fallback and cache warming
 * - Pattern-based invalidation
 * - Cache statistics and monitoring
 *
 * Performance:
 * - L1 hit: <1ms
 * - L2 hit: <5ms
 * - Cache miss: Full DB query
 *
 * @reference .cursorrules - Claude Sonnet 4.5 Optimization Protocol
 */

import { logger } from "@/lib/monitoring/logger";
import { Redis } from "ioredis";
import { LRUCache } from "lru-cache";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CacheOptions {
  /** Time-to-live in seconds */
  ttl?: number;
  /** Namespace for cache key */
  namespace?: string;
  /** Skip L1 cache and go directly to L2 */
  skipL1?: boolean;
  /** Skip L2 cache and go directly to source */
  skipL2?: boolean;
}

export interface CacheStats {
  l1: {
    size: number;
    maxSize: number;
    hitRate: number;
    missRate: number;
  };
  l2: {
    connected: boolean;
    hitRate: number;
    missRate: number;
  };
  totalHits: number;
  totalMisses: number;
  totalRequests: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// ============================================================================
// L1 CACHE (IN-MEMORY LRU)
// ============================================================================

class L1Cache {
  private cache: LRUCache<string, CacheEntry<unknown>>;
  private hits = 0;
  private misses = 0;

  constructor(maxSize: number = 10000) {
    this.cache = new LRUCache<string, CacheEntry<unknown>>({
      max: maxSize,
      ttl: 1000 * 60 * 5, // 5 minutes default
      updateAgeOnGet: true,
      updateAgeOnHas: true,
      dispose: (value, key) => {
        logger.debug("L1 cache entry disposed", { key });
      },
    });

    logger.info("L1 cache initialized", { maxSize });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired (double-check TTL)
    const now = Date.now();
    if (entry.timestamp + entry.ttl * 1000 < now) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data;
  }

  set<T>(key: string, value: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    };

    this.cache.set(key, entry as CacheEntry<unknown>, {
      ttl: ttl * 1000,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  getStats() {
    const totalRequests = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      hitRate: totalRequests > 0 ? this.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.misses / totalRequests : 0,
      hits: this.hits,
      misses: this.misses,
    };
  }

  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    logger.info("L1 cache pattern invalidation", { pattern, count });
    return count;
  }
}

// ============================================================================
// L2 CACHE (REDIS)
// ============================================================================

class L2Cache {
  private redis: Redis | null = null;
  private connected = false;
  private hits = 0;
  private misses = 0;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (!process.env.REDIS_HOST) {
      logger.warn("Redis not configured - L2 cache disabled");
      return;
    }

    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.redis.on("connect", () => {
        this.connected = true;
        logger.info("L2 cache (Redis) connected");
      });

      this.redis.on("error", (error) => {
        this.connected = false;
        logger.error("L2 cache (Redis) error", { error: error.message });
      });

      this.redis.on("close", () => {
        this.connected = false;
        logger.warn("L2 cache (Redis) connection closed");
      });

      await this.redis.connect();
    } catch (error) {
      logger.error("Failed to initialize L2 cache", { error });
      this.redis = null;
      this.connected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis || !this.connected) {
      this.misses++;
      return null;
    }

    try {
      const value = await this.redis.get(key);

      if (!value) {
        this.misses++;
        return null;
      }

      this.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error("L2 cache get error", { key, error });
      this.misses++;
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    if (!this.redis || !this.connected) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
    } catch (error) {
      logger.error("L2 cache set error", { key, error });
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis || !this.connected) {
      return;
    }

    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error("L2 cache delete error", { key, error });
    }
  }

  async clear(): Promise<void> {
    if (!this.redis || !this.connected) {
      return;
    }

    try {
      await this.redis.flushdb();
      this.hits = 0;
      this.misses = 0;
      logger.info("L2 cache cleared");
    } catch (error) {
      logger.error("L2 cache clear error", { error });
    }
  }

  async has(key: string): Promise<boolean> {
    if (!this.redis || !this.connected) {
      return false;
    }

    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error("L2 cache has error", { key, error });
      return false;
    }
  }

  getStats() {
    const totalRequests = this.hits + this.misses;
    return {
      connected: this.connected,
      hitRate: totalRequests > 0 ? this.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.misses / totalRequests : 0,
      hits: this.hits,
      misses: this.misses,
    };
  }

  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.redis || !this.connected) {
      return 0;
    }

    try {
      const keys = await this.redis.keys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      await this.redis.del(...keys);
      logger.info("L2 cache pattern invalidation", {
        pattern,
        count: keys.length,
      });
      return keys.length;
    } catch (error) {
      logger.error("L2 cache invalidate pattern error", { pattern, error });
      return 0;
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.connected = false;
      logger.info("L2 cache disconnected");
    }
  }
}

// ============================================================================
// MULTI-LAYER CACHE SERVICE
// ============================================================================

export class MultiLayerCache {
  private l1: L1Cache;
  private l2: L2Cache;
  private defaultTTL = 3600; // 1 hour
  private defaultNamespace = "app";

  constructor() {
    this.l1 = new L1Cache(10000);
    this.l2 = new L2Cache();

    logger.info("Multi-layer cache service initialized");
  }

  /**
   * Get value from cache (checks L1 → L2 → returns null)
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const fullKey = this.buildKey(key, options.namespace);

    // L1 cache check
    if (!options.skipL1) {
      const l1Value = this.l1.get<T>(fullKey);
      if (l1Value !== null) {
        logger.debug("Cache hit (L1)", { key: fullKey });
        return l1Value;
      }
    }

    // L2 cache check
    if (!options.skipL2) {
      const l2Value = await this.l2.get<T>(fullKey);
      if (l2Value !== null) {
        logger.debug("Cache hit (L2)", { key: fullKey });

        // Warm L1 cache
        if (!options.skipL1) {
          this.l1.set(fullKey, l2Value, options.ttl || this.defaultTTL);
        }

        return l2Value;
      }
    }

    logger.debug("Cache miss", { key: fullKey });
    return null;
  }

  /**
   * Set value in cache (stores in both L1 and L2)
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    const fullKey = this.buildKey(key, options.namespace);
    const ttl = options.ttl || this.defaultTTL;

    // Set in L1
    if (!options.skipL1) {
      this.l1.set(fullKey, value, ttl);
    }

    // Set in L2
    if (!options.skipL2) {
      await this.l2.set(fullKey, value, ttl);
    }

    logger.debug("Cache set", { key: fullKey, ttl });
  }

  /**
   * Delete key from both cache layers
   */
  async delete(key: string, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.buildKey(key, options.namespace);

    this.l1.delete(fullKey);
    await this.l2.delete(fullKey);

    logger.debug("Cache delete", { key: fullKey });
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    this.l1.clear();
    await this.l2.clear();
    logger.info("All caches cleared");
  }

  /**
   * Check if key exists (checks both layers)
   */
  async has(key: string, options: CacheOptions = {}): Promise<boolean> {
    const fullKey = this.buildKey(key, options.namespace);

    if (this.l1.has(fullKey)) {
      return true;
    }

    return await this.l2.has(fullKey);
  }

  /**
   * Get or set pattern (fetch if not cached)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();

    // Cache it
    await this.set(key, fresh, options);

    return fresh;
  }

  /**
   * Invalidate cache by pattern (regex)
   */
  async invalidatePattern(
    pattern: string,
    options: CacheOptions = {},
  ): Promise<void> {
    const fullPattern = this.buildKey(pattern, options.namespace);

    const l1Count = this.l1.invalidatePattern(fullPattern);
    const l2Count = await this.l2.invalidatePattern(fullPattern);

    logger.info("Cache invalidated by pattern", {
      pattern: fullPattern,
      l1Count,
      l2Count,
      totalCount: l1Count + l2Count,
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const l1Stats = this.l1.getStats();
    const l2Stats = this.l2.getStats();

    const totalHits = l1Stats.hits + l2Stats.hits;
    const totalMisses = l1Stats.misses + l2Stats.misses;
    const totalRequests = totalHits + totalMisses;

    return {
      l1: {
        size: l1Stats.size,
        maxSize: l1Stats.maxSize,
        hitRate: l1Stats.hitRate,
        missRate: l1Stats.missRate,
      },
      l2: {
        connected: l2Stats.connected,
        hitRate: l2Stats.hitRate,
        missRate: l2Stats.missRate,
      },
      totalHits,
      totalMisses,
      totalRequests,
    };
  }

  /**
   * Build full cache key with namespace
   */
  private buildKey(key: string, namespace?: string): string {
    const ns = namespace || this.defaultNamespace;
    return `${ns}:${key}`;
  }

  /**
   * Graceful shutdown
   */
  async disconnect(): Promise<void> {
    await this.l2.disconnect();
    logger.info("Multi-layer cache disconnected");
  }
}

// ============================================================================
// SINGLETON INSTANCE & CACHE KEY GENERATORS
// ============================================================================

export const multiLayerCache = new MultiLayerCache();

/**
 * Cache key generators for consistent naming
 */
export const CacheKeys = {
  // Farm caching
  farm: (id: string) => `farm:${id}`,
  farmBySlug: (slug: string) => `farm:slug:${slug}`,
  farmsByOwner: (ownerId: string) => `farms:owner:${ownerId}`,
  farmsList: (page: number, filters?: string) =>
    `farms:list:${page}:${filters || "all"}`,
  farmsNearby: (lat: number, lng: number, radius: number) =>
    `farms:nearby:${lat}:${lng}:${radius}`,

  // Product caching
  product: (id: string) => `product:${id}`,
  productsByFarm: (farmId: string, page: number) =>
    `products:farm:${farmId}:${page}`,
  productsByCategory: (category: string, page: number) =>
    `products:category:${category}:${page}`,

  // Order caching
  order: (id: string) => `order:${id}`,
  userOrders: (userId: string, page: number) => `orders:user:${userId}:${page}`,

  // User caching
  user: (id: string) => `user:${id}`,
  userSession: (userId: string) => `session:${userId}`,
  userProfile: (userId: string) => `profile:${userId}`,

  // Seasonal data
  seasonalCrops: (season: string) => `crops:season:${season}`,
  seasonalProducts: (season: string) => `products:season:${season}`,

  // Analytics & aggregations
  analytics: (type: string, date: string) => `analytics:${type}:${date}`,
  stats: (entity: string, id: string) => `stats:${entity}:${id}`,
};

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  REALTIME: 10, // 10 seconds - for rapidly changing data
  SHORT: 5 * 60, // 5 minutes - frequently updated
  MEDIUM: 30 * 60, // 30 minutes - moderately stable
  LONG: 2 * 3600, // 2 hours - stable data
  DAY: 24 * 3600, // 1 day - rarely changing
  WEEK: 7 * 24 * 3600, // 1 week - static reference data
  SEASONAL: 30 * 24 * 3600, // 1 month - seasonal data
};

/**
 * Divine multi-layer cache achieved ✨
 * Performance optimized for Claude Sonnet 4.5 architecture
 * L1 + L2 caching with agricultural consciousness
 */
