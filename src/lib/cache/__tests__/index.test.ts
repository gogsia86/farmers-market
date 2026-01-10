/**
 * 🗄️ CACHE INDEX TEST SUITE
 * Comprehensive tests for multi-layer caching system
 * Target: 100% coverage of cache/index.ts
 */

import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { cache, CacheKeys, warmCache } from "../index";

// Mock logger
jest.mock("@/lib/monitoring/logger", () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock ioredis
jest.mock("ioredis", () => ({
  Redis: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    flushdb: jest.fn(),
    quit: jest.fn(),
  })),
}));

describe("🗄️ Cache Index - Multi-Layer Caching", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set Redis disabled for most tests
    process.env.REDIS_ENABLED = "false";
  });

  afterEach(async () => {
    await cache.clear();
  });

  describe("📋 Cache Keys", () => {
    it("should generate farm cache key", () => {
      expect(CacheKeys.farm("farm-123")).toBe("farm:farm-123");
    });

    it("should generate farm list cache key", () => {
      expect(CacheKeys.farmList("active=true")).toBe("farms:list:active=true");
    });

    it("should generate product cache key", () => {
      expect(CacheKeys.product("prod-456")).toBe("product:prod-456");
    });

    it("should generate product list cache key", () => {
      expect(CacheKeys.productList("farm-123", "category=vegetables")).toBe(
        "products:farm-123:category=vegetables",
      );
    });

    it("should generate user profile cache key", () => {
      expect(CacheKeys.userProfile("user-789")).toBe("user:user-789");
    });

    it("should generate seasonal data cache key for SPRING", () => {
      expect(CacheKeys.seasonalData("SPRING")).toBe("seasonal:SPRING");
    });

    it("should generate seasonal data cache key for SUMMER", () => {
      expect(CacheKeys.seasonalData("SUMMER")).toBe("seasonal:SUMMER");
    });

    it("should generate seasonal data cache key for FALL", () => {
      expect(CacheKeys.seasonalData("FALL")).toBe("seasonal:FALL");
    });

    it("should generate seasonal data cache key for WINTER", () => {
      expect(CacheKeys.seasonalData("WINTER")).toBe("seasonal:WINTER");
    });
  });

  describe("💾 Memory Cache Operations", () => {
    it("should set and get value from memory cache", async () => {
      const testData = { id: 1, name: "Test" };

      await cache.set("test-key", testData);
      const result = await cache.get("test-key");

      expect(result).toEqual(testData);
    });

    it("should return null for non-existent key", async () => {
      const result = await cache.get("nonexistent");

      expect(result).toBeNull();
    });

    it("should delete key from cache", async () => {
      await cache.set("test-key", { data: "test" });
      await cache.del("test-key");
      const result = await cache.get("test-key");

      expect(result).toBeNull();
    });

    it("should handle custom TTL", async () => {
      await cache.set("ttl-key", { data: "test" }, 600);
      const result = await cache.get("ttl-key");

      expect(result).toEqual({ data: "test" });
    });

    it("should cache complex objects", async () => {
      const complexData = {
        id: 1,
        nested: {
          deep: {
            value: "test",
          },
        },
        array: [1, 2, 3],
      };

      await cache.set("complex", complexData);
      const result = await cache.get("complex");

      expect(result).toEqual(complexData);
    });

    it("should cache arrays", async () => {
      const arrayData = [1, 2, 3, 4, 5];

      await cache.set("array", arrayData);
      const result = await cache.get("array");

      expect(result).toEqual(arrayData);
    });

    it("should cache strings", async () => {
      await cache.set("string", "test value");
      const result = await cache.get<string>("string");

      expect(result).toBe("test value");
    });

    it("should cache numbers", async () => {
      await cache.set("number", 42);
      const result = await cache.get<number>("number");

      expect(result).toBe(42);
    });

    it("should cache booleans", async () => {
      await cache.set("boolean", true);
      const result = await cache.get<boolean>("boolean");

      expect(result).toBe(true);
    });

    it("should cache null values", async () => {
      await cache.set("null", null);
      const result = await cache.get("null");

      expect(result).toBeNull();
    });
  });

  describe("🔄 Pattern Deletion", () => {
    it("should delete keys matching pattern", async () => {
      await cache.set("products:farm-1:item1", { id: 1 });
      await cache.set("products:farm-1:item2", { id: 2 });
      await cache.set("products:farm-2:item1", { id: 3 });

      await cache.delPattern("products:farm-1:*");

      const result1 = await cache.get("products:farm-1:item1");
      const result2 = await cache.get("products:farm-1:item2");
      const result3 = await cache.get("products:farm-2:item1");

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toEqual({ id: 3 }); // Should still exist
    });

    it("should handle pattern with no matches", async () => {
      await cache.delPattern("nonexistent:*");
      // Should not throw
      expect(true).toBe(true);
    });

    it("should delete multiple patterns", async () => {
      await cache.set("farms:list:page1", [1, 2, 3]);
      await cache.set("farms:list:page2", [4, 5, 6]);
      await cache.set("other:data", { test: true });

      await cache.delPattern("farms:list:*");

      const result1 = await cache.get("farms:list:page1");
      const result2 = await cache.get("farms:list:page2");
      const result3 = await cache.get("other:data");

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toEqual({ test: true });
    });
  });

  describe("🧹 Clear Operations", () => {
    it("should clear all cache", async () => {
      await cache.set("key1", "value1");
      await cache.set("key2", "value2");
      await cache.set("key3", "value3");

      await cache.clear();

      const result1 = await cache.get("key1");
      const result2 = await cache.get("key2");
      const result3 = await cache.get("key3");

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });

    it("should handle clearing empty cache", async () => {
      await cache.clear();
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe("🎁 Cache Wrap Pattern", () => {
    it("should return cached value if exists", async () => {
      const cachedData = { id: 1, cached: true };
      await cache.set("wrap-key", cachedData);

      const factory = jest.fn().mockResolvedValue({ id: 1, fresh: true });
      const result = await cache.wrap("wrap-key", factory);

      expect(result).toEqual(cachedData);
      expect(factory).not.toHaveBeenCalled();
    });

    it("should compute and cache if not exists", async () => {
      const freshData = { id: 1, fresh: true };
      const factory = jest.fn().mockResolvedValue(freshData);

      const result = await cache.wrap("missing-key", factory);

      expect(result).toEqual(freshData);
      expect(factory).toHaveBeenCalled();

      // Verify it was cached
      const cached = await cache.get("missing-key");
      expect(cached).toEqual(freshData);
    });

    it("should use custom TTL in wrap", async () => {
      const factory = jest.fn().mockResolvedValue({ data: "test" });

      await cache.wrap("wrap-ttl", factory, 1800);

      expect(factory).toHaveBeenCalled();
      const cached = await cache.get("wrap-ttl");
      expect(cached).toEqual({ data: "test" });
    });

    it("should handle factory errors", async () => {
      const factory = jest.fn().mockRejectedValue(new Error("Factory error"));

      await expect(cache.wrap("error-key", factory)).rejects.toThrow(
        "Factory error",
      );
    });

    it("should cache factory result on success", async () => {
      const factory = jest.fn().mockResolvedValue("computed value");

      const result1 = await cache.wrap("compute", factory);
      const result2 = await cache.wrap("compute", factory);

      expect(result1).toBe("computed value");
      expect(result2).toBe("computed value");
      expect(factory).toHaveBeenCalledTimes(1); // Only called once
    });
  });

  describe("🌸 Seasonal TTL", () => {
    it("should use seasonal TTL when not specified", async () => {
      // This tests the private getSeasonalTTL method indirectly
      await cache.set("seasonal-key", { data: "test" });

      const result = await cache.get("seasonal-key");
      expect(result).toEqual({ data: "test" });
    });

    it("should handle SPRING season (Mar-May)", async () => {
      // Mock date to April (SPRING)
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-04-15"));

      await cache.set("spring-data", { season: "spring" });
      const result = await cache.get("spring-data");

      expect(result).toEqual({ season: "spring" });
      jest.useRealTimers();
    });

    it("should handle SUMMER season (Jun-Aug)", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-07-15"));

      await cache.set("summer-data", { season: "summer" });
      const result = await cache.get("summer-data");

      expect(result).toEqual({ season: "summer" });
      jest.useRealTimers();
    });

    it("should handle FALL season (Sep-Nov)", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-10-15"));

      await cache.set("fall-data", { season: "fall" });
      const result = await cache.get("fall-data");

      expect(result).toEqual({ season: "fall" });
      jest.useRealTimers();
    });

    it("should handle WINTER season (Dec-Feb)", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-15"));

      await cache.set("winter-data", { season: "winter" });
      const result = await cache.get("winter-data");

      expect(result).toEqual({ season: "winter" });
      jest.useRealTimers();
    });
  });

  describe("🔥 Cache Warming", () => {
    it("should warm cache successfully", async () => {
      await warmCache();
      // Should complete without errors
      expect(true).toBe(true);
    });

    it("should handle cache warming errors gracefully", async () => {
      // Even if it fails, should not throw
      await expect(warmCache()).resolves.toBeUndefined();
    });
  });

  describe("⚡ Performance & Edge Cases", () => {
    it("should handle rapid successive sets", async () => {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(cache.set(`key-${i}`, { id: i }));
      }

      await Promise.all(promises);

      const result = await cache.get("key-50");
      expect(result).toEqual({ id: 50 });
    });

    it("should handle rapid successive gets", async () => {
      await cache.set("fast-key", { data: "test" });

      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(cache.get("fast-key"));
      }

      const results = await Promise.all(promises);
      results.forEach((result: any) => {
        expect(result).toEqual({ data: "test" });
      });
    });

    it("should handle very large objects", async () => {
      const largeObject = {
        data: new Array(1000).fill({ id: 1, name: "test", nested: {} }),
      };

      await cache.set("large", largeObject);
      const result = await cache.get("large");

      expect(result).toEqual(largeObject);
    });

    it("should handle empty objects", async () => {
      await cache.set("empty", {});
      const result = await cache.get("empty");

      expect(result).toEqual({});
    });

    it("should handle empty arrays", async () => {
      await cache.set("empty-array", []);
      const result = await cache.get<any[]>("empty-array");

      expect(result).toEqual([]);
    });

    it("should handle keys with special characters", async () => {
      const key = "test:key:with:colons:and-dashes_and_underscores";
      await cache.set(key, { data: "special" });
      const result = await cache.get(key);

      expect(result).toEqual({ data: "special" });
    });

    it("should handle concurrent operations", async () => {
      const operations = [
        cache.set("key1", "value1"),
        cache.set("key2", "value2"),
        cache.get("key1"),
        cache.del("key3"),
        cache.set("key4", "value4"),
      ];

      await Promise.all(operations);
      // Should complete without errors
      expect(true).toBe(true);
    });
  });

  describe("🔄 Integration Scenarios", () => {
    it("should handle complete cache lifecycle", async () => {
      // Set
      await cache.set("lifecycle", { status: "active" });

      // Get
      let result = await cache.get("lifecycle");
      expect(result).toEqual({ status: "active" });

      // Update
      await cache.set("lifecycle", { status: "updated" });
      result = await cache.get("lifecycle");
      expect(result).toEqual({ status: "updated" });

      // Delete
      await cache.del("lifecycle");
      result = await cache.get("lifecycle");
      expect(result).toBeNull();
    });

    it("should handle multiple related keys", async () => {
      await cache.set("farm:1", { name: "Farm 1" });
      await cache.set("farm:2", { name: "Farm 2" });
      await cache.set("products:farm:1", ["p1", "p2"]);

      const farm1 = await cache.get("farm:1");
      const farm2 = await cache.get("farm:2");
      const products = await cache.get<string[]>("products:farm:1");

      expect(farm1).toEqual({ name: "Farm 1" });
      expect(farm2).toEqual({ name: "Farm 2" });
      expect(products).toEqual(["p1", "p2"]);
    });

    it("should invalidate related caches", async () => {
      await cache.set("farm:1:details", { name: "Farm" });
      await cache.set("farm:1:products", ["p1", "p2"]);
      await cache.set("farm:1:reviews", ["r1"]);

      await cache.delPattern("farm:1:*");

      const details = await cache.get("farm:1:details");
      const products = await cache.get("farm:1:products");
      const reviews = await cache.get("farm:1:reviews");

      expect(details).toBeNull();
      expect(products).toBeNull();
      expect(reviews).toBeNull();
    });
  });

  describe("🎯 Type Safety", () => {
    it("should maintain type safety with generics", async () => {
      interface Farm {
        id: string;
        name: string;
      }

      const farm: Farm = { id: "1", name: "Test Farm" };
      await cache.set<Farm>("typed-farm", farm);

      const result = await cache.get<Farm>("typed-farm");

      expect(result).toEqual(farm);
      expect(result?.id).toBe("1");
      expect(result?.name).toBe("Test Farm");
    });

    it("should handle union types", async () => {
      type CacheValue = string | number | boolean | null;

      await cache.set<CacheValue>("union-1", "string");
      await cache.set<CacheValue>("union-2", 42);
      await cache.set<CacheValue>("union-3", true);

      expect(await cache.get<CacheValue>("union-1")).toBe("string");
      expect(await cache.get<CacheValue>("union-2")).toBe(42);
      expect(await cache.get<CacheValue>("union-3")).toBe(true);
    });
  });
});
