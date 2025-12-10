/**
 * 🧪 ORDER ANALYTICS SERVICE UNIT TESTS
 *
 * Comprehensive unit tests for OrderAnalyticsService with agricultural consciousness.
 * Tests order statistics, revenue breakdown, trends, and consciousness metrics.
 *
 * @pattern Divine Testing with Agricultural Consciousness
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

// ============================================================================
// MOCK SETUP - Must be before imports due to Jest hoisting
// ============================================================================

// Define mock functions BEFORE jest.mock to avoid hoisting issues
const mockOrderFindMany = jest.fn();
const mockOrderFindUnique = jest.fn();
const mockOrderCount = jest.fn();
const mockOrderGroupBy = jest.fn();
const mockOrderItemFindMany = jest.fn();
const mockUserFindUnique = jest.fn();

// Mock the database module - Jest hoists this to the top
jest.mock("@/lib/database", () => ({
  database: {
    order: {
      findMany: mockOrderFindMany,
      findUnique: mockOrderFindUnique,
      count: mockOrderCount,
      groupBy: mockOrderGroupBy,
    },
    orderItem: {
      findMany: mockOrderItemFindMany,
    },
    user: {
      findUnique: mockUserFindUnique,
    },
  },
  default: {
    order: {
      findMany: mockOrderFindMany,
      findUnique: mockOrderFindUnique,
      count: mockOrderCount,
      groupBy: mockOrderGroupBy,
    },
    orderItem: {
      findMany: mockOrderItemFindMany,
    },
    user: {
      findUnique: mockUserFindUnique,
    },
  },
}));

import { OrderAnalyticsService } from "../order-analytics.service";

// Create a reference object for easier access in tests
const mockDatabase = {
  order: {
    findMany: mockOrderFindMany,
    findUnique: mockOrderFindUnique,
    count: mockOrderCount,
    groupBy: mockOrderGroupBy,
  },
  orderItem: {
    findMany: mockOrderItemFindMany,
  },
  user: {
    findUnique: mockUserFindUnique,
  },
};

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const TEST_USER_ID = "test-user-id-123";
const TEST_FARM_ID = "test-farm-id-123";

const createMockOrder = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: `order-${Math.random().toString(36).slice(2, 8)}`,
  orderNumber: `ORD-${Date.now()}`,
  customerId: TEST_USER_ID,
  farmId: TEST_FARM_ID,
  status: "COMPLETED",
  paymentStatus: "PAID",
  fulfillmentMethod: "DELIVERY",
  subtotal: 25.0,
  tax: 2.0,
  deliveryFee: 5.0,
  platformFee: 2.5,
  farmerAmount: 22.5,
  total: 32.0,
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
  confirmedAt: null,
  preparingAt: null,
  readyAt: null,
  fulfilledAt: null,
  completedAt: new Date("2024-01-15"),
  cancelledAt: null,
  items: [
    {
      id: "item-1",
      orderId: "order-1",
      productId: "product-1",
      productName: "Organic Tomatoes",
      quantity: 3,
      unit: "lb",
      unitPrice: 4.99,
      subtotal: 14.97,
      product: {
        id: "product-1",
        name: "Organic Tomatoes",
        category: "VEGETABLES",
        tags: ["organic", "summer", "tomato"],
      },
    },
    {
      id: "item-2",
      orderId: "order-1",
      productId: "product-2",
      productName: "Fresh Lettuce",
      quantity: 2,
      unit: "head",
      unitPrice: 3.99,
      subtotal: 7.98,
      product: {
        id: "product-2",
        name: "Fresh Lettuce",
        category: "VEGETABLES",
        tags: ["organic", "spring", "lettuce"],
      },
    },
  ],
  customer: {
    id: TEST_USER_ID,
    firstName: "John",
    lastName: "Doe",
  },
  ...overrides,
});

const createMockOrderWithDifferentStatus = (status: string) =>
  createMockOrder({
    status,
    completedAt: status === "COMPLETED" ? new Date() : null,
    cancelledAt: status === "CANCELLED" ? new Date() : null,
  });

// ============================================================================
// TEST SUITES
// ============================================================================

describe("📊 OrderAnalyticsService - Divine Order Intelligence", () => {
  let analyticsService: OrderAnalyticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    analyticsService = new OrderAnalyticsService();
  });

  // ==========================================================================
  // ORDER STATISTICS TESTS
  // ==========================================================================

  describe("📈 Order Statistics (getOrderStatistics)", () => {
    it("should calculate basic order statistics", async () => {
      const mockOrders = [
        createMockOrder({ total: 50.0 }),
        createMockOrder({ total: 75.0 }),
        createMockOrder({ total: 100.0 }),
      ];

      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getOrderStatistics();

      expect(result.totalOrders).toBe(3);
      expect(result.totalRevenue).toBe(225.0);
      expect(result.averageOrderValue).toBe(75.0);
    });

    it("should group orders by status", async () => {
      const mockOrders = [
        createMockOrderWithDifferentStatus("COMPLETED"),
        createMockOrderWithDifferentStatus("COMPLETED"),
        createMockOrderWithDifferentStatus("PENDING"),
        createMockOrderWithDifferentStatus("CANCELLED"),
      ];

      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getOrderStatistics();

      expect(result.ordersByStatus.COMPLETED).toBe(2);
      expect(result.ordersByStatus.PENDING).toBe(1);
      expect(result.ordersByStatus.CANCELLED).toBe(1);
    });

    it("should group orders by fulfillment method", async () => {
      const mockOrders = [
        createMockOrder({ fulfillmentMethod: "DELIVERY" }),
        createMockOrder({ fulfillmentMethod: "DELIVERY" }),
        createMockOrder({ fulfillmentMethod: "PICKUP" }),
      ];

      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getOrderStatistics();

      expect(result.ordersByFulfillmentMethod.DELIVERY).toBe(2);
      expect(result.ordersByFulfillmentMethod.PICKUP).toBe(1);
    });

    it("should calculate top products from orders", async () => {
      const mockOrders = [
        createMockOrder({
          items: [
            {
              productId: "p1",
              productName: "Tomatoes",
              quantity: 5,
              unitPrice: 4.99,
              subtotal: 24.95,
              product: { name: "Tomatoes" },
            },
            {
              productId: "p2",
              productName: "Lettuce",
              quantity: 2,
              unitPrice: 3.99,
              subtotal: 7.98,
              product: { name: "Lettuce" },
            },
          ],
        }),
        createMockOrder({
          items: [
            {
              productId: "p1",
              productName: "Tomatoes",
              quantity: 3,
              unitPrice: 4.99,
              subtotal: 14.97,
              product: { name: "Tomatoes" },
            },
          ],
        }),
      ];

      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getOrderStatistics();

      expect(result.topProducts).toBeDefined();
      expect(result.topProducts.length).toBeGreaterThan(0);
      // Tomatoes should be top product with quantity 8
      const tomatoProduct = result.topProducts.find(
        (p) => p.productName === "Tomatoes",
      );
      expect(tomatoProduct).toBeDefined();
      expect(tomatoProduct?.totalQuantity).toBe(8);
    });

    it("should handle empty orders gracefully", async () => {
      mockDatabase.order.findMany.mockResolvedValue([]);

      const result = await analyticsService.getOrderStatistics();

      expect(result.totalOrders).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.averageOrderValue).toBe(0);
      expect(result.topProducts).toEqual([]);
    });

    it("should filter orders by farmId", async () => {
      mockDatabase.order.findMany.mockResolvedValue([createMockOrder()]);

      await analyticsService.getOrderStatistics({ farmId: TEST_FARM_ID });

      expect(mockDatabase.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            farmId: TEST_FARM_ID,
          }),
        }),
      );
    });

    it("should filter orders by date range", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      mockDatabase.order.findMany.mockResolvedValue([createMockOrder()]);

      await analyticsService.getOrderStatistics({ startDate, endDate });

      expect(mockDatabase.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: startDate,
              lte: endDate,
            }),
          }),
        }),
      );
    });

    it("should calculate monthly revenue breakdown", async () => {
      const mockOrders = [
        createMockOrder({ total: 100, createdAt: new Date("2024-01-15") }),
        createMockOrder({ total: 150, createdAt: new Date("2024-01-20") }),
        createMockOrder({ total: 200, createdAt: new Date("2024-02-10") }),
      ];

      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getOrderStatistics();

      expect(result.monthlyRevenue).toBeDefined();
      expect(result.monthlyRevenue.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // REVENUE BREAKDOWN TESTS
  // ==========================================================================

  describe("💰 Revenue Breakdown (getRevenueBreakdown)", () => {
    it("should calculate complete revenue breakdown", async () => {
      const mockOrders = [
        {
          total: 50.0,
          subtotal: 40.0,
          platformFee: 4.0,
          deliveryFee: 5.0,
          tax: 3.2,
          farmerAmount: 36.0,
        },
        {
          total: 75.0,
          subtotal: 60.0,
          platformFee: 6.0,
          deliveryFee: 5.0,
          tax: 4.8,
          farmerAmount: 54.0,
        },
      ];

      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getRevenueBreakdown();

      expect(result.gross).toBe(125.0);
      expect(result.platformFees).toBe(10.0);
      expect(result.deliveryFees).toBe(10.0);
      expect(result.taxes).toBe(8.0);
      expect(result.farmerPayouts).toBe(90.0);
    });

    it("should handle orders with zero fees", async () => {
      const mockOrders = [
        {
          total: 50.0,
          subtotal: 50.0,
          platformFee: 0,
          deliveryFee: 0,
          tax: 0,
          farmerAmount: 50.0,
        },
      ];

      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getRevenueBreakdown();

      expect(result.gross).toBe(50.0);
      expect(result.platformFees).toBe(0);
      expect(result.deliveryFees).toBe(0);
    });

    it("should calculate net revenue correctly", async () => {
      const mockOrders = [
        {
          total: 100.0,
          subtotal: 85.0,
          platformFee: 8.5,
          deliveryFee: 5.0,
          tax: 6.8,
          farmerAmount: 76.5,
        },
      ];

      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getRevenueBreakdown();

      // Net = gross - platformFees (per actual implementation)
      expect(result.net).toBe(result.gross - result.platformFees);
    });
  });

  // ==========================================================================
  // ORDER TRENDS TESTS
  // ==========================================================================

  describe("📉 Order Trends (getOrderTrends)", () => {
    it("should calculate daily trends", async () => {
      const mockOrders = [
        {
          total: 50,
          customerId: "c1",
          items: [{ quantity: 2 }],
          createdAt: new Date(),
        },
        {
          total: 75,
          customerId: "c2",
          items: [{ quantity: 3 }],
          createdAt: new Date(),
        },
      ];

      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getOrderTrends("daily", 1);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("period");
      expect(result[0]).toHaveProperty("orders");
      expect(result[0]).toHaveProperty("revenue");
    });

    it("should calculate weekly trends", async () => {
      mockDatabase.order.findMany.mockResolvedValue([
        { total: 100, customerId: "c1", items: [{ quantity: 5 }] },
      ]);

      const result = await analyticsService.getOrderTrends("weekly", 1);

      expect(result).toBeDefined();
    });

    it("should calculate monthly trends", async () => {
      mockDatabase.order.findMany.mockResolvedValue([
        { total: 200, customerId: "c1", items: [{ quantity: 10 }] },
      ]);

      const result = await analyticsService.getOrderTrends("monthly", 1);

      expect(result).toBeDefined();
    });

    it("should count unique customers in trends", async () => {
      const mockOrders = [
        { total: 50, customerId: "c1", items: [{ quantity: 1 }] },
        { total: 75, customerId: "c1", items: [{ quantity: 2 }] }, // Same customer
        { total: 100, customerId: "c2", items: [{ quantity: 1 }] }, // Different customer
      ];

      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getOrderTrends("daily", 1);

      expect(result[0].customers).toBe(2); // Only 2 unique customers
    });

    it("should calculate average basket size", async () => {
      // averageBasketSize is calculated as items.length / orders.length (count of line items, not quantities)
      const mockOrders = [
        {
          total: 50,
          customerId: "c1",
          items: [{ quantity: 2 }, { quantity: 3 }], // 2 line items
        },
        { total: 75, customerId: "c2", items: [{ quantity: 5 }] }, // 1 line item
      ];

      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getOrderTrends("daily", 1);

      // Total line items: 3, Orders: 2 -> Average: 1.5
      expect(result[0].averageBasketSize).toBe(1.5);
    });
  });

  // ==========================================================================
  // CUSTOMER INSIGHTS TESTS
  // ==========================================================================

  describe("👤 Customer Insights (getCustomerInsights)", () => {
    it("should calculate customer order statistics", async () => {
      const mockCustomer = {
        createdAt: new Date("2023-01-01"),
      };

      const mockOrders = [
        createMockOrder({ total: 50 }),
        createMockOrder({ total: 75 }),
        createMockOrder({ total: 100 }),
      ];

      mockDatabase.user.findUnique.mockResolvedValue(mockCustomer);
      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getCustomerInsights(TEST_USER_ID);

      expect(result.totalOrders).toBe(3);
      expect(result.totalSpent).toBe(225);
      expect(result.averageOrderValue).toBe(75);
    });

    it("should identify favorite products", async () => {
      const mockOrders = [
        createMockOrder({
          items: [
            {
              productId: "p1",
              productName: "Tomatoes",
              quantity: 5,
              product: { name: "Tomatoes" },
            },
          ],
        }),
        createMockOrder({
          items: [
            {
              productId: "p1",
              productName: "Tomatoes",
              quantity: 3,
              product: { name: "Tomatoes" },
            },
            {
              productId: "p2",
              productName: "Lettuce",
              quantity: 1,
              product: { name: "Lettuce" },
            },
          ],
        }),
      ];

      mockDatabase.user.findUnique.mockResolvedValue({ createdAt: new Date() });
      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getCustomerInsights(TEST_USER_ID);

      expect(result.favoriteProducts).toBeDefined();
      expect(result.favoriteProducts.length).toBeGreaterThan(0);
    });

    it("should calculate order frequency", async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const mockOrders = [
        createMockOrder(),
        createMockOrder(),
        createMockOrder(),
        createMockOrder(),
        createMockOrder(),
        createMockOrder(),
      ]; // 6 orders in 12 months = 0.5 orders/month

      mockDatabase.user.findUnique.mockResolvedValue({ createdAt: oneYearAgo });
      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getCustomerInsights(TEST_USER_ID);

      // orderFrequency is a string like "Occasional", "Monthly", "Bi-weekly", "Weekly"
      expect(result.orderFrequency).toBeDefined();
      expect(typeof result.orderFrequency).toBe("string");
      expect([
        "Occasional",
        "Monthly",
        "Bi-weekly",
        "Weekly",
        "New customer",
      ]).toContain(result.orderFrequency);
    });

    it("should track member since date", async () => {
      const joinDate = new Date("2023-06-15");

      mockDatabase.user.findUnique.mockResolvedValue({ createdAt: joinDate });
      mockDatabase.order.findMany.mockResolvedValue([]);

      const result = await analyticsService.getCustomerInsights(TEST_USER_ID);

      expect(result.memberSince).toEqual(joinDate);
    });
  });

  // ==========================================================================
  // CONSCIOUSNESS METRICS TESTS (Agricultural Awareness)
  // ==========================================================================

  describe("🌾 Consciousness Metrics (Agricultural Awareness)", () => {
    it("should calculate consciousness metrics when requested", async () => {
      const mockOrders = [createMockOrder()];

      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getOrderStatistics({
        includeConsciousness: true,
      });

      expect(result.consciousnessMetrics).toBeDefined();
      expect(result.consciousnessMetrics?.overallDivineScore).toBeDefined();
    });

    it("should not calculate consciousness metrics when not requested", async () => {
      mockDatabase.order.findMany.mockResolvedValue([createMockOrder()]);

      const result = await analyticsService.getOrderStatistics({
        includeConsciousness: false,
      });

      expect(result.consciousnessMetrics).toBeUndefined();
    });

    it("should calculate seasonal alignment score", async () => {
      // Mock summer order with summer products
      const summerOrder = createMockOrder({
        items: [
          {
            productId: "p1",
            productName: "Organic Tomatoes",
            quantity: 5,
            product: {
              name: "Organic Tomatoes",
              tags: ["tomato", "summer", "organic"],
            },
          },
        ],
      });

      mockDatabase.order.findMany.mockResolvedValue([summerOrder]);

      const result = await analyticsService.getOrderStatistics({
        includeConsciousness: true,
      });

      expect(
        result.consciousnessMetrics?.seasonalAlignmentAverage,
      ).toBeDefined();
      expect(
        result.consciousnessMetrics?.seasonalAlignmentAverage,
      ).toBeGreaterThanOrEqual(0);
      expect(
        result.consciousnessMetrics?.seasonalAlignmentAverage,
      ).toBeLessThanOrEqual(1);
    });

    it("should calculate quantum coherence score", async () => {
      // Completed order should have high coherence
      const completedOrder = createMockOrderWithDifferentStatus("COMPLETED");

      mockDatabase.order.findMany.mockResolvedValue([completedOrder]);

      const result = await analyticsService.getOrderStatistics({
        includeConsciousness: true,
      });

      expect(result.consciousnessMetrics?.quantumCoherenceScore).toBeDefined();
    });

    it("should calculate biodynamic index", async () => {
      const organicOrder = createMockOrder({
        items: [
          {
            productId: "p1",
            productName: "Biodynamic Carrots",
            quantity: 3,
            product: {
              name: "Biodynamic Carrots",
              tags: ["organic", "biodynamic", "root"],
            },
          },
        ],
      });

      mockDatabase.order.findMany.mockResolvedValue([organicOrder]);

      const result = await analyticsService.getOrderStatistics({
        includeConsciousness: true,
      });

      expect(result.consciousnessMetrics?.biodynamicIndex).toBeDefined();
    });
  });

  // ==========================================================================
  // ORDER CONSCIOUSNESS TESTS
  // ==========================================================================

  describe("🔮 Order Consciousness (getOrderConsciousness)", () => {
    it("should get consciousness data for a specific order", async () => {
      const mockOrder = createMockOrder();

      mockDatabase.order.findUnique.mockResolvedValue(mockOrder);

      const result = await analyticsService.getOrderConsciousness("order-123");

      expect(result).toBeDefined();
      expect(result.currentState).toBeDefined();
      expect(result.divineScore).toBeDefined();
    });

    it("should build state history for order", async () => {
      const mockOrder = createMockOrder({
        status: "COMPLETED",
        confirmedAt: new Date("2024-01-15T10:00:00"),
        preparingAt: new Date("2024-01-15T11:00:00"),
        readyAt: new Date("2024-01-15T12:00:00"),
        fulfilledAt: new Date("2024-01-15T13:00:00"),
        completedAt: new Date("2024-01-15T14:00:00"),
      });

      mockDatabase.order.findUnique.mockResolvedValue(mockOrder);

      const result = await analyticsService.getOrderConsciousness("order-123");

      expect(result.stateHistory).toBeDefined();
      expect(result.stateHistory.length).toBeGreaterThan(0);
      expect(result.transitionCount).toBeGreaterThan(0);
    });

    it("should calculate agricultural alignment for order", async () => {
      const mockOrder = createMockOrder();

      mockDatabase.order.findUnique.mockResolvedValue(mockOrder);

      const result = await analyticsService.getOrderConsciousness("order-123");

      expect(result.agriculturalAlignment).toBeDefined();
      expect(result.agriculturalAlignment.seasonalScore).toBeGreaterThanOrEqual(
        0,
      );
      expect(
        result.agriculturalAlignment.biodynamicScore,
      ).toBeGreaterThanOrEqual(0);
    });

    it("should throw error for non-existent order", async () => {
      mockDatabase.order.findUnique.mockResolvedValue(null);

      await expect(
        analyticsService.getOrderConsciousness("non-existent"),
      ).rejects.toThrow("Order not found: non-existent");
    });
  });

  // ==========================================================================
  // SEASONAL ANALYSIS TESTS
  // ==========================================================================

  describe("🍂 Seasonal Analysis (getSeasonalAnalysis)", () => {
    it("should analyze seasonal product distribution", async () => {
      const mockOrders = [
        createMockOrder({
          items: [
            {
              productName: "Summer Tomatoes",
              product: { name: "Summer Tomatoes", tags: ["tomato", "summer"] },
            },
          ],
        }),
        createMockOrder({
          items: [
            {
              productName: "Winter Kale",
              product: { name: "Winter Kale", tags: ["kale", "winter"] },
            },
          ],
        }),
      ];

      mockDatabase.order.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getSeasonalAnalysis(TEST_FARM_ID);

      expect(result).toBeDefined();
      expect(result.seasonalRatio).toBeGreaterThanOrEqual(0);
      expect(result.seasonalRatio).toBeLessThanOrEqual(1);
    });

    it("should provide seasonal recommendations", async () => {
      mockDatabase.order.findMany.mockResolvedValue([createMockOrder()]);

      const result = await analyticsService.getSeasonalAnalysis(TEST_FARM_ID);

      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it("should identify current season correctly", async () => {
      mockDatabase.order.findMany.mockResolvedValue([]);

      const result = await analyticsService.getSeasonalAnalysis(TEST_FARM_ID);

      expect(result.currentSeason).toBeDefined();
      expect(["SPRING", "SUMMER", "FALL", "WINTER"]).toContain(
        result.currentSeason,
      );
    });
  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================

  describe("⚠️ Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      mockDatabase.order.findMany.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(analyticsService.getOrderStatistics()).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should handle null values in order totals", async () => {
      const ordersWithNulls = [
        createMockOrder({ total: null }),
        createMockOrder({ total: 50 }),
      ];

      mockDatabase.order.findMany.mockResolvedValue(ordersWithNulls);

      const result = await analyticsService.getOrderStatistics();

      // Should handle null gracefully
      expect(result.totalRevenue).toBe(50);
    });

    it("should handle orders with empty items array", async () => {
      const orderWithNoItems = createMockOrder({ items: [] });

      mockDatabase.order.findMany.mockResolvedValue([orderWithNoItems]);

      const result = await analyticsService.getOrderStatistics();

      expect(result.topProducts).toEqual([]);
    });
  });

  // ==========================================================================
  // PERFORMANCE TESTS
  // ==========================================================================

  describe("⚡ Performance", () => {
    it("should process large order datasets efficiently", async () => {
      // Generate 1000 mock orders
      const largeOrderSet = Array.from({ length: 1000 }, () =>
        createMockOrder(),
      );

      mockDatabase.order.findMany.mockResolvedValue(largeOrderSet);

      const startTime = Date.now();
      const result = await analyticsService.getOrderStatistics();
      const duration = Date.now() - startTime;

      expect(result.totalOrders).toBe(1000);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});
