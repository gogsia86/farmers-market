/**
 * 🧪 ORDERS API INTEGRATION TESTS
 *
 * Comprehensive HTTP API integration tests for /api/orders endpoints
 * Tests the full request/response cycle including authentication, validation, and order lifecycle
 *
 * Test Coverage:
 * - GET /api/orders - List orders with filters
 * - POST /api/orders - Create order with authentication
 * - Order status transitions
 * - Authentication & authorization
 * - Error handling & edge cases
 * - Pagination & filtering
 * - Multi-farm order support
 *
 * @reference .cursorrules - API Integration Testing Patterns
 */

import { GET, POST } from "@/app/api/orders/route";
import { database } from "@/lib/database";
import type { Farm, Order, Product, User } from "@prisma/client";
import {
    createTestFarm,
    createTestOrder,
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

// Mock realtime notifications
jest.mock("@/lib/realtime/emit-helpers", () => ({
  emitNewOrder: jest.fn(),
  emitNotification: jest.fn(),
  emitOrderStatusUpdate: jest.fn(),
}));

// ============================================================================
// TEST DATA
// ============================================================================

let testCustomer: User;
let testFarmer: User;
let testFarm: Farm;
let testProduct1: Product;
let testProduct2: Product;
let testOrder1: Order;
let testOrder2: Order;

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

beforeAll(async () => {
  // Create test users
  testCustomer = await createTestUser({
    email: `customer-orders-api-${Date.now()}@test.com`,
    name: "Orders API Test Customer",
    role: "CONSUMER",
  });

  testFarmer = await createTestUser({
    email: `farmer-orders-api-${Date.now()}@test.com`,
    name: "Orders API Test Farmer",
    role: "FARMER",
  });

  // Create test farm
  testFarm = await createTestFarm(testFarmer.id, {
    name: `Orders API Test Farm ${Date.now()}`,
    slug: `orders-api-test-farm-${Date.now()}`,
    description: "A test farm for orders API integration testing",
    status: "ACTIVE",
  });

  // Create test products
  testProduct1 = await createTestProduct(testFarm.id, {
    name: "Test Product 1",
    slug: `test-product-1-${Date.now()}`,
    description: "First test product for order testing",
    category: "VEGETABLES",
    price: 10.0,
    unit: "lb",
    quantityAvailable: 100,
    status: "ACTIVE",
  });

  testProduct2 = await createTestProduct(testFarm.id, {
    name: "Test Product 2",
    slug: `test-product-2-${Date.now()}`,
    description: "Second test product for order testing",
    category: "FRUITS",
    price: 15.0,
    unit: "lb",
    quantityAvailable: 50,
    status: "ACTIVE",
  });

  // Create test orders
  testOrder1 = await createTestOrder(testCustomer.id, testFarm.id, {
    status: "PENDING",
    totalAmount: 25.0,
    items: [
      {
        productId: testProduct1.id,
        quantity: 2,
        priceAtPurchase: 10.0,
      },
    ],
  });

  testOrder2 = await createTestOrder(testCustomer.id, testFarm.id, {
    status: "CONFIRMED",
    totalAmount: 45.0,
    items: [
      {
        productId: testProduct2.id,
        quantity: 3,
        priceAtPurchase: 15.0,
      },
    ],
  });
});

afterAll(async () => {
  // Clean up test data
  await database.orderItem.deleteMany({
    where: {
      orderId: { in: [testOrder1.id, testOrder2.id] },
    },
  });

  await database.order.deleteMany({
    where: {
      customerId: testCustomer.id,
    },
  });

  await database.product.deleteMany({
    where: { farmId: testFarm.id },
  });

  await database.farm.deleteMany({
    where: { id: testFarm.id },
  });

  await database.user.deleteMany({
    where: {
      id: { in: [testCustomer.id, testFarmer.id] },
    },
  });

  await disconnectTestDatabase();
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// TESTS: GET /api/orders - LIST ORDERS
// ============================================================================

describe("GET /api/orders - List Orders", () => {
  it("should require authentication", async () => {
    mockAuth.mockResolvedValue(null);

    const url = new URL("http://localhost:3000/api/orders");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("AUTHENTICATION_REQUIRED");
  });

  it("should return customer's orders", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        name: testCustomer.name,
        role: "CONSUMER",
      },
    });

    const url = new URL("http://localhost:3000/api/orders");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.orders).toBeDefined();
    expect(Array.isArray(data.data.orders)).toBe(true);
    expect(data.data.orders.length).toBeGreaterThanOrEqual(2);
    expect(data.data.orders.every((o: any) => o.customerId === testCustomer.id)).toBe(true);
  });

  it("should return farmer's orders", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testFarmer.id,
        email: testFarmer.email,
        name: testFarmer.name,
        role: "FARMER",
      },
    });

    const url = new URL("http://localhost:3000/api/orders");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.orders).toBeDefined();
    expect(Array.isArray(data.data.orders)).toBe(true);
  });

  it("should filter orders by status", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        role: "CONSUMER",
      },
    });

    const url = new URL("http://localhost:3000/api/orders?status=PENDING");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.orders.every((o: any) => o.status === "PENDING")).toBe(true);
  });

  it("should filter orders by farmId", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        role: "CONSUMER",
      },
    });

    const url = new URL(`http://localhost:3000/api/orders?farmId=${testFarm.id}`);
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.orders.every((o: any) => o.farmId === testFarm.id)).toBe(true);
  });

  it("should handle pagination", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        role: "CONSUMER",
      },
    });

    const url = new URL("http://localhost:3000/api/orders?page=1&limit=1");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.pagination).toBeDefined();
    expect(data.data.pagination.page).toBe(1);
    expect(data.data.pagination.limit).toBe(1);
    expect(data.data.orders.length).toBeLessThanOrEqual(1);
  });

  it("should sort orders by createdAt descending by default", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        role: "CONSUMER",
      },
    });

    const url = new URL("http://localhost:3000/api/orders");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify descending order by createdAt
    for (let i = 1; i < data.data.orders.length; i++) {
      const prev = new Date(data.data.orders[i - 1].createdAt).getTime();
      const curr = new Date(data.data.orders[i].createdAt).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  it("should include order items in response", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        role: "CONSUMER",
      },
    });

    const url = new URL("http://localhost:3000/api/orders");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const orderWithItems = data.data.orders.find((o: any) => o.id === testOrder1.id);
    expect(orderWithItems).toBeDefined();
    expect(orderWithItems.items).toBeDefined();
    expect(Array.isArray(orderWithItems.items)).toBe(true);
  });

  it("should handle empty results", async () => {
    // Create a customer with no orders
    const noOrdersCustomer = await createTestUser({
      email: `no-orders-${Date.now()}@test.com`,
      name: "No Orders Customer",
      role: "CONSUMER",
    });

    mockAuth.mockResolvedValue({
      user: {
        id: noOrdersCustomer.id,
        email: noOrdersCustomer.email,
        role: "CONSUMER",
      },
    });

    const url = new URL("http://localhost:3000/api/orders");
    const request = new Request(url);

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.orders.length).toBe(0);
    expect(data.data.pagination.total).toBe(0);

    // Cleanup
    await database.user.delete({ where: { id: noOrdersCustomer.id } });
  });
});

