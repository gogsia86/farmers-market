/**
 * 🧪 PRODUCT SERVICE UNIT TESTS - COMPREHENSIVE TEST SUITE
 *
 * Test suite for the QuantumProductCatalogService demonstrating best practices
 *
 * Features Tested:
 * - Product creation with validation
 * - Product retrieval (by ID, slug)
 * - Product search and filtering
 * - Product updates and status changes
 * - Inventory management
 * - Error handling
 *
 * @reference .cursorrules - Testing Patterns
 */

import { database } from "@/lib/database";
import { QuantumProductCatalogService } from "@/lib/services/product.service";
import { beforeEach, describe, expect, it } from "@jest/globals";
import type { Product, ProductCategory, ProductStatus } from "@prisma/client";

// ============================================================================
// MOCKS
// ============================================================================

jest.mock("@/lib/database");
jest.mock("@/lib/monitoring/logger");
jest.mock("@/lib/cache/multi-layer.cache");
jest.mock("@/lib/repositories/product.repository");

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod_123",
    name: "Organic Tomatoes",
    slug: "organic-tomatoes",
    description: "Fresh organic tomatoes from Green Valley Farm",
    category: "VEGETABLES" as ProductCategory,
    farmId: "farm_123",
    price: 4.99,
    unit: "lb",
    quantityAvailable: 100,
    images: ["https://example.com/tomato1.jpg"],
    tags: ["organic", "fresh", "local"],
    organic: true,
    harvestDate: new Date("2025-01-10"),
    storageInstructions: "Store in cool, dry place",
    status: "ACTIVE" as ProductStatus,
    viewsCount: 50,
    cartAddsCount: 10,
    purchaseCount: 5,
    wishlistCount: 3,
    reviewCount: 2,
    averageRating: 4.5,
    sku: "TOM-ORG-001",
    barcode: null,
    weight: null,
    dimensions: null,
    shippingClass: null,
    taxClass: null,
    featured: false,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-15"),
    deletedAt: null,
    ...overrides,
  };
}

function createMockProductRequest(overrides: any = {}) {
  return {
    name: "Organic Tomatoes",
    description: "Fresh organic tomatoes",
    category: "VEGETABLES" as ProductCategory,
    farmId: "farm_123",
    price: 4.99,
    unit: "lb",
    quantityAvailable: 100,
    images: ["https://example.com/tomato.jpg"],
    tags: ["organic", "fresh"],
    organic: true,
    harvestDate: new Date("2025-01-10"),
    storageInstructions: "Store in cool place",
    ...overrides,
  };
}

// ============================================================================
// TESTS
// ============================================================================

