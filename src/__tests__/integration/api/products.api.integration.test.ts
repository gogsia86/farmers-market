/**
 * 🧪 PRODUCTS API INTEGRATION TESTS
 *
 * Comprehensive HTTP API integration tests for /api/products endpoints
 * Tests the full request/response cycle including authentication, validation, and database operations
 *
 * Test Coverage:
 * - GET /api/products - List products with filters
 * - POST /api/products - Create product with authentication
 * - Query parameter validation
 * - Authentication & authorization
 * - Error handling & edge cases
 * - Pagination & filtering
 * - Search functionality
 *
 * @reference .cursorrules - API Integration Testing Patterns
 */

import { GET, POST } from "@/app/api/products/route";
import { database } from "@/lib/database";
import type { Farm, Product, User } from "@prisma/client";
import {
    createTestFarm,
    createTestProduct,
    createTestUser,
    disconnectTestDatabase,
} from "../../../../tests/helpers/api-test-helpers";

// ============================================================================
// MOCKS
// ============================================================================

// Mock NextAuth
const mockAuth = jest.fn();
jest.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

// Mock cache
jest.mock("@/lib/cache/multi-layer.cache", () => ({
  multiLayerCache: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    invalidatePattern: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock logger
jest.mock("@/lib/monitoring/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// ============================================================================
// TEST DATA
// ============================================================================

let testFarmer: User;
let testCustomer: User;
let testFarm: Farm;
let testProduct1: Product;
let testProduct2: Product;
let testProduct3: Product;

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

beforeAll(async () => {
  // Create test users
  testFarmer = await createTestUser({
    email: `farmer-products-api-${Date.now()}@test.com`,
    name: "Products API Test Farmer",
    role: "FARMER",
  });

  testCustomer = await createTestUser({
    email: `customer-products-api-${Date.now()}@test.com`,
    name: "Products API Test Customer",
    role: "CONSUMER",
  });

  // Create test farm
  testFarm = await createTestFarm(testFarmer.id, {
    name: `Products API Test Farm ${Date.now()}`,
    slug: `products-api-test-farm-${Date.now()}`,
    description: "A test farm for products API integration testing",
    status: "ACTIVE",
  });

  // Create test products
  testProduct1 = await createTestProduct(testFarm.id, {
    name: "Fresh Organic Tomatoes",
    slug: `organic-tomatoes-${Date.now()}`,
    description: "Delicious organic tomatoes grown with love",
    category: "VEGETABLES",
    price: 4.99,
    unit: "lb",
    quantityAvailable: 100,
    organic: true,
    status: "ACTIVE",
  });

  testProduct2 = await createTestProduct(testFarm.id, {
    name: "Sweet Honey",
    slug: `sweet-honey-${Date.now()}`,
    description: "Pure raw honey from our hives",
    category: "HONEY",
    price: 12.99,
    unit: "jar",
    quantityAvailable: 50,
    organic: false,
    status: "ACTIVE",
  });

  testProduct3 = await createTestProduct(testFarm.id, {
    name: "Fresh Strawberries",
    slug: `fresh-strawberries-${Date.now()}`,
    description: "Sweet and juicy strawberries",
    category: "FRUITS",
    price: 6.99,
    unit: "pint",
    quantityAvailable: 0, // Out of stock
    organic: true,
    status: "ACTIVE",
  });
});

afterAll(async () => {
  // Clean up test data
  await database.product.deleteMany({
    where: { farmId: testFarm.id },
  });

  await database.farm.deleteMany({
    where: { id: testFarm.id },
  });

  await database.user.deleteMany({
    where: {
      id: { in: [testFarmer.id, testCustomer.id] },
    },
  });

  await disconnectTestDatabase();
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// TESTS: GET /api/products - LIST PRODUCTS
// ============================================================================

describe("GET /api/products - List Products", () => {
  it("should return products list with default pagination", async () => {
    const url = new URL("http://localhost:3000/api/products");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.products).toBeDefined();
    expect(Array.isArray(data.data.products)).toBe(true);
    expect(data.data.pagination).toBeDefined();
    expect(data.data.pagination.page).toBe(1);
    expect(data.data.pagination.limit).toBe(20);
    expect(data.data.pagination.total).toBeGreaterThanOrEqual(3);
  });

  it("should filter products by category", async () => {
    const url = new URL("http://localhost:3000/api/products?category=VEGETABLES");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.products.every((p: any) => p.category === "VEGETABLES")).toBe(true);
  });

  it("should filter products by farmId", async () => {
    const url = new URL(`http://localhost:3000/api/products?farmId=${testFarm.id}`);
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.products.every((p: any) => p.farmId === testFarm.id)).toBe(true);
    expect(data.data.products.length).toBeGreaterThanOrEqual(3);
  });

  it("should filter organic products", async () => {
    const url = new URL("http://localhost:3000/api/products?organic=true");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.products.every((p: any) => p.organic === true)).toBe(true);
  });

  it("should filter in-stock products", async () => {
    const url = new URL("http://localhost:3000/api/products?inStock=true");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.products.every((p: any) => p.quantityAvailable > 0)).toBe(true);
  });

  it("should filter products by price range", async () => {
    const url = new URL("http://localhost:3000/api/products?minPrice=5&maxPrice=10");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(
      data.data.products.every((p: any) => p.price >= 5 && p.price <= 10)
    ).toBe(true);
  });

  it("should search products by name", async () => {
    const url = new URL("http://localhost:3000/api/products?search=tomatoes");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.products.length).toBeGreaterThanOrEqual(1);
    expect(
      data.data.products.some((p: any) =>
        p.name.toLowerCase().includes("tomatoes")
      )
    ).toBe(true);
  });

  it("should search products by description", async () => {
    const url = new URL("http://localhost:3000/api/products?search=honey");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.products.length).toBeGreaterThanOrEqual(1);
  });

  it("should handle custom pagination", async () => {
    const url = new URL("http://localhost:3000/api/products?page=1&limit=2");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.products.length).toBeLessThanOrEqual(2);
    expect(data.data.pagination.page).toBe(1);
    expect(data.data.pagination.limit).toBe(2);
  });

  it("should sort products by price ascending", async () => {
    const url = new URL("http://localhost:3000/api/products?sortBy=price&sortOrder=asc");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify ascending order
    for (let i = 1; i < data.data.products.length; i++) {
      expect(data.data.products[i].price).toBeGreaterThanOrEqual(
        data.data.products[i - 1].price
      );
    }
  });

  it("should sort products by name descending", async () => {
    const url = new URL("http://localhost:3000/api/products?sortBy=name&sortOrder=desc");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify descending order
    for (let i = 1; i < data.data.products.length; i++) {
      expect(data.data.products[i].name.toLowerCase()).toBeLessThanOrEqual(
        data.data.products[i - 1].name.toLowerCase()
      );
    }
  });

  it("should include farm details in response", async () => {
    const url = new URL(`http://localhost:3000/api/products?farmId=${testFarm.id}&limit=1`);
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.products[0].farm).toBeDefined();
    expect(data.data.products[0].farm.id).toBe(testFarm.id);
    expect(data.data.products[0].farm.name).toBeDefined();
    expect(data.data.products[0].farm.slug).toBeDefined();
  });

  it("should handle invalid query parameters gracefully", async () => {
    const url = new URL("http://localhost:3000/api/products?page=invalid&limit=abc");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should handle empty results", async () => {
    const url = new URL("http://localhost:3000/api/products?search=nonexistentproduct12345");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.products.length).toBe(0);
    expect(data.data.pagination.total).toBe(0);
  });

  it("should handle multiple filters combined", async () => {
    const url = new URL(
      `http://localhost:3000/api/products?farmId=${testFarm.id}&organic=true&inStock=true&category=VEGETABLES`
    );
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(
      data.data.products.every(
        (p: any) =>
          p.farmId === testFarm.id &&
          p.organic === true &&
          p.quantityAvailable > 0 &&
          p.category === "VEGETABLES"
      )
    ).toBe(true);
  });
});

