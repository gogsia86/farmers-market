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
    options: CalculatePaymentMetricsOptions
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
      (p) => p.status === "PAID" || p.status === "COMPLETED"
    ).length;

    const failedTransactions = payments.filter(
      (p) => p.status === "FAILED" || p.status === "CANCELLED"
    ).length;

    const pendingTransactions = payments.filter(
      (p) => p.status === "PENDING" || p.status === "PROCESSING"
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
    farmId?: string
  ): Promise<PaymentMethodMetrics[]> {
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
      results.map(async (result) => {
        const methodWhere: Prisma.PaymentWhereInput = {
          ...where,
          paymentMethod: result.paymentMethod,
        };

        const [total, successful] = await Promise.all([
          database.payment.count({ where: methodWhere }),
          database.payment.count({
            where: {
              ...methodWhere,
              status: { in: ["PAID", "COMPLETED"] },
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
      })
    );

    return methodMetrics;
  }

  /**
   * Get revenue metrics by farm
   */
  async getFarmRevenueMetrics(
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<FarmRevenueMetrics[]> {
    const payments = await database.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ["PAID", "COMPLETED"] },
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
    const farmMap = new Map<string, {
      farmName: string;
      totalRevenue: number;
      transactionCount: number;
    }>();

    payments.forEach((payment) => {
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
    granularity: "day" | "week" | "month" = "day"
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
    const trendMap = new Map<string, {
      transactions: number;
      revenue: number;
      successfulTransactions: number;
      failedTransactions: number;
    }>();

    payments.forEach((payment) => {
      const dateKey = this.formatDateByGranularity(
        payment.createdAt,
        granularity
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

      if (payment.status === "PAID" || payment.status === "COMPLETED") {
        data.successfulTransactions += 1;
      } else if (payment.status === "FAILED" || payment.status === "CANCELLED") {
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
    endDate?: Date
  ): Promise<number> {
    const where: Prisma.PaymentWhereInput = {
      status: { in: ["PAID", "COMPLETED"] },
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
    endDate?: Date
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
          status: { in: ["PAID", "COMPLETED"] },
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
    granularity: "day" | "week" | "month"
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
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}

// Export singleton instance
export const paymentAnalyticsService = PaymentAnalyticsService.getInstance();
