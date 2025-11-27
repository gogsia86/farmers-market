/**
 * 🧪 ORDER SERVICE TEST SUITE
 * Comprehensive unit tests for OrderService
 * Coverage: Order creation, updates, cancellation, validation, calculations
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { OrderService } from "../order.service";
import { database } from "@/lib/database";
import type {
  CreateOrderRequest,
  UpdateOrderRequest,
  CancelOrderRequest
} from "@/types";
import { OrderStatus, PaymentStatus, FulfillmentMethod } from "@prisma/client";

// Mock database
jest.mock("@/lib/database", () => ({
  database: {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    farm: {
      findUnique: jest.fn(),
    },
    orderItem: {
      createMany: jest.fn(),
    },
    fulfillment: {
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe("OrderService", () => {
  let orderService: OrderService;

  // Mock data
  const mockUserId = "user_123";
  const mockFarmId = "farm_456";
  const mockProductId = "product_789";
  const mockOrderId = "order_abc";

  const mockUser = {
    id: mockUserId,
    email: "customer@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "CONSUMER" as const,
    status: "ACTIVE" as const,
  };

  const mockFarm = {
    id: mockFarmId,
    name: "Green Valley Farm",
    ownerId: "farmer_123",
    status: "ACTIVE" as const,
  };

  const mockProduct = {
    id: mockProductId,
    name: "Organic Tomatoes",
    price: 5.99,
    quantityAvailable: 100,
    status: "ACTIVE" as const,
    farmId: mockFarmId,
  };

  const mockAddress = {
    id: "address_123",
    street: "123 Main St",
    city: "Farmville",
    state: "CA",
    zipCode: "12345",
    userId: mockUserId,
  };

  const mockOrder = {
    id: mockOrderId,
    orderNumber: "ORD-20241127-001",
    customerId: mockUserId,
    farmId: mockFarmId,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    fulfillmentMethod: FulfillmentMethod.PICKUP,
    subtotal: 29.95,
    deliveryFee: 0,
    platformFee: 2.995,
    tax: 2.396,
    totalAmount: 35.341,
    farmerAmount: 26.955,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: mockUser,
    farm: mockFarm,
    items: [
      {
        id: "item_1",
        orderId: mockOrderId,
        productId: mockProductId,
        quantity: 5,
        priceAtPurchase: 5.99,
        subtotal: 29.95,
      },
    ],
    fulfillment: {
      id: "fulfillment_1",
      orderId: mockOrderId,
      status: "PENDING" as const,
      method: FulfillmentMethod.PICKUP,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    orderService = new OrderService();
  });

  // ==================== CREATE ORDER TESTS ====================
  describe("createOrder", () => {
    const validCreateRequest: CreateOrderRequest = {
      customerId: mockUserId,
      farmId: mockFarmId,
      items: [
        {
          productId: mockProductId,
          quantity: 5,
        },
      ],
      fulfillmentMethod: FulfillmentMethod.PICKUP,
      deliveryAddressId: undefined,
    };

    it("should create order successfully with valid data", async () => {
      // Setup mocks
      (database.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);
      (database.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);
      (database.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(database);
      });
      (database.order.create as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.createOrder(validCreateRequest);

      expect(result).toBeDefined();
      expect(result.orderNumber).toBeDefined();
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(database.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
      expect(database.farm.findUnique).toHaveBeenCalledWith({
        where: { id: mockFarmId },
      });
      expect(database.product.findMany).toHaveBeenCalled();
    });

    it("should throw error when customer not found", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(orderService.createOrder(validCreateRequest)).rejects.toThrow(
        "Customer not found"
      );
    });

    it("should throw error when farm not found", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(orderService.createOrder(validCreateRequest)).rejects.toThrow(
        "Farm not found"
      );
    });

    it("should throw error when product not found", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);
      (database.product.findMany as jest.Mock).mockResolvedValue([]);

      await expect(orderService.createOrder(validCreateRequest)).rejects.toThrow(
        "Product not found"
      );
    });

    it("should throw error when product is inactive", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);
      (database.product.findMany as jest.Mock).mockResolvedValue([
        { ...mockProduct, status: "INACTIVE" },
      ]);

      await expect(orderService.createOrder(validCreateRequest)).rejects.toThrow(
        "Product is not available"
      );
    });

    it("should throw error when insufficient inventory", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);
      (database.product.findMany as jest.Mock).mockResolvedValue([
        { ...mockProduct, quantityAvailable: 2 },
      ]);

      await expect(orderService.createOrder(validCreateRequest)).rejects.toThrow(
        "Insufficient inventory"
      );
    });

    it("should require delivery address when method is DELIVERY", async () => {
      const deliveryRequest = {
        ...validCreateRequest,
        fulfillmentMethod: FulfillmentMethod.DELIVERY,
        deliveryAddressId: undefined,
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);

      await expect(orderService.createOrder(deliveryRequest)).rejects.toThrow(
        "Delivery address required"
      );
    });

    it("should decrement product inventory after order creation", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);
      (database.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);
      (database.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(database);
      });
      (database.order.create as jest.Mock).mockResolvedValue(mockOrder);

      await orderService.createOrder(validCreateRequest);

      expect(database.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: {
          quantityAvailable: {
            decrement: 5,
          },
        },
      });
    });

    it("should throw error when order items array is empty", async () => {
      const invalidRequest = {
        ...validCreateRequest,
        items: [],
      };

      await expect(orderService.createOrder(invalidRequest)).rejects.toThrow(
        "Order must contain at least one item"
      );
    });

    it("should throw error when quantity is zero or negative", async () => {
      const invalidRequest = {
        ...validCreateRequest,
        items: [{ productId: mockProductId, quantity: 0 }],
      };

      await expect(orderService.createOrder(invalidRequest)).rejects.toThrow(
        "Quantity must be positive"
      );
    });
  });

  // ==================== UPDATE ORDER TESTS ====================
  describe("updateOrder", () => {
    const validUpdateRequest: UpdateOrderRequest = {
      status: OrderStatus.CONFIRMED,
    };

    it("should update order status successfully", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (database.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      });

      const result = await orderService.updateOrder(
        mockOrderId,
        validUpdateRequest
      );

      expect(result.status).toBe(OrderStatus.CONFIRMED);
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        data: expect.objectContaining({
          status: OrderStatus.CONFIRMED,
        }),
        include: expect.any(Object),
      });
    });

    it("should throw error when order not found", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        orderService.updateOrder(mockOrderId, validUpdateRequest)
      ).rejects.toThrow("Order not found");
    });

    it("should allow valid status transitions", async () => {
      const validTransitions = [
        { from: OrderStatus.PENDING, to: OrderStatus.CONFIRMED },
        { from: OrderStatus.CONFIRMED, to: OrderStatus.PREPARING },
        { from: OrderStatus.PREPARING, to: OrderStatus.READY },
        { from: OrderStatus.READY, to: OrderStatus.FULFILLED },
        { from: OrderStatus.FULFILLED, to: OrderStatus.COMPLETED },
      ];

      for (const transition of validTransitions) {
        (database.order.findUnique as jest.Mock).mockResolvedValue({
          ...mockOrder,
          status: transition.from,
        });
        (database.order.update as jest.Mock).mockResolvedValue({
          ...mockOrder,
          status: transition.to,
        });

        await expect(
          orderService.updateOrder(mockOrderId, { status: transition.to })
        ).resolves.not.toThrow();
      }
    });

    it("should reject invalid status transitions", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.COMPLETED,
      });

      await expect(
        orderService.updateOrder(mockOrderId, { status: OrderStatus.PENDING })
      ).rejects.toThrow("Invalid status transition");
    });

    it("should allow cancellation from any status except COMPLETED", async () => {
      const cancellableStatuses = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.FULFILLED,
      ];

      for (const status of cancellableStatuses) {
        (database.order.findUnique as jest.Mock).mockResolvedValue({
          ...mockOrder,
          status,
        });
        (database.order.update as jest.Mock).mockResolvedValue({
          ...mockOrder,
          status: OrderStatus.CANCELLED,
        });

        await expect(
          orderService.updateOrder(mockOrderId, { status: OrderStatus.CANCELLED })
        ).resolves.not.toThrow();
      }
    });
  });

  // ==================== CANCEL ORDER TESTS ====================
  describe("cancelOrder", () => {
    const cancelRequest: CancelOrderRequest = {
      reason: "Customer requested cancellation",
      cancelledBy: mockUserId,
    };

    it("should cancel order and restore inventory", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (database.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(database);
      });
      (database.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      });

      const result = await orderService.cancelOrder(mockOrderId, cancelRequest);

      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(database.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: {
          quantityAvailable: {
            increment: 5,
          },
        },
      });
    });

    it("should throw error when order not found", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        orderService.cancelOrder(mockOrderId, cancelRequest)
      ).rejects.toThrow("Order not found");
    });

    it("should throw error when order already cancelled", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      });

      await expect(
        orderService.cancelOrder(mockOrderId, cancelRequest)
      ).rejects.toThrow("Order is already cancelled");
    });

    it("should throw error when order already completed", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.COMPLETED,
      });

      await expect(
        orderService.cancelOrder(mockOrderId, cancelRequest)
      ).rejects.toThrow("Cannot cancel completed order");
    });

    it("should indicate refund needed when payment was successful", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        paymentStatus: PaymentStatus.PAID,
      });
      (database.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(database);
      });
      (database.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
        refundStatus: "PENDING",
      });

      const result = await orderService.cancelOrder(mockOrderId, cancelRequest);

      expect(result.refundStatus).toBe("PENDING");
    });
  });

  // ==================== GET ORDERS TESTS ====================
  describe("getOrders", () => {
    it("should retrieve orders with pagination", async () => {
      (database.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
      (database.order.count as jest.Mock).mockResolvedValue(1);

      const result = await orderService.getOrders({
        page: 1,
        limit: 10,
      });

      expect(result.orders).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("should filter orders by status", async () => {
      (database.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
      (database.order.count as jest.Mock).mockResolvedValue(1);

      await orderService.getOrders({
        page: 1,
        limit: 10,
        status: OrderStatus.PENDING,
      });

      expect(database.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: OrderStatus.PENDING,
          }),
        })
      );
    });

    it("should filter orders by customer ID", async () => {
      (database.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
      (database.order.count as jest.Mock).mockResolvedValue(1);

      await orderService.getOrders({
        page: 1,
        limit: 10,
        customerId: mockUserId,
      });

      expect(database.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId: mockUserId,
          }),
        })
      );
    });

    it("should filter orders by farm ID", async () => {
      (database.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
      (database.order.count as jest.Mock).mockResolvedValue(1);

      await orderService.getOrders({
        page: 1,
        limit: 10,
        farmId: mockFarmId,
      });

      expect(database.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            farmId: mockFarmId,
          }),
        })
      );
    });

    it("should filter orders by date range", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-12-31");

      (database.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
      (database.order.count as jest.Mock).mockResolvedValue(1);

      await orderService.getOrders({
        page: 1,
        limit: 10,
        startDate,
        endDate,
      });

      expect(database.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
        })
      );
    });

    it("should search orders by order number", async () => {
      (database.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
      (database.order.count as jest.Mock).mockResolvedValue(1);

      await orderService.getOrders({
        page: 1,
        limit: 10,
        search: "ORD-20241127",
      });

      expect(database.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orderNumber: expect.objectContaining({
              contains: "ORD-20241127",
            }),
          }),
        })
      );
    });

    it("should calculate correct pagination values", async () => {
      (database.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
      (database.order.count as jest.Mock).mockResolvedValue(25);

      const result = await orderService.getOrders({
        page: 2,
        limit: 10,
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(25);
      expect(result.totalPages).toBe(3);
    });
  });

  // ==================== CALCULATE ORDER TOTALS TESTS ====================
  describe("calculateOrderTotals", () => {
    it("should calculate order totals correctly for pickup", () => {
      const items = [
        { productId: "p1", quantity: 2, price: 10.0 },
        { productId: "p2", quantity: 1, price: 15.0 },
      ];

      const totals = orderService.calculateOrderTotals(
        items,
        FulfillmentMethod.PICKUP
      );

      expect(totals.subtotal).toBe(35.0);
      expect(totals.deliveryFee).toBe(0);
      expect(totals.platformFee).toBe(3.5); // 10% of subtotal
      expect(totals.tax).toBe(2.8); // 8% of subtotal
      expect(totals.totalAmount).toBe(41.3);
      expect(totals.farmerAmount).toBe(31.5); // subtotal - platform fee
    });

    it("should calculate order totals correctly for delivery", () => {
      const items = [{ productId: "p1", quantity: 2, price: 10.0 }];

      const totals = orderService.calculateOrderTotals(
        items,
        FulfillmentMethod.DELIVERY
      );

      expect(totals.subtotal).toBe(20.0);
      expect(totals.deliveryFee).toBeGreaterThan(0);
      expect(totals.platformFee).toBe(2.0); // 10% of subtotal
      expect(totals.tax).toBeGreaterThan(1.6); // 8% of (subtotal + delivery)
      expect(totals.totalAmount).toBeGreaterThan(22.0);
      expect(totals.farmerAmount).toBe(18.0); // subtotal - platform fee
    });

    it("should handle single item order", () => {
      const items = [{ productId: "p1", quantity: 1, price: 5.99 }];

      const totals = orderService.calculateOrderTotals(
        items,
        FulfillmentMethod.PICKUP
      );

      expect(totals.subtotal).toBe(5.99);
      expect(totals.platformFee).toBeCloseTo(0.599, 2);
      expect(totals.tax).toBeCloseTo(0.479, 2);
    });

    it("should handle large quantities", () => {
      const items = [{ productId: "p1", quantity: 100, price: 2.99 }];

      const totals = orderService.calculateOrderTotals(
        items,
        FulfillmentMethod.PICKUP
      );

      expect(totals.subtotal).toBe(299.0);
      expect(totals.platformFee).toBe(29.9);
      expect(totals.farmerAmount).toBe(269.1);
    });
  });

  // ==================== VALIDATE ORDER DATA TESTS ====================
  describe("validateOrderData", () => {
    it("should pass validation for valid order data", () => {
      const validData: CreateOrderRequest = {
        customerId: mockUserId,
        farmId: mockFarmId,
        items: [{ productId: mockProductId, quantity: 5 }],
        fulfillmentMethod: FulfillmentMethod.PICKUP,
      };

      expect(() => orderService.validateOrderData(validData)).not.toThrow();
    });

    it("should throw error when items array is empty", () => {
      const invalidData: CreateOrderRequest = {
        customerId: mockUserId,
        farmId: mockFarmId,
        items: [],
        fulfillmentMethod: FulfillmentMethod.PICKUP,
      };

      expect(() => orderService.validateOrderData(invalidData)).toThrow(
        "Order must contain at least one item"
      );
    });

    it("should throw error when quantity is zero", () => {
      const invalidData: CreateOrderRequest = {
        customerId: mockUserId,
        farmId: mockFarmId,
        items: [{ productId: mockProductId, quantity: 0 }],
        fulfillmentMethod: FulfillmentMethod.PICKUP,
      };

      expect(() => orderService.validateOrderData(invalidData)).toThrow(
        "Quantity must be positive"
      );
    });

    it("should throw error when quantity is negative", () => {
      const invalidData: CreateOrderRequest = {
        customerId: mockUserId,
        farmId: mockFarmId,
        items: [{ productId: mockProductId, quantity: -5 }],
        fulfillmentMethod: FulfillmentMethod.PICKUP,
      };

      expect(() => orderService.validateOrderData(invalidData)).toThrow(
        "Quantity must be positive"
      );
    });

    it("should throw error when delivery method requires address", () => {
      const invalidData: CreateOrderRequest = {
        customerId: mockUserId,
        farmId: mockFarmId,
        items: [{ productId: mockProductId, quantity: 5 }],
        fulfillmentMethod: FulfillmentMethod.DELIVERY,
        deliveryAddressId: undefined,
      };

      expect(() => orderService.validateOrderData(invalidData)).toThrow(
        "Delivery address required"
      );
    });

    it("should pass validation when delivery has address", () => {
      const validData: CreateOrderRequest = {
        customerId: mockUserId,
        farmId: mockFarmId,
        items: [{ productId: mockProductId, quantity: 5 }],
        fulfillmentMethod: FulfillmentMethod.DELIVERY,
        deliveryAddressId: "address_123",
      };

      expect(() => orderService.validateOrderData(validData)).not.toThrow();
    });
  });

  // ==================== GENERATE ORDER NUMBER TESTS ====================
  describe("generateOrderNumber", () => {
    it("should generate unique order number", () => {
      const orderNumber1 = orderService.generateOrderNumber();
      const orderNumber2 = orderService.generateOrderNumber();

      expect(orderNumber1).toBeDefined();
      expect(orderNumber2).toBeDefined();
      expect(orderNumber1).not.toBe(orderNumber2);
    });

    it("should follow ORD-YYYYMMDD-XXX format", () => {
      const orderNumber = orderService.generateOrderNumber();

      expect(orderNumber).toMatch(/^ORD-\d{8}-\d{3}$/);
    });

    it("should include current date", () => {
      const orderNumber = orderService.generateOrderNumber();
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const dateString = `${year}${month}${day}`;

      expect(orderNumber).toContain(dateString);
    });
  });

  // ==================== GET ORDER BY ID TESTS ====================
  describe("getOrderById", () => {
    it("should retrieve order by ID with relations", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById(mockOrderId);

      expect(result).toEqual(mockOrder);
      expect(database.order.findUnique).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        include: expect.objectContaining({
          customer: true,
          farm: true,
          items: expect.any(Object),
          fulfillment: true,
        }),
      });
    });

    it("should return null when order not found", async () => {
      (database.order.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await orderService.getOrderById("nonexistent");

      expect(result).toBeNull();
    });
  });

  // ==================== ORDER STATISTICS TESTS ====================
  describe("getOrderStatistics", () => {
    it("should calculate order statistics for farm", async () => {
      const mockOrders = [
        { ...mockOrder, totalAmount: 100, status: OrderStatus.COMPLETED },
        { ...mockOrder, totalAmount: 200, status: OrderStatus.COMPLETED },
        { ...mockOrder, totalAmount: 150, status: OrderStatus.PENDING },
      ];

      (database.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

      const stats = await orderService.getOrderStatistics({
        farmId: mockFarmId,
      });

      expect(stats.totalRevenue).toBe(300); // Only completed orders
      expect(stats.totalOrders).toBe(3);
      expect(stats.averageOrderValue).toBe(100);
    });

    it("should calculate statistics for specific date range", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-12-31");

      (database.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

      await orderService.getOrderStatistics({
        farmId: mockFarmId,
        startDate,
        endDate,
      });

      expect(database.order.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      });
    });
  });
});
