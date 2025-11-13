/**
 * 🌾 AGRICULTURAL CACHE TEST SUITE
 * Comprehensive tests for agricultural-aware caching
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { AgriculturalCache } from "../agricultural-cache";
import * as cacheModule from "../index";

// Mock the cache module
vi.mock("../index", () => ({
  cache: {
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
    delPattern: vi.fn(),
  },
  CacheKeys: {
    farm: (id: string) => `farm:${id}`,
    product: (id: string) => `product:${id}`,
    seasonalData: (season: string) => `seasonal:${season}`,
  },
}));

describe("🌾 Agricultural Cache - Seasonal Awareness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("🏡 Farm Caching", () => {
    it("should cache farm data", async () => {
      const farmData = { id: "farm-1", name: "Green Valley Farm" };

      await AgriculturalCache.cacheFarm("farm-1", farmData);

      expect(cacheModule.cache.set).toHaveBeenCalledWith(
        "farm:farm-1",
        farmData
      );
    });

    it("should get cached farm data", async () => {
      const farmData = { id: "farm-1", name: "Green Valley Farm" };
      vi.mocked(cacheModule.cache.get).mockResolvedValue(farmData);

      const result = await AgriculturalCache.getFarm("farm-1");

      expect(result).toEqual(farmData);
      expect(cacheModule.cache.get).toHaveBeenCalledWith("farm:farm-1");
    });

    it("should return null for cache miss", async () => {
      vi.mocked(cacheModule.cache.get).mockResolvedValue(null);

      const result = await AgriculturalCache.getFarm("nonexistent");

      expect(result).toBeNull();
    });

    it("should invalidate farm cache", async () => {
      await AgriculturalCache.invalidateFarm("farm-1");

      expect(cacheModule.cache.del).toHaveBeenCalledWith("farm:farm-1");
      expect(cacheModule.cache.delPattern).toHaveBeenCalledWith("farms:list:*");
    });

    it("should cache multiple farms", async () => {
      const farms = [
        { id: "farm-1", name: "Farm 1" },
        { id: "farm-2", name: "Farm 2" },
        { id: "farm-3", name: "Farm 3" },
      ];

      for (const farm of farms) {
        await AgriculturalCache.cacheFarm(farm.id, farm);
      }

      expect(cacheModule.cache.set).toHaveBeenCalledTimes(3);
    });
  });

  describe("🛒 Product Caching", () => {
    it("should cache product data", async () => {
      const productData = { id: "prod-1", name: "Organic Tomatoes" };

      await AgriculturalCache.cacheProduct("prod-1", productData);

      expect(cacheModule.cache.set).toHaveBeenCalledWith(
        "product:prod-1",
        productData
      );
    });

    it("should get cached product data", async () => {
      const productData = { id: "prod-1", name: "Organic Tomatoes" };
      vi.mocked(cacheModule.cache.get).mockResolvedValue(productData);

      const result = await AgriculturalCache.getProduct("prod-1");

      expect(result).toEqual(productData);
      expect(cacheModule.cache.get).toHaveBeenCalledWith("product:prod-1");
    });

    it("should return null for product cache miss", async () => {
      vi.mocked(cacheModule.cache.get).mockResolvedValue(null);

      const result = await AgriculturalCache.getProduct("nonexistent");

      expect(result).toBeNull();
    });

    it("should invalidate product cache and related lists", async () => {
      await AgriculturalCache.invalidateProduct("prod-1", "farm-1");

      expect(cacheModule.cache.del).toHaveBeenCalledWith("product:prod-1");
      expect(cacheModule.cache.delPattern).toHaveBeenCalledWith(
        "products:farm-1:*"
      );
      expect(cacheModule.cache.delPattern).toHaveBeenCalledWith("farms:list:*");
    });

    it("should cache multiple products", async () => {
      const products = [
        { id: "prod-1", name: "Product 1" },
        { id: "prod-2", name: "Product 2" },
        { id: "prod-3", name: "Product 3" },
      ];

      for (const product of products) {
        await AgriculturalCache.cacheProduct(product.id, product);
      }

      expect(cacheModule.cache.set).toHaveBeenCalledTimes(3);
    });
  });

  describe("🌸 Seasonal Caching", () => {
    it("should cache SPRING data with correct TTL", async () => {
      const springData = { season: "SPRING", crops: ["lettuce", "peas"] };

      await AgriculturalCache.cacheSeasonalData("SPRING", springData);

      expect(cacheModule.cache.set).toHaveBeenCalledWith(
        "seasonal:SPRING",
        springData,
        3600
      );
    });

    it("should cache SUMMER data with correct TTL", async () => {
      const summerData = { season: "SUMMER", crops: ["tomatoes", "corn"] };

      await AgriculturalCache.cacheSeasonalData("SUMMER", summerData);

      expect(cacheModule.cache.set).toHaveBeenCalledWith(
        "seasonal:SUMMER",
        summerData,
        7200
      );
    });

    it("should cache FALL data with correct TTL", async () => {
      const fallData = { season: "FALL", crops: ["pumpkins", "squash"] };

      await AgriculturalCache.cacheSeasonalData("FALL", fallData);

      expect(cacheModule.cache.set).toHaveBeenCalledWith(
        "seasonal:FALL",
        fallData,
        1800
      );
    });

    it("should cache WINTER data with correct TTL", async () => {
      const winterData = { season: "WINTER", crops: ["kale", "cabbage"] };

      await AgriculturalCache.cacheSeasonalData("WINTER", winterData);

      expect(cacheModule.cache.set).toHaveBeenCalledWith(
        "seasonal:WINTER",
        winterData,
        14400
      );
    });

    it("should get cached seasonal data", async () => {
      const seasonalData = { season: "SPRING", data: "test" };
      vi.mocked(cacheModule.cache.get).mockResolvedValue(seasonalData);

      const result = await AgriculturalCache.getSeasonalData("SPRING");

      expect(result).toEqual(seasonalData);
      expect(cacheModule.cache.get).toHaveBeenCalledWith("seasonal:SPRING");
    });

    it("should return null for seasonal cache miss", async () => {
      vi.mocked(cacheModule.cache.get).mockResolvedValue(null);

      const result = await AgriculturalCache.getSeasonalData("SUMMER");

      expect(result).toBeNull();
    });

    it("should cache all seasons", async () => {
      const seasons: Array<"SPRING" | "SUMMER" | "FALL" | "WINTER"> = [
        "SPRING",
        "SUMMER",
        "FALL",
        "WINTER",
      ];

      for (const season of seasons) {
        await AgriculturalCache.cacheSeasonalData(season, { season });
      }

      expect(cacheModule.cache.set).toHaveBeenCalledTimes(4);
    });
  });

  describe("🔄 Integration Scenarios", () => {
    it("should handle complete farm workflow", async () => {
      const farmData = { id: "farm-1", name: "Test Farm" };

      // Cache
      await AgriculturalCache.cacheFarm("farm-1", farmData);
      expect(cacheModule.cache.set).toHaveBeenCalled();

      // Get
      vi.mocked(cacheModule.cache.get).mockResolvedValue(farmData);
      const result = await AgriculturalCache.getFarm("farm-1");
      expect(result).toEqual(farmData);

      // Invalidate
      await AgriculturalCache.invalidateFarm("farm-1");
      expect(cacheModule.cache.del).toHaveBeenCalled();
    });

    it("should handle complete product workflow", async () => {
      const productData = {
        id: "prod-1",
        name: "Test Product",
        farmId: "farm-1",
      };

      // Cache
      await AgriculturalCache.cacheProduct("prod-1", productData);
      expect(cacheModule.cache.set).toHaveBeenCalled();

      // Get
      vi.mocked(cacheModule.cache.get).mockResolvedValue(productData);
      const result = await AgriculturalCache.getProduct("prod-1");
      expect(result).toEqual(productData);

      // Invalidate
      await AgriculturalCache.invalidateProduct("prod-1", "farm-1");
      expect(cacheModule.cache.del).toHaveBeenCalled();
      expect(cacheModule.cache.delPattern).toHaveBeenCalledTimes(2);
    });

    it("should cache farm with products", async () => {
      const farmData = { id: "farm-1", name: "Farm" };
      const products = [
        { id: "prod-1", name: "Product 1" },
        { id: "prod-2", name: "Product 2" },
      ];

      await AgriculturalCache.cacheFarm("farm-1", farmData);

      for (const product of products) {
        await AgriculturalCache.cacheProduct(product.id, product);
      }

      expect(cacheModule.cache.set).toHaveBeenCalledTimes(3);
    });

    it("should cache seasonal data for all seasons", async () => {
      const seasons: Array<"SPRING" | "SUMMER" | "FALL" | "WINTER"> = [
        "SPRING",
        "SUMMER",
        "FALL",
        "WINTER",
      ];

      for (const season of seasons) {
        await AgriculturalCache.cacheSeasonalData(season, { data: season });
      }

      expect(cacheModule.cache.set).toHaveBeenCalledTimes(4);
    });
  });

  describe("🎯 Edge Cases", () => {
    it("should handle empty farm data", async () => {
      await AgriculturalCache.cacheFarm("farm-1", {});
      expect(cacheModule.cache.set).toHaveBeenCalledWith("farm:farm-1", {});
    });

    it("should handle empty product data", async () => {
      await AgriculturalCache.cacheProduct("prod-1", {});
      expect(cacheModule.cache.set).toHaveBeenCalledWith("product:prod-1", {});
    });

    it("should handle null returns gracefully", async () => {
      vi.mocked(cacheModule.cache.get).mockResolvedValue(null);

      const farmResult = await AgriculturalCache.getFarm("missing");
      const productResult = await AgriculturalCache.getProduct("missing");
      const seasonResult = await AgriculturalCache.getSeasonalData("SPRING");

      expect(farmResult).toBeNull();
      expect(productResult).toBeNull();
      expect(seasonResult).toBeNull();
    });

    it("should handle complex nested data", async () => {
      const complexData = {
        id: "farm-1",
        nested: {
          deep: {
            value: "test",
            array: [1, 2, 3],
          },
        },
      };

      await AgriculturalCache.cacheFarm("farm-1", complexData);
      expect(cacheModule.cache.set).toHaveBeenCalledWith(
        "farm:farm-1",
        complexData
      );
    });

    it("should handle arrays", async () => {
      const arrayData = [1, 2, 3, 4, 5];
      await AgriculturalCache.cacheFarm("farm-1", arrayData);
      expect(cacheModule.cache.set).toHaveBeenCalledWith(
        "farm:farm-1",
        arrayData
      );
    });
  });
});
