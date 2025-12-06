// src/__tests__/services/order.service.test.ts

import { database } from "@/lib/database";
import type { CreateOrderRequest } from "@/lib/services/order.service";
import { OrderService, orderService } from "@/lib/services/order.service";
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
    },
    farm: {
      findUnique: jest.fn(),
    },
    address: {
      findUnique: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe("OrderService - Divine Order Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("creates order with items", async () => {
      const mockInput: CreateOrderRequest = {
        customerId: "user-123",
        farmId: "farm-456",
        items: [
          {
            productId: "prod-1",
            quantity: 2,
          },
          {
            productId: "prod-2",
            quantity: 1,
          },
        ],
        fulfillmentMethod: "DELIVERY",
        deliveryAddressId: "addr-123",
        specialInstructions: "Test order",
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

      const mockProducts = [
        {
          id: "prod-1",
          name: "Product 1",
          price: 10,
          quantityAvailable: 100,
          status: "ACTIVE",
          farmId: "farm-456",
          unit: "lb",
        },
        {
          id: "prod-2",
          name: "Product 2",
          price: 20,
          quantityAvailable: 100,
          status: "ACTIVE",
          farmId: "farm-456",
          unit: "lb",
        },
      ];

      const mockAddress = {
        id: "addr-123",
        userId: "user-123",
        street: "123 Main St",
        city: "Portland",
        state: "OR",
        zipCode: "97201",
      };

      const mockResult = {
        id: "order-1",
        orderNumber: "ORD-123",
        status: "PENDING",
        total: 40,
        items: [],
        customer: mockUser,
        farm: mockFarm,
      };

      // Mock validation dependencies
      (database.user.findUnique as any).mockResolvedValue(mockUser);
      (database.farm.findUnique as any).mockResolvedValue(mockFarm);
      (database.address.findUnique as any).mockResolvedValue(mockAddress);

      // Mock product lookups for validation
      (database.product.findUnique as any).mockImplementation((args: any) => {
        const product = mockProducts.find((p) => p.id === args.where.id);
        return Promise.resolve(product || null);
      });

      (database.product.findMany as any).mockResolvedValue(mockProducts);

      // Mock transaction
      (database.$transaction as any).mockImplementation(
        async (callback: any) => {
          return await callback(database);
        },
      );
      (database.order.create as any).mockResolvedValue(mockResult);
      (database.order.findFirst as any).mockResolvedValue(null); // No existing order with same number

      const service = new OrderService();
      const result = await service.createOrder(mockInput);

      expect(result).toBeDefined();
      expect(result.id).toBe("order-1");
    });
  });

  describe("getOrderById", () => {
    it("retrieves order by ID", async () => {
      const mockOrder = {
        id: "order-123",
        items: [],
        farm: { id: "farm-1", name: "Farm" },
        user: { id: "user-1", name: "User", email: "user@test.com" },
      };

      (database.order.findUnique as any).mockResolvedValue(mockOrder);

      const result = await OrderService.getOrderById("order-123");

      expect(result).toEqual(mockOrder);
    });

    it("returns null for non-existent order", async () => {
      (database.order.findUnique as any).mockResolvedValue(null);

      const result = await OrderService.getOrderById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("updateOrderStatus", () => {
    it("updates order status", async () => {
      const mockOrder = {
        id: "order-1",
        status: "PENDING",
        customer: { id: "user-1", email: "test@test.com" },
        farm: { id: "farm-1", name: "Test Farm" },
        items: [],
      };

      const updatedMockOrder = { ...mockOrder, status: "CONFIRMED" };

      (database.order.findUnique as any).mockResolvedValue(mockOrder);
      (database.order.update as any).mockResolvedValue(updatedMockOrder);

      const result = await OrderService.updateOrderStatus(
        "order-1",
        "CONFIRMED",
      );

      expect(result.status).toBe("CONFIRMED");
    });
  });

  describe("getUserOrders", () => {
    it("retrieves all orders for user", async () => {
      const mockOrders = [
        {
          id: "order-1",
          items: [],
          farm: { id: "farm-1", name: "Farm" },
          customer: { id: "user-1", name: "User", email: "user@test.com" },
        },
        {
          id: "order-2",
          items: [],
          farm: { id: "farm-2", name: "Farm2" },
          customer: { id: "user-1", name: "User", email: "user@test.com" },
        },
      ];

      (database.order.findMany as any).mockResolvedValue(mockOrders);
      (database.order.count as any).mockResolvedValue(mockOrders.length);

      const result = await OrderService.getUserOrders("user-1");

      expect(result.orders).toEqual(mockOrders);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(2);
    });
  });

  describe("getFarmOrders", () => {
    it("retrieves all orders for farm", async () => {
      const mockOrders = [
        {
          id: "order-1",
          items: [],
          farm: { id: "farm-1", name: "Farm" },
          customer: { id: "user-1", name: "User", email: "user@test.com" },
        },
        {
          id: "order-2",
          items: [],
          farm: { id: "farm-1", name: "Farm" },
          customer: { id: "user-2", name: "User2", email: "user2@test.com" },
        },
      ];

      (database.order.findMany as any).mockResolvedValue(mockOrders);
      (database.order.count as any).mockResolvedValue(mockOrders.length);

      const result = await OrderService.getFarmOrders("farm-1");

      expect(result.orders).toEqual(mockOrders);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(2);
    });
  });
});
