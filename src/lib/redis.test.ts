import { jest } from '@jest/globals';
import type Redis from 'ioredis';
import { EventEmitter } from 'events';
import { cacheGet, cacheSet, cacheDelete, cacheFlush } from './redis';

interface QuantumRedisEntry {
  value: string;
  expiry: number | null;
  version: number;
  lastAccess: number;
  createTime: number;
  updateCount: number;
}

type RedisMockFunctions = {
  get: jest.Mock<(key: string) => Promise<string | null>>;
  set: jest.Mock<(key: string, value: string) => Promise<'OK'>>;
  setex: jest.Mock<(key: string, seconds: number, value: string) => Promise<'OK'>>;
  del: jest.Mock<(key: string) => Promise<number>>;
  flushall: jest.Mock<() => Promise<'OK'>>;
  on: jest.Mock<(event: string, callback: (...args: any[]) => void) => void>;
  getStats: jest.Mock<() => object>;
  disconnect: jest.Mock<() => void>;
  quit: jest.Mock<() => Promise<'OK'>>;
  subscribe: jest.Mock<(channel: string, callback: (channel: string, message: string) => void) => void>;
  publish: jest.Mock<(channel: string, message: string) => Promise<number>>;
};

class MockQuantumRedisStore {
  private store = new Map<string, QuantumRedisEntry>();

  set(key: string, value: string, expiry: number | null = null): void {
    const existingEntry = this.store.get(key);
    this.store.set(key, {
      value,
      expiry,
      version: (existingEntry?.version ?? 0) + 1,
      lastAccess: Date.now(),
      createTime: existingEntry?.createTime ?? Date.now(),
      updateCount: (existingEntry?.updateCount ?? 0) + 1
    });
  }

  get(key: string): { value: string; metadata: any } | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiry && Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }

    entry.lastAccess = Date.now();
    return {
      value: entry.value,
      metadata: {
        version: entry.version,
        age: Date.now() - entry.createTime,
        lastAccess: entry.lastAccess,
        updateCount: entry.updateCount
      }
    };
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getStats(): object {
    const now = Date.now();
    const entries = Array.from(this.store.entries());
    
    return {
      size: this.store.size,
      expired: entries.filter(([, v]) => v.expiry && v.expiry < now).length,
      active: entries.filter(([, v]) => !v.expiry || v.expiry > now).length,
      averageAge: entries.reduce((acc, [, v]) => acc + (now - v.createTime), 0) / (entries.length || 1),
      totalUpdates: entries.reduce((acc, [, v]) => acc + v.updateCount, 0)
    };
  }
}

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    const store = new MockQuantumRedisStore();
    const emitter = new EventEmitter();

    const instance = {
      store,
      get: jest.fn().mockImplementation(async (key: string) => {
        const result = store.get(key);
        emitter.emit('command', { command: 'get', key, result: !!result });
        return result?.value ?? null;
      }),
      set: jest.fn().mockImplementation(async (key: string, value: string) => {
        store.set(key, value);
        emitter.emit('command', { command: 'set', key });
        return 'OK';
      }),
      setex: jest.fn().mockImplementation(async (key: string, seconds: number, value: string) => {
        store.set(key, value, Date.now() + seconds * 1000);
        emitter.emit('command', { command: 'setex', key, ttl: seconds });
        return 'OK';
      }),
      del: jest.fn().mockImplementation(async (key: string) => {
        const deleted = store.delete(key);
        emitter.emit('command', { command: 'del', key, result: deleted });
        return deleted ? 1 : 0;
      }),
      flushall: jest.fn().mockImplementation(async () => {
        store.clear();
        emitter.emit('command', { command: 'flushall' });
        return 'OK';
      }),
      on: jest.fn().mockImplementation((event, callback) => {
        emitter.on(event, callback);
      }),
      getStats: jest.fn().mockImplementation(() => store.getStats()),
      disconnect: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
      subscribe: jest.fn(),
      publish: jest.fn().mockResolvedValue(0)
    };

    return instance;
  });
});

