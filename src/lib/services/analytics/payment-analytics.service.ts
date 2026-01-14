/**
 * 💰 Payment Analytics Service - Divine Transaction Intelligence
 * Comprehensive payment analytics with agricultural consciousness
 * Following: 11_KILO_SCALE_ARCHITECTURE & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { database } from "@/lib/database";
import type { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";

/**
 * Payment metrics interface
 */
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
    startDate: Date;
    endDate: Date;
  };
}

/**
 * Payment metrics by method
 */
export interface PaymentMethodMetrics {
  method: PaymentMethod;
  totalTransactions: number;
  totalRevenue: number;
  successRate: number;
  averageValue: number;
}

/**
 * Farm revenue metrics
 */
export interface FarmRevenueMetrics {
  farmId: string;
  farmName: string;
  totalRevenue: number;
  transactionCount: number;
  averageOrderValue: number;
}

/**
 * Revenue by payment method
 */
export interface RevenueByPaymentMethod {
  method: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
  percentage: number;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  timestamp: Date;
  revenue: number;
  transactionCount: number;
  successRate: number;
}

/**
 * Top farm by revenue
 */
export interface TopFarmByRevenue {
  rank: number;
  farmId: string;
  farmName: string;
  totalRevenue: number;
  transactionCount: number;
  averageOrderValue: number;
}

/**
 * Comprehensive analytics response
 */
export interface ComprehensiveAnalyticsResponse {
  success: boolean;
  data?: {
    metrics: PaymentMetrics;
    byMethod?: RevenueByPaymentMethod[];
    timeSeries?: TimeSeriesDataPoint[];
    trends?: any;
    topFarms?: TopFarmByRevenue[];
  };
  error?: {
    code: string;
    message: string;
  };
  agricultural?: {
    consciousness: string;
    season: string;
  };
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
  farmId?: string;
}

/**
 * Payment trend data point
 */
export interface PaymentTrendPoint {
  date: string;
  transactions: number;
  revenue: number;
  successfulTransactions: number;
  failedTransactions: number;
}

/**
 * Calculate payment metrics options
 */
export interface CalculatePaymentMetricsOptions {
  startDate: Date;
  endDate: Date;
  farmId?: string;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
}

/**
 * 💰 Payment Analytics Service
 * Singleton service for payment analytics and insights
 */
export class PaymentAnalyticsService {
  private static instance: PaymentAnalyticsService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PaymentAnalyticsService {
    if (!PaymentAnalyticsService.instance) {
      PaymentAnalyticsService.instance = new PaymentAnalyticsService();
    }
    return PaymentAnalyticsService.instance;
  }

