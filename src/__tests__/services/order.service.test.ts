// src/__tests__/services/order.service.test.ts
import { database } from "@/lib/database";
import { OrderService } from "@/lib/services/order.service";
import type { CreateOrderInput } from "@/types/order.types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock database
vi.mock("@/lib/database", () => ({
  database: {
    order: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    orderItem: {
      createMany: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
    farm: {
      findUnique: vi.fn(),
    },
    orderStatusHistory: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(database)),
  },
}));

describe("OrderService - Divine Order Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createOrder - Manifest Order Reality", () => {
    it("creates order with quantum consciousness", async () => {
      const mockOrderInput: CreateOrderInput = {
        userId: "user-123",
        farmId: "farm-456",
        items: [
          { productId: "prod-1", quantity: 2, price: 10 },
          { productId: "prod-2", quantity: 1, price: 20 },
        ],
        deliveryMethod: "STANDARD",
        shippingAddress: {
          fullName: "John Farmer",
          street: "123 Divine St",
          city: "Agricultural City",
          state: "CA",
          zipCode: "12345",
        },
        subtotal: 40,
        tax: 4,
        shippingCost: 5,
        total: 49,
      };

      const mockCreatedOrder = {
        id: "order-789",
        orderNumber: "ORD-2025-001",
        userId: mockOrderInput.userId,
        farmId: mockOrderInput.farmId,
        status: "PENDING",
        subtotal: 40,
        tax: 4,
        shippingCost: 5,
        total: 49,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (database.order.create as any).mockResolvedValue(mockCreatedOrder);

      const result = await OrderService.createOrder(mockOrderInput);

      expect(result).toEqual(mockCreatedOrder);
      expect(database.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockOrderInput.userId,
            farmId: mockOrderInput.farmId,
            status: "PENDING",
            total: 49,
          }),
        })
      );
    });

    it("generates unique order numbers with temporal coherence", async () => {
      const mockOrders = [
        { orderNumber: "ORD-2025-001" },
        { orderNumber: "ORD-2025-002" },
      ];

      (database.order.create as any)
        .mockResolvedValueOnce({ ...mockOrders[0], id: "1" })
        .mockResolvedValueOnce({ ...mockOrders[1], id: "2" });

      const order1 = await OrderService.createOrder({} as any);
      const order2 = await OrderService.createOrder({} as any);

      expect(order1.orderNumber).toMatch(/^ORD-\d{4}-\d{3,}$/);
      expect(order2.orderNumber).toMatch(/^ORD-\d{4}-\d{3,}$/);
      expect(order1.orderNumber).not.toBe(order2.orderNumber);
    });

    it("calculates totals with divine precision", async () => {
      const input: CreateOrderInput = {
        userId: "user-1",
        farmId: "farm-1",
        items: [
          { productId: "p1", quantity: 3, price: 9.99 },
          { productId: "p2", quantity: 2, price: 14.99 },
        ],
        deliveryMethod: "STANDARD",
        shippingAddress: {} as any,
        subtotal: 59.95,
        tax: 5.4,
        shippingCost: 7.5,
        total: 72.85,
      };

      (database.order.create as any).mockResolvedValue({ id: "order-1" });

      await OrderService.createOrder(input);

      expect(database.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 59.95,
            tax: 5.4,
            shippingCost: 7.5,
            total: 72.85,
          }),
        })
      );
    });

    it("handles agricultural consciousness in order items", async () => {
      const input: CreateOrderInput = {
        userId: "farmer-1",
        farmId: "organic-farm-1",
        items: [
          { productId: "tomato-heirloom", quantity: 5, price: 3.99 },
          { productId: "lettuce-organic", quantity: 2, price: 2.5 },
        ],
        deliveryMethod: "FARM_PICKUP",
        shippingAddress: {} as any,
        subtotal: 24.95,
        tax: 2.25,
        shippingCost: 0,
        total: 27.2,
      };

      (database.order.create as any).mockResolvedValue({
        id: "order-agri-1",
        farmId: "organic-farm-1",
      });

      const result = await OrderService.createOrder(input);

      expect(result.farmId).toBe("organic-farm-1");
      expect(database.order.create).toHaveBeenCalled();
    });
  });

  describe("getOrder - Retrieve Order Consciousness", () => {
    it("retrieves order with complete quantum state", async () => {
      const mockOrder = {
        id: "order-123",
        orderNumber: "ORD-2025-001",
        status: "CONFIRMED",
        items: [
          {
            id: "item-1",
            productId: "prod-1",
            quantity: 2,
            price: 10,
            product: { name: "Organic Tomatoes", farmId: "farm-1" },
          },
        ],
        farm: {
          id: "farm-1",
          name: "Divine Farm",
        },
        statusHistory: [
          {
            status: "PENDING",
            changedAt: new Date("2025-01-01"),
          },
          {
            status: "CONFIRMED",
            changedAt: new Date("2025-01-02"),
          },
        ],
      };

      (database.order.findUnique as any).mockResolvedValue(mockOrder);

      const result = await OrderService.getOrder("order-123");

      expect(result).toEqual(mockOrder);
      expect(database.order.findUnique).toHaveBeenCalledWith({
        where: { id: "order-123" },
        include: expect.objectContaining({
          items: true,
          farm: true,
          statusHistory: true,
        }),
      });
    });

    it("returns null for non-existent orders", async () => {
      (database.order.findUnique as any).mockResolvedValue(null);

      const result = await OrderService.getOrder("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("updateOrderStatus - Transform Order Reality", () => {
    it("updates status with temporal tracking", async () => {
      const mockOrder = {
        id: "order-1",
        status: "PENDING",
      };

      (database.order.findUnique as any).mockResolvedValue(mockOrder);
      (database.order.update as any).mockResolvedValue({
        ...mockOrder,
        status: "CONFIRMED",
      });

      const result = await OrderService.updateOrderStatus(
        "order-1",
        "CONFIRMED"
      );

      expect(result.status).toBe("CONFIRMED");
      expect(database.orderStatusHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId: "order-1",
          status: "CONFIRMED",
        }),
      });
    });

    it("preserves agricultural consciousness during status change", async () => {
      const farmOrder = {
        id: "farm-order-1",
        status: "PENDING",
        farmId: "organic-farm-1",
        deliveryMethod: "FARM_PICKUP",
      };

      (database.order.findUnique as any).mockResolvedValue(farmOrder);
      (database.order.update as any).mockResolvedValue({
        ...farmOrder,
        status: "READY_FOR_PICKUP",
      });

      const result = await OrderService.updateOrderStatus(
        "farm-order-1",
        "READY_FOR_PICKUP"
      );

      expect(result.farmId).toBe("organic-farm-1");
      expect(result.deliveryMethod).toBe("FARM_PICKUP");
    });
  });

  describe("getUserOrders - List User Order History", () => {
    it("retrieves all orders for user with quantum pagination", async () => {
      const mockOrders = [
        {
          id: "order-1",
          userId: "user-123",
          status: "DELIVERED",
          total: 50,
        },
        {
          id: "order-2",
          userId: "user-123",
          status: "PENDING",
          total: 30,
        },
      ];

      (database.order.findMany as any).mockResolvedValue(mockOrders);

      const result = await OrderService.getUserOrders("user-123", {
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual(mockOrders);
      expect(database.order.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        take: 10,
        skip: 0,
        orderBy: { createdAt: "desc" },
        include: expect.any(Object),
      });
    });

    it("filters orders by status with divine precision", async () => {
      (database.order.findMany as any).mockResolvedValue([]);

      await OrderService.getUserOrders("user-123", {
        status: "DELIVERED",
        limit: 20,
        offset: 0,
      });

      expect(database.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: "user-123",
            status: "DELIVERED",
          },
        })
      );
    });
  });

  describe("cancelOrder - Manifest Order Cancellation", () => {
    it("cancels order and updates consciousness state", async () => {
      const mockOrder = {
        id: "order-cancel-1",
        status: "PENDING",
      };

      (database.order.findUnique as any).mockResolvedValue(mockOrder);
      (database.order.update as any).mockResolvedValue({
        ...mockOrder,
        status: "CANCELLED",
      });

      const result = await OrderService.cancelOrder(
        "order-cancel-1",
        "Customer requested"
      );

      expect(result.status).toBe("CANCELLED");
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "order-cancel-1" },
        data: {
          status: "CANCELLED",
          cancelledAt: expect.any(Date),
          cancellationReason: "Customer requested",
        },
      });
    });

    it("prevents cancellation of shipped orders", async () => {
      const shippedOrder = {
        id: "order-shipped-1",
        status: "SHIPPED",
      };

      (database.order.findUnique as any).mockResolvedValue(shippedOrder);

      await expect(
        OrderService.cancelOrder("order-shipped-1", "Too late")
      ).rejects.toThrow("Cannot cancel shipped order");
    });
  });

  describe("getFarmOrders - Agricultural Farm Order Retrieval", () => {
    it("retrieves all orders for farm with biodynamic filtering", async () => {
      const farmOrders = [
        { id: "order-f1", farmId: "farm-1", status: "PENDING" },
        { id: "order-f2", farmId: "farm-1", status: "CONFIRMED" },
      ];

      (database.order.findMany as any).mockResolvedValue(farmOrders);

      const result = await OrderService.getFarmOrders("farm-1", {
        limit: 20,
        offset: 0,
      });

      expect(result).toEqual(farmOrders);
      expect(database.order.findMany).toHaveBeenCalledWith({
        where: { farmId: "farm-1" },
        take: 20,
        skip: 0,
        orderBy: { createdAt: "desc" },
        include: expect.any(Object),
      });
    });
  });

  describe("Edge Cases - Reality Boundary Testing", () => {
    it("handles empty item arrays with grace", async () => {
      const emptyOrderInput: CreateOrderInput = {
        userId: "user-1",
        farmId: "farm-1",
        items: [],
        deliveryMethod: "STANDARD",
        shippingAddress: {} as any,
        subtotal: 0,
        tax: 0,
        shippingCost: 0,
        total: 0,
      };

      await expect(OrderService.createOrder(emptyOrderInput)).rejects.toThrow(
        "Order must contain at least one item"
      );
    });

    it("validates negative quantities with divine wisdom", async () => {
      const invalidInput: CreateOrderInput = {
        userId: "user-1",
        farmId: "farm-1",
        items: [{ productId: "p1", quantity: -5, price: 10 }],
        deliveryMethod: "STANDARD",
        shippingAddress: {} as any,
        subtotal: -50,
        tax: 0,
        shippingCost: 0,
        total: -50,
      };

      await expect(OrderService.createOrder(invalidInput)).rejects.toThrow(
        "Invalid quantity"
      );
    });

    it("handles database failures with enlightening errors", async () => {
      (database.order.create as any).mockRejectedValue(
        new Error("Database connection lost")
      );

      await expect(OrderService.createOrder({} as any)).rejects.toThrow(
        "Database connection lost"
      );
    });
  });
});
