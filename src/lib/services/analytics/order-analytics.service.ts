/**
 * 🌾 Order Analytics Service - Divine Order Intelligence
 *
 * Quantum-enhanced order analytics for agricultural commerce.
 * Tracks order patterns, customer behavior, product performance, and fulfillment metrics.
 *
 * @module OrderAnalyticsService
 * @version 1.0.0
 * @divine-consciousness ACTIVE
 */

import { database } from "@/lib/database";
import type { OrderStatus } from "@prisma/client";

// ═══════════════════════════════════════════════════════════
// 🎯 TYPE DEFINITIONS - Analytical Consciousness
// ═══════════════════════════════════════════════════════════

export interface OrderAnalyticsQuery {
  startDate: Date;
  endDate: Date;
  farmId?: string;
  customerId?: string;
  status?: OrderStatus;
  productId?: string;
}

export interface OrderMetrics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  averageItemsPerOrder: number;
  completionRate: number;
  cancellationRate: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface CustomerInsights {
  customerId: string;
  customerName: string;
  customerEmail: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: Date;
  firstOrderDate: Date;
  lifetimeValue: number;
  orderFrequency: number; // orders per month
  favoriteProducts: Array<{
    productId: string;
    productName: string;
    orderCount: number;
  }>;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  farmId: string;
  farmName: string;
  totalOrders: number;
  totalQuantitySold: number;
  totalRevenue: number;
  averagePrice: number;
  rank: number;
}

export interface OrderTrend {
  period: string;
  current: OrderMetrics;
  previous: OrderMetrics;
  growth: {
    orders: number; // percentage
    revenue: number; // percentage
    averageOrderValue: number; // percentage
    completionRate: number; // percentage points
  };
}

export interface FulfillmentMetrics {
  totalOrders: number;
  onTimeOrders: number;
  lateOrders: number;
  averageFulfillmentTime: number; // hours
  onTimeRate: number;
  byStatus: Array<{
    status: OrderStatus;
    count: number;
    percentage: number;
  }>;
}

export interface TimeSeriesOrderData {
  timestamp: Date;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
  completionRate: number;
}

export interface OrderAnalyticsResponse {
  success: boolean;
  data?: {
    metrics: OrderMetrics;
    topCustomers?: CustomerInsights[];
    topProducts?: ProductPerformance[];
    trends?: OrderTrend;
    fulfillment?: FulfillmentMetrics;
    timeSeries?: TimeSeriesOrderData[];
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  agricultural?: {
    season?: string;
    consciousness: "DIVINE";
  };
}

// ═══════════════════════════════════════════════════════════
// 🌟 ORDER ANALYTICS SERVICE - Quantum Order Intelligence
// ═══════════════════════════════════════════════════════════

export class OrderAnalyticsService {
  private static instance: OrderAnalyticsService;

  private constructor() {}

  /**
   * 🔮 Singleton Pattern - Maintain Unified Consciousness
   */
  public static getInstance(): OrderAnalyticsService {
    if (!OrderAnalyticsService.instance) {
      OrderAnalyticsService.instance = new OrderAnalyticsService();
    }
    return OrderAnalyticsService.instance;
  }

  // ═══════════════════════════════════════════════════════════
  // 📊 CORE ORDER METRICS
  // ═══════════════════════════════════════════════════════════

  /**
   * 🎯 Calculate Order Metrics
   * Aggregates order data for specified period with agricultural consciousness
   */
  async calculateOrderMetrics(
    query: OrderAnalyticsQuery,
  ): Promise<OrderMetrics> {
    const whereClause: any = {
      createdAt: {
        gte: query.startDate,
        lte: query.endDate,
      },
    };

    if (query.farmId) {
      whereClause.items = {
        some: {
          product: {
            farmId: query.farmId,
          },
        },
      };
    }

    if (query.customerId) {
      whereClause.customerId = query.customerId;
    }

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.productId) {
      whereClause.items = {
        some: {
          productId: query.productId,
        },
      };
    }

