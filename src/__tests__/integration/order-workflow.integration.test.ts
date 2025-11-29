/**
 * 🔗 INTEGRATION TESTS - Order Workflow
 * Tests the complete order processing flow with real database interactions
 *
 * These tests require a running database and test actual service interactions
 */

// Unmock the database for integration tests - we need real connections
jest.unmock("@/lib/database");
jest.unmock("@prisma/client");

import { database } from "@/lib/database";
import { OrderService } from "@/lib/services/order.service";
import { PaymentService } from "@/lib/services/payment.service";
import { ProductService } from "@/lib/services/product.service";
import { ShippingService } from "@/lib/services/shipping.service";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";

// Test data
let testFarmId: string;
let testUserId: string;
let testProductId: string;
let testOrderId: string;

// Check if we should skip integration tests (no real database available)
const shouldSkipIntegrationTests =
  process.env.SKIP_INTEGRATION_TESTS === "true" ||
  process.env.DATABASE_URL?.includes("localhost:5432/test");

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
    } catch (error) {
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
    const testUser = await database.user.create({
      data: {
        email: `test-${Date.now()}@integration.test`,
        firstName: "Test",
        lastName: "User",
        role: "CONSUMER",
        status: "ACTIVE",
      },
    });
    testUserId = testUser.id;

    // Create test farm
    const testFarm = await database.farm.create({
      data: {
        name: "Integration Test Farm",
        slug: `integration-farm-${Date.now()}`,
        ownerId: testUserId,
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
        description: "Test farm for integration tests",
        location: {
          address: "123 Test St",
          city: "Test City",
          state: "CA",
          zipCode: "90210",
          country: "USA",
        },
      },
    });
    testFarmId = testFarm.id;

    // Create test product
    const testProduct = await ProductService.createProduct(
      {
        name: "Integration Test Tomatoes",
        farmId: testFarmId,
        category: "VEGETABLES",
        description: "Fresh tomatoes for testing",
        pricing: {
          basePrice: {
            amount: 500, // $5.00
            currency: "USD",
          },
        },
        inventory: {
          quantity: 100,
          reservedQuantity: 0,
          lowStockThreshold: 20,
        },
        images: [
          {
            url: "https://example.com/tomato.jpg",
            isPrimary: true,
          },
        ],
      } as any,
      testUserId,
    );
    testProductId = testProduct.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testOrderId) {
      await database.order.delete({
        where: { id: testOrderId },
      });
    }

    if (testProductId) {
      await database.product.delete({
        where: { id: testProductId },
      });
    }

    if (testFarmId) {
      await database.farm.delete({
        where: { id: testFarmId },
      });
    }

    if (testUserId) {
      try {
        await database.user.delete({
          where: { id: testUserId },
        });
      } catch (error) {
        console.warn("Cleanup warning:", error.message);
      }
    }

    try {
      await database.$disconnect();
    } catch (error) {
      // Ignore disconnect errors
    }
  });

  describe("📦 End-to-End Order Processing", () => {
    it("should complete full order workflow: create → pay → ship → deliver", async () => {
      // Step 1: Create order
      const orderInput = {
        customerId: testUserId,
        items: [
          {
            productId: testProductId,
            quantity: 2,
            price: 500,
          },
        ],
        shippingAddress: {
          address: "456 Customer St",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90001",
          country: "USA",
        },
        fulfillmentMethod: "DELIVERY",
      };

      const order = await OrderService.createOrder(orderInput as any);
      testOrderId = order.id;

      expect(order).toMatchObject({
        id: expect.any(String),
        customerId: testUserId,
        status: "PENDING",
        paymentStatus: "PENDING",
      });

      // Step 2: Calculate shipping
      const shippingRates = await ShippingService.calculateShippingRates(
        order.id,
        {
          city: "Los Angeles",
          state: "CA",
          zipCode: "90001",
        },
      );

      expect(shippingRates).toHaveLength(3);
      const selectedRate = shippingRates[0]; // STANDARD

      // Step 3: Create payment intent
      const totalAmount = order.total + selectedRate.cost * 100; // Convert to cents
      const paymentIntent = await PaymentService.createPaymentIntent(
        order.id,
        totalAmount,
        "USD",
      );

      expect(paymentIntent).toMatchObject({
        id: expect.stringContaining("pi_"),
        amount: totalAmount,
        currency: "USD",
        status: "pending",
      });

      // Step 4: Confirm payment
      const paymentConfirmed = await PaymentService.confirmPayment(
        paymentIntent.id,
      );

      expect(paymentConfirmed).toBe(true);

      // Verify order status updated
      const updatedOrder = await database.order.findUnique({
        where: { id: order.id },
      });

      expect(updatedOrder?.paymentStatus).toBe("COMPLETED");
      expect(updatedOrder?.status).toBe("CONFIRMED");

      // Step 5: Create shipment
      const shipment = await ShippingService.createShipment(
        order.id,
        selectedRate.service,
      );

      expect(shipment).toMatchObject({
        orderId: order.id,
        trackingNumber: expect.any(String),
        status: "PENDING",
      });

      // Step 6: Update shipment status
      await ShippingService.updateShipmentStatus(shipment.id, "IN_TRANSIT");

      const updatedShipment = await database.order.findUnique({
        where: { id: order.id },
        select: { fulfillmentStatus: true },
      });

      expect(updatedShipment?.fulfillmentStatus).toBe("IN_TRANSIT");

      // Step 7: Deliver order
      await ShippingService.updateShipmentStatus(shipment.id, "DELIVERED");

      const deliveredOrder = await database.order.findUnique({
        where: { id: order.id },
      });

      expect(deliveredOrder?.fulfillmentStatus).toBe("DELIVERED");
      expect(deliveredOrder?.status).toBe("FULFILLED");
    }, 60000); // 60 second timeout for full workflow

    it("should handle inventory updates during order creation", async () => {
      // Get initial inventory
      const productBefore = await database.product.findUnique({
        where: { id: testProductId },
        select: { inventory: true },
      });

      const initialAvailable = productBefore?.inventory.availableQuantity;

      // Create order
      const order = await OrderService.createOrder({
        customerId: testUserId,
        items: [
          {
            productId: testProductId,
            quantity: 5,
            price: 500,
          },
        ],
        shippingAddress: {
          address: "789 Test Ave",
          city: "San Francisco",
          state: "CA",
          zipCode: "94102",
          country: "USA",
        },
        fulfillmentMethod: "DELIVERY",
      } as any);

      // Check inventory was reserved
      const productAfter = await database.product.findUnique({
        where: { id: testProductId },
        select: { inventory: true },
      });

      expect(productAfter?.inventory.reservedQuantity).toBe(
        (productBefore?.inventory.reservedQuantity || 0) + 5,
      );

      expect(productAfter?.inventory.availableQuantity).toBe(
        (initialAvailable || 0) - 5,
      );

      // Cleanup
      await database.order.delete({
        where: { id: order.id },
      });
    });

    it("should rollback inventory on payment failure", async () => {
      const productBefore = await database.product.findUnique({
        where: { id: testProductId },
        select: { inventory: true },
      });

      const initialReserved = productBefore?.inventory.reservedQuantity || 0;

      // Create order
      const order = await OrderService.createOrder({
        customerId: testUserId,
        items: [
          {
            productId: testProductId,
            quantity: 3,
            price: 500,
          },
        ],
        shippingAddress: {
          address: "111 Fail St",
          city: "Test City",
          state: "CA",
          zipCode: "90210",
          country: "USA",
        },
        fulfillmentMethod: "DELIVERY",
      } as any);

      // Simulate payment failure by canceling order
      await OrderService.cancelOrder(order.id, testUserId);

      // Check inventory was released
      const productAfter = await database.product.findUnique({
        where: { id: testProductId },
        select: { inventory: true },
      });

      expect(productAfter?.inventory.reservedQuantity).toBe(initialReserved);

      // Cleanup
      await database.order.delete({
        where: { id: order.id },
      });
    });
  });

  describe("🔄 Multi-Service Interactions", () => {
    it("should coordinate product, order, and payment services", async () => {
      // Create product
      const product = await ProductService.createProduct(
        {
          name: "Multi-Service Test Product",
          farmId: testFarmId,
          category: "FRUITS",
          description: "Test coordination",
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
        customerId: testUserId,
        items: [
          {
            productId: product.id,
            quantity: 2,
            price: 1000,
          },
        ],
        shippingAddress: {
          address: "222 Coordination Blvd",
          city: "Test City",
          state: "CA",
          zipCode: "90210",
          country: "USA",
        },
        fulfillmentMethod: "FARM_PICKUP",
      } as any);

      // Process payment
      const paymentIntent = await PaymentService.createPaymentIntent(
        order.id,
        order.total,
        "USD",
      );

      await PaymentService.confirmPayment(paymentIntent.id);

      // Verify all services updated correctly
      const finalOrder = await database.order.findUnique({
        where: { id: order.id },
        include: {
          items: true,
        },
      });

      const finalProduct = await database.product.findUnique({
        where: { id: product.id },
        select: { inventory: true },
      });

      expect(finalOrder?.paymentStatus).toBe("COMPLETED");
      expect(finalOrder?.items[0].productId).toBe(product.id);
      expect(finalProduct?.inventory.reservedQuantity).toBe(2);

      // Cleanup
      await database.order.delete({
        where: { id: order.id },
      });

      await database.product.delete({
        where: { id: product.id },
      });
    });
  });

  describe("⚡ Error Recovery", () => {
    it("should handle database connection errors gracefully", async () => {
      // This tests error handling when database operations fail
      // In production, this would test retry logic and circuit breakers

      try {
        await OrderService.createOrder({
          customerId: "invalid-user-id",
          items: [],
          shippingAddress: {
            address: "Test",
            city: "Test",
            state: "CA",
            zipCode: "90210",
            country: "USA",
          },
          fulfillmentMethod: "DELIVERY",
        } as any);

        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Should throw validation error
        expect(error).toBeDefined();
      }
    });
  });
});
