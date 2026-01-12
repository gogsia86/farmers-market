// src/lib/cache/redis.service.ts

/**
 * Redis Caching Service
 *
 * Multi-layer caching strategy for the Farmers Market Platform:
 * - L1: In-memory LRU cache (ultra-fast, 5-minute TTL)
 * - L2: Redis cache (fast, shared across instances, 1-hour TTL)
 *
 * Features:
 * - Automatic cache invalidation
 * - Cache warming
 * - Cache statistics
 * - Pattern-based invalidation
 * - Compressed large values
 */

import { logger } from "@/lib/monitoring/logger";
import Redis from "ioredis";
import { LRUCache } from "lru-cache";
import { promisify } from "util";
import { compress, decompress } from "zlib";

const compressAsync = promisify(compress);
const decompressAsync = promisify(decompress);

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  compress?: boolean; // Compress large values (> 1KB)
  skipMemory?: boolean; // Skip L1 cache
  skipRedis?: boolean; // Skip L2 cache
}

export interface CacheStats {
  memoryHits: number;
  memoryMisses: number;
  redisHits: number;
  redisMisses: number;
  totalRequests: number;
  hitRate: number;
  memorySize: number;
  memoryItemCount: number;
}

// ============================================================================
// Redis Client Singleton
// ============================================================================

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  // Only initialize Redis if environment variables are set
  if (!process.env.REDIS_HOST) {
    logger.warn("Redis not configured - caching will use memory only");
    return null;
  }

  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT ?? "6379"),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        if (times > 3) {
          logger.error("Redis connection failed after 3 retries");
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000); // Exponential backoff
      },
      reconnectOnError: (err: Error) => {
        const targetErrors = ["READONLY", "ECONNRESET"];
        if (targetErrors.some((e) => err.message.includes(e))) {
          return true;
        }
        return false;
      },
    });

    // Connection event handlers
    redisClient.on("connect", () => {
      logger.info("Redis connected successfully");
    });

    redisClient.on("error", (error: Error) => {
      logger.error("Redis error", { error: error.message });
    });

    redisClient.on("close", () => {
      logger.warn("Redis connection closed");
    });

    // Connect
    redisClient.connect().catch((error: Error) => {
      logger.error("Failed to connect to Redis", { error });
      redisClient = null;
    });

    return redisClient;
  } catch (error) {
    logger.error("Failed to initialize Redis client", { error });
    return null;
  }
}

// ============================================================================
// L1: In-Memory LRU Cache
// ============================================================================

const memoryCache = new LRUCache<string, any>({
  max: 10000, // Maximum 10,000 items
  ttl: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true,
  updateAgeOnHas: true,
  allowStale: false,
});

// ============================================================================
// Cache Statistics
// ============================================================================

const stats = {
  memoryHits: 0,
  memoryMisses: 0,
  redisHits: 0,
  redisMisses: 0,
};

// ============================================================================
// Redis Cache Service
// ============================================================================

export class RedisCacheService {
  private redis: Redis | null;
  private keyPrefix: string;

  constructor(keyPrefix: string = "fmp") {
    this.redis = getRedisClient();
    this.keyPrefix = keyPrefix;
  }

