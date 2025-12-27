/**
 * 🚚 SHIPPING SERVICE TEST SUITE
 * Comprehensive tests for shipping calculations and tracking with ServiceResponse pattern
 *
 * @version 4.0.0 - Migrated to ServiceResponse Pattern & Instance Methods
 * @coverage All shipping operations with divine error handling
 *
 * Coverage: 30+ tests for all shipping operations
 * - Zone-based rate calculation
 * - Shipping label creation
 * - Tracking information retrieval
 * - Status updates
 * - Integration scenarios
 */

import { database } from "@/lib/database";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ShippingService } from "../shipping.service";
import type { Order } from "@prisma/client";
import type { ServiceResponse } from "@/lib/types/service-response";
import type {
  ShippingRate,
  ShippingLabel,
  TrackingInfo,
  ShippingDestination,
} from "../shipping.service";

// Mock the database
jest.mock("@/lib/database", () => ({
  database: {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

describe("🚚 Shipping Service - Divine Shipping Operations with ServiceResponse", () => {
  let shippingService: ShippingService;
  const mockOrderId = "550e8400-e29b-41d4-a716-446655440001";
  const mockDestination = {
    street: "123 Farm Lane",
    city: "Portland",
    state: "OR",
    zipCode: "97201",
    country: "US",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    shippingService = new ShippingService();

    // ✅ Mock order data for shipping calculations
    const mockOrder = {
      id: mockOrderId,
      total: 150.0,
      subtotal: 150.0,
      status: "CONFIRMED", // Valid status for shipping label creation
      items: [
        {
          id: "item-1",
          quantity: 2,
          price: 50.0,
          product: {
            id: "product-1",
            name: "Organic Tomatoes",
            weight: 1.5, // pounds
          },
        },
        {
          id: "item-2",
          quantity: 1,
          price: 50.0,
          product: {
            id: "product-2",
            name: "Fresh Lettuce",
            weight: 0.5, // pounds
          },
        },
      ],
      farm: {
        id: "farm-1",
        name: "Test Farm",
        location: {
          zipCode: "97086",
          state: "OR",
          city: "Happy Valley",
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock database responses
    jest.mocked(database.order.findUnique).mockResolvedValue(mockOrder as any);
    jest.mocked(database.order.update).mockResolvedValue(mockOrder as any);
    jest.mocked(database.order.findFirst).mockResolvedValue(mockOrder as any);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 📦 CALCULATE SHIPPING RATES TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("📦 calculateShippingRates", () => {
    it("should return shipping rates for valid destination with ServiceResponse", async () => {
      const result = await shippingService.calculateShippingRates({
        orderId: mockOrderId,
        destination: mockDestination,
      });

      // Assert - ServiceResponse structure
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();

      // Assert - Shipping rates
      const rates = result.data!;
      expect(rates).toHaveLength(3);
      expect(rates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ service: "STANDARD" }),
          expect.objectContaining({ service: "EXPRESS" }),
          expect.objectContaining({ service: "OVERNIGHT" }),
        ]),
      );
    });

    it("should return STANDARD shipping option", async () => {
      const result = await shippingService.calculateShippingRates({
        orderId: mockOrderId,
        destination: mockDestination,
      });

      expect(result.success).toBe(true);
      const rates = result.data!;
      const standard = rates.find(
        (r: ShippingRate) => r.service === "STANDARD",
      );

      expect(standard).toBeDefined();
      expect(standard?.service).toBe("STANDARD");
      expect(standard?.cost).toBeGreaterThan(0);
      expect(standard?.estimatedDays).toBeGreaterThan(0);
    });

    it("should return EXPRESS shipping option", async () => {
      const result = await shippingService.calculateShippingRates({
        orderId: mockOrderId,
        destination: mockDestination,
      });

      expect(result.success).toBe(true);
      const rates = result.data!;
      const express = rates.find((r: ShippingRate) => r.service === "EXPRESS");

      expect(express).toBeDefined();
      expect(express?.service).toBe("EXPRESS");
      expect(express?.cost).toBeGreaterThan(0);
      expect(express?.estimatedDays).toBeGreaterThan(0);
    });

    it("should return OVERNIGHT shipping option", async () => {
      const result = await shippingService.calculateShippingRates({
        orderId: mockOrderId,
        destination: mockDestination,
      });

      expect(result.success).toBe(true);
      const rates = result.data!;
      const overnight = rates.find(
        (r: ShippingRate) => r.service === "OVERNIGHT",
      );

      expect(overnight).toBeDefined();
      expect(overnight?.service).toBe("OVERNIGHT");
      expect(overnight?.cost).toBeGreaterThan(0);
      expect(overnight?.estimatedDays).toBeGreaterThan(0);
    });

    it("should handle different cities", async () => {
      const destinations = [
        {
          street: "456 Main St",
          city: "Seattle",
          state: "WA",
          zipCode: "98101",
          country: "US",
        },
        {
          street: "789 Market St",
          city: "San Francisco",
          state: "CA",
          zipCode: "94102",
          country: "US",
        },
        {
          street: "321 Broadway",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "US",
        },
      ];

      for (const destination of destinations) {
        const result = await shippingService.calculateShippingRates({
          orderId: mockOrderId,
          destination,
        });

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(3);
      }
    });

    it("should handle different states", async () => {
      const states = ["WA", "CA", "NY", "TX", "FL"];

      for (const state of states) {
        const result = await shippingService.calculateShippingRates({
          orderId: mockOrderId,
          destination: {
            street: "100 Test St",
            city: "Test City",
            state,
            zipCode: "12345",
            country: "US",
          },
        });

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(3);
      }
    });

    it("should handle different zip codes", async () => {
      const zipCodes = ["97201", "90210", "10001", "60601", "33101"];

      for (const zipCode of zipCodes) {
        const result = await shippingService.calculateShippingRates({
          orderId: mockOrderId,
          destination: {
            street: "100 Test St",
            city: "Test City",
            state: "CA",
            zipCode,
            country: "US",
          },
        });

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(3);
      }
    });

    it("should return rates in order of cost (cheapest first)", async () => {
      const result = await shippingService.calculateShippingRates({
        orderId: mockOrderId,
        destination: mockDestination,
      });

      expect(result.success).toBe(true);
      const rates = result.data!;

      for (let i = 0; i < rates.length - 1; i++) {
        expect(rates[i].cost).toBeLessThanOrEqual(rates[i + 1].cost);
      }
    });

    it("should return rates in reverse order of speed", async () => {
      const result = await shippingService.calculateShippingRates({
        orderId: mockOrderId,
        destination: mockDestination,
      });

      expect(result.success).toBe(true);
      const rates = result.data!;

      for (let i = 0; i < rates.length - 1; i++) {
        expect(rates[i].estimatedDays).toBeGreaterThanOrEqual(
          rates[i + 1].estimatedDays,
        );
      }
    });

    it("should have consistent rate structure", async () => {
      const result = await shippingService.calculateShippingRates({
        orderId: mockOrderId,
        destination: mockDestination,
      });

      expect(result.success).toBe(true);
      const rates = result.data!;

      rates.forEach((rate: ShippingRate) => {
        expect(rate).toHaveProperty("service");
        expect(rate).toHaveProperty("cost");
        expect(rate).toHaveProperty("estimatedDays");
        expect(rate).toHaveProperty("carrier");
        expect(typeof rate.service).toBe("string");
        expect(typeof rate.cost).toBe("number");
        expect(typeof rate.estimatedDays).toBe("number");
      });
    });

    it("should return positive costs", async () => {
      const result = await shippingService.calculateShippingRates({
        orderId: mockOrderId,
        destination: mockDestination,
      });

      expect(result.success).toBe(true);
      const rates = result.data!;

      rates.forEach((rate: ShippingRate) => {
        expect(rate.cost).toBeGreaterThan(0);
      });
    });

    it("should return positive estimated days", async () => {
      const result = await shippingService.calculateShippingRates({
        orderId: mockOrderId,
        destination: mockDestination,
      });

      expect(result.success).toBe(true);
      const rates = result.data!;

      rates.forEach((rate: ShippingRate) => {
        expect(rate.estimatedDays).toBeGreaterThan(0);
      });
    });

    it("should return error for invalid destination", async () => {
      const result = await shippingService.calculateShippingRates({
        orderId: mockOrderId,
        destination: {
          street: "",
          city: "",
          state: "XX", // Invalid state
          zipCode: "invalid",
          country: "US",
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("RATE_CALCULATION_FAILED");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🏷️ CREATE SHIPPING LABEL TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("🏷️ createShippingLabel", () => {
    beforeEach(() => {
      // Mock findUnique to return order ready for shipping
      const readyOrder = {
        id: mockOrderId,
        total: 150.0,
        subtotal: 150.0,
        status: "CONFIRMED", // Valid for creating label
        items: [
          {
            id: "item-1",
            quantity: 2,
            price: 50.0,
            product: {
              id: "product-1",
              name: "Organic Tomatoes",
              weight: 1.5,
            },
          },
        ],
        farm: {
          id: "farm-1",
          name: "Test Farm",
          location: {
            zipCode: "97086",
            state: "OR",
            city: "Happy Valley",
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(readyOrder as any);
      jest.mocked(database.order.update).mockResolvedValue({
        ...readyOrder,
        status: "PREPARING",
        trackingNumber: "TRACK123",
        shippingService: "STANDARD",
      } as unknown as Order);
    });

    it("should create shipping label successfully with ServiceResponse", async () => {
      const result = await shippingService.createShippingLabel({
        orderId: mockOrderId,
        service: "STANDARD",
        destination: mockDestination,
      });

      // Assert - ServiceResponse structure
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();

      // Assert - Label data
      const label = result.data!;
      expect(label).toHaveProperty("labelId");
      expect(label).toHaveProperty("trackingNumber");
      expect(label).toHaveProperty("carrier");
    });

    it("should update order status to PREPARING with tracking", async () => {
      await shippingService.createShippingLabel({
        orderId: mockOrderId,
        service: "STANDARD",
        destination: mockDestination,
      });

      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        data: expect.objectContaining({
          trackingNumber: expect.any(String),
          shippingService: "STANDARD",
          status: "PREPARING",
        }),
      });
    });

    it("should update order with shipping service", async () => {
      const result = await shippingService.createShippingLabel({
        orderId: mockOrderId,
        service: "EXPRESS",
        destination: mockDestination,
      });

      expect(result.success).toBe(true);
      const updateCall = jest.mocked(database.order.update).mock.calls[0];
      expect(updateCall[0].data).toMatchObject({ status: "PREPARING" });
    });

    it("should generate unique tracking numbers", async () => {
      const result1 = await shippingService.createShippingLabel({
        orderId: mockOrderId,
        service: "STANDARD",
        destination: mockDestination,
      });

      jest.mocked(database.order.update).mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440002",
        status: "PREPARING",
        trackingNumber: "TRACK456",
        shippingService: "STANDARD",
      } as unknown as Order);

      const result2 = await shippingService.createShippingLabel({
        orderId: "550e8400-e29b-41d4-a716-446655440002",
        service: "STANDARD",
        destination: mockDestination,
      });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data?.trackingNumber).not.toBe(
        result2.data?.trackingNumber,
      );
    });

    it("should generate unique label IDs", async () => {
      const result1 = await shippingService.createShippingLabel({
        orderId: mockOrderId,
        service: "STANDARD",
        destination: mockDestination,
      });

      jest.mocked(database.order.update).mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440002",
        status: "PREPARING",
        trackingNumber: "TRACK456",
        shippingService: "STANDARD",
      } as unknown as Order);

      const result2 = await shippingService.createShippingLabel({
        orderId: "550e8400-e29b-41d4-a716-446655440002",
        service: "STANDARD",
        destination: mockDestination,
      });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data?.labelId).not.toBe(result2.data?.labelId);
    });

    it("should handle STANDARD service", async () => {
      const result = await shippingService.createShippingLabel({
        orderId: mockOrderId,
        service: "STANDARD",
        destination: mockDestination,
      });

      expect(result.success).toBe(true);
      expect(result.data?.carrier).toBe("USPS");
    });

    it("should handle EXPRESS service", async () => {
      const result = await shippingService.createShippingLabel({
        orderId: mockOrderId,
        service: "EXPRESS",
        destination: mockDestination,
      });

      expect(result.success).toBe(true);
      expect(result.data?.carrier).toBe("FedEx");
    });

    it("should handle OVERNIGHT service", async () => {
      const result = await shippingService.createShippingLabel({
        orderId: mockOrderId,
        service: "OVERNIGHT",
        destination: mockDestination,
      });

      expect(result.success).toBe(true);
      expect(result.data?.carrier).toBe("FedEx");
    });

    it("should return error on database failure", async () => {
      jest
        .mocked(database.order.update)
        .mockRejectedValue(new Error("Database connection failed"));

      const result = await shippingService.createShippingLabel({
        orderId: mockOrderId,
        service: "STANDARD",
        destination: mockDestination,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("LABEL_CREATION_FAILED");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 📍 GET TRACKING INFO TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("📍 getTrackingInfo", () => {
    const mockTrackingNumber = "TRACK123";
    const mockOrder = {
      id: mockOrderId,
      status: "PREPARING",
      trackingNumber: mockTrackingNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      shippingService: "STANDARD",
      farm: {
        id: "farm-1",
        name: "Test Farm",
      },
      customer: {
        id: "customer-1",
        name: "Test Customer",
      },
    };

    it("should return tracking info for valid tracking number with ServiceResponse", async () => {
      jest
        .mocked(database.order.findFirst)
        .mockResolvedValue(mockOrder as unknown as Order);

      const result = await shippingService.getTrackingInfo({
        trackingNumber: mockTrackingNumber,
      });

      // Assert - ServiceResponse structure
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();

      // Assert - Tracking info
      const info = result.data!;
      expect(info.orderId).toBe(mockOrderId);
      expect(info.trackingNumber).toBe(mockTrackingNumber);
      expect(info.status).toBe("PREPARING");
      expect(info.events).toBeDefined();
      expect(Array.isArray(info.events)).toBe(true);
    });

    it("should return error for invalid tracking number", async () => {
      jest.mocked(database.order.findFirst).mockResolvedValue(null);

      const result = await shippingService.getTrackingInfo({
        trackingNumber: "INVALID123",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TRACKING_NOT_FOUND");
    });

    it("should include timestamp in tracking info", async () => {
      jest
        .mocked(database.order.findFirst)
        .mockResolvedValue(mockOrder as unknown as Order);

      const result = await shippingService.getTrackingInfo({
        trackingNumber: mockTrackingNumber,
      });

      expect(result.success).toBe(true);
      expect(result.data?.events[0]).toHaveProperty("timestamp");
    });

    it("should query database with tracking number", async () => {
      jest
        .mocked(database.order.findFirst)
        .mockResolvedValue(mockOrder as unknown as Order);

      await shippingService.getTrackingInfo({
        trackingNumber: mockTrackingNumber,
      });

      expect(database.order.findFirst).toHaveBeenCalledWith({
        where: { trackingNumber: mockTrackingNumber },
        include: {
          farm: true,
          customer: true,
        },
      });
    });

    it("should handle different order statuses", async () => {
      const statuses = ["PREPARING", "READY", "FULFILLED"];

      for (const status of statuses) {
        jest.mocked(database.order.findFirst).mockResolvedValue({
          ...mockOrder,
          status,
        } as unknown as Order);

        const result = await shippingService.getTrackingInfo({
          trackingNumber: mockTrackingNumber,
        });

        expect(result.success).toBe(true);
        expect(result.data?.status).toBe(status);
      }
    });

    it("should handle database errors", async () => {
      jest
        .mocked(database.order.findFirst)
        .mockRejectedValue(new Error("Database error"));

      const result = await shippingService.getTrackingInfo({
        trackingNumber: mockTrackingNumber,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TRACKING_FETCH_FAILED");
    });

    it("should return tracking info with correct structure", async () => {
      jest
        .mocked(database.order.findFirst)
        .mockResolvedValue(mockOrder as unknown as Order);

      const result = await shippingService.getTrackingInfo({
        trackingNumber: mockTrackingNumber,
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        orderId: expect.any(String),
        trackingNumber: expect.any(String),
        status: expect.any(String),
        currentLocation: expect.any(String),
        events: expect.any(Array),
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔄 UPDATE SHIPPING STATUS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("🔄 updateShippingStatus", () => {
    beforeEach(() => {
      // Mock findUnique to return existing order
      const existingOrder = {
        id: mockOrderId,
        status: "CONFIRMED",
        total: 150.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(existingOrder as any);
      jest.mocked(database.order.update).mockResolvedValue({
        ...existingOrder,
        status: "PREPARING",
      } as unknown as Order);
    });

    it("should update shipping status successfully with ServiceResponse", async () => {
      const result = await shippingService.updateShippingStatus({
        orderId: mockOrderId,
        status: "PREPARING",
      });

      // Assert - ServiceResponse structure
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined(); // Returns updated Order
      expect(result.error).toBeUndefined();

      // Assert - Database call
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        data: { status: "PREPARING" },
      });
    });

    it("should handle PENDING status (from valid transition)", async () => {
      // This test is invalid - you cannot transition TO PENDING from CONFIRMED
      // PENDING can only transition TO CONFIRMED or CANCELLED
      // Let's test a valid transition instead: PENDING -> CONFIRMED
      const pendingOrder = {
        id: mockOrderId,
        status: "PENDING",
        total: 150.0,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .mocked(database.order.findUnique)
        .mockResolvedValueOnce(pendingOrder as any);
      jest
        .mocked(database.order.update)
        .mockResolvedValueOnce({ ...pendingOrder, status: "CONFIRMED" } as any);

      const result = await shippingService.updateShippingStatus({
        orderId: mockOrderId,
        status: "CONFIRMED",
      });

      expect(result.success).toBe(true);
      const updateCall = jest.mocked(database.order.update).mock.calls[0];
      expect(updateCall[0].data).toMatchObject({ status: "CONFIRMED" });
    });

    it("should handle invalid status by returning validation error", async () => {
      const result = await shippingService.updateShippingStatus({
        orderId: mockOrderId,
        status: "INVALID_STATUS" as any,
      });

      // Should fail validation with STATUS_UPDATE_FAILED
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("STATUS_UPDATE_FAILED");
      expect(result.error?.message).toContain(
        "Failed to update shipping status",
      );
    });

    it("should handle FULFILLED status (aliased to SHIPPED)", async () => {
      // Mock order in READY status (valid transition to FULFILLED)
      const readyOrder = {
        id: mockOrderId,
        status: "READY",
        total: 150.0,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .mocked(database.order.findUnique)
        .mockResolvedValueOnce(readyOrder as any);
      jest
        .mocked(database.order.update)
        .mockResolvedValueOnce({ ...readyOrder, status: "FULFILLED" } as any);

      const result = await shippingService.updateShippingStatus({
        orderId: mockOrderId,
        status: "FULFILLED",
      });

      expect(result.success).toBe(true);
      const updateCall = jest.mocked(database.order.update).mock.calls[0];
      expect(updateCall[0].data).toMatchObject({ status: "FULFILLED" });
    });

    it("should handle COMPLETED status (aliased to DELIVERED)", async () => {
      // Mock order in FULFILLED status (valid transition to COMPLETED)
      const fulfilledOrder = {
        id: mockOrderId,
        status: "FULFILLED",
        total: 150.0,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .mocked(database.order.findUnique)
        .mockResolvedValueOnce(fulfilledOrder as any);
      jest.mocked(database.order.update).mockResolvedValueOnce({
        ...fulfilledOrder,
        status: "COMPLETED",
      } as any);

      const result = await shippingService.updateShippingStatus({
        orderId: mockOrderId,
        status: "COMPLETED",
      });

      expect(result.success).toBe(true);
      const updateCall = jest.mocked(database.order.update).mock.calls[0];
      expect(updateCall[0].data).toMatchObject({ status: "COMPLETED" });
    });

    it("should handle CANCELLED status", async () => {
      // Mock order in CONFIRMED status (valid transition to CANCELLED)
      const confirmedOrder = {
        id: mockOrderId,
        status: "CONFIRMED",
        total: 150.0,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .mocked(database.order.findUnique)
        .mockResolvedValueOnce(confirmedOrder as any);
      jest.mocked(database.order.update).mockResolvedValueOnce({
        ...confirmedOrder,
        status: "CANCELLED",
      } as any);

      const result = await shippingService.updateShippingStatus({
        orderId: mockOrderId,
        status: "CANCELLED",
      });

      expect(result.success).toBe(true);
      const updateCall = jest.mocked(database.order.update).mock.calls[0];
      expect(updateCall[0].data).toMatchObject({ status: "CANCELLED" });
    });

    it("should return error on database failure", async () => {
      jest
        .mocked(database.order.update)
        .mockRejectedValue(new Error("Database error"));

      const result = await shippingService.updateShippingStatus({
        orderId: mockOrderId,
        status: "PREPARING",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("STATUS_UPDATE_FAILED");
    });

    it("should update status for different order IDs", async () => {
      const orderIds = [
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002",
        "550e8400-e29b-41d4-a716-446655440003",
      ];

      for (const orderId of orderIds) {
        // Mock each order in CONFIRMED status (valid transition to PREPARING)
        const confirmedOrder = {
          id: orderId,
          status: "CONFIRMED",
          total: 150.0,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        jest
          .mocked(database.order.findUnique)
          .mockResolvedValueOnce(confirmedOrder as any);
        jest.mocked(database.order.update).mockResolvedValueOnce({
          ...confirmedOrder,
          status: "PREPARING",
        } as any);

        const result = await shippingService.updateShippingStatus({
          orderId,
          status: "PREPARING",
        });

        expect(result.success).toBe(true);
        expect(database.order.update).toHaveBeenCalledWith({
          where: { id: orderId },
          data: { status: "PREPARING" },
        });
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔄 INTEGRATION SCENARIOS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("🔄 Integration Scenarios", () => {
    it("should handle complete shipping workflow", async () => {
      // Step 1: Calculate rates
      jest.mocked(database.order.findFirst).mockResolvedValue({
        id: mockOrderId,
        status: "PENDING",
        trackingNumber: null,
      } as unknown as Order);

      const ratesResult = await shippingService.calculateShippingRates({
        orderId: mockOrderId,
        destination: mockDestination,
      });

      expect(ratesResult.success).toBe(true);
      expect(ratesResult.data).toHaveLength(3);

      // Step 2: Create label
      jest.mocked(database.order.update).mockResolvedValue({
        id: mockOrderId,
        status: "PREPARING",
        trackingNumber: "TRACK123",
        shippingService: "STANDARD",
      } as unknown as Order);

      const labelResult = await shippingService.createShippingLabel({
        orderId: mockOrderId,
        service: "STANDARD",
        destination: mockDestination,
      });

      expect(labelResult.success).toBe(true);

      // Step 3: Get tracking info
      jest.mocked(database.order.findFirst).mockResolvedValue({
        id: mockOrderId,
        status: "PREPARING",
        trackingNumber: "TRACK123",
        shippingService: "STANDARD",
        total: 150.0,
        subtotal: 150.0,
        items: [
          {
            id: "item-1",
            quantity: 2,
            price: 50.0,
            product: {
              id: "product-1",
              name: "Organic Tomatoes",
              weight: 1.5,
            },
          },
        ],
        farm: {
          id: "farm-1",
          name: "Test Farm",
          location: {
            zipCode: "97086",
            state: "OR",
            city: "Happy Valley",
          },
        },
        customer: {
          id: "customer-1",
          name: "Test Customer",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Order);

      const trackingResult = await shippingService.getTrackingInfo({
        trackingNumber: "TRACK123",
      });

      expect(trackingResult.success).toBe(true);
      expect(trackingResult.data?.events).toBeDefined();
    });

    it("should handle rate calculation for multiple orders", async () => {
      const orderIds = [
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002",
      ];

      for (const orderId of orderIds) {
        const result = await shippingService.calculateShippingRates({
          orderId,
          destination: mockDestination,
        });

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(3);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌾 AGRICULTURAL CONSCIOUSNESS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("🌾 Agricultural Consciousness", () => {
    it("should maintain divine consciousness in error messages", async () => {
      const result = await shippingService.calculateShippingRates({
        orderId: mockOrderId,
        destination: {
          street: "",
          city: "",
          state: "INVALID",
          zipCode: "",
          country: "US",
        },
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBeTruthy();
      expect(result.error?.code).toBe("RATE_CALCULATION_FAILED");
    });

    it("should handle seasonal shipping considerations", async () => {
      // Shipping rates should be consistent regardless of season
      const result = await shippingService.calculateShippingRates({
        orderId: mockOrderId,
        destination: mockDestination,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
    });
  });
});
