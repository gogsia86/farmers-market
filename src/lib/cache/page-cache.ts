/**
 * 🚀 PAGE CACHE SERVICE
 * Multi-layer caching system for page performance optimization
 *
 * Features:
 * - Redis-based distributed caching
 * - In-memory LRU cache for hot data
 * - Automatic cache invalidation
 * - Cache warming strategies
 * - Performance monitoring
 * - Graceful degradation
 *
 * @module lib/cache/page-cache
 */

import { Redis } from "@upstash/redis";
import { LRUCache } from "lru-cache";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CACHE_VERSION = "v1";
const DEFAULT_TTL = 300; // 5 minutes
const MAX_MEMORY_CACHE_SIZE = 500; // items

interface CacheOptions {
  ttl?: number;
  tags?: string[];
  revalidate?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
  tags: string[];
}

// ============================================================================
// REDIS CLIENT
// ============================================================================

let redis: Redis | null = null;

function getRedisClient(): Redis | null {
  if (
    !redis &&
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    try {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    } catch (error) {
      console.error("[Cache] Failed to initialize Redis:", error);
      return null;
    }
  }
  return redis;
}

// ============================================================================
// IN-MEMORY CACHE (L1)
// ============================================================================

const memoryCache = new LRUCache<string, any>({
  max: MAX_MEMORY_CACHE_SIZE,
  ttl: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});

// ============================================================================
// CACHE KEY GENERATION
// ============================================================================

function generateCacheKey(key: string): string {
  return `${CACHE_VERSION}:page:${key}`;
}

function generateTagKey(tag: string): string {
  return `${CACHE_VERSION}:tag:${tag}`;
}

// ============================================================================
// CORE CACHE OPERATIONS
// ============================================================================

/**
 * Get data from cache (checks L1 memory, then L2 Redis)
 */
export async function getCached<T>(key: string): Promise<T | null> {
  const cacheKey = generateCacheKey(key);

  // L1: Check memory cache first
  const memoryCached = memoryCache.get(cacheKey);
  if (memoryCached !== undefined) {
    console.log(`[Cache] L1 HIT: ${key}`);
    return memoryCached as T;
  }

  // L2: Check Redis
  const redisClient = getRedisClient();
  if (!redisClient) {
    console.log(`[Cache] MISS (Redis unavailable): ${key}`);
    return null;
  }

  try {
    const cached = await redisClient.get<CacheEntry<T>>(cacheKey);

    if (!cached) {
      console.log(`[Cache] L2 MISS: ${key}`);
      return null;
    }

    // Validate cache entry
    if (cached.version !== CACHE_VERSION) {
      console.log(`[Cache] INVALID VERSION: ${key}`);
      await redisClient.del(cacheKey);
      return null;
    }

    console.log(`[Cache] L2 HIT: ${key}`);

    // Store in L1 for faster subsequent access
    memoryCache.set(cacheKey, cached.data);

    return cached.data;
  } catch (error) {
    console.error(`[Cache] Redis error for ${key}:`, error);
    return null;
  }
}

/**
 * Set data in cache (stores in both L1 and L2)
 */
export async function setCached<T>(
  key: string,
  data: T,
  options: CacheOptions = {},
): Promise<void> {
  const cacheKey = generateCacheKey(key);
  const ttl = options.ttl ?? DEFAULT_TTL;
  const tags = options.tags ?? [];

  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    version: CACHE_VERSION,
    tags,
  };

  // L1: Store in memory cache
  memoryCache.set(cacheKey, data);
  console.log(`[Cache] L1 SET: ${key} (TTL: ${ttl}s)`);

  // L2: Store in Redis
  const redisClient = getRedisClient();
  if (!redisClient) {
    console.log(`[Cache] Redis unavailable, skipping L2 SET: ${key}`);
    return;
  }

  try {
    await redisClient.setex(cacheKey, ttl, entry);
    console.log(`[Cache] L2 SET: ${key} (TTL: ${ttl}s)`);

    // Store tags for invalidation
    if (tags.length > 0) {
      for (const tag of tags) {
        const tagKey = generateTagKey(tag);
        await redisClient.sadd(tagKey, cacheKey);
        await redisClient.expire(tagKey, ttl);
      }
    }
  } catch (error) {
    console.error(`[Cache] Redis error setting ${key}:`, error);
  }
}

/**
 * Delete specific cache entry
 */
