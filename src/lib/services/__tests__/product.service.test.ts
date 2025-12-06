/**
 * 🛒 PRODUCT SERVICE TEST SUITE
 * Comprehensive tests for agricultural product management
 *
 * Coverage: 40+ tests for all product operations
 */

import { database } from "@/lib/database";
import { ProductStatus } from "@/types/product";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { ProductService } from "../product.service";

// Mock the database

jest.mock("@/lib/database", () => ({
  database: {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    farm: {
      findUnique: jest.fn(),
    },
  },
}));

const mockDatabase = database as jest.Mocked<typeof database>;

// Mock the slug utility
jest.mock("@/lib/utils/slug", () => ({
  generateSlug: jest.fn((name: string) =>
    name.toLowerCase().replace(/\s+/g, "-"),
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
    jest.clearAllMocks();
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
      images: ["https://example.com/tomato.jpg"],
    };

    it("should create product with valid data", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.product.findFirst).mockResolvedValue(null);
      jest
        .mocked(database.product.create)
        .mockResolvedValue(mockProduct as any);

      const result = await ProductService.createProduct(
        validInput as any,
        mockUserId,
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
      jest.mocked(database.farm.findUnique).mockResolvedValue(null);

      await expect(
        ProductService.createProduct(validInput as any, mockUserId),
      ).rejects.toThrow("Farm not found");
    });

    it("should throw error for unauthorized user", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue({
        ...mockFarm,
        ownerId: "different-user",
      } as any);

      await expect(
        ProductService.createProduct(validInput as any, mockUserId),
      ).rejects.toThrow("Unauthorized: You don't own this farm");
    });

    it("should throw error for inactive farm", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue({
        ...mockFarm,
        status: "INACTIVE",
      } as any);

      await expect(
        ProductService.createProduct(validInput as any, mockUserId),
      ).rejects.toThrow("Cannot add products to inactive farm");
    });

    it("should validate product name length (too short)", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const shortNameInput = { ...validInput, name: "AB" };

      await expect(
        ProductService.createProduct(shortNameInput as any, mockUserId),
      ).rejects.toThrow("Product name must be at least 3 characters");
    });

    it("should validate product name length (too long)", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const longNameInput = { ...validInput, name: "A".repeat(101) };

      await expect(
        ProductService.createProduct(longNameInput as any, mockUserId),
      ).rejects.toThrow("Product name must not exceed 100 characters");
    });

    it("should validate price is positive", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const invalidPriceInput = {
        ...validInput,
        pricing: { basePrice: { amount: 0, currency: "USD" } },
      };

      await expect(
        ProductService.createProduct(invalidPriceInput as any, mockUserId),
      ).rejects.toThrow("Price must be greater than 0");
    });

    it("should validate inventory quantity is non-negative", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const negativeQuantityInput = {
        ...validInput,
        inventory: { ...validInput.inventory, quantity: -1 },
      };

      await expect(
        ProductService.createProduct(negativeQuantityInput as any, mockUserId),
      ).rejects.toThrow("Quantity cannot be negative");
    });

    it("should validate reserved quantity does not exceed total", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const invalidReservedInput = {
        ...validInput,
        inventory: {
          ...validInput.inventory,
          quantity: 50,
          reservedQuantity: 60,
        },
      };

      await expect(
        ProductService.createProduct(invalidReservedInput as any, mockUserId),
      ).rejects.toThrow("Reserved quantity cannot exceed total quantity");
    });

    it("should generate unique slug when duplicate exists", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest
        .mocked(database.product.findFirst)
        .mockResolvedValueOnce({ slug: "organic-tomatoes" } as any)
        .mockResolvedValueOnce(null);
      jest.mocked(database.product.create).mockResolvedValue({
        ...mockProduct,
        slug: "organic-tomatoes-1",
      } as any);

      const result = await ProductService.createProduct(
        validInput as any,
        mockUserId,
      );

      expect(result.slug).toBe("organic-tomatoes-1");
    });

    it("should calculate available quantity correctly", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.product.findFirst).mockResolvedValue(null);
      jest
        .mocked(database.product.create)
        .mockResolvedValue(mockProduct as any);

      await ProductService.createProduct(validInput as any, mockUserId);

      const createCall = jest.mocked(database.product.create).mock.calls[0][0];
      expect(createCall.data.inventory.availableQuantity).toBe(100); // quantity - reserved
    });

    it("should set isLowStock correctly", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.product.findFirst).mockResolvedValue(null);
      jest
        .mocked(database.product.create)
        .mockResolvedValue(mockProduct as any);

      const lowStockInput = {
        ...validInput,
        inventory: { quantity: 15, reservedQuantity: 0, lowStockThreshold: 20 },
      };

      await ProductService.createProduct(lowStockInput as any, mockUserId);

      const createCall = jest.mocked(database.product.create).mock.calls[0][0];
      expect(createCall.data.inventory.isLowStock).toBe(true);
    });

    it("should extract primary photo URL", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.product.findFirst).mockResolvedValue(null);
      jest
        .mocked(database.product.create)
        .mockResolvedValue(mockProduct as any);

      await ProductService.createProduct(validInput as any, mockUserId);

      const createCall = jest.mocked(database.product.create).mock.calls[0][0];
      expect(createCall.data.primaryPhotoUrl).toBe(
        "https://example.com/tomato.jpg",
      );
    });
  });

  describe("📖 getProductById", () => {
    it("should get product by ID with farm", async () => {
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(mockProduct as any);

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
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(mockProduct as any);

      await ProductService.getProductById(mockProductId, false);

      expect(database.product.findUnique).toHaveBeenCalledWith({
        where: { id: mockProductId },
        include: { farm: false },
      });
    });

    it("should return null if product not found", async () => {
      jest.mocked(database.product.findUnique).mockResolvedValue(null);

      const result = await ProductService.getProductById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("🔗 getProductBySlug", () => {
    it("should get product by farm and product slug", async () => {
      jest
        .mocked(database.product.findFirst)
        .mockResolvedValue(mockProduct as any);

      const result = await ProductService.getProductBySlug(
        "test-farm",
        "organic-tomatoes",
      );

      expect(result).toMatchObject({ slug: "organic-tomatoes" });
      expect(mockDatabase.product.findFirst).toHaveBeenCalledWith({
        where: {
          slug: "organic-tomatoes",
          farm: { slug: "test-farm" },
        },
        include: expect.any(Object),
      });
    });

    it("should return null if product not found by slug", async () => {
      jest.mocked(database.product.findFirst).mockResolvedValue(null);

      const result = await ProductService.getProductBySlug(
        "test-farm",
        "nonexistent",
      );

      expect(result).toBeNull();
    });
  });

  describe("📋 listProducts", () => {
    const mockProducts = [mockProduct, { ...mockProduct, id: "product-456" }];

    it("should list products with default pagination", async () => {
      jest
        .mocked(database.product.findMany)
        .mockResolvedValue(mockProducts as any);
      jest.mocked(database.product.count).mockResolvedValue(2);

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
      jest
        .mocked(database.product.findMany)
        .mockResolvedValue(mockProducts as any);
      jest.mocked(database.product.count).mockResolvedValue(2);

      await ProductService.listProducts({ farmId: mockFarmId });

      const findCall = jest.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where).toMatchObject({ farmId: mockFarmId });
    });

    it("should filter products by category", async () => {
      jest
        .mocked(database.product.findMany)
        .mockResolvedValue(mockProducts as any);
      jest.mocked(database.product.count).mockResolvedValue(2);

      await ProductService.listProducts({ category: "VEGETABLES" });

      const findCall = jest.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where).toMatchObject({ category: "VEGETABLES" });
    });

    it("should filter products by status", async () => {
      jest
        .mocked(database.product.findMany)
        .mockResolvedValue(mockProducts as any);
      jest.mocked(database.product.count).mockResolvedValue(2);

      await ProductService.listProducts({ status: ProductStatus.AVAILABLE });

      const findCall = jest.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where).toMatchObject({ status: ProductStatus.AVAILABLE });
    });

    it("should filter products in stock", async () => {
      jest
        .mocked(database.product.findMany)
        .mockResolvedValue(mockProducts as any);
      jest.mocked(database.product.count).mockResolvedValue(2);

      await ProductService.listProducts({ inStock: true });

      const findCall = jest.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where.inventory).toMatchObject({ inStock: true });
    });

    it("should filter featured products", async () => {
      jest
        .mocked(database.product.findMany)
        .mockResolvedValue(mockProducts as any);
      jest.mocked(database.product.count).mockResolvedValue(2);

      await ProductService.listProducts({ isFeatured: true });

      const findCall = jest.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where).toMatchObject({ isFeatured: true });
    });

    it("should search products by name", async () => {
      jest
        .mocked(database.product.findMany)
        .mockResolvedValue(mockProducts as any);
      jest.mocked(database.product.count).mockResolvedValue(2);

      await ProductService.listProducts({ search: "tomato" });

      const findCall = jest.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where.OR).toBeDefined();
    });

    it("should handle pagination correctly", async () => {
      jest
        .mocked(database.product.findMany)
        .mockResolvedValue(mockProducts as any);
      jest.mocked(database.product.count).mockResolvedValue(50);

      const result = await ProductService.listProducts(
        {},
        { page: 2, limit: 10 },
      );

      expect(result.pagination).toMatchObject({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasMore: true,
      });

      const findCall = jest.mocked(database.product.findMany).mock.calls[0][0];
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
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(mockProduct as any);
      jest.mocked(database.product.findFirst).mockResolvedValue(null);
      jest.mocked(database.product.update).mockResolvedValue({
        ...mockProduct,
        ...updateData,
      } as any);

      const result = await ProductService.updateProduct(
        mockProductId,
        updateData as any,
        mockUserId,
      );

      expect(result.name).toBe("Updated Tomatoes");
    });

    it("should throw error if product not found", async () => {
      jest.mocked(database.product.findUnique).mockResolvedValue(null);

      await expect(
        ProductService.updateProduct(
          mockProductId,
          updateData as any,
          mockUserId,
        ),
      ).rejects.toThrow("Product not found");
    });

    it("should throw error for unauthorized user", async () => {
      jest.mocked(database.product.findUnique).mockResolvedValue({
        ...mockProduct,
        farm: { ...mockFarm, ownerId: "different-user" },
      } as any);

      await expect(
        ProductService.updateProduct(
          mockProductId,
          updateData as any,
          mockUserId,
        ),
      ).rejects.toThrow("Unauthorized: You don't own this product");
    });

    it("should regenerate slug if name changes", async () => {
      const originalProduct = {
        ...mockProduct,
        name: "Original Product Name",
        slug: "original-product-name",
        farm: {
          ownerId: mockUserId,
        },
      };

      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(originalProduct as any);

      // Mock findFirst to return null (no duplicate slugs)
      jest.mocked(database.product.findFirst).mockResolvedValue(null);

      const updatedProduct = {
        ...originalProduct,
        name: "New Product Name",
        slug: "new-product-name",
        farm: {
          id: mockFarmId,
          name: "Test Farm",
          slug: "test-farm",
          logoUrl: null,
          verificationStatus: "VERIFIED" as any,
        },
      };

      jest
        .mocked(database.product.update)
        .mockResolvedValue(updatedProduct as any);

      const result = await ProductService.updateProduct(
        mockProductId,
        { name: "New Product Name" } as any,
        mockUserId,
      );

      expect(result.name).toBe("New Product Name");
      expect(result.slug).toBe("new-product-name");

      // Verify slug generation was called (checks for duplicate slugs)
      expect(database.product.findFirst).toHaveBeenCalled();

      // Verify update was called with the data
      const updateCall = jest.mocked(database.product.update).mock.calls[0][0];

      // The slug is passed as a separate field in the data object
      // Check that update was called with the new name
      expect(updateCall.where.id).toBe(mockProductId);
      expect(updateCall.data.name).toBe("New Product Name");

      // The service should have generated a new slug (verified by findFirst call)
      expect(database.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            farmId: mockFarmId,
          }),
        }),
      );
    });

    it("should recalculate inventory when updated", async () => {
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(mockProduct as any);
      jest
        .mocked(database.product.update)
        .mockResolvedValue(mockProduct as any);

      await ProductService.updateProduct(
        mockProductId,
        { inventory: { quantity: 200, reservedQuantity: 20 } } as any,
        mockUserId,
      );

      const updateCall = jest.mocked(database.product.update).mock.calls[0][0];
      expect(updateCall.data.inventory.availableQuantity).toBe(180);
    });

    it("should update primary photo URL if images change", async () => {
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(mockProduct as any);
      jest
        .mocked(database.product.update)
        .mockResolvedValue(mockProduct as any);

      const newImages = [
        { url: "https://example.com/new.jpg", isPrimary: true },
      ];

      await ProductService.updateProduct(
        mockProductId,
        { images: newImages } as any,
        mockUserId,
      );

      const updateCall = jest.mocked(database.product.update).mock.calls[0][0];
      expect(updateCall.data.primaryPhotoUrl).toBe(
        "https://example.com/new.jpg",
      );
    });
  });

  describe("🗑️ deleteProduct", () => {
    it("should soft delete product successfully", async () => {
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(mockProduct as any);
      jest
        .mocked(database.product.update)
        .mockResolvedValue(mockProduct as any);

      await ProductService.deleteProduct(mockProductId, mockUserId);

      expect(mockDatabase.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: {
          status: ProductStatus.DISCONTINUED,
          updatedAt: expect.any(Date),
        },
      });
    });

    it("should throw error if product not found", async () => {
      jest.mocked(database.product.findUnique).mockResolvedValue(null);

      await expect(
        ProductService.deleteProduct(mockProductId, mockUserId),
      ).rejects.toThrow("Product not found");
    });

    it("should throw error for unauthorized user", async () => {
      jest.mocked(database.product.findUnique).mockResolvedValue({
        ...mockProduct,
        farm: { ...mockFarm, ownerId: "different-user" },
      } as any);

      await expect(
        ProductService.deleteProduct(mockProductId, mockUserId),
      ).rejects.toThrow("Unauthorized: You don't own this product");
    });
  });

  describe("📦 updateInventory", () => {
    it("should update inventory successfully", async () => {
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(mockProduct as any);
      jest
        .mocked(database.product.update)
        .mockResolvedValue(mockProduct as any);

      const result = await ProductService.updateInventory(
        mockProductId,
        150,
        mockUserId,
      );

      expect(database.product.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should calculate available quantity", async () => {
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(mockProduct as any);
      jest
        .mocked(database.product.update)
        .mockResolvedValue(mockProduct as any);

      await ProductService.updateInventory(mockProductId, 150, mockUserId);

      const updateCall = jest.mocked(database.product.update).mock.calls[0][0];
      expect(updateCall.data.inventory.availableQuantity).toBe(140); // 150 - 10 reserved
    });

    it("should set status to OUT_OF_STOCK when quantity is zero", async () => {
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(mockProduct as any);
      jest
        .mocked(database.product.update)
        .mockResolvedValue(mockProduct as any);

      await ProductService.updateInventory(mockProductId, 10, mockUserId); // 10 - 10 reserved = 0

      const updateCall = jest.mocked(database.product.update).mock.calls[0][0];
      expect(updateCall.data.status).toBe(ProductStatus.OUT_OF_STOCK);
    });

    it("should set status to AVAILABLE when quantity is positive", async () => {
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(mockProduct as any);
      jest
        .mocked(database.product.update)
        .mockResolvedValue(mockProduct as any);

      await ProductService.updateInventory(mockProductId, 50, mockUserId);

      const updateCall = jest.mocked(database.product.update).mock.calls[0][0];
      expect(updateCall.data.status).toBe(ProductStatus.AVAILABLE);
    });

    it("should update lastRestocked timestamp", async () => {
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(mockProduct as any);
      jest
        .mocked(database.product.update)
        .mockResolvedValue(mockProduct as any);

      await ProductService.updateInventory(mockProductId, 150, mockUserId);

      const updateCall = jest.mocked(database.product.update).mock.calls[0][0];
      expect(updateCall.data.inventory.lastRestocked).toBeInstanceOf(Date);
    });
  });

  describe("🔍 searchProducts", () => {
    it("should search products by name", async () => {
      jest
        .mocked(database.product.findMany)
        .mockResolvedValue([mockProduct] as any);

      const results = await ProductService.searchProducts("tomato");

      expect(results).toHaveLength(1);
      const findCall = jest.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where.OR).toBeDefined();
    });

    it("should limit search results", async () => {
      jest
        .mocked(database.product.findMany)
        .mockResolvedValue([mockProduct] as any);

      await ProductService.searchProducts("tomato", 5);

      const findCall = jest.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.take).toBe(5);
    });

    it("should only return available products", async () => {
      jest
        .mocked(database.product.findMany)
        .mockResolvedValue([mockProduct] as any);

      await ProductService.searchProducts("tomato");

      const findCall = jest.mocked(database.product.findMany).mock.calls[0][0];
      expect(findCall.where.status).toBe(ProductStatus.AVAILABLE);
    });
  });

  describe("🔄 batchUpdateProducts", () => {
    const productIds = ["product-1", "product-2", "product-3"];
    const batchUpdates = { status: ProductStatus.AVAILABLE };

    it("should update multiple products successfully", async () => {
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(mockProduct as any);
      jest
        .mocked(database.product.update)
        .mockResolvedValue(mockProduct as any);

      const result = await ProductService.batchUpdateProducts(
        productIds,
        batchUpdates as any,
        mockUserId,
      );

      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
      expect(result.successful).toHaveLength(3);
    });

    it("should handle partial failures", async () => {
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValueOnce(mockProduct as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockProduct as any);
      jest
        .mocked(database.product.update)
        .mockResolvedValue(mockProduct as any);

      const result = await ProductService.batchUpdateProducts(
        productIds,
        batchUpdates as any,
        mockUserId,
      );

      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].error).toContain("Product not found");
    });

    it("should return total count", async () => {
      jest
        .mocked(database.product.findUnique)
        .mockResolvedValue(mockProduct as any);
      jest
        .mocked(database.product.update)
        .mockResolvedValue(mockProduct as any);

      const result = await ProductService.batchUpdateProducts(
        productIds,
        batchUpdates as any,
        mockUserId,
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
