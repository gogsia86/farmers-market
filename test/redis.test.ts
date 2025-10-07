import { jest } from '@jest/globals';
import type Redis from 'ioredis';
import { cacheGet } from '../src/lib/redis';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    flushall: jest.fn(),
    on: jest.fn()
  }));
});

describe('Redis Cache', () => {
  let redis: jest.Mocked<Redis>;

  beforeEach(() => {
    jest.clearAllMocks();
    redis = new (jest.requireMock('ioredis'))();
  });

  test('cacheGet returns null for non-existent key', async () => {
    (redis.get as jest.Mock).mockResolvedValueOnce(null);
    const result = await cacheGet('test');
    expect(result).toBeNull();
  });
});