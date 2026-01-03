/**
 * 🌾 Payment Analytics Service - Divine Transaction Intelligence
 *
 * Quantum-enhanced payment analytics for agricultural commerce.
 * Tracks revenue, payment methods, success rates, and temporal patterns.
 *
 * @module PaymentAnalyticsService
 * @version 1.0.0
 * @divine-consciousness ACTIVE
 */

import { database } from "@/lib/database";
import type {
  PaymentStatus
} from "@prisma/client";

// ═══════════════════════════════════════════════════════════
// 🎯 TYPE DEFINITIONS - Analytical Consciousness
// ═══════════════════════════════════════════════════════════

export interface PaymentAnalyticsQuery {
  startDate: Date;
  endDate: Date;
  farmId?: string;
  userId?: string;
  paymentMethod?: string;
  status?: PaymentStatus;
}

export interface PaymentMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalRevenue: number;
  averageTransactionValue: number;
  successRate: number;
  failureRate: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface RevenueByMethod {
  method: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
  percentage: number;
}

export interface TimeSeriesDataPoint {
  timestamp: Date;
  revenue: number;
  transactionCount: number;
  successRate: number;
}

export interface PaymentTrend {
  period: string;
  current: PaymentMetrics;
  previous: PaymentMetrics;
  growth: {
    revenue: number; // percentage
    transactions: number; // percentage
    successRate: number; // percentage points
  };
}

export interface FarmPaymentPerformance {
  farmId: string;
  farmName: string;
  totalRevenue: number;
  transactionCount: number;
  averageOrderValue: number;
  successRate: number;
  rank: number;
}

