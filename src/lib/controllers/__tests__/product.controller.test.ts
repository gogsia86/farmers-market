/**
 * 🌾 PRODUCT CONTROLLER TESTS - HTTP REQUEST HANDLER TESTING
 *
 * Comprehensive tests for ProductController with mocked service layer.
 * Tests API request handling, validation, authentication, and responses.
 *
 * Divine Patterns Applied:
 * - Mock service layer for isolation
 * - Test HTTP request/response handling
 * - Verify authentication & authorization
 * - Test validation schemas
 * - Agricultural consciousness in assertions
 *
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import { NextRequest, NextResponse } from "next/server";
import { productController } from "../product.controller";
import { ProductService } from "@/lib/services/product.service";
import { auth } from "@/lib/auth";
import { ProductCategory } from "@/types/product";

// ============================================
// MOCK SETUP
// ============================================

// Mock the ProductService with static methods
jest.mock("@/lib/services/product.service.refactored", () => ({
  ProductService: {
    listProducts: jest.fn(),
    createProduct: jest.fn(),
    getProductById: jest.fn(),
    getProductBySlug: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    searchProducts: jest.fn(),
    updateInventory: jest.fn(),
    getProductStats: jest.fn(),
    batchUpdateProducts: jest.fn(),
    getRelatedProducts: jest.fn(),
    incrementViewCount: jest.fn(),
    getProductDetailBySlug: jest.fn(),
  },
}));

// Mock NextAuth
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

// ============================================
// TEST DATA - QUANTUM PRODUCT FIXTURES
// ============================================

const mockUserId = "user_divine_farmer_123";
const mockFarmId = "farm_biodynamic_001";
const mockProductId = "product_organic_tomatoes_001";

const mockSession = {
  user: {
    id: mockUserId,
    email: "farmer@divine.farm",
    name: "Divine Farmer",
    role: "FARMER",
  },
};

const mockQuantumProduct = {
  id: mockProductId,
  slug: "organic-heirloom-tomatoes",
  name: "Organic Heirloom Tomatoes",
  description: "Biodynamic heirloom tomatoes grown with cosmic consciousness",
  farmId: mockFarmId,
  category: "VEGETABLES" as ProductCategory,
  subcategory: "Tomatoes",
  unit: "lb",
  pricing: {
    basePrice: { amount: 5.99, currency: "USD" },
    salePrice: null,
    wholesalePrice: null,
  },
  inventory: {
    quantity: 100,
    reservedQuantity: 10,
    lowStockThreshold: 20,
    isAvailable: true,
  },
  images: [
    {
      url: "https://cdn.divine.farm/tomatoes-primary.jpg",
      alt: "Fresh organic tomatoes",
      isPrimary: true,
    },
  ],
  certifications: ["USDA_ORGANIC", "BIODYNAMIC"],
  isOrganic: true,
  isActive: true,
  isFeatured: false,
  status: "ACTIVE",
  viewCount: 42,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-15T00:00:00Z"),
  farm: {
    id: mockFarmId,
    name: "Divine Acres Farm",
    slug: "divine-acres-seattle",
    city: "Seattle",
    state: "WA",
  },
};

// Helper to create mock NextRequest
function createMockRequest(
  method: string,
  url: string,
  body?: any,
  searchParams?: Record<string, string>,
): NextRequest {
  const fullUrl = new URL(url, "http://localhost:3000");

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      fullUrl.searchParams.set(key, value);
    });
  }

  return {
    method,
    url: fullUrl.toString(),
    nextUrl: fullUrl,
    json: jest.fn().mockResolvedValue(body || {}),
    headers: new Headers(),
  } as any as NextRequest;
}

// ============================================
// TEST SUITE - PRODUCT CONTROLLER
// ============================================

describe("ProductController - HTTP Request Handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue(null);
  });

  // ============================================
  // LIST PRODUCTS - GET /api/products
  // ============================================

  describe("listProducts - GET /api/products", () => {
    it("should return paginated list of products", async () => {
      const products = [mockQuantumProduct];
      const total = 1;
      const page = 1;
      const totalPages = 1;

      (ProductService.listProducts as jest.Mock).mockResolvedValue({
        products,
        total,
        page,
        totalPages,
      });

      const request = createMockRequest("GET", "/api/products");

      const response = await productController.listProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.products).toHaveLength(1);
      expect(data.data.products[0].name).toBe("Organic Heirloom Tomatoes");
      expect(data.data.total).toBe(1);
      expect(data.data.page).toBe(1);
      expect(data.data.totalPages).toBe(1);
      expect(ProductService.listProducts).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          page: 1,
          limit: 20,
        }),
      );
    });

    it("should handle query parameters for filtering", async () => {
      const products = [mockQuantumProduct];
      const total = 1;
      const page = 2;
      const totalPages = 3;

      (ProductService.listProducts as jest.Mock).mockResolvedValue({
        products,
        total,
        page,
        totalPages,
      });

      const request = createMockRequest("GET", "/api/products", undefined, {
        farmId: mockFarmId,
        category: "VEGETABLES",
        organic: "true",
        page: "2",
        limit: "10",
        sortBy: "newest",
      });

      const response = await productController.listProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(ProductService.listProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          farmId: mockFarmId,
          category: "VEGETABLES",
          isOrganic: true,
        }),
        expect.objectContaining({
          page: 2,
          limit: 10,
        }),
      );
    });

    it("should handle service errors gracefully", async () => {
      (ProductService.listProducts as jest.Mock).mockRejectedValue(
        new Error("Database connection failed"),
      );

      const request = createMockRequest("GET", "/api/products");

      const response = await productController.listProducts(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  // ============================================
  // CREATE PRODUCT - POST /api/products
  // ============================================

  describe("createProduct - POST /api/products", () => {
    const validProductData = {
      name: "Organic Carrots",
      farmId: mockFarmId,
      category: "VEGETABLES",
      unit: "lb",
      pricing: {
        basePrice: { amount: 3.99, currency: "USD" },
      },
      inventory: {
        quantity: 50,
        lowStockThreshold: 10,
      },
      description: "Fresh organic carrots",
    };

    it("should create product when authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      const product = { ...mockQuantumProduct, id: "product_new_carrots" };
      (ProductService.createProduct as jest.Mock).mockResolvedValue(product);

      const request = createMockRequest(
        "POST",
        "/api/products",
        validProductData,
      );

      const response = await productController.createProduct(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe("product_new_carrots");
      expect(ProductService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Organic Carrots",
          farmId: mockFarmId,
        }),
        mockUserId,
      );
    });

    it("should return 401 when not authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest(
        "POST",
        "/api/products",
        validProductData,
      );

      const response = await productController.createProduct(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AUTHENTICATION_REQUIRED");
    });

    it("should validate required fields", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const invalidData = {
        name: "AB", // Too short
        farmId: "", // Empty
      };

      const request = createMockRequest("POST", "/api/products", invalidData);

      const response = await productController.createProduct(request);
      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(data.success).toBe(false);
    });

    it("should validate pricing structure", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const invalidPricing = {
        ...validProductData,
        pricing: {
          basePrice: { amount: -5.99, currency: "USD" }, // Negative price
        },
      };

      const request = createMockRequest(
        "POST",
        "/api/products",
        invalidPricing,
      );

      const response = await productController.createProduct(request);
      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(data.success).toBe(false);
    });

    it("should validate inventory structure", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const invalidInventory = {
        ...validProductData,
        inventory: {
          quantity: -10, // Negative quantity
          lowStockThreshold: 5,
        },
      };

      const request = createMockRequest(
        "POST",
        "/api/products",
        invalidInventory,
      );

      const response = await productController.createProduct(request);
      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(data.success).toBe(false);
    });
  });

  // ============================================
  // GET PRODUCT BY ID - GET /api/products/:id
  // ============================================

  describe("getProductById - GET /api/products/:id", () => {
    it("should return product by ID", async () => {
      (ProductService.getProductById as jest.Mock).mockResolvedValue(
        mockQuantumProduct,
      );

      const request = createMockRequest("GET", "/api/products/123");

      const response = await productController.getProductById(request, {
        id: mockProductId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockProductId);
      expect(data.data.name).toBe("Organic Heirloom Tomatoes");
      expect(ProductService.getProductById).toHaveBeenCalledWith(
        mockProductId,
        true,
      );
    });

    it("should return 404 when product not found", async () => {
      (ProductService.getProductById as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest("GET", "/api/products/nonexistent");

      const response = await productController.getProductById(request, {
        id: "nonexistent",
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("NOT_FOUND");
    });
  });

  // ============================================
  // GET PRODUCT BY SLUG - GET /api/products/slug/:slug
  // ============================================

  describe("getProductBySlug - GET /api/products/slug/:slug", () => {
    it("should return product by slug", async () => {
      (ProductService.getProductBySlug as jest.Mock).mockResolvedValue(
        mockQuantumProduct,
      );

      const request = createMockRequest(
        "GET",
        "/api/products/slug/divine-acres-seattle/organic-heirloom-tomatoes",
      );

      const response = await productController.getProductBySlug(request, {
        farmSlug: "divine-acres-seattle",
        productSlug: "organic-heirloom-tomatoes",
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.slug).toBe("organic-heirloom-tomatoes");
      expect(ProductService.getProductBySlug).toHaveBeenCalledWith(
        "divine-acres-seattle",
        "organic-heirloom-tomatoes",
      );
    });

    it("should return 404 when slug not found", async () => {
      (ProductService.getProductBySlug as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest(
        "GET",
        "/api/products/slug/nonexistent-farm/nonexistent-product",
      );

      const response = await productController.getProductBySlug(request, {
        farmSlug: "nonexistent-farm",
        productSlug: "nonexistent-product",
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("NOT_FOUND");
    });
  });

  // ============================================
  // UPDATE PRODUCT - PUT /api/products/:id
  // ============================================

  describe("updateProduct - PUT /api/products/:id", () => {
    const updateData = {
      name: "Updated Organic Tomatoes",
      description: "Updated description with quantum consciousness",
    };

    it("should update product when authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      const updatedProduct = { ...mockQuantumProduct, ...updateData };
      (ProductService.updateProduct as jest.Mock).mockResolvedValue(
        updatedProduct,
      );

      const request = createMockRequest(
        "PUT",
        `/api/products/${mockProductId}`,
        updateData,
      );

      const response = await productController.updateProduct(request, {
        id: mockProductId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe("Updated Organic Tomatoes");
      expect(ProductService.updateProduct).toHaveBeenCalledWith(
        mockProductId,
        expect.objectContaining(updateData),
        mockUserId,
      );
    });

    it("should return 401 when not authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest(
        "PUT",
        `/api/products/${mockProductId}`,
        updateData,
      );

      const response = await productController.updateProduct(request, {
        id: mockProductId,
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AUTHENTICATION_REQUIRED");
    });

    it("should validate update data", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const invalidUpdate = {
        pricing: {
          basePrice: { amount: -99.99, currency: "USD" }, // Invalid negative price
        },
      };

      const request = createMockRequest(
        "PUT",
        `/api/products/${mockProductId}`,
        invalidUpdate,
      );

      const response = await productController.updateProduct(request, {
        id: mockProductId,
      });
      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(data.success).toBe(false);
    });
  });

  // ============================================
  // DELETE PRODUCT - DELETE /api/products/:id
  // ============================================

  describe("deleteProduct - DELETE /api/products/:id", () => {
    it("should delete product when authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (ProductService.deleteProduct as jest.Mock).mockResolvedValue(undefined);

      const request = createMockRequest(
        "DELETE",
        `/api/products/${mockProductId}`,
      );

      const response = await productController.deleteProduct(request, {
        id: mockProductId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(ProductService.deleteProduct).toHaveBeenCalledWith(
        mockProductId,
        mockUserId,
      );
    });

    it("should return 401 when not authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest(
        "DELETE",
        `/api/products/${mockProductId}`,
      );

      const response = await productController.deleteProduct(request, {
        id: mockProductId,
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AUTHENTICATION_REQUIRED");
    });
  });

  // ============================================
  // SEARCH PRODUCTS - GET /api/products/search
  // ============================================

  describe("searchProducts - GET /api/products/search", () => {
    it("should search products by query", async () => {
      const searchResults = [mockQuantumProduct];

      (ProductService.searchProducts as jest.Mock).mockResolvedValue(
        searchResults,
      );

      const request = createMockRequest(
        "GET",
        "/api/products/search",
        undefined,
        {
          query: "tomatoes",
          limit: "20",
        },
      );

      const response = await productController.searchProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.products).toBeDefined();
      expect(data.data.products).toHaveLength(1);
      expect(ProductService.searchProducts).toHaveBeenCalledWith(
        "tomatoes",
        20,
      );
    });

    it("should return 400 when query is missing", async () => {
      const request = createMockRequest("GET", "/api/products/search");

      const response = await productController.searchProducts(request);
      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(data.success).toBe(false);
    });

    it("should support limit parameter", async () => {
      const searchResults = [mockQuantumProduct];

      (ProductService.searchProducts as jest.Mock).mockResolvedValue(
        searchResults,
      );

      const request = createMockRequest(
        "GET",
        "/api/products/search",
        undefined,
        {
          query: "organic",
          limit: "10",
        },
      );

      const response = await productController.searchProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(ProductService.searchProducts).toHaveBeenCalledWith("organic", 10);
    });
  });

  // ============================================
  // UPDATE INVENTORY - PATCH /api/products/:id/inventory
  // ============================================

  describe("updateInventory - PATCH /api/products/:id/inventory", () => {
    const inventoryUpdate = {
      quantity: 75,
      reservedQuantity: 5,
      lowStockThreshold: 15,
    };

    it("should update inventory when authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      const updatedProduct = {
        ...mockQuantumProduct,
        inventory: {
          ...mockQuantumProduct.inventory,
          ...inventoryUpdate,
        },
      };
      (ProductService.updateInventory as jest.Mock).mockResolvedValue(
        updatedProduct,
      );

      const request = createMockRequest(
        "PATCH",
        `/api/products/${mockProductId}/inventory`,
        inventoryUpdate,
      );

      const response = await productController.updateInventory(request, {
        id: mockProductId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.inventory.quantity).toBe(75);
      expect(ProductService.updateInventory).toHaveBeenCalledWith(
        mockProductId,
        inventoryUpdate,
        mockUserId,
      );
    });

    it("should return 401 when not authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest(
        "PATCH",
        `/api/products/${mockProductId}/inventory`,
        inventoryUpdate,
      );

      const response = await productController.updateInventory(request, {
        id: mockProductId,
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should validate inventory values", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const invalidInventory = {
        quantity: -50, // Negative quantity
      };

      const request = createMockRequest(
        "PATCH",
        `/api/products/${mockProductId}/inventory`,
        invalidInventory,
      );

      const response = await productController.updateInventory(request, {
        id: mockProductId,
      });
      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(data.success).toBe(false);
    });
  });

  // ============================================
  // GET PRODUCT STATS - GET /api/products/:id/stats
  // ============================================

  describe("getProductStats - GET /api/products/:id/stats", () => {
    it("should return product statistics", async () => {
      const stats = {
        viewCount: 42,
        orderCount: 15,
        averageRating: 4.8,
        totalRevenue: 599.85,
        lowStockAlert: false,
      };

      (ProductService.getProductStats as jest.Mock).mockResolvedValue(stats);

      const request = createMockRequest(
        "GET",
        `/api/products/${mockProductId}/stats`,
      );

      const response = await productController.getProductStats(request, {
        id: mockProductId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.viewCount).toBe(42);
      expect(data.data.orderCount).toBe(15);
      expect(ProductService.getProductStats).toHaveBeenCalledWith(
        mockProductId,
      );
    });
  });

  // ============================================
  // BATCH UPDATE - POST /api/products/batch
  // ============================================

  describe("batchUpdateProducts - POST /api/products/batch", () => {
    const batchUpdates = {
      updates: [
        {
          id: mockProductId,
          data: {
            isActive: false,
            status: "INACTIVE",
          },
        },
        {
          id: "product_002",
          data: {
            isActive: false,
            status: "INACTIVE",
          },
        },
      ],
    };

    it("should batch update products when authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (ProductService.batchUpdateProducts as jest.Mock).mockResolvedValue(
        undefined,
      );

      const request = createMockRequest(
        "POST",
        "/api/products/batch",
        batchUpdates,
      );

      const response = await productController.batchUpdateProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(ProductService.batchUpdateProducts).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: mockProductId,
            data: expect.any(Object),
          }),
        ]),
        mockUserId,
      );
    });

    it("should return 401 when not authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest(
        "POST",
        "/api/products/batch",
        batchUpdates,
      );

      const response = await productController.batchUpdateProducts(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should validate batch update structure", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const invalidBatch = {
        updates: [
          {
            id: "", // Empty id - should fail validation
            data: {},
          },
        ],
      };

      const request = createMockRequest(
        "POST",
        "/api/products/batch",
        invalidBatch,
      );

      const response = await productController.batchUpdateProducts(request);
      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(data.success).toBe(false);
    });
  });

  // ============================================
  // GET RELATED PRODUCTS - GET /api/products/:id/related
  // ============================================

  describe("getRelatedProducts - GET /api/products/:id/related", () => {
    it("should return related products", async () => {
      const relatedProducts = [
        { ...mockQuantumProduct, id: "product_related_001" },
        { ...mockQuantumProduct, id: "product_related_002" },
      ];

      (ProductService.getRelatedProducts as jest.Mock).mockResolvedValue(
        relatedProducts,
      );

      const request = createMockRequest(
        "GET",
        `/api/products/${mockProductId}/related`,
      );

      const response = await productController.getRelatedProducts(request, {
        id: mockProductId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.products).toBeDefined();
      expect(Array.isArray(data.data.products)).toBe(true);
      expect(data.data.products).toHaveLength(2);
      expect(data.data.total).toBe(2);
      expect(ProductService.getRelatedProducts).toHaveBeenCalledWith(
        mockProductId,
        6,
      );
    });

    it("should support limit parameter", async () => {
      (ProductService.getRelatedProducts as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest(
        "GET",
        `/api/products/${mockProductId}/related`,
        undefined,
        {
          limit: "10",
        },
      );

      await productController.getRelatedProducts(request, {
        id: mockProductId,
      });

      expect(ProductService.getRelatedProducts).toHaveBeenCalledWith(
        mockProductId,
        10,
      );
    });
  });

  // ============================================
  // INCREMENT VIEW COUNT - POST /api/products/:id/view
  // ============================================

  describe("incrementViewCount - POST /api/products/:id/view", () => {
    it("should increment view count", async () => {
      const updatedProduct = {
        ...mockQuantumProduct,
        viewCount: 43,
      };

      (ProductService.incrementViewCount as jest.Mock).mockResolvedValue(
        updatedProduct,
      );

      const request = createMockRequest(
        "POST",
        `/api/products/${mockProductId}/view`,
      );

      const response = await productController.incrementViewCount(request, {
        id: mockProductId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(ProductService.incrementViewCount).toHaveBeenCalledWith(
        mockProductId,
      );
    });
  });

  // ============================================
  // GET PRODUCT DETAIL BY SLUG - GET /api/products/detail/:farmSlug/:productSlug
  // ============================================

  describe("getProductDetailBySlug - GET /api/products/detail/:farmSlug/:productSlug", () => {
    it("should return detailed product by farm and product slug", async () => {
      (ProductService.getProductDetailBySlug as jest.Mock).mockResolvedValue(
        mockQuantumProduct,
      );

      const request = createMockRequest(
        "GET",
        "/api/products/detail/divine-acres-seattle/organic-heirloom-tomatoes",
      );

      const response = await productController.getProductDetailBySlug(request, {
        farmSlug: "divine-acres-seattle",
        productSlug: "organic-heirloom-tomatoes",
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.slug).toBe("organic-heirloom-tomatoes");
      expect(ProductService.getProductDetailBySlug).toHaveBeenCalledWith(
        "divine-acres-seattle",
        "organic-heirloom-tomatoes",
      );
    });

    it("should return 404 when product not found", async () => {
      (ProductService.getProductDetailBySlug as jest.Mock).mockResolvedValue(
        null,
      );

      const request = createMockRequest(
        "GET",
        "/api/products/detail/nonexistent-farm/nonexistent-product",
      );

      const response = await productController.getProductDetailBySlug(request, {
        farmSlug: "nonexistent-farm",
        productSlug: "nonexistent-product",
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("NOT_FOUND");
    });
  });

  // ============================================
  // GET PRODUCTS BY FARM - GET /api/products/farm/:farmId
  // ============================================

  describe("getProductsByFarmId - GET /api/products/farm/:farmId", () => {
    it("should return products for specific farm", async () => {
      const products = [mockQuantumProduct];
      (ProductService.listProducts as jest.Mock).mockResolvedValue({
        products,
        total: 1,
        page: 1,
        totalPages: 1,
      });

      const request = createMockRequest(
        "GET",
        `/api/products/farm/${mockFarmId}`,
      );

      const response = await productController.getProductsByFarmId(request, {
        farmId: mockFarmId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.products).toHaveLength(1);
      expect(data.data.products[0].farmId).toBe(mockFarmId);
      expect(ProductService.listProducts).toHaveBeenCalledWith(
        { farmId: mockFarmId },
        expect.objectContaining({
          page: expect.any(Number),
          limit: expect.any(Number),
        }),
      );
    });

    it("should return empty array when farm has no products", async () => {
      (ProductService.listProducts as jest.Mock).mockResolvedValue({
        products: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });

      const request = createMockRequest(
        "GET",
        `/api/products/farm/${mockFarmId}`,
      );

      const response = await productController.getProductsByFarmId(request, {
        farmId: mockFarmId,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.products).toHaveLength(0);
    });
  });

  // ============================================
  // ERROR HANDLING & EDGE CASES
  // ============================================

  describe("Error Handling & Edge Cases", () => {
    it("should handle malformed JSON in request body", async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const request = createMockRequest("POST", "/api/products", {});
      request.json = jest
        .fn()
        .mockRejectedValue(new Error("Invalid JSON format"));

      const response = await productController.createProduct(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it("should handle service layer throwing unexpected errors", async () => {
      (ProductService.listProducts as jest.Mock).mockRejectedValue(
        new Error("Unexpected database error"),
      );

      const request = createMockRequest("GET", "/api/products");

      const response = await productController.listProducts(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it("should handle missing route parameters gracefully", async () => {
      const request = createMockRequest("GET", "/api/products/");

      const response = await productController.getProductById(request, {
        id: "",
      });
      const data = await response.json();

      expect(data.success).toBe(false);
    });
  });

  // ============================================
  // AGRICULTURAL CONSCIOUSNESS VERIFICATION
  // ============================================

  describe("Agricultural Consciousness Verification", () => {
    it("should preserve seasonal context in product listings", async () => {
      const seasonalProducts = [
        {
          ...mockQuantumProduct,
          category: "VEGETABLES" as ProductCategory,
          subcategory: "Summer Vegetables",
        },
      ];

      (ProductService.listProducts as jest.Mock).mockResolvedValue({
        products: seasonalProducts,
        total: 1,
        page: 1,
        totalPages: 1,
      });

      const request = createMockRequest("GET", "/api/products", undefined, {
        category: "VEGETABLES",
      });

      const response = await productController.listProducts(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.products[0].category).toBe("VEGETABLES");
    });

    it("should handle organic certification filtering", async () => {
      (ProductService.listProducts as jest.Mock).mockResolvedValue({
        products: [mockQuantumProduct],
        total: 1,
        page: 1,
        totalPages: 1,
      });

      const request = createMockRequest("GET", "/api/products", undefined, {
        organic: "true",
      });

      await productController.listProducts(request);

      expect(ProductService.listProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          isOrganic: true,
        }),
        expect.objectContaining({
          page: expect.any(Number),
          limit: expect.any(Number),
        }),
      );
    });
  });
});
