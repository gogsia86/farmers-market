/**
 * 🌾 PRODUCTS API ENDPOINT TESTS - ROUTE LEVEL
 * Tests route-level concerns: delegation, response handling
 * Business logic is tested in controller/service layers
 * Note: Rate limiting is handled in the controller layer, not the route
 */

import { GET, POST } from "../route";
import { NextRequest, NextResponse } from "next/server";
import { productController } from "@/lib/controllers/product.controller";
import {
  createMockNextRequest,
  createMockProduct,
} from "../../__mocks__/api-test-utils";

// Mock dependencies
jest.mock("@/lib/controllers/product.controller", () => ({
  productController: {
    listProducts: jest.fn(),
    createProduct: jest.fn(),
  },
}));

describe("🌾 Products API - GET /api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock controller to return successful response
    (productController.listProducts as jest.Mock).mockResolvedValue(
      NextResponse.json({
        success: true,
        products: [createMockProduct(), createMockProduct()],
        pagination: {
          total: 2,
          limit: 20,
          offset: 0,
          hasMore: false,
        },
      }),
    );
  });

  describe("✅ Successful Retrieval", () => {
    it("should delegate to productController.listProducts", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
      });

      await GET(request);

      expect(productController.listProducts).toHaveBeenCalledWith(request);
      expect(productController.listProducts).toHaveBeenCalledTimes(1);
    });

    it("should return successful response with products", async () => {
      const mockProducts = [
        createMockProduct({ name: "Tomatoes" }),
        createMockProduct({ name: "Lettuce" }),
      ];

      (productController.listProducts as jest.Mock).mockResolvedValue(
        NextResponse.json({
          success: true,
          products: mockProducts,
          pagination: {
            total: 2,
            limit: 20,
            offset: 0,
            hasMore: false,
          },
        }),
      );

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.products).toHaveLength(2);
      expect(data.products[0].name).toBe("Tomatoes");
    });

    it("should handle empty results from controller", async () => {
      (productController.listProducts as jest.Mock).mockResolvedValue(
        NextResponse.json({
          success: true,
          products: [],
          pagination: {
            total: 0,
            limit: 20,
            offset: 0,
            hasMore: false,
          },
        }),
      );

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.products).toEqual([]);
    });
  });

  describe("❌ Error Handling", () => {
    it("should handle controller errors gracefully", async () => {
      (productController.listProducts as jest.Mock).mockResolvedValue(
        NextResponse.json(
          {
            success: false,
            error: "Failed to fetch products",
          },
          { status: 500 },
        ),
      );

      const request = createMockNextRequest({
        url: "/api/products",
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe("🔍 Query Parameters", () => {
    it("should pass query parameters to controller via request", async () => {
      const request = createMockNextRequest({
        url: "/api/products?category=VEGETABLES&limit=10",
        method: "GET",
        searchParams: {
          category: "VEGETABLES",
          limit: "10",
        },
      });

      await GET(request);

      expect(productController.listProducts).toHaveBeenCalledWith(request);
    });
  });
});

describe("🌾 Products API - POST /api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock controller to return successful response
    (productController.createProduct as jest.Mock).mockResolvedValue(
      NextResponse.json(
        {
          success: true,
          data: createMockProduct(),
          message: "Product created successfully",
        },
        { status: 201 },
      ),
    );
  });

  describe("✅ Successful Creation", () => {
    it("should delegate to productController.createProduct", async () => {
      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Organic Tomatoes",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 4.99,
          unit: "lb",
          description: "Fresh organic tomatoes",
        },
      });

      await POST(request);

      expect(productController.createProduct).toHaveBeenCalledWith(request);
      expect(productController.createProduct).toHaveBeenCalledTimes(1);
    });

    it("should return 201 status for successful creation", async () => {
      const newProduct = createMockProduct({ name: "Fresh Lettuce" });

      (productController.createProduct as jest.Mock).mockResolvedValue(
        NextResponse.json(
          {
            success: true,
            data: newProduct,
            message: "Product created successfully",
          },
          { status: 201 },
        ),
      );

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Fresh Lettuce",
          farmId: "farm-123",
          category: "VEGETABLES",
          price: 3.49,
          unit: "lb",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe("Fresh Lettuce");
    });
  });

  describe("❌ Error Handling", () => {
    it("should handle controller errors during creation", async () => {
      (productController.createProduct as jest.Mock).mockResolvedValue(
        NextResponse.json(
          {
            success: false,
            error: "Failed to create product",
          },
          { status: 500 },
        ),
      );

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          name: "Test Product",
          farmId: "farm-123",
          category: "VEGETABLES",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it("should handle validation errors from controller", async () => {
      (productController.createProduct as jest.Mock).mockResolvedValue(
        NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: { name: "Name is required" },
          },
          { status: 400 },
        ),
      );

      const request = createMockNextRequest({
        url: "/api/products",
        method: "POST",
        body: {
          farmId: "farm-123",
          category: "VEGETABLES",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Validation failed");
    });
  });

  // Note: Authentication is handled in the controller layer, not the route
  // Auth-related tests should be in controller tests
});