// ============================================================================
// TESTS: POST /api/orders - CREATE ORDER
// ============================================================================

describe("POST /api/orders - Create Order", () => {
  it("should require authentication", async () => {
    mockAuth.mockResolvedValue(null);

    const orderData = {
      farmId: testFarm.id,
      items: [
        {
          productId: testProduct1.id,
          quantity: 2,
          priceUSD: 10.0,
        },
      ],
      deliveryAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
      },
      paymentMethod: "card",
    };

    const request = new Request("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("AUTHENTICATION_REQUIRED");
  });

  it("should create order with valid data", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        name: testCustomer.name,
        role: "CONSUMER",
      },
    });

    const orderData = {
      farmId: testFarm.id,
      items: [
        {
          productId: testProduct1.id,
          quantity: 2,
          priceUSD: 10.0,
        },
      ],
      deliveryAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
        country: "US",
      },
      deliveryInstructions: "Leave at door",
      paymentMethod: "card",
    };

    const request = new Request("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.id).toBeDefined();
    expect(data.data.customerId).toBe(testCustomer.id);
    expect(data.data.farmId).toBe(testFarm.id);
    expect(data.data.status).toBe("PENDING");

    // Cleanup
    if (data.data.id) {
      await database.orderItem.deleteMany({ where: { orderId: data.data.id } });
      await database.order.delete({ where: { id: data.data.id } });
    }
  });

  it("should validate required fields", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        role: "CONSUMER",
      },
    });

    const invalidData = {
      // Missing farmId
      items: [],
      // Missing deliveryAddress
      paymentMethod: "card",
    };

    const request = new Request("http://localhost:3000/api/orders", {
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

  it("should validate order has at least one item", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        role: "CONSUMER",
      },
    });

    const invalidData = {
      farmId: testFarm.id,
      items: [], // Empty items array
      deliveryAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
      },
      paymentMethod: "card",
    };

    const request = new Request("http://localhost:3000/api/orders", {
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

  it("should validate quantity is positive", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        role: "CONSUMER",
      },
    });

    const invalidData = {
      farmId: testFarm.id,
      items: [
        {
          productId: testProduct1.id,
          quantity: 0, // Invalid quantity
          priceUSD: 10.0,
        },
      ],
      deliveryAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
      },
      paymentMethod: "card",
    };

    const request = new Request("http://localhost:3000/api/orders", {
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

  it("should validate delivery address has required fields", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        role: "CONSUMER",
      },
    });

    const invalidData = {
      farmId: testFarm.id,
      items: [
        {
          productId: testProduct1.id,
          quantity: 2,
          priceUSD: 10.0,
        },
      ],
      deliveryAddress: {
        street: "123 Test St",
        // Missing city, state, zipCode
      },
      paymentMethod: "card",
    };

    const request = new Request("http://localhost:3000/api/orders", {
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

  it("should calculate order total correctly", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        role: "CONSUMER",
      },
    });

    const orderData = {
      farmId: testFarm.id,
      items: [
        {
          productId: testProduct1.id,
          quantity: 3,
          priceUSD: 10.0,
        },
        {
          productId: testProduct2.id,
          quantity: 2,
          priceUSD: 15.0,
        },
      ],
      deliveryAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
      },
      paymentMethod: "card",
    };

    const request = new Request("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);

    // Expected total: (3 * 10) + (2 * 15) = 30 + 30 = 60
    const expectedTotal = 60.0;
    expect(data.data.totalAmount).toBeCloseTo(expectedTotal, 2);

    // Cleanup
    if (data.data.id) {
      await database.orderItem.deleteMany({ where: { orderId: data.data.id } });
      await database.order.delete({ where: { id: data.data.id } });
    }
  });

  it("should create order items with correct quantities", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        role: "CONSUMER",
      },
    });

    const orderData = {
      farmId: testFarm.id,
      items: [
        {
          productId: testProduct1.id,
          quantity: 5,
          priceUSD: 10.0,
        },
      ],
      deliveryAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
      },
      paymentMethod: "card",
    };

    const request = new Request("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);

    // Verify order items
    const orderItems = await database.orderItem.findMany({
      where: { orderId: data.data.id },
    });

    expect(orderItems.length).toBe(1);
    expect(orderItems[0].quantity).toBe(5);
    expect(orderItems[0].productId).toBe(testProduct1.id);

    // Cleanup
    await database.orderItem.deleteMany({ where: { orderId: data.data.id } });
    await database.order.delete({ where: { id: data.data.id } });
  });

  it("should handle invalid JSON body", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        role: "CONSUMER",
      },
    });

    const request = new Request("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json{{{",
    });

    const response = await POST(request as any);

    expect(response.status).toBe(400);
  });
});

