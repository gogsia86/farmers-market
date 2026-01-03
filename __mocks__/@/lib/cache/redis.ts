/**
 * ⚡ DIVINE REDIS CACHE MOCK
 * Global mock for Redis cache service used across all tests
 * Reference: Jest manual mocks pattern
 */

import { jest } from "@jest/globals";

// Mock Redis cache instance
export const mockRedisCache = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  deletePattern: jest.fn(),
  exists: jest.fn(),
  ttl: jest.fn(),
  getOrSet: jest.fn(),
  increment: jest.fn(),
  flushAll: jest.fn(),
  disconnect: jest.fn(),
};

// Mock getRedisCache function
export const getRedisCache = jest.fn(() => mockRedisCache);

// Mock health check function
export const checkRedisHealth = jest.fn(async () => true);

// Export RedisCacheService class for type compatibility
export class RedisCacheService {
  async get<T>(key: string): Promise<T | null> {
    return mockRedisCache.get(key);
  }

  async set<T>(key: string, value: T, options?: any): Promise<boolean> {
    return mockRedisCache.set(key, value, options);
  }

  async delete(key: string): Promise<boolean> {
    return mockRedisCache.delete(key);
  }

  async deletePattern(pattern: string): Promise<number> {
    return mockRedisCache.deletePattern(pattern);
  }

  async exists(key: string): Promise<boolean> {
    return mockRedisCache.exists(key);
  }

  async ttl(key: string): Promise<number> {
    return mockRedisCache.ttl(key);
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: any,
  ): Promise<T> {
    return mockRedisCache.getOrSet(key, factory, options);
  }

  async increment(key: string, amount?: number): Promise<number> {
    return mockRedisCache.increment(key, amount);
  }

  async flushAll(): Promise<boolean> {
    return mockRedisCache.flushAll();
  }

  async disconnect(): Promise<void> {
    return mockRedisCache.disconnect();
  }
}

// Default export
export default {
  getRedisCache,
  checkRedisHealth,
  RedisCacheService,
  mockRedisCache,
};
