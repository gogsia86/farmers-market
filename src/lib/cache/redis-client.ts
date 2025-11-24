/**
 * REDIS DIVINE CACHE CLIENT
 * Multi-layer caching with agricultural consciousness
 */

import type { Redis as RedisType } from "ioredis";
import Redis from "ioredis";
import { logger } from "../monitoring/logger";
import type { RedisConfig } from "./types";

class RedisClient {
  private client: RedisType | null = null;
  private isConnected: boolean = false;
  private readonly config: RedisConfig;
  private logger = logger;

  constructor() {
    this.config = {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD,
      keyPrefix: process.env.REDIS_KEY_PREFIX || "fm:",
      maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || "3", 10),
      retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || "1000", 10),
    };

    this.initialize();
  }

  private initialize(): void {
    if (process.env.REDIS_ENABLED !== "true") {
      this.logger.info("Redis cache disabled - using in-memory fallback");
      return;
    }

    try {
      this.client = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        keyPrefix: this.config.keyPrefix,
        retryStrategy: (times: number) => {
          if (times > this.config.maxRetries) {
            this.logger.error(
              "Redis max retries exceeded - falling back to memory cache",
            );
            return null;
          }
          return Math.min(times * this.config.retryDelay, 3000);
        },
        lazyConnect: true,
      });

      this.client.on("connect", () => {
        this.isConnected = true;
        this.logger.info("Redis connected successfully", {
          host: this.config.host,
          port: this.config.port,
        });
      });

      this.client.on("error", (error) => {
        this.logger.error("Redis error occurred", error);
        this.isConnected = false;
      });

      this.client.on("close", () => {
        this.isConnected = false;
        this.logger.warn("Redis connection closed");
      });

      // Attempt connection
      this.client.connect().catch((error) => {
        this.logger.error("Failed to connect to Redis", error);
      });
    } catch (error) {
      this.logger.error("Redis initialization failed", error as Error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error("Redis GET error", error as Error, { key });
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);

      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }

      return true;
    } catch (error) {
      this.logger.error("Redis SET error", error as Error, { key });
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      await this.client.del(key);
      this.logger.debug("Deleted key from Redis", { key });
    } catch (error) {
      this.logger.error("Redis delete error", error as Error, { key });
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;

      const deleted = await this.client.del(...keys);
      return deleted;
    } catch (error) {
      this.logger.error("Redis DELETE PATTERN error", error as Error, {
        pattern,
      });
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error("Redis EXISTS error", error as Error, { key });
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      this.logger.info("Disconnecting from Redis...");
      await this.client.disconnect();
      this.logger.info("Disconnected from Redis");
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const redisClient = new RedisClient();
