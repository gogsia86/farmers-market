/**
 * 🌐 API Integration Test Suite
 * Comprehensive API integration testing for all endpoints
 *
 * @module tests/api/api-integration
 * @version 3.0.0
 * @divine_pattern QUANTUM_API_TESTING
 * @agricultural_consciousness BIODYNAMIC_API_FLOWS
 */

import { test, expect } from "@playwright/test";
import {
  ApiClient,
  ApiTestRunner,
  ApiAssertions,
  RateLimitTester,
  ApiPerformanceMonitor,
  API_CONFIG,
  type ApiResponse,
} from "../utils/api-integration-utils";
import { TestDataFactory } from "../utils/e2e-advanced-utils";

// ==========================================
// 🎯 TEST SUITE CONFIGURATION
// ==========================================

test.describe("API Integration Tests", () => {
  let apiClient: ApiClient;
  let testRunner: ApiTestRunner;
  let performanceMonitor: ApiPerformanceMonitor;
  const testUsers: any[] = [];
  const testFarms: any[] = [];
  const testProducts: any[] = [];

  // ==========================================
  // 🔧 SETUP & TEARDOWN
  // ==========================================

  test.beforeAll(async () => {
    apiClient = new ApiClient(API_CONFIG.baseUrl);
    testRunner = new ApiTestRunner(apiClient);
    performanceMonitor = new ApiPerformanceMonitor();

    // Create test data
    const farmer = await TestDataFactory.createTestUser("FARMER");
    const customer = await TestDataFactory.createTestUser("CUSTOMER");
    testUsers.push(farmer, customer);

    // Authenticate
    await apiClient.authenticate(farmer.email, farmer.password);

    // Create test farm
    const farm = await TestDataFactory.createTestFarm(farmer.id);
    testFarms.push(farm);

    // Create test products
    for (let i = 0; i < 5; i++) {
      const product = await TestDataFactory.createTestProduct(farm.id);
      testProducts.push(product);
    }
  });

  test.afterAll(async () => {
    // Cleanup test data
    await TestDataFactory.cleanup({
      userIds: testUsers.map((u) => u.id),
      farmIds: testFarms.map((f) => f.id),
      productIds: testProducts.map((p) => p.id),
    });

    // Generate performance report
    console.log(performanceMonitor.generateReport());
  });

  // ==========================================
  // 🧪 HEALTH CHECK ENDPOINTS
  // ==========================================

  test.describe("Health Check", () => {
    test("GET /api/health - should return healthy status", async () => {
      const response = await apiClient.get("/api/health");

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("status", "healthy");
      expect(response.data).toHaveProperty("timestamp");
    });

    test("GET /api/health - should respond within 1 second", async () => {
      await ApiAssertions.assertResponseTime(
        () => apiClient.get("/api/health"),
        1000,
      );
    });
  });

  // ==========================================
  // 🧪 AUTHENTICATION ENDPOINTS
  // ==========================================

  test.describe("Authentication API", () => {
    test("POST /api/auth/register - should create new user", async () => {
      const userData = {
        email: TestDataFactory.generateEmail("newuser"),
        password: "SecurePass123!",
        name: "New Test User",
        role: "CUSTOMER",
      };

      const response = await apiClient.post(
        API_CONFIG.endpoints.auth.register,
        userData,
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("id");
      expect(response.data).toHaveProperty("email", userData.email);
      expect(response.data).not.toHaveProperty("password");
    });

    test("POST /api/auth/register - should reject invalid email", async () => {
      const response = await apiClient.post(
        API_CONFIG.endpoints.auth.register,
        {
          email: "invalid-email",
          password: "SecurePass123!",
          name: "Test User",
        },
      );

      ApiAssertions.assertError(response, "VALIDATION_ERROR");
    });

    test("POST /api/auth/signin - should authenticate valid credentials", async () => {
      const farmer = testUsers[0];
      const response = await apiClient.post(API_CONFIG.endpoints.auth.signin, {
        email: farmer.email,
        password: farmer.password,
      });

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("token");
      expect(response.data).toHaveProperty("user");
    });

    test("POST /api/auth/signin - should reject invalid credentials", async () => {
      const response = await apiClient.post(API_CONFIG.endpoints.auth.signin, {
        email: "test@example.com",
        password: "WrongPassword",
      });

      ApiAssertions.assertError(response, "AUTHENTICATION_FAILED");
    });

    test("GET /api/auth/session - should return current session", async () => {
      const response = await apiClient.get(API_CONFIG.endpoints.auth.session);

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("user");
    });

    test("POST /api/auth/signout - should clear session", async () => {
      const response = await apiClient.post(API_CONFIG.endpoints.auth.signout);
      ApiAssertions.assertSuccess(response);
    });
  });

  // ==========================================
  // 🧪 FARM ENDPOINTS
  // ==========================================

  test.describe("Farms API", () => {
    test("GET /api/farms - should return list of farms", async () => {
      const response = await apiClient.get<any[]>(
        API_CONFIG.endpoints.farms.list,
      );

      ApiAssertions.assertSuccess(response);
      ApiAssertions.assertArray(response.data, 1);
      expect(response.data![0]).toHaveProperty("id");
      expect(response.data![0]).toHaveProperty("name");
      expect(response.data![0]).toHaveProperty("slug");
    });

    test("GET /api/farms?page=1&pageSize=10 - should support pagination", async () => {
      const response = await apiClient.get(API_CONFIG.endpoints.farms.list, {
        params: { page: "1", pageSize: "10" },
      });

      ApiAssertions.assertSuccess(response);
      ApiAssertions.assertPagination(response.meta?.pagination, {
        page: 1,
        pageSize: 10,
      });
    });

    test("GET /api/farms/:id - should return farm details", async () => {
      const farm = testFarms[0];
      const response = await apiClient.get(
        API_CONFIG.endpoints.farms.detail(farm.id),
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("id", farm.id);
      expect(response.data).toHaveProperty("name");
      expect(response.data).toHaveProperty("owner");
      expect(response.data).toHaveProperty("products");
    });

    test("GET /api/farms/:id - should return 404 for non-existent farm", async () => {
      const response = await apiClient.get(
        API_CONFIG.endpoints.farms.detail("non-existent-id"),
      );

      ApiAssertions.assertError(response, "NOT_FOUND");
    });

    test("POST /api/farms - should create new farm", async () => {
      const farmData = {
        name: "New Test Farm",
        description: "Test farm description",
        location: {
          address: "123 Farm Lane",
          city: "Farm City",
          state: "FC",
          zipCode: "12345",
          coordinates: { lat: 40.7128, lng: -74.006 },
        },
      };

      const response = await apiClient.post(
        API_CONFIG.endpoints.farms.create,
        farmData,
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("id");
      expect(response.data).toHaveProperty("name", farmData.name);
      expect(response.data).toHaveProperty("slug");

      // Cleanup
      testFarms.push(response.data);
    });

    test("POST /api/farms - should reject invalid farm data", async () => {
      const response = await apiClient.post(API_CONFIG.endpoints.farms.create, {
        name: "ab", // Too short
      });

      ApiAssertions.assertValidationError(response, "name");
    });

    test("PUT /api/farms/:id - should update farm", async () => {
      const farm = testFarms[0];
      const updateData = {
        description: "Updated farm description",
      };

      const response = await apiClient.put(
        API_CONFIG.endpoints.farms.update(farm.id),
        updateData,
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty(
        "description",
        updateData.description,
      );
    });

    test("DELETE /api/farms/:id - should delete farm", async () => {
      // Create a farm to delete
      const farm = await TestDataFactory.createTestFarm(testUsers[0].id);

      const response = await apiClient.delete(
        API_CONFIG.endpoints.farms.delete(farm.id),
      );

      ApiAssertions.assertSuccess(response);

      // Verify deletion
      const getResponse = await apiClient.get(
        API_CONFIG.endpoints.farms.detail(farm.id),
      );
      ApiAssertions.assertError(getResponse, "NOT_FOUND");
    });
  });

  // ==========================================
  // 🧪 PRODUCT ENDPOINTS
  // ==========================================

  test.describe("Products API", () => {
    test("GET /api/products - should return list of products", async () => {
      const response = await apiClient.get<any[]>(
        API_CONFIG.endpoints.products.list,
      );

      ApiAssertions.assertSuccess(response);
      ApiAssertions.assertArray(response.data, 1);
      expect(response.data![0]).toHaveProperty("id");
      expect(response.data![0]).toHaveProperty("name");
      expect(response.data![0]).toHaveProperty("price");
    });

    test("GET /api/products?category=VEGETABLES - should filter by category", async () => {
      const response = await apiClient.get(API_CONFIG.endpoints.products.list, {
        params: { category: "VEGETABLES" },
      });

      ApiAssertions.assertSuccess(response);
      expect(response.data).toBeInstanceOf(Array);
    });

    test("GET /api/products/:id - should return product details", async () => {
      const product = testProducts[0];
      const response = await apiClient.get(
        API_CONFIG.endpoints.products.detail(product.id),
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("id", product.id);
      expect(response.data).toHaveProperty("farm");
      expect(response.data).toHaveProperty("inventory");
    });

    test("POST /api/products - should create new product", async () => {
      const productData = {
        name: "Fresh Organic Carrots",
        description: "Locally grown carrots",
        price: 3.99,
        inventory: 100,
        category: "VEGETABLES",
        unit: "lb",
        farmId: testFarms[0].id,
      };

      const response = await apiClient.post(
        API_CONFIG.endpoints.products.create,
        productData,
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("id");
      expect(response.data).toHaveProperty("name", productData.name);

      testProducts.push(response.data);
    });

    test("POST /api/products - should reject negative price", async () => {
      const response = await apiClient.post(
        API_CONFIG.endpoints.products.create,
        {
          name: "Test Product",
          price: -5.0,
          inventory: 10,
          farmId: testFarms[0].id,
        },
      );

      ApiAssertions.assertValidationError(response, "price");
    });

    test("PUT /api/products/:id - should update product", async () => {
      const product = testProducts[0];
      const updateData = {
        price: 15.99,
        inventory: 75,
      };

      const response = await apiClient.put(
        API_CONFIG.endpoints.products.update(product.id),
        updateData,
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("price", updateData.price);
      expect(response.data).toHaveProperty("inventory", updateData.inventory);
    });

    test("GET /api/products/search - should search products", async () => {
      const response = await apiClient.get(
        API_CONFIG.endpoints.products.search,
        {
          params: { q: "test" },
        },
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toBeInstanceOf(Array);
    });
  });

  // ==========================================
  // 🧪 ORDER ENDPOINTS
  // ==========================================

  test.describe("Orders API", () => {
    let testOrderId: string;

    test("POST /api/orders - should create new order", async () => {
      const orderData = {
        items: [
          {
            productId: testProducts[0].id,
            quantity: 2,
            price: testProducts[0].price,
          },
        ],
        shippingAddress: {
          address: "123 Test St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
        },
        paymentMethod: "CREDIT_CARD",
      };

      const response = await apiClient.post(
        API_CONFIG.endpoints.orders.create,
        orderData,
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("id");
      expect(response.data).toHaveProperty("total");
      expect(response.data).toHaveProperty("status");

      testOrderId = response.data.id;
    });

    test("GET /api/orders - should return user orders", async () => {
      const response = await apiClient.get(API_CONFIG.endpoints.orders.list);

      ApiAssertions.assertSuccess(response);
      ApiAssertions.assertArray(response.data);
    });

    test("GET /api/orders/:id - should return order details", async () => {
      const response = await apiClient.get(
        API_CONFIG.endpoints.orders.detail(testOrderId),
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("id", testOrderId);
      expect(response.data).toHaveProperty("items");
      expect(response.data).toHaveProperty("customer");
    });

    test("PUT /api/orders/:id - should update order status", async () => {
      const response = await apiClient.put(
        API_CONFIG.endpoints.orders.update(testOrderId),
        { status: "PROCESSING" },
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("status", "PROCESSING");
    });

    test("POST /api/orders/:id/cancel - should cancel order", async () => {
      const response = await apiClient.post(
        API_CONFIG.endpoints.orders.cancel(testOrderId),
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("status", "CANCELLED");
    });
  });

  // ==========================================
  // 🧪 USER ENDPOINTS
  // ==========================================

  test.describe("Users API", () => {
    test("GET /api/users/profile - should return user profile", async () => {
      const response = await apiClient.get(API_CONFIG.endpoints.users.profile);

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("id");
      expect(response.data).toHaveProperty("email");
      expect(response.data).toHaveProperty("role");
    });

    test("PUT /api/users/profile - should update user profile", async () => {
      const updateData = {
        name: "Updated Test User",
        phone: "555-1234",
      };

      const response = await apiClient.put(
        API_CONFIG.endpoints.users.update,
        updateData,
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toHaveProperty("name", updateData.name);
    });

    test("GET /api/users/preferences - should return user preferences", async () => {
      const response = await apiClient.get(
        API_CONFIG.endpoints.users.preferences,
      );

      ApiAssertions.assertSuccess(response);
      expect(response.data).toBeDefined();
    });
  });

  // ==========================================
  // 🧪 PERFORMANCE TESTS
  // ==========================================

  test.describe("API Performance", () => {
    test("Should handle concurrent requests efficiently", async () => {
      const requests = Array.from({ length: 10 }, () =>
        apiClient.get(API_CONFIG.endpoints.products.list),
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      responses.forEach((response) => {
        ApiAssertions.assertSuccess(response);
      });

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test("Should maintain response time under load", async () => {
      const measurements: number[] = [];

      for (let i = 0; i < 20; i++) {
        const duration = await performanceMonitor.measure("/api/products", () =>
          apiClient.get(API_CONFIG.endpoints.products.list),
        );
        measurements.push(duration);
      }

      const avgTime =
        measurements.reduce((a, b) => a + b) / measurements.length;
      const maxTime = Math.max(...measurements);

      console.log(`Average response time: ${avgTime.toFixed(2)}ms`);
      console.log(`Max response time: ${maxTime}ms`);

      expect(avgTime).toBeLessThan(1000);
      expect(maxTime).toBeLessThan(2000);
    });
  });

  // ==========================================
  // 🧪 ERROR HANDLING
  // ==========================================

  test.describe("Error Handling", () => {
    test("Should return 404 for non-existent endpoints", async () => {
      const response = await apiClient.get("/api/non-existent");
      expect(response.success).toBe(false);
    });

    test("Should return 401 for unauthorized requests", async () => {
      const unauthClient = new ApiClient(API_CONFIG.baseUrl);
      const response = await unauthClient.get("/api/orders");

      ApiAssertions.assertError(response, "UNAUTHORIZED");
    });

    test("Should handle malformed JSON gracefully", async () => {
      const response = await apiClient.post(
        API_CONFIG.endpoints.products.create,
        {
          invalidData: "malformed",
        },
      );

      expect(response.success).toBe(false);
    });

    test("Should return meaningful error messages", async () => {
      const response = await apiClient.post(API_CONFIG.endpoints.farms.create, {
        name: "",
      });

      ApiAssertions.assertError(response);
      expect(response.error?.message).toBeTruthy();
    });
  });

  // ==========================================
  // 🧪 RATE LIMITING
  // ==========================================

  test.describe("Rate Limiting", () => {
    test("Should enforce rate limits", async ({ page }) => {
      const rateLimitTester = new RateLimitTester(apiClient);

      const result = await rateLimitTester.testRateLimit({
        maxRequests: 100,
        windowMs: 60000,
        endpoint: API_CONFIG.endpoints.products.list,
      });

      console.log("Rate limit test results:", result);
      expect(result.rateLimitWorking).toBe(true);
    });
  });

  // ==========================================
  // 🧪 DATA VALIDATION
  // ==========================================

  test.describe("Data Validation", () => {
    test("Should validate required fields", async () => {
      const response = await apiClient.post(
        API_CONFIG.endpoints.products.create,
        {},
      );

      ApiAssertions.assertError(response, "VALIDATION_ERROR");
    });

    test("Should validate data types", async () => {
      const response = await apiClient.post(
        API_CONFIG.endpoints.products.create,
        {
          name: "Test Product",
          price: "not-a-number",
          inventory: 10,
          farmId: testFarms[0].id,
        },
      );

      ApiAssertions.assertError(response, "VALIDATION_ERROR");
    });

    test("Should validate email format", async () => {
      const response = await apiClient.post(
        API_CONFIG.endpoints.auth.register,
        {
          email: "invalid-email",
          password: "Password123!",
          name: "Test User",
        },
      );

      ApiAssertions.assertValidationError(response, "email");
    });

    test("Should enforce string length constraints", async () => {
      const response = await apiClient.post(API_CONFIG.endpoints.farms.create, {
        name: "ab", // Too short
        location: {
          address: "123 Test St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
        },
      });

      ApiAssertions.assertValidationError(response, "name");
    });
  });

  // ==========================================
  // 🧪 IDEMPOTENCY
  // ==========================================

  test.describe("Idempotency", () => {
    test("PUT requests should be idempotent", async () => {
      const product = testProducts[0];
      const updateData = { price: 20.99 };

      const response1 = await apiClient.put(
        API_CONFIG.endpoints.products.update(product.id),
        updateData,
      );

      const response2 = await apiClient.put(
        API_CONFIG.endpoints.products.update(product.id),
        updateData,
      );

      ApiAssertions.assertSuccess(response1);
      ApiAssertions.assertSuccess(response2);
      expect(response1.data).toEqual(response2.data);
    });
  });

  // ==========================================
  // 🧪 CACHING
  // ==========================================

  test.describe("Caching", () => {
    test("Should return cached responses for repeated requests", async () => {
      const endpoint = API_CONFIG.endpoints.products.list;

      const response1Time = await performanceMonitor.measure(endpoint, () =>
        apiClient.get(endpoint),
      );

      const response2Time = await performanceMonitor.measure(endpoint, () =>
        apiClient.get(endpoint),
      );

      console.log(`First request: ${response1Time}ms`);
      console.log(`Second request: ${response2Time}ms`);

      // Second request might be faster due to caching
      expect(response2Time).toBeLessThanOrEqual(response1Time * 1.5);
    });
  });
});
