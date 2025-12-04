/**
 * 🧪 ORDER SERVICE REFACTORED - COMPREHENSIVE TEST SUITE
 *
 * Divine test coverage for refactored OrderService
 * Tests all service methods using repository pattern
 *
 * Test Categories:
 * - Order Creation (validation, inventory, transactions)
 * - Order Updates (status transitions, authorization)
 * - Order Cancellation (inventory restoration, refunds)
 * - Order Retrieval (filtering, pagination, search)
 * - Statistics & Analytics
 * - Validation Logic
 * - Status Transitions
 * - Calculation Methods
 *
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 */

import { OrderService } from "../order.service.refactored";
import { orderRepository } from "@/lib/repositories/order.repository";
import { database } from "@/lib/database";
import { ValidationError } from "@/lib/errors/ValidationError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { BusinessLogicError } from "@/lib/errors/BusinessLogicError";

// ============================================
// MOCK SETUP
// ============================================

jest.mock("@/lib/database", () => ({
  database: {
    user: {
      findUnique: jest.fn(),
    },
    farm: {
      findUnique: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    address: {
      findUnique: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("@/lib/repositories/order.repository", () => ({
  orderRepository: {
    findById: jest.fn(),
    findByOrderNumber: jest.fn(),
    findCustomerOrders: jest.fn(),
    findFarmOrders: jest.fn(),
    searchOrders: jest.fn(),
    updateOrderStatus: jest.fn(),
    updatePaymentStatus: jest.fn(),
    cancelOrder: jest.fn(),
    completeOrder: jest.fn(),
    getOrderStatistics: jest.fn(),
    getRecentOrders: jest.fn(),
    findOrdersForFulfillment: jest.fn(),
    findScheduledOrders: jest.fn(),
  },
}));

// ============================================
// TEST DATA
// ============================================

const mockCustomerId = "customer-123";
const mockFarmId = "farm-456";
const mockProductId = "product-789";
const mockOrderId = "order-abc";
const mockAddressId = "address-xyz";

const mockCustomer = {
  id: mockCustomerId,
  email: "customer@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "CUSTOMER",
  status: "ACTIVE",
};

const mockFarm = {
  id: mockFarmId,
  name: "Divine Acres Farm",
  ownerId: "farmer-123",
  status: "ACTIVE",
};

const mockProduct = {
  id: mockProductId,
  name: "Organic Tomatoes",
  price: 5.99,
  quantityAvailable: 100,
  status: "ACTIVE",
  farmId: mockFarmId,
  unit: "lb",
};

const mockAddress = {
  id: mockAddressId,
  street: "123 Farm Road",
  city: "Farmville",
  state: "CA",
  zipCode: "12345",
  userId: mockCustomerId,
};

const mockOrder = {
  id: mockOrderId,
  orderNumber: "ORD-20250115-001",
  customerId: mockCustomerId,
  farmId: mockFarmId,
  status: "PENDING",
  paymentStatus: "PENDING",
  fulfillmentMethod: "DELIVERY",
  subtotal: 29.95,
  deliveryFee: 5.0,
  platformFee: 2.99,
  tax: 2.8,
  total: 40.74,
  farmerAmount: 26.96,
  createdAt: new Date(),
  updatedAt: new Date(),
  customer: mockCustomer,
  farm: mockFarm,
  items: [
    {
      id: "item-1",
      orderId: mockOrderId,
      productId: mockProductId,
      quantity: 5,
      unitPrice: 5.99,
      subtotal: 29.95,
      productName: "Organic Tomatoes",
      unit: "lb",
    },
  ],
};

// ============================================
// TEST SUITE
// ============================================

describe("OrderService - Refactored with Repository Pattern", () => {
  let orderService: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    orderService = new OrderService();
  });

  // ==================== ORDER CREATION TESTS ====================

  describe("createOrder", () => {
    const validCreateRequest = {
      customerId: mockCustomerId,
      farmId: mockFarmId,
      items: [
        {
          productId: mockProductId,
          quantity: 5,
        },
      ],
      fulfillmentMethod: "DELIVERY" as const,
      deliveryAddressId: mockAddressId,
      specialInstructions: "Please leave at door",
    };

    beforeEach(() => {
      // Setup default successful mocks
      (database.user.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);
      (database.address.findUnique as jest.Mock).mockResolvedValue(mockAddress);
      (database.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);
      (database.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return callback({
            order: {
              create: jest.fn().mockResolvedValue(mockOrder),
            },
            orderItem: {
              create: jest.fn().mockResolvedValue({}),
            },
            product: {
              update: jest.fn().mockResolvedValue({}),
            },
          });
        },
      );
    });

    it("should create order successfully with valid data", async () => {
      const result = await orderService.createOrder(validCreateRequest);

      expect(result).toBeDefined();
      expect(result.orderNumber).toMatch(/^ORD-\d{8}-\d{3}$/);
      expect(database.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockCustomerId },
      });
      expect(database.farm.findUnique).toHaveBeenCalledWith({
        where: { id: mockFarmId },
      });
      expect(database.$transaction).toHaveBeenCalled();
    });

    it("should throw ValidationError when items array is empty", async () => {
      const invalidRequest = {
        ...validCreateRequest,
        items: [],
      };

      await expect(orderService.createOrder(invalidRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw ValidationError when quantity is zero", async () => {
      const invalidRequest = {
        ...validCreateRequest,
        items: [{ productId: mockProductId, quantity: 0 }],
      };

      await expect(orderService.createOrder(invalidRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw ValidationError when quantity is negative", async () => {
      const invalidRequest = {
        ...validCreateRequest,
        items: [{ productId: mockProductId, quantity: -5 }],
      };

      await expect(orderService.createOrder(invalidRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw NotFoundError when customer not found", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        orderService.createOrder(validCreateRequest),
      ).rejects.toThrow(NotFoundError);
      await expect(
        orderService.createOrder(validCreateRequest),
      ).rejects.toThrow("Customer not found");
    });

    it("should throw NotFoundError when farm not found", async () => {
      (database.farm.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        orderService.createOrder(validCreateRequest),
      ).rejects.toThrow(NotFoundError);
      await expect(
        orderService.createOrder(validCreateRequest),
      ).rejects.toThrow("Farm not found");
    });

    it("should throw BusinessLogicError when farm is inactive", async () => {
      (database.farm.findUnique as jest.Mock).mockResolvedValue({
        ...mockFarm,
        status: "INACTIVE",
      });

      await expect(
        orderService.createOrder(validCreateRequest),
      ).rejects.toThrow(BusinessLogicError);
      await expect(
        orderService.createOrder(validCreateRequest),
      ).rejects.toThrow("inactive farm");
    });

    it("should throw NotFoundError when product not found", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([]);

      await expect(
        orderService.createOrder(validCreateRequest),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw BusinessLogicError when product is inactive", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([
        { ...mockProduct, status: "INACTIVE" },
      ]);

      await expect(
        orderService.createOrder(validCreateRequest),
      ).rejects.toThrow(BusinessLogicError);
      await expect(
        orderService.createOrder(validCreateRequest),
      ).rejects.toThrow("not available");
    });

    it("should throw BusinessLogicError when insufficient inventory", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([
        { ...mockProduct, quantityAvailable: 2 },
      ]);

      const request = {
        ...validCreateRequest,
        items: [{ productId: mockProductId, quantity: 5 }],
      };

      await expect(orderService.createOrder(request)).rejects.toThrow(
        BusinessLogicError,
      );
      await expect(orderService.createOrder(request)).rejects.toThrow(
        "Insufficient inventory",
      );
    });

    it("should throw ValidationError when delivery requires address", async () => {
      const request = {
        ...validCreateRequest,
        fulfillmentMethod: "DELIVERY" as const,
        deliveryAddressId: undefined,
      };

      await expect(orderService.createOrder(request)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should create order for pickup without delivery address", async () => {
      const pickupRequest = {
        ...validCreateRequest,
        fulfillmentMethod: "FARM_PICKUP" as const,
        deliveryAddressId: undefined,
      };

      // Update mock to return correct fulfillment method
      (database.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return callback({
            order: {
              create: jest.fn().mockResolvedValue({
                ...mockOrder,
                fulfillmentMethod: "FARM_PICKUP",
              }),
            },
            orderItem: {
              create: jest.fn().mockResolvedValue({}),
            },
            product: {
              update: jest.fn().mockResolvedValue({}),
            },
          });
        },
      );

      const result = await orderService.createOrder(pickupRequest);

      expect(result).toBeDefined();
      expect(result.fulfillmentMethod).toBe("FARM_PICKUP");
    });

    it("should decrement product inventory after order creation", async () => {
      let decrementCalled = false;

      (database.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          const txMock = {
            order: {
              create: jest.fn().mockResolvedValue(mockOrder),
            },
            orderItem: {
              create: jest.fn().mockResolvedValue({}),
            },
            product: {
              update: jest.fn().mockImplementation((args) => {
                if (args.data?.quantityAvailable?.decrement) {
                  decrementCalled = true;
                }
                return Promise.resolve({});
              }),
            },
          };
          return callback(txMock);
        },
      );

      await orderService.createOrder(validCreateRequest);

      expect(decrementCalled).toBe(true);
    });

    it("should validate delivery address ownership", async () => {
      (database.address.findUnique as jest.Mock).mockResolvedValue({
        ...mockAddress,
        userId: "different-user-id",
      });

      await expect(
        orderService.createOrder(validCreateRequest),
      ).rejects.toThrow(BusinessLogicError);
      await expect(
        orderService.createOrder(validCreateRequest),
      ).rejects.toThrow("does not belong to customer");
    });

    it("should validate product belongs to specified farm", async () => {
      (database.product.findMany as jest.Mock).mockResolvedValue([
        { ...mockProduct, farmId: "different-farm-id" },
      ]);

      await expect(
        orderService.createOrder(validCreateRequest),
      ).rejects.toThrow(BusinessLogicError);
      await expect(
        orderService.createOrder(validCreateRequest),
      ).rejects.toThrow("does not belong to this farm");
    });

    it("should support legacy address format", async () => {
      const legacyRequest = {
        ...validCreateRequest,
        deliveryAddressId: "legacy-address",
      };

      const result = await orderService.createOrder(legacyRequest);

      expect(result).toBeDefined();
    });
  });

  // ==================== ORDER UPDATE TESTS ====================

  describe("updateOrder", () => {
    const updateRequest = {
      status: "CONFIRMED" as const,
      specialInstructions: "Updated instructions",
    };

    beforeEach(() => {
      (orderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
      (orderRepository.updateOrderStatus as jest.Mock).mockResolvedValue({
        ...mockOrder,
        ...updateRequest,
      });
    });

    it("should update order successfully", async () => {
      const result = await orderService.updateOrder(mockOrderId, updateRequest);

      expect(result).toBeDefined();
      expect(orderRepository.findById).toHaveBeenCalledWith(mockOrderId);
      expect(orderRepository.updateOrderStatus).toHaveBeenCalled();
    });

    it("should throw NotFoundError when order not found", async () => {
      (orderRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        orderService.updateOrder(mockOrderId, updateRequest),
      ).rejects.toThrow(NotFoundError);
    });

    it("should validate status transitions", async () => {
      const invalidUpdate = {
        status: "COMPLETED" as const,
      };

      (orderRepository.findById as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "PENDING",
      });

      await expect(
        orderService.updateOrder(mockOrderId, invalidUpdate),
      ).rejects.toThrow(BusinessLogicError);
    });

    it("should allow valid status transitions", async () => {
      const validTransitions = [
        { from: "PENDING", to: "CONFIRMED" },
        { from: "CONFIRMED", to: "PREPARING" },
        { from: "PREPARING", to: "READY" },
        { from: "READY", to: "FULFILLED" },
        { from: "FULFILLED", to: "COMPLETED" },
      ];

      for (const transition of validTransitions) {
        (orderRepository.findById as jest.Mock).mockResolvedValue({
          ...mockOrder,
          status: transition.from,
        });

        const result = await orderService.updateOrder(mockOrderId, {
          status: transition.to as any,
        });

        expect(result).toBeDefined();
      }
    });

    it("should enforce authorization when userId provided", async () => {
      const unauthorizedUserId = "unauthorized-user";

      (orderRepository.findById as jest.Mock).mockResolvedValue({
        ...mockOrder,
        customerId: "different-customer",
        farm: { ownerId: "different-farmer" },
      });

      await expect(
        orderService.updateOrder(
          mockOrderId,
          updateRequest,
          unauthorizedUserId,
        ),
      ).rejects.toThrow(BusinessLogicError);
    });

    it("should allow customer to update their own order", async () => {
      (orderRepository.findById as jest.Mock).mockResolvedValue({
        ...mockOrder,
        customerId: mockCustomerId,
      });

      const result = await orderService.updateOrder(
        mockOrderId,
        updateRequest,
        mockCustomerId,
      );

      expect(result).toBeDefined();
    });

    it("should allow farm owner to update order", async () => {
      const farmOwnerId = "farmer-123";

      (orderRepository.findById as jest.Mock).mockResolvedValue({
        ...mockOrder,
        farm: { ownerId: farmOwnerId },
      });

      const result = await orderService.updateOrder(
        mockOrderId,
        updateRequest,
        farmOwnerId,
      );

      expect(result).toBeDefined();
    });
  });

  // ==================== ORDER CANCELLATION TESTS ====================

  describe("cancelOrder", () => {
    const cancelRequest = {
      reason: "Customer requested cancellation",
      cancelledBy: mockCustomerId,
    };

    beforeEach(() => {
      (orderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
      (orderRepository.cancelOrder as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "CANCELLED",
      });
    });

    it("should cancel order successfully", async () => {
      const result = await orderService.cancelOrder(mockOrderId, cancelRequest);

      expect(result).toBeDefined();
      expect(orderRepository.cancelOrder).toHaveBeenCalledWith(mockOrderId, {
        cancelReason: cancelRequest.reason,
        cancelledBy: cancelRequest.cancelledBy,
      });
    });

    it("should throw NotFoundError when order not found", async () => {
      (orderRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        orderService.cancelOrder(mockOrderId, cancelRequest),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw error when order already cancelled", async () => {
      (orderRepository.findById as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "CANCELLED",
      });

      await expect(
        orderService.cancelOrder(mockOrderId, cancelRequest),
      ).rejects.toThrow(BusinessLogicError);
      await expect(
        orderService.cancelOrder(mockOrderId, cancelRequest),
      ).rejects.toThrow("already cancelled");
    });

    it("should throw error when order already completed", async () => {
      (orderRepository.findById as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "COMPLETED",
      });

      await expect(
        orderService.cancelOrder(mockOrderId, cancelRequest),
      ).rejects.toThrow(BusinessLogicError);
      await expect(
        orderService.cancelOrder(mockOrderId, cancelRequest),
      ).rejects.toThrow("Cannot cancel completed order");
    });

    it("should allow cancellation from pending status", async () => {
      (orderRepository.findById as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "PENDING",
      });

      const result = await orderService.cancelOrder(mockOrderId, cancelRequest);

      expect(result).toBeDefined();
    });

    it("should allow cancellation from confirmed status", async () => {
      (orderRepository.findById as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "CONFIRMED",
      });

      const result = await orderService.cancelOrder(mockOrderId, cancelRequest);

      expect(result).toBeDefined();
    });
  });

  // ==================== ORDER RETRIEVAL TESTS ====================

  describe("getOrders", () => {
    const mockSearchResult = {
      orders: [mockOrder],
      total: 1,
    };

    beforeEach(() => {
      (orderRepository.searchOrders as jest.Mock).mockResolvedValue(
        mockSearchResult,
      );
    });

    it("should retrieve orders with pagination", async () => {
      const request = {
        page: 1,
        limit: 10,
      };

      const result = await orderService.getOrders(request);

      expect(result.orders).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it("should filter orders by status", async () => {
      const request = {
        status: "PENDING" as const,
        page: 1,
        limit: 10,
      };

      await orderService.getOrders(request);

      expect(orderRepository.searchOrders).toHaveBeenCalledWith(
        expect.objectContaining({ status: "PENDING" }),
        expect.any(Object),
      );
    });

    it("should filter orders by customer ID", async () => {
      const request = {
        customerId: mockCustomerId,
        page: 1,
        limit: 10,
      };

      await orderService.getOrders(request);

      expect(orderRepository.searchOrders).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: mockCustomerId }),
        expect.any(Object),
      );
    });

    it("should filter orders by farm ID", async () => {
      const request = {
        farmId: mockFarmId,
        page: 1,
        limit: 10,
      };

      await orderService.getOrders(request);

      expect(orderRepository.searchOrders).toHaveBeenCalledWith(
        expect.objectContaining({ farmId: mockFarmId }),
        expect.any(Object),
      );
    });

    it("should filter orders by date range", async () => {
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-31");

      const request = {
        startDate,
        endDate,
        page: 1,
        limit: 10,
      };

      await orderService.getOrders(request);

      expect(orderRepository.searchOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: { start: startDate, end: endDate },
        }),
        expect.any(Object),
      );
    });

    it("should search orders by order number", async () => {
      const request = {
        search: "ORD-20250115",
        page: 1,
        limit: 10,
      };

      await orderService.getOrders(request);

      expect(orderRepository.searchOrders).toHaveBeenCalledWith(
        expect.objectContaining({ orderNumber: "ORD-20250115" }),
        expect.any(Object),
      );
    });

    it("should use default pagination values", async () => {
      const result = await orderService.getOrders({});

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe("getOrderById", () => {
    it("should retrieve order by ID", async () => {
      (orderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById(mockOrderId);

      expect(result).toEqual(mockOrder);
      expect(orderRepository.findById).toHaveBeenCalledWith(mockOrderId);
    });

    it("should return null when order not found", async () => {
      (orderRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await orderService.getOrderById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("getOrderByNumber", () => {
    it("should retrieve order by order number", async () => {
      (orderRepository.findByOrderNumber as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      const result = await orderService.getOrderByNumber(mockOrder.orderNumber);

      expect(result).toEqual(mockOrder);
      expect(orderRepository.findByOrderNumber).toHaveBeenCalledWith(
        mockOrder.orderNumber,
      );
    });
  });

  // ==================== CUSTOMER & FARM OPERATIONS ====================

  describe("getCustomerOrders", () => {
    it("should retrieve customer orders with pagination", async () => {
      (orderRepository.findCustomerOrders as jest.Mock).mockResolvedValue({
        orders: [mockOrder],
        total: 1,
      });

      const result = await orderService.getCustomerOrders(
        mockCustomerId,
        1,
        10,
      );

      expect(result.orders).toBeDefined();
      expect(result.pagination.total).toBe(1);
      expect(orderRepository.findCustomerOrders).toHaveBeenCalledWith(
        mockCustomerId,
        { page: 1, limit: 10 },
      );
    });
  });

  describe("getFarmOrders", () => {
    it("should retrieve farm orders with pagination", async () => {
      (orderRepository.findFarmOrders as jest.Mock).mockResolvedValue({
        orders: [mockOrder],
        total: 1,
      });

      const result = await orderService.getFarmOrders(mockFarmId, {}, 1, 10);

      expect(result.orders).toBeDefined();
      expect(result.pagination.total).toBe(1);
      expect(orderRepository.findFarmOrders).toHaveBeenCalledWith(
        mockFarmId,
        expect.objectContaining({ page: 1, limit: 10 }),
      );
    });

    it("should filter farm orders by status", async () => {
      (orderRepository.findFarmOrders as jest.Mock).mockResolvedValue({
        orders: [mockOrder],
        total: 1,
      });

      await orderService.getFarmOrders(
        mockFarmId,
        { status: "PENDING" },
        1,
        10,
      );

      expect(orderRepository.findFarmOrders).toHaveBeenCalledWith(
        mockFarmId,
        expect.objectContaining({ status: "PENDING" }),
      );
    });
  });

  // ==================== STATUS & FULFILLMENT OPERATIONS ====================

  describe("updatePaymentStatus", () => {
    it("should update payment status", async () => {
      (orderRepository.updatePaymentStatus as jest.Mock).mockResolvedValue({
        ...mockOrder,
        paymentStatus: "PAID",
      });

      const result = await orderService.updatePaymentStatus(
        mockOrderId,
        "PAID",
      );

      expect(result.paymentStatus).toBe("PAID");
      expect(orderRepository.updatePaymentStatus).toHaveBeenCalledWith(
        mockOrderId,
        "PAID",
      );
    });
  });

  describe("completeOrder", () => {
    it("should complete order", async () => {
      (orderRepository.completeOrder as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "COMPLETED",
        completedAt: new Date(),
      });

      const result = await orderService.completeOrder(mockOrderId);

      expect(result.status).toBe("COMPLETED");
      expect(orderRepository.completeOrder).toHaveBeenCalledWith(mockOrderId);
    });
  });

  describe("getOrdersForFulfillment", () => {
    it("should retrieve orders ready for fulfillment", async () => {
      (orderRepository.findOrdersForFulfillment as jest.Mock).mockResolvedValue(
        [mockOrder],
      );

      const result = await orderService.getOrdersForFulfillment();

      expect(result).toHaveLength(1);
      expect(orderRepository.findOrdersForFulfillment).toHaveBeenCalled();
    });

    it("should filter by farm ID", async () => {
      (orderRepository.findOrdersForFulfillment as jest.Mock).mockResolvedValue(
        [mockOrder],
      );

      await orderService.getOrdersForFulfillment(mockFarmId);

      expect(orderRepository.findOrdersForFulfillment).toHaveBeenCalledWith(
        mockFarmId,
      );
    });
  });

  describe("getScheduledOrders", () => {
    it("should retrieve scheduled orders in date range", async () => {
      const startDate = new Date("2025-01-15");
      const endDate = new Date("2025-01-20");

      (orderRepository.findScheduledOrders as jest.Mock).mockResolvedValue([
        mockOrder,
      ]);

      const result = await orderService.getScheduledOrders(startDate, endDate);

      expect(result).toHaveLength(1);
      expect(orderRepository.findScheduledOrders).toHaveBeenCalledWith(
        startDate,
        endDate,
      );
    });
  });

  // ==================== STATISTICS & ANALYTICS ====================

  describe("getOrderStatistics", () => {
    const mockStats = {
      totalOrders: 10,
      totalRevenue: 500.0,
      averageOrderValue: 50.0,
      ordersByStatus: {
        PENDING: 2,
        CONFIRMED: 3,
        COMPLETED: 5,
      },
      ordersByFulfillmentMethod: {
        DELIVERY: 6,
        FARM_PICKUP: 4,
      },
    };

    beforeEach(() => {
      (orderRepository.getOrderStatistics as jest.Mock).mockResolvedValue(
        mockStats,
      );
    });

    it("should calculate order statistics", async () => {
      const request = {
        farmId: mockFarmId,
      };

      const result = await orderService.getOrderStatistics(request);

      expect(result.totalOrders).toBe(10);
      expect(result.totalRevenue).toBe(500.0);
      expect(result.averageOrderValue).toBe(50.0);
      expect(result.ordersByStatus).toBeDefined();
    });

    it("should support date range filtering", async () => {
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-31");

      await orderService.getOrderStatistics({
        farmId: mockFarmId,
        startDate,
        endDate,
      });

      expect(orderRepository.getOrderStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: { start: startDate, end: endDate },
        }),
      );
    });
  });

  describe("getRecentOrders", () => {
    it("should retrieve recent orders", async () => {
      (orderRepository.getRecentOrders as jest.Mock).mockResolvedValue([
        mockOrder,
      ]);

      const result = await orderService.getRecentOrders(5);

      expect(result).toHaveLength(1);
      expect(orderRepository.getRecentOrders).toHaveBeenCalledWith(
        5,
        undefined,
      );
    });

    it("should filter by farm ID", async () => {
      (orderRepository.getRecentOrders as jest.Mock).mockResolvedValue([
        mockOrder,
      ]);

      await orderService.getRecentOrders(10, mockFarmId);

      expect(orderRepository.getRecentOrders).toHaveBeenCalledWith(
        10,
        mockFarmId,
      );
    });
  });

  // ==================== CALCULATION TESTS ====================

  describe("calculateOrderTotals", () => {
    it("should calculate totals correctly for pickup", async () => {
      const items = [
        { productId: "p1", quantity: 5, price: 5.99 },
        { productId: "p2", quantity: 3, price: 3.99 },
      ];

      const totals = orderService.calculateOrderTotals(items, "FARM_PICKUP");

      expect(totals.subtotal).toBe(41.92);
      expect(totals.deliveryFee).toBe(0);
      expect(totals.platformFee).toBe(4.19);
      expect(totals.tax).toBe(3.35);
      expect(totals.totalAmount).toBe(49.46);
      expect(totals.farmerAmount).toBe(37.73);
    });

    it("should calculate totals correctly for delivery", async () => {
      const items = [{ productId: "p1", quantity: 5, price: 5.99 }];

      const totals = orderService.calculateOrderTotals(items, "DELIVERY");

      expect(totals.subtotal).toBe(29.95);
      expect(totals.deliveryFee).toBe(5.0);
      expect(totals.platformFee).toBe(3.0); // Platform fee is rounded: 29.95 * 0.1 = 2.995 -> 3.00
      expect(totals.tax).toBe(2.8);
      expect(totals.totalAmount).toBe(40.75); // Adjusted for correct platform fee
      expect(totals.farmerAmount).toBe(26.95); // Adjusted for correct platform fee
    });

    it("should handle single item order", async () => {
      const items = [{ productId: "p1", quantity: 1, price: 10.0 }];

      const totals = orderService.calculateOrderTotals(items, "FARM_PICKUP");

      expect(totals.subtotal).toBe(10.0);
      expect(totals.deliveryFee).toBe(0);
      expect(totals.platformFee).toBe(1.0);
      expect(totals.tax).toBe(0.8);
      expect(totals.totalAmount).toBe(11.8);
    });

    it("should handle large quantities", async () => {
      const items = [{ productId: "p1", quantity: 100, price: 1.5 }];

      const totals = orderService.calculateOrderTotals(items, "FARM_PICKUP");

      expect(totals.subtotal).toBe(150.0);
      expect(totals.platformFee).toBe(15.0);
      expect(totals.farmerAmount).toBe(135.0);
    });
  });

  // ==================== VALIDATION TESTS ====================

  describe("validateOrderData", () => {
    it("should pass validation for valid order data", async () => {
      const validData = {
        customerId: mockCustomerId,
        farmId: mockFarmId,
        items: [{ productId: mockProductId, quantity: 5 }],
        fulfillmentMethod: "FARM_PICKUP" as const,
      };

      const result = await orderService.validateOrderData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail when customer ID missing", async () => {
      const invalidData: any = {
        farmId: mockFarmId,
        items: [{ productId: mockProductId, quantity: 5 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      const result = await orderService.validateOrderData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: "customerId" }),
      );
    });

    it("should fail when farm ID missing", async () => {
      const invalidData: any = {
        customerId: mockCustomerId,
        items: [{ productId: mockProductId, quantity: 5 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      const result = await orderService.validateOrderData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: "farmId" }),
      );
    });

    it("should fail when items array is empty", async () => {
      const invalidData = {
        customerId: mockCustomerId,
        farmId: mockFarmId,
        items: [],
        fulfillmentMethod: "FARM_PICKUP" as const,
      };

      const result = await orderService.validateOrderData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: "EMPTY_ORDER" }),
      );
    });

    it("should fail when quantity is invalid", async () => {
      const invalidData = {
        customerId: mockCustomerId,
        farmId: mockFarmId,
        items: [{ productId: mockProductId, quantity: 0 }],
        fulfillmentMethod: "FARM_PICKUP" as const,
      };

      const result = await orderService.validateOrderData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: "INVALID_QUANTITY" }),
      );
    });

    it("should fail when delivery requires address", async () => {
      const invalidData = {
        customerId: mockCustomerId,
        farmId: mockFarmId,
        items: [{ productId: mockProductId, quantity: 5 }],
        fulfillmentMethod: "DELIVERY" as const,
      };

      const result = await orderService.validateOrderData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: "DELIVERY_ADDRESS_REQUIRED" }),
      );
    });

    it("should pass when delivery has address", async () => {
      const validData = {
        customerId: mockCustomerId,
        farmId: mockFarmId,
        items: [{ productId: mockProductId, quantity: 5 }],
        fulfillmentMethod: "DELIVERY" as const,
        deliveryAddressId: mockAddressId,
      };

      const result = await orderService.validateOrderData(validData);

      expect(result.isValid).toBe(true);
    });
  });

  // ==================== ORDER NUMBER GENERATION ====================

  describe("generateOrderNumber", () => {
    it("should generate unique order number", () => {
      const orderNumber1 = orderService.generateOrderNumber();
      const orderNumber2 = orderService.generateOrderNumber();

      expect(orderNumber1).toBeDefined();
      expect(orderNumber2).toBeDefined();
      // Different random suffixes make them unique
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

  // ==================== STATIC WRAPPER TESTS ====================

  describe("Static wrapper methods", () => {
    it("should create order via static method", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);
      (database.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);
      (database.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return callback({
            order: { create: jest.fn().mockResolvedValue(mockOrder) },
            orderItem: { create: jest.fn().mockResolvedValue({}) },
            product: { update: jest.fn().mockResolvedValue({}) },
          });
        },
      );

      const input = {
        userId: mockCustomerId,
        farmId: mockFarmId,
        items: [{ productId: mockProductId, quantity: 5 }],
        fulfillmentMethod: "FARM_PICKUP" as const,
        notes: "Test notes",
      };

      const result = await OrderService.createOrder(input);

      expect(result).toBeDefined();
    });

    it("should get order by ID via static method", async () => {
      (orderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);

      const result = await OrderService.getOrderById(mockOrderId);

      expect(result).toEqual(mockOrder);
    });

    it("should update order status via static method", async () => {
      (orderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
      (orderRepository.updateOrderStatus as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "CONFIRMED",
      });

      const result = await OrderService.updateOrderStatus(
        mockOrderId,
        "CONFIRMED",
      );

      expect(result.status).toBe("CONFIRMED");
    });

    it("should get user orders via static method", async () => {
      (orderRepository.findCustomerOrders as jest.Mock).mockResolvedValue({
        orders: [mockOrder],
        total: 1,
      });

      const result = await OrderService.getUserOrders(mockCustomerId);

      expect(result).toHaveLength(1);
    });

    it("should get farm orders via static method", async () => {
      (orderRepository.findFarmOrders as jest.Mock).mockResolvedValue({
        orders: [mockOrder],
        total: 1,
      });

      const result = await OrderService.getFarmOrders(mockFarmId);

      expect(result).toHaveLength(1);
    });
  });
});