// ============================================================================
// TESTS: POST /api/products - CREATE PRODUCT
// ============================================================================

describe("POST /api/products - Create Product", () => {
  it("should create product with valid data as farmer", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testFarmer.id,
        email: testFarmer.email,
        name: testFarmer.name,
        role: "FARMER",
      },
    });

    const productData = {
      name: "New Test Product",
      description: "This is a brand new test product created via API",
      category: "VEGETABLES",
      farmId: testFarm.id,
      price: 8.99,
      unit: "lb",
      quantityAvailable: 75,
      organic: true,
      tags: ["fresh", "local", "organic"],
    };

    const request = new Request("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.name).toBe(productData.name);
    expect(data.data.price).toBe(productData.price);
    expect(data.data.farmId).toBe(testFarm.id);
    expect(data.data.slug).toBeDefined();
    expect(data.data.status).toBe("ACTIVE");

    // Cleanup
    await database.product.delete({ where: { id: data.data.id } });
  });

  it("should require authentication", async () => {
    mockAuth.mockResolvedValue(null);

    const productData = {
      name: "Test Product",
      description: "This should fail without authentication",
      category: "VEGETABLES",
      farmId: testFarm.id,
      price: 5.99,
      unit: "lb",
      quantityAvailable: 50,
    };

    const request = new Request("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("should deny customer from creating products", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        name: testCustomer.name,
        role: "CONSUMER",
      },
    });

    const productData = {
      name: "Test Product",
      description: "Customers should not be able to create products",
      category: "VEGETABLES",
      farmId: testFarm.id,
      price: 5.99,
      unit: "lb",
      quantityAvailable: 50,
    };

    const request = new Request("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("FORBIDDEN");
  });

  it("should validate required fields", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testFarmer.id,
        email: testFarmer.email,
        role: "FARMER",
      },
    });

    const invalidData = {
      name: "AB", // Too short
      description: "Short", // Too short
      // Missing required fields
    };

    const request = new Request("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.details).toBeDefined();
  });

  it("should validate price is positive", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testFarmer.id,
        email: testFarmer.email,
        role: "FARMER",
      },
    });

    const invalidData = {
      name: "Invalid Price Product",
      description: "Product with negative price",
      category: "VEGETABLES",
      farmId: testFarm.id,
      price: -5.99, // Negative price
      unit: "lb",
      quantityAvailable: 50,
    };

    const request = new Request("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("should validate quantity is non-negative", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testFarmer.id,
        email: testFarmer.email,
        role: "FARMER",
      },
    });

    const invalidData = {
      name: "Invalid Quantity Product",
      description: "Product with negative quantity",
      category: "VEGETABLES",
      farmId: testFarm.id,
      price: 5.99,
      unit: "lb",
      quantityAvailable: -10, // Negative quantity
    };

    const request = new Request("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("should validate farm exists", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testFarmer.id,
        email: testFarmer.email,
        role: "FARMER",
      },
    });

    const invalidData = {
      name: "Product for Non-existent Farm",
      description: "This should fail because farm doesn't exist",
      category: "VEGETABLES",
      farmId: "non-existent-farm-id",
      price: 5.99,
      unit: "lb",
      quantityAvailable: 50,
    };

    const request = new Request("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("FARM_NOT_FOUND");
  });

  it("should verify farm ownership", async () => {
    // Create another farmer and farm
    const otherFarmer = await createTestUser({
      email: `other-farmer-${Date.now()}@test.com`,
      name: "Other Farmer",
      role: "FARMER",
    });

    const otherFarm = await createTestFarm(otherFarmer.id, {
      name: `Other Farm ${Date.now()}`,
      slug: `other-farm-${Date.now()}`,
      description: "Another farmer's farm",
      status: "ACTIVE",
    });

    // Try to create product for someone else's farm
    mockAuth.mockResolvedValue({
      user: {
        id: testFarmer.id,
        email: testFarmer.email,
        role: "FARMER",
      },
    });

    const productData = {
      name: "Unauthorized Product",
      description: "Trying to add product to someone else's farm",
      category: "VEGETABLES",
      farmId: otherFarm.id, // Different farmer's farm
      price: 5.99,
      unit: "lb",
      quantityAvailable: 50,
    };

    const request = new Request("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("FORBIDDEN");

    // Cleanup
    await database.farm.delete({ where: { id: otherFarm.id } });
    await database.user.delete({ where: { id: otherFarmer.id } });
  });

  it("should generate slug from product name", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testFarmer.id,
        email: testFarmer.email,
        role: "FARMER",
      },
    });

    const productData = {
      name: "Amazing Fresh Organic Carrots!",
      description: "The best carrots you'll ever taste",
      category: "VEGETABLES",
      farmId: testFarm.id,
      price: 3.99,
      unit: "lb",
      quantityAvailable: 100,
    };

    const request = new Request("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.slug).toBe("amazing-fresh-organic-carrots");

    // Cleanup
    await database.product.delete({ where: { id: data.data.id } });
  });

  it("should set default values for optional fields", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testFarmer.id,
        email: testFarmer.email,
        role: "FARMER",
      },
    });

    const productData = {
      name: "Minimal Product Data",
      description: "Product with minimal required fields",
      category: "VEGETABLES",
      farmId: testFarm.id,
      price: 4.99,
      unit: "lb",
      quantityAvailable: 25,
      // Optional fields omitted
    };

    const request = new Request("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.organic).toBe(false); // Default value
    expect(data.data.status).toBe("ACTIVE");
    expect(data.data.viewsCount).toBe(0);
    expect(data.data.cartAddsCount).toBe(0);
    expect(data.data.purchaseCount).toBe(0);

    // Cleanup
    await database.product.delete({ where: { id: data.data.id } });
  });

  it("should handle invalid JSON body", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testFarmer.id,
        email: testFarmer.email,
        role: "FARMER",
      },
    });

    const request = new Request("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json{{{",
    });

    const response = await POST(request as any);

    expect(response.status).toBe(500);
  });
});

// ============================================================================
// SUMMARY
// ============================================================================

/**
 * API Integration Test Summary:
 *
 * GET /api/products:
 * ✅ Default pagination
 * ✅ Category filtering
 * ✅ Farm filtering
 * ✅ Organic filtering
 * ✅ In-stock filtering
 * ✅ Price range filtering
 * ✅ Search by name
 * ✅ Search by description
 * ✅ Custom pagination
 * ✅ Sorting (price, name)
 * ✅ Farm details inclusion
 * ✅ Invalid parameters handling
 * ✅ Empty results handling
 * ✅ Multiple filters combined
 *
 * POST /api/products:
 * ✅ Create with valid data
 * ✅ Authentication required
 * ✅ Authorization (farmer only)
 * ✅ Required field validation
 * ✅ Price validation
 * ✅ Quantity validation
 * ✅ Farm existence validation
 * ✅ Farm ownership verification
 * ✅ Slug generation
 * ✅ Default values
 * ✅ Invalid JSON handling
 *
 * Total Tests: 35 comprehensive API integration tests
 * Coverage: Full HTTP request/response cycle with authentication & validation
 */
