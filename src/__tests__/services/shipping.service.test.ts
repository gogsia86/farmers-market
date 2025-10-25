// src/__tests__/services/shipping.service.test.ts
import { database } from "@/lib/database";
import { ShippingService } from "@/lib/services/shipping.service";
import type { CalculateShippingInput } from "@/types/shipping.types";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@/lib/database");
vi.mock("@/lib/shipping/rate-calculator");
vi.mock("@/lib/shipping/tracking");

describe("ShippingService - Divine Shipping Orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateRates - Manifest Shipping Reality", () => {
    it("calculates distance-based rates with quantum precision", async () => {
      const input: CalculateShippingInput = {
        farmId: "farm-123",
        deliveryZipCode: "12345",
        orderWeight: 10,
        orderValue: 50,
        deliveryMethod: "STANDARD",
      };

      const mockRates = [
        {
          method: "STANDARD",
          carrier: "USPS",
          rate: 7.5,
          estimatedDays: 5,
          isFree: false,
        },
      ];

      vi.mocked(
        require("@/lib/shipping/rate-calculator").calculateShippingRate
      ).mockResolvedValue(mockRates);

      const result = await ShippingService.calculateRates(input);

      expect(result).toEqual(mockRates);
      expect(result[0].rate).toBe(7.5);
    });

    it("applies free shipping threshold with agricultural consciousness", async () => {
      const highValueInput: CalculateShippingInput = {
        farmId: "organic-farm-456",
        deliveryZipCode: "54321",
        orderWeight: 5,
        orderValue: 100, // Above free shipping threshold
        deliveryMethod: "STANDARD",
      };

      const mockFreeShipping = [
        {
          method: "STANDARD",
          carrier: "USPS",
          rate: 0,
          estimatedDays: 5,
          isFree: true,
          reason: "Free shipping on orders over $75",
        },
      ];

      vi.mocked(
        require("@/lib/shipping/rate-calculator").calculateShippingRate
      ).mockResolvedValue(mockFreeShipping);

      const result = await ShippingService.calculateRates(highValueInput);

      expect(result[0].isFree).toBe(true);
      expect(result[0].rate).toBe(0);
    });

    it("validates delivery address is in service area", async () => {
      const invalidInput: CalculateShippingInput = {
        farmId: "farm-789",
        deliveryZipCode: "99999", // Not in service area
        orderWeight: 3,
        orderValue: 30,
        deliveryMethod: "STANDARD",
      };

      vi.mocked(
        require("@/lib/shipping/rate-calculator").validateDeliveryAddress
      ).mockResolvedValue({
        valid: false,
        message: "Sorry, we don't deliver to this ZIP code yet.",
      });

      await expect(
        ShippingService.calculateRates(invalidInput)
      ).rejects.toThrow("Sorry, we don't deliver to this ZIP code yet.");
    });
  });

  describe("getTracking - Retrieve Tracking Consciousness", () => {
    it("retrieves USPS tracking with quantum awareness", async () => {
      const mockTracking = {
        trackingNumber: "9400123456789000000",
        carrier: "USPS",
        status: "IN_TRANSIT",
        currentLocation: "Los Angeles, CA",
        estimatedDelivery: new Date("2025-10-30"),
        events: [
          {
            timestamp: new Date("2025-10-25"),
            status: "LABEL_CREATED",
            location: "Farm Origin",
            description: "Shipping label created",
          },
        ],
      };

      vi.mocked(
        require("@/lib/shipping/tracking").getTrackingInfo
      ).mockResolvedValue(mockTracking);

      const result = await ShippingService.getTracking("9400123456789000000");

      expect(result.carrier).toBe("USPS");
      expect(result.status).toBe("IN_TRANSIT");
      expect(result.events).toHaveLength(1);
    });

    it("parses tracking number format with divine wisdom", async () => {
      const upsNumber = "1Z999AA10123456784";

      vi.mocked(
        require("@/lib/shipping/tracking").parseTrackingNumber
      ).mockReturnValue({ carrier: "UPS", valid: true });

      await ShippingService.getTracking(upsNumber);

      expect(
        require("@/lib/shipping/tracking").getTrackingInfo
      ).toHaveBeenCalledWith(upsNumber, "UPS");
    });

    it("handles invalid tracking numbers with enlightening errors", async () => {
      vi.mocked(
        require("@/lib/shipping/tracking").parseTrackingNumber
      ).mockReturnValue({ carrier: "USPS", valid: false });

      await expect(
        ShippingService.getTracking("invalid-number")
      ).rejects.toThrow("Invalid tracking number format");
    });
  });

  describe("createLabel - Generate Shipping Label", () => {
    it("creates shipping label with agricultural precision", async () => {
      const mockOrder = {
        id: "order-123",
        farm: {
          name: "Divine Farm",
          address: "123 Farm Rd",
          city: "Farmville",
          state: "CA",
          zipCode: "12345",
        },
        shippingAddress: {
          fullName: "John Customer",
          street: "456 Customer St",
          city: "Customertown",
          state: "CA",
          zipCode: "54321",
        },
        items: [
          {
            product: { weight: 2 },
            quantity: 3,
          },
        ],
      };

      (database.order.findUnique as any) = vi.fn().mockResolvedValue(mockOrder);

      const mockLabel = {
        trackingNumber: "1Z999AA10123456784",
        labelUrl: "https://example.com/labels/label123.pdf",
      };

      vi.mocked(
        require("@/lib/shipping/tracking").createShippingLabel
      ).mockResolvedValue(mockLabel);

      (database.order.update as any) = vi.fn().mockResolvedValue({
        ...mockOrder,
        trackingNumber: mockLabel.trackingNumber,
      });

      const result = await ShippingService.createLabel("order-123", "UPS");

      expect(result.trackingNumber).toBe("1Z999AA10123456784");
      expect(database.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "order-123" },
          data: expect.objectContaining({
            trackingNumber: "1Z999AA10123456784",
            shippingCarrier: "UPS",
          }),
        })
      );
    });

    it("calculates total weight with biodynamic mathematics", async () => {
      const heavyOrder = {
        id: "heavy-order-456",
        farm: {} as any,
        shippingAddress: {} as any,
        items: [
          { product: { weight: 5 }, quantity: 2 }, // 10 lbs
          { product: { weight: 3 }, quantity: 3 }, // 9 lbs
        ],
      };

      (database.order.findUnique as any) = vi
        .fn()
        .mockResolvedValue(heavyOrder);

      await ShippingService.createLabel("heavy-order-456", "FEDEX");

      expect(
        require("@/lib/shipping/tracking").createShippingLabel
      ).toHaveBeenCalledWith(
        "heavy-order-456",
        "FEDEX",
        expect.any(Object),
        expect.any(Object),
        expect.objectContaining({
          weight: 19, // 10 + 9
        })
      );
    });
  });

  describe("getDeliverySlots - Agricultural Slot Management", () => {
    it("retrieves available delivery slots with temporal awareness", async () => {
      const mockSlots = [
        {
          id: "slot-1",
          farmId: "farm-123",
          date: new Date("2025-10-30"),
          startTime: "10:00",
          endTime: "12:00",
          maxOrders: 10,
          currentOrders: 3,
          isAvailable: true,
        },
        {
          id: "slot-2",
          farmId: "farm-123",
          date: new Date("2025-10-30"),
          startTime: "14:00",
          endTime: "16:00",
          maxOrders: 10,
          currentOrders: 10,
          isAvailable: false,
        },
      ];

      (database.deliverySlot.findMany as any) = vi
        .fn()
        .mockResolvedValue(mockSlots.map((s) => ({ ...s })));

      const result = await ShippingService.getDeliverySlots(
        "farm-123",
        new Date("2025-10-30"),
        new Date("2025-10-31")
      );

      expect(result).toHaveLength(2);
      expect(result[0].isAvailable).toBe(true);
      expect(result[1].isAvailable).toBe(false);
    });
  });

  describe("reserveDeliverySlot - Quantum Slot Reservation", () => {
    it("reserves slot and updates order with consciousness preservation", async () => {
      const mockSlot = {
        id: "slot-123",
        farmId: "farm-456",
        date: new Date("2025-10-30"),
        startTime: "10:00",
        endTime: "12:00",
        maxOrders: 10,
        currentOrders: 5,
      };

      (database.deliverySlot.findUnique as any) = vi
        .fn()
        .mockResolvedValue(mockSlot);

      (database.$transaction as any) = vi.fn().mockImplementation((cb) =>
        cb({
          deliverySlot: {
            update: vi.fn().mockResolvedValue({
              ...mockSlot,
              currentOrders: 6,
            }),
          },
          order: {
            update: vi.fn().mockResolvedValue({}),
          },
        })
      );

      const result = await ShippingService.reserveDeliverySlot(
        "slot-123",
        "order-789"
      );

      expect(result.currentOrders).toBe(6);
    });

    it("prevents over-booking with divine protection", async () => {
      const fullSlot = {
        id: "slot-full",
        maxOrders: 10,
        currentOrders: 10, // Already full
      };

      (database.deliverySlot.findUnique as any) = vi
        .fn()
        .mockResolvedValue(fullSlot);

      await expect(
        ShippingService.reserveDeliverySlot("slot-full", "order-999")
      ).rejects.toThrow("Delivery slot is full");
    });
  });

  describe("getPickupLocations - Farm Pickup Consciousness", () => {
    it("retrieves active pickup locations with agricultural awareness", async () => {
      const mockLocations = [
        {
          id: "loc-1",
          farmId: "farm-123",
          name: "Main Farm Store",
          address: "123 Farm Rd",
          city: "Farmville",
          state: "CA",
          zipCode: "12345",
          instructions: "Park in back",
          hours: {
            monday: { open: "09:00", close: "17:00" },
            tuesday: { open: "09:00", close: "17:00" },
          },
          isActive: true,
        },
      ];

      (database.pickupLocation.findMany as any) = vi
        .fn()
        .mockResolvedValue(mockLocations);

      const result = await ShippingService.getPickupLocations("farm-123");

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Main Farm Store");
      expect(result[0].hours.monday.open).toBe("09:00");
    });

    it("filters inactive locations with quantum consciousness", async () => {
      (database.pickupLocation.findMany as any) = vi.fn();

      await ShippingService.getPickupLocations("farm-456");

      expect(database.pickupLocation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { farmId: "farm-456", isActive: true },
        })
      );
    });
  });

  describe("Edge Cases - Reality Boundary Testing", () => {
    it("handles missing order with enlightening error", async () => {
      (database.order.findUnique as any) = vi.fn().mockResolvedValue(null);

      await expect(
        ShippingService.createLabel("non-existent-order", "USPS")
      ).rejects.toThrow("Order not found");
    });

    it("handles missing shipping address gracefully", async () => {
      const orderWithoutAddress = {
        id: "order-no-address",
        farm: {} as any,
        shippingAddress: null,
        items: [],
      };

      (database.order.findUnique as any) = vi
        .fn()
        .mockResolvedValue(orderWithoutAddress);

      await expect(
        ShippingService.createLabel("order-no-address", "USPS")
      ).rejects.toThrow("Shipping address not found");
    });
  });
});
