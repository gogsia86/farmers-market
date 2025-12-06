/**
 * 🧪 MARKETPLACE SERVICE TESTS
 * Divine test coverage with agricultural consciousness
 *
 * @module MarketplaceServiceTests
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { MarketplaceService } from "../marketplace.service";
import { database } from "@/lib/database";
import type {
  ProductCategory,
  ProductStatus,
  FarmStatus,
  FarmVerificationStatus,
} from "@prisma/client";

// Mock the database
jest.mock("@/lib/database", () => ({
  database: {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    farm: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("🛒 MarketplaceService - Divine Agricultural Marketplace", () => {
  let marketplaceService: MarketplaceService;

  beforeEach(() => {
    marketplaceService = new MarketplaceService();
    jest.clearAllMocks();
  });

  // ==========================================================================
  // GET PRODUCTS TESTS
  // ==========================================================================

  describe("🔍 getProducts - Product Discovery", () => {
    it("should fetch products with default filters", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          name: "Organic Tomatoes",
          price: 4.99,
          quantityAvailable: 50,
          status: "ACTIVE" as ProductStatus,
          inStock: true,
          category: "VEGETABLES" as ProductCategory,
          farm: {
            id: "farm-1",
            name: "Divine Acres",
            slug: "divine-acres",
            logoUrl: null,
            city: "Portland",
            state: "OR",
            averageRating: 4.8,
          },
        },
        {
          id: "prod-2",
          name: "Fresh Strawberries",
          price: 6.99,
          quantityAvailable: 30,
          status: "ACTIVE" as ProductStatus,
          inStock: true,
          category: "FRUITS" as ProductCategory,
          farm: {
            id: "farm-2",
            name: "Berry Farm",
            slug: "berry-farm",
            logoUrl: null,
            city: "Eugene",
            state: "OR",
            averageRating: 4.5,
          },
        },
      ];

      const mockTotal = 2;

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (database.product.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await marketplaceService.getProducts();

      expect(result).toEqual({
        products: mockProducts,
        total: mockTotal,
        page: 1,
        totalPages: 1,
        hasMore: false,
      });

      expect(database.product.findMany).toHaveBeenCalledWith({
        where: {
          status: "ACTIVE",
          inStock: true,
          quantityAvailable: {
            gt: 0,
          },
        },
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              city: true,
              state: true,
              averageRating: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: 0,
        take: 20,
      });
    });

    it("should filter products by search query", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          name: "Organic Tomatoes",
          description: "Fresh organic tomatoes",
          price: 4.99,
          farm: {
            id: "farm-1",
            name: "Divine Acres",
            slug: "divine-acres",
            logoUrl: null,
            city: "Portland",
            state: "OR",
            averageRating: 4.8,
          },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (database.product.count as jest.Mock).mockResolvedValue(1);

      const result = await marketplaceService.getProducts({
        search: "tomatoes",
      });

      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toContain("Tomatoes");

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.OR).toBeDefined();
      expect(call.where.OR[0].name.contains).toBe("tomatoes");
      expect(call.where.OR[0].name.mode).toBe("insensitive");
    });

    it("should filter products by category", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          name: "Organic Tomatoes",
          category: "VEGETABLES" as ProductCategory,
          farm: {
            id: "farm-1",
            name: "Divine Acres",
            slug: "divine-acres",
            logoUrl: null,
            city: "Portland",
            state: "OR",
            averageRating: 4.8,
          },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (database.product.count as jest.Mock).mockResolvedValue(1);

      await marketplaceService.getProducts({
        category: "VEGETABLES" as ProductCategory,
      });

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.category).toBe("VEGETABLES");
    });

    it("should filter products by price range", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      await marketplaceService.getProducts({
        minPrice: 5,
        maxPrice: 10,
      });

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.price.gte).toBe(5);
      expect(call.where.price.lte).toBe(10);
    });

    it("should filter products by farm ID", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      await marketplaceService.getProducts({
        farmId: "farm-123",
      });

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.farmId).toBe("farm-123");
    });

    it("should filter in-stock products only", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      await marketplaceService.getProducts({
        inStock: true,
      });

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.quantityAvailable.gt).toBe(0);
    });

    it("should sort products by price ascending", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      await marketplaceService.getProducts({
        sortBy: "price_asc",
      });

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.orderBy).toEqual({ price: "asc" });
    });

    it("should sort products by price descending", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      await marketplaceService.getProducts({
        sortBy: "price_high",
      });

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.orderBy).toEqual({ price: "desc" });
    });

    it("should sort products by name", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      await marketplaceService.getProducts({
        sortBy: "name",
      });

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.orderBy).toEqual({ name: "asc" });
    });

    it("should handle pagination correctly", async () => {
      const mockProducts = Array.from({ length: 10 }, (_, i) => ({
        id: `prod-${i}`,
        name: `Product ${i}`,
        farm: {
          id: "farm-1",
          name: "Divine Acres",
          slug: "divine-acres",
          logoUrl: null,
          city: "Portland",
          state: "OR",
          averageRating: 4.8,
        },
      }));

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (database.product.count as jest.Mock).mockResolvedValue(50);

      const result = await marketplaceService.getProducts({
        page: 2,
        limit: 10,
      });

      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(5);
      expect(result.hasMore).toBe(true);

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.skip).toBe(10); // (page 2 - 1) * 10
      expect(call.take).toBe(10);
    });

    it("should enforce maximum limit of 100", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      await marketplaceService.getProducts({
        limit: 500,
      });

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.take).toBe(100);
    });

    it("should handle errors gracefully", async () => {
      (database.product.findMany as jest.Mock).mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(marketplaceService.getProducts()).rejects.toThrow(
        "Failed to fetch products",
      );
    });
  });

  // ==========================================================================
  // GET FEATURED FARMS TESTS
  // ==========================================================================

  describe("🌟 getFeaturedFarms - Showcase Top Farms", () => {
    it("should fetch featured farms with products", async () => {
      const mockFarms = [
        {
          id: "farm-1",
          name: "Divine Acres",
          status: "ACTIVE" as FarmStatus,
          verificationStatus: "VERIFIED" as FarmVerificationStatus,
          averageRating: 4.9,
          _count: {
            products: 25,
            reviews: 120,
          },
          products: [
            { id: "prod-1", name: "Tomatoes" },
            { id: "prod-2", name: "Lettuce" },
          ],
        },
      ];

      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
      (database.farm.count as jest.Mock).mockResolvedValue(10);

      const result = await marketplaceService.getFeaturedFarms(6);

      expect(result.farms).toHaveLength(1);
      expect(result.farms[0].name).toBe("Divine Acres");
      expect(result.farms[0]._count.products).toBe(25);
      expect(result.total).toBe(10);

      expect(database.farm.findMany).toHaveBeenCalledWith({
        where: {
          status: "ACTIVE",
          verificationStatus: "VERIFIED",
        },
        include: {
          _count: {
            select: {
              products: true,
              reviews: true,
            },
          },
          products: {
            where: {
              status: "ACTIVE",
              inStock: true,
              quantityAvailable: {
                gt: 0,
              },
            },
            take: 4,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          averageRating: "desc",
        },
        take: 6,
      });
    });

    it("should enforce maximum limit of 20 for featured farms", async () => {
      (database.farm.findMany as jest.Mock).mockResolvedValue([]);
      (database.farm.count as jest.Mock).mockResolvedValue(0);

      await marketplaceService.getFeaturedFarms(100);

      const call = (database.farm.findMany as jest.Mock).mock.calls[0][0];
      expect(call.take).toBe(20);
    });

    it("should handle errors gracefully", async () => {
      (database.farm.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(marketplaceService.getFeaturedFarms()).rejects.toThrow(
        "Failed to fetch featured farms",
      );
    });
  });

  // ==========================================================================
  // GET SEASONAL RECOMMENDATIONS TESTS
  // ==========================================================================

  describe("🌱 getSeasonalRecommendations - Agricultural Consciousness", () => {
    it("should return seasonal products with agricultural awareness", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          name: "Spring Lettuce",
          category: "VEGETABLES" as ProductCategory,
          farm: {
            id: "farm-1",
            name: "Divine Acres",
            slug: "divine-acres",
            logoUrl: null,
            city: "Portland",
            state: "OR",
            averageRating: 4.8,
          },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await marketplaceService.getSeasonalRecommendations(12);

      expect(result.season).toMatch(/SPRING|SUMMER|FALL|WINTER/);
      expect(result.products).toBeDefined();
      expect(result.message).toBeTruthy();
      expect(typeof result.message).toBe("string");
    });

    it("should filter products by seasonal categories", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);

      await marketplaceService.getSeasonalRecommendations(12);

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.category.in).toBeDefined();
      expect(Array.isArray(call.where.category.in)).toBe(true);
      expect(call.where.category.in.length).toBeGreaterThan(0);
    });

    it("should enforce maximum limit of 50", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);

      await marketplaceService.getSeasonalRecommendations(200);

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.take).toBe(50);
    });
  });

  // ==========================================================================
  // SEARCH PRODUCTS TESTS
  // ==========================================================================

  describe("🔍 searchProducts - Quick Search", () => {
    it("should search products by name and description", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          name: "Organic Tomatoes",
          description: "Fresh organic tomatoes",
          farm: {
            id: "farm-1",
            name: "Divine Acres",
            slug: "divine-acres",
            logoUrl: null,
            city: "Portland",
            state: "OR",
            averageRating: 4.8,
          },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await marketplaceService.searchProducts("tomato", 10);

      expect(result).toHaveLength(1);
      expect(result[0].name).toContain("Tomatoes");
    });

    it("should return empty array for queries less than 2 characters", async () => {
      const result = await marketplaceService.searchProducts("a", 10);

      expect(result).toEqual([]);
      expect(database.product.findMany).not.toHaveBeenCalled();
    });

    it("should return empty array for empty query", async () => {
      const result = await marketplaceService.searchProducts("", 10);

      expect(result).toEqual([]);
      expect(database.product.findMany).not.toHaveBeenCalled();
    });

    it("should enforce maximum limit of 50", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);

      await marketplaceService.searchProducts("test", 200);

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.take).toBe(50);
    });
  });

  // ==========================================================================
  // GET FARM PRODUCTS TESTS
  // ==========================================================================

  describe("🏪 getFarmProducts - Farm-Specific Products", () => {
    it("should fetch products for a specific farm", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          name: "Farm Product",
          farmId: "farm-123",
          farm: {
            id: "farm-123",
            name: "Divine Acres",
            slug: "divine-acres",
            logoUrl: null,
            city: "Portland",
            state: "OR",
            averageRating: 4.8,
          },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (database.product.count as jest.Mock).mockResolvedValue(1);

      const result = await marketplaceService.getFarmProducts("farm-123");

      expect(result.products).toHaveLength(1);

      const call = (database.product.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.farmId).toBe("farm-123");
    });
  });

  // ==========================================================================
  // GET MARKETPLACE STATS TESTS
  // ==========================================================================

  describe("📊 getMarketplaceStats - Analytics", () => {
    it("should fetch comprehensive marketplace statistics", async () => {
      (database.product.count as jest.Mock)
        .mockResolvedValueOnce(150) // totalProducts
        .mockResolvedValueOnce(150); // for groupBy query

      (database.farm.count as jest.Mock)
        .mockResolvedValueOnce(30) // totalFarms
        .mockResolvedValueOnce(25); // activeFarms

      (database.product.groupBy as jest.Mock).mockResolvedValue([
        { category: "VEGETABLES", _count: { category: 50 } },
        { category: "FRUITS", _count: { category: 40 } },
        { category: "DAIRY", _count: { category: 30 } },
      ]);

      const result = await marketplaceService.getMarketplaceStats();

      expect(result.totalProducts).toBe(150);
      expect(result.totalFarms).toBe(30);
      expect(result.activeFarms).toBe(25);
      expect(result.categoryCounts).toHaveLength(3);
      expect(result.categoryCounts[0].category).toBe("VEGETABLES");
      expect(result.categoryCounts[0].count).toBe(50);
    });

    it("should handle errors gracefully", async () => {
      (database.product.count as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(marketplaceService.getMarketplaceStats()).rejects.toThrow(
        "Failed to fetch marketplace stats",
      );
    });
  });
});
