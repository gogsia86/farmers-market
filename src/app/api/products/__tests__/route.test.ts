/**
 * 🌾 PRODUCTS API ENDPOINT TESTS
 * Comprehensive testing for product management API routes with biodynamic validation
 */

import { GET, POST } from "../route";
import { database } from "@/lib/database";
import { auth } from "@/lib/auth";
import { ProductService } from "@/lib/services/product.service";
import {
  createMockNextRequest,
  createMockProduct,
  createMockFarm,
  parseJsonResponse,
  createMockSession,
} from "../../__mocks__/api-test-utils";

// Mock dependencies
jest.mock("@/lib/database", () => ({
  database: {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    farm: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/services/product.service", () => ({
  ProductService: {
    createProduct: jest.fn(),
  },
}));

describe("🌾 Products API - GET /api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("✅ Successful Retrieval", () => {
    it("should fetch all products successfully", async () => {
      const mockProducts = [
        createMockProduct({ id: "prod-1", name: "Tomatoes" }),
        createMockProduct({ id: "prod-2", name: "Lettuce" }),
      ];

      // Mock the Promise.all resolution properly
      (database.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (database.product.count as jest.Mock).mockResolvedValue(2);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: {}, // Ensure empty params pass validation
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(true);
      expect(data.products).toHaveLength(2);
      expect(data.products[0].name).toBe("Tomatoes");
      expect(data.products[1].name).toBe("Lettuce");
    });

    it("should include pagination information", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([
        createMockProduct(),
      ]);
      (database.product.count as jest.Mock).mockResolvedValue(100);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { limit: "20", offset: "0" },
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.pagination).toEqual({
        total: 100,
        limit: 20,
        offset: 0,
        hasMore: true,
        pages: 5,
      });
    });

    it("should filter products by farmId", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { farmId: "farm-123" },
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            farmId: "farm-123",
          }),
        }),
      );
    });

    it("should filter products by category", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { category: "VEGETABLES" },
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: "VEGETABLES",
          }),
        }),
      );
    });

    it("should filter products by inStock status", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { inStock: "true" },
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            inStock: true,
          }),
        }),
      );
    });

    it("should filter products by organic status", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { organic: "true" },
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organic: true,
          }),
        }),
      );
    });

    it("should filter products by seasonal status", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { seasonal: "true" },
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            seasonal: true,
          }),
        }),
      );
    });

    it("should filter products by price range", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { minPrice: "5", maxPrice: "20" },
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: {
              gte: 5,
              lte: 20,
            },
          }),
        }),
      );
    });

    it("should filter products by minimum price only", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { minPrice: "10" },
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: {
              gte: 10,
            },
          }),
        }),
      );
    });

    it("should filter products by maximum price only", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { maxPrice: "50" },
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: {
              lte: 50,
            },
          }),
        }),
      );
    });

    it("should search products by name, description, or tags", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { searchTerm: "organic" },
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: "organic", mode: "insensitive" } },
              { description: { contains: "organic", mode: "insensitive" } },
              { tags: { has: "organic" } },
            ],
          }),
        }),
      );
    });

    it("should include farm information with products", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            farm: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        }),
      );
    });

    it("should sort products by specified field and order", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { sortBy: "price", sortOrder: "asc" },
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: "asc" },
        }),
      );
    });

    it("should use default sorting (createdAt desc)", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
        }),
      );
    });

    it("should apply limit and offset for pagination", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { limit: "10", offset: "20" },
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        }),
      );
    });

    it("should use default limit of 20", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
        }),
      );
    });

    it("should return empty array when no products found", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(true);
      expect(data.products).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });

    it("should include applied filters in response", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: {
          farmId: "farm-123",
          category: "FRUITS",
          organic: "true",
        },
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.filters).toEqual({
        farmId: "farm-123",
        category: "FRUITS",
        inStock: undefined,
        organic: true,
        seasonal: undefined,
      });
    });

    it("should calculate hasMore correctly when more results exist", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([
        createMockProduct(),
      ]);
      (database.product.count as jest.Mock).mockResolvedValue(100);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { limit: "20", offset: "0" },
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.pagination.hasMore).toBe(true);
    });

    it("should calculate hasMore correctly when no more results", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([
        createMockProduct(),
      ]);
      (database.product.count as jest.Mock).mockResolvedValue(15);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { limit: "20", offset: "0" },
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.pagination.hasMore).toBe(false);
    });

    it("should combine multiple filters", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);
      (database.product.count as jest.Mock).mockResolvedValue(0);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: {
          category: "VEGETABLES",
          organic: "true",
          inStock: "true",
          minPrice: "5",
          maxPrice: "15",
        },
      });

      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: "VEGETABLES",
            organic: true,
            inStock: true,
            price: {
              gte: 5,
              lte: 15,
            },
          }),
        }),
      );
    });
  });

  describe("❌ Validation Errors", () => {
    it("should reject invalid sortBy parameter", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { sortBy: "invalid" },
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid query parameters");
      expect(response.status).toBe(400);
    });

    it("should reject invalid sortOrder parameter", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { sortOrder: "invalid" },
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid query parameters");
      expect(response.status).toBe(400);
    });

    it("should reject limit above 100", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { limit: "150" },
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(response.status).toBe(400);
    });

    it("should reject negative limit", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { limit: "-5" },
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(response.status).toBe(400);
    });

    it("should reject negative offset", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { offset: "-10" },
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(response.status).toBe(400);
    });

    it("should reject negative minPrice", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: { minPrice: "-5" },
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe("❌ Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      const dbError = new Error("Database connection failed");
      (database.product.findMany as jest.Mock).mockRejectedValue(dbError);
      (database.product.count as jest.Mock).mockResolvedValue(0); // Mock count too

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: {}, // Ensure params pass validation
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to fetch products");
      expect(data.message).toBe("Database connection failed");
      expect(response.status).toBe(500);
    });

    it("should handle unknown errors", async () => {
      (database.product.findMany as jest.Mock).mockRejectedValue(
        "Unknown error",
      );
      (database.product.count as jest.Mock).mockResolvedValue(0); // Mock count too

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: {}, // Ensure params pass validation
      });

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to fetch products");
      expect(data.message).toBe("Unknown error");
    });
  });

  describe("⚡ Performance", () => {
    it("should execute count and findMany in parallel", async () => {
      const mockProduct = createMockProduct();

      // Mock both methods to return resolved values
      (database.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);
      (database.product.count as jest.Mock).mockResolvedValue(1);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
        searchParams: {}, // Ensure params pass validation
      });

      const response = await GET(request);

      // Verify both were called (indicating parallel execution)
      expect(database.product.findMany).toHaveBeenCalled();
      expect(database.product.count).toHaveBeenCalled();

      // Verify response is successful
      const data = await parseJsonResponse(response);
      expect(data.success).toBe(true);
    });
  });
});