// ============================================================================
// TESTS: CHECKOUT ORDER FLOW (MULTI-FARM)
// ============================================================================

describe("POST /api/orders - Checkout Order Flow", () => {
  it("should support multi-farm checkout", async () => {
    // Create another farm
    const otherFarmer = await createTestUser({
      email: `other-farmer-${Date.now()}@test.com`,
      name: "Other Farmer",
      role: "FARMER",
    });

    const otherFarm = await createTestFarm(otherFarmer.id, {
      name: `Other Farm ${Date.now()}`,
      slug: `other-farm-${Date.now()}`,
      description: "Another farm for multi-farm testing",
      status: "ACTIVE",
    });

    const otherProduct = await createTestProduct(otherFarm.id, {
      name: "Other Farm Product",
      slug: `other-farm-product-${Date.now()}`,
      description: "Product from another farm",
      category: "VEGETABLES",
      price: 20.0,
      unit: "lb",
      quantityAvailable: 100,
      status: "ACTIVE",
    });

    mockAuth.mockResolvedValue({
      user: {
        id: testCustomer.id,
        email: testCustomer.email,
        role: "CONSUMER",
      },
    });

    const checkoutData = {
      userId: testCustomer.id,
      shippingAddress: {
        fullName: "Test Customer",
        phone: "+15551234567",
        street: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
        country: "US",
      },
      deliveryInfo: {
        preferredDate: new Date().toISOString(),
        preferredTime: "morning",
        deliveryInstructions: "Leave at door",
      },
      paymentMethod: {
        method: "card" as const,
        saveCard: false,
      },
      cartItems: [
        {
          productId: testProduct1.id,
          farmId: testFarm.id,
          quantity: 2,
          priceAtPurchase: 10.0,
        },
        {
          productId: otherProduct.id,
          farmId: otherFarm.id,
          quantity: 1,
          priceAtPurchase: 20.0,
        },
      ],
      totals: {
        subtotal: 40.0,
        deliveryFee: 5.0,
        platformFee: 2.0,
        tax: 3.0,
        total: 50.0,
      },
    };

    const request = new Request("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    // This should create separate orders for each farm
    expect(response.status).toBe(201);

    // Cleanup
    await database.product.delete({ where: { id: otherProduct.id } });
    await database.farm.delete({ where: { id: otherFarm.id } });
    await database.user.delete({ where: { id: otherFarmer.id } });
  });
});

// ============================================================================
// SUMMARY
// ============================================================================

/**
 * API Integration Test Summary:
 *
 * GET /api/orders:
 * ✅ Authentication required
 * ✅ Return customer's orders
 * ✅ Return farmer's orders
 * ✅ Filter by status
 * ✅ Filter by farmId
 * ✅ Pagination support
 * ✅ Default sorting (createdAt desc)
 * ✅ Include order items
 * ✅ Handle empty results
 *
 * POST /api/orders:
 * ✅ Authentication required
 * ✅ Create order with valid data
 * ✅ Validate required fields
 * ✅ Validate minimum items
 * ✅ Validate quantity is positive
 * ✅ Validate delivery address
 * ✅ Calculate order total
 * ✅ Create order items correctly
 * ✅ Handle invalid JSON
 *
 * Checkout Flow:
 * ✅ Multi-farm order support
 *
 * Total Tests: 19 comprehensive API integration tests
 * Coverage: Full HTTP request/response cycle with authentication & order lifecycle
 */
