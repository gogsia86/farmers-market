import EventEmitter from 'events';

class RedisMock extends EventEmitter {
  private store: Map<string, { value: string; expiry: number | null }>;

  constructor() {
    super();
    this.store = new Map();
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    this.store.set(key, {
      value,
      expiry: Date.now() + seconds * 1000
    });
    return 'OK';
  }

  async set(key: string, value: string): Promise<'OK'> {
    this.store.set(key, {
      value,
      expiry: null
    });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.delete(key);
    return existed ? 1 : 0;
  }

  async flushall(): Promise<'OK'> {
    this.store.clear();
    return 'OK';
  }
}

let mock: RedisMock;

export function getRedisMock() {
  if (!mock) {
    mock = new RedisMock();
  }
  return mock;
}

export function clearRedisMock() {
  mock = new RedisMock();
}

jest.mock('ioredis', () => {
  return {
    default: jest.fn().mockImplementation(() => getRedisMock())
  };
});