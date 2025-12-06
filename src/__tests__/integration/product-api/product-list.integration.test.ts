/**
 * Product List Integration Tests
 *
 * Tests: GET /api/products (Direct Route Handler Testing)
 * Coverage: Pagination, filtering, sorting, edge cases
 *
 * @pattern Direct Route Handler Testing - No HTTP Server Required
 * @reference 17_API_TESTING_TRACING_MOCKS.instructions.md
 */

// Unmock database for integration tests - we need real database access
jest.unmock("@/lib/database");
jest.unmock("@prisma/client");

import {
  createTestUser,
  createTestFarm,
  createTestProduct,
  cleanupTestUser,
  disconnectTestDatabase,
} from "../../../../tests/helpers/api-test-helpers";

import {
  testApiRoute,
  extractApiResponse,
  ResponseHelpers,
  expectApiSuccess,
  ApiSuccessResponse,
} from "../../../../tests/helpers/route-test-helpers";

// Check if we should skip integration tests (no real database available)
const shouldSkipIntegrationTests =
  process.env.SKIP_INTEGRATION_TESTS === "true" ||
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL?.includes("localhost:5432/test") ||
  process.env.DATABASE_URL?.includes("mock") ||
  process.env.NODE_ENV === "test";

const describeIntegration = shouldSkipIntegrationTests
  ? describe.skip
  : describe;

