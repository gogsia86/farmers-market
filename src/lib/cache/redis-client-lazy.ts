/**
 * ⚡ LAZY REDIS CLIENT
 * Dynamic import wrapper for Redis to reduce server bundle size
 */

import { createLogger } from "@/lib/utils/logger";

// Create dedicated logger for Redis lazy client
const redisLazyLogger = createLogger("RedisLazy");

/**
 *
 * WHY THIS EXISTS:
 * - ioredis library is ~100KB and was bundled in every route using rate limiting
 * - Redis connections are not needed for every request (especially in development)
 * - Lazy loading defers bundling until Redis is actually needed
 * - Graceful fallback to in-memory cache when Redis unavailable
 *
 * USAGE:
 * Replace: import { redisClient } from '@/lib/cache/redis-client';
 * With:    import { redisClientLazy } from '@/lib/cache/redis-client-lazy';
 *
 * PERFORMANCE:
 * - When Redis disabled: Near-zero overhead (returns mock client)
 * - When Redis enabled (first call): +10-50ms (dynamic import overhead)
 * - Subsequent calls: Same as normal (module cached)
 * - Bundle savings: ~100KB per route
 *
 * DIVINE PATTERN:
 * - Maintains same interface as RedisClient
 * - Seamless fallback to in-memory storage
 * - Agricultural consciousness preserved
 */

/**
 * Redis client interface (matches RedisClient methods)
 */
export interface IRedisClient {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl?: number): Promise<boolean>;
  delete(key: string): Promise<number>;
  deletePattern(pattern: string): Promise<number>;
  exists(key: string): Promise<boolean>;
  disconnect(): Promise<void>;
  getConnectionStatus(): { connected: boolean; reconnectAttempts: number };
}

/**
 * In-memory fallback storage
 * Used when Redis is disabled or unavailable
 */
class InMemoryRedisClient implements IRedisClient {
  private store = new Map<
    string,
    { value: unknown; expiresAt: number | null }
  >();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;
    this.store.set(key, { value, expiresAt });
    return true;
  }

  async delete(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    return existed ? 1 : 0;
  }

  async deletePattern(pattern: string): Promise<number> {
    // Convert Redis pattern to RegExp
    const regexPattern = pattern
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]");
    const regex = new RegExp(`^${regexPattern}$`);

    let count = 0;
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  async disconnect(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }

  getConnectionStatus(): { connected: boolean; reconnectAttempts: number } {
    // In-memory client is always "connected"
    return { connected: true, reconnectAttempts: 0 };
  }
}

/**
 * Singleton in-memory client (used when Redis disabled)
 */
let inMemoryClient: InMemoryRedisClient | null = null;

/**
 * Cached Redis client (loaded once)
 */
let cachedRedisClient: IRedisClient | null = null;

/**
 * Check if Redis is enabled in environment
 */
function isRedisEnabled(): boolean {
  return process.env.REDIS_ENABLED === "true";
}

/**
 * Get Redis client (lazy-loaded)
 * Returns in-memory client if Redis is disabled
 */
