import Redis from 'ioredis';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
    redisClient.on('error', (err: Error) => {
      console.error('Redis Client Error:', err);
    });
  }
  return redisClient;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Error getting cache:', err);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  expirationInSeconds: number = 3600
): Promise<void> {
  try {
    const client = getRedisClient();
    await client.setex(key, expirationInSeconds, JSON.stringify(value));
  } catch (err) {
    console.error('Error setting cache:', err);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (err) {
    console.error('Error deleting cache:', err);
  }
}

export async function cacheFlush(): Promise<void> {
  try {
    const client = getRedisClient();
    await client.flushall();
  } catch (err) {
    console.error('Error flushing cache:', err);
  }
}