  /**
   * Get value from cache (checks L1 then L2)
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const prefixedKey = this.getPrefixedKey(key);

    // L1: Check memory cache first
    if (!options?.skipMemory) {
      const memCached = memoryCache.get(prefixedKey);
      if (memCached !== undefined) {
        stats.memoryHits++;
        logger.debug("Cache hit (memory)", { key });
        return memCached as T;
      }
      stats.memoryMisses++;
    }

    // L2: Check Redis
    if (this.redis && !options?.skipRedis) {
      try {
        const redisCached = await this.redis.get(prefixedKey);
        if (redisCached) {
          stats.redisHits++;
          logger.debug("Cache hit (redis)", { key });

          let parsed: T;
          try {
            // Check if compressed
            if (redisCached.startsWith("COMPRESSED:")) {
              const compressed = Buffer.from(
                redisCached.slice(11),
                "base64"
              );
              const decompressed = await decompressAsync(compressed);
              parsed = JSON.parse(decompressed.toString());
            } else {
              parsed = JSON.parse(redisCached);
            }
          } catch (error) {
            logger.error("Failed to parse cached value", { error, key });
            return null;
          }

          // Store in memory for next time
          if (!options?.skipMemory) {
            memoryCache.set(prefixedKey, parsed);
          }

          return parsed;
        }
        stats.redisMisses++;
      } catch (error) {
        logger.error("Redis get error", { error, key });
      }
    }

    logger.debug("Cache miss", { key });
    return null;
  }

  /**
   * Set value in cache (stores in both L1 and L2)
   */
  async set<T>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<void> {
    const prefixedKey = this.getPrefixedKey(key);
    const ttl = options?.ttl ?? 3600; // Default 1 hour

    // Store in L1 (memory)
    if (!options?.skipMemory) {
      memoryCache.set(prefixedKey, value, {
        ttl: Math.min(ttl * 1000, 1000 * 60 * 5), // Max 5 minutes in memory
      });
    }

    // Store in L2 (Redis)
    if (this.redis && !options?.skipRedis) {
      try {
        let serialized = JSON.stringify(value);

        // Compress if value is large (> 1KB) and compression enabled
        if (options?.compress && serialized.length > 1024) {
          const compressed = await compressAsync(Buffer.from(serialized));
          serialized = "COMPRESSED:" + compressed.toString("base64");
        }

        await this.redis.setex(prefixedKey, ttl, serialized);
        logger.debug("Cache set", { key, ttl, compressed: options?.compress });
      } catch (error) {
        logger.error("Redis set error", { error, key });
      }
    }
  }

  /**
   * Delete specific key from cache
   */
  async delete(key: string): Promise<void> {
    const prefixedKey = this.getPrefixedKey(key);

    // Delete from memory
    memoryCache.delete(prefixedKey);

    // Delete from Redis
    if (this.redis) {
      try {
        await this.redis.del(prefixedKey);
        logger.debug("Cache deleted", { key });
      } catch (error) {
        logger.error("Redis delete error", { error, key });
      }
    }
  }

  /**
   * Invalidate cache by pattern (e.g., "farm:123:*")
   */
  async invalidatePattern(pattern: string): Promise<number> {
    const prefixedPattern = this.getPrefixedKey(pattern);
    let deletedCount = 0;

    // Clear all memory cache if pattern is "*"
    if (pattern === "*") {
      memoryCache.clear();
      logger.info("Memory cache cleared");
    } else {
      // Clear matching keys from memory
      const keys = Array.from(memoryCache.keys());
      const regex = new RegExp(
        "^" + prefixedPattern.replace(/\*/g, ".*") + "$"
      );
      keys.forEach((key) => {
        if (regex.test(key)) {
          memoryCache.delete(key);
          deletedCount++;
        }
      });
    }

    // Clear from Redis
    if (this.redis) {
      try {
        const keys = await this.redis.keys(prefixedPattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          deletedCount += keys.length;
          logger.info("Cache invalidated", {
            pattern,
            keysCleared: keys.length,
          });
        }
      } catch (error) {
        logger.error("Redis invalidate error", { error, pattern });
      }
    }

    return deletedCount;
  }

