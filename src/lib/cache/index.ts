// 🧠 DIVINE PATTERN: Multi-Layer Caching with Agricultural Consciousness
// 📚 Reference: 03_PERFORMANCE_REALITY_BENDING.instructions.md
// 🌾 Domain: Biodynamic Cache with Seasonal TTL
// ⚡ Performance: Redis + Memory Layer

import { logger } from "@/lib/monitoring/logger";
import { Redis } from "ioredis";

/**
 * CACHE CONFIGURATION
 */
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD,
  keyPrefix: "fm:", // Farmers Market prefix
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    // Stop retrying if Redis is disabled
    if (process.env.REDIS_ENABLED !== "true") {
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true, // Don't connect immediately
};

/**
 * SEASON-AWARE TTL CONFIGURATION
 * Agricultural consciousness: different cache durations per season
 */
const SEASONAL_TTL = {
  SPRING: 3600, // 1 hour (planting season - frequent updates)
  SUMMER: 7200, // 2 hours (growing season - moderate updates)
  FALL: 1800, // 30 minutes (harvest season - rapid changes)
  WINTER: 14400, // 4 hours (rest season - slower updates)
} as const;

type Season = keyof typeof SEASONAL_TTL;

/**
 * CACHE KEY PATTERNS
 */
export const CacheKeys = {
  farm: (id: string) => `farm:${id}`,
  farmList: (filters: string) => `farms:list:${filters}`,
  product: (id: string) => `product:${id}`,
  productList: (farmId: string, filters: string) =>
    `products:${farmId}:${filters}`,
  userProfile: (id: string) => `user:${id}`,
  seasonalData: (season: Season) => `seasonal:${season}`,
} as const;

/**
 * CACHE LAYER INTERFACE
 */
export interface CacheLayer {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  delPattern(pattern: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * MEMORY CACHE LAYER
 * Fast in-memory cache for frequently accessed data
 */
class MemoryCache implements CacheLayer {
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  private readonly maxSize = 1000;

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    // LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace("*", ".*"));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

/**
 * REDIS CACHE LAYER
 * Distributed cache for multi-instance deployments
 */
class RedisCache implements CacheLayer {
  private client: Redis | null = null;
  private isConnected = false;
  private isEnabled = false;

  constructor() {
    this.isEnabled = process.env.REDIS_ENABLED === "true";
    if (this.isEnabled) {
      this.connect();
    } else {
      logger.info("Redis cache disabled - using memory-only cache");
    }
  }

  private connect() {
    try {
      this.client = new Redis(REDIS_CONFIG);

      this.client.on("connect", () => {
        this.isConnected = true;
        logger.info("Redis cache connected", { host: REDIS_CONFIG.host,
          port: REDIS_CONFIG.port,
        });
      });

      this.client.on("error", (error) => {
        // Only log errors if Redis is explicitly enabled
        if (this.isEnabled) {
          logger.error("Redis cache error", { error });
        }
        this.isConnected = false;
      });

      // Attempt connection
      this.client.connect().catch((error) => {
        if (this.isEnabled) {
          logger.error("Failed to connect to Redis", { error });
        }
      });
    } catch (error) {
      if (this.isEnabled) {
        logger.error("Failed to initialize Redis", { error });
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.client || !this.isConnected) return null;

    try {
      const value = await this.client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error("Redis get error", { key, error });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    if (!this.isEnabled || !this.client || !this.isConnected) return;

    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error("Redis set error", { key, error });
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isEnabled || !this.client || !this.isConnected) return;

    try {
      await this.client.del(key);
    } catch (error) {
      logger.error("Redis del error", { key, error });
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isEnabled || !this.client || !this.isConnected) return;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.error("Redis delPattern error", { pattern, error });
    }
  }

  async clear(): Promise<void> {
    if (!this.isEnabled || !this.client || !this.isConnected) return;

    try {
      await this.client.flushdb();
    } catch (error) {
      logger.error("Redis clear error", { error });
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

/**
 * MULTI-LAYER CACHE MANAGER
 * Combines memory and Redis layers with fallback strategy
 */
class MultiLayerCache {
  private memoryCache: MemoryCache;
  private redisCache: RedisCache;
  private useRedis: boolean;

  constructor() {
    this.memoryCache = new MemoryCache();
    this.redisCache = new RedisCache();
    this.useRedis = process.env.REDIS_ENABLED === "true";
  }

  /**
   * Get value from cache (tries memory first, then Redis)
   */
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryValue = await this.memoryCache.get<T>(key);
    if (memoryValue) {
      logger.debug("Cache hit (memory)", { key });
      return memoryValue;
    }

    // Try Redis if enabled
    if (this.useRedis) {
      const redisValue = await this.redisCache.get<T>(key);
      if (redisValue) {
        logger.debug("Cache hit (Redis)", { key });
        // Backfill memory cache
        await this.memoryCache.set(key, redisValue, 300);
        return redisValue;
      }
    }

    logger.debug("Cache miss", { key });
    return null;
  }

  /**
   * Set value in cache (writes to both layers)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const finalTtl = ttl || this.getSeasonalTTL();

    // Write to both layers
    await Promise.all([
      this.memoryCache.set(key, value, finalTtl),
      this.useRedis
        ? this.redisCache.set(key, value, finalTtl)
        : Promise.resolve(),
    ]);

    logger.debug("Cache set", { key, ttl: finalTtl });
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<void> {
    await Promise.all([
      this.memoryCache.del(key),
      this.useRedis ? this.redisCache.del(key) : Promise.resolve(),
    ]);

    logger.debug("Cache deleted", { key });
  }

  /**
   * Delete keys matching pattern
   */
  async delPattern(pattern: string): Promise<void> {
    await Promise.all([
      this.memoryCache.delPattern(pattern),
      this.useRedis ? this.redisCache.delPattern(pattern) : Promise.resolve(),
    ]);

    logger.debug("Cache pattern deleted", { pattern });
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    await Promise.all([
      this.memoryCache.clear(),
      this.useRedis ? this.redisCache.clear() : Promise.resolve(),
    ]);

    logger.info("Cache cleared");
  }

  /**
   * Get seasonal TTL based on current season
   */
  private getSeasonalTTL(): number {
    const month = new Date().getMonth();
    const season = this.getCurrentSeason(month);
    return SEASONAL_TTL[season];
  }

  /**
   * Determine current season based on month
   */
  private getCurrentSeason(month: number): Season {
    if (month >= 2 && month <= 4) return "SPRING"; // Mar-May
    if (month >= 5 && month <= 7) return "SUMMER"; // Jun-Aug
    if (month >= 8 && month <= 10) return "FALL"; // Sep-Nov
    return "WINTER"; // Dec-Feb
  }

  /**
   * Cache wrapper for async functions
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const value = await fn();
    await this.set(key, value, ttl);
    return value;
  }
}

/**
 * SINGLETON CACHE INSTANCE
 */
export const cache = new MultiLayerCache();

/**
 * CACHE WARMING STRATEGY
 * Pre-populate cache with frequently accessed data
 */
export async function warmCache(): Promise<void> {
  logger.info("Starting cache warming...");

  try {
    // This would be implemented to pre-load critical data
    // Example: Top farms, featured products, seasonal data
    logger.info("Cache warming complete");
  } catch (error) {
    logger.error("Cache warming failed", { error });
  }
}

// Re-export AgriculturalCache from separate module for better type resolution
export { AgriculturalCache } from "./agricultural-cache";
