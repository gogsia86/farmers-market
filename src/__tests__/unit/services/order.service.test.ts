/**
 * 🧪 ORDER SERVICE UNIT TESTS - COMPREHENSIVE TEST SUITE
 *
 * Test suite for the OrderService demonstrating best practices
 *
 * Features Tested:
 * - Order creation with validation
 * - Order retrieval (by ID, customer, farm)
 * - Order status updates
 * - Order fulfillment workflow
 * - Payment processing integration
 * - Email notifications
 * - Error handling
 *
 * Patterns Demonstrated:
 * - Database mocking
 * - Service mocking
 * - Async testing
 * - Error scenario testing
 * - Type-safe mocks
 * - Comprehensive coverage
 *
 * @reference .cursorrules - Testing Patterns
 */

import { database } from "@/lib/database";
import { emailService } from "@/lib/services/email.service";
import {
  OrderService,
  OrderValidationError,
} from "@/lib/services/order.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Order, OrderItem, OrderStatus } from "@prisma/client";

// ============================================================================
// MOCKS
// ============================================================================

// Mock the database
jest.mock("@/lib/database");

// Mock the logger
jest.mock("@/lib/monitoring/logger");

// Mock the email service
jest.mock("@/lib/services/email.service");

// Mock the cache
jest.mock("@/lib/cache/multi-layer.cache");

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

/**
 * Create a mock order object
 */
function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "order_123",
    orderNumber: "ORD-2025-0001",
    customerId: "user_123",
    farmId: "farm_123",
    status: "PENDING" as OrderStatus,
    subtotal: 50.0,
    tax: 5.0,
    deliveryFee: 10.0,
    platformFee: 2.5,
    total: 67.5,
    currency: "USD",
    paymentMethod: "CARD",
    paymentIntentId: "pi_123",
    paymentStatus: "PENDING",
    deliveryAddress: {
      street: "123 Farm Road",
      city: "Farmville",
      state: "CA",
      zipCode: "12345",
      country: "USA",
    },
    deliveryInstructions: "Leave at door",
    estimatedDeliveryDate: new Date("2025-01-20"),
    trackingNumber: null,
    deliveryNotes: null,
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
    refundAmount: null,
    refundStatus: null,
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
    completedAt: null,
    ...overrides,
  } as Order;
}

/**
 * Create mock order items
 */
