/**
 * 🧪 PRODUCT REPOSITORY TESTS - DIVINE QUANTUM TESTING
 *
 * Comprehensive test suite for QuantumProductRepository
 * Following divine agricultural patterns and quantum testing consciousness
 *
 * Test Coverage:
 * - Product creation (manifestProduct)
 * - CRUD operations (find, update, delete)
 * - Product queries (by farm, category, search)
 * - Inventory management (stock operations)
 * - Pricing operations
 * - Seasonal product handling
 * - Transaction support
 * - Error handling
 *
 * Divine Patterns Applied:
 * - Quantum test consciousness
 * - Agricultural awareness in tests
 * - Comprehensive mock data fixtures
 * - Transaction isolation
 * - Enlightening error messages
 *
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 */

import { QuantumProductRepository } from "../product.repository";
import { database } from "@/lib/database";
import type { Product, Farm, Prisma } from "@prisma/client";

// Mock the database module
jest.mock("@/lib/database", () => ({
  database: {
    product: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Default include structure that the repository uses
const defaultInclude = {
  farm: {
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      state: true,
      status: true,
    },
  },
  _count: {
    select: {
      orderItems: true,
    },
  },
};

describe("🌾 QuantumProductRepository - Divine Product Database Operations", () => {
  let repository: QuantumProductRepository;
  let mockProduct: Product;
  let mockFarm: Partial<Farm>;

  // Divine agricultural test data fixtures
  beforeEach(() => {
    repository = new QuantumProductRepository();
    jest.clearAllMocks();

    // Mock farm data with agricultural consciousness
    mockFarm = {
      id: "farm_divine_harvest_001",
      name: "Divine Harvest Farm",
      slug: "divine-harvest-farm",
      city: "Celestial Valley",
      state: "organic",
      isActive: true,
      status: "ACTIVE",
    };

    // Mock product data with biodynamic awareness
    mockProduct = {
      id: "product_quantum_tomato_001",
      slug: "heritage-heirloom-tomatoes",
      name: "Heritage Heirloom Tomatoes",
      description: "Organic heirloom tomatoes grown with biodynamic practices",
      price: 5.99,
      compareAtPrice: 7.99,
      unit: "lb",
      category: "VEGETABLES",
      images: [
        "https://images.farmersmarket.app/tomatoes-001.jpg",
        "https://images.farmersmarket.app/tomatoes-002.jpg",
      ],
      inStock: true,
      quantityAvailable: 50,
      farmId: "farm_divine_harvest_001",
      isActive: true,
      organic: true,
      seasonal: true,
      featured: false,
      availableFrom: new Date("2024-06-01"),
      availableTo: new Date("2024-09-30"),
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    } as Product;
  });

  describe("🌟 Product Creation - manifestProduct()", () => {
    it("should manifest a new product with complete agricultural consciousness", async () => {
      // Arrange - Prepare quantum product data
      const productData: Prisma.ProductCreateInput = {
        name: "Heritage Heirloom Tomatoes",
        slug: "heritage-heirloom-tomatoes",
        description: "Organic heirloom tomatoes",
        price: 5.99,
        unit: "lb",
        category: "VEGETABLES",
        organic: true,
        seasonal: true,
        farm: {
          connect: { id: mockFarm.id },
        },
      };

      const expectedProduct = {
        ...mockProduct,
        farm: mockFarm,
        _count: {
          orderItems: 0,
          reviews: 0,
        },
      };

      (database.product.create as jest.Mock).mockResolvedValue(expectedProduct);

      // Act - Manifest product into reality
      const result = await repository.manifestProduct(productData);

      // Assert - Verify quantum manifestation
      expect(result).toEqual(expectedProduct);
      expect(database.product.create).toHaveBeenCalledWith({
        data: productData,
        include: defaultInclude,
      });
    });

    it("should manifest product with farm relation using connect", async () => {
      // Arrange
      const productData: Prisma.ProductCreateInput = {
        name: "Organic Carrots",
        slug: "organic-carrots",
        price: 3.99,
        unit: "bunch",
        category: "VEGETABLES",
        organic: true,
        farm: {
          connect: { id: "farm_divine_harvest_001" },
        },
      };

      const expectedProduct = {
        ...mockProduct,
        id: "product_organic_carrots_001",
        name: "Organic Carrots",
        slug: "organic-carrots",
        price: 3.99,
        unit: "bunch",
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.create as jest.Mock).mockResolvedValue(expectedProduct);

      // Act
      const result = await repository.manifestProduct(productData);

      // Assert
      expect(result).toEqual(expectedProduct);
      expect(database.product.create).toHaveBeenCalledWith({
        data: productData,
        include: defaultInclude,
      });
    });

    it("should manifest product with complete details including images", async () => {
      // Arrange
      const productData: Prisma.ProductCreateInput = {
        name: "Premium Organic Apples",
        slug: "premium-organic-apples",
        description: "Hand-picked premium apples from divine orchards",
        price: 4.99,
        unit: "lb",
        category: "FRUITS",
        images: [
          "https://images.farmersmarket.app/apples-001.jpg",
          "https://images.farmersmarket.app/apples-002.jpg",
          "https://images.farmersmarket.app/apples-003.jpg",
        ],
        organic: true,
        quantityAvailable: 200,
        farm: {
          connect: { id: mockFarm.id },
        },
      };

      const expectedProduct = {
        ...mockProduct,
        ...productData,
        id: "product_premium_apples_001",
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.create as jest.Mock).mockResolvedValue(expectedProduct);

      // Act
      const result = await repository.manifestProduct(productData);

      // Assert
      expect(result).toBeDefined();
      expect(result.images).toHaveLength(3);
    });

    it("should manifest seasonal product with availability dates", async () => {
      // Arrange
      const productData: Prisma.ProductCreateInput = {
        name: "Summer Squash",
        slug: "summer-squash",
        price: 2.99,
        unit: "lb",
        category: "VEGETABLES",
        seasonal: true,
        availableFrom: new Date("2024-06-01"),
        availableTo: new Date("2024-09-30"),
        farm: {
          connect: { id: mockFarm.id },
        },
      };

      const expectedProduct = {
        ...mockProduct,
        ...productData,
        id: "product_summer_squash_001",
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.create as jest.Mock).mockResolvedValue(expectedProduct);

      // Act
      const result = await repository.manifestProduct(productData);

      // Assert
      expect(result.seasonal).toBe(true);
      expect(result.availableFrom).toBeDefined();
      expect(result.availableTo).toBeDefined();
    });

    it("should handle product creation with transaction", async () => {
      // Arrange
      const mockTx = { product: { create: jest.fn() } };
      const productData: Prisma.ProductCreateInput = {
        name: "Transaction Test Product",
        slug: "transaction-test-product",
        price: 9.99,
        unit: "each",
        category: "VEGETABLES",
        farm: {
          connect: { id: mockFarm.id },
        },
      };

      const expectedProduct = {
        ...mockProduct,
        name: "Transaction Test Product",
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      mockTx.product.create.mockResolvedValue(expectedProduct);

      // Act
      const result = await repository.manifestProduct(productData, {
        tx: mockTx,
      });

      // Assert
      expect(result).toEqual(expectedProduct);
      expect(mockTx.product.create).toHaveBeenCalled();
    });
  });

  describe("🔍 Product Retrieval - findById()", () => {
    it("should find product by ID with complete relations", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      const expectedProduct = {
        ...mockProduct,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.findUnique as jest.Mock).mockResolvedValue(
        expectedProduct,
      );

      // Act
      const result = await repository.findById(productId);

      // Assert
      expect(result).toEqual(expectedProduct);
      expect(database.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: defaultInclude,
      });
    });

    it("should return null when product not found", async () => {
      // Arrange
      const productId = "nonexistent_product_id";
      (database.product.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await repository.findById(productId);

      // Assert
      expect(result).toBeNull();
    });

    it("should find product with transaction context", async () => {
      // Arrange
      const mockTx = { product: { findUnique: jest.fn() } };
      const productId = "product_quantum_tomato_001";
      const expectedProduct = {
        ...mockProduct,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      mockTx.product.findUnique.mockResolvedValue(expectedProduct);

      // Act
      const result = await repository.findById(productId, { tx: mockTx });

      // Assert
      expect(result).toEqual(expectedProduct);
      expect(mockTx.product.findUnique).toHaveBeenCalled();
    });
  });

  describe("📋 Farm Products - findByFarmId()", () => {
    it("should find all products for a specific farm", async () => {
      // Arrange
      const farmId = "farm_divine_harvest_001";
      const mockProducts = [
        {
          ...mockProduct,
          id: "product_001",
          name: "Product 1",
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_002",
          name: "Product 2",
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_003",
          name: "Product 3",
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.findByFarmId(farmId);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].farm?.id).toBe(farmId);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: { farmId },
        include: defaultInclude,
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return empty array when farm has no products", async () => {
      // Arrange
      const farmId = "farm_no_products_001";
      (database.product.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.findByFarmId(farmId);

      // Assert
      expect(result).toEqual([]);
    });

    it("should find farm products with pagination", async () => {
      // Arrange
      const farmId = "farm_divine_harvest_001";
      const mockProducts = [
        {
          ...mockProduct,
          id: "product_001",
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_002",
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.findByFarmId(farmId, {
        skip: 0,
        take: 2,
      });

      // Assert
      expect(result).toHaveLength(2);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: { farmId },
        include: defaultInclude,
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 2,
      });
    });
  });

  describe("✅ Active Farm Products - findActiveFarmProducts()", () => {
    it("should find only active products for a farm", async () => {
      // Arrange
      const farmId = "farm_divine_harvest_001";
      const activeProducts = [
        {
          ...mockProduct,
          id: "product_001",
          name: "Active Product 1",
          isActive: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_002",
          name: "Active Product 2",
          isActive: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(
        activeProducts,
      );

      // Act
      const result = await repository.findActiveFarmProducts(farmId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((p) => p.isActive)).toBe(true);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: { farmId, status: "ACTIVE" },
        include: defaultInclude,
        orderBy: { name: "asc" },
      });
    });

    it("should return empty array when no active products", async () => {
      // Arrange
      const farmId = "farm_inactive_001";
      (database.product.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.findActiveFarmProducts(farmId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("🗂️ Category Products - findByCategory()", () => {
    it("should find all products in VEGETABLES category", async () => {
      // Arrange
      const category = "VEGETABLES";
      const mockProducts = [
        {
          ...mockProduct,
          id: "product_001",
          name: "Tomatoes",
          category: "VEGETABLES",
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_002",
          name: "Carrots",
          category: "VEGETABLES",
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_003",
          name: "Lettuce",
          category: "VEGETABLES",
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.findByCategory(category);

      // Assert
      expect(result).toHaveLength(3);
      expect(result.every((p) => p.category === "VEGETABLES")).toBe(true);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: { category, status: "ACTIVE" },
        include: defaultInclude,
        orderBy: { name: "asc" },
      });
    });

    it("should find all products in FRUITS category", async () => {
      // Arrange
      const category = "FRUITS";
      const mockProducts = [
        {
          ...mockProduct,
          id: "product_001",
          name: "Apples",
          category: "FRUITS",
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_002",
          name: "Oranges",
          category: "FRUITS",
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.findByCategory(category);

      // Assert
      expect(result).toHaveLength(2);
    });

    it("should return empty array for category with no products", async () => {
      // Arrange
      const category = "EMPTY_CATEGORY";
      (database.product.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.findByCategory(category);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("🌱 Seasonal Products - findBySeason()", () => {
    it("should find all seasonal products for SUMMER", async () => {
      // Arrange
      const season = "SUMMER";
      const mockProducts = [
        {
          ...mockProduct,
          id: "product_001",
          name: "Summer Squash",
          seasonal: true,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_002",
          name: "Sweet Corn",
          seasonal: true,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.findBySeason(season);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((p) => p.seasonal)).toBe(true);
      expect(result.every((p) => p.inStock)).toBe(true);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: { seasonal: true, inStock: true },
        include: defaultInclude,
      });
    });

    it("should return only in-stock seasonal products", async () => {
      // Arrange
      const season = "FALL";
      const mockProducts = [
        {
          ...mockProduct,
          name: "Fall Pumpkins",
          seasonal: true,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.findBySeason(season);

      // Assert
      expect(result.every((p) => p.inStock)).toBe(true);
    });
  });

  describe("🌿 Organic Products - findOrganicProducts()", () => {
    it("should find all organic products", async () => {
      // Arrange
      const mockProducts = [
        {
          ...mockProduct,
          id: "product_001",
          name: "Organic Tomatoes",
          organic: true,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_002",
          name: "Organic Lettuce",
          organic: true,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_003",
          name: "Organic Apples",
          organic: true,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.findOrganicProducts();

      // Assert
      expect(result).toHaveLength(3);
      expect(result.every((p) => p.organic)).toBe(true);
      expect(result.every((p) => p.inStock)).toBe(true);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: { organic: true, inStock: true },
        include: defaultInclude,
        orderBy: { name: "asc" },
      });
    });

    it("should return empty array when no organic products", async () => {
      // Arrange
      (database.product.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.findOrganicProducts();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("🔍 Product Search - searchProducts()", () => {
    it("should search products by name", async () => {
      // Arrange
      const searchTerm = "tomato";
      const mockProducts = [
        {
          ...mockProduct,
          id: "product_001",
          name: "Heirloom Tomatoes",
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_002",
          name: "Cherry Tomatoes",
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_003",
          name: "Roma Tomatoes",
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.searchProducts(searchTerm);

      // Assert
      expect(result).toHaveLength(3);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { inStock: true },
            {
              OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { description: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
          ],
        },
        include: defaultInclude,
      });
    });

    it("should search products by description", async () => {
      // Arrange
      const searchTerm = "organic";
      const mockProducts = [
        {
          ...mockProduct,
          id: "product_001",
          name: "Farm Fresh Vegetables",
          description: "100% organic vegetables from our farm",
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.searchProducts(searchTerm);

      // Assert
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no matches found", async () => {
      // Arrange
      const searchTerm = "nonexistent_product";
      (database.product.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.searchProducts(searchTerm);

      // Assert
      expect(result).toEqual([]);
    });

    it("should perform case-insensitive search", async () => {
      // Arrange
      const searchTerm = "TOMATO";
      const mockProducts = [
        {
          ...mockProduct,
          name: "Heirloom Tomatoes",
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.searchProducts(searchTerm);

      // Assert
      expect(result).toHaveLength(1);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { inStock: true },
            {
              OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { description: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
          ],
        },
        include: defaultInclude,
      });
    });
  });

  describe("🔍 Advanced Search - searchWithFilters()", () => {
    it("should search products with multiple filters", async () => {
      // Arrange
      const filters = {
        category: "VEGETABLES",
        isOrganic: true,
        minPrice: 2,
        maxPrice: 10,
      };
      const mockProducts = [
        {
          ...mockProduct,
          category: "VEGETABLES",
          organic: true,
          price: 5.99,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.searchWithFilters(filters);

      // Assert
      expect(result).toHaveLength(1);
    });

    it("should filter by farm ID", async () => {
      // Arrange
      const filters = {
        farmId: "farm_divine_harvest_001",
      };
      const mockProducts = [
        {
          ...mockProduct,
          farmId: "farm_divine_harvest_001",
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.searchWithFilters(filters);

      // Assert
      expect(result).toHaveLength(1);
    });

    it("should filter by price range only", async () => {
      // Arrange
      const filters = {
        minPrice: 5,
        maxPrice: 15,
      };
      const mockProducts = [
        {
          ...mockProduct,
          price: 9.99,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_002",
          price: 7.99,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.searchWithFilters(filters);

      // Assert
      expect(result).toHaveLength(2);
    });

    it("should filter by organic status", async () => {
      // Arrange
      const filters = {
        isOrganic: true,
      };
      const mockProducts = [
        {
          ...mockProduct,
          organic: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.searchWithFilters(filters);

      // Assert
      expect(result).toHaveLength(1);
    });

    it("should filter seasonal products", async () => {
      // Arrange
      const filters = {
        season: "SUMMER",
      };
      const mockProducts = [
        {
          ...mockProduct,
          seasonal: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.searchWithFilters(filters);

      // Assert
      expect(result).toHaveLength(1);
    });
  });

  describe("💰 Price Range - findByPriceRange()", () => {
    it("should find products within price range", async () => {
      // Arrange
      const minPrice = 3;
      const maxPrice = 8;
      const mockProducts = [
        {
          ...mockProduct,
          id: "product_001",
          price: 4.99,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_002",
          price: 5.99,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_003",
          price: 7.99,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.findByPriceRange(minPrice, maxPrice);

      // Assert
      expect(result).toHaveLength(3);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: {
          price: { gte: minPrice, lte: maxPrice },
          inStock: true,
        },
        include: defaultInclude,
      });
    });

    it("should return empty array when no products in price range", async () => {
      // Arrange
      (database.product.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.findByPriceRange(100, 200);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("📦 Inventory - findLowStock()", () => {
    it("should find products with low stock", async () => {
      // Arrange
      const threshold = 15;
      const mockProducts = [
        {
          ...mockProduct,
          id: "product_001",
          quantityAvailable: 5,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_002",
          quantityAvailable: 8,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_003",
          quantityAvailable: 12,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.findLowStock(threshold);

      // Assert
      expect(result).toHaveLength(3);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: {
          quantityAvailable: { lte: threshold, gt: 0 },
          inStock: true,
        },
        include: defaultInclude,
        orderBy: { quantityAvailable: "asc" },
      });
    });

    it("should use default threshold of 10", async () => {
      // Arrange
      const mockProducts = [
        {
          ...mockProduct,
          quantityAvailable: 5,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.findLowStock();

      // Assert
      expect(result).toHaveLength(1);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: {
          quantityAvailable: { lte: 10, gt: 0 },
          inStock: true,
        },
        include: defaultInclude,
        orderBy: { quantityAvailable: "asc" },
      });
    });
  });

  describe("🚫 Out of Stock - findOutOfStock()", () => {
    it("should find all out of stock products", async () => {
      // Arrange
      const mockProducts = [
        {
          ...mockProduct,
          id: "product_001",
          quantityAvailable: 0,
          inStock: false,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_002",
          quantityAvailable: 0,
          inStock: false,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.findOutOfStock();

      // Assert
      expect(result).toHaveLength(2);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: { quantityAvailable: 0, inStock: false },
        include: defaultInclude,
      });
    });

    it("should return empty array when all products in stock", async () => {
      // Arrange
      (database.product.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.findOutOfStock();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("📊 Stock Management - updateStock()", () => {
    it("should update product stock quantity", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      const newQuantity = 100;
      const updatedProduct = {
        ...mockProduct,
        quantityAvailable: newQuantity,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      // Act
      const result = await repository.updateStock(productId, newQuantity);

      // Assert
      expect(result.quantityAvailable).toBe(100);
      expect(database.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { quantityAvailable: newQuantity },
        include: defaultInclude,
      });
    });

    it("should update stock to zero", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      const updatedProduct = {
        ...mockProduct,
        quantityAvailable: 0,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      // Act
      const result = await repository.updateStock(productId, 0);

      // Assert
      expect(result.quantityAvailable).toBe(0);
    });
  });

  describe("➖ Decrement Stock - decrementStock()", () => {
    it("should decrement product stock for order", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      const decrementAmount = 5;
      const updatedProduct = {
        ...mockProduct,
        quantityAvailable: 45, // 50 - 5
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      // Act
      const result = await repository.decrementStock(
        productId,
        decrementAmount,
      );

      // Assert
      expect(result.quantityAvailable).toBe(45);
      expect(database.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { quantityAvailable: { decrement: decrementAmount } },
        include: defaultInclude,
      });
    });

    it("should handle multiple decrements", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      const updatedProduct = {
        ...mockProduct,
        quantityAvailable: 40,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      // Act
      await repository.decrementStock(productId, 5);
      const result = await repository.decrementStock(productId, 5);

      // Assert
      expect(database.product.update).toHaveBeenCalledTimes(2);
    });
  });

  describe("➕ Increment Stock - incrementStock()", () => {
    it("should increment product stock for restocking", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      const incrementAmount = 25;
      const updatedProduct = {
        ...mockProduct,
        quantityAvailable: 75, // 50 + 25
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      // Act
      const result = await repository.incrementStock(
        productId,
        incrementAmount,
      );

      // Assert
      expect(result.quantityAvailable).toBe(75);
      expect(database.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { quantityAvailable: { increment: incrementAmount } },
        include: defaultInclude,
      });
    });

    it("should handle large restock quantities", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      const updatedProduct = {
        ...mockProduct,
        quantityAvailable: 550, // 50 + 500
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      // Act
      const result = await repository.incrementStock(productId, 500);

      // Assert
      expect(result.quantityAvailable).toBe(550);
    });
  });

  describe("🔄 Update Status - updateStatus()", () => {
    it("should update product stock status to false", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      const updatedProduct = {
        ...mockProduct,
        inStock: false,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      // Act
      const result = await repository.updateStatus(productId, false);

      // Assert
      expect(result.inStock).toBe(false);
      expect(database.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { inStock: false },
        include: defaultInclude,
      });
    });

    it("should update product stock status to true", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      const updatedProduct = {
        ...mockProduct,
        inStock: true,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      // Act
      const result = await repository.updateStatus(productId, true);

      // Assert
      expect(result.inStock).toBe(true);
    });
  });

  describe("⭐ Featured Products - getFeaturedProducts()", () => {
    it("should get featured products with default limit", async () => {
      // Arrange
      const mockProducts = [
        {
          ...mockProduct,
          id: "product_001",
          featured: true,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
        {
          ...mockProduct,
          id: "product_002",
          featured: true,
          inStock: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.getFeaturedProducts();

      // Assert
      expect(result).toHaveLength(2);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: { inStock: true, featured: true },
        include: defaultInclude,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });

    it("should respect custom limit parameter", async () => {
      // Arrange
      const mockProducts = [
        {
          ...mockProduct,
          id: "product_001",
          featured: true,
          farm: mockFarm,
          _count: { orderItems: 0, reviews: 0 },
        },
      ];

      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.getFeaturedProducts(5);

      // Assert
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: { inStock: true, featured: true },
        include: defaultInclude,
        take: 5,
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("✅ Product Availability - getProductAvailability()", () => {
    it("should return IN_STOCK status for products with sufficient quantity", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      const product = {
        ...mockProduct,
        quantityAvailable: 50,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.findUnique as jest.Mock).mockResolvedValue(product);

      // Act
      const result = await repository.getProductAvailability(productId);

      // Assert
      expect(result?.availabilityStatus).toBe("IN_STOCK");
      expect(result?.remainingQuantity).toBe(50);
    });

    it("should return LOW_STOCK status for products with quantity < 10", async () => {
      // Arrange
      const productId = "product_low_stock_001";
      const product = {
        ...mockProduct,
        id: productId,
        quantityAvailable: 5,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.findUnique as jest.Mock).mockResolvedValue(product);

      // Act
      const result = await repository.getProductAvailability(productId);

      // Assert
      expect(result?.availabilityStatus).toBe("LOW_STOCK");
      expect(result?.remainingQuantity).toBe(5);
    });

    it("should return OUT_OF_STOCK status for products with zero quantity", async () => {
      // Arrange
      const productId = "product_out_of_stock_001";
      const product = {
        ...mockProduct,
        id: productId,
        quantityAvailable: 0,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.findUnique as jest.Mock).mockResolvedValue(product);

      // Act
      const result = await repository.getProductAvailability(productId);

      // Assert
      expect(result?.availabilityStatus).toBe("OUT_OF_STOCK");
      expect(result?.remainingQuantity).toBe(0);
    });

    it("should return null when product not found", async () => {
      // Arrange
      const productId = "nonexistent_product";
      (database.product.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await repository.getProductAvailability(productId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("🔄 Product Updates - update()", () => {
    it("should update product details", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      const updateData = {
        name: "Updated Tomatoes",
        price: 6.99,
        description: "Updated description",
      };
      const updatedProduct = {
        ...mockProduct,
        ...updateData,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      // Act
      const result = await repository.update(productId, updateData as any);

      // Assert
      expect(result.name).toBe("Updated Tomatoes");
      expect(result.price).toBe(6.99);
      expect(database.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateData,
        include: defaultInclude,
      });
    });

    it("should update product images", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      const newImages = [
        "https://images.farmersmarket.app/new-image-001.jpg",
        "https://images.farmersmarket.app/new-image-002.jpg",
        "https://images.farmersmarket.app/new-image-003.jpg",
      ];
      const updatedProduct = {
        ...mockProduct,
        images: newImages,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      // Act
      const result = await repository.update(productId, {
        images: newImages,
      } as any);

      // Assert
      expect(result.images).toHaveLength(3);
    });
  });

  describe("🗑️ Product Deletion - delete()", () => {
    it("should delete product by ID", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      (database.product.delete as jest.Mock).mockResolvedValue({
        id: productId,
      });

      // Act
      await repository.delete(productId);

      // Assert
      expect(database.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it("should delete product with transaction", async () => {
      // Arrange
      const mockTx = { product: { delete: jest.fn() } };
      const productId = "product_quantum_tomato_001";
      mockTx.product.delete.mockResolvedValue({ id: productId });

      // Act
      await repository.delete(productId, { tx: mockTx });

      // Assert
      expect(mockTx.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe("📊 Product Counting - count()", () => {
    it("should count all products", async () => {
      // Arrange
      (database.product.count as jest.Mock).mockResolvedValue(100);

      // Act
      const result = await repository.count();

      // Assert
      expect(result).toBe(100);
      expect(database.product.count).toHaveBeenCalledWith({ where: {} });
    });

    it("should count products with filters", async () => {
      // Arrange
      (database.product.count as jest.Mock).mockResolvedValue(25);

      // Act
      const result = await repository.count({
        category: "VEGETABLES",
        organic: true,
      });

      // Assert
      expect(result).toBe(25);
      expect(database.product.count).toHaveBeenCalledWith({
        where: { category: "VEGETABLES", organic: true },
      });
    });
  });

  describe("🌟 Divine Agricultural Consciousness", () => {
    it("should maintain agricultural awareness in all operations", async () => {
      // Arrange
      const productData: Prisma.ProductCreateInput = {
        name: "Biodynamic Herbs",
        slug: "biodynamic-herbs",
        price: 4.99,
        unit: "bunch",
        category: "HERBS",
        organic: true,
        seasonal: true,
        farm: {
          connect: { id: mockFarm.id },
        },
      };

      const expectedProduct = {
        ...mockProduct,
        ...productData,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.create as jest.Mock).mockResolvedValue(expectedProduct);

      // Act
      const result = await repository.manifestProduct(productData);

      // Assert - Product should maintain farm connection (agricultural consciousness)
      expect(result.farm).toBeDefined();
      expect(result.organic).toBe(true);
      expect(result.seasonal).toBe(true);
    });

    it("should include farm context in all product queries", async () => {
      // Arrange
      const productId = "product_quantum_tomato_001";
      const expectedProduct = {
        ...mockProduct,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      (database.product.findUnique as jest.Mock).mockResolvedValue(
        expectedProduct,
      );

      // Act
      const result = await repository.findById(productId);

      // Assert - Farm context should be included
      expect(result?.farm).toBeDefined();
      expect(result?.farm?.name).toBe("Divine Harvest Farm");
    });
  });

  describe("🔄 Transaction Support", () => {
    it("should support transaction in create operations", async () => {
      // Arrange
      const mockTx = { product: { create: jest.fn() } };
      const productData: Prisma.ProductCreateInput = {
        name: "Transaction Product",
        slug: "transaction-product",
        price: 7.99,
        unit: "each",
        category: "VEGETABLES",
        farm: {
          connect: { id: mockFarm.id },
        },
      };

      const expectedProduct = {
        ...mockProduct,
        name: "Transaction Product",
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      mockTx.product.create.mockResolvedValue(expectedProduct);

      // Act
      const result = await repository.manifestProduct(productData, {
        tx: mockTx,
      });

      // Assert
      expect(result).toEqual(expectedProduct);
      expect(mockTx.product.create).toHaveBeenCalled();
    });

    it("should support transaction in update operations", async () => {
      // Arrange
      const mockTx = { product: { update: jest.fn() } };
      const productId = "product_quantum_tomato_001";
      const updateData = {
        price: 8.99,
      };
      const updatedProduct = {
        ...mockProduct,
        price: 8.99,
        farm: mockFarm,
        _count: { orderItems: 0, reviews: 0 },
      };

      mockTx.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await repository.update(productId, updateData as any, {
        tx: mockTx,
      });

      // Assert
      expect(result.price).toBe(8.99);
      expect(mockTx.product.update).toHaveBeenCalled();
    });
  });
});
