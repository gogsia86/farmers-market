// src/__tests__/services/order.service.test.ts

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OrderService } from "@/lib/services/order.service";
import type { CreateOrderInput } from "@/lib/services/order.service";
import { database } from "@/lib/database";

// Mock database
vi.mock("@/lib/database", () => ({
  database: {
    order: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("OrderService - Divine Order Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createOrder", () => {
    it("creates order with items", async () => {
      const mockInput: CreateOrderInput = {
        userId: "user-123",
        farmId: "farm-456",
        items: [
          { productId: "prod-1", quantity: 2, price: 10 },
          { productId: "prod-2", quantity: 1, price: 20 },
        ],
        shippingAddress: {
          street: "123 Main St",
          city: "Portland",
          state: "OR",
          zipCode: "97201",
        },
        paymentMethod: "CREDIT_CARD",
      };

      const mockResult = {
        id: "order-1",
        orderNumber: "ORD-123",
        items: [],
        farm: { id: "farm-456", name: "Test Farm" },
        user: { id: "user-123", name: "Test User", email: "test@test.com" },
      };

      (database.order.create as any).mockResolvedValue(mockResult);

      const result = await OrderService.createOrder(mockInput);

      expect(result).toEqual(mockResult);
      expect(database.order.create).toHaveBeenCalled();
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
      const mockOrder = { id: "order-1", status: "CONFIRMED" };

      (database.order.update as any).mockResolvedValue(mockOrder);

      const result = await OrderService.updateOrderStatus("order-1", "CONFIRMED");

      expect(result.status).toBe("CONFIRMED");
    });
  });

  describe("getUserOrders", () => {
    it("retrieves all orders for user", async () => {
      const mockOrders = [
        { id: "order-1", items: [], farm: {id: "f1", name: "F1"}, user: {id: "u1", name: "U1", email: "u1@test.com"} },
        { id: "order-2", items: [], farm: {id: "f2", name: "F2"}, user: {id: "u1", name: "U1", email: "u1@test.com"} },
      ];

      (database.order.findMany as any).mockResolvedValue(mockOrders);

      const result = await OrderService.getUserOrders("user-1");

      expect(result).toEqual(mockOrders);
    });
  });

  describe("getFarmOrders", () => {
    it("retrieves all orders for farm", async () => {
      const mockOrders = [
        { id: "order-1", items: [], farm: {id: "f1", name: "F1"}, user: {id: "u1", name: "U1", email: "u1@test.com"} },
      ];

      (database.order.findMany as any).mockResolvedValue(mockOrders);

      const result = await OrderService.getFarmOrders("farm-1");

      expect(result).toEqual(mockOrders);
    });
  });
});
