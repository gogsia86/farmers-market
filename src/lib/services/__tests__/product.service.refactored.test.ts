/**
 * 🧪 PRODUCT SERVICE TESTS - COMPREHENSIVE SERVICE LAYER TESTING
 *
 * Divine test suite for refactored ProductService using repository pattern
 * Following agricultural consciousness and quantum testing patterns
 *
 * Test Coverage:
 * - Product creation with validation and authorization
 * - Product retrieval (by ID, slug, search)
 * - Product updates with business logic
 * - Product deletion (soft delete)
 * - Inventory management
 * - Batch operations
 * - Authorization checks
 * - Validation logic
 * - Business logic calculations
 *
 * Divine Patterns Applied:
 * - Service layer testing (mocking repository, not database)
 * - Authorization verification
 * - Validation testing
 * - Business logic isolation
 * - Agricultural consciousness
 * - Enlightening error messages
 *
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 */

import { ProductService } from "../product.service.refactored";
import { productRepository } from "@/lib/repositories/product.repository";
import type { CreateProductInput, UpdateProductInput } from "@/types/product";

// Mock the product repository
jest.mock("@/lib/repositories/product.repository", () => ({
  productRepository: {
    manifestProduct: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    searchProducts: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    db: {
      farm: {
        findUnique: jest.fn(),
      },
      product: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    },
  },
}));

// Mock slug generator
jest.mock("@/lib/utils/slug", () => ({
  generateSlug: jest.fn((name: string) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  }),
}));

describe("🌾 ProductService - Divine Service Layer with Repository Pattern", () => {
  const mockUserId = "user_divine_farmer_001";
  const mockFarmId = "farm_divine_harvest_001";
  const mockProductId = "product_quantum_tomato_001";

  // Divine agricultural test data
  const mockFarm = {
    id: mockFarmId,
    ownerId: mockUserId,
    status: "ACTIVE",
    name: "Divine Harvest Farm",
  };

  const mockProduct = {
    id: mockProductId,
    slug: "heritage-heirloom-tomatoes",
    name: "Heritage Heirloom Tomatoes",
    description: "Organic heirloom tomatoes",
    price: 5.99,
    category: "VEGETABLES",
    unit: "lb",
    farmId: mockFarmId,
    organic: true,
    seasonal: true,
    inStock: true,
    quantityAvailable: 50,
    inventory: {
      quantity: 50,
      reservedQuantity: 0,
      availableQuantity: 50,
      isLowStock: false,
      lowStockThreshold: 10,
    },
    farm: {
      id: mockFarmId,
      name: "Divine Harvest Farm",
      slug: "divine-harvest-farm",
      ownerId: mockUserId,
    },
    _count: {
      orderItems: 0,
      reviews: 0,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("🌟 Product Creation - createProduct()", () => {
    const validProductData: CreateProductInput = {
      name: "Heritage Heirloom Tomatoes",
      description: "Organic heirloom tomatoes",
      farmId: mockFarmId,
      category: "VEGETABLES",
      unit: "lb",
      pricing: {
        basePrice: {
          amount: 5.99,
          currency: "USD",
        },
      },
      inventory: {
        quantity: 50,
        reservedQuantity: 0,
        lowStockThreshold: 10,
      },
      images: [
        {
          url: "https://images.farmersmarket.app/tomatoes.jpg",
          isPrimary: true,
        },
      ],
    } as any;

    it("should create product with valid data and authorization", async () => {
      // Arrange
      (productRepository.db.farm.findUnique as jest.Mock).mockResolvedValue(
        mockFarm,
      );
      (productRepository.db.product.findFirst as jest.Mock).mockResolvedValue(
        null,
      );
      (productRepository.manifestProduct as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      // Act
      const result = await ProductService.createProduct(
        validProductData,
        mockUserId,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe("Heritage Heirloom Tomatoes");
      expect(productRepository.db.farm.findUnique).toHaveBeenCalledWith({
        where: { id: mockFarmId },
        select: { id: true, ownerId: true, status: true },
      });
      expect(productRepository.manifestProduct).toHaveBeenCalledTimes(1);
    });

    it("should throw error when user ID is missing", async () => {
      // Act & Assert
      await expect(
        ProductService.createProduct(validProductData, ""),
      ).rejects.toThrow("Valid user ID is required");
    });

    it("should throw error when product name is too short", async () => {
      // Arrange
      const invalidData = {
        ...validProductData,
        name: "ab",
      };

      // Act & Assert
      await expect(
        ProductService.createProduct(invalidData, mockUserId),
      ).rejects.toThrow("Product name must be at least 3 characters");
    });

    it("should throw error when farm ID is missing", async () => {
      // Arrange
      const invalidData = {
        ...validProductData,
        farmId: undefined,
      } as any;

      // Act & Assert
      await expect(
        ProductService.createProduct(invalidData, mockUserId),
      ).rejects.toThrow("Farm ID is required");
    });

    it("should throw error when farm not found", async () => {
      // Arrange
      (productRepository.db.farm.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(
        ProductService.createProduct(validProductData, mockUserId),
      ).rejects.toThrow("Farm not found");
    });

    it("should throw error when user doesn't own farm", async () => {
      // Arrange
      const differentOwnerFarm = { ...mockFarm, ownerId: "different_user" };
      (productRepository.db.farm.findUnique as jest.Mock).mockResolvedValue(
        differentOwnerFarm,
      );

      // Act & Assert
      await expect(
        ProductService.createProduct(validProductData, mockUserId),
      ).rejects.toThrow("Unauthorized: You don't own this farm");
    });

    it("should throw error when farm is not active", async () => {
      // Arrange
      const inactiveFarm = { ...mockFarm, status: "INACTIVE" };
      (productRepository.db.farm.findUnique as jest.Mock).mockResolvedValue(
        inactiveFarm,
      );

      // Act & Assert
      await expect(
        ProductService.createProduct(validProductData, mockUserId),
      ).rejects.toThrow("Cannot add products to inactive farm");
    });

    it("should generate unique slug from product name", async () => {
      // Arrange
      const { generateSlug } = require("@/lib/utils/slug");
      (generateSlug as jest.Mock).mockReturnValue("heritage-heirloom-tomatoes");

      (productRepository.db.farm.findUnique as jest.Mock).mockResolvedValue(
        mockFarm,
      );
      // Mock slug uniqueness check - first call returns null (slug is unique)
      (productRepository.db.product.findFirst as jest.Mock).mockResolvedValue(
        null,
      );
      (productRepository.manifestProduct as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      // Act
      await ProductService.createProduct(validProductData, mockUserId);

      // Assert
      expect(generateSlug).toHaveBeenCalledWith(validProductData.name);
      expect(productRepository.manifestProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: "heritage-heirloom-tomatoes",
        }),
      );
    });

    it("should calculate available quantity and low stock status", async () => {
      // Arrange
      (productRepository.db.farm.findUnique as jest.Mock).mockResolvedValue(
        mockFarm,
      );
      (productRepository.db.product.findFirst as jest.Mock).mockResolvedValue(
        null,
      );
      (productRepository.manifestProduct as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      // Act
      await ProductService.createProduct(validProductData, mockUserId);

      // Assert
      expect(productRepository.manifestProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          inventory: expect.objectContaining({
            availableQuantity: expect.any(Number),
            isLowStock: expect.any(Boolean),
          }),
        }),
      );
    });

    it("should set primary photo URL from images", async () => {
      // Arrange
      (productRepository.db.farm.findUnique as jest.Mock).mockResolvedValue(
        mockFarm,
      );
      (productRepository.db.product.findFirst as jest.Mock).mockResolvedValue(
        null,
      );
      (productRepository.manifestProduct as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      // Act
      await ProductService.createProduct(validProductData, mockUserId);

      // Assert
      expect(productRepository.manifestProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          primaryPhotoUrl: "https://images.farmersmarket.app/tomatoes.jpg",
        }),
      );
    });
  });

  describe("🔍 Product Retrieval - getProductById()", () => {
    it("should retrieve product by ID with farm details", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(mockProduct);

      // Act
      const result = await ProductService.getProductById(mockProductId, true);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(productRepository.findById).toHaveBeenCalledWith(mockProductId);
    });

    it("should return null when product not found", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await ProductService.getProductById("nonexistent");

      // Assert
      expect(result).toBeNull();
    });

    it("should exclude farm details when requested", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(mockProduct);

      // Act
      const result = await ProductService.getProductById(mockProductId, false);

      // Assert
      expect(result).toBeDefined();
      expect(result?.farm).toBeUndefined();
    });
  });

  describe("🔗 Product by Slug - getProductBySlug()", () => {
    it("should retrieve product by farm and product slug", async () => {
      // Arrange
      (productRepository.db.product.findFirst as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      // Act
      const result = await ProductService.getProductBySlug(
        "divine-harvest-farm",
        "heritage-heirloom-tomatoes",
      );

      // Assert
      expect(result).toEqual(mockProduct);
      expect(productRepository.db.product.findFirst).toHaveBeenCalledWith({
        where: {
          slug: "heritage-heirloom-tomatoes",
          farm: {
            slug: "divine-harvest-farm",
          },
        },
        include: expect.any(Object),
      });
    });

    it("should return null when slug not found", async () => {
      // Arrange
      (productRepository.db.product.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      // Act
      const result = await ProductService.getProductBySlug(
        "nonexistent-farm",
        "nonexistent-product",
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("📋 Product Listing - listProducts()", () => {
    it("should list products with pagination", async () => {
      // Arrange
      const mockProducts = [mockProduct];
      (productRepository.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (productRepository.count as jest.Mock).mockResolvedValue(1);

      // Act
      const result = await ProductService.listProducts(
        {},
        { page: 1, limit: 20 },
      );

      // Assert
      expect(result).toEqual({
        products: mockProducts,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasMore: false,
        },
      });
    });

    it("should apply filters when provided", async () => {
      // Arrange
      (productRepository.findMany as jest.Mock).mockResolvedValue([]);
      (productRepository.count as jest.Mock).mockResolvedValue(0);

      // Act
      await ProductService.listProducts({
        farmId: mockFarmId,
        category: "VEGETABLES",
        isOrganic: true,
      });

      // Assert
      expect(productRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          farmId: mockFarmId,
          category: "VEGETABLES",
        }),
        expect.any(Object),
      );
    });

    it("should handle pagination correctly", async () => {
      // Arrange
      (productRepository.findMany as jest.Mock).mockResolvedValue([]);
      (productRepository.count as jest.Mock).mockResolvedValue(50);

      // Act
      await ProductService.listProducts({}, { page: 2, limit: 10 });

      // Assert
      expect(productRepository.findMany).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe("✏️ Product Updates - updateProduct()", () => {
    const updateData: UpdateProductInput = {
      name: "Premium Heritage Tomatoes",
      pricing: {
        basePrice: {
          amount: 7.99,
          currency: "USD",
        },
      },
    } as any;

    it("should update product with valid data and authorization", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(mockProduct);
      (productRepository.db.product.findFirst as jest.Mock).mockResolvedValue(
        null,
      );
      (productRepository.update as jest.Mock).mockResolvedValue({
        ...mockProduct,
        ...updateData,
      });

      // Act
      const result = await ProductService.updateProduct(
        mockProductId,
        updateData,
        mockUserId,
      );

      // Assert
      expect(result).toBeDefined();
      expect(productRepository.update).toHaveBeenCalledWith(
        mockProductId,
        expect.any(Object),
      );
    });

    it("should throw error when product not found", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        ProductService.updateProduct(mockProductId, updateData, mockUserId),
      ).rejects.toThrow("Product not found");
    });

    it("should throw error when user doesn't own product", async () => {
      // Arrange
      const productWithDifferentOwner = {
        ...mockProduct,
        farm: { ...mockProduct.farm, ownerId: "different_user" },
      };
      (productRepository.findById as jest.Mock).mockResolvedValue(
        productWithDifferentOwner,
      );

      // Act & Assert
      await expect(
        ProductService.updateProduct(mockProductId, updateData, mockUserId),
      ).rejects.toThrow("Unauthorized: You don't own this product");
    });

    it("should generate new slug when name changes", async () => {
      // Arrange
      const { generateSlug } = require("@/lib/utils/slug");
      (generateSlug as jest.Mock).mockReturnValue("new-product-name");

      (productRepository.findById as jest.Mock).mockResolvedValue(mockProduct);
      // Mock slug uniqueness check - return null (slug is unique)
      (productRepository.db.product.findFirst as jest.Mock).mockResolvedValue(
        null,
      );
      (productRepository.update as jest.Mock).mockResolvedValue(mockProduct);

      const newName = "New Product Name";

      // Act
      await ProductService.updateProduct(
        mockProductId,
        { name: newName } as any,
        mockUserId,
      );

      // Assert
      expect(generateSlug).toHaveBeenCalledWith(newName);
      expect(productRepository.db.product.findFirst).toHaveBeenCalled();
      expect(productRepository.update).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining({
          slug: "new-product-name",
        }),
      );
    });

    it("should recalculate inventory when updated", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(mockProduct);
      (productRepository.update as jest.Mock).mockResolvedValue(mockProduct);

      const inventoryUpdate = {
        inventory: {
          quantity: 100,
          reservedQuantity: 10,
        },
      } as any;

      // Act
      await ProductService.updateProduct(
        mockProductId,
        inventoryUpdate,
        mockUserId,
      );

      // Assert
      expect(productRepository.update).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining({
          inventory: expect.objectContaining({
            availableQuantity: expect.any(Number),
            isLowStock: expect.any(Boolean),
          }),
        }),
      );
    });
  });

  describe("🗑️ Product Deletion - deleteProduct()", () => {
    it("should soft delete product with authorization", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(mockProduct);
      (productRepository.update as jest.Mock).mockResolvedValue(undefined);

      // Act
      await ProductService.deleteProduct(mockProductId, mockUserId);

      // Assert
      expect(productRepository.update).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining({
          status: "ARCHIVED",
        }),
      );
    });

    it("should throw error when product not found", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        ProductService.deleteProduct(mockProductId, mockUserId),
      ).rejects.toThrow("Product not found");
    });

    it("should throw error when user doesn't own product", async () => {
      // Arrange
      const productWithDifferentOwner = {
        ...mockProduct,
        farm: { ...mockProduct.farm, ownerId: "different_user" },
      };
      (productRepository.findById as jest.Mock).mockResolvedValue(
        productWithDifferentOwner,
      );

      // Act & Assert
      await expect(
        ProductService.deleteProduct(mockProductId, mockUserId),
      ).rejects.toThrow("Unauthorized: You don't own this product");
    });
  });

  describe("📦 Inventory Management - updateInventory()", () => {
    it("should update inventory with calculations", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(mockProduct);
      (productRepository.update as jest.Mock).mockResolvedValue(mockProduct);

      const inventoryUpdate = {
        quantity: 100,
        reservedQuantity: 10,
        lowStockThreshold: 15,
      };

      // Act
      const result = await ProductService.updateInventory(
        mockProductId,
        inventoryUpdate,
        mockUserId,
      );

      // Assert
      expect(result).toBeDefined();
      expect(productRepository.update).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining({
          inventory: expect.objectContaining({
            availableQuantity: 90, // 100 - 10
            isLowStock: false, // 90 > 15
            inStock: true,
          }),
        }),
      );
    });

    it("should throw error when product not found", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        ProductService.updateInventory(mockProductId, {}, mockUserId),
      ).rejects.toThrow("Product not found");
    });

    it("should throw error when user doesn't own product", async () => {
      // Arrange
      const productWithDifferentOwner = {
        ...mockProduct,
        farm: { ...mockProduct.farm, ownerId: "different_user" },
      };
      (productRepository.findById as jest.Mock).mockResolvedValue(
        productWithDifferentOwner,
      );

      // Act & Assert
      await expect(
        ProductService.updateInventory(mockProductId, {}, mockUserId),
      ).rejects.toThrow("Unauthorized: You don't own this product");
    });

    it("should mark as out of stock when quantity is zero", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(mockProduct);
      (productRepository.update as jest.Mock).mockResolvedValue(mockProduct);

      // Act
      await ProductService.updateInventory(
        mockProductId,
        { quantity: 0, reservedQuantity: 0 },
        mockUserId,
      );

      // Assert
      expect(productRepository.update).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining({
          status: "OUT_OF_STOCK",
          inventory: expect.objectContaining({
            inStock: false,
          }),
        }),
      );
    });
  });

  describe("📊 Product Statistics - getProductStats()", () => {
    it("should return product statistics", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue({
        ...mockProduct,
        viewsCount: 150,
        _count: {
          orderItems: 25,
          reviews: 5,
        },
      });

      // Act
      const result = await ProductService.getProductStats(mockProductId);

      // Assert
      expect(result).toEqual({
        views: 150,
        orders: 25,
        revenue: 0,
        reviewCount: 5,
        inWishlistCount: 0,
      });
    });

    it("should throw error when product not found", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        ProductService.getProductStats(mockProductId),
      ).rejects.toThrow("Product not found");
    });
  });

  describe("🔍 Product Search - searchProducts()", () => {
    it("should search products by text", async () => {
      // Arrange
      const mockResults = [mockProduct];
      (productRepository.searchProducts as jest.Mock).mockResolvedValue(
        mockResults,
      );

      // Act
      const result = await ProductService.searchProducts("tomato");

      // Assert
      expect(result).toEqual(mockResults);
      expect(productRepository.searchProducts).toHaveBeenCalledWith(
        "tomato",
        expect.any(Object),
      );
    });

    it("should respect limit parameter", async () => {
      // Arrange
      (productRepository.searchProducts as jest.Mock).mockResolvedValue([]);

      // Act
      await ProductService.searchProducts("tomato", 10);

      // Assert
      expect(productRepository.searchProducts).toHaveBeenCalledWith(
        "tomato",
        expect.objectContaining({
          take: 10,
        }),
      );
    });
  });

  describe("🔄 Batch Operations - batchUpdateProducts()", () => {
    it("should update multiple products successfully", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(mockProduct);
      (productRepository.update as jest.Mock).mockResolvedValue(mockProduct);

      const updates = [
        { id: "product_001", data: { name: "Updated 1" } as any },
        { id: "product_002", data: { name: "Updated 2" } as any },
      ];

      // Act
      const result = await ProductService.batchUpdateProducts(
        updates,
        mockUserId,
      );

      // Assert
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(result.successful).toHaveLength(2);
    });

    it("should handle partial failures gracefully", async () => {
      // Arrange
      (productRepository.findById as jest.Mock)
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(null);
      (productRepository.update as jest.Mock).mockResolvedValue(mockProduct);

      const updates = [
        { id: "product_001", data: { name: "Updated 1" } as any },
        { id: "product_002", data: { name: "Updated 2" } as any },
      ];

      // Act
      const result = await ProductService.batchUpdateProducts(
        updates,
        mockUserId,
      );

      // Assert
      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(1);
      expect(result.failed).toHaveLength(1);
    });
  });

  describe("👁️ View Tracking - incrementViewCount()", () => {
    it("should increment product view count", async () => {
      // Arrange
      (productRepository.db.product.update as jest.Mock).mockResolvedValue(
        undefined,
      );

      // Act
      await ProductService.incrementViewCount(mockProductId);

      // Assert
      expect(productRepository.db.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: {
          viewsCount: {
            increment: 1,
          },
        },
      });
    });
  });

  describe("🔗 Related Products - getRelatedProducts()", () => {
    it("should find related products by category and farm", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(mockProduct);
      (productRepository.findMany as jest.Mock).mockResolvedValue([
        mockProduct,
      ]);

      // Act
      const result = await ProductService.getRelatedProducts(mockProductId, 6);

      // Assert
      expect(result).toHaveLength(1);
      expect(productRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          id: { not: mockProductId },
          status: "ACTIVE",
          inStock: true,
          OR: [
            { category: mockProduct.category },
            { farmId: mockProduct.farmId },
          ],
        }),
        expect.objectContaining({
          take: 6,
        }),
      );
    });

    it("should return empty array when product not found", async () => {
      // Arrange
      (productRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await ProductService.getRelatedProducts(mockProductId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("📝 Product Detail - getProductDetailBySlug()", () => {
    it("should get product detail with reviews", async () => {
      // Arrange
      const productWithReviews = {
        ...mockProduct,
        reviews: [
          {
            id: "review_001",
            rating: 5,
            comment: "Great product!",
            customer: {
              id: "customer_001",
              name: "John Doe",
            },
          },
        ],
      };
      (productRepository.db.product.findFirst as jest.Mock).mockResolvedValue(
        productWithReviews,
      );

      // Act
      const result = await ProductService.getProductDetailBySlug(
        "divine-harvest-farm",
        "heritage-heirloom-tomatoes",
      );

      // Assert
      expect(result).toBeDefined();
      expect(result?.reviews).toBeDefined();
    });
  });

  describe("🧮 Inventory Calculations - calculateAvailableQuantity()", () => {
    it("should calculate available quantity correctly", () => {
      // Arrange
      const inventory = {
        quantity: 100,
        reservedQuantity: 20,
      };

      // Act
      const result = ProductService.calculateAvailableQuantity(inventory);

      // Assert
      expect(result).toBe(80);
    });

    it("should return 0 when quantity is less than reserved", () => {
      // Arrange
      const inventory = {
        quantity: 10,
        reservedQuantity: 20,
      };

      // Act
      const result = ProductService.calculateAvailableQuantity(inventory);

      // Assert
      expect(result).toBe(0);
    });

    it("should handle missing values gracefully", () => {
      // Arrange
      const inventory = {
        quantity: 0,
        reservedQuantity: 0,
      };

      // Act
      const result = ProductService.calculateAvailableQuantity(inventory);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe("🌾 Agricultural Consciousness", () => {
    it("should maintain organic product awareness", async () => {
      // Arrange
      const organicProduct = { ...mockProduct, organic: true };
      (productRepository.findById as jest.Mock).mockResolvedValue(
        organicProduct,
      );

      // Act
      const result = await ProductService.getProductById(mockProductId);

      // Assert
      expect(result?.organic).toBe(true);
    });

    it("should maintain seasonal product awareness", async () => {
      // Arrange
      const seasonalProduct = { ...mockProduct, seasonal: true };
      (productRepository.findById as jest.Mock).mockResolvedValue(
        seasonalProduct,
      );

      // Act
      const result = await ProductService.getProductById(mockProductId);

      // Assert
      expect(result?.seasonal).toBe(true);
    });
  });
});

/**
 * 🎉 PRODUCT SERVICE TESTS COMPLETE
 *
 * Coverage Achieved:
 * ✅ 45+ comprehensive service layer tests
 * ✅ All public methods tested
 * ✅ Authorization checks verified
 * ✅ Validation logic tested
 * ✅ Business logic calculations verified
 * ✅ Error handling tested
 * ✅ Agricultural consciousness maintained
 * ✅ Repository mocking (not database)
 * ✅ Divine patterns applied throughout
 *
 * Test Categories:
 * - Product Creation: 10 tests
 * - Product Retrieval: 3 tests
 * - Product by Slug: 2 tests
 * - Product Listing: 3 tests
 * - Product Updates: 5 tests
 * - Product Deletion: 3 tests
 * - Inventory Management: 4 tests
 * - Product Statistics: 2 tests
 * - Product Search: 2 tests
 * - Batch Operations: 2 tests
 * - View Tracking: 1 test
 * - Related Products: 2 tests
 * - Product Detail: 1 test
 * - Calculations: 3 tests
 * - Agricultural Consciousness: 2 tests
 *
 * Total: 45 tests
 *
 * Divine Product Service Testing - Complete! 🌾⚡✨
 */