describe("QuantumProductCatalogService", () => {
  let productService: QuantumProductCatalogService;
  let mockCreate: jest.Mock;
  let mockFindUnique: jest.Mock;
  let mockFindFirst: jest.Mock;
  let mockFindMany: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockCount: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreate = jest.fn();
    mockFindUnique = jest.fn();
    mockFindFirst = jest.fn();
    mockFindMany = jest.fn();
    mockUpdate = jest.fn();
    mockCount = jest.fn();

    (database as any).product = {
      create: mockCreate,
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
      findMany: mockFindMany,
      update: mockUpdate,
      count: mockCount,
    };

    // Mock farm lookup for validation
    (database as any).farm = {
      findUnique: jest.fn().mockResolvedValue({
        id: "farm_123",
        status: "ACTIVE",
      }),
      findFirst: jest.fn(),
    };

    productService = new QuantumProductCatalogService();
  });

  describe("createProduct", () => {
    it("should create a product successfully", async () => {
      const productRequest = createMockProductRequest();
      const expectedProduct = createMockProduct();

      // Mock slug uniqueness check
      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockResolvedValue(expectedProduct);

      const result = await productService.createProduct(productRequest);

      expect(result).toEqual(expectedProduct);
      expect(mockCreate).toHaveBeenCalled();
      expect((database as any).farm.findUnique).toHaveBeenCalledWith({
        where: { id: productRequest.farmId },
        select: { id: true, status: true },
      });
    });

    it("should handle validation errors", async () => {
      const invalidRequest = {
        name: "",
        description: "Test",
        category: "VEGETABLES" as ProductCategory,
        farmId: "farm_123",
        price: -5,
        unit: "lb",
        quantityAvailable: 10,
      };

      await expect(
        productService.createProduct(invalidRequest as any),
      ).rejects.toThrow();
    });

    it("should handle database errors", async () => {
      const productRequest = createMockProductRequest();
      const dbError = new Error("Database connection failed");

      // Mock slug check to pass validation
      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockRejectedValue(dbError);

      await expect(
        productService.createProduct(productRequest),
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("getProductById", () => {
    it("should return product when found", async () => {
      const productId = "prod_123";
      const expectedProduct = createMockProduct({ id: productId });

      mockFindUnique.mockResolvedValue(expectedProduct);

      const result = await productService.getProductById(productId);

      expect(result).toEqual(expectedProduct);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: expect.any(Object),
      });
    });

    it("should return null when product not found", async () => {
      const productId = "nonexistent";

      mockFindUnique.mockResolvedValue(null);

      const result = await productService.getProductById(productId);

      expect(result).toBeNull();
    });
  });

  describe("getProductBySlug", () => {
    it("should return product by slug and farmId", async () => {
      const slug = "organic-tomatoes";
      const farmId = "farm_123";
      const expectedProduct = createMockProduct({ slug, farmId });

      mockFindFirst.mockResolvedValue(expectedProduct);

      const result = await productService.getProductBySlug(slug, farmId);

      expect(result).toEqual(expectedProduct);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { slug, farmId },
        include: expect.any(Object),
      });
    });

    it("should return null when slug not found", async () => {
      const slug = "nonexistent";
      const farmId = "farm_123";

      mockFindFirst.mockResolvedValue(null);

      const result = await productService.getProductBySlug(slug, farmId);

      expect(result).toBeNull();
    });
  });

  describe("searchProducts", () => {
    it("should return paginated products", async () => {
      const mockProducts = [
        createMockProduct({ id: "prod_1" }),
        createMockProduct({ id: "prod_2" }),
      ];

      mockFindMany.mockResolvedValue(mockProducts);
      mockCount.mockResolvedValue(50);

      const result = await productService.searchProducts({});

      expect(result.products).toEqual(mockProducts);
      expect(result.total).toBe(50);
    });

    it("should filter by category", async () => {
      const mockProducts = [createMockProduct({ category: "VEGETABLES" })];

      mockFindMany.mockResolvedValue(mockProducts);
      mockCount.mockResolvedValue(1);

      await productService.searchProducts({ category: "VEGETABLES" });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: "VEGETABLES",
          }),
        }),
      );
    });

    it("should filter by farmId", async () => {
      const farmId = "farm_123";
      const mockProducts = [createMockProduct({ farmId })];

      mockFindMany.mockResolvedValue(mockProducts);
      mockCount.mockResolvedValue(1);

      await productService.searchProducts({ farmId });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            farmId,
          }),
        }),
      );
    });

    it("should handle pagination", async () => {
      const mockProducts = [createMockProduct()];

      mockFindMany.mockResolvedValue(mockProducts);
      mockCount.mockResolvedValue(100);

      const result = await productService.searchProducts({
        page: 2,
        limit: 10,
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it("should handle empty results", async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      const result = await productService.searchProducts({
        searchQuery: "xyz",
      });

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully", async () => {
      const productId = "prod_123";
      const userId = "user_123";
      const updates = {
        name: "Updated Product Name",
        price: 6.99,
      };
      const existingProduct = createMockProduct({
        id: productId,
        farmId: "farm_123",
      });
      const updatedProduct = createMockProduct({ ...updates, id: productId });

      // Mock product lookup for access verification (with farm relationship)
      mockFindUnique.mockResolvedValueOnce({
        ...existingProduct,
        farm: {
          ownerId: userId,
          teamMembers: [],
        },
      });
      // Mock product lookup for farmId when updating name/slug
      mockFindUnique.mockResolvedValueOnce({ farmId: "farm_123" });
      // Mock slug uniqueness check
      mockFindFirst.mockResolvedValue(null);
      mockUpdate.mockResolvedValue(updatedProduct);

      const result = await productService.updateProduct(
        productId,
        updates,
        userId,
      );

      expect(result).toEqual(updatedProduct);
      expect(mockUpdate).toHaveBeenCalled();
    });

    it("should handle update errors", async () => {
      const productId = "prod_123";
      const userId = "user_123";
      const updateData = { name: "Updated Product" };
      const existingProduct = createMockProduct({
        id: productId,
        farmId: "farm_123",
      });
      const updateError = new Error("Update failed");

      // Mock product exists for verification (with farm relationship)
      mockFindUnique.mockResolvedValueOnce({
        ...existingProduct,
        farm: {
          ownerId: userId,
          teamMembers: [],
        },
      });
      // Mock product lookup for farmId
      mockFindUnique.mockResolvedValueOnce({ farmId: "farm_123" });
      // Mock slug check
      mockFindFirst.mockResolvedValue(null);
      mockUpdate.mockRejectedValue(updateError);

      await expect(
        productService.updateProduct(productId, updateData, userId),
      ).rejects.toThrow("Update failed");
    });
  });

  describe("updateInventory", () => {
    it("should update product inventory", async () => {
      const productId = "prod_123";
      const userId = "user_123";
      const quantityChange = 50;
      const existingProduct = createMockProduct({
        id: productId,
        quantityAvailable: 100,
      });
      const updatedProduct = createMockProduct({
        id: productId,
        quantityAvailable: 150,
      });

      // Mock product lookup for access verification
      mockFindUnique.mockResolvedValueOnce({
        ...existingProduct,
        farm: {
          ownerId: userId,
          teamMembers: [],
        },
      });
      mockUpdate.mockResolvedValue(updatedProduct);

      const result = await productService.updateInventory(
        productId,
        quantityChange,
        userId,
      );

      expect(result).toEqual(updatedProduct);
      expect(mockUpdate).toHaveBeenCalled();
    });

    it("should handle negative inventory", async () => {
      const productId = "prod_123";
      const userId = "user_123";
      const quantityChange = -10;
      const existingProduct = createMockProduct({
        id: productId,
        quantityAvailable: 5,
      });

      // Mock product lookup for access verification
      mockFindUnique.mockResolvedValueOnce({
        ...existingProduct,
        farm: {
          ownerId: userId,
          teamMembers: [],
        },
      });

      // Mock the first update (inventory change)
      const productWithNegativeInventory = createMockProduct({
        id: productId,
        quantityAvailable: 0,
      });
      mockUpdate.mockResolvedValueOnce(productWithNegativeInventory);

      // Mock the second update (status change to OUT_OF_STOCK)
      mockUpdate.mockResolvedValueOnce({
        ...productWithNegativeInventory,
        status: "OUT_OF_STOCK" as ProductStatus,
      });

      const result = await productService.updateInventory(
        productId,
        quantityChange,
        userId,
      );

      expect(result.quantityAvailable).toBe(0);
    });
  });
});
