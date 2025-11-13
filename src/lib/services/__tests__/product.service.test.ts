/**
 * 🛒 PRODUCT SERVICE TEST SUITE
 * Comprehensive tests for agricultural product management
 *
 * Coverage: 40+ tests for all product operations
 */

import { database } from "@/lib/database";
import { ProductStatus } from "@/types/product";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductService } from "../product.service";

// Mock the database
vi.mock("@/lib/database", () => ({
  database: {
    product: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    farm: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock the slug utility
vi.mock("@/lib/utils/slug", () => ({
  generateSlug: vi.fn((name: string) =>
    name.toLowerCase().replace(/\s+/g, "-")
  ),
}));

describe("🛒 Product Service - Divine Product Operations", () => {
  const mockUserId = "user-123";
  const mockFarmId = "farm-123";
  const mockProductId = "product-123";

  const mockFarm = {
    id: mockFarmId,
    ownerId: mockUserId,
    status: "ACTIVE",
    name: "Test Farm",
    slug: "test-farm",
  };

  const mockProduct = {
    id: mockProductId,
    name: "Organic Tomatoes",
    slug: "organic-tomatoes",
    farmId: mockFarmId,
    category: "VEGETABLES",
    description: "Fresh organic tomatoes",
    pricing: { basePrice: { amount: 500, currency: "USD" } },
    inventory: {
      quantity: 100,
      reservedQuantity: 10,
      availableQuantity: 90,
      lowStockThreshold: 20,
      isLowStock: false,
      inStock: true,
    },
    status: ProductStatus.AVAILABLE,
    isActive: true,
    images: [{ url: "https://example.com/tomato.jpg", isPrimary: true }],
    primaryPhotoUrl: "https://example.com/tomato.jpg",
    farm: mockFarm,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("🎯 createProduct", () => {
    const validInput = {
      name: "Organic Tomatoes",
      farmId: mockFarmId,
      category: "VEGETABLES",
      description: "Fresh organic tomatoes",
      pricing: { basePrice: { amount: 500, currency: "USD" } },
      inventory: {
        quantity: 100,
        reservedQuantity: 0,
        lowStockThreshold: 20,
      },
      images: [{ url: "https://example.com/tomato.jpg", isPrimary: true }],
    };

    it("should create product with valid data", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      vi.mocked(database.product.findFirst).mockResolvedValue(null);
      vi.mocked(database.product.create).mockResolvedValue(mockProduct as any);

      const result = await ProductService.createProduct(
        validInput as any,
        mockUserId
      );

      expect(result).toMatchObject({
        name: "Organic Tomatoes",
        slug: expect.stringContaining("organic-tomatoes"),
      });
      expect(database.farm.findUnique).toHaveBeenCalledWith({
        where: { id: mockFarmId },
        select: { id: true, ownerId: true, status: true },
      });
    });

    it("should throw error if farm not found", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(null);

      await expect(
        ProductService.createProduct(validInput as any, mockUserId)
      ).rejects.toThrow("Farm not found");
    });

    it("should throw error for unauthorized user", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue({
        ...mockFarm,
        ownerId: "different-user",
      } as any);

      await expect(
        ProductService.createProduct(validInput as any, mockUserId)
      ).rejects.toThrow("Unauthorized: You don't own this farm");
    });

    it("should throw error for inactive farm", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue({
        ...mockFarm,
        status: "INACTIVE",
      } as any);

      await expect(
        ProductService.createProduct(validInput as any, mockUserId)
      ).rejects.toThrow("Cannot add products to inactive farm");
    });

    it("should validate product name length (too short)", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const shortNameInput = { ...validInput, name: "AB" };

      await expect(
        ProductService.createProduct(shortNameInput as any, mockUserId)
      ).rejects.toThrow("Product name must be at least 3 characters");
    });

    it("should validate product name length (too long)", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const longNameInput = { ...validInput, name: "A".repeat(101) };

      await expect(
        ProductService.createProduct(longNameInput as any, mockUserId)
      ).rejects.toThrow("Product name must not exceed 100 characters");
    });

    it("should validate price is positive", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const invalidPriceInput = {
        ...validInput,
        pricing: { basePrice: { amount: 0, currency: "USD" } },
      };

      await expect(
        ProductService.createProduct(invalidPriceInput as any, mockUserId)
      ).rejects.toThrow("Price must be greater than 0");
    });

    it("should validate inventory quantity is non-negative", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const negativeQuantityInput = {
        ...validInput,
        inventory: { ...validInput.inventory, quantity: -1 },
      };

      await expect(
        ProductService.createProduct(negativeQuantityInput as any, mockUserId)
      ).rejects.toThrow("Quantity cannot be negative");
    });

    it("should validate reserved quantity does not exceed total", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const invalidReservedInput = {
        ...validInput,
        inventory: {
          ...validInput.inventory,
          quantity: 50,
          reservedQuantity: 60,
        },
      };

      await expect(
        ProductService.createProduct(invalidReservedInput as any, mockUserId)
      ).rejects.toThrow("Reserved quantity cannot exceed total quantity");
    });

    it("should generate unique slug when duplicate exists", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      vi.mocked(database.product.findFirst)
        .mockResolvedValueOnce({ slug: "organic-tomatoes" } as any)
        .mockResolvedValueOnce(null);
      vi.mocked(database.product.create).mockResolvedValue({
        ...mockProduct,
        slug: "organic-tomatoes-1",
      } as any);

      const result = await ProductService.createProduct(
        validInput as any,
        mockUserId
      );

      expect(result.slug).toBe("organic-tomatoes-1");
    });

    it("should calculate available quantity correctly", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      vi.mocked(database.product.findFirst).mockResolvedValue(null);
      vi.mocked(database.product.create).mockResolvedValue(mockProduct as any);

      await ProductService.createProduct(validInput as any, mockUserId);

      const createCall = vi.mocked(database.product.create).mock.calls[0][0];
      expect(createCall.data.inventory.availableQuantity).toBe(100); // quantity - reserved
    });

    it("should set isLowStock correctly", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      vi.mocked(database.product.findFirst).mockResolvedValue(null);
      vi.mocked(database.product.create).mockResolvedValue(mockProduct as any);

      const lowStockInput = {
        ...validInput,
        inventory: { quantity: 15, reservedQuantity: 0, lowStockThreshold: 20 },
      };

      await ProductService.createProduct(lowStockInput as any, mockUserId);

      const createCall = vi.mocked(database.product.create).mock.calls[0][0];
      expect(createCall.data.inventory.isLowStock).toBe(true);
    });

    it("should extract primary photo URL", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      vi.mocked(database.product.findFirst).mockResolvedValue(null);
      vi.mocked(database.product.create).mockResolvedValue(mockProduct as any);

      await ProductService.createProduct(validInput as any, mockUserId);

      const createCall = vi.mocked(database.product.create).mock.calls[0][0];
      expect(createCall.data.primaryPhotoUrl).toBe(
        "https://example.com/tomato.jpg"
      );
    });
  });

  describe("📖 getProductById", () => {
    it("should get product by ID with farm", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );

      const result = await ProductService.getProductById(mockProductId);

      expect(result).toMatchObject({ id: mockProductId });
      expect(database.product.findUnique).toHaveBeenCalledWith({
        where: { id: mockProductId },
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              verificationStatus: true,
            },
          },
        },
      });
    });

    it("should get product by ID without farm", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );

      await ProductService.getProductById(mockProductId, false);

      expect(database.product.findUnique).toHaveBeenCalledWith({
        where: { id: mockProductId },
        include: { farm: false },
      });
    });

    it("should return null if product not found", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(null);

      const result = await ProductService.getProductById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("🔗 getProductBySlug", () => {
    it("should get product by farm and product slug", async () => {
      vi.mocked(database.product.findFirst).mockResolvedValue(
        mockProduct as any
      );

      const result = await ProductService.getProductBySlug(
        "test-farm",
        "organic-tomatoes"
      );

      expect(result).toMatchObject({ slug: "organic-tomatoes" });
      expect(database.product.findFirst).toHaveBeenCalledWith({
        where: {
          slug: "organic-tomatoes",
          farm: { slug: "test-farm" },
        },
        include: expect.any(Object),
      });
    });

    it("should return null if product not found by slug", async () => {
      vi.mocked(database.product.findFirst).mockResolvedValue(null);

      const result = await ProductService.getProductBySlug(
        "test-farm",
        "nonexistent"
      );

      expect(result).toBeNull();
    });
  });

  describe("📋 listProducts", () => {
    const mockProducts = [mockProduct, { ...mockProduct, id: "product-456" }];

    it("should list products with default pagination", async () => {
      vi.mocked(database.product.findMany).mockResolvedValue(
        mockProducts as any
      );
      vi.mocked(database.product.count).mockResolvedValue(2);

      const result = await ProductService.listProducts();

      expect(result.products).toHaveLength(2);
      expect(result.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
        hasMore: false,
      });
    });

    it("should filter products by farm ID", async () => {
      vi.mocked(database.product.findMany).mockResolvedValue(
        mockProducts as any
      );
      vi.mocked(database.product.count).mockResolvedValue(2);

      await ProductService.listProducts({ farmId: mockFarmId });

      const findCall = vi.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where).toMatchObject({ farmId: mockFarmId });
    });

    it("should filter products by category", async () => {
      vi.mocked(database.product.findMany).mockResolvedValue(
        mockProducts as any
      );
      vi.mocked(database.product.count).mockResolvedValue(2);

      await ProductService.listProducts({ category: "VEGETABLES" });

      const findCall = vi.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where).toMatchObject({ category: "VEGETABLES" });
    });

    it("should filter products by status", async () => {
      vi.mocked(database.product.findMany).mockResolvedValue(
        mockProducts as any
      );
      vi.mocked(database.product.count).mockResolvedValue(2);

      await ProductService.listProducts({ status: ProductStatus.AVAILABLE });

      const findCall = vi.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where).toMatchObject({ status: ProductStatus.AVAILABLE });
    });

    it("should filter products in stock", async () => {
      vi.mocked(database.product.findMany).mockResolvedValue(
        mockProducts as any
      );
      vi.mocked(database.product.count).mockResolvedValue(2);

      await ProductService.listProducts({ inStock: true });

      const findCall = vi.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where.inventory).toMatchObject({ inStock: true });
    });

    it("should filter featured products", async () => {
      vi.mocked(database.product.findMany).mockResolvedValue(
        mockProducts as any
      );
      vi.mocked(database.product.count).mockResolvedValue(2);

      await ProductService.listProducts({ isFeatured: true });

      const findCall = vi.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where).toMatchObject({ isFeatured: true });
    });

    it("should search products by name", async () => {
      vi.mocked(database.product.findMany).mockResolvedValue(
        mockProducts as any
      );
      vi.mocked(database.product.count).mockResolvedValue(2);

      await ProductService.listProducts({ search: "tomato" });

      const findCall = vi.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where.OR).toBeDefined();
    });

    it("should handle pagination correctly", async () => {
      vi.mocked(database.product.findMany).mockResolvedValue(
        mockProducts as any
      );
      vi.mocked(database.product.count).mockResolvedValue(50);

      const result = await ProductService.listProducts(
        {},
        { page: 2, limit: 10 }
      );

      expect(result.pagination).toMatchObject({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasMore: true,
      });

      const findCall = vi.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.skip).toBe(10);
      expect(findCall.take).toBe(10);
    });
  });

  describe("✏️ updateProduct", () => {
    const updateData = {
      name: "Updated Tomatoes",
      pricing: { basePrice: { amount: 600, currency: "USD" } },
    };

    it("should update product successfully", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );
      vi.mocked(database.product.findFirst).mockResolvedValue(null);
      vi.mocked(database.product.update).mockResolvedValue({
        ...mockProduct,
        ...updateData,
      } as any);

      const result = await ProductService.updateProduct(
        mockProductId,
        updateData as any,
        mockUserId
      );

      expect(result.name).toBe("Updated Tomatoes");
    });

    it("should throw error if product not found", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(null);

      await expect(
        ProductService.updateProduct(
          mockProductId,
          updateData as any,
          mockUserId
        )
      ).rejects.toThrow("Product not found");
    });

    it("should throw error for unauthorized user", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue({
        ...mockProduct,
        farm: { ...mockFarm, ownerId: "different-user" },
      } as any);

      await expect(
        ProductService.updateProduct(
          mockProductId,
          updateData as any,
          mockUserId
        )
      ).rejects.toThrow("Unauthorized: You don't own this product");
    });

    it("should regenerate slug if name changes", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );
      vi.mocked(database.product.findFirst).mockResolvedValue(null);
      vi.mocked(database.product.update).mockResolvedValue({
        ...mockProduct,
        name: "New Name",
        slug: "new-name",
      } as any);

      await ProductService.updateProduct(
        mockProductId,
        { name: "New Name" } as any,
        mockUserId
      );

      const updateCall = vi.mocked(database.product.update).mock.calls[0][0];
      expect(updateCall.data.slug).toBe("new-name");
    });

    it("should recalculate inventory when updated", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );
      vi.mocked(database.product.update).mockResolvedValue(mockProduct as any);

      await ProductService.updateProduct(
        mockProductId,
        { inventory: { quantity: 200, reservedQuantity: 20 } } as any,
        mockUserId
      );

      const updateCall = vi.mocked(database.product.update).mock.calls[0][0];
      expect(updateCall.data.inventory.availableQuantity).toBe(180);
    });

    it("should update primary photo URL if images change", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );
      vi.mocked(database.product.update).mockResolvedValue(mockProduct as any);

      const newImages = [
        { url: "https://example.com/new.jpg", isPrimary: true },
      ];

      await ProductService.updateProduct(
        mockProductId,
        { images: newImages } as any,
        mockUserId
      );

      const updateCall = vi.mocked(database.product.update).mock.calls[0][0];
      expect(updateCall.data.primaryPhotoUrl).toBe(
        "https://example.com/new.jpg"
      );
    });
  });

  describe("🗑️ deleteProduct", () => {
    it("should soft delete product successfully", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );
      vi.mocked(database.product.update).mockResolvedValue(mockProduct as any);

      await ProductService.deleteProduct(mockProductId, mockUserId);

      expect(database.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: {
          status: ProductStatus.DISCONTINUED,
          updatedAt: expect.any(Date),
        },
      });
    });

    it("should throw error if product not found", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(null);

      await expect(
        ProductService.deleteProduct(mockProductId, mockUserId)
      ).rejects.toThrow("Product not found");
    });

    it("should throw error for unauthorized user", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue({
        ...mockProduct,
        farm: { ...mockFarm, ownerId: "different-user" },
      } as any);

      await expect(
        ProductService.deleteProduct(mockProductId, mockUserId)
      ).rejects.toThrow("Unauthorized: You don't own this product");
    });
  });

  describe("📦 updateInventory", () => {
    it("should update inventory successfully", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );
      vi.mocked(database.product.update).mockResolvedValue(mockProduct as any);

      const result = await ProductService.updateInventory(
        mockProductId,
        150,
        mockUserId
      );

      expect(database.product.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should calculate available quantity", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );
      vi.mocked(database.product.update).mockResolvedValue(mockProduct as any);

      await ProductService.updateInventory(mockProductId, 150, mockUserId);

      const updateCall = vi.mocked(database.product.update).mock.calls[0][0];
      expect(updateCall.data.inventory.availableQuantity).toBe(140); // 150 - 10 reserved
    });

    it("should set status to OUT_OF_STOCK when quantity is zero", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );
      vi.mocked(database.product.update).mockResolvedValue(mockProduct as any);

      await ProductService.updateInventory(mockProductId, 10, mockUserId); // 10 - 10 reserved = 0

      const updateCall = vi.mocked(database.product.update).mock.calls[0][0];
      expect(updateCall.data.status).toBe(ProductStatus.OUT_OF_STOCK);
    });

    it("should set status to AVAILABLE when quantity is positive", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );
      vi.mocked(database.product.update).mockResolvedValue(mockProduct as any);

      await ProductService.updateInventory(mockProductId, 50, mockUserId);

      const updateCall = vi.mocked(database.product.update).mock.calls[0][0];
      expect(updateCall.data.status).toBe(ProductStatus.AVAILABLE);
    });

    it("should update lastRestocked timestamp", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );
      vi.mocked(database.product.update).mockResolvedValue(mockProduct as any);

      await ProductService.updateInventory(mockProductId, 150, mockUserId);

      const updateCall = vi.mocked(database.product.update).mock.calls[0][0];
      expect(updateCall.data.inventory.lastRestocked).toBeInstanceOf(Date);
    });
  });

  describe("🔍 searchProducts", () => {
    it("should search products by name", async () => {
      vi.mocked(database.product.findMany).mockResolvedValue([
        mockProduct,
      ] as any);

      const results = await ProductService.searchProducts("tomato");

      expect(results).toHaveLength(1);
      const findCall = vi.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where.OR).toBeDefined();
    });

    it("should limit search results", async () => {
      vi.mocked(database.product.findMany).mockResolvedValue([
        mockProduct,
      ] as any);

      await ProductService.searchProducts("tomato", 5);

      const findCall = vi.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.take).toBe(5);
    });

    it("should only return available products", async () => {
      vi.mocked(database.product.findMany).mockResolvedValue([
        mockProduct,
      ] as any);

      await ProductService.searchProducts("tomato");

      const findCall = vi.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where.status).toBe(ProductStatus.AVAILABLE);
    });
  });

  describe("🔄 batchUpdateProducts", () => {
    const productIds = ["product-1", "product-2", "product-3"];
    const batchUpdates = { status: ProductStatus.AVAILABLE };

    it("should update multiple products successfully", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );
      vi.mocked(database.product.update).mockResolvedValue(mockProduct as any);

      const result = await ProductService.batchUpdateProducts(
        productIds,
        batchUpdates as any,
        mockUserId
      );

      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
      expect(result.successful).toHaveLength(3);
    });

    it("should handle partial failures", async () => {
      vi.mocked(database.product.findUnique)
        .mockResolvedValueOnce(mockProduct as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockProduct as any);
      vi.mocked(database.product.update).mockResolvedValue(mockProduct as any);

      const result = await ProductService.batchUpdateProducts(
        productIds,
        batchUpdates as any,
        mockUserId
      );

      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].error).toContain("Product not found");
    });

    it("should return total count", async () => {
      vi.mocked(database.product.findUnique).mockResolvedValue(
        mockProduct as any
      );
      vi.mocked(database.product.update).mockResolvedValue(mockProduct as any);

      const result = await ProductService.batchUpdateProducts(
        productIds,
        batchUpdates as any,
        mockUserId
      );

      expect(result.total).toBe(3);
    });
  });

  describe("📊 getProductStats", () => {
    it("should return product statistics", async () => {
      const stats = await ProductService.getProductStats(mockProductId);

      expect(stats).toMatchObject({
        productId: mockProductId,
        views: 0,
        orders: 0,
        revenue: 0,
        reviewCount: 0,
        inWishlistCount: 0,
      });
    });
  });
});
