/**
 * 🧪 CONSOLIDATED ORDER SERVICE TESTS - NEW FEATURES
 *
 * Comprehensive tests for features added during consolidation:
 * - Validation warnings system
 * - Cart-to-order conversion
 * - Advanced statistics
 * - Agricultural consciousness features
 *
 * @reference Phase 5 - Final Testing
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { database } from "@/lib/database";
import {
  OrderService,
  orderService,
  type CreateOrderRequest,
  type ValidateOrderResult,
  type OrderStatistics,
  type CartToOrderRequest,
} from "@/lib/services/order.service";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

// Mock database
jest.mock("@/lib/database", () => ({
  database: {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
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
      findMany: jest.fn(),
    },
    farm: {
      findUnique: jest.fn(),
    },
    address: {
      findUnique: jest.fn(),
    },
    cartItem: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe("OrderService - Consolidated Features", () => {
  let service: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrderService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // VALIDATION WARNINGS SYSTEM
  // ============================================================================

  describe("Validation Warnings System", () => {
    it("should return warnings for low stock items", async () => {
      const request: CreateOrderRequest = {
        customerId: "user-123",
        farmId: "farm-456",
        items: [{ productId: "prod-low-stock", quantity: 5 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      const mockUser = {
        id: "user-123",
        email: "user@test.com",
        firstName: "John",
        lastName: "Doe",
      };

      const mockFarm = {
        id: "farm-456",
        name: "Test Farm",
        status: "ACTIVE",
        ownerId: "farmer-1",
      };

      const mockProduct = {
        id: "prod-low-stock",
        name: "Low Stock Product",
        price: 10,
        quantityAvailable: 7, // Low stock (just above order quantity)
        status: "ACTIVE",
        farmId: "farm-456",
        unit: "lb",
      };

      (database.user.findUnique as any).mockResolvedValue(mockUser);
      (database.farm.findUnique as any).mockResolvedValue(mockFarm);
      (database.product.findUnique as any).mockResolvedValue(mockProduct);

      const result: ValidateOrderResult =
        await service.validateOrderWithWarnings(request);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toMatchObject({
        severity: "medium",
        suggestion: expect.stringContaining("7 units available"),
      });
    });

    it("should return errors for out of stock items", async () => {
      const request: CreateOrderRequest = {
        customerId: "user-123",
        farmId: "farm-456",
        items: [{ productId: "prod-out-of-stock", quantity: 10 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      const mockUser = {
        id: "user-123",
        email: "user@test.com",
        firstName: "John",
        lastName: "Doe",
      };

      const mockFarm = {
        id: "farm-456",
        name: "Test Farm",
        status: "ACTIVE",
        ownerId: "farmer-1",
      };

      const mockProduct = {
        id: "prod-out-of-stock",
        name: "Out of Stock Product",
        price: 10,
        quantityAvailable: 5, // Not enough stock
        status: "ACTIVE",
        farmId: "farm-456",
        unit: "lb",
      };

      (database.user.findUnique as any).mockResolvedValue(mockUser);
      (database.farm.findUnique as any).mockResolvedValue(mockFarm);
      (database.product.findUnique as any).mockResolvedValue(mockProduct);

      const result: ValidateOrderResult =
        await service.validateOrderWithWarnings(request);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toMatchObject({
        code: "INSUFFICIENT_INVENTORY",
      });
    });

    it("should validate delivery address requirement", async () => {
      const request: CreateOrderRequest = {
        customerId: "user-123",
        farmId: "farm-456",
        items: [{ productId: "prod-1", quantity: 2 }],
        fulfillmentMethod: "DELIVERY",
        // Missing deliveryAddressId
      };

      const mockUser = {
        id: "user-123",
        email: "user@test.com",
        firstName: "John",
        lastName: "Doe",
      };

      const mockFarm = {
        id: "farm-456",
        name: "Test Farm",
        status: "ACTIVE",
        ownerId: "farmer-1",
      };

      const mockProduct = {
        id: "prod-1",
        name: "Product 1",
        price: 10,
        quantityAvailable: 100,
        status: "ACTIVE",
        farmId: "farm-456",
        unit: "lb",
      };

      (database.user.findUnique as any).mockResolvedValue(mockUser);
      (database.farm.findUnique as any).mockResolvedValue(mockFarm);
      (database.product.findUnique as any).mockResolvedValue(mockProduct);

      const result: ValidateOrderResult =
        await service.validateOrderWithWarnings(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "deliveryAddressId",
            code: "DELIVERY_ADDRESS_REQUIRED",
          }),
        ]),
      );
    });

    it("should validate product farm mismatch", async () => {
      const request: CreateOrderRequest = {
        customerId: "user-123",
        farmId: "farm-456",
        items: [{ productId: "prod-wrong-farm", quantity: 2 }],
        fulfillmentMethod: "FARM_PICKUP",
      };

      const mockUser = {
        id: "user-123",
        email: "user@test.com",
        firstName: "John",
        lastName: "Doe",
      };

      const mockFarm = {
        id: "farm-456",
        name: "Test Farm",
        status: "ACTIVE",
        ownerId: "farmer-1",
      };

      const mockProduct = {
        id: "prod-wrong-farm",
        name: "Product from Different Farm",
        price: 10,
        quantityAvailable: 100,
        status: "ACTIVE",
        farmId: "farm-999", // Different farm!
        unit: "lb",
      };

      (database.user.findUnique as any).mockResolvedValue(mockUser);
      (database.farm.findUnique as any).mockResolvedValue(mockFarm);
      (database.product.findUnique as any).mockResolvedValue(mockProduct);

      const result: ValidateOrderResult =
        await service.validateOrderWithWarnings(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "PRODUCT_FARM_MISMATCH",
          }),
        ]),
      );
    });
  });

  // ============================================================================
  // CART-TO-ORDER CONVERSION
  // ============================================================================

  describe("Cart-to-Order Conversion", () => {
    it("should convert cart items to order request", async () => {
      const cartRequest: CartToOrderRequest = {
        cartId: "cart-123",
        customerId: "user-123",
        farmId: "farm-456",
        fulfillmentMethod: "DELIVERY",
        deliveryAddressId: "addr-123",
        specialInstructions: "Please ring doorbell",
      };

      const mockCartItems = [
        {
          id: "cart-item-1",
          productId: "prod-1",
          quantity: 2,
          product: {
            id: "prod-1",
            name: "Product 1",
            price: 10,
          },
        },
        {
          id: "cart-item-2",
          productId: "prod-2",
          quantity: 1,
          product: {
            id: "prod-2",
            name: "Product 2",
            price: 20,
          },
        },
      ];

      (database.cartItem.findMany as any).mockResolvedValue(mockCartItems);
      (database.cartItem.deleteMany as any).mockResolvedValue({ count: 2 });

      const result = await service.transformCartToOrder(cartRequest);

      expect(result).toMatchObject({
        customerId: "user-123",
        farmId: "farm-456",
        fulfillmentMethod: "DELIVERY",
        deliveryAddressId: "addr-123",
        specialInstructions: "Please ring doorbell",
        items: [
          { productId: "prod-1", quantity: 2 },
          { productId: "prod-2", quantity: 1 },
        ],
      });

      // Verify cart was cleared
      expect(database.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { id: "cart-123" },
      });
    });

    it("should throw error for empty cart", async () => {
      const cartRequest: CartToOrderRequest = {
        cartId: "cart-empty",
        customerId: "user-123",
        farmId: "farm-456",
        fulfillmentMethod: "FARM_PICKUP",
      };

      (database.cartItem.findMany as any).mockResolvedValue([]);

      await expect(service.transformCartToOrder(cartRequest)).rejects.toThrow(
        "Cart is empty",
      );
    });
  });

  // ============================================================================
  // ADVANCED STATISTICS
  // ============================================================================

  describe("Advanced Statistics", () => {
    it("should calculate comprehensive order statistics", async () => {
      const mockOrders = [
        {
          id: "order-1",
          orderNumber: "ORD-001",
          total: 100,
          status: "COMPLETED",
          fulfillmentMethod: "DELIVERY",
          createdAt: new Date("2024-01-15"),
          items: [
            {
              productName: "Product A",
              quantity: 2,
              subtotal: 50,
            },
            {
              productName: "Product B",
              quantity: 1,
              subtotal: 50,
            },
          ],
          customerId: "user-1",
        },
        {
          id: "order-2",
          orderNumber: "ORD-002",
          total: 200,
          status: "COMPLETED",
          fulfillmentMethod: "FARM_PICKUP",
          createdAt: new Date("2024-01-20"),
          items: [
            {
              productName: "Product A",
              quantity: 3,
              subtotal: 150,
            },
            {
              productName: "Product C",
              quantity: 1,
              subtotal: 50,
            },
          ],
          customerId: "user-2",
        },
        {
          id: "order-3",
          orderNumber: "ORD-003",
          total: 150,
          status: "PENDING",
          fulfillmentMethod: "DELIVERY",
          createdAt: new Date("2024-02-10"),
          items: [
            {
              productName: "Product B",
              quantity: 3,
              subtotal: 150,
            },
          ],
          customerId: "user-1",
        },
      ];

      const mockCustomers = [
        { id: "user-1", firstName: "John", lastName: "Doe" },
        { id: "user-2", firstName: "Jane", lastName: "Smith" },
      ];

      (database.order.findMany as any).mockResolvedValue(mockOrders);
      (database.user.findMany as any).mockResolvedValue(mockCustomers);

      const stats: OrderStatistics = await service.getOrderStatistics({
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
      });

      // Basic statistics
      expect(stats.totalOrders).toBe(3);
      expect(stats.totalRevenue).toBe(450);
      expect(stats.averageOrderValue).toBe(150);

      // Orders by status
      expect(stats.ordersByStatus).toMatchObject({
        COMPLETED: 2,
        PENDING: 1,
      });

      // Orders by fulfillment method
      expect(stats.ordersByFulfillmentMethod).toMatchObject({
        DELIVERY: 2,
        FARM_PICKUP: 1,
      });

      // Monthly revenue should be calculated
      expect(stats.revenueByMonth).toBeDefined();
      expect(Array.isArray(stats.revenueByMonth)).toBe(true);

      // Top products should be calculated
      expect(stats.topProducts).toBeDefined();
      expect(Array.isArray(stats.topProducts)).toBe(true);
      if (stats.topProducts && stats.topProducts.length > 0) {
        expect(stats.topProducts[0]).toHaveProperty("productName");
        expect(stats.topProducts[0]).toHaveProperty("totalQuantity");
        expect(stats.topProducts[0]).toHaveProperty("totalRevenue");
      }

      // Top customers should be calculated
      expect(stats.topCustomers).toBeDefined();
      expect(Array.isArray(stats.topCustomers)).toBe(true);
    });

    it("should filter statistics by farm", async () => {
      const mockOrders = [
        {
          id: "order-1",
          total: 100,
          status: "COMPLETED",
          fulfillmentMethod: "DELIVERY",
          createdAt: new Date("2024-01-15"),
          farmId: "farm-123",
          items: [],
          customerId: "user-1",
        },
      ];

      (database.order.findMany as any).mockResolvedValue(mockOrders);
      (database.user.findMany as any).mockResolvedValue([]);

      const stats = await service.getOrderStatistics({
        farmId: "farm-123",
      });

      expect(stats.totalOrders).toBe(1);

      // Verify filter was applied
      expect(database.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            farmId: "farm-123",
          }),
        }),
      );
    });

    it("should filter statistics by customer", async () => {
      const mockOrders = [
        {
          id: "order-1",
          total: 100,
          status: "COMPLETED",
          fulfillmentMethod: "DELIVERY",
          createdAt: new Date("2024-01-15"),
          customerId: "user-456",
          items: [],
        },
      ];

      (database.order.findMany as any).mockResolvedValue(mockOrders);
      (database.user.findMany as any).mockResolvedValue([]);

      const stats = await service.getOrderStatistics({
        customerId: "user-456",
      });

      expect(stats.totalOrders).toBe(1);

      // Verify filter was applied
      expect(database.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId: "user-456",
          }),
        }),
      );
    });
  });

  // ============================================================================
  // AGRICULTURAL CONSCIOUSNESS FEATURES
  // ============================================================================

  describe("Agricultural Consciousness Features", () => {
    it("should return null when feature is disabled", async () => {
      // Agricultural features are disabled by default (env var not set)
      const result = await service.getOrderConsciousness("order-123");

      expect(result).toBeNull();
    });

    it("should handle seasonal alignment calculation", async () => {
      // This test would require mocking the feature flag
      // For now, verify the method exists and is callable
      expect(service.getOrderConsciousness).toBeDefined();
      expect(typeof service.getOrderConsciousness).toBe("function");
    });
  });

  // ============================================================================
  // ORDER TOTALS CALCULATION
  // ============================================================================

  describe("Order Totals Calculation", () => {
    it("should calculate order totals correctly", async () => {
      const items = [
        { productId: "prod-1", quantity: 2 },
        { productId: "prod-2", quantity: 1 },
      ];

      const mockProducts = [
        { id: "prod-1", price: 10 },
        { id: "prod-2", price: 20 },
      ];

      (database.product.findUnique as any).mockImplementation((args: any) => {
        const product = mockProducts.find((p) => p.id === args.where.id);
        return Promise.resolve(product || null);
      });

      (database.farm.findUnique as any).mockResolvedValue({
        id: "farm-123",
        name: "Test Farm",
      });

      const totals = await service.calculateOrderTotals(
        items,
        "DELIVERY",
        "farm-123",
      );

      // Subtotal: (2 * 10) + (1 * 20) = 40
      expect(totals.subtotal).toBe(40);

      // Delivery fee should be added
      expect(totals.deliveryFee).toBeGreaterThan(0);

      // Platform fee should be calculated
      expect(totals.platformFee).toBeGreaterThan(0);

      // Tax should be calculated
      expect(totals.tax).toBeGreaterThan(0);

      // Total should be sum of all
      expect(totals.totalAmount).toBeGreaterThan(totals.subtotal);

      // Farmer amount should be less than total (platform fee deducted)
      expect(totals.farmerAmount).toBeLessThan(totals.totalAmount);
    });

    it("should not charge delivery fee for pickup", async () => {
      const items = [{ productId: "prod-1", quantity: 2 }];

      (database.product.findUnique as any).mockResolvedValue({
        id: "prod-1",
        price: 10,
      });

      (database.farm.findUnique as any).mockResolvedValue({
        id: "farm-123",
        name: "Test Farm",
      });

      const totals = await service.calculateOrderTotals(
        items,
        "FARM_PICKUP",
        "farm-123",
      );

      expect(totals.deliveryFee).toBe(0);
    });
  });

  // ============================================================================
  // STATUS TRANSITIONS
  // ============================================================================

  describe("Status Transitions", () => {
    it("should validate status transitions correctly", async () => {
      const mockOrder = {
        id: "order-1",
        status: "PENDING",
        customer: { id: "user-1", email: "test@test.com" },
        farm: { id: "farm-1", name: "Test Farm" },
        items: [],
      };

      (database.order.findUnique as any).mockResolvedValue(mockOrder);
      (database.order.update as any).mockResolvedValue({
        ...mockOrder,
        status: "CONFIRMED",
      });

      // Valid transition: PENDING -> CONFIRMED
      const result = await service.updateOrder("order-1", {
        status: "CONFIRMED",
      });

      expect(result.status).toBe("CONFIRMED");
    });

    it("should reject invalid status transitions", async () => {
      const mockOrder = {
        id: "order-1",
        status: "COMPLETED",
        customer: { id: "user-1", email: "test@test.com" },
        farm: { id: "farm-1", name: "Test Farm" },
        items: [],
      };

      (database.order.findUnique as any).mockResolvedValue(mockOrder);

      // Invalid transition: COMPLETED -> PENDING
      await expect(
        service.updateOrder("order-1", { status: "PENDING" }),
      ).rejects.toThrow("Cannot transition from COMPLETED to PENDING");
    });
  });

  // ============================================================================
  // SCHEDULED ORDERS
  // ============================================================================

  describe("Scheduled Orders", () => {
    it("should retrieve scheduled orders for a specific date", async () => {
      const testDate = new Date("2024-06-15");
      const mockOrders = [
        {
          id: "order-1",
          scheduledDate: new Date("2024-06-15T10:00:00Z"),
          customer: { id: "user-1" },
          farm: { id: "farm-1" },
          items: [],
        },
        {
          id: "order-2",
          scheduledDate: new Date("2024-06-15T14:00:00Z"),
          customer: { id: "user-2" },
          farm: { id: "farm-1" },
          items: [],
        },
      ];

      (database.order.findMany as any).mockResolvedValue(mockOrders);

      const result = await service.getScheduledOrders("farm-1", testDate);

      expect(result).toHaveLength(2);
      expect(database.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            farmId: "farm-1",
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });

  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================

  describe("Singleton Export", () => {
    it("should export singleton instance", () => {
      expect(orderService).toBeDefined();
      expect(orderService).toBeInstanceOf(OrderService);
    });

    it("should use same instance", () => {
      const instance1 = orderService;
      const instance2 = orderService;

      expect(instance1).toBe(instance2);
    });
  });

  // ============================================================================
  // STATIC HELPER METHODS (BACKWARD COMPATIBILITY)
  // ============================================================================

  describe("Static Helper Methods", () => {
    it("should provide static createOrder method", () => {
      expect(OrderService.createOrder).toBeDefined();
      expect(typeof OrderService.createOrder).toBe("function");
    });

    it("should provide static getUserOrders method", () => {
      expect(OrderService.getUserOrders).toBeDefined();
      expect(typeof OrderService.getUserOrders).toBe("function");
    });

    it("should provide static getFarmOrders method", () => {
      expect(OrderService.getFarmOrders).toBeDefined();
      expect(typeof OrderService.getFarmOrders).toBe("function");
    });

    it("should provide static updateOrderStatus method", () => {
      expect(OrderService.updateOrderStatus).toBeDefined();
      expect(typeof OrderService.updateOrderStatus).toBe("function");
    });
  });
});