  /**
   * Calculate payment metrics for a given period
   */
  async calculatePaymentMetrics(
    options: CalculatePaymentMetricsOptions,
  ): Promise<PaymentMetrics> {
    const { startDate, endDate, farmId, paymentMethod, status } = options;

    // Build where clause
    const where: Prisma.PaymentWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (status) {
      where.status = status;
    }

    if (farmId) {
      where.order = {
        farmId: farmId,
      };
    }

    // Fetch payments and aggregates in parallel
    const [payments, aggregates] = await Promise.all([
      database.payment.findMany({
        where,
        select: {
          amount: true,
          status: true,
        },
      }),
      database.payment.aggregate({
        where,
        _sum: {
          amount: true,
        },
        _avg: {
          amount: true,
        },
        _count: true,
      }),
    ]);

    // Calculate status counts
    const successfulTransactions = payments.filter(
      (p: any) => p.status === "PAID",
    ).length;

    const failedTransactions = payments.filter(
      (p: any) => p.status === "FAILED",
    ).length;

    const pendingTransactions = payments.filter(
      (p: any) => p.status === "PENDING" || p.status === "PROCESSING",
    ).length;

    const totalTransactions = payments.length;
    const totalRevenue = aggregates._sum.amount
      ? parseFloat(aggregates._sum.amount.toString())
      : 0;
    const averageTransactionValue = aggregates._avg.amount
      ? parseFloat(aggregates._avg.amount.toString())
      : 0;

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
        startDate,
        endDate,
      },
    };
  }

  /**
   * Get payment metrics by payment method
   */
  async getPaymentMethodMetrics(
    startDate: Date,
    endDate: Date,
    farmId?: string,
  ): Promise<PaymentMethodMetrics[]> {
    const whereBase: Prisma.PaymentWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    const where = farmId ? { ...whereBase, order: { farmId } } : whereBase;

    // Group by payment method
    const results = await database.payment.groupBy({
      by: ["paymentMethod"],
      where,
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    // Get success rates for each method
    const methodMetrics = await Promise.all(
      results.map(async (result: any) => {
        const methodWhere: Prisma.PaymentWhereInput = {
          ...where,
          paymentMethod: result.paymentMethod,
        };

        const [total, successful] = await Promise.all([
          database.payment.count({ where: methodWhere }),
          database.payment.count({
            where: {
              ...methodWhere,
              status: "PAID",
            },
          }),
        ]);

        const successRate = total > 0 ? (successful / total) * 100 : 0;
        const totalRevenue = result._sum.amount
          ? parseFloat(result._sum.amount.toString())
          : 0;
        const averageValue =
          result._count.id > 0 ? totalRevenue / result._count.id : 0;

        return {
          method: result.paymentMethod,
          totalTransactions: result._count.id,
          totalRevenue,
          successRate,
          averageValue,
        };
      }),
    );

    return methodMetrics as PaymentMethodMetrics[];
  }

  /**
   * Get revenue metrics by farm
   */
  async getFarmRevenueMetrics(
    startDate: Date,
    endDate: Date,
    limit: number = 10,
  ): Promise<FarmRevenueMetrics[]> {
    const payments = await database.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "PAID",
      },
      include: {
        order: {
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
    });

    // Group by farm
    const farmMap = new Map<
      string,
      {
        farmName: string;
        totalRevenue: number;
        transactionCount: number;
      }
    >();

    payments.forEach((payment: any) => {
      if (!payment.order?.farm) return;

      const farmId = payment.order.farm.id;
      const farmName = payment.order.farm.name;
      const amount = parseFloat(payment.amount.toString());

      if (farmMap.has(farmId)) {
        const existing = farmMap.get(farmId)!;
        existing.totalRevenue += amount;
        existing.transactionCount += 1;
      } else {
        farmMap.set(farmId, {
          farmName,
          totalRevenue: amount,
          transactionCount: 1,
        });
      }
    });

    // Convert to array and calculate averages
    const farmMetrics: FarmRevenueMetrics[] = Array.from(farmMap.entries())
      .map(([farmId, data]) => ({
        farmId,
        farmName: data.farmName,
        totalRevenue: data.totalRevenue,
        transactionCount: data.transactionCount,
        averageOrderValue: data.totalRevenue / data.transactionCount,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    return farmMetrics;
  }

  /**
   * Get payment trends over time
   */
  async getPaymentTrends(
    startDate: Date,
    endDate: Date,
    granularity: "day" | "week" | "month" = "day",
  ): Promise<PaymentTrendPoint[]> {
    const payments = await database.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by date
    const trendMap = new Map<
      string,
      {
        transactions: number;
        revenue: number;
        successfulTransactions: number;
        failedTransactions: number;
      }
    >();

    payments.forEach((payment: any) => {
      const dateKey = this.formatDateByGranularity(
        payment.createdAt,
        granularity,
      );

      if (!trendMap.has(dateKey)) {
        trendMap.set(dateKey, {
          transactions: 0,
          revenue: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
        });
      }

      const data = trendMap.get(dateKey)!;
      data.transactions += 1;
      data.revenue += parseFloat(payment.amount.toString());

      if (payment.status === "PAID") {
        data.successfulTransactions += 1;
      } else if (payment.status === "FAILED") {
        data.failedTransactions += 1;
      }
    });

    // Convert to array
    const trends: PaymentTrendPoint[] = Array.from(trendMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return trends;
  }

  /**
   * Get total platform revenue
   */
  async getTotalPlatformRevenue(
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const where: Prisma.PaymentWhereInput = {
      status: "PAID",
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const result = await database.payment.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount ? parseFloat(result._sum.amount.toString()) : 0;
  }

  /**
   * Get payment success rate
   */
  async getPaymentSuccessRate(
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const where: Prisma.PaymentWhereInput = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [total, successful] = await Promise.all([
      database.payment.count({ where }),
      database.payment.count({
        where: {
          ...where,
          status: "PAID",
        },
      }),
    ]);

    return total > 0 ? (successful / total) * 100 : 0;
  }

  /**
   * Format date by granularity
   */
  private formatDateByGranularity(
    date: Date,
    granularity: "day" | "week" | "month",
  ): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    if (granularity === "day") {
      return `${year}-${month}-${day}`;
    } else if (granularity === "week") {
      const weekNumber = this.getWeekNumber(date);
      return `${year}-W${String(weekNumber).padStart(2, "0")}`;
    } else {
      return `${year}-${month}`;
    }
  }

  /**
   * Get ISO week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Get revenue by payment method (TEST EXPECTED METHOD)
   */
  async getRevenueByPaymentMethod(
    filter: DateRangeFilter,
  ): Promise<RevenueByPaymentMethod[]> {
    const { startDate, endDate, farmId } = filter;

    const where: Prisma.PaymentWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: "PAID",
    };

    if (farmId) {
      where.order = {
        farmId: farmId,
      };
    }

    const payments = await database.payment.findMany({
      where,
      select: {
        amount: true,
        paymentMethod: true,
      },
    });

    // Group by payment method
    const methodMap = new Map<string, { count: number; totalAmount: number }>();

    payments.forEach((payment: any) => {
      const method = payment.paymentMethod;
      const amount = parseFloat(payment.amount.toString());

      if (methodMap.has(method)) {
        const existing = methodMap.get(method)!;
        existing.count += 1;
        existing.totalAmount += amount;
      } else {
        methodMap.set(method, { count: 1, totalAmount: amount });
      }
    });

    // Calculate totals for percentage
    const grandTotal = Array.from(methodMap.values()).reduce(
      (sum, item) => sum + item.totalAmount,
      0,
    );

    // Convert to array with percentages
    const results: RevenueByPaymentMethod[] = Array.from(methodMap.entries())
      .map(([method, data]) => ({
        method,
        count: data.count,
        totalAmount: data.totalAmount,
        averageAmount: data.totalAmount / data.count,
        percentage: grandTotal > 0 ? (data.totalAmount / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return results;
  }

  /**
   * Get time series data (TEST EXPECTED METHOD)
   */
  async getTimeSeriesData(
    filter: DateRangeFilter,
    interval: "hour" | "day" | "week" | "month",
  ): Promise<TimeSeriesDataPoint[]> {
    const { startDate, endDate, farmId } = filter;

    const where: Prisma.PaymentWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (farmId) {
      where.order = {
        farmId: farmId,
      };
    }

    const payments = await database.payment.findMany({
      where,
      select: {
        amount: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (payments.length === 0) {
      return [];
    }

    // Group by time interval
    const timeMap = new Map<
      string,
      {
        revenue: number;
        transactionCount: number;
        successCount: number;
      }
    >();

    payments.forEach((payment: any) => {
      const timeKey = this.formatDateByInterval(payment.createdAt, interval);

      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, {
          revenue: 0,
          transactionCount: 0,
          successCount: 0,
        });
      }

      const data = timeMap.get(timeKey)!;
      data.transactionCount += 1;

      if (payment.status === "PAID") {
        data.revenue += parseFloat(payment.amount.toString());
        data.successCount += 1;
      }
    });

    // Convert to array with Date objects
    const results: TimeSeriesDataPoint[] = Array.from(timeMap.entries())
      .map(([timeKey, data]) => ({
        timestamp: this.parseTimeKey(timeKey, interval),
        revenue: data.revenue,
        transactionCount: data.transactionCount,
        successRate:
          data.transactionCount > 0
            ? (data.successCount / data.transactionCount) * 100
            : 0,
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return results;
  }

  /**
   * Get top farms by revenue (TEST EXPECTED METHOD)
   */
  async getTopFarmsByRevenue(
    filter: DateRangeFilter,
    limit: number = 10,
  ): Promise<TopFarmByRevenue[]> {
    const { startDate, endDate } = filter;

    const payments = await database.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "PAID",
      },
      include: {
        order: {
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
    });

    // Group by farm
    const farmMap = new Map<
      string,
      {
        farmName: string;
        totalRevenue: number;
        transactionCount: number;
      }
    >();

    payments.forEach((payment: any) => {
      if (!payment.order || !payment.order.farm) return;

      const farmId = payment.order.farm.id;
      const farmName = payment.order.farm.name;
      const amount = parseFloat(payment.amount.toString());

      if (farmMap.has(farmId)) {
        const existing = farmMap.get(farmId)!;
        existing.totalRevenue += amount;
        existing.transactionCount += 1;
      } else {
        farmMap.set(farmId, {
          farmName,
          totalRevenue: amount,
          transactionCount: 1,
        });
      }
    });

    // Convert to array and rank
    const results: TopFarmByRevenue[] = Array.from(farmMap.entries())
      .map(([farmId, data]) => ({
        rank: 0, // Will be set below
        farmId,
        farmName: data.farmName,
        totalRevenue: data.totalRevenue,
        transactionCount: data.transactionCount,
        averageOrderValue: data.totalRevenue / data.transactionCount,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit)
      .map((farm: any, index: any) => ({
        ...farm,
        rank: index + 1,
      }));

    return results;
  }

  /**
   * Get comprehensive analytics (TEST EXPECTED METHOD)
   */
  async getComprehensiveAnalytics(
    filter: DateRangeFilter,
    options?: {
      includeByMethod?: boolean;
      includeTimeSeries?: boolean;
      includeTrends?: boolean;
      includeTopFarms?: boolean;
    },
  ): Promise<ComprehensiveAnalyticsResponse> {
    try {
      const { startDate, endDate, farmId } = filter;

      // Get base metrics
      const metrics = await this.calculatePaymentMetrics({
        startDate,
        endDate,
        farmId,
      });

      const data: ComprehensiveAnalyticsResponse["data"] = {
        metrics,
      };

      // Include optional analytics
      if (options?.includeByMethod) {
        data.byMethod = await this.getRevenueByPaymentMethod(filter);
      }

      if (options?.includeTimeSeries) {
        data.timeSeries = await this.getTimeSeriesData(filter, "day");
      }

      if (options?.includeTrends) {
        data.trends = await this.getPaymentTrends(startDate, endDate, "day");
      }

      if (options?.includeTopFarms) {
        data.topFarms = await this.getTopFarmsByRevenue(filter, 10);
      }

      return {
        success: true,
        data,
        agricultural: {
          consciousness: "DIVINE",
          season: this.getCurrentSeason(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "ANALYTICS_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        agricultural: {
          consciousness: "DIVINE",
          season: this.getCurrentSeason(),
        },
      };
    }
  }

  /**
   * Format date by interval
   */
  private formatDateByInterval(
    date: Date,
    interval: "hour" | "day" | "week" | "month",
  ): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");

    if (interval === "hour") {
      return `${year}-${month}-${day}T${hour}`;
    } else if (interval === "day") {
      return `${year}-${month}-${day}`;
    } else if (interval === "week") {
      const weekNumber = this.getWeekNumber(date);
      return `${year}-W${String(weekNumber).padStart(2, "0")}`;
    } else {
      return `${year}-${month}`;
    }
  }

  /**
   * Parse time key back to Date
   */
  private parseTimeKey(
    timeKey: string,
    interval: "hour" | "day" | "week" | "month",
  ): Date {
    if (interval === "hour") {
      // Format: 2024-01-15T10
      const parts = timeKey.split("T");
      const datePart = parts[0] || "2024-01-01";
      const hourPart = parts[1] || "00";
      return new Date(`${datePart}T${hourPart}:00:00Z`);
    } else if (interval === "day") {
      // Format: 2024-01-15
      return new Date(`${timeKey}T00:00:00Z`);
    } else if (interval === "week") {
      // Format: 2024-W03
      const parts = timeKey.split("-W");
      const yearStr = parts[0] || "2024";
      const weekStr = parts[1] || "1";
      const year = parseInt(yearStr);
      const week = parseInt(weekStr);
      const date = new Date(year, 0, 1 + (week - 1) * 7);
      return date;
    } else {
      // Format: 2024-01
      return new Date(`${timeKey}-01T00:00:00Z`);
    }
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

// Export singleton instance
export const paymentAnalyticsService = PaymentAnalyticsService.getInstance();