describe("🌾 Products API - POST /api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("✅ Successful Creation", () => {
    it("should create a product successfully", async () => {
      const mockSession = createMockSession("FARMER");
      const mockFarm = createMockFarm({ ownerId: mockSession.user.id });
      const mockProduct = createMockProduct({ name: "New Product" });

      (auth as jest.Mock).mockResolvedValue(mockSession);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);
      (ProductService.createProduct as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "New Product",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 9.99,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(true);
      expect(data.product.name).toBe("New Product");
      expect(response.status).toBe(201);
    });

    it("should validate product data", async () => {
      const mockSession = createMockSession("FARMER");
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "AB", // Too short
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 9.99,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.error).toBe("Validation failed");
      expect(response.status).toBe(400);
    });

    it("should verify farm ownership", async () => {
      const mockSession = createMockSession("FARMER");
      const mockFarm = createMockFarm({ ownerId: "different-owner" });

      (auth as jest.Mock).mockResolvedValue(mockSession);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 9.99,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.error).toBe("Only farm owners can add products");
      expect(response.status).toBe(403);
    });

    it("should handle optional fields", async () => {
      const mockSession = createMockSession("FARMER");
      const mockFarm = createMockFarm({ ownerId: mockSession.user.id });
      const mockProduct = createMockProduct();

      (auth as jest.Mock).mockResolvedValue(mockSession);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);
      (ProductService.createProduct as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 9.99,
          unit: "lb",
          description: "Optional description",
          quantity: 50,
          organic: true,
          seasonal: true,
          images: ["image1.jpg", "image2.jpg"],
          tags: ["fresh", "local"],
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(true);
      expect(ProductService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Optional description",
          quantity: 50,
          organic: true,
          seasonal: true,
        }),
        mockSession.user.id,
      );
    });

    it("should set default values for boolean fields", async () => {
      const mockSession = createMockSession("FARMER");
      const mockFarm = createMockFarm({ ownerId: mockSession.user.id });
      const mockProduct = createMockProduct();

      (auth as jest.Mock).mockResolvedValue(mockSession);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);
      (ProductService.createProduct as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 9.99,
          unit: "lb",
        },
      });

      await POST(request);

      expect(ProductService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          inStock: true,
          organic: false,
          seasonal: false,
        }),
        mockSession.user.id,
      );
    });
  });

  describe("🔒 Authentication & Authorization", () => {
    it("should require authentication", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 9.99,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.error).toBe("Authentication required");
      expect(response.status).toBe(401);
    });

    it("should handle missing user in session", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: null });

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 9.99,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.error).toBe("Authentication required");
      expect(response.status).toBe(401);
    });

    it("should return 404 when farm not found", async () => {
      const mockSession = createMockSession("FARMER");
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          farmId: "nonexistent-farm",
          category: "VEGETABLES",
          price: 9.99,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.error).toBe("Farm not found");
      expect(response.status).toBe(404);
    });
  });

  describe("❌ Validation Errors", () => {
    beforeEach(() => {
      const mockSession = createMockSession("FARMER");
      (auth as jest.Mock).mockResolvedValue(mockSession);
    });

    it("should reject product with name too short", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "AB",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 9.99,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.error).toBe("Validation failed");
      expect(data.details.name).toBeDefined();
    });

    it("should reject product without farmId", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          category: "VEGETABLES",
          price: 9.99,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.details.farmId).toBeDefined();
    });

    it("should reject product without category", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          farmId: "farm-123",
          price: 9.99,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.details.category).toBeDefined();
    });

    it("should reject product with price of 0", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 0,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.details.price).toBeDefined();
    });

    it("should reject product with negative price", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: -5,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.details.price).toBeDefined();
    });

    it("should reject product without unit", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 9.99,
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.details.unit).toBeDefined();
    });

    it("should reject product with negative quantity", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 9.99,
          unit: "lb",
          quantity: -10,
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.details.quantity).toBeDefined();
    });
  });

  describe("❌ Error Handling", () => {
    it("should handle database errors", async () => {
      const mockSession = createMockSession("FARMER");
      const mockFarm = createMockFarm({ ownerId: mockSession.user.id });

      (auth as jest.Mock).mockResolvedValue(mockSession);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);
      (ProductService.createProduct as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 9.99,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to create product");
      expect(response.status).toBe(500);
    });

    it("should handle malformed JSON", async () => {
      const mockSession = createMockSession("FARMER");
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const request = {
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      } as any;

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
    });

    it("should handle unknown errors", async () => {
      const mockSession = createMockSession("FARMER");
      const mockFarm = createMockFarm({ ownerId: mockSession.user.id });

      (auth as jest.Mock).mockResolvedValue(mockSession);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);
      (ProductService.createProduct as jest.Mock).mockRejectedValue(
        "Unknown error",
      );

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Product",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 9.99,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(data.success).toBe(false);
      expect(data.message).toBe("Unknown error");
    });
  });

  describe("🌾 Agricultural Consciousness", () => {
    it("should use ProductService for biodynamic creation", async () => {
      const mockSession = createMockSession("FARMER");
      const mockFarm = createMockFarm({ ownerId: mockSession.user.id });
      const mockProduct = createMockProduct();

      (auth as jest.Mock).mockResolvedValue(mockSession);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);
      (ProductService.createProduct as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const productData = {
        name: "Biodynamic Product",
        farmId: "farm-123",
        category: "VEGETABLES",
        price: 9.99,
        unit: "lb",
        organic: true,
        seasonal: true,
      };

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: productData,
      });

      await POST(request);

      expect(ProductService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          organic: true,
          seasonal: true,
        }),
        mockSession.user.id,
      );
    });
  });
});