async function getRedisClient(): Promise<IRedisClient> {
  // Fast path: Redis disabled, use in-memory
  if (!isRedisEnabled()) {
    if (!inMemoryClient) {
      inMemoryClient = new InMemoryRedisClient();
    }
    return inMemoryClient;
  }

  // Fast path: Redis client already loaded
  if (cachedRedisClient) {
    return cachedRedisClient;
  }

  // Lazy load Redis client
  try {
    const { redisClient } = await import("./redis-client");
    cachedRedisClient = redisClient;
    return cachedRedisClient;
  } catch (error) {
    redisLazyLogger.warn(
      "Failed to load Redis client, falling back to in-memory",
      {
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    );

    // Fallback to in-memory on error
    if (!inMemoryClient) {
      inMemoryClient = new InMemoryRedisClient();
    }
    return inMemoryClient;
  }
}

/**
 * LAZY REDIS CLIENT WRAPPER
 * Provides same interface as RedisClient but with lazy loading
 */
export const redisClientLazy: IRedisClient = {
  async get<T>(key: string): Promise<T | null> {
    const client = await getRedisClient();
    return client.get<T>(key);
  },

  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    const client = await getRedisClient();
    return client.set(key, value, ttl);
  },

  async delete(key: string): Promise<number> {
    const client = await getRedisClient();
    return client.delete(key);
  },

  async deletePattern(pattern: string): Promise<number> {
    const client = await getRedisClient();
    return client.deletePattern(pattern);
  },

  async exists(key: string): Promise<boolean> {
    const client = await getRedisClient();
    return client.exists(key);
  },

  async disconnect(): Promise<void> {
    const client = await getRedisClient();
    return client.disconnect();
  },

  getConnectionStatus(): { connected: boolean; reconnectAttempts: number } {
    // Synchronous method - return best guess
    if (!isRedisEnabled()) {
      return { connected: true, reconnectAttempts: 0 }; // In-memory is always "connected"
    }
    return (
      cachedRedisClient?.getConnectionStatus() ?? {
        connected: false,
        reconnectAttempts: 0,
      }
    );
  },
};

/**
 * DIVINE PATTERN: Batch Operations
 * Perform multiple operations efficiently with single client load
 */
export async function batchRedisOperations<T>(
  operations: Array<(client: IRedisClient) => Promise<T>>,
): Promise<T[]> {
  const client = await getRedisClient();
  return Promise.all(operations.map((op: any) => op(client)));
}

/**
 * QUANTUM PATTERN: Conditional Redis
 * Use Redis if enabled, otherwise execute fallback function
 */
export async function withRedisOrFallback<T>(
  redisOperation: (client: IRedisClient) => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  if (!isRedisEnabled()) {
    return fallback();
  }

  try {
    const client = await getRedisClient();
    return await redisOperation(client);
  } catch (error) {
    redisLazyLogger.warn("Redis operation failed, using fallback", {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return fallback();
  }
}

/**
 * AGRICULTURAL CONSCIOUSNESS: Seasonal Cache
 * Cache with automatic seasonal prefixes
 */
export async function setSeasonalCache(
  key: string,
  value: unknown,
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER",
  ttl?: number,
): Promise<boolean> {
  const client = await getRedisClient();
  const seasonalKey = `${season.toLowerCase()}:${key}`;
  return client.set(seasonalKey, value, ttl);
}

export async function getSeasonalCache<T>(
  key: string,
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER",
): Promise<T | null> {
  const client = await getRedisClient();
  const seasonalKey = `${season.toLowerCase()}:${key}`;
  return client.get<T>(seasonalKey);
}

/**
 * PERFORMANCE MONITORING: Redis Status Check
 * Get Redis status without loading full client
 */
export function getRedisStatus(): {
  enabled: boolean;
  clientLoaded: boolean;
  connectionStatus: { connected: boolean; reconnectAttempts: number };
} {
  return {
    enabled: isRedisEnabled(),
    clientLoaded: cachedRedisClient !== null,
    connectionStatus: redisClientLazy.getConnectionStatus(),
  };
}

/**
 * UTILITY: Force Redis Client Load
 * Preload Redis client before it's needed (e.g., on server startup)
 */
export async function preloadRedisClient(): Promise<void> {
  if (isRedisEnabled() && !cachedRedisClient) {
    await getRedisClient();
  }
}

/**
 * UTILITY: Reset Cached Client
 * Useful for testing or hot reload scenarios
 */
export function resetRedisClientCache(): void {
  cachedRedisClient = null;
  if (inMemoryClient) {
    inMemoryClient.disconnect();
    inMemoryClient = null;
  }
}

/**
 * TYPE EXPORTS
 * Re-export types for convenience
 */
export type RedisOperation<T> = (client: IRedisClient) => Promise<T>;
