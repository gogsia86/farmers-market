// src/__tests__/services/order.service.test.ts

import { database } from "@/lib/database";
import type { CreateOrderInput } from "@/lib/services/order.service";
import { OrderService } from "@/lib/services/order.service";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

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
      const mockInput: CreateOrderInput = {
        userId: "user-123",
        farmId: "farm-456",
        items: [
          {
            productId: "prod-1",
            productName: "Product 1",
            quantity: 2,
            price: 10,
            unit: "lb",
          },
          {
            productId: "prod-2",
            productName: "Product 2",
            quantity: 1,
            price: 20,
            unit: "lb",
          },
        ],
        shippingAddress: {
          street: "123 Main St",
          city: "Portland",
          state: "OR",
          zipCode: "97201",
        },
        fulfillmentMethod: "DELIVERY",
        notes: "Test order",
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
      };

      const mockProducts = [
        {
          id: "prod-1",
          name: "Product 1",
          price: 10,
          quantityAvailable: 100,
          status: "ACTIVE",
          farmId: "farm-456",
        },
        {
          id: "prod-2",
          name: "Product 2",
          price: 20,
          quantityAvailable: 100,
          status: "ACTIVE",
          farmId: "farm-456",
        },
      ];

      const mockResult = {
        id: "order-1",
        orderNumber: "ORD-123",
        items: [],
        customer: mockUser,
        farm: mockFarm,
      };

      (database.user.findUnique as any).mockResolvedValue(mockUser);
      (database.farm.findUnique as any).mockResolvedValue(mockFarm);
      (database.product.findMany as any).mockResolvedValue(mockProducts);
      (database.$transaction as any).mockImplementation(
        async (callback: any) => {
          return await callback(database);
        },
      );
      (database.order.create as any).mockResolvedValue(mockResult);

      const result = await OrderService.createOrder(mockInput);

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

      expect(result).toEqual(mockOrders);
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

      expect(result).toEqual(mockOrders);
    });
  });
});