export async function deleteCached(key: string): Promise<void> {
  const cacheKey = generateCacheKey(key);

  // L1: Delete from memory
  memoryCache.delete(cacheKey);
  console.log(`[Cache] L1 DELETE: ${key}`);

  // L2: Delete from Redis
  const redisClient = getRedisClient();
  if (!redisClient) {
    console.log(`[Cache] Redis unavailable, skipping L2 DELETE: ${key}`);
    return;
  }

  try {
    await redisClient.del(cacheKey);
    console.log(`[Cache] L2 DELETE: ${key}`);
  } catch (error) {
    console.error(`[Cache] Redis error deleting ${key}:`, error);
  }
}

/**
 * Invalidate cache by tag
 */
export async function invalidateByTag(tag: string): Promise<void> {
  const tagKey = generateTagKey(tag);
  const redisClient = getRedisClient();

  if (!redisClient) {
    console.log(`[Cache] Redis unavailable, skipping tag invalidation: ${tag}`);
    return;
  }

  try {
    // Get all keys with this tag
    const keys = await redisClient.smembers(tagKey);

    if (!keys || keys.length === 0) {
      console.log(`[Cache] No keys found for tag: ${tag}`);
      return;
    }

    // Delete all keys
    for (const key of keys) {
      memoryCache.delete(key);
      await redisClient.del(key);
    }

    // Delete the tag set
    await redisClient.del(tagKey);

    console.log(`[Cache] Invalidated ${keys.length} keys for tag: ${tag}`);
  } catch (error) {
    console.error(`[Cache] Error invalidating tag ${tag}:`, error);
  }
}

/**
 * Clear all cache (both L1 and L2)
 */
export async function clearAllCache(): Promise<void> {
  // L1: Clear memory cache
  memoryCache.clear();
  console.log("[Cache] L1 CLEARED");

  // L2: Clear Redis cache
  const redisClient = getRedisClient();
  if (!redisClient) {
    console.log("[Cache] Redis unavailable, skipping L2 CLEAR");
    return;
  }

  try {
    // Get all keys with our version prefix
    const pattern = `${CACHE_VERSION}:*`;
    const keys = await redisClient.keys(pattern);

    if (keys && keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`[Cache] L2 CLEARED (${keys.length} keys deleted)`);
    } else {
      console.log("[Cache] L2 CLEAR - No keys found");
    }
  } catch (error) {
    console.error("[Cache] Error clearing Redis cache:", error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  memorySize: number;
  memoryMaxSize: number;
  redisKeys?: number;
}> {
  const stats = {
    memorySize: memoryCache.size,
    memoryMaxSize: MAX_MEMORY_CACHE_SIZE,
  };

  const redisClient = getRedisClient();
  if (!redisClient) {
    return stats;
  }

  try {
    const pattern = `${CACHE_VERSION}:*`;
    const keys = await redisClient.keys(pattern);
    return {
      ...stats,
      redisKeys: keys?.length ?? 0,
    };
  } catch (error) {
    console.error("[Cache] Error getting cache stats:", error);
    return stats;
  }
}

/**
 * Cache wrapper function for easy caching
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  // Try to get from cache
  const cached = await getCached<T>(key);
  if (cached !== null && !options.revalidate) {
    return cached;
  }

  // Fetch fresh data
  const fresh = await fetcher();

  // Cache it
  await setCached(key, fresh, options);

  return fresh;
}

/**
 * Batch cache warming
 */
export async function warmCache(
  entries: Array<{
    key: string;
    fetcher: () => Promise<any>;
    options?: CacheOptions;
  }>,
): Promise<void> {
  console.log(`[Cache] Warming ${entries.length} cache entries...`);

  const promises = entries.map(async ({ key, fetcher, options }) => {
    try {
      const data = await fetcher();
      await setCached(key, data, options);
      return { key, success: true };
    } catch (error) {
      console.error(`[Cache] Failed to warm cache for ${key}:`, error);
      return { key, success: false };
    }
  });

  const results = await Promise.all(promises);
  const successful = results.filter((r) => r.success).length;

  console.log(`[Cache] Warmed ${successful}/${entries.length} cache entries`);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const pageCache = {
  get: getCached,
  set: setCached,
  delete: deleteCached,
  invalidateByTag,
  clearAll: clearAllCache,
  stats: getCacheStats,
  with: withCache,
  warm: warmCache,
};

export default pageCache;

/**
 * Divine multi-layer cache system achieved ✨
 * - L1 in-memory cache for blazing fast access
 * - L2 Redis cache for distributed caching
 * - Tag-based invalidation
 * - Graceful degradation
 * - Cache warming strategies
 * - Performance monitoring
 * Ready for production at kilo-scale 🚀
 */