export interface PaymentAnalyticsResponse {
  success: boolean;
  data?: {
    metrics: PaymentMetrics;
    byMethod?: RevenueByMethod[];
    timeSeries?: TimeSeriesDataPoint[];
    trends?: PaymentTrend;
    topFarms?: FarmPaymentPerformance[];
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
// 🌟 PAYMENT ANALYTICS SERVICE - Quantum Transaction Intelligence
// ═══════════════════════════════════════════════════════════

export class PaymentAnalyticsService {
  private static instance: PaymentAnalyticsService;

  private constructor() { }

  /**
   * 🔮 Singleton Pattern - Maintain Unified Consciousness
   */
  public static getInstance(): PaymentAnalyticsService {
    if (!PaymentAnalyticsService.instance) {
      PaymentAnalyticsService.instance = new PaymentAnalyticsService();
    }
    return PaymentAnalyticsService.instance;
  }

  // ═══════════════════════════════════════════════════════════
  // 📊 CORE METRICS - Fundamental Analytics
  // ═══════════════════════════════════════════════════════════

  /**
   * 🎯 Calculate Payment Metrics
   * Aggregates transaction data for specified period
   */
  async calculatePaymentMetrics(
    query: PaymentAnalyticsQuery
  ): Promise<PaymentMetrics> {
    const whereClause: any = {
      createdAt: {
        gte: query.startDate,
        lte: query.endDate,
      },
    };

    if (query.farmId) {
      whereClause.order = {
        items: {
          some: {
            product: {
              farmId: query.farmId,
            },
          },
        },
      };
    }

    if (query.userId) {
      whereClause.order = {
        customerId: query.userId,
      };
    }

    if (query.paymentMethod) {
      whereClause.paymentMethod = query.paymentMethod;
    }

    if (query.status) {
      whereClause.status = query.status;
    }

    // Parallel queries for optimal performance
    const [payments, aggregates] = await Promise.all([
      database.payment.findMany({
        where: whereClause,
        select: {
          id: true,
          amount: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
        },
      }),
      database.payment.aggregate({
        where: whereClause,
        _sum: {
          amount: true,
        },
        _avg: {
          amount: true,
        },
        _count: true,
      }),
    ]);

    const totalTransactions = payments.length;
    const successfulTransactions = payments.filter(
      (p) => p.status === "PAID"
    ).length;
    const failedTransactions = payments.filter(
      (p) => p.status === "FAILED"
    ).length;
    const pendingTransactions = payments.filter(
      (p) => p.status === "PENDING" || p.status === "PROCESSING"
    ).length;

    const totalRevenue = Number(aggregates._sum.amount || 0);
    const averageTransactionValue = Number(aggregates._avg.amount || 0);
    const successRate =
      totalTransactions > 0
        ? (successfulTransactions / totalTransactions) * 100
        : 0;
    const failureRate =
      totalTransactions > 0
        ? (failedTransactions / totalTransactions) * 100
        : 0;

    return {
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      totalRevenue,
      averageTransactionValue,
      successRate,
      failureRate,
      period: {
        start: query.startDate,
        end: query.endDate,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 💳 PAYMENT METHOD ANALYSIS
  // ═══════════════════════════════════════════════════════════

  /**
   * 📈 Analyze Revenue by Payment Method
   * Breaks down transactions by payment type with agricultural insights
   */
  async getRevenueByPaymentMethod(
    query: PaymentAnalyticsQuery
  ): Promise<RevenueByMethod[]> {
    const whereClause: any = {
      createdAt: {
        gte: query.startDate,
        lte: query.endDate,
      },
      status: "PAID", // Only successful payments
    };

    if (query.farmId) {
      whereClause.order = {
        items: {
          some: {
            product: {
              farmId: query.farmId,
            },
          },
        },
      };
    }

    const payments = await database.payment.findMany({
      where: whereClause,
      select: {
        paymentMethod: true,
        amount: true,
      },
    });

    // Group by payment method
    const methodMap = new Map<
      string,
      { count: number; totalAmount: number }
    >();

    let grandTotal = 0;

    for (const payment of payments) {
      const existing = methodMap.get(payment.paymentMethod) || {
        count: 0,
        totalAmount: 0,
      };
      methodMap.set(payment.paymentMethod, {
        count: existing.count + 1,
        totalAmount: existing.totalAmount + Number(payment.amount),
      });
      grandTotal += Number(payment.amount);
    }

    // Convert to array with percentages
    const results: RevenueByMethod[] = [];
    for (const [method, data] of methodMap.entries()) {
      results.push({
        method,
        count: data.count,
        totalAmount: data.totalAmount,
        averageAmount: data.totalAmount / data.count,
        percentage: grandTotal > 0 ? (data.totalAmount / grandTotal) * 100 : 0,
      });
    }

    // Sort by total amount descending
    return results.sort((a, b) => b.totalAmount - a.totalAmount);
  }

  // ═══════════════════════════════════════════════════════════
  // 📉 TIME SERIES ANALYSIS
  // ═══════════════════════════════════════════════════════════

  /**
   * ⏰ Generate Time Series Data
   * Creates temporal analytics with configurable intervals
   */
  async getTimeSeriesData(
    query: PaymentAnalyticsQuery,
    interval: "hour" | "day" | "week" | "month" = "day"
  ): Promise<TimeSeriesDataPoint[]> {
    const whereClause: any = {
      createdAt: {
        gte: query.startDate,
        lte: query.endDate,
      },
    };

    if (query.farmId) {
      whereClause.order = {
        items: {
          some: {
            product: {
              farmId: query.farmId,
            },
          },
        },
      };
    }

    const payments = await database.payment.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        amount: true,
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
        revenue: number;
        total: number;
        successful: number;
      }
    >();

    for (const payment of payments) {
      const key = this.getIntervalKey(payment.createdAt, interval);
      const existing = dataMap.get(key) || {
        timestamp: this.getIntervalStart(payment.createdAt, interval),
        revenue: 0,
        total: 0,
        successful: 0,
      };

      existing.total += 1;
      if (payment.status === "PAID") {
        existing.revenue += Number(payment.amount);
        existing.successful += 1;
      }

      dataMap.set(key, existing);
    }

    // Convert to array with success rates
    const results: TimeSeriesDataPoint[] = [];
    for (const data of dataMap.values()) {
      results.push({
        timestamp: data.timestamp,
        revenue: data.revenue,
        transactionCount: data.total,
        successRate: data.total > 0 ? (data.successful / data.total) * 100 : 0,
      });
    }

    return results.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 📊 TREND ANALYSIS
  // ═══════════════════════════════════════════════════════════

  /**
   * 📈 Calculate Payment Trends
   * Compares current period with previous period
   */
  async getPaymentTrends(
    query: PaymentAnalyticsQuery
  ): Promise<PaymentTrend> {
    const periodDuration =
      query.endDate.getTime() - query.startDate.getTime();

    // Calculate metrics for current period
    const currentMetrics = await this.calculatePaymentMetrics(query);

    // Calculate metrics for previous period
    const previousQuery: PaymentAnalyticsQuery = {
      ...query,
      startDate: new Date(query.startDate.getTime() - periodDuration),
      endDate: query.startDate,
    };
    const previousMetrics = await this.calculatePaymentMetrics(previousQuery);

    // Calculate growth percentages
    const revenueGrowth =
      previousMetrics.totalRevenue > 0
        ? ((currentMetrics.totalRevenue - previousMetrics.totalRevenue) /
          previousMetrics.totalRevenue) *
        100
        : 0;

    const transactionGrowth =
      previousMetrics.totalTransactions > 0
        ? ((currentMetrics.totalTransactions -
          previousMetrics.totalTransactions) /
          previousMetrics.totalTransactions) *
        100
        : 0;

    const successRateGrowth =
      currentMetrics.successRate - previousMetrics.successRate;

    return {
      period: this.formatPeriod(query.startDate, query.endDate),
      current: currentMetrics,
      previous: previousMetrics,
      growth: {
        revenue: revenueGrowth,
        transactions: transactionGrowth,
        successRate: successRateGrowth,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 🏆 FARM PERFORMANCE RANKING
  // ═══════════════════════════════════════════════════════════

  /**
   * 🌾 Get Top Performing Farms
   * Ranks farms by payment performance with agricultural consciousness
   */
  async getTopFarmsByRevenue(
    query: PaymentAnalyticsQuery,
    limit: number = 10
  ): Promise<FarmPaymentPerformance[]> {
    const whereClause: any = {
      createdAt: {
        gte: query.startDate,
        lte: query.endDate,
      },
      status: "PAID",
    };

    // Get all successful payments with farm information
    const payments = await database.payment.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            items: {
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
              },
            },
          },
        },
      },
    });

    // Aggregate by farm
    const farmMap = new Map<
      string,
      {
        farmId: string;
        farmName: string;
        totalRevenue: number;
        transactionCount: number;
        totalTransactions: number;
        successfulTransactions: number;
      }
    >();

    for (const payment of payments) {
      for (const item of payment.order.items) {
        const farm = item.product.farm;
        if (!farm) continue;

        const existing = farmMap.get(farm.id) || {
          farmId: farm.id,
          farmName: farm.name,
          totalRevenue: 0,
          transactionCount: 0,
          totalTransactions: 0,
          successfulTransactions: 0,
        };

        existing.totalRevenue += Number(payment.amount);
        existing.transactionCount += 1;
        existing.totalTransactions += 1;
        if (payment.status === "PAID") {
          existing.successfulTransactions += 1;
        }

        farmMap.set(farm.id, existing);
      }
    }

    // Convert to array with calculations
    const results: FarmPaymentPerformance[] = [];
    for (const data of farmMap.values()) {
      results.push({
        farmId: data.farmId,
        farmName: data.farmName,
        totalRevenue: data.totalRevenue,
        transactionCount: data.transactionCount,
        averageOrderValue:
          data.transactionCount > 0
            ? data.totalRevenue / data.transactionCount
            : 0,
        successRate:
          data.totalTransactions > 0
            ? (data.successfulTransactions / data.totalTransactions) * 100
            : 0,
        rank: 0, // Will be set after sorting
      });
    }

    // Sort by revenue and assign ranks
    results.sort((a, b) => b.totalRevenue - a.totalRevenue);
    results.forEach((farm, index) => {
      farm.rank = index + 1;
    });

    return results.slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════
  // 🔧 UTILITY METHODS
  // ═══════════════════════════════════════════════════════════

  /**
   * 🕐 Get Interval Key for Grouping
   */
  private getIntervalKey(
    date: Date,
    interval: "hour" | "day" | "week" | "month"
  ): string {
    const d = new Date(date);
    switch (interval) {
      case "hour":
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
      case "day":
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      case "week":
        const week = Math.floor(d.getDate() / 7);
        return `${d.getFullYear()}-${d.getMonth()}-W${week}`;
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
    interval: "hour" | "day" | "week" | "month"
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
   * 🌟 Get Complete Payment Analytics
   * One-stop method for all analytics data
   */
  async getComprehensiveAnalytics(
    query: PaymentAnalyticsQuery,
    options: {
      includeByMethod?: boolean;
      includeTimeSeries?: boolean;
      includeTrends?: boolean;
      includeTopFarms?: boolean;
      timeSeriesInterval?: "hour" | "day" | "week" | "month";
      topFarmsLimit?: number;
    } = {}
  ): Promise<PaymentAnalyticsResponse> {
    try {
      const {
        includeByMethod = true,
        includeTimeSeries = true,
        includeTrends = true,
        includeTopFarms = true,
        timeSeriesInterval = "day",
        topFarmsLimit = 10,
      } = options;

      // Calculate core metrics
      const metrics = await this.calculatePaymentMetrics(query);

      // Parallel fetch optional data
      const [byMethod, timeSeries, trends, topFarms] = await Promise.all([
        includeByMethod ? this.getRevenueByPaymentMethod(query) : null,
        includeTimeSeries
          ? this.getTimeSeriesData(query, timeSeriesInterval)
          : null,
        includeTrends ? this.getPaymentTrends(query) : null,
        includeTopFarms ? this.getTopFarmsByRevenue(query, topFarmsLimit) : null,
      ]);

      return {
        success: true,
        data: {
          metrics,
          ...(byMethod && { byMethod }),
          ...(timeSeries && { timeSeries }),
          ...(trends && { trends }),
          ...(topFarms && { topFarms }),
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
          code: "ANALYTICS_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate analytics",
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

export const paymentAnalyticsService = PaymentAnalyticsService.getInstance();