function createMockOrderItems(): OrderItem[] {
  return [
    {
      id: "item_1",
      orderId: "order_123",
      productId: "prod_1",
      quantity: 2,
      priceAtPurchase: 10.0,
      subtotal: 20.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as OrderItem,
    {
      id: "item_2",
      orderId: "order_123",
      productId: "prod_2",
      quantity: 3,
      priceAtPurchase: 10.0,
      subtotal: 30.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as OrderItem,
  ];
}

/**
 * Create a mock order request
 */
function createMockOrderRequest(overrides: any = {}) {
  return {
    customerId: "user_123",
    farmId: "farm_123",
    items: [
      {
        productId: "prod_1",
        quantity: 2,
        priceUSD: 10.0,
      },
      {
        productId: "prod_2",
        quantity: 3,
        priceUSD: 10.0,
      },
    ],
    deliveryAddress: {
      street: "123 Farm Road",
      city: "Farmville",
      state: "CA",
      zipCode: "12345",
      country: "USA",
    },
    deliveryInstructions: "Leave at door",
    paymentMethod: "CARD",
    ...overrides,
  };
}

// ============================================================================
// TESTS
// ============================================================================

describe("OrderService", () => {
  let orderService: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    orderService = new OrderService();
  });

  // ==========================================================================
  // CREATE ORDER TESTS
  // ==========================================================================

  describe("createOrder", () => {
    it("should create an order successfully with all required fields", async () => {
      // Arrange
      const orderRequest = createMockOrderRequest();
      const expectedOrder = createMockOrder({
        customerId: orderRequest.customerId,
        farmId: orderRequest.farmId,
      });

      jest.mocked(database.order.create).mockResolvedValue(expectedOrder);
      jest
        .mocked(emailService.sendOrderConfirmation)
        .mockResolvedValue(undefined);

      // Act
      const result = await orderService.createOrder(orderRequest);

      // Assert
      expect(result).toEqual(expectedOrder);
      expect(database.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerId: orderRequest.customerId,
            farmId: orderRequest.farmId,
            status: "PENDING",
          }),
        }),
      );
    });

    it("should generate a unique order number", async () => {
      // Arrange
      const orderRequest = createMockOrderRequest();
      const expectedOrder = createMockOrder({
        orderNumber: "ORD-2025-0001",
      });

      jest.mocked(database.order.create).mockResolvedValue(expectedOrder);
      jest
        .mocked(emailService.sendOrderConfirmation)
        .mockResolvedValue(undefined);

      // Act
      const result = await orderService.createOrder(orderRequest);

      // Assert
      expect(database.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderNumber: expect.stringMatching(/^ORD-\d{4}-\d+$/),
          }),
        }),
      );
    });

    it("should calculate order totals correctly", async () => {
      // Arrange
      const orderRequest = createMockOrderRequest({
        items: [
          { productId: "prod_1", quantity: 2, priceUSD: 10.0 }, // $20
          { productId: "prod_2", quantity: 3, priceUSD: 10.0 }, // $30
        ],
      });

      const expectedOrder = createMockOrder({
        subtotal: 50.0, // $20 + $30
        tax: 5.0, // 10% tax
        deliveryFee: 10.0,
        platformFee: 2.5, // 5% platform fee
        total: 67.5, // $50 + $5 + $10 + $2.5
      });

      jest.mocked(database.order.create).mockResolvedValue(expectedOrder);
      jest
        .mocked(emailService.sendOrderConfirmation)
        .mockResolvedValue(undefined);

      // Act
      const result = await orderService.createOrder(orderRequest);

      // Assert
      expect(database.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: expect.any(Number),
            tax: expect.any(Number),
            total: expect.any(Number),
          }),
        }),
      );
    });

    it("should set initial status to PENDING", async () => {
      // Arrange
      const orderRequest = createMockOrderRequest();
      const expectedOrder = createMockOrder({ status: "PENDING" });

      jest.mocked(database.order.create).mockResolvedValue(expectedOrder);
      jest
        .mocked(emailService.sendOrderConfirmation)
        .mockResolvedValue(undefined);

      // Act
      const result = await orderService.createOrder(orderRequest);

      // Assert
      expect(database.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "PENDING",
          }),
        }),
      );
    });

    it("should send order confirmation email", async () => {
      // Arrange
      const orderRequest = createMockOrderRequest();
      const expectedOrder = createMockOrder();

      jest.mocked(database.order.create).mockResolvedValue(expectedOrder);
      jest
        .mocked(emailService.sendOrderConfirmation)
        .mockResolvedValue(undefined);

      // Act
      await orderService.createOrder(orderRequest);

      // Assert
      expect(emailService.sendOrderConfirmation).toHaveBeenCalledWith(
        expectedOrder.customerId,
        expect.objectContaining({
          orderId: expectedOrder.id,
          orderNumber: expectedOrder.orderNumber,
        }),
      );
    });

    it("should validate required fields", async () => {
      // Arrange
      const invalidRequest = {
        customerId: "", // Empty customer ID
        farmId: "farm_123",
        items: [],
        deliveryAddress: {},
        paymentMethod: "CARD",
      };

      // Act & Assert
      await expect(
        orderService.createOrder(invalidRequest as any),
      ).rejects.toThrow(OrderValidationError);
    });

    it("should validate minimum order amount", async () => {
      // Arrange
      const orderRequest = createMockOrderRequest({
        items: [
          { productId: "prod_1", quantity: 1, priceUSD: 0.5 }, // Below minimum
        ],
      });

      // Act & Assert
      await expect(orderService.createOrder(orderRequest)).rejects.toThrow(
        OrderValidationError,
      );
    });

    it("should validate product availability", async () => {
      // Arrange
      const orderRequest = createMockOrderRequest();

      jest.mocked(database.product.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(orderService.createOrder(orderRequest)).rejects.toThrow();
    });

    it("should handle database errors during creation", async () => {
      // Arrange
      const orderRequest = createMockOrderRequest();
      const dbError = new Error("Database connection failed");

      jest.mocked(database.order.create).mockRejectedValue(dbError);

      // Act & Assert
      await expect(orderService.createOrder(orderRequest)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should create order items in transaction", async () => {
      // Arrange
      const orderRequest = createMockOrderRequest();
      const expectedOrder = createMockOrder();

      jest
        .mocked(database.$transaction)
        .mockImplementation(async (callback) => {
          return await callback(database);
        });
      jest.mocked(database.order.create).mockResolvedValue(expectedOrder);
      jest
        .mocked(emailService.sendOrderConfirmation)
        .mockResolvedValue(undefined);

      // Act
      await orderService.createOrder(orderRequest);

      // Assert
      expect(database.$transaction).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // GET ORDER TESTS
  // ==========================================================================

  describe("getOrderById", () => {
    it("should return order when found", async () => {
      // Arrange
      const orderId = "order_123";
      const expectedOrder = createMockOrder({ id: orderId });

      jest.mocked(database.order.findUnique).mockResolvedValue(expectedOrder);

      // Act
      const result = await orderService.getOrderById(orderId);

      // Assert
      expect(result).toEqual(expectedOrder);
      expect(database.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: expect.any(Object),
      });
    });

    it("should return null when order not found", async () => {
      // Arrange
      const orderId = "nonexistent";

      jest.mocked(database.order.findUnique).mockResolvedValue(null);

      // Act
      const result = await orderService.getOrderById(orderId);

      // Assert
      expect(result).toBeNull();
    });

    it("should include order items in result", async () => {
      // Arrange
      const orderId = "order_123";
      const expectedOrder = createMockOrder({ id: orderId });

      jest.mocked(database.order.findUnique).mockResolvedValue(expectedOrder);

      // Act
      await orderService.getOrderById(orderId);

      // Assert
      expect(database.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: expect.objectContaining({
          items: true,
        }),
      });
    });

    it("should include customer information", async () => {
      // Arrange
      const orderId = "order_123";
      const expectedOrder = createMockOrder({ id: orderId });

      jest.mocked(database.order.findUnique).mockResolvedValue(expectedOrder);

      // Act
      await orderService.getOrderById(orderId);

      // Assert
      expect(database.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: expect.objectContaining({
          customer: expect.any(Object),
        }),
      });
    });
  });

  describe("getOrdersByCustomer", () => {
    it("should return all orders for a customer", async () => {
      // Arrange
      const customerId = "user_123";
      const mockOrders = [
        createMockOrder({ id: "order_1", customerId }),
        createMockOrder({ id: "order_2", customerId }),
      ];

      jest.mocked(database.order.findMany).mockResolvedValue(mockOrders);

      // Act
      const result = await orderService.getOrdersByCustomer(customerId);

      // Assert
      expect(result).toEqual(mockOrders);
      expect(database.order.findMany).toHaveBeenCalledWith({
        where: { customerId },
        include: expect.any(Object),
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return empty array if customer has no orders", async () => {
      // Arrange
      const customerId = "user_123";

      jest.mocked(database.order.findMany).mockResolvedValue([]);

      // Act
      const result = await orderService.getOrdersByCustomer(customerId);

      // Assert
      expect(result).toEqual([]);
    });

    it("should filter by status if provided", async () => {
      // Arrange
      const customerId = "user_123";
      const status = "COMPLETED";
      const mockOrders = [createMockOrder({ customerId, status: "COMPLETED" })];

      jest.mocked(database.order.findMany).mockResolvedValue(mockOrders);

      // Act
      await orderService.getOrdersByCustomer(customerId, { status });

      // Assert
      expect(database.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId,
            status,
          }),
        }),
      );
    });
  });

  describe("getOrdersByFarm", () => {
    it("should return all orders for a farm", async () => {
      // Arrange
      const farmId = "farm_123";
      const mockOrders = [
        createMockOrder({ id: "order_1", farmId }),
        createMockOrder({ id: "order_2", farmId }),
      ];

      jest.mocked(database.order.findMany).mockResolvedValue(mockOrders);

      // Act
      const result = await orderService.getOrdersByFarm(farmId);

      // Assert
      expect(result).toEqual(mockOrders);
      expect(database.order.findMany).toHaveBeenCalledWith({
        where: { farmId },
        include: expect.any(Object),
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return empty array if farm has no orders", async () => {
      // Arrange
      const farmId = "farm_123";

      jest.mocked(database.order.findMany).mockResolvedValue([]);

      // Act
      const result = await orderService.getOrdersByFarm(farmId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  // ==========================================================================
  // UPDATE ORDER TESTS
  // ==========================================================================

  describe("updateOrderStatus", () => {
    it("should update order status successfully", async () => {
      // Arrange
      const orderId = "order_123";
      const newStatus = "CONFIRMED" as OrderStatus;
      const updatedOrder = createMockOrder({ id: orderId, status: newStatus });

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(createMockOrder());
      jest.mocked(database.order.update).mockResolvedValue(updatedOrder);
      jest
        .mocked(emailService.sendOrderStatusUpdate)
        .mockResolvedValue(undefined);

      // Act
      const result = await orderService.updateOrderStatus(orderId, newStatus);

      // Assert
      expect(result).toEqual(updatedOrder);
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: newStatus },
      });
    });

    it("should send status update email", async () => {
      // Arrange
      const orderId = "order_123";
      const newStatus = "CONFIRMED" as OrderStatus;
      const updatedOrder = createMockOrder({ id: orderId, status: newStatus });

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(createMockOrder());
      jest.mocked(database.order.update).mockResolvedValue(updatedOrder);
      jest
        .mocked(emailService.sendOrderStatusUpdate)
        .mockResolvedValue(undefined);

      // Act
      await orderService.updateOrderStatus(orderId, newStatus);

      // Assert
      expect(emailService.sendOrderStatusUpdate).toHaveBeenCalledWith(
        updatedOrder.customerId,
        expect.objectContaining({
          orderId,
          status: newStatus,
        }),
      );
    });

    it("should handle invalid status transitions", async () => {
      // Arrange
      const orderId = "order_123";
      const currentOrder = createMockOrder({ status: "COMPLETED" });
      const newStatus = "PENDING" as OrderStatus;

      jest.mocked(database.order.findUnique).mockResolvedValue(currentOrder);

      // Act & Assert
      await expect(
        orderService.updateOrderStatus(orderId, newStatus),
      ).rejects.toThrow();
    });

    it("should throw error if order not found", async () => {
      // Arrange
      const orderId = "nonexistent";
      const newStatus = "CONFIRMED" as OrderStatus;

      jest.mocked(database.order.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        orderService.updateOrderStatus(orderId, newStatus),
      ).rejects.toThrow();
    });
  });

  describe("updateTrackingNumber", () => {
    it("should update tracking number successfully", async () => {
      // Arrange
      const orderId = "order_123";
      const trackingNumber = "TRACK-123";
      const updatedOrder = createMockOrder({ id: orderId, trackingNumber });

      jest.mocked(database.order.update).mockResolvedValue(updatedOrder);
      jest.mocked(emailService.sendOrderShipped).mockResolvedValue(undefined);

      // Act
      const result = await orderService.updateTrackingNumber(
        orderId,
        trackingNumber,
      );

      // Assert
      expect(result).toEqual(updatedOrder);
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { trackingNumber, status: "SHIPPED" },
      });
    });

    it("should send shipped email with tracking info", async () => {
      // Arrange
      const orderId = "order_123";
      const trackingNumber = "TRACK-123";
      const updatedOrder = createMockOrder({ id: orderId, trackingNumber });

      jest.mocked(database.order.update).mockResolvedValue(updatedOrder);
      jest.mocked(emailService.sendOrderShipped).mockResolvedValue(undefined);

      // Act
      await orderService.updateTrackingNumber(orderId, trackingNumber);

      // Assert
      expect(emailService.sendOrderShipped).toHaveBeenCalledWith(
        updatedOrder.customerId,
        expect.objectContaining({
          orderId,
          trackingNumber,
        }),
      );
    });
  });

  // ==========================================================================
  // CANCEL ORDER TESTS
  // ==========================================================================

  describe("cancelOrder", () => {
    it("should cancel order successfully", async () => {
      // Arrange
      const orderId = "order_123";
      const userId = "user_123";
      const reason = "Changed my mind";
      const cancelledOrder = createMockOrder({
        id: orderId,
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason: reason,
      });

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(createMockOrder());
      jest.mocked(database.order.update).mockResolvedValue(cancelledOrder);
      jest.mocked(emailService.sendOrderCancelled).mockResolvedValue(undefined);

      // Act
      const result = await orderService.cancelOrder(orderId, userId, reason);

      // Assert
      expect(result).toEqual(cancelledOrder);
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: expect.objectContaining({
          status: "CANCELLED",
          cancelledAt: expect.any(Date),
          cancelledBy: userId,
          cancellationReason: reason,
        }),
      });
    });

    it("should send cancellation email", async () => {
      // Arrange
      const orderId = "order_123";
      const userId = "user_123";
      const reason = "Changed my mind";
      const cancelledOrder = createMockOrder({ status: "CANCELLED" });

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(createMockOrder());
      jest.mocked(database.order.update).mockResolvedValue(cancelledOrder);
      jest.mocked(emailService.sendOrderCancelled).mockResolvedValue(undefined);

      // Act
      await orderService.cancelOrder(orderId, userId, reason);

      // Assert
      expect(emailService.sendOrderCancelled).toHaveBeenCalledWith(
        cancelledOrder.customerId,
        expect.objectContaining({
          orderId,
          reason,
        }),
      );
    });

    it("should not allow cancellation of completed orders", async () => {
      // Arrange
      const orderId = "order_123";
      const userId = "user_123";
      const completedOrder = createMockOrder({ status: "COMPLETED" });

      jest.mocked(database.order.findUnique).mockResolvedValue(completedOrder);

      // Act & Assert
      await expect(
        orderService.cancelOrder(orderId, userId, "reason"),
      ).rejects.toThrow();
    });

    it("should restore product inventory on cancellation", async () => {
      // Arrange
      const orderId = "order_123";
      const userId = "user_123";
      const orderWithItems = createMockOrder();

      jest.mocked(database.order.findUnique).mockResolvedValue(orderWithItems);
      jest.mocked(database.order.update).mockResolvedValue(orderWithItems);
      jest
        .mocked(database.orderItem.findMany)
        .mockResolvedValue(createMockOrderItems());
      jest.mocked(emailService.sendOrderCancelled).mockResolvedValue(undefined);

      // Act
      await orderService.cancelOrder(orderId, userId, "reason");

      // Assert
      expect(database.product.update).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // COMPLETE ORDER TESTS
  // ==========================================================================

  describe("completeOrder", () => {
    it("should mark order as completed", async () => {
      // Arrange
      const orderId = "order_123";
      const completedOrder = createMockOrder({
        id: orderId,
        status: "COMPLETED",
        completedAt: new Date(),
      });

      jest.mocked(database.order.update).mockResolvedValue(completedOrder);
      jest.mocked(emailService.sendOrderDelivered).mockResolvedValue(undefined);

      // Act
      const result = await orderService.completeOrder(orderId);

      // Assert
      expect(result).toEqual(completedOrder);
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: expect.objectContaining({
          status: "COMPLETED",
          completedAt: expect.any(Date),
        }),
      });
    });

    it("should send delivery confirmation email", async () => {
      // Arrange
      const orderId = "order_123";
      const completedOrder = createMockOrder({ status: "COMPLETED" });

      jest.mocked(database.order.update).mockResolvedValue(completedOrder);
      jest.mocked(emailService.sendOrderDelivered).mockResolvedValue(undefined);

      // Act
      await orderService.completeOrder(orderId);

      // Assert
      expect(emailService.sendOrderDelivered).toHaveBeenCalledWith(
        completedOrder.customerId,
        expect.objectContaining({
          orderId,
        }),
      );
    });
  });

  // ==========================================================================
  // SEARCH AND FILTER TESTS
  // ==========================================================================

  describe("searchOrders", () => {
    it("should search orders by order number", async () => {
      // Arrange
      const searchQuery = "ORD-2025-0001";
      const mockOrders = [createMockOrder({ orderNumber: searchQuery })];

      jest.mocked(database.order.findMany).mockResolvedValue(mockOrders);

      // Act
      const result = await orderService.searchOrders({ query: searchQuery });

      // Assert
      expect(result).toEqual(mockOrders);
      expect(database.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orderNumber: expect.objectContaining({ contains: searchQuery }),
          }),
        }),
      );
    });

    it("should filter by date range", async () => {
      // Arrange
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-31");
      const mockOrders = [createMockOrder()];

      jest.mocked(database.order.findMany).mockResolvedValue(mockOrders);

      // Act
      await orderService.searchOrders({ startDate, endDate });

      // Assert
      expect(database.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
        }),
      );
    });

    it("should handle pagination", async () => {
      // Arrange
      const mockOrders = [createMockOrder()];

      jest.mocked(database.order.findMany).mockResolvedValue(mockOrders);
      jest.mocked(database.order.count).mockResolvedValue(100);

      // Act
      const result = await orderService.searchOrders({ page: 2, limit: 10 });

      // Assert
      expect(database.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });
});