  /**
   * Wrap a function with caching
   */
  async wrap<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
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
   * Get multiple keys in parallel
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map((key) => this.get<T>(key)));
  }

  /**
   * Set multiple keys in parallel
   */
  async mset<T>(
    entries: Array<{ key: string; value: T; options?: CacheOptions }>
  ): Promise<void> {
    await Promise.all(
      entries.map((entry) =>
        this.set(entry.key, entry.value, entry.options)
      )
    );
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);

    // Check memory first
    if (memoryCache.has(prefixedKey)) {
      return true;
    }

    // Check Redis
    if (this.redis) {
      try {
        const exists = await this.redis.exists(prefixedKey);
        return exists === 1;
      } catch (error) {
        logger.error("Redis has error", { error, key });
      }
    }

    return false;
  }

  /**
   * Increment a counter in cache
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    const prefixedKey = this.getPrefixedKey(key);

    if (this.redis) {
      try {
        return await this.redis.incrby(prefixedKey, amount);
      } catch (error) {
        logger.error("Redis increment error", { error, key });
      }
    }

    return 0;
  }

  /**
   * Set expiration on existing key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);

    if (this.redis) {
      try {
        const result = await this.redis.expire(prefixedKey, ttl);
        return result === 1;
      } catch (error) {
        logger.error("Redis expire error", { error, key });
      }
    }

    return false;
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    const prefixedKey = this.getPrefixedKey(key);

    if (this.redis) {
      try {
        return await this.redis.ttl(prefixedKey);
      } catch (error) {
        logger.error("Redis ttl error", { error, key });
      }
    }

    return -1;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests =
      stats.memoryHits +
      stats.memoryMisses +
      stats.redisHits +
      stats.redisMisses;
    const totalHits = stats.memoryHits + stats.redisHits;
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;

    return {
      memoryHits: stats.memoryHits,
      memoryMisses: stats.memoryMisses,
      redisHits: stats.redisHits,
      redisMisses: stats.redisMisses,
      totalRequests,
      hitRate,
      memorySize: memoryCache.size,
      memoryItemCount: memoryCache.size,
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    stats.memoryHits = 0;
    stats.memoryMisses = 0;
    stats.redisHits = 0;
    stats.redisMisses = 0;
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    memoryCache.clear();

    if (this.redis) {
      try {
        await this.invalidatePattern("*");
        logger.info("All caches cleared");
      } catch (error) {
        logger.error("Failed to clear Redis cache", { error });
      }
    }
  }

  /**
   * Disconnect from Redis (for cleanup)
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit();
        logger.info("Redis disconnected");
      } catch (error) {
        logger.error("Failed to disconnect from Redis", { error });
      }
    }
  }

  /**
   * Get prefixed key
   */
  private getPrefixedKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }
}

// ============================================================================
// Export Pre-configured Instances
// ============================================================================

// General cache
export const cache = new RedisCacheService("fmp");

// Recommendations cache (shorter TTL)
export const recommendationsCache = new RedisCacheService("fmp:recommendations");

// Analytics cache (longer TTL)
export const analyticsCache = new RedisCacheService("fmp:analytics");

// Session cache
export const sessionCache = new RedisCacheService("fmp:session");

// ============================================================================
// Cache Key Generators
// ============================================================================

export const CacheKeys = {
  // Crop recommendations
  cropRecommendations: (farmId: string) => `crop:recommendations:${farmId}`,
  cropRecommendationsByFilter: (farmId: string, filters: string) =>
    `crop:recommendations:${farmId}:${filters}`,

  // Harvest analytics
  harvestAnalytics: (farmId: string) => `harvest:analytics:${farmId}`,
  harvestAnalyticsWithFilter: (farmId: string, filters: string) =>
    `harvest:analytics:${farmId}:${filters}`,

  // Yield predictions
  yieldPrediction: (farmId: string, cropId: string) =>
    `yield:prediction:${farmId}:${cropId}`,

  // Weather data
  weather: (lat: number, lng: number) => `weather:${lat}:${lng}`,

  // Farm data
  farm: (farmId: string) => `farm:${farmId}`,
  farmProfile: (farmId: string) => `farm:profile:${farmId}`,

  // Product data
  product: (productId: string) => `product:${productId}`,
  farmProducts: (farmId: string) => `farm:${farmId}:products`,

  // Search results
  searchResults: (query: string, filters: string) =>
    `search:${query}:${filters}`,

  // Market data
  marketData: (cropId: string) => `market:${cropId}`,

  // User session
  userSession: (userId: string) => `session:${userId}`,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Cache invalidation patterns for common operations
 */
export const invalidateCacheFor = {
  // Invalidate all farm-related caches
  farm: async (farmId: string) => {
    await cache.invalidatePattern(`farm:${farmId}:*`);
    await recommendationsCache.invalidatePattern(`*:${farmId}*`);
    await analyticsCache.invalidatePattern(`*:${farmId}*`);
  },

  // Invalidate crop recommendations
  cropRecommendations: async (farmId: string) => {
    await recommendationsCache.invalidatePattern(
      `crop:recommendations:${farmId}*`
    );
  },

  // Invalidate harvest analytics
  harvestAnalytics: async (farmId: string) => {
    await analyticsCache.invalidatePattern(`harvest:analytics:${farmId}*`);
  },

  // Invalidate all caches for a specific crop
  crop: async (cropId: string) => {
    await cache.invalidatePattern(`*:${cropId}:*`);
    await recommendationsCache.invalidatePattern(`*:${cropId}*`);
  },

  // Invalidate user session
  userSession: async (userId: string) => {
    await sessionCache.delete(`session:${userId}`);
  },
};
