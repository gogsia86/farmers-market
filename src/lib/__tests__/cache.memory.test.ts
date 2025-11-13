import { beforeEach, describe, expect, it, vi } from "vitest";

describe("cache (memory fallback)", () => {
  beforeEach(async () => {
    // Force memory cache by clearing Redis env and reloading module
    delete (process.env as any).REDIS_HOST;
    vi.resetModules();
  });

  it("getOrSet caches computed value", async () => {
    const { default: cache } = await import("@/lib/cache");
    const key = `test:key:${Math.random()}`;
    let computeCount = 0;

    const fetcher = async () => {
      computeCount += 1;
      return { value: 42 };
    };

    const a = await (cache as any).getOrSet(key, fetcher, 10);
    const b = await (cache as any).getOrSet(key, fetcher, 10);

    expect(a).toEqual({ value: 42 });
    expect(b).toEqual({ value: 42 });
    expect(computeCount).toBe(1);
  });

  it("invalidatePattern removes matching keys", async () => {
    const { default: cache } = await import("@/lib/cache");
    const base = `products:season:SPRING:${Math.random().toString(36).slice(2)}`;
    const k1 = `${base}:a`;
    const k2 = `${base}:b`;

    await (cache as any).set(k1, { a: 1 }, 60);
    await (cache as any).set(k2, { b: 2 }, 60);

    expect(await (cache as any).has(k1)).toBe(true);
    expect(await (cache as any).has(k2)).toBe(true);

    await (cache as any).invalidatePattern(base);

    expect(await (cache as any).has(k1)).toBe(false);
    expect(await (cache as any).has(k2)).toBe(false);
  });
});
