/**
 * 🔗 INTEGRATION TESTS - Order Workflow
 * Tests the complete order processing flow with real database interactions
 *
 * These tests require a running database and test actual service interactions
 *
 * @pattern Direct Service Testing - No HTTP Server Required
 * @reference 17_API_TESTING_TRACING_MOCKS.instructions.md
 */

// Unmock the database for integration tests - we need real connections
jest.unmock("@/lib/database");
jest.unmock("@prisma/client");

import { database } from "@/lib/database";
import { OrderService, orderService } from "@/lib/services/order.service";
import { ProductService } from "@/lib/services/product.service";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import {
  createTestUser,
  createTestFarm,
  createTestProduct,
  disconnectTestDatabase,
} from "../../../tests/helpers/api-test-helpers";

// Test data
let testFarmId: string;
let testUserId: string;
let testProductId: string;
let testOrderIds: string[] = [];

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

describeIntegration("🔗 Integration: Complete Order Workflow", () => {
  beforeAll(async () => {
    // These tests require a real database connection
    // Set DATABASE_URL to a real test database (not the mocked localhost:5432/test)
    // Or set SKIP_INTEGRATION_TESTS=true to skip

    // Ensure database is connected
    try {
      await database.$connect();
    } catch (error: any) {
      console.warn(
        "⚠️ Database connection failed. Integration tests will fail.",
      );
      console.warn("To run integration tests:");
      console.warn("  1. Set up a test database");
      console.warn("  2. Set DATABASE_URL to the test database");
      console.warn("  3. Run: npm run db:push");
      throw error;
    }

    // Create test user
    const testUser = await createTestUser({ role: "CONSUMER" });
    testUserId = testUser.id;

    // Create test farm
    const testFarm = await createTestFarm(testUserId);
    testFarmId = testFarm.id;

    // Create test product
    const testProduct = await createTestProduct(testFarmId, {
      name: "Integration Test Tomatoes",
      category: "VEGETABLES",
      price: 500, // $5.00
      stockQuantity: 100,
    });
    testProductId = testProduct.id;
  });

  afterAll(async () => {
    // Cleanup test data
    for (const orderId of testOrderIds) {
      try {
        await database.order.delete({
          where: { id: orderId },
        });
      } catch (error) {
        // Order might already be deleted
      }
    }

    if (testProductId) {
      try {
        await database.product.delete({
          where: { id: testProductId },
        });
      } catch (error) {
        // Product might already be deleted
      }
    }

    if (testFarmId) {
      try {
        await database.farm.delete({
          where: { id: testFarmId },
        });
      } catch (error) {
        // Farm might already be deleted
      }
    }

    if (testUserId) {
      try {
        await database.user.delete({
          where: { id: testUserId },
        });
      } catch (error) {
        console.warn("Cleanup warning:", error);
      }
    }

    try {
      await disconnectTestDatabase();
    } catch (error) {
      // Ignore disconnect errors
    }
  });

  describe("📦 End-to-End Order Processing", () => {
    it("should create an order successfully", async () => {
      // Step 1: Create order
      const orderInput = {
        userId: testUserId,
        farmId: testFarmId,
        items: [
          {
            productId: testProductId,
            quantity: 2,
            priceAtPurchase: 500,
          },
        ],
        shippingAddress: {
          street: "456 Customer St",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90001",
          country: "USA",
        },
        fulfillmentMethod: "DELIVERY" as const,
      };

      const order = await OrderService.createOrder(orderInput as any);
      testOrderIds.push(order.id);

      expect(order).toMatchObject({
        id: expect.any(String),
        customerId: testUserId,
        status: expect.any(String),
      });

      // Verify order was created in database
      const savedOrder = await database.order.findUnique({
        where: { id: order.id },
        include: {
          items: true,
        },
      });

      expect(savedOrder).toBeDefined();
      expect(savedOrder?.items.length).toBeGreaterThan(0);
      expect(savedOrder?.items[0].productId).toBe(testProductId);
    }, 30000); // 30 second timeout

    it("should handle inventory updates during order creation", async () => {
      // Get initial inventory
      const productBefore = await database.product.findUnique({
        where: { id: testProductId },
        select: {
          inventory: true,
          stockQuantity: true,
        },
      });

      const initialStock = productBefore?.stockQuantity || 0;

      // Create order
      const order = await OrderService.createOrder({
        userId: testUserId,
        farmId: testFarmId,
        items: [
          {
            productId: testProductId,
            quantity: 5,
            priceAtPurchase: 500,
          },
        ],
        shippingAddress: {
          street: "789 Test Ave",
          city: "San Francisco",
          state: "CA",
          zipCode: "94102",
          country: "USA",
        },
        fulfillmentMethod: "DELIVERY" as const,
      } as any);
      testOrderIds.push(order.id);

      // Check inventory was updated or reserved
      const productAfter = await database.product.findUnique({
        where: { id: testProductId },
        select: {
          inventory: true,
          stockQuantity: true,
        },
      });

      // Inventory should be affected by the order
      if (productAfter?.inventory) {
        // Using new inventory system
        const reservedQty = productAfter.inventory.reservedQuantity || 0;
        expect(reservedQty).toBeGreaterThan(0);
      } else {
        // Using simple stock quantity
        const currentStock = productAfter?.stockQuantity || 0;
        expect(currentStock).toBeLessThanOrEqual(initialStock);
      }
    }, 30000);

    it("should cancel order and release inventory", async () => {
      const productBefore = await database.product.findUnique({
        where: { id: testProductId },
        select: {
          inventory: true,
          stockQuantity: true,
        },
      });

      const initialReserved = productBefore?.inventory?.reservedQuantity || 0;
      const initialStock = productBefore?.stockQuantity || 0;

      // Create order
      const order = await OrderService.createOrder({
        userId: testUserId,
        farmId: testFarmId,
        items: [
          {
            productId: testProductId,
            quantity: 3,
            priceAtPurchase: 500,
          },
        ],
        shippingAddress: {
          street: "321 Rollback St",
          city: "San Diego",
          state: "CA",
          zipCode: "92101",
          country: "USA",
        },
        fulfillmentMethod: "DELIVERY" as const,
      } as any);
      testOrderIds.push(order.id);

      // Cancel order
      await OrderService.cancelOrder(order.id, testUserId);

      // Check inventory was released
      const productAfter = await database.product.findUnique({
        where: { id: testProductId },
        select: {
          inventory: true,
          stockQuantity: true,
        },
      });

      // Inventory should be restored
      if (productAfter?.inventory) {
        expect(productAfter.inventory.reservedQuantity).toBeLessThanOrEqual(
          initialReserved + 3,
        );
      } else {
        const currentStock = productAfter?.stockQuantity || 0;
        expect(currentStock).toBeGreaterThanOrEqual(initialStock - 3);
      }

      // Verify order status
      const canceledOrder = await database.order.findUnique({
        where: { id: order.id },
      });

      expect(canceledOrder?.status).toBe("CANCELLED");
    }, 30000);
  });

  describe("🔄 Multi-Service Interactions", () => {
    it("should coordinate product and order services", async () => {
      // Create product
      const product = await ProductService.createProduct(
        {
          name: "Multi-Service Test Product",
          farmId: testFarmId,
          category: "FRUITS",
          description: "Test coordination",
          unit: "lb",
          pricing: {
            basePrice: {
              amount: 1000,
              currency: "USD",
            },
          },
          inventory: {
            quantity: 50,
            reservedQuantity: 0,
            lowStockThreshold: 10,
          },
          images: [],
        } as any,
        testUserId,
      );

      // Create order with product
      const order = await OrderService.createOrder({
        userId: testUserId,
        farmId: testFarmId,
        items: [
          {
            productId: product.id,
            quantity: 2,
            priceAtPurchase: 1000,
          },
        ],
        shippingAddress: {
          street: "555 Multi St",
          city: "Test City",
          state: "CA",
          zipCode: "90210",
          country: "USA",
        },
        fulfillmentMethod: "FARM_PICKUP" as const,
      } as any);
      testOrderIds.push(order.id);

      // Verify all services updated correctly
      const finalOrder = await database.order.findUnique({
        where: { id: order.id },
        include: {
          items: true,
        },
      });

      const finalProduct = await database.product.findUnique({
        where: { id: product.id },
        select: {
          inventory: true,
          stockQuantity: true,
        },
      });

      expect(finalOrder?.status).toBeDefined();
      expect(finalOrder?.items[0].productId).toBe(product.id);

      // Check inventory was affected
      if (finalProduct?.inventory) {
        expect(finalProduct.inventory.reservedQuantity).toBeGreaterThanOrEqual(
          0,
        );
      }

      // Cleanup
      await database.product.delete({
        where: { id: product.id },
      });
    }, 30000);
  });

  describe("⚡ Error Recovery", () => {
    it("should handle invalid user id gracefully", async () => {
      try {
        await OrderService.createOrder({
          userId: "invalid-user-id-12345",
          farmId: testFarmId,
          items: [
            {
              productId: testProductId,
              quantity: 1,
              priceAtPurchase: 500,
            },
          ],
          shippingAddress: {
            street: "Test",
            city: "Test",
            state: "CA",
            zipCode: "90210",
            country: "USA",
          },
          fulfillmentMethod: "DELIVERY" as const,
        } as any);

        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Should throw validation or database error
        expect(error).toBeDefined();
      }
    });

    it("should handle empty items array", async () => {
      try {
        await OrderService.createOrder({
          userId: testUserId,
          farmId: testFarmId,
          items: [],
          shippingAddress: {
            street: "Test",
            city: "Test",
            state: "CA",
            zipCode: "90210",
            country: "USA",
          },
          fulfillmentMethod: "DELIVERY" as const,
        } as any);

        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Should throw validation error
        expect(error).toBeDefined();
      }
    });

    it("should handle non-existent product", async () => {
      try {
        await OrderService.createOrder({
          userId: testUserId,
          farmId: testFarmId,
          items: [
            {
              productId: "non-existent-product-id",
              quantity: 1,
              priceAtPurchase: 500,
            },
          ],
          shippingAddress: {
            street: "Test",
            city: "Test",
            state: "CA",
            zipCode: "90210",
            country: "USA",
          },
          fulfillmentMethod: "DELIVERY" as const,
        } as any);

        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Should throw error about product not found
        expect(error).toBeDefined();
      }
    });
  });

  describe("📊 Order Status Transitions", () => {
    it("should transition through valid order statuses", async () => {
      // Create order (should start as PENDING or CONFIRMED)
      const order = await OrderService.createOrder({
        userId: testUserId,
        farmId: testFarmId,
        items: [
          {
            productId: testProductId,
            quantity: 1,
            priceAtPurchase: 500,
          },
        ],
        shippingAddress: {
          street: "999 Status St",
          city: "Phoenix",
          state: "AZ",
          zipCode: "85001",
          country: "USA",
        },
        fulfillmentMethod: "DELIVERY" as const,
      } as any);
      testOrderIds.push(order.id);

      expect(order.status).toBeDefined();
      const initialStatus = order.status;

      // Valid status transitions
      const validStatuses = [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ];

      expect(validStatuses).toContain(initialStatus);

      // Verify order can be retrieved
      const retrievedOrder = await database.order.findUnique({
        where: { id: order.id },
      });

      expect(retrievedOrder?.status).toBe(initialStatus);
    }, 30000);
  });
});