describe('Redis Cache', () => {
  let redis: Redis & RedisMockFunctions;
  type CommandEvent = { command: string; key?: string; result?: boolean; ttl?: number };
  let commandEvents: CommandEvent[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    commandEvents = [];
    const RedisMock = jest.requireMock('ioredis') as jest.Mock;
    redis = new RedisMock() as Redis & RedisMockFunctions;
    redis.on('command', (event: CommandEvent) => commandEvents.push(event));
  });

  describe('cacheGet', () => {
    test('returns null for non-existent key', async () => {
      const result = await cacheGet('test');
      expect(result).toBeNull();
      expect(commandEvents).toEqual([
        expect.objectContaining({
          command: 'get',
          key: 'test',
          result: false
        })
      ]);
    });

    test('returns parsed data for existing key', async () => {
      const data = { foo: 'bar' };
      await cacheSet('test', data);
      const result = await cacheGet('test');
      expect(result).toEqual(data);
      expect(commandEvents).toEqual(expect.arrayContaining([
        expect.objectContaining({
          command: 'get',
          key: 'test',
          result: true
        })
      ]));
    });

    test('returns null for expired key', async () => {
      const data = { test: 'value' };
      await cacheSet('test', data, 0); // Immediate expiration
      await new Promise(resolve => setTimeout(resolve, 1));
      const result = await cacheGet('test');
      expect(result).toBeNull();
    });
  });

  describe('cacheSet', () => {
    test('sets cache with default expiration', async () => {
      const data = { test: 'value' };
      await cacheSet('key', data);
      expect(commandEvents).toEqual(expect.arrayContaining([
        expect.objectContaining({
          command: 'setex',
          key: 'key',
          ttl: 3600
        })
      ]));

      // Verify quantum state
      const stats = redis.getStats();
      expect(stats).toEqual(expect.objectContaining({
        size: 1,
        active: 1,
        expired: 0
      }));
    });

    test('sets cache with custom expiration', async () => {
      const data = { test: 'value' };
      const ttl = 1800;
      await cacheSet('key', data, ttl);
      expect(commandEvents).toEqual(expect.arrayContaining([
        expect.objectContaining({
          command: 'setex',
          key: 'key',
          ttl: ttl
        })
      ]));
    });

    test('updates version and count on multiple sets', async () => {
      const key = 'test-key';
      await cacheSet(key, { value: 1 });
      await cacheSet(key, { value: 2 });
      await cacheSet(key, { value: 3 });

      const stats = redis.getStats();
      expect(stats).toEqual(expect.objectContaining({
        totalUpdates: 3,
        size: 1
      }));
    });
  });

  describe('cacheDelete', () => {
    test('deletes value and emits event', async () => {
      await cacheSet('key', { data: 'test' });
      await cacheDelete('key');
      expect(commandEvents).toEqual(expect.arrayContaining([
        expect.objectContaining({
          command: 'del',
          key: 'key',
          result: true
        })
      ]));

      const stats = redis.getStats();
      expect(stats.size).toBe(0);
    });

    test('returns false when deleting non-existent key', async () => {
      await cacheDelete('non-existent');
      expect(commandEvents).toEqual(expect.arrayContaining([
        expect.objectContaining({
          command: 'del',
          key: 'non-existent',
          result: false
        })
      ]));
    });
  });

  describe('cacheFlush', () => {
    test('flushes all cache and emits event', async () => {
      await cacheSet('key1', { data: 1 });
      await cacheSet('key2', { data: 2 });
      await cacheFlush();
      
      expect(commandEvents).toEqual(expect.arrayContaining([
        expect.objectContaining({
          command: 'flushall'
        })
      ]));

      const stats = redis.getStats();
      expect(stats).toEqual(expect.objectContaining({
        size: 0,
        active: 0
      }));
    });
  });

  describe('connection management', () => {
    test('disconnects cleanly', async () => {
      let disconnected = false;
      redis.on('end', () => {
        disconnected = true;
      });

      redis.disconnect();
      expect(disconnected).toBe(true);
    });

    test('quits gracefully', async () => {
      const result = await redis.quit();
      expect(result).toBe('OK');
    });
  });

  describe('pub/sub functionality', () => {
    test('subscribes and receives messages', async () => {
      const messages: any[] = [];
      const channel = 'test-channel';
      
      redis.subscribe(channel, (ch: string, message: string) => {
        messages.push({ channel: ch, message });
      });

      await redis.publish(channel, 'test message');
      expect(messages).toEqual([
        {
          channel: 'test-channel',
          message: 'test message'
        }
      ]);
    });
  });
});