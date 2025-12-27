/**
 * 🛒 PRODUCT SERVICE TEST SUITE
 * Comprehensive tests for agricultural product management
 *
 * Coverage: 40+ tests for all product operations
 * Updated for ServiceResponse pattern and instance-based service
 */

import { database } from "@/lib/database";
import { ProductStatus } from "@/types/product";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { ProductService } from "../product.service";
import { ErrorCodes } from "@/lib/types/service-response";

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

// Mock the product repository (which uses database internally)
jest.mock("@/lib/repositories/product.repository", () => ({
  productRepository: {
    findById: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    manifestProduct: jest.fn(),
    findByFarmId: jest.fn(),
    findActiveFarmProducts: jest.fn(),
    findByCategory: jest.fn(),
    findBySeason: jest.fn(),
    findOrganicProducts: jest.fn(),
    searchProducts: jest.fn(),
    searchWithFilters: jest.fn(),
    findByPriceRange: jest.fn(),
    findLowStock: jest.fn(),
    findOutOfStock: jest.fn(),
    updateStock: jest.fn(),
    decrementStock: jest.fn(),
    incrementStock: jest.fn(),
    updateStatus: jest.fn(),
    getFeaturedProducts: jest.fn(),
    getProductAvailability: jest.fn(),
  },
  QuantumProductRepository: jest.fn(),
}));

// Import the mocked repository
import { productRepository } from "@/lib/repositories/product.repository";

const mockDatabase = database as jest.Mocked<typeof database>;
const mockProductRepository = productRepository as jest.Mocked<
  typeof productRepository
>;

// Mock the slug utility
jest.mock("@/lib/utils/slug", () => ({
  generateSlug: (name: string) => name.toLowerCase().replace(/\s+/g, "-"),
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
    _count: {
      orderItems: 5,
      reviews: 3,
    },
  };

  let productService: ProductService;

  beforeEach(() => {
    jest.clearAllMocks();
    productService = new ProductService();
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
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.product.findFirst).mockResolvedValue(null);
      mockProductRepository.manifestProduct.mockResolvedValue(
        mockProduct as any,
      );

      const response = await productService.createProduct(
        mockUserId,
        validInput as any,
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.product).toMatchObject({
          name: "Organic Tomatoes",
          slug: expect.stringContaining("organic-tomatoes"),
        });
        expect(response.data.slug).toBe("organic-tomatoes");
      }
      expect(database.farm.findUnique).toHaveBeenCalledWith({
        where: { id: mockFarmId },
        select: { id: true, ownerId: true, status: true },
      });
    });

    it("should throw error if farm not found", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(null);

      const response = await productService.createProduct(
        mockUserId,
        validInput as any,
      );

      expect(response.success).toBe(false);
    });

    it("should throw error for unauthorized user", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue({
        ...mockFarm,
        ownerId: "different-user",
      } as any);

      const response = await productService.createProduct(
        mockUserId,
        validInput as any,
      );

      expect(response.success).toBe(false);
    });

    it("should throw error for inactive farm", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue({
        ...mockFarm,
        status: "INACTIVE",
      } as any);

      const response = await productService.createProduct(
        mockUserId,
        validInput as any,
      );

      expect(response.success).toBe(false);
    });

    it("should validate product name length (too short)", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const shortNameInput = { ...validInput, name: "AB" };

      const response = await productService.createProduct(
        mockUserId,
        shortNameInput as any,
      );

      expect(response.success).toBe(false);
    });

    it("should validate product name length (too long)", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      // The service validates at 200 chars, so use > 200
      const longNameInput = { ...validInput, name: "A".repeat(201) };

      const response = await productService.createProduct(
        mockUserId,
        longNameInput as any,
      );

      expect(response.success).toBe(false);
    });

    it("should validate price is positive", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const invalidPriceInput = {
        ...validInput,
        pricing: { basePrice: { amount: 0, currency: "USD" } },
      };

      const response = await productService.createProduct(
        mockUserId,
        invalidPriceInput as any,
      );

      expect(response.success).toBe(false);
    });

    it("should validate inventory quantity is non-negative", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const negativeQuantityInput = {
        ...validInput,
        inventory: { ...validInput.inventory, quantity: -1 },
      };

      const response = await productService.createProduct(
        mockUserId,
        negativeQuantityInput as any,
      );

      expect(response.success).toBe(false);
    });

    it("should generate unique slug when duplicate exists", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest
        .mocked(database.product.findFirst)
        .mockResolvedValueOnce({ slug: "organic-tomatoes" } as any)
        .mockResolvedValueOnce(null);
      mockProductRepository.manifestProduct.mockResolvedValue({
        ...mockProduct,
        slug: "organic-tomatoes-1",
      } as any);

      const response = await productService.createProduct(
        mockUserId,
        validInput as any,
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.slug).toBe("organic-tomatoes-1");
      }
    });

    it("should calculate available quantity correctly", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.product.findFirst).mockResolvedValue(null);
      mockProductRepository.manifestProduct.mockResolvedValue(
        mockProduct as any,
      );

      await productService.createProduct(mockUserId, validInput as any);

      // Check that manifestProduct was called with correct inventory
      expect(mockProductRepository.manifestProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          inventory: expect.objectContaining({
            availableQuantity: 100, // quantity - reserved
          }),
        }),
      );
    });

    it("should set isLowStock correctly", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.product.findFirst).mockResolvedValue(null);
      mockProductRepository.manifestProduct.mockResolvedValue(
        mockProduct as any,
      );

      const lowStockInput = {
        ...validInput,
        inventory: { quantity: 15, reservedQuantity: 0, lowStockThreshold: 20 },
      };

      await productService.createProduct(mockUserId, lowStockInput as any);

      expect(mockProductRepository.manifestProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          inventory: expect.objectContaining({
            isLowStock: true,
          }),
        }),
      );
    });

    it("should extract primary photo URL", async () => {
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.product.findFirst).mockResolvedValue(null);
      mockProductRepository.manifestProduct.mockResolvedValue(
        mockProduct as any,
      );

      await productService.createProduct(mockUserId, validInput as any);

      expect(mockProductRepository.manifestProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          primaryPhotoUrl: "https://example.com/tomato.jpg",
        }),
      );
    });
  });

  describe("📖 getProductById", () => {
    it("should get product by ID with farm", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);

      const response = await productService.getProductById(mockProductId);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toMatchObject({
          id: mockProductId,
          name: "Organic Tomatoes",
        });
      }
      expect(mockProductRepository.findById).toHaveBeenCalledWith(
        mockProductId,
      );
    });

    it("should get product by ID without farm", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);

      const response = await productService.getProductById(
        mockProductId,
        false,
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBeDefined();
      }
      expect(mockProductRepository.findById).toHaveBeenCalledWith(
        mockProductId,
      );
    });

    it("should return null if product not found", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      const response = await productService.getProductById(mockProductId);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBeNull();
      }
    });
  });

  describe("🔗 getProductBySlug", () => {
    it("should get product by farm and product slug", async () => {
      jest
        .mocked(database.product.findFirst)
        .mockResolvedValue(mockProduct as any);

      const response = await productService.getProductBySlug(
        "test-farm",
        "organic-tomatoes",
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toMatchObject({
          slug: "organic-tomatoes",
        });
      }
      expect(database.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            slug: "organic-tomatoes",
            farm: { slug: "test-farm" },
          },
        }),
      );
    });

    it("should return null if product not found by slug", async () => {
      jest.mocked(database.product.findFirst).mockResolvedValue(null);

      const response = await productService.getProductBySlug(
        "test-farm",
        "nonexistent",
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBeNull();
      }
    });
  });

  describe("📋 listProducts", () => {
    const mockProducts = [mockProduct, { ...mockProduct, id: "product-456" }];

    it("should list products with default pagination", async () => {
      mockProductRepository.findMany.mockResolvedValue(mockProducts as any);
      mockProductRepository.count.mockResolvedValue(2);

      const response = await productService.listProducts();

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.items).toHaveLength(2);
        expect(response.data.pagination).toMatchObject({
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
        });
      }
    });

    it("should filter products by farm ID", async () => {
      mockProductRepository.findMany.mockResolvedValue(mockProducts as any);
      mockProductRepository.count.mockResolvedValue(2);

      await productService.listProducts({ farmId: mockFarmId });

      expect(mockProductRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ farmId: mockFarmId }),
        expect.any(Object),
      );
    });

    it("should filter products by category", async () => {
      mockProductRepository.findMany.mockResolvedValue(mockProducts as any);
      mockProductRepository.count.mockResolvedValue(2);

      await productService.listProducts({ category: "VEGETABLES" });

      expect(mockProductRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ category: "VEGETABLES" }),
        expect.any(Object),
      );
    });

    it("should filter products by status", async () => {
      mockProductRepository.findMany.mockResolvedValue(mockProducts as any);
      mockProductRepository.count.mockResolvedValue(2);

      await productService.listProducts({ status: ProductStatus.AVAILABLE });

      expect(mockProductRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ status: ProductStatus.AVAILABLE }),
        expect.any(Object),
      );
    });

    it("should filter products in stock", async () => {
      mockProductRepository.findMany.mockResolvedValue(mockProducts as any);
      mockProductRepository.count.mockResolvedValue(2);

      await productService.listProducts({ inStock: true });

      expect(mockProductRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          inventory: { inStock: true },
        }),
        expect.any(Object),
      );
    });

    it("should filter featured products", async () => {
      mockProductRepository.findMany.mockResolvedValue(mockProducts as any);
      mockProductRepository.count.mockResolvedValue(2);

      await productService.listProducts({ isFeatured: true });

      expect(mockProductRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ isFeatured: true }),
        expect.any(Object),
      );
    });

    it("should search products by name", async () => {
      mockProductRepository.findMany.mockResolvedValue(mockProducts as any);
      mockProductRepository.count.mockResolvedValue(2);

      await productService.listProducts({ search: "tomato" });

      expect(mockProductRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              name: { contains: "tomato", mode: "insensitive" },
            }),
          ]),
        }),
        expect.any(Object),
      );
    });

    it("should handle pagination correctly", async () => {
      mockProductRepository.findMany.mockResolvedValue(mockProducts as any);
      mockProductRepository.count.mockResolvedValue(50);

      const response = await productService.listProducts(
        {},
        { page: 2, limit: 10 },
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.pagination).toMatchObject({
          page: 2,
          limit: 10,
          total: 50,
          totalPages: 5,
          hasNext: true,
        });
      }

      expect(mockProductRepository.findMany).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe("✏️ updateProduct", () => {
    const updateData = {
      name: "Updated Tomatoes",
      pricing: { basePrice: { amount: 600, currency: "USD" } },
    };

    it("should update product successfully", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.product.findFirst).mockResolvedValue(null);
      mockProductRepository.update.mockResolvedValue({
        ...mockProduct,
        ...updateData,
        slug: "updated-tomatoes",
      } as any);

      const response = await productService.updateProduct(
        mockProductId,
        updateData as any,
        mockUserId,
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.name).toBe("Updated Tomatoes");
      }
      expect(mockProductRepository.update).toHaveBeenCalled();
    });

    it("should throw error if product not found", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      const response = await productService.updateProduct(
        mockProductId,
        updateData as any,
        mockUserId,
      );

      expect(response.success).toBe(false);
    });

    it("should throw error for unauthorized user", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue({
        ...mockFarm,
        ownerId: "different-user",
      } as any);

      const response = await productService.updateProduct(
        mockProductId,
        updateData as any,
        mockUserId,
      );

      expect(response.success).toBe(false);
    });

    it("should regenerate slug if name changes", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      jest.mocked(database.product.findFirst).mockResolvedValue(null);
      mockProductRepository.update.mockResolvedValue({
        ...mockProduct,
        name: "New Name",
        slug: "new-name",
      } as any);

      const response = await productService.updateProduct(
        mockProductId,
        { name: "New Name" } as any,
        mockUserId,
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.slug).toBe("new-name");
      }
    });

    it("should recalculate inventory when updated", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      mockProductRepository.update.mockResolvedValue({
        ...mockProduct,
        inventory: { quantity: 50, reservedQuantity: 10 },
      } as any);

      await productService.updateProduct(
        mockProductId,
        { inventory: { quantity: 50, reservedQuantity: 10 } } as any,
        mockUserId,
      );

      expect(mockProductRepository.update).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining({
          inventory: expect.objectContaining({
            availableQuantity: 40,
          }),
        }),
      );
    });

    it("should update primary photo URL if images change", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const newImages = [
        { url: "https://example.com/new.jpg", isPrimary: true },
      ];

      mockProductRepository.update.mockResolvedValue({
        ...mockProduct,
        images: newImages,
      } as any);

      await productService.updateProduct(
        mockProductId,
        { images: newImages } as any,
        mockUserId,
      );

      expect(mockProductRepository.update).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining({
          primaryPhotoUrl: "https://example.com/new.jpg",
        }),
      );
    });
  });

  describe("🗑️ deleteProduct", () => {
    it("should soft delete product successfully", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      mockProductRepository.update.mockResolvedValue({
        ...mockProduct,
        status: "ARCHIVED",
      } as any);

      const response = await productService.deleteProduct(
        mockProductId,
        mockUserId,
      );

      expect(response.success).toBe(true);
      expect(mockProductRepository.update).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining({
          status: "ARCHIVED",
        }),
      );
    });

    it("should throw error if product not found", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      const response = await productService.deleteProduct(
        mockProductId,
        mockUserId,
      );

      expect(response.success).toBe(false);
    });

    it("should throw error for unauthorized user", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue({
        ...mockFarm,
        ownerId: "different-user",
      } as any);

      const response = await productService.deleteProduct(
        mockProductId,
        mockUserId,
      );

      expect(response.success).toBe(false);
    });
  });

  describe("📦 updateInventory", () => {
    it("should update inventory successfully", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      mockProductRepository.update.mockResolvedValue({
        ...mockProduct,
        inventory: { quantity: 50, reservedQuantity: 5 },
      } as any);

      const response = await productService.updateInventory(
        mockProductId,
        { quantity: 50, reservedQuantity: 5 },
        mockUserId,
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBeDefined();
      }
      expect(mockProductRepository.update).toHaveBeenCalled();
    });

    it("should calculate available quantity", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      mockProductRepository.update.mockResolvedValue(mockProduct as any);

      await productService.updateInventory(
        mockProductId,
        { quantity: 50, reservedQuantity: 10 },
        mockUserId,
      );

      expect(mockProductRepository.update).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining({
          inventory: expect.objectContaining({
            availableQuantity: 40,
          }),
        }),
      );
    });

    it("should set status to OUT_OF_STOCK when quantity is zero", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      mockProductRepository.update.mockResolvedValue(mockProduct as any);

      await productService.updateInventory(
        mockProductId,
        { quantity: 0 },
        mockUserId,
      );

      expect(mockProductRepository.update).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining({
          status: "OUT_OF_STOCK",
        }),
      );
    });

    it("should set status to ACTIVE when quantity is positive", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      mockProductRepository.update.mockResolvedValue(mockProduct as any);

      await productService.updateInventory(
        mockProductId,
        { quantity: 100 },
        mockUserId,
      );

      expect(mockProductRepository.update).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining({
          status: "ACTIVE",
        }),
      );
    });

    it("should update lastRestocked timestamp", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      mockProductRepository.update.mockResolvedValue(mockProduct as any);

      await productService.updateInventory(
        mockProductId,
        { quantity: 100 },
        mockUserId,
      );

      expect(mockProductRepository.update).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining({
          inventory: expect.objectContaining({
            lastRestocked: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe("🔍 searchProducts", () => {
    it("should search products by name", async () => {
      mockProductRepository.searchProducts.mockResolvedValue([
        mockProduct,
      ] as any);

      const response = await productService.searchProducts("tomato");

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toHaveLength(1);
      }
      expect(mockProductRepository.searchProducts).toHaveBeenCalledWith(
        "tomato",
        expect.objectContaining({
          take: 20,
        }),
      );
    });

    it("should limit search results", async () => {
      mockProductRepository.searchProducts.mockResolvedValue([
        mockProduct,
      ] as any);

      await productService.searchProducts("tomato", 5);

      expect(mockProductRepository.searchProducts).toHaveBeenCalledWith(
        "tomato",
        expect.objectContaining({
          take: 5,
        }),
      );
    });

    it("should order by createdAt desc", async () => {
      mockProductRepository.searchProducts.mockResolvedValue([
        mockProduct,
      ] as any);

      await productService.searchProducts("tomato");

      expect(mockProductRepository.searchProducts).toHaveBeenCalledWith(
        "tomato",
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
        }),
      );
    });
  });

  describe("🔄 batchUpdateProducts", () => {
    const productIds = ["product-1", "product-2"];
    const batchUpdates = { status: ProductStatus.AVAILABLE };

    it("should update multiple products successfully", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      mockProductRepository.update.mockResolvedValue(mockProduct as any);

      const response = await productService.batchUpdateProducts(
        productIds.map((id) => ({ id, data: batchUpdates as any })),
        mockUserId,
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.successCount).toBe(2);
        expect(response.data.failureCount).toBe(0);
      }
    });

    it("should handle partial failures", async () => {
      mockProductRepository.findById
        .mockResolvedValueOnce(mockProduct as any)
        .mockResolvedValueOnce(null);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      mockProductRepository.update.mockResolvedValue(mockProduct as any);

      const response = await productService.batchUpdateProducts(
        productIds.map((id) => ({ id, data: batchUpdates as any })),
        mockUserId,
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.successCount).toBe(1);
        expect(response.data.failureCount).toBe(1);
      }
    });

    it("should return total count", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      mockProductRepository.update.mockResolvedValue(mockProduct as any);

      const response = await productService.batchUpdateProducts(
        productIds.map((id) => ({ id, data: batchUpdates as any })),
        mockUserId,
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.total).toBe(2);
      }
    });
  });

  describe("📊 getProductStats", () => {
    it("should return product statistics", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);

      const response = await productService.getProductStats(mockProductId);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toMatchObject({
          productId: mockProductId,
          orders: 5,
          reviewCount: 3,
        });
      }
    });
  });
});
