/**
 * REDIS CACHE INFRASTRUCTURE
 * Divine caching with agricultural consciousness
 *
 * Reference: 03_PERFORMANCE_REALITY_BENDING.instructions.md
 * Domain: Agricultural cache management with seasonal awareness
 */

import { createLogger } from "@/lib/utils/logger";
import Redis from "ioredis";

// Create dedicated logger for Redis operations
const redisLogger = createLogger("Redis");

export interface RedisCacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix: string;
  maxRetries: number;
  retryStrategy?: (times: number) => number;
  tls?: boolean;
  username?: string;
}

export interface CacheOptions {
  ttl?: number; // seconds
  seasonal?: boolean;
  compress?: boolean;
}

/**
 * REDIS QUANTUM CLIENT
 * High-performance Redis client with connection management
 */
class RedisQuantumClient {
  private client: Redis | null = null;
  private readonly config: RedisCacheConfig;
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(config: RedisCacheConfig) {
    this.config = config;
  }

  /**
   * Connect to Redis with retry logic
   */
  async connect(): Promise<void> {
    if (
      this.client &&
      (this.client.status === "ready" || this.client.status === "connecting")
    ) {
      return;
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = this.performConnection();

    try {
      await this.connectionPromise;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  private async performConnection(): Promise<void> {
    try {
      this.client = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        username: this.config.username,
        db: this.config.db || 0,
        retryStrategy:
          this.config.retryStrategy || ((times) => Math.min(times * 100, 3000)),
        tls: this.config.tls
          ? {
              rejectUnauthorized: false, // Allow self-signed certificates for Redis Cloud
              servername: this.config.host,
            }
          : undefined,
        enableOfflineQueue: true,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: false,
        showFriendlyErrorStack: process.env.NODE_ENV === "development",
      });

      this.client.on("error", (error) => {
        redisLogger.error("Redis client error", {
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      });

      this.client.on("connect", () => {
        redisLogger.info("Redis client connected", {
          host: this.config.host,
          port: this.config.port,
        });
      });

      this.client.on("close", () => {
        redisLogger.warn("Redis client disconnected");
      });

      // ioredis connects automatically on instantiation, but ensure readiness
      await this.client.connect();
    } catch (error) {
      redisLogger.error("Failed to connect to Redis", {
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  /**
   * Get Redis client instance
   */
  async getClient(): Promise<Redis> {
    await this.connect();
    if (!this.client) {
      throw new Error("Redis client not initialized");
    }
    return this.client;
  }

  /**
   * Build cache key with prefix
   */
  buildKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }
}

/**
 * REDIS CACHE SERVICE
 * High-level caching operations with agricultural consciousness
 */
export class RedisCacheService {
  private readonly redisClient: RedisQuantumClient;
  private readonly DEFAULT_TTL = 3600; // 1 hour

  constructor(config: RedisCacheConfig) {
    this.redisClient = new RedisQuantumClient(config);
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = await this.redisClient.getClient();
      const fullKey = this.redisClient.buildKey(key);

      const value = await client.get(fullKey);

      if (!value) {
        redisLogger.debug("Cache miss", { key });
        return null;
      }

      redisLogger.debug("Cache hit", { key });
      return JSON.parse(value) as T;
    } catch (error) {
      redisLogger.error("Redis get error", {
        key,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<boolean> {
    try {
      const client = await this.redisClient.getClient();
      const fullKey = this.redisClient.buildKey(key);

      const serialized = JSON.stringify(value);
      const ttl = options.ttl || this.DEFAULT_TTL;

      await client.setex(fullKey, ttl, serialized);

      redisLogger.debug("Cache set", { key, ttl });
      return true;
    } catch (error) {
      redisLogger.error("Redis set error", {
        key,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const client = await this.redisClient.getClient();
      const fullKey = this.redisClient.buildKey(key);

      await client.del(fullKey);

      redisLogger.debug("Cache delete", { key });
      return true;
    } catch (error) {
      redisLogger.error("Redis delete error", {
        key,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Delete keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const client = await this.redisClient.getClient();
      const fullPattern = this.redisClient.buildKey(pattern);

      const keys = await client.keys(fullPattern);

      if (keys.length === 0) {
        return 0;
      }

      await client.del(keys);

      redisLogger.debug("Cache pattern delete", {
        pattern,
        count: keys.length,
      });
      return keys.length;
    } catch (error) {
      redisLogger.error("Redis pattern delete error", {
        pattern,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Compute value
    const value = await factory();

    // Store in cache
    await this.set(key, value, options);

    return value;
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const client = await this.redisClient.getClient();
      const fullKey = this.redisClient.buildKey(key);

      const exists = await client.exists(fullKey);
      return exists === 1;
    } catch (error) {
      redisLogger.error("Redis exists error", {
        key,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Get TTL for key
   */
  async ttl(key: string): Promise<number> {
    try {
      const client = await this.redisClient.getClient();
      const fullKey = this.redisClient.buildKey(key);

      return await client.ttl(fullKey);
    } catch (error) {
      redisLogger.error("Redis TTL error", {
        key,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return -1;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      const client = await this.redisClient.getClient();
      const fullKey = this.redisClient.buildKey(key);

      return await client.incrby(fullKey, amount);
    } catch (error) {
      redisLogger.error("Redis increment error", {
        key,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }

  /**
   * Flush all cache
   */
  async flushAll(): Promise<boolean> {
    try {
      const client = await this.redisClient.getClient();
      await client.flushdb();

      redisLogger.warn("Cache flushed");
      return true;
    } catch (error) {
      redisLogger.error("Redis flush error", {
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    await this.redisClient.disconnect();
  }
}

/**
 * SINGLETON REDIS INSTANCE
 * Global Redis cache service
 */
let redisInstance: RedisCacheService | null = null;

export function getRedisCache(): RedisCacheService {
  if (!redisInstance) {
    const config: RedisCacheConfig = {
      host: process.env.REDIS_HOST || "localhost",
      port: Number.parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME || "default",
      db: Number.parseInt(process.env.REDIS_DB || "0", 10),
      keyPrefix: process.env.REDIS_KEY_PREFIX || "fm:",
      maxRetries: 3,
      tls: process.env.REDIS_TLS_ENABLED === "true",
    };

    redisInstance = new RedisCacheService(config);
  }

  return redisInstance;
}

/**
 * HEALTH CHECK
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const redis = getRedisCache();
    await redis.set("health:check", { timestamp: Date.now() }, { ttl: 10 });
    const result = await redis.get<{ timestamp: number }>("health:check");
    return result !== null;
  } catch (error) {
    redisLogger.error("Redis health check failed", {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