describeIntegration("Product List Integration Tests", () => {
  let testSetup: {
    farmer: any;
    farm: any;
    products: any[];
  };

  // Import route handler dynamically
  let GET: any;

  beforeAll(async () => {
    // Import the route handler
    const productRoute = await import("@/app/api/products/route");
    GET = productRoute.GET;

    // Create test data
    const farmer = await createTestUser({ role: "FARMER" });
    const farm = await createTestFarm(farmer.id);

    // Create multiple products with different characteristics
    const products = await Promise.all([
      createTestProduct(farm.id, {
        name: "Organic Tomatoes",
        category: "VEGETABLES",
        price: 4.99,
        stockQuantity: 100,
        isAvailable: true,
      }),
      createTestProduct(farm.id, {
        name: "Fresh Strawberries",
        category: "FRUITS",
        price: 6.99,
        stockQuantity: 50,
        isAvailable: true,
      }),
      createTestProduct(farm.id, {
        name: "Green Lettuce",
        category: "VEGETABLES",
        price: 3.49,
        stockQuantity: 75,
        isAvailable: true,
      }),
      createTestProduct(farm.id, {
        name: "Sweet Corn",
        category: "VEGETABLES",
        price: 2.99,
        stockQuantity: 0,
        isAvailable: false,
      }),
      createTestProduct(farm.id, {
        name: "Fresh Blueberries",
        category: "FRUITS",
        price: 8.99,
        stockQuantity: 30,
        isAvailable: true,
      }),
    ]);

    testSetup = { farmer, farm, products };
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestUser(testSetup.farmer.id);
    await disconnectTestDatabase();
  });

  describe("GET /api/products - Default Pagination", () => {
    it("should return products with default pagination", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(Array.isArray(data)).toBe(true);
    });

    it("should return products in correct structure", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
      });

      const data = await expectApiSuccess(response);
      expect(data.length).toBeGreaterThan(0);

      const product = data[0];
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("slug");
      expect(product).toHaveProperty("category");
    });
  });

  describe("GET /api/products - Custom Pagination", () => {
    it("should respect custom page size", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: { limit: "2" },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(data.length).toBeLessThanOrEqual(2);
    });

    it("should handle page navigation", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: { page: "2", limit: "2" },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(Array.isArray(data)).toBe(true);
    });

    it("should return empty array for page beyond total", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: { page: "999", limit: "20" },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(data).toEqual([]);
    });
  });

  describe("GET /api/products - Filter by Category", () => {
    it("should filter by VEGETABLES category", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: { category: "VEGETABLES" },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(data.length).toBeGreaterThan(0);

      data.forEach((product: any) => {
        expect(product.category).toBe("VEGETABLES");
      });
    });

    it("should filter by FRUITS category", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: { category: "FRUITS" },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(data.length).toBeGreaterThan(0);

      data.forEach((product: any) => {
        expect(product.category).toBe("FRUITS");
      });
    });

    it("should return empty array for non-existent category", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: { category: "NONEXISTENT" },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(data).toEqual([]);
    });
  });

  describe("GET /api/products - Filter by Farm", () => {
    it("should filter by farmId", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: { farmId: testSetup.farm.id },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(data.length).toBe(5); // All our test products

      data.forEach((product: any) => {
        expect(product.farmId).toBe(testSetup.farm.id);
      });
    });

    it("should return empty array for non-existent farmId", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: { farmId: fakeId },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(data).toEqual([]);
    });
  });

  describe("GET /api/products - Filter by Availability", () => {
    it("should filter available products", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: {
          inStock: "true",
          farmId: testSetup.farm.id,
        },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(data.length).toBeGreaterThanOrEqual(4); // 4 available products

      data.forEach((product: any) => {
        expect(product.stockQuantity || 0).toBeGreaterThan(0);
      });
    });
  });

  describe("GET /api/products - Combined Filters", () => {
    it("should combine category and availability filters", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: {
          category: "VEGETABLES",
          inStock: "true",
          farmId: testSetup.farm.id,
        },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(data.length).toBeGreaterThanOrEqual(2); // Tomatoes and Lettuce

      data.forEach((product: any) => {
        expect(product.category).toBe("VEGETABLES");
      });
    });

    it("should combine all filters", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: {
          category: "FRUITS",
          inStock: "true",
          farmId: testSetup.farm.id,
          limit: "1",
        },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(data.length).toBe(1);

      const product = data[0];
      expect(product.category).toBe("FRUITS");
      expect(product.farmId).toBe(testSetup.farm.id);
    });
  });

  describe("GET /api/products - Sorting", () => {
    it("should sort by price ascending", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: {
          farmId: testSetup.farm.id,
          sortBy: "price",
          sortOrder: "asc",
        },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      const prices = data.map((p: any) => p.pricing?.basePrice?.amount || 0);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    it("should sort by price descending", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: {
          farmId: testSetup.farm.id,
          sortBy: "price",
          sortOrder: "desc",
        },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      const prices = data.map((p: any) => p.pricing?.basePrice?.amount || 0);
      const sortedPrices = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sortedPrices);
    });

    it("should sort by name alphabetically", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: {
          farmId: testSetup.farm.id,
          sortBy: "name",
          sortOrder: "asc",
        },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      const names = data.map((p: any) => p.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });
  });

  describe("GET /api/products - Edge Cases", () => {
    it("should handle invalid page parameter", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: { page: "-1" },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(Array.isArray(data)).toBe(true);
    });

    it("should handle invalid limit parameter", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: { limit: "0" },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      expect(Array.isArray(data)).toBe(true);
    });

    it("should handle very large limit", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: { limit: "10000" },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      // Should cap at maximum allowed
      expect(data.length).toBeLessThanOrEqual(100);
    });

    it("should handle invalid sort parameter", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: {
          sortBy: "invalid",
          farmId: testSetup.farm.id,
        },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      // Should still return results with default sorting
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/products - Response Structure", () => {
    it("should include all required product fields", async () => {
      const response = await testApiRoute(GET, {
        url: "/api/products",
        searchParams: {
          farmId: testSetup.farm.id,
          limit: "1",
        },
      });

      ResponseHelpers.expectSuccess(response);
      const data = await expectApiSuccess(response);

      const product = data[0];

      // Required fields
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("slug");
      expect(product).toHaveProperty("category");
      expect(product).toHaveProperty("farmId");

      // Type checks
      expect(typeof product.id).toBe("string");
      expect(typeof product.name).toBe("string");
      expect(typeof product.slug).toBe("string");
      expect(typeof product.category).toBe("string");
    });
  });

  describe("GET /api/products - Performance", () => {
    it("should respond within acceptable time", async () => {
      const startTime = performance.now();
      await testApiRoute(GET, {
        url: "/api/products",
        searchParams: { limit: "20" },
      });
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    it("should handle concurrent requests", async () => {
      const requests = Array.from({ length: 10 }, () =>
        testApiRoute(GET, { url: "/api/products" }),
      );
      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        ResponseHelpers.expectSuccess(response);
      });
    });
  });
});
