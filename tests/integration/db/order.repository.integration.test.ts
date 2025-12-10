/**
 * 🧪 ORDER REPOSITORY INTEGRATION TESTS
 *
 * True integration tests that run against a real PostgreSQL database.
 * Tests actual Prisma operations, database constraints, and data persistence.
 *
 * @pattern True Integration Testing with Testcontainers
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import {
  PrismaClient,
  OrderStatus,
  PaymentStatus,
  FulfillmentMethod,
} from "@prisma/client";
import {
  getTestPrismaClient,
  cleanTestDatabase,
} from "../setup/testcontainers";
import { TEST_IDS, seedMinimalTestData } from "../fixtures/seed";

// Test database client
let prisma: PrismaClient;

/**
 * Helper function to create valid order data with all required fields
 */
function createOrderData(
  overrides: Partial<{
    orderNumber: string;
    customerId: string;
    farmId: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    platformFee: number;
    farmerAmount: number;
    total: number;
    fulfillmentMethod: FulfillmentMethod;
    shippingAddress: object;
  }> = {},
) {
  const subtotal = overrides.subtotal ?? 14.97;
  const tax = overrides.tax ?? 1.35;
  const deliveryFee = overrides.deliveryFee ?? 5.0;
  const platformFee = overrides.platformFee ?? 1.5;
  const farmerAmount = overrides.farmerAmount ?? subtotal - platformFee;
  const total = overrides.total ?? subtotal + tax + deliveryFee;

  return {
    orderNumber:
      overrides.orderNumber ??
      `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    customerId: overrides.customerId ?? TEST_IDS.CUSTOMER_USER_1,
    farmId: overrides.farmId ?? TEST_IDS.FARM_1,
    status: overrides.status ?? ("PENDING" as OrderStatus),
    paymentStatus: overrides.paymentStatus ?? ("PENDING" as PaymentStatus),
    subtotal,
    tax,
    deliveryFee,
    platformFee,
    farmerAmount,
    total,
    fulfillmentMethod:
      overrides.fulfillmentMethod ?? ("DELIVERY" as FulfillmentMethod),
    shippingAddress: overrides.shippingAddress ?? {
      fullName: "Jane Customer",
      addressLine1: "123 Test St",
      city: "Testville",
      state: "CA",
      postalCode: "90210",
      country: "US",
    },
  };
}

/**
 * Helper function to create valid order item data
 */
function createOrderItemData(
  overrides: Partial<{
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }> = {},
) {
  const quantity = overrides.quantity ?? 1;
  const unitPrice = overrides.unitPrice ?? 4.99;
  return {
    productId: overrides.productId ?? TEST_IDS.PRODUCT_TOMATOES,
    productName: overrides.productName ?? "Test Product",
    quantity,
    unit: overrides.unit ?? "lb",
    unitPrice,
    subtotal: overrides.subtotal ?? quantity * unitPrice,
  };
}

describe("🔗 Order Repository Integration Tests", () => {
  beforeAll(async () => {
    // Get the test Prisma client (connected to testcontainer)
    prisma = await getTestPrismaClient();
  });

  beforeEach(async () => {
    // Clean and reseed before each test for isolation
    await cleanTestDatabase();
    await seedMinimalTestData(prisma);
  });

  afterAll(async () => {
    // Cleanup handled by global teardown
  });

  describe("📦 Order Creation", () => {
    it("should create an order with items in the database", async () => {
      // Arrange
      const orderData = createOrderData();

      // Act
      const createdOrder = await prisma.order.create({
        data: {
          ...orderData,
          items: {
            create: [
              createOrderItemData({
                productId: TEST_IDS.PRODUCT_TOMATOES,
                productName: "Test Organic Tomatoes",
                quantity: 2,
                unitPrice: 4.99,
              }),
              createOrderItemData({
                productId: TEST_IDS.PRODUCT_LETTUCE,
                productName: "Test Fresh Lettuce",
                quantity: 1,
                unitPrice: 2.99,
              }),
            ],
          },
        },
        include: {
          items: true,
          customer: true,
          farm: true,
        },
      });

      // Assert - Verify order was created
      expect(createdOrder).toBeDefined();
      expect(createdOrder.id).toBeDefined();
      expect(createdOrder.orderNumber).toBe(orderData.orderNumber);
      expect(createdOrder.status).toBe("PENDING");
      expect(createdOrder.paymentStatus).toBe("PENDING");

      // Assert - Verify order items
      expect(createdOrder.items).toHaveLength(2);

      // Assert - Verify relationships are loaded
      expect(createdOrder.customer).toBeDefined();
      expect(createdOrder.farm).toBeDefined();

      // Assert - Verify data persisted to database
      const retrievedOrder = await prisma.order.findUnique({
        where: { id: createdOrder.id },
        include: { items: true },
      });

      expect(retrievedOrder).not.toBeNull();
      expect(retrievedOrder?.items).toHaveLength(2);
    });

    it("should enforce foreign key constraint for customer", async () => {
      // Arrange
      const invalidCustomerId = "non-existent-customer-id";

      // Act & Assert
      await expect(
        prisma.order.create({
          data: createOrderData({ customerId: invalidCustomerId }),
        }),
      ).rejects.toThrow();
    });

    it("should enforce foreign key constraint for farm", async () => {
      // Arrange
      const invalidFarmId = "non-existent-farm-id";

      // Act & Assert
      await expect(
        prisma.order.create({
          data: createOrderData({ farmId: invalidFarmId }),
        }),
      ).rejects.toThrow();
    });

    it("should generate unique order IDs", async () => {
      // Act
      const order1 = await prisma.order.create({
        data: createOrderData({ orderNumber: "UNIQUE-TEST-001" }),
      });

      const order2 = await prisma.order.create({
        data: createOrderData({ orderNumber: "UNIQUE-TEST-002" }),
      });

      // Assert
      expect(order1.id).not.toBe(order2.id);
      expect(order1.orderNumber).not.toBe(order2.orderNumber);
    });
  });

  describe("📖 Order Retrieval", () => {
    let testOrderId: string;

    beforeEach(async () => {
      // Create a test order for retrieval tests
      const order = await prisma.order.create({
        data: {
          ...createOrderData({ orderNumber: "RETRIEVAL-TEST-001" }),
          items: {
            create: [
              createOrderItemData({
                productId: TEST_IDS.PRODUCT_TOMATOES,
                productName: "Test Organic Tomatoes",
              }),
            ],
          },
        },
      });
      testOrderId = order.id;
    });

    it("should find order by ID with related data", async () => {
      // Act
      const order = await prisma.order.findUnique({
        where: { id: testOrderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          farm: true,
        },
      });

      // Assert
      expect(order).not.toBeNull();
      expect(order?.id).toBe(testOrderId);
      expect(order?.items).toHaveLength(1);
      expect(order?.customer).toBeDefined();
      expect(order?.farm).toBeDefined();
    });

    it("should find orders by customer ID", async () => {
      // Act
      const orders = await prisma.order.findMany({
        where: { customerId: TEST_IDS.CUSTOMER_USER_1 },
        orderBy: { createdAt: "desc" },
      });

      // Assert
      expect(orders.length).toBeGreaterThanOrEqual(1);
      expect(
        orders.every((o) => o.customerId === TEST_IDS.CUSTOMER_USER_1),
      ).toBe(true);
    });

    it("should find orders by farm ID", async () => {
      // Act
      const orders = await prisma.order.findMany({
        where: { farmId: TEST_IDS.FARM_1 },
      });

      // Assert
      expect(orders.length).toBeGreaterThanOrEqual(1);
    });

    it("should find orders by status", async () => {
      // Create another order with CONFIRMED status
      await prisma.order.create({
        data: createOrderData({
          orderNumber: "STATUS-TEST-001",
          status: "CONFIRMED",
        }),
      });

      // Act
      const pendingOrders = await prisma.order.findMany({
        where: { status: "PENDING" },
      });
      const confirmedOrders = await prisma.order.findMany({
        where: { status: "CONFIRMED" },
      });

      // Assert
      expect(pendingOrders.length).toBeGreaterThanOrEqual(1);
      expect(confirmedOrders.length).toBeGreaterThanOrEqual(1);
      expect(pendingOrders.every((o) => o.status === "PENDING")).toBe(true);
      expect(confirmedOrders.every((o) => o.status === "CONFIRMED")).toBe(true);
    });

    it("should return null for non-existent order ID", async () => {
      // Act
      const order = await prisma.order.findUnique({
        where: { id: "non-existent-order-id" },
      });

      // Assert
      expect(order).toBeNull();
    });
  });

  describe("📝 Order Updates", () => {
    let testOrderId: string;

    beforeEach(async () => {
      const order = await prisma.order.create({
        data: createOrderData({ orderNumber: "UPDATE-TEST-001" }),
      });
      testOrderId = order.id;
    });

    it("should update order status", async () => {
      // Act
      const updatedOrder = await prisma.order.update({
        where: { id: testOrderId },
        data: { status: "CONFIRMED" },
      });

      // Assert
      expect(updatedOrder.status).toBe("CONFIRMED");

      // Verify persistence
      const retrieved = await prisma.order.findUnique({
        where: { id: testOrderId },
      });
      expect(retrieved?.status).toBe("CONFIRMED");
    });

    it("should update payment status", async () => {
      // Act
      const updatedOrder = await prisma.order.update({
        where: { id: testOrderId },
        data: { paymentStatus: "PAID" },
      });

      // Assert
      expect(updatedOrder.paymentStatus).toBe("PAID");
    });

    it("should update multiple fields atomically", async () => {
      // Act
      const updatedOrder = await prisma.order.update({
        where: { id: testOrderId },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
        },
      });

      // Assert
      expect(updatedOrder.status).toBe("CONFIRMED");
      expect(updatedOrder.paymentStatus).toBe("PAID");
    });

    it("should update updatedAt timestamp on modification", async () => {
      // Arrange
      const originalOrder = await prisma.order.findUnique({
        where: { id: testOrderId },
      });

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Act
      const updatedOrder = await prisma.order.update({
        where: { id: testOrderId },
        data: { status: "CONFIRMED" },
      });

      // Assert
      expect(updatedOrder.updatedAt.getTime()).toBeGreaterThan(
        originalOrder!.updatedAt.getTime(),
      );
    });
  });

  describe("🗑️ Order Deletion", () => {
    it("should delete order and cascade to order items", async () => {
      // Arrange
      const order = await prisma.order.create({
        data: {
          ...createOrderData({ orderNumber: "DELETE-TEST-001" }),
          items: {
            create: [
              createOrderItemData({
                productId: TEST_IDS.PRODUCT_TOMATOES,
                productName: "Test Product",
              }),
            ],
          },
        },
        include: { items: true },
      });
      const orderItemId = order.items![0].id;

      // Act
      await prisma.order.delete({
        where: { id: order.id },
      });

      // Assert - Order should be deleted
      const deletedOrder = await prisma.order.findUnique({
        where: { id: order.id },
      });
      expect(deletedOrder).toBeNull();

      // Assert - Order items should be cascade deleted
      const deletedItem = await prisma.orderItem.findUnique({
        where: { id: orderItemId },
      });
      expect(deletedItem).toBeNull();
    });

    it("should throw error when deleting non-existent order", async () => {
      // Act & Assert
      await expect(
        prisma.order.delete({
          where: { id: "non-existent-order-id" },
        }),
      ).rejects.toThrow();
    });
  });

  describe("🔄 Order Status Transitions", () => {
    it("should support valid status flow: PENDING -> CONFIRMED -> PREPARING -> READY -> FULFILLED -> COMPLETED", async () => {
      // Arrange
      const order = await prisma.order.create({
        data: createOrderData({
          orderNumber: "STATUS-FLOW-001",
          status: "PENDING",
        }),
      });

      // Act & Assert - Walk through status transitions
      const statuses: OrderStatus[] = [
        "CONFIRMED",
        "PREPARING",
        "READY",
        "FULFILLED",
        "COMPLETED",
      ];

      for (const status of statuses) {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: { status },
        });
        expect(updated.status).toBe(status);
      }
    });

    it("should allow cancellation from PENDING status", async () => {
      // Arrange
      const order = await prisma.order.create({
        data: createOrderData({
          orderNumber: "CANCEL-TEST-001",
          status: "PENDING",
        }),
      });

      // Act
      const cancelled = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          paymentStatus: "REFUNDED",
        },
      });

      // Assert
      expect(cancelled.status).toBe("CANCELLED");
      expect(cancelled.paymentStatus).toBe("REFUNDED");
    });
  });

  describe("📊 Order Aggregations", () => {
    beforeEach(async () => {
      // Create multiple orders for aggregation tests
      await prisma.order.createMany({
        data: [
          createOrderData({
            orderNumber: "AGG-001",
            status: "COMPLETED",
            paymentStatus: "PAID",
            subtotal: 100,
            total: 110,
            platformFee: 10,
            farmerAmount: 90,
          }),
          createOrderData({
            orderNumber: "AGG-002",
            customerId: TEST_IDS.CUSTOMER_USER_1,
            farmId: TEST_IDS.FARM_2,
            status: "COMPLETED",
            paymentStatus: "PAID",
            subtotal: 200,
            total: 220,
            platformFee: 20,
            farmerAmount: 180,
          }),
          createOrderData({
            orderNumber: "AGG-003",
            customerId: TEST_IDS.CUSTOMER_USER_2,
            farmId: TEST_IDS.FARM_2,
            status: "PENDING",
            paymentStatus: "PENDING",
            subtotal: 50,
            total: 55,
            platformFee: 5,
            farmerAmount: 45,
          }),
        ],
      });
    });

    it("should count orders by status", async () => {
      // Act
      const completedCount = await prisma.order.count({
        where: { status: "COMPLETED" },
      });
      const pendingCount = await prisma.order.count({
        where: { status: "PENDING" },
      });

      // Assert
      expect(completedCount).toBeGreaterThanOrEqual(2);
      expect(pendingCount).toBeGreaterThanOrEqual(1);
    });

    it("should aggregate order totals", async () => {
      // Act
      const aggregation = await prisma.order.aggregate({
        where: {
          status: "COMPLETED",
          paymentStatus: "PAID",
        },
        _sum: {
          total: true,
          subtotal: true,
        },
        _avg: {
          total: true,
        },
        _count: true,
      });

      // Assert
      expect(aggregation._count).toBeGreaterThanOrEqual(2);
      expect(aggregation._sum?.total).toBeDefined();
      expect(aggregation._avg?.total).toBeDefined();
    });

    it("should group orders by farm", async () => {
      // Act
      const groupedOrders = await prisma.order.groupBy({
        by: ["farmId"],
        _count: {
          id: true,
        },
        _sum: {
          total: true,
        },
      });

      // Assert
      expect(groupedOrders.length).toBeGreaterThanOrEqual(1);
      expect(groupedOrders[0]._count.id).toBeGreaterThanOrEqual(1);
    });
  });

  describe("🔒 Transaction Support", () => {
    it("should create order with items in a transaction", async () => {
      // Act
      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: createOrderData({ orderNumber: "TX-TEST-001" }),
        });

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: TEST_IDS.PRODUCT_TOMATOES,
            productName: "Tomatoes",
            quantity: 3,
            unit: "lb",
            unitPrice: 4.99,
            subtotal: 14.97,
          },
        });

        return order;
      });

      // Assert
      expect(result.id).toBeDefined();

      const orderWithItems = await prisma.order.findUnique({
        where: { id: result.id },
        include: { items: true },
      });
      expect(orderWithItems?.items).toHaveLength(1);
    });

    it("should rollback transaction on error", async () => {
      // Arrange
      const orderNumber = `TX-ROLLBACK-${Date.now()}`;

      // Act
      try {
        await prisma.$transaction(async (tx) => {
          await tx.order.create({
            data: createOrderData({
              orderNumber,
              customerId: TEST_IDS.CUSTOMER_USER_1,
            }),
          });

          // This should fail due to invalid reference
          throw new Error("Intentional error to trigger rollback");
        });
      } catch (_error) {
        // Expected error
      }

      // Assert - Order should not exist due to rollback
      const order = await prisma.order.findFirst({
        where: { orderNumber },
      });
      expect(order).toBeNull();
    });
  });

  describe("⚡ Performance Tests", () => {
    it("should handle bulk order creation efficiently", async () => {
      // Arrange
      const orderCount = 10;
      const orders = Array.from({ length: orderCount }, (_, i) =>
        createOrderData({
          orderNumber: `BULK-${Date.now()}-${i}`,
          status: "PENDING",
        }),
      );

      // Act
      const startTime = Date.now();
      await prisma.order.createMany({
        data: orders,
      });
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      const count = await prisma.order.count({
        where: {
          orderNumber: {
            startsWith: "BULK-",
          },
        },
      });
      expect(count).toBe(orderCount);
    });

    it("should efficiently query with pagination", async () => {
      // Act
      const startTime = Date.now();
      const page1 = await prisma.order.findMany({
        take: 5,
        skip: 0,
        orderBy: { createdAt: "desc" },
      });
      const _page2 = await prisma.order.findMany({
        take: 5,
        skip: 5,
        orderBy: { createdAt: "desc" },
      });
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(page1.length).toBeLessThanOrEqual(5);
    });
  });
});
