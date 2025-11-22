/**
 * 🚚 SHIPPING SERVICE TEST SUITE
 * Comprehensive tests for shipping calculations and tracking
 *
 * Coverage: 30+ tests for all shipping operations
 */

import { database } from "@/lib/database";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { ShippingService } from "../shipping.service";

// Mock the database
jest.mock("@/lib/database", () => ({
  database: {
    order: {
      update: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

describe("🚚 Shipping Service - Divine Shipping Operations", () => {
  const mockOrderId = "order-123";
  const mockDestination = {
    city: "Portland",
    state: "OR",
    zipCode: "97201",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("📦 calculateShippingRates", () => {
    it("should return shipping rates for valid destination", async () => {
      const rates = await ShippingService.calculateShippingRates(
        mockOrderId,
        mockDestination
      );

      expect(rates).toHaveLength(3);
      expect(rates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ service: "STANDARD" }),
          expect.objectContaining({ service: "EXPRESS" }),
          expect.objectContaining({ service: "OVERNIGHT" }),
        ])
      );
    });

    it("should return STANDARD shipping option", async () => {
      const rates = await ShippingService.calculateShippingRates(
        mockOrderId,
        mockDestination
      );

      const standard = rates.find((r) => r.service === "STANDARD");
      expect(standard).toMatchObject({
        service: "STANDARD",
        cost: 5.99,
        estimatedDays: 5,
      });
    });

    it("should return EXPRESS shipping option", async () => {
      const rates = await ShippingService.calculateShippingRates(
        mockOrderId,
        mockDestination
      );

      const express = rates.find((r) => r.service === "EXPRESS");
      expect(express).toMatchObject({
        service: "EXPRESS",
        cost: 12.99,
        estimatedDays: 2,
      });
    });

    it("should return OVERNIGHT shipping option", async () => {
      const rates = await ShippingService.calculateShippingRates(
        mockOrderId,
        mockDestination
      );

      const overnight = rates.find((r) => r.service === "OVERNIGHT");
      expect(overnight).toMatchObject({
        service: "OVERNIGHT",
        cost: 24.99,
        estimatedDays: 1,
      });
    });

    it("should handle different cities", async () => {
      const destinations = [
        { city: "Seattle", state: "WA", zipCode: "98101" },
        { city: "Los Angeles", state: "CA", zipCode: "90001" },
        { city: "New York", state: "NY", zipCode: "10001" },
      ];

      for (const dest of destinations) {
        const rates = await ShippingService.calculateShippingRates(
          mockOrderId,
          dest
        );
        expect(rates).toHaveLength(3);
      }
    });

    it("should handle different states", async () => {
      const states = ["CA", "NY", "TX", "FL", "IL"];

      for (const state of states) {
        const rates = await ShippingService.calculateShippingRates(
          mockOrderId,
          {
            city: "Test City",
            state,
            zipCode: "12345",
          }
        );
        expect(rates).toHaveLength(3);
      }
    });

    it("should handle different zip codes", async () => {
      const zipCodes = ["10001", "90210", "60601", "33101", "02101"];

      for (const zipCode of zipCodes) {
        const rates = await ShippingService.calculateShippingRates(
          mockOrderId,
          {
            city: "Test City",
            state: "CA",
            zipCode,
          }
        );
        expect(rates).toHaveLength(3);
      }
    });

    it("should return rates in order of cost (cheapest first)", async () => {
      const rates = await ShippingService.calculateShippingRates(
        mockOrderId,
        mockDestination
      );

      expect(rates[0].cost).toBeLessThan(rates[1].cost);
      expect(rates[1].cost).toBeLessThan(rates[2].cost);
    });

    it("should return rates in reverse order of speed", async () => {
      const rates = await ShippingService.calculateShippingRates(
        mockOrderId,
        mockDestination
      );

      expect(rates[0].estimatedDays).toBeGreaterThan(rates[1].estimatedDays);
      expect(rates[1].estimatedDays).toBeGreaterThan(rates[2].estimatedDays);
    });

    it("should have consistent rate structure", async () => {
      const rates = await ShippingService.calculateShippingRates(
        mockOrderId,
        mockDestination
      );

      rates.forEach((rate) => {
        expect(rate).toHaveProperty("service");
        expect(rate).toHaveProperty("cost");
        expect(rate).toHaveProperty("estimatedDays");
        expect(typeof rate.service).toBe("string");
        expect(typeof rate.cost).toBe("number");
        expect(typeof rate.estimatedDays).toBe("number");
      });
    });

    it("should return positive costs", async () => {
      const rates = await ShippingService.calculateShippingRates(
        mockOrderId,
        mockDestination
      );

      rates.forEach((rate) => {
        expect(rate.cost).toBeGreaterThan(0);
      });
    });

    it("should return positive estimated days", async () => {
      const rates = await ShippingService.calculateShippingRates(
        mockOrderId,
        mockDestination
      );

      rates.forEach((rate) => {
        expect(rate.estimatedDays).toBeGreaterThan(0);
      });
    });
  });

  describe("🏷️ createShippingLabel", () => {
    it("should create shipping label successfully", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      const result = await ShippingService.createShippingLabel(
        mockOrderId,
        "STANDARD"
      );

      expect(result).toHaveProperty("labelId");
      expect(result).toHaveProperty("trackingNumber");
      expect(result.labelId).toMatch(/^LBL\d+$/);
      expect(result.trackingNumber).toMatch(/^TRK\d+$/);
    });

    it("should update order status to PREPARING with tracking", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      await ShippingService.createShippingLabel(mockOrderId, "EXPRESS");

      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        data: {
          trackingNumber: expect.stringMatching(/^TRK\d+$/),
          shippingService: "EXPRESS",
          status: "PREPARING",
        },
      });
    });

    it("should update order with shipping service", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      await ShippingService.createShippingLabel(mockOrderId, "OVERNIGHT");

      const updateCall = jest.mocked(database.order.update).mock.calls[0][0];
      expect(updateCall.data).toMatchObject({ status: "PREPARING" });
    });

    it("should generate unique tracking numbers", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      const result1 = await ShippingService.createShippingLabel(
        "order-1",
        "STANDARD"
      );

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 2));

      const result2 = await ShippingService.createShippingLabel(
        "order-2",
        "STANDARD"
      );

      expect(result1.trackingNumber).not.toBe(result2.trackingNumber);
    });

    it("should generate unique label IDs", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      const result1 = await ShippingService.createShippingLabel(
        "order-1",
        "STANDARD"
      );

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 2));

      const result2 = await ShippingService.createShippingLabel(
        "order-2",
        "STANDARD"
      );

      expect(result1.labelId).not.toBe(result2.labelId);
    });

    it("should handle STANDARD service", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      const result = await ShippingService.createShippingLabel(
        mockOrderId,
        "STANDARD"
      );

      expect(result).toBeDefined();
      expect(database.order.update).toHaveBeenCalled();
    });

    it("should handle EXPRESS service", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      const result = await ShippingService.createShippingLabel(
        mockOrderId,
        "EXPRESS"
      );

      expect(result).toBeDefined();
      expect(database.order.update).toHaveBeenCalled();
    });

    it("should handle OVERNIGHT service", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      const result = await ShippingService.createShippingLabel(
        mockOrderId,
        "OVERNIGHT"
      );

      expect(result).toBeDefined();
      expect(database.order.update).toHaveBeenCalled();
    });

    it("should propagate database errors", async () => {
      jest.mocked(database.order.update).mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        ShippingService.createShippingLabel(mockOrderId, "STANDARD")
      ).rejects.toThrow("Database error");
    });
  });

  describe("📍 getTrackingInfo", () => {
    const mockTrackingNumber = "TRK1234567890";
    const mockOrder = {
      id: mockOrderId,
      status: "SHIPPED",
      trackingNumber: mockTrackingNumber,
    };

    it("should return tracking info for valid tracking number", async () => {
      jest.mocked(database.order.findFirst).mockResolvedValue(mockOrder as any);

      const info = await ShippingService.getTrackingInfo(mockTrackingNumber);

      expect(info).toHaveLength(1);
      expect(info[0]).toMatchObject({
        orderId: mockOrderId,
        status: "SHIPPED",
        location: "Distribution Center",
      });
    });

    it("should return empty array for invalid tracking number", async () => {
      jest.mocked(database.order.findFirst).mockResolvedValue(null);

      const info = await ShippingService.getTrackingInfo("INVALID123");

      expect(info).toEqual([]);
    });

    it("should include timestamp in tracking info", async () => {
      jest.mocked(database.order.findFirst).mockResolvedValue(mockOrder as any);

      const info = await ShippingService.getTrackingInfo(mockTrackingNumber);

      expect(info[0].timestamp).toBeInstanceOf(Date);
    });

    it("should query database with tracking number", async () => {
      jest.mocked(database.order.findFirst).mockResolvedValue(mockOrder as any);

      await ShippingService.getTrackingInfo(mockTrackingNumber);

      expect(database.order.findFirst).toHaveBeenCalledWith({
        where: { trackingNumber: mockTrackingNumber },
      });
    });

    it("should handle different order statuses", async () => {
      const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

      for (const status of statuses) {
        jest.mocked(database.order.findFirst).mockResolvedValue({
          ...mockOrder,
          status,
        } as any);

        const info = await ShippingService.getTrackingInfo(mockTrackingNumber);
        expect(info[0].status).toBe(status);
      }
    });

    it("should handle database errors", async () => {
      jest.mocked(database.order.findFirst).mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        ShippingService.getTrackingInfo(mockTrackingNumber)
      ).rejects.toThrow("Database error");
    });

    it("should return tracking info with correct structure", async () => {
      jest.mocked(database.order.findFirst).mockResolvedValue(mockOrder as any);

      const info = await ShippingService.getTrackingInfo(mockTrackingNumber);

      expect(info[0]).toHaveProperty("orderId");
      expect(info[0]).toHaveProperty("status");
      expect(info[0]).toHaveProperty("location");
      expect(info[0]).toHaveProperty("timestamp");
    });
  });

  describe("🔄 updateShippingStatus", () => {
    it("should update shipping status successfully", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      await ShippingService.updateShippingStatus(mockOrderId, "SHIPPED");

      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        data: { status: "SHIPPED" },
      });
    });

    it("should handle PENDING status", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      await ShippingService.updateShippingStatus(mockOrderId, "PENDING");

      const updateCall = jest.mocked(database.order.update).mock.calls[0][0];
      expect(updateCall.data).toMatchObject({ status: "PENDING" });
    });

    it("should handle invalid status by defaulting to PREPARING", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      // "PROCESSING" is not in valid statuses, so it defaults to "PREPARING"
      await ShippingService.updateShippingStatus(mockOrderId, "PROCESSING");

      const updateCall = jest.mocked(database.order.update).mock.calls[0][0];
      expect(updateCall.data).toMatchObject({ status: "PREPARING" });
    });

    it("should handle SHIPPED status", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      await ShippingService.updateShippingStatus(mockOrderId, "SHIPPED");

      const updateCall = jest.mocked(database.order.update).mock.calls[0][0];
      expect(updateCall.data).toMatchObject({ status: "SHIPPED" });
    });

    it("should handle DELIVERED status", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      await ShippingService.updateShippingStatus(mockOrderId, "DELIVERED");

      const updateCall = jest.mocked(database.order.update).mock.calls[0][0];
      expect(updateCall.data).toMatchObject({ status: "DELIVERED" });
    });

    it("should handle CANCELLED status", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      await ShippingService.updateShippingStatus(mockOrderId, "CANCELLED");

      const updateCall = jest.mocked(database.order.update).mock.calls[0][0];
      expect(updateCall.data).toMatchObject({ status: "CANCELLED" });
    });

    it("should propagate database errors", async () => {
      jest.mocked(database.order.update).mockRejectedValue(
        new Error("Update failed")
      );

      await expect(
        ShippingService.updateShippingStatus(mockOrderId, "SHIPPED")
      ).rejects.toThrow("Update failed");
    });

    it("should update status for different order IDs", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);

      const orderIds = ["order-1", "order-2", "order-3"];

      for (const orderId of orderIds) {
        await ShippingService.updateShippingStatus(orderId, "SHIPPED");
        expect(database.order.update).toHaveBeenCalledWith({
          where: { id: orderId },
          data: { status: "SHIPPED" },
        });
      }
    });
  });

  describe("🔄 Integration Scenarios", () => {
    it("should handle complete shipping workflow", async () => {
      jest.mocked(database.order.update).mockResolvedValue({} as any);
      jest.mocked(database.order.findFirst).mockResolvedValue({
        id: mockOrderId,
        status: "SHIPPED",
        trackingNumber: "TRK123",
      } as any);

      // Step 1: Calculate rates
      const rates = await ShippingService.calculateShippingRates(
        mockOrderId,
        mockDestination
      );
      expect(rates).toHaveLength(3);

      // Step 2: Create label
      const label = await ShippingService.createShippingLabel(
        mockOrderId,
        "EXPRESS"
      );
      expect(label.trackingNumber).toBeDefined();

      // Step 3: Update status
      await ShippingService.updateShippingStatus(mockOrderId, "SHIPPED");

      // Step 4: Get tracking
      const tracking = await ShippingService.getTrackingInfo(
        label.trackingNumber
      );
      expect(tracking).toBeDefined();
    });

    it("should handle rate calculation for multiple orders", async () => {
      const orderIds = ["order-1", "order-2", "order-3"];

      for (const orderId of orderIds) {
        const rates = await ShippingService.calculateShippingRates(
          orderId,
          mockDestination
        );
        expect(rates).toHaveLength(3);
      }
    });
  });
});