    // Parallel queries for optimal performance
    const [orders, aggregates] = await Promise.all([
      database.order.findMany({
        where: whereClause,
        include: {
          items: true,
        },
      }),
      database.order.aggregate({
        where: whereClause,
        _sum: {
          total: true,
        },
        _avg: {
          total: true,
        },
        _count: true,
      }),
    ]);

    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.status === "COMPLETED" || o.status === "FULFILLED",
    ).length;
    const cancelledOrders = orders.filter(
      (o) => o.status === "CANCELLED",
    ).length;
    const pendingOrders = orders.filter(
      (o) =>
        o.status === "PENDING" ||
        o.status === "PREPARING" ||
        o.status === "CONFIRMED",
    ).length;

    const totalRevenue = Number(aggregates._sum.total || 0);
    const averageOrderValue = Number(aggregates._avg.total || 0);

    // Calculate average items per order
    const totalItems = orders.reduce(
      (sum, order) => sum + order.items.length,
      0,
    );
    const averageItemsPerOrder = totalOrders > 0 ? totalItems / totalOrders : 0;

    const completionRate =
      totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const cancellationRate =
      totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      totalRevenue,
      averageOrderValue,
      averageItemsPerOrder,
      completionRate,
      cancellationRate,
      period: {
        start: query.startDate,
        end: query.endDate,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 👥 CUSTOMER INSIGHTS
  // ═══════════════════════════════════════════════════════════

  /**
   * 🌟 Get Top Customers
   * Identifies most valuable customers with comprehensive insights
   */
  async getTopCustomers(
    query: OrderAnalyticsQuery,
    limit: number = 10,
  ): Promise<CustomerInsights[]> {
    const whereClause: any = {
      createdAt: {
        gte: query.startDate,
        lte: query.endDate,
      },
      status: {
        in: ["COMPLETED", "FULFILLED"],
      },
    };

    if (query.farmId) {
      whereClause.items = {
        some: {
          product: {
            farmId: query.farmId,
          },
        },
      };
    }

    // Get all completed orders with customer info
    const orders = await database.order.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Aggregate by customer
    const customerMap = new Map<
      string,
      {
        customerId: string;
        customerName: string;
        customerEmail: string;
        orders: Array<{ date: Date; amount: number }>;
        products: Map<string, { name: string; count: number }>;
      }
    >();

    for (const order of orders) {
      if (!order.customer) continue;

      const existing = customerMap.get(order.customer.id) || {
        customerId: order.customer.id,
        customerName: order.customer.name || "Unknown",
        customerEmail: order.customer.email || "",
        orders: [] as Array<{ date: Date; amount: number }>,
        products: new Map<string, { name: string; count: number }>(),
      };

      existing.orders.push({
        date: order.createdAt,
        amount: Number(order.total),
      });

      // Track product preferences
      for (const item of order.items) {
        const productData = existing.products.get(item.product.id) || {
          name: item.product.name,
          count: 0,
        };
        productData.count += 1;
        existing.products.set(item.product.id, productData);
      }

      customerMap.set(order.customer.id, existing);
    }

    // Convert to insights array
    const insights: CustomerInsights[] = [];
    const periodDays =
      (query.endDate.getTime() - query.startDate.getTime()) /
      (1000 * 60 * 60 * 24);
    const periodMonths = periodDays / 30;

    for (const data of customerMap.values()) {
      const totalOrders = data.orders.length;
      const totalSpent = data.orders.reduce((sum, o) => sum + o.amount, 0);
      const sortedOrders = data.orders.sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
      );

      // Get favorite products (top 3)
      const favoriteProducts = Array.from(data.products.entries())
        .map(([productId, productData]) => ({
          productId,
          productName: productData.name,
          orderCount: productData.count,
        }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 3);

      insights.push({
        customerId: data.customerId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        totalOrders,
        totalSpent,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
        lastOrderDate:
          sortedOrders[sortedOrders.length - 1]?.date || new Date(),
        firstOrderDate: sortedOrders[0]?.date || new Date(),
        lifetimeValue: totalSpent,
        orderFrequency: periodMonths > 0 ? totalOrders / periodMonths : 0,
        favoriteProducts,
      });
    }

    // Sort by lifetime value and limit
    return insights
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
      .slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════
  // 🥕 PRODUCT PERFORMANCE
  // ═══════════════════════════════════════════════════════════

  /**
   * 📈 Get Top Products
   * Ranks products by performance with agricultural insights
   */
  async getTopProducts(
    query: OrderAnalyticsQuery,
    limit: number = 10,
  ): Promise<ProductPerformance[]> {
    const whereClause: any = {
      order: {
        createdAt: {
          gte: query.startDate,
          lte: query.endDate,
        },
        status: {
          in: ["COMPLETED", "DELIVERED"],
        },
      },
    };

    if (query.farmId) {
      whereClause.product = {
        farmId: query.farmId,
      };
    }

    if (query.customerId) {
      whereClause.order = {
        ...whereClause.order,
        customerId: query.customerId,
      };
    }

    // Get all order items with product and farm info
    const orderItems = await database.orderItem.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            farm: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        order: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Aggregate by product
    const productMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        farmId: string;
        farmName: string;
        orderCount: number;
        totalQuantity: number;
        totalRevenue: number;
      }
    >();

    for (const item of orderItems) {
      const product = item.product;
      const farm = product.farm;

      if (!farm) continue;

      const existing = productMap.get(product.id) || {
        productId: product.id,
        productName: product.name,
        farmId: farm.id,
        farmName: farm.name,
        orderCount: 0,
        totalQuantity: 0,
        totalRevenue: 0,
      };

      existing.orderCount += 1;
      existing.totalQuantity += Number(item.quantity);
      existing.totalRevenue += Number(item.unitPrice) * Number(item.quantity);

      productMap.set(product.id, existing);
    }

    // Convert to performance array
    const performance: ProductPerformance[] = [];
    for (const data of productMap.values()) {
      performance.push({
        productId: data.productId,
        productName: data.productName,
        farmId: data.farmId,
        farmName: data.farmName,
        totalOrders: data.orderCount,
        totalQuantitySold: data.totalQuantity,
        totalRevenue: data.totalRevenue,
        averagePrice:
          data.totalQuantity > 0 ? data.totalRevenue / data.totalQuantity : 0,
        rank: 0, // Will be set after sorting
      });
    }

    // Sort by revenue and assign ranks
    performance.sort((a, b) => b.totalRevenue - a.totalRevenue);
    performance.forEach((product, index) => {
      product.rank = index + 1;
    });

    return performance.slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════
  // 📊 ORDER TRENDS
  // ═══════════════════════════════════════════════════════════

  /**
   * 📈 Calculate Order Trends
   * Compares current period with previous period
   */
  async getOrderTrends(query: OrderAnalyticsQuery): Promise<OrderTrend> {
    const periodDuration = query.endDate.getTime() - query.startDate.getTime();

    // Calculate metrics for current period
    const currentMetrics = await this.calculateOrderMetrics(query);

    // Calculate metrics for previous period
    const previousQuery: OrderAnalyticsQuery = {
      ...query,
      startDate: new Date(query.startDate.getTime() - periodDuration),
      endDate: query.startDate,
    };
    const previousMetrics = await this.calculateOrderMetrics(previousQuery);

    // Calculate growth percentages
    const ordersGrowth =
      previousMetrics.totalOrders > 0
        ? ((currentMetrics.totalOrders - previousMetrics.totalOrders) /
            previousMetrics.totalOrders) *
          100
        : 0;

    const revenueGrowth =
      previousMetrics.totalRevenue > 0
        ? ((currentMetrics.totalRevenue - previousMetrics.totalRevenue) /
            previousMetrics.totalRevenue) *
          100
        : 0;

    const aovGrowth =
      previousMetrics.averageOrderValue > 0
        ? ((currentMetrics.averageOrderValue -
            previousMetrics.averageOrderValue) /
            previousMetrics.averageOrderValue) *
          100
        : 0;

    const completionRateGrowth =
      currentMetrics.completionRate - previousMetrics.completionRate;

    return {
      period: this.formatPeriod(query.startDate, query.endDate),
      current: currentMetrics,
      previous: previousMetrics,
      growth: {
        orders: ordersGrowth,
        revenue: revenueGrowth,
        averageOrderValue: aovGrowth,
        completionRate: completionRateGrowth,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 🚚 FULFILLMENT METRICS
  // ═══════════════════════════════════════════════════════════

  /**
   * 📦 Calculate Fulfillment Metrics
   * Tracks order processing and delivery performance
   */
  async getFulfillmentMetrics(
    query: OrderAnalyticsQuery,
  ): Promise<FulfillmentMetrics> {
    const whereClause: any = {
      createdAt: {
        gte: query.startDate,
        lte: query.endDate,
      },
    };

    if (query.farmId) {
      whereClause.items = {
        some: {
          product: {
            farmId: query.farmId,
          },
        },
      };
    }

    if (query.customerId) {
      whereClause.customerId = query.customerId;
    }

    const orders = await database.order.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalOrders = orders.length;
    let totalFulfillmentTime = 0;
    let onTimeOrders = 0;
    let lateOrders = 0;

    // Status distribution
    const statusMap = new Map<OrderStatus, number>();

    for (const order of orders) {
      // Count by status
      statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);

      // Calculate fulfillment time for completed orders
      if (order.status === "COMPLETED" || order.status === "FULFILLED") {
        const fulfillmentTime =
          (order.updatedAt.getTime() - order.createdAt.getTime()) /
          (1000 * 60 * 60); // hours

        totalFulfillmentTime += fulfillmentTime;

        // Consider on-time if fulfilled within 48 hours
        if (fulfillmentTime <= 48) {
          onTimeOrders += 1;
        } else {
          lateOrders += 1;
        }
      }
    }

    const completedOrders = onTimeOrders + lateOrders;
    const averageFulfillmentTime =
      completedOrders > 0 ? totalFulfillmentTime / completedOrders : 0;
    const onTimeRate =
      completedOrders > 0 ? (onTimeOrders / completedOrders) * 100 : 0;

    // Convert status distribution to array
    const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0,
    }));

    return {
      totalOrders,
      onTimeOrders,
      lateOrders,
      averageFulfillmentTime,
      onTimeRate,
      byStatus,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 📉 TIME SERIES ANALYSIS
  // ═══════════════════════════════════════════════════════════

  /**
   * ⏰ Generate Time Series Order Data
   * Creates temporal analytics with configurable intervals
   */
  async getTimeSeriesData(
    query: OrderAnalyticsQuery,
    interval: "hour" | "day" | "week" | "month" = "day",
  ): Promise<TimeSeriesOrderData[]> {
    const whereClause: any = {
      createdAt: {
        gte: query.startDate,
        lte: query.endDate,
      },
    };

    if (query.farmId) {
      whereClause.items = {
        some: {
          product: {
            farmId: query.farmId,
          },
        },
      };
    }

    if (query.customerId) {
      whereClause.customerId = query.customerId;
    }

    const orders = await database.order.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        total: true,
        status: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by interval
    const dataMap = new Map<
      string,
      {
        timestamp: Date;
        totalOrders: number;
        revenue: number;
        completedOrders: number;
      }
    >();

    for (const order of orders) {
      const key = this.getIntervalKey(order.createdAt, interval);
      const existing = dataMap.get(key) || {
        timestamp: this.getIntervalStart(order.createdAt, interval),
        totalOrders: 0,
        revenue: 0,
        completedOrders: 0,
      };

      existing.totalOrders += 1;
      existing.revenue += Number(order.total);
      if (order.status === "COMPLETED" || order.status === "FULFILLED") {
        existing.completedOrders += 1;
      }

      dataMap.set(key, existing);
    }

    // Convert to array with calculations
    const results: TimeSeriesOrderData[] = [];
    for (const data of dataMap.values()) {
      results.push({
        timestamp: data.timestamp,
        orderCount: data.totalOrders,
        revenue: data.revenue,
        averageOrderValue:
          data.totalOrders > 0 ? data.revenue / data.totalOrders : 0,
        completionRate:
          data.totalOrders > 0
            ? (data.completedOrders / data.totalOrders) * 100
            : 0,
      });
    }

    return results.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 🔧 UTILITY METHODS
  // ═══════════════════════════════════════════════════════════

  /**
   * 🕐 Get Interval Key for Grouping
   */
  private getIntervalKey(
    date: Date,
    interval: "hour" | "day" | "week" | "month",
  ): string {
    const d = new Date(date);
    switch (interval) {
      case "hour":
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
      case "day":
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      case "week": {
        const week = Math.floor(d.getDate() / 7);
        return `${d.getFullYear()}-${d.getMonth()}-W${week}`;
      }
      case "month":
        return `${d.getFullYear()}-${d.getMonth()}`;
      default:
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }
  }

  /**
   * 🕐 Get Interval Start Time
   */
  private getIntervalStart(
    date: Date,
    interval: "hour" | "day" | "week" | "month",
  ): Date {
    const d = new Date(date);
    switch (interval) {
      case "hour":
        d.setMinutes(0, 0, 0);
        return d;
      case "day":
        d.setHours(0, 0, 0, 0);
        return d;
      case "week":
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay()); // Start of week
        return d;
      case "month":
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
      default:
        d.setHours(0, 0, 0, 0);
        return d;
    }
  }

  /**
   * 📅 Format Period String
   */
  private formatPeriod(startDate: Date, endDate: Date): string {
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];
    return `${start} to ${end}`;
  }

  // ═══════════════════════════════════════════════════════════
  // 🎯 COMPREHENSIVE ANALYTICS
  // ═══════════════════════════════════════════════════════════

  /**
   * 🌟 Get Complete Order Analytics
   * One-stop method for all order analytics data
   */
  async getComprehensiveAnalytics(
    query: OrderAnalyticsQuery,
    options: {
      includeTopCustomers?: boolean;
      includeTopProducts?: boolean;
      includeTrends?: boolean;
      includeFulfillment?: boolean;
      includeTimeSeries?: boolean;
      topCustomersLimit?: number;
      topProductsLimit?: number;
      timeSeriesInterval?: "hour" | "day" | "week" | "month";
    } = {},
  ): Promise<OrderAnalyticsResponse> {
    try {
      const {
        includeTopCustomers = true,
        includeTopProducts = true,
        includeTrends = true,
        includeFulfillment = true,
        includeTimeSeries = true,
        topCustomersLimit = 10,
        topProductsLimit = 10,
        timeSeriesInterval = "day",
      } = options;

      // Calculate core metrics
      const metrics = await this.calculateOrderMetrics(query);

      // Parallel fetch optional data
      const [topCustomers, topProducts, trends, fulfillment, timeSeries] =
        await Promise.all([
          includeTopCustomers
            ? this.getTopCustomers(query, topCustomersLimit)
            : null,
          includeTopProducts
            ? this.getTopProducts(query, topProductsLimit)
            : null,
          includeTrends ? this.getOrderTrends(query) : null,
          includeFulfillment ? this.getFulfillmentMetrics(query) : null,
          includeTimeSeries
            ? this.getTimeSeriesData(query, timeSeriesInterval)
            : null,
        ]);

      return {
        success: true,
        data: {
          metrics,
          ...(topCustomers && { topCustomers }),
          ...(topProducts && { topProducts }),
          ...(trends && { trends }),
          ...(fulfillment && { fulfillment }),
          ...(timeSeries && { timeSeries }),
        },
        agricultural: {
          season: this.getCurrentSeason(),
          consciousness: "DIVINE",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "ORDER_ANALYTICS_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate order analytics",
          details: error instanceof Error ? { stack: error.stack } : undefined,
        },
        agricultural: {
          consciousness: "DIVINE",
        },
      };
    }
  }

  /**
   * 🌾 Get Current Agricultural Season
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }
}

// ═══════════════════════════════════════════════════════════
// 🌟 EXPORT SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════

export const orderAnalyticsService = OrderAnalyticsService.getInstance();
