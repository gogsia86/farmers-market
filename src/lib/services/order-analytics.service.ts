/**
 * 📊 ORDER ANALYTICS SERVICE - Divine Insights & Consciousness
 *
 * Handles all order analytics and reporting:
 * - Order statistics and metrics
 * - Revenue analytics
 * - Customer insights
 * - Product performance
 * - Agricultural consciousness tracking
 * - Seasonal alignment analysis
 *
 * Split from the monolithic order.service.ts for better maintainability.
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 */

import { database } from "@/lib/database";
import type { OrderItem, Product } from "@prisma/client";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "FULFILLED"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderStatisticsRequest {
  farmId?: string;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  includeConsciousness?: boolean;
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByFulfillmentMethod: Record<string, number>;
  monthlyRevenue: MonthlyRevenueData[];
  topProducts: TopProductData[];
  topCustomers: TopCustomerData[];
  consciousnessMetrics?: ConsciousnessMetrics;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface TopProductData {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

export interface TopCustomerData {
  customerId: string;
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: Date;
}

export interface ConsciousnessMetrics {
  overallDivineScore: number;
  seasonalAlignmentAverage: number;
  quantumCoherenceScore: number;
  agriculturalHarmony: number;
  biodynamicIndex: number;
}

export interface OrderConsciousness {
  orderId: string;
  currentState: OrderStatus;
  previousStates: OrderStatus[];
  transitionCount: number;
  stateHistory: StateHistoryEntry[];
  agriculturalAlignment: AgriculturalAlignment;
  divineScore: number;
}

export interface StateHistoryEntry {
  status: OrderStatus;
  timestamp: Date;
}

export interface AgriculturalAlignment {
  seasonalScore: number;
  biodynamicScore: number;
  freshnessIndex: number;
  localSourceScore: number;
}

export interface SeasonalAnalysis {
  currentSeason: string;
  seasonalProducts: number;
  totalProducts: number;
  seasonalRatio: number;
  recommendations: string[];
}

export interface RevenueBreakdown {
  gross: number;
  platformFees: number;
  deliveryFees: number;
  taxes: number;
  farmerPayouts: number;
  net: number;
}

export interface OrderTrendData {
  period: string;
  orders: number;
  revenue: number;
  customers: number;
  averageBasketSize: number;
}

// ============================================
// CONSTANTS
// ============================================

const SEASONS: Record<string, string[]> = {
  SPRING: ["asparagus", "peas", "lettuce", "spinach", "radish", "strawberry"],
  SUMMER: ["tomato", "corn", "pepper", "zucchini", "melon", "berry", "peach"],
  FALL: ["pumpkin", "apple", "squash", "grape", "pear", "cranberry"],
  WINTER: ["citrus", "kale", "cabbage", "brussels", "potato", "onion"],
};

const STATUS_PROGRESSION: Record<OrderStatus, number> = {
  PENDING: 1,
  CONFIRMED: 2,
  PREPARING: 3,
  READY: 4,
  FULFILLED: 5,
  COMPLETED: 6,
  CANCELLED: -1,
};

// ============================================
// ORDER ANALYTICS SERVICE
// ============================================

export class OrderAnalyticsService {
  // ========================================
  // MAIN STATISTICS
  // ========================================

  /**
   * Get comprehensive order statistics
   */
  async getOrderStatistics(
    request: OrderStatisticsRequest = {},
  ): Promise<OrderStatistics> {
    const where = this.buildWhereClause(request);

    // Fetch all orders matching criteria
    const orders = await database.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Calculate basic metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by status and fulfillment method
    const ordersByStatus = this.groupByField(orders, "status");
    const ordersByFulfillmentMethod = this.groupByField(
      orders,
      "fulfillmentMethod",
    );

    // Calculate detailed analytics
    const monthlyRevenue = this.calculateMonthlyRevenue(orders);
    const topProducts = this.calculateTopProducts(orders);
    const topCustomers = await this.calculateTopCustomers(orders);

    // Calculate consciousness metrics if requested
    let consciousnessMetrics: ConsciousnessMetrics | undefined;
    if (request.includeConsciousness) {
      consciousnessMetrics = await this.calculateConsciousnessMetrics(orders);
    }

    return {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      ordersByStatus,
      ordersByFulfillmentMethod,
      monthlyRevenue,
      topProducts,
      topCustomers,
      consciousnessMetrics,
    };
  }

  /**
   * Get revenue breakdown
   */
  async getRevenueBreakdown(
    request: OrderStatisticsRequest = {},
  ): Promise<RevenueBreakdown> {
    const where = this.buildWhereClause(request);

    const orders = await database.order.findMany({
      where,
      select: {
        total: true,
        subtotal: true,
        platformFee: true,
        deliveryFee: true,
        tax: true,
        farmerAmount: true,
      },
    });

    const gross = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const platformFees = orders.reduce(
      (sum, o) => sum + Number(o.platformFee || 0),
      0,
    );
    const deliveryFees = orders.reduce(
      (sum, o) => sum + Number(o.deliveryFee || 0),
      0,
    );
    const taxes = orders.reduce((sum, o) => sum + Number(o.tax || 0), 0);
    const farmerPayouts = orders.reduce(
      (sum, o) => sum + Number(o.farmerAmount || 0),
      0,
    );

    return {
      gross: Math.round(gross * 100) / 100,
      platformFees: Math.round(platformFees * 100) / 100,
      deliveryFees: Math.round(deliveryFees * 100) / 100,
      taxes: Math.round(taxes * 100) / 100,
      farmerPayouts: Math.round(farmerPayouts * 100) / 100,
      net: Math.round((gross - platformFees) * 100) / 100,
    };
  }

  /**
   * Get order trends over time
   */
  async getOrderTrends(
    periodType: "daily" | "weekly" | "monthly",
    periods: number = 12,
    farmId?: string,
  ): Promise<OrderTrendData[]> {
    const now = new Date();
    const trends: OrderTrendData[] = [];

    for (let i = periods - 1; i >= 0; i--) {
      let startDate: Date;
      let endDate: Date;
      let periodLabel: string;

      switch (periodType) {
        case "daily":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - i);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          periodLabel = startDate.toISOString().split("T")[0] ?? "";
          break;

        case "weekly":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - i * 7);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          periodLabel = `Week ${startDate.toISOString().split("T")[0]}`;
          break;

        case "monthly":
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          periodLabel = startDate.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          break;
      }

      const where: any = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { not: "CANCELLED" },
      };

      if (farmId) {
        where.farmId = farmId;
      }

      const orders = await database.order.findMany({
        where,
        select: {
          total: true,
          customerId: true,
          items: true,
        },
      });

      const uniqueCustomers = new Set(orders.map((o) => o.customerId)).size;
      const totalItems = orders.reduce(
        (sum, o) => sum + (o.items?.length || 0),
        0,
      );

      trends.push({
        period: periodLabel,
        orders: orders.length,
        revenue:
          Math.round(
            orders.reduce((sum, o) => sum + Number(o.total || 0), 0) * 100,
          ) / 100,
        customers: uniqueCustomers,
        averageBasketSize:
          orders.length > 0
            ? Math.round((totalItems / orders.length) * 100) / 100
            : 0,
      });
    }

    return trends;
  }

  // ========================================
  // PRODUCT ANALYTICS
  // ========================================

  /**
   * Get product performance analytics
   */
  async getProductPerformance(
    farmId?: string,
    limit: number = 10,
  ): Promise<TopProductData[]> {
    const where: any = { status: { not: "CANCELLED" } };
    if (farmId) where.farmId = farmId;

    const orders = await database.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return this.calculateTopProducts(orders, limit);
  }

  /**
   * Get product sales over time
   */
  async getProductSalesTrend(
    productId: string,
    months: number = 6,
  ): Promise<{ month: string; quantity: number; revenue: number }[]> {
    const now = new Date();
    const trends: { month: string; quantity: number; revenue: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const orderItems = await database.orderItem.findMany({
        where: {
          productId,
          order: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: { not: "CANCELLED" },
          },
        },
      });

      trends.push({
        month: startDate.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        quantity: orderItems.reduce(
          (sum, item) => sum + Number(item.quantity),
          0,
        ),
        revenue:
          Math.round(
            orderItems.reduce(
              (sum, item) => sum + Number(item.subtotal || 0),
              0,
            ) * 100,
          ) / 100,
      });
    }

    return trends;
  }

  // ========================================
  // CUSTOMER ANALYTICS
  // ========================================

  /**
   * Get customer insights
   */
  async getCustomerInsights(customerId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    favoriteProducts: TopProductData[];
    orderFrequency: string;
    lastOrderDate: Date | null;
    memberSince: Date;
  }> {
    const customer = await database.user.findUnique({
      where: { id: customerId },
      select: { createdAt: true },
    });

    const orders = await database.order.findMany({
      where: {
        customerId,
        status: { not: "CANCELLED" },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const lastOrderDate = orders[0]?.createdAt || null;

    // Calculate order frequency
    let orderFrequency = "New customer";
    if (totalOrders > 1 && customer?.createdAt) {
      const daysSinceJoined = Math.floor(
        (Date.now() - customer.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      const ordersPerMonth = (totalOrders / daysSinceJoined) * 30;

      if (ordersPerMonth >= 4) orderFrequency = "Weekly";
      else if (ordersPerMonth >= 2) orderFrequency = "Bi-weekly";
      else if (ordersPerMonth >= 1) orderFrequency = "Monthly";
      else orderFrequency = "Occasional";
    }

    return {
      totalOrders,
      totalSpent: Math.round(totalSpent * 100) / 100,
      averageOrderValue:
        totalOrders > 0
          ? Math.round((totalSpent / totalOrders) * 100) / 100
          : 0,
      favoriteProducts: this.calculateTopProducts(orders, 5),
      orderFrequency,
      lastOrderDate,
      memberSince: customer?.createdAt || new Date(),
    };
  }

  // ========================================
  // CONSCIOUSNESS & AGRICULTURAL ALIGNMENT
  // ========================================

  /**
   * Get order consciousness data
   */
  async getOrderConsciousness(orderId: string): Promise<OrderConsciousness> {
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Build state history from timestamps
    const stateHistory = this.buildStateHistory(order);
    const currentState = order.status as OrderStatus;
    const previousStates = stateHistory
      .filter((s) => s.status !== currentState)
      .map((s) => s.status);

    // Calculate agricultural alignment
    const agriculturalAlignment = await this.calculateAgriculturalAlignment(
      order.items as (OrderItem & { product: Product })[],
    );

    // Calculate divine score
    const divineScore = this.calculateDivineScore(
      currentState,
      agriculturalAlignment,
      stateHistory.length,
    );

    return {
      orderId,
      currentState,
      previousStates,
      transitionCount: stateHistory.length - 1,
      stateHistory,
      agriculturalAlignment,
      divineScore,
    };
  }

  /**
   * Calculate consciousness metrics for multiple orders
   */
  private async calculateConsciousnessMetrics(
    orders: any[],
  ): Promise<ConsciousnessMetrics> {
    let totalDivineScore = 0;
    let totalSeasonalScore = 0;
    let totalCoherence = 0;

    for (const order of orders) {
      const alignment = await this.calculateAgriculturalAlignment(
        order.items || [],
      );
      const coherence = this.calculateQuantumCoherence(order.status);
      const divine = this.calculateDivineScore(order.status, alignment, 1);

      totalDivineScore += divine;
      totalSeasonalScore += alignment.seasonalScore;
      totalCoherence += coherence;
    }

    const count = orders.length || 1;

    return {
      overallDivineScore: Math.round((totalDivineScore / count) * 100) / 100,
      seasonalAlignmentAverage:
        Math.round((totalSeasonalScore / count) * 100) / 100,
      quantumCoherenceScore: Math.round((totalCoherence / count) * 100) / 100,
      agriculturalHarmony:
        Math.round(
          ((totalSeasonalScore / count + totalCoherence / count) / 2) * 100,
        ) / 100,
      biodynamicIndex: Math.round(Math.random() * 30 + 70), // Placeholder for actual biodynamic calculation
    };
  }

  /**
   * Calculate agricultural alignment for order items
   */
  private async calculateAgriculturalAlignment(
    items: (OrderItem & { product: Product | null })[],
  ): Promise<AgriculturalAlignment> {
    const currentSeason = this.getCurrentSeason();
    const seasonalKeywords = SEASONS[currentSeason] || [];

    let seasonalCount = 0;
    let organicCount = 0;

    for (const item of items) {
      if (!item.product) continue;

      const productName = item.product.name.toLowerCase();
      const tags = (item.product.tags as string[]) || [];

      const isSeasonal = seasonalKeywords.some(
        (keyword) =>
          productName.includes(keyword) ||
          tags.some((tag) => tag.toLowerCase().includes(keyword)),
      );

      if (isSeasonal) seasonalCount++;
      if (item.product.organic) organicCount++;
    }

    const itemCount = items.length || 1;
    const seasonalScore = (seasonalCount / itemCount) * 100;
    const biodynamicScore = (organicCount / itemCount) * 100;
    const freshnessIndex = Math.min(100, seasonalScore + 20);
    const localSourceScore = 85; // Placeholder - would calculate based on farm distance

    return {
      seasonalScore: Math.round(seasonalScore * 100) / 100,
      biodynamicScore: Math.round(biodynamicScore * 100) / 100,
      freshnessIndex: Math.round(freshnessIndex * 100) / 100,
      localSourceScore,
    };
  }

  /**
   * Calculate quantum coherence based on order status
   */
  private calculateQuantumCoherence(status: OrderStatus): number {
    const progression = STATUS_PROGRESSION[status] || 0;

    if (progression < 0) return 0; // Cancelled
    return (progression / 6) * 100; // 6 is max (COMPLETED)
  }

  /**
   * Calculate divine score
   */
  private calculateDivineScore(
    status: OrderStatus,
    alignment: AgriculturalAlignment,
    transitionCount: number,
  ): number {
    const statusScore =
      {
        PENDING: 50,
        CONFIRMED: 60,
        PREPARING: 70,
        READY: 80,
        FULFILLED: 90,
        COMPLETED: 100,
        CANCELLED: 0,
      }[status] || 0;

    const alignmentScore =
      (alignment.seasonalScore +
        alignment.biodynamicScore +
        alignment.freshnessIndex +
        alignment.localSourceScore) /
      4;

    const efficiencyScore = Math.max(0, 100 - transitionCount * 5);

    const score =
      statusScore * 0.4 + alignmentScore * 0.4 + efficiencyScore * 0.2;

    return Math.round(score * 100) / 100;
  }

  /**
   * Get seasonal analysis for orders
   */
  async getSeasonalAnalysis(farmId?: string): Promise<SeasonalAnalysis> {
    const currentSeason = this.getCurrentSeason();
    const seasonalKeywords = SEASONS[currentSeason] || [];

    const where: any = { status: { not: "CANCELLED" } };
    if (farmId) where.farmId = farmId;

    // Get recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    where.createdAt = { gte: thirtyDaysAgo };

    const orders = await database.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: { name: true, tags: true },
            },
          },
        },
      },
    });

    let seasonalProducts = 0;
    let totalProducts = 0;

    for (const order of orders) {
      for (const item of order.items) {
        totalProducts++;
        const productName = item.product?.name?.toLowerCase() || "";
        const tags = (item.product?.tags as string[]) || [];

        const isSeasonal = seasonalKeywords.some(
          (keyword) =>
            productName.includes(keyword) ||
            tags.some((tag) => tag.toLowerCase().includes(keyword)),
        );

        if (isSeasonal) seasonalProducts++;
      }
    }

    const seasonalRatio =
      totalProducts > 0 ? seasonalProducts / totalProducts : 0;

    const recommendations: string[] = [];
    if (seasonalRatio < 0.3) {
      recommendations.push(
        `Consider promoting ${currentSeason.toLowerCase()} seasonal products`,
      );
      recommendations.push(
        `Featured seasonal items: ${seasonalKeywords.slice(0, 5).join(", ")}`,
      );
    }
    if (seasonalRatio >= 0.7) {
      recommendations.push(
        "Excellent seasonal alignment! Customers are buying fresh.",
      );
    }

    return {
      currentSeason,
      seasonalProducts,
      totalProducts,
      seasonalRatio: Math.round(seasonalRatio * 100) / 100,
      recommendations,
    };
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  /**
   * Build where clause from request
   */
  private buildWhereClause(request: OrderStatisticsRequest): any {
    const where: any = {};

    if (request.farmId) where.farmId = request.farmId;
    if (request.customerId) where.customerId = request.customerId;

    if (request.startDate || request.endDate) {
      where.createdAt = {};
      if (request.startDate) where.createdAt.gte = request.startDate;
      if (request.endDate) where.createdAt.lte = request.endDate;
    }

    return where;
  }

  /**
   * Group orders by field
   */
  private groupByField(orders: any[], field: string): Record<string, number> {
    return orders.reduce(
      (acc, order) => {
        const key = order[field] || "UNKNOWN";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Calculate monthly revenue data
   */
  private calculateMonthlyRevenue(orders: any[]): MonthlyRevenueData[] {
    const monthlyData: Map<string, { revenue: number; count: number }> =
      new Map();

    for (const order of orders) {
      const date = new Date(order.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthlyData.get(month) || { revenue: 0, count: 0 };
      existing.revenue += Number(order.total || 0);
      existing.count += 1;
      monthlyData.set(month, existing);
    }

    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue * 100) / 100,
        orderCount: data.count,
        averageOrderValue:
          data.count > 0
            ? Math.round((data.revenue / data.count) * 100) / 100
            : 0,
      }));
  }

  /**
   * Calculate top products
   */
  private calculateTopProducts(
    orders: any[],
    limit: number = 10,
  ): TopProductData[] {
    const productData: Map<
      string,
      { name: string; quantity: number; revenue: number; count: number }
    > = new Map();

    for (const order of orders) {
      for (const item of order.items || []) {
        const existing = productData.get(item.productId) || {
          name: item.productName || item.product?.name || "Unknown",
          quantity: 0,
          revenue: 0,
          count: 0,
        };

        existing.quantity += item.quantity;
        existing.revenue += Number(item.subtotal || 0);
        existing.count += 1;
        productData.set(item.productId, existing);
      }
    }

    return Array.from(productData.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        totalQuantity: data.quantity,
        totalRevenue: Math.round(data.revenue * 100) / 100,
        orderCount: data.count,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  /**
   * Calculate top customers
   */
  private async calculateTopCustomers(
    orders: any[],
    limit: number = 10,
  ): Promise<TopCustomerData[]> {
    const customerData: Map<
      string,
      { name: string; orders: number; spent: number; lastOrder: Date }
    > = new Map();

    for (const order of orders) {
      const customerId = order.customerId;
      const customerName = order.customer
        ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim()
        : "Unknown";

      const existing = customerData.get(customerId) || {
        name: customerName,
        orders: 0,
        spent: 0,
        lastOrder: new Date(0),
      };

      existing.orders += 1;
      existing.spent += Number(order.total || 0);
      if (new Date(order.createdAt) > existing.lastOrder) {
        existing.lastOrder = new Date(order.createdAt);
      }
      customerData.set(customerId, existing);
    }

    return Array.from(customerData.entries())
      .map(([customerId, data]) => ({
        customerId,
        customerName: data.name || "Unknown Customer",
        totalOrders: data.orders,
        totalSpent: Math.round(data.spent * 100) / 100,
        averageOrderValue:
          data.orders > 0
            ? Math.round((data.spent / data.orders) * 100) / 100
            : 0,
        lastOrderDate: data.lastOrder,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  }

  /**
   * Build state history from order timestamps
   */
  private buildStateHistory(order: any): StateHistoryEntry[] {
    const history: StateHistoryEntry[] = [];

    // Always start with PENDING at creation
    history.push({
      status: "PENDING",
      timestamp: order.createdAt,
    });

    if (order.confirmedAt) {
      history.push({
        status: "CONFIRMED",
        timestamp: order.confirmedAt,
      });
    }

    if (order.preparingAt) {
      history.push({
        status: "PREPARING",
        timestamp: order.preparingAt,
      });
    }

    if (order.readyAt) {
      history.push({
        status: "READY",
        timestamp: order.readyAt,
      });
    }

    if (order.fulfilledAt) {
      history.push({
        status: "FULFILLED",
        timestamp: order.fulfilledAt,
      });
    }

    if (order.completedAt) {
      history.push({
        status: "COMPLETED",
        timestamp: order.completedAt,
      });
    }

    if (order.cancelledAt) {
      history.push({
        status: "CANCELLED",
        timestamp: order.cancelledAt,
      });
    }

    return history.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }

  /**
   * Get current season
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const orderAnalyticsService = new OrderAnalyticsService();
export default orderAnalyticsService;
