/**
 * 🔄 REDIS CLIENT
 * Centralized Redis client with connection pooling
 * Handles reconnection and error recovery
 */

import { logger } from '@/lib/monitoring/logger';
import Redis from 'ioredis';

// ============================================================================
// REDIS CLIENT SINGLETON
// ============================================================================

class RedisClient {
  private client: Redis | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Skip Redis in test environment or if not configured
    if (
      process.env.NODE_ENV === 'test' ||
      !process.env.REDIS_URL
    ) {
      logger.info('Redis client not initialized (test mode or REDIS_URL not set)');
      return;
    }

    try {
      this.client = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
        retryStrategy: (times) => {
          if (times > this.maxReconnectAttempts) {
            logger.error('Redis max reconnection attempts reached', {
              attempts: times
            });
            return null; // Stop retrying
          }
          const delay = Math.min(times * 100, 3000);
          return delay;
        },
      });

      // Event handlers
      this.client.on('connect', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        logger.info('Redis client connected');
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
      });

      this.client.on('error', (error) => {
        this.isConnected = false;
        logger.error('Redis client error', {
          error: error instanceof Error ? error.message : String(error)
        });
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('Redis client connection closed');
      });

      this.client.on('reconnecting', () => {
        this.reconnectAttempts++;
        logger.info('Redis client reconnecting', {
          attempt: this.reconnectAttempts
        });
      });

      // Attempt connection
      this.client.connect().catch((error) => {
        logger.error('Failed to connect to Redis', {
          error: error instanceof Error ? error.message : String(error)
        });
      });
    } catch (error) {
      logger.error('Redis initialization failed', {
        error: error instanceof Error ? error.message : String(error)
      });
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
      logger.error('Redis GET error', {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
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
      logger.error('Redis SET error', {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  async delete(key: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error('Redis delete error', {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      return 0;
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;

      return await this.client.del(...keys);
    } catch (error) {
      logger.error('Redis DELETE PATTERN error', {
        pattern,
        error: error instanceof Error ? error.message : String(error)
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
      logger.error('Redis EXISTS error', {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  async flushAll(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      await this.client.flushall();
      logger.info('Redis cache cleared');
    } catch (error) {
      logger.error('Redis FLUSHALL error', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async ping(): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING error', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        this.isConnected = false;
        logger.info('Redis client disconnected');
      } catch (error) {
        logger.error('Redis disconnect error', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const redisClient = new RedisClient();

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { Redis };
