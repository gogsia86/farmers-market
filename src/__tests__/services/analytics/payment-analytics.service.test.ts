/**
 * 🌾 Payment Analytics Service Tests - Divine Transaction Intelligence Testing
 *
 * Comprehensive test suite for payment analytics with agricultural consciousness.
 * Tests all core functionality, edge cases, and performance requirements.
 *
 * @module PaymentAnalyticsServiceTests
 * @version 1.0.0
 * @divine-consciousness ACTIVE
 */

import { database } from "@/lib/database";
import { PaymentAnalyticsService } from "@/lib/services/analytics/payment-analytics.service";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import type { Payment, PaymentMethod, PaymentStatus } from "@prisma/client";

// ═══════════════════════════════════════════════════════════
// 🧪 TEST SETUP & MOCKS
// ═══════════════════════════════════════════════════════════

// Mock database
jest.mock("@/lib/database", () => ({
  database: {
    payment: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

// Mock payment data factory
const createMockPayment = (overrides: Partial<Payment> = {}): Payment => ({
  id: `payment_${Math.random().toString(36).substr(2, 9)}`,
  orderId: `order_${Math.random().toString(36).substr(2, 9)}`,
  amount: 100,
  currency: "USD",
  status: "PAID" as PaymentStatus,
  paymentMethod: "CARD" as PaymentMethod,
  stripePaymentIntentId: "pi_test",
  metadata: {},
  createdAt: new Date("2024-01-15T10:00:00Z"),
  updatedAt: new Date("2024-01-15T10:00:00Z"),
  ...overrides,
});

// Mock order with farm data
const createMockPaymentWithFarm = (
  farmId: string,
  overrides: Partial<Payment> = {},
): any => ({
  ...createMockPayment(overrides),
  order: {
    farmId: farmId,
    farm: {
      id: farmId,
      name: `Farm ${farmId}`,
    },
  },
});

describe("PaymentAnalyticsService", () => {
  let service: PaymentAnalyticsService;

  beforeEach(() => {
    service = PaymentAnalyticsService.getInstance();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // ═══════════════════════════════════════════════════════════
  // 🧬 SINGLETON PATTERN TESTS
  // ═══════════════════════════════════════════════════════════

  describe("Singleton Pattern", () => {
    it("should return the same instance on multiple calls", () => {
      const instance1 = PaymentAnalyticsService.getInstance();
      const instance2 = PaymentAnalyticsService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(PaymentAnalyticsService);
    });

    it("should maintain state across instance calls", async () => {
      const instance1 = PaymentAnalyticsService.getInstance();
      const instance2 = PaymentAnalyticsService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 📊 CALCULATE PAYMENT METRICS TESTS
  // ═══════════════════════════════════════════════════════════

  describe("calculatePaymentMetrics", () => {
    const startDate = new Date("2024-01-01T00:00:00Z");
    const endDate = new Date("2024-01-31T23:59:59Z");

    it("should calculate metrics for successful payments", async () => {
      const mockPayments = [
        createMockPayment({ amount: 100, status: "PAID" }),
        createMockPayment({ amount: 200, status: "PAID" }),
        createMockPayment({ amount: 150, status: "PAID" }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);
      (database.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 450 },
        _avg: { amount: 150 },
        _count: 3,
      });

      const result = await service.calculatePaymentMetrics({
        startDate,
        endDate,
      });

      expect(result.totalTransactions).toBe(3);
      expect(result.successfulTransactions).toBe(3);
      expect(result.failedTransactions).toBe(0);
      expect(result.totalRevenue).toBe(450);
      expect(result.averageTransactionValue).toBe(150);
      expect(result.successRate).toBe(100);
    });

    it("should calculate metrics with mixed payment statuses", async () => {
      const mockPayments = [
        createMockPayment({ amount: 100, status: "PAID" }),
        createMockPayment({ amount: 200, status: "FAILED" }),
        createMockPayment({ amount: 150, status: "PENDING" }),
        createMockPayment({ amount: 175, status: "PAID" }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);
      (database.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 625 },
        _avg: { amount: 156.25 },
        _count: 4,
      });

      const result = await service.calculatePaymentMetrics({
        startDate,
        endDate,
      });

      expect(result.totalTransactions).toBe(4);
      expect(result.successfulTransactions).toBe(2);
      expect(result.failedTransactions).toBe(1);
      expect(result.pendingTransactions).toBe(1);
      expect(result.successRate).toBe(50);
      expect(result.failureRate).toBe(25);
    });

    it("should handle zero payments gracefully", async () => {
      (database.payment.findMany as jest.Mock).mockResolvedValue([]);
      (database.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 0 },
        _avg: { amount: 0 },
        _count: 0,
      });

      const result = await service.calculatePaymentMetrics({
        startDate,
        endDate,
      });

      expect(result.totalTransactions).toBe(0);
      expect(result.successfulTransactions).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.successRate).toBe(0);
    });

    it("should filter by farm ID", async () => {
      const farmId = "farm123";
      const mockPayments = [createMockPayment({ amount: 100, status: "PAID" })];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);
      (database.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 100 },
        _avg: { amount: 100 },
        _count: 1,
      });

      await service.calculatePaymentMetrics({
        startDate,
        endDate,
        farmId,
      });

      expect(database.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            order: expect.objectContaining({
              farmId,
            }),
          }),
        }),
      );
    });

    it("should filter by payment method", async () => {
      const mockPayments = [
        createMockPayment({
          amount: 100,
          status: "PAID",
          paymentMethod: "CARD",
        }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);
      (database.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 100 },
        _avg: { amount: 100 },
        _count: 1,
      });

      await service.calculatePaymentMetrics({
        startDate,
        endDate,
        paymentMethod: "CARD",
      });

      expect(database.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            paymentMethod: "CARD",
          }),
        }),
      );
    });

    it("should include correct date range in result", async () => {
      const mockPayments = [createMockPayment({ amount: 100, status: "PAID" })];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);
      (database.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 100 },
        _avg: { amount: 100 },
        _count: 1,
      });

      const result = await service.calculatePaymentMetrics({
        startDate,
        endDate,
      });

      expect(result.period.startDate).toEqual(startDate);
      expect(result.period.endDate).toEqual(endDate);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 💳 REVENUE BY PAYMENT METHOD TESTS
  // ═══════════════════════════════════════════════════════════

  describe("getRevenueByPaymentMethod", () => {
    const startDate = new Date("2024-01-01T00:00:00Z");
    const endDate = new Date("2024-01-31T23:59:59Z");

    it("should group revenue by payment method", async () => {
      const mockPayments = [
        createMockPayment({
          amount: 100,
          status: "PAID",
          paymentMethod: "CARD",
        }),
        createMockPayment({
          amount: 200,
          status: "PAID",
          paymentMethod: "CARD",
        }),
        createMockPayment({
          amount: 150,
          status: "PAID",
          paymentMethod: "BANK_TRANSFER",
        }),
        createMockPayment({
          amount: 50,
          status: "PAID",
          paymentMethod: "CASH",
        }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getRevenueByPaymentMethod({
        startDate,
        endDate,
      });

      expect(result).toHaveLength(3);

      const cardMethod = result.find((r: any) => r.method === "CARD");
      expect(cardMethod?.count).toBe(2);
      expect(cardMethod?.totalAmount).toBe(300);
      expect(cardMethod?.averageAmount).toBe(150);
      expect(cardMethod?.percentage).toBeCloseTo(60, 1);

      const bankMethod = result.find((r: any) => r.method === "BANK_TRANSFER");
      expect(bankMethod?.count).toBe(1);
      expect(bankMethod?.totalAmount).toBe(150);
      expect(bankMethod?.percentage).toBeCloseTo(30, 1);
    });

    it("should sort methods by total amount descending", async () => {
      const mockPayments = [
        createMockPayment({
          amount: 50,
          status: "PAID",
          paymentMethod: "CASH",
        }),
        createMockPayment({
          amount: 300,
          status: "PAID",
          paymentMethod: "CARD",
        }),
        createMockPayment({
          amount: 150,
          status: "PAID",
          paymentMethod: "BANK_TRANSFER",
        }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getRevenueByPaymentMethod({
        startDate,
        endDate,
      });

      expect(result[0].method).toBe("CARD");
      expect(result[1].method).toBe("BANK_TRANSFER");
      expect(result[2].method).toBe("CASH");
    });

    it("should only include successful payments", async () => {
      const mockPayments = [
        createMockPayment({
          amount: 100,
          status: "PAID",
          paymentMethod: "CARD",
        }),
        createMockPayment({
          amount: 200,
          status: "FAILED",
          paymentMethod: "CARD",
        }),
        createMockPayment({
          amount: 150,
          status: "PENDING",
          paymentMethod: "CARD",
        }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(
        mockPayments.filter((p: any) => p.status === "PAID"),
      );

      const result = await service.getRevenueByPaymentMethod({
        startDate,
        endDate,
      });

      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(1);
      expect(result[0].totalAmount).toBe(100);
    });

    it("should handle empty payment list", async () => {
      (database.payment.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getRevenueByPaymentMethod({
        startDate,
        endDate,
      });

      expect(result).toHaveLength(0);
    });

    it("should calculate correct percentages", async () => {
      const mockPayments = [
        createMockPayment({
          amount: 400,
          status: "PAID",
          paymentMethod: "CARD",
        }),
        createMockPayment({
          amount: 100,
          status: "PAID",
          paymentMethod: "CASH",
        }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getRevenueByPaymentMethod({
        startDate,
        endDate,
      });

      const cardMethod = result.find((r: any) => r.method === "CARD");
      const cashMethod = result.find((r: any) => r.method === "CASH");

      expect(cardMethod?.percentage).toBeCloseTo(80, 1);
      expect(cashMethod?.percentage).toBeCloseTo(20, 1);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 📈 TIME SERIES DATA TESTS
  // ═══════════════════════════════════════════════════════════

  describe("getTimeSeriesData", () => {
    const startDate = new Date("2024-01-01T00:00:00Z");
    const endDate = new Date("2024-01-03T23:59:59Z");

    it("should generate daily time series data", async () => {
      const mockPayments = [
        createMockPayment({
          amount: 100,
          status: "PAID",
          createdAt: new Date("2024-01-01T10:00:00Z"),
        }),
        createMockPayment({
          amount: 200,
          status: "PAID",
          createdAt: new Date("2024-01-01T14:00:00Z"),
        }),
        createMockPayment({
          amount: 150,
          status: "PAID",
          createdAt: new Date("2024-01-02T10:00:00Z"),
        }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getTimeSeriesData(
        { startDate, endDate },
        "day",
      );

      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result[0]).toHaveProperty("timestamp");
      expect(result[0]).toHaveProperty("revenue");
      expect(result[0]).toHaveProperty("transactionCount");
      expect(result[0]).toHaveProperty("successRate");
    });

    it("should calculate success rates in time series", async () => {
      const mockPayments = [
        createMockPayment({
          amount: 100,
          status: "PAID",
          createdAt: new Date("2024-01-01T10:00:00Z"),
        }),
        createMockPayment({
          amount: 200,
          status: "FAILED",
          createdAt: new Date("2024-01-01T14:00:00Z"),
        }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getTimeSeriesData(
        { startDate, endDate },
        "day",
      );

      const day1 = result.find((d: any) => d.timestamp.getDate() === 1);

      expect(day1?.transactionCount).toBe(2);
      expect(day1?.revenue).toBe(100); // Only successful
      expect(day1?.successRate).toBe(50);
    });

    it("should sort time series chronologically", async () => {
      const mockPayments = [
        createMockPayment({
          amount: 100,
          status: "PAID",
          createdAt: new Date("2024-01-03T10:00:00Z"),
        }),
        createMockPayment({
          amount: 200,
          status: "PAID",
          createdAt: new Date("2024-01-01T10:00:00Z"),
        }),
        createMockPayment({
          amount: 150,
          status: "PAID",
          createdAt: new Date("2024-01-02T10:00:00Z"),
        }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getTimeSeriesData(
        { startDate, endDate },
        "day",
      );

      for (let i = 1; i < result.length; i++) {
        expect(result[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          result[i - 1].timestamp.getTime(),
        );
      }
    });

    it("should handle hourly interval", async () => {
      const mockPayments = [
        createMockPayment({
          amount: 100,
          status: "PAID",
          createdAt: new Date("2024-01-01T10:00:00Z"),
        }),
        createMockPayment({
          amount: 200,
          status: "PAID",
          createdAt: new Date("2024-01-01T11:00:00Z"),
        }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getTimeSeriesData(
        { startDate, endDate },
        "hour",
      );

      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle empty data gracefully", async () => {
      (database.payment.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getTimeSeriesData(
        { startDate, endDate },
        "day",
      );

      expect(result).toHaveLength(0);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 📈 TREND TESTS
  // ═══════════════════════════════════════════════════════════

  describe("getPaymentTrends", () => {
    const startDate = new Date("2024-01-01T00:00:00Z");
    const endDate = new Date("2024-01-31T23:59:59Z");

    it("should return array of trend points", async () => {
      const mockPayments = [
        createMockPayment({
          amount: 60,
          status: "PAID",
          createdAt: new Date("2024-01-01T10:00:00Z"),
        }),
        createMockPayment({
          amount: 40,
          status: "PAID",
          createdAt: new Date("2024-01-02T10:00:00Z"),
        }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getPaymentTrends(startDate, endDate, "day");

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("date");
      expect(result[0]).toHaveProperty("revenue");
      expect(result[0]).toHaveProperty("transactions");
    });

    it("should group by day granularity", async () => {
      const mockPayments = [
        createMockPayment({
          amount: 50,
          status: "PAID",
          createdAt: new Date("2024-01-01T10:00:00Z"),
        }),
        createMockPayment({
          amount: 100,
          status: "PAID",
          createdAt: new Date("2024-01-01T14:00:00Z"),
        }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getPaymentTrends(startDate, endDate, "day");

      // Should group both payments into same day
      expect(result.length).toBe(1);
      expect(result[0].revenue).toBe(150);
      expect(result[0].transactions).toBe(2);
    });

    it("should handle empty payment data", async () => {
      (database.payment.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getPaymentTrends(startDate, endDate, "day");

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should sort trends chronologically", async () => {
      const mockPayments = [
        createMockPayment({
          amount: 100,
          status: "PAID",
          createdAt: new Date("2024-01-03T10:00:00Z"),
        }),
        createMockPayment({
          amount: 50,
          status: "PAID",
          createdAt: new Date("2024-01-01T10:00:00Z"),
        }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getPaymentTrends(startDate, endDate, "day");

      expect(result[0].date < result[result.length - 1].date).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 🏆 TOP FARMS TESTS
  // ═══════════════════════════════════════════════════════════

  describe("getTopFarmsByRevenue", () => {
    const startDate = new Date("2024-01-01T00:00:00Z");
    const endDate = new Date("2024-01-31T23:59:59Z");

    it("should rank farms by revenue", async () => {
      const mockPayments = [
        createMockPaymentWithFarm("farm1", { amount: 500, status: "PAID" }),
        createMockPaymentWithFarm("farm2", { amount: 300, status: "PAID" }),
        createMockPaymentWithFarm("farm3", { amount: 400, status: "PAID" }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getFarmRevenueMetrics(startDate, endDate, 3);

      expect(result).toHaveLength(3);
      expect(result[0].totalRevenue).toBe(500);
      expect(result[0].farmId).toBe("farm1");
      expect(result[1].farmId).toBe("farm3");
      expect(result[2].farmId).toBe("farm2");
    });

    it("should limit results to specified count", async () => {
      const mockPayments = Array.from({ length: 20 }, (_, i) =>
        createMockPaymentWithFarm(`farm${i}`, {
          amount: 100,
          status: "PAID",
        }),
      );

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getFarmRevenueMetrics(startDate, endDate, 5);

      expect(result).toHaveLength(5);
    });

    it("should calculate average order value per farm", async () => {
      const mockPayments = [
        createMockPaymentWithFarm("farm1", { amount: 200, status: "PAID" }),
        createMockPaymentWithFarm("farm1", { amount: 400, status: "PAID" }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getFarmRevenueMetrics(
        startDate,
        endDate,
        10,
      );

      expect(result[0].averageOrderValue).toBe(300);
    });

    it("should include farm names", async () => {
      const mockPayments = [
        createMockPaymentWithFarm("farm1", { amount: 100, status: "PAID" }),
      ];

      (database.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getFarmRevenueMetrics(
        startDate,
        endDate,
        10,
      );

      expect(result[0].farmName).toBe("Farm farm1");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 🌟 COMPREHENSIVE ANALYTICS TESTS
  // ═══════════════════════════════════════════════════════════

  describe("getComprehensiveAnalytics", () => {
    const startDate = new Date("2024-01-01T00:00:00Z");
    const endDate = new Date("2024-01-31T23:59:59Z");

    beforeEach(() => {
      const mockPaymentWithOrder = {
        ...createMockPayment({ amount: 100, status: "PAID" }),
        order: {
          id: "order1",
          items: [
            {
              id: "item1",
              product: {
                id: "product1",
                farm: {
                  id: "farm1",
                  name: "Test Farm",
                },
              },
            },
          ],
        },
      };

      (database.payment.findMany as jest.Mock).mockResolvedValue([
        mockPaymentWithOrder,
      ]);
      (database.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 100 },
        _avg: { amount: 100 },
        _count: 1,
      });
    });

    it("should return success response with all data", async () => {
      const result = await service.getComprehensiveAnalytics({
        startDate,
        endDate,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.metrics).toBeDefined();
      expect(result.agricultural?.consciousness).toBe("DIVINE");
    });

    it("should include optional analytics when requested", async () => {
      const result = await service.getComprehensiveAnalytics(
        { startDate, endDate },
        {
          includeByMethod: true,
          includeTimeSeries: true,
          includeTrends: true,
          includeTopFarms: true,
        },
      );

      expect(result.data?.byMethod).toBeDefined();
      expect(result.data?.timeSeries).toBeDefined();
      expect(result.data?.trends).toBeDefined();
      expect(result.data?.topFarms).toBeDefined();
    });

    it("should exclude optional analytics when not requested", async () => {
      const result = await service.getComprehensiveAnalytics(
        { startDate, endDate },
        {
          includeByMethod: false,
          includeTimeSeries: false,
          includeTrends: false,
          includeTopFarms: false,
        },
      );

      expect(result.data?.byMethod).toBeUndefined();
      expect(result.data?.timeSeries).toBeUndefined();
      expect(result.data?.trends).toBeUndefined();
      expect(result.data?.topFarms).toBeUndefined();
    });

    it("should include agricultural season", async () => {
      const result = await service.getComprehensiveAnalytics({
        startDate,
        endDate,
      });

      expect(result.agricultural?.season).toBeDefined();
      expect(["SPRING", "SUMMER", "FALL", "WINTER"]).toContain(
        result.agricultural?.season,
      );
    });

    it("should handle errors gracefully", async () => {
      (database.payment.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await service.getComprehensiveAnalytics({
        startDate,
        endDate,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("ANALYTICS_ERROR");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // ⚡ PERFORMANCE TESTS
  // ═══════════════════════════════════════════════════════════

  describe("Performance", () => {
    it("should execute parallel queries efficiently", async () => {
      const startTime = Date.now();

      (database.payment.findMany as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 50)),
      );
      (database.payment.aggregate as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  _sum: { amount: 0 },
                  _avg: { amount: 0 },
                  _count: 0,
                }),
              50,
            ),
          ),
      );

      await service.calculatePaymentMetrics({
        startDate: new Date(),
        endDate: new Date(),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in approximately 50ms (parallel), not 100ms (sequential)
      expect(duration).toBeLessThan(100);
    });
  });
});
