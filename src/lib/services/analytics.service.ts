/**
 * ANALYTICS SERVICE - Quantum Business Intelligence Engine
 * Divine agricultural analytics and reporting
 *
 * @divine-pattern Service layer with comprehensive metrics
 * @agricultural-consciousness Seasonal performance tracking
 * @reference .github/instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md
 */

import { database } from "@/lib/database";
import {
  calculateGrowthRate,
  calculatePercentage,
  FarmPerformanceMetrics,
  FinancialReport,
  getPreviousPeriod,
  MultiFarmComparison,
  SalesMetrics,
  SeasonalSalesAnalytics,
  SeasonalTimeRange,
  TimeRange,
} from "@/types/analytics.types";
import { Season } from "@/types/farm.types";

export class AnalyticsService {
  // ============================================
  // SALES ANALYTICS
  // ============================================

  /**
   * Get comprehensive sales metrics for time period
   */
  static async getSalesMetrics(
    timeRange: TimeRange,
    farmId?: string
  ): Promise<SalesMetrics> {
    const where: Record<string, unknown> = {
      createdAt: {
        gte: timeRange.start,
        lte: timeRange.end,
      },
    };

    if (farmId) {
      where.farmId = farmId;
    }

    // Get orders and calculate metrics
    const orders = await database.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate conversion rate (simplified - would need session/view data)
    const conversionRate = 2.5; // Mock value

    // Get previous period for growth calculations
    const previousPeriod = getPreviousPeriod(timeRange);
    const previousOrders = await database.order.count({
      where: {
        createdAt: {
          gte: previousPeriod.start,
          lte: previousPeriod.end,
        },
      },
    });

    const previousRevenue = await database.order.aggregate({
      where: {
        createdAt: {
          gte: previousPeriod.start,
          lte: previousPeriod.end,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const revenueGrowth = calculateGrowthRate(
      totalRevenue,
      Number(previousRevenue._sum.totalAmount || 0)
    );
    const ordersGrowth = calculateGrowthRate(totalOrders, previousOrders);

    // Top products analysis
    const productSales = new Map<
      string,
      { name: string; quantity: number; revenue: number; orders: Set<string> }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const key = item.productId;
        const existing = productSales.get(key) || {
          name: item.product.name,
          quantity: 0,
          revenue: 0,
          orders: new Set<string>(),
        };

        existing.quantity += item.quantity;
        existing.revenue += Number(item.price) * item.quantity;
        existing.orders.add(order.id);

        productSales.set(key, existing);
      }
    }

    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantitySold: data.quantity,
        revenue: data.revenue,
        orders: data.orders.size,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by category (mock - would need proper category data)
    const salesByCategory: Record<
      string,
      { revenue: number; orders: number; percentage: number }
    > = {
      Vegetables: {
        revenue: totalRevenue * 0.4,
        orders: totalOrders * 0.45,
        percentage: 40,
      },
      Fruits: {
        revenue: totalRevenue * 0.3,
        orders: totalOrders * 0.3,
        percentage: 30,
      },
      Dairy: {
        revenue: totalRevenue * 0.2,
        orders: totalOrders * 0.15,
        percentage: 20,
      },
      Other: {
        revenue: totalRevenue * 0.1,
        orders: totalOrders * 0.1,
        percentage: 10,
      },
    };

    // Sales by day
    const salesByDay = this.aggregateSalesByDay(orders, timeRange);

    // Customer metrics
    const uniqueCustomers = new Set(orders.map((o) => o.customerId)).size;
    const returningCustomers = await this.calculateReturningCustomers(
      Array.from(new Set(orders.map((o) => o.customerId))),
      timeRange
    );

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate,
      revenueGrowth,
      ordersGrowth,
      topProducts,
      salesByCategory,
      salesByDay,
      customerMetrics: {
        newCustomers: uniqueCustomers - returningCustomers,
        returningCustomers,
        retentionRate: calculatePercentage(returningCustomers, uniqueCustomers),
      },
    };
  }

  /**
   * Get seasonal sales analytics with biodynamic awareness
   */
  static async getSeasonalSalesAnalytics(
    season: Season,
    year: number,
    farmId?: string
  ): Promise<SeasonalSalesAnalytics> {
    const timeRange = this.getSeasonalTimeRange(season, year);
    const metrics = await this.getSalesMetrics(timeRange, farmId);

    // Get previous season for comparison
    const previousSeason = this.getPreviousSeason(season);
    const previousYear = season === "WINTER" ? year : year - 1;
    const previousTimeRange = this.getSeasonalTimeRange(
      previousSeason,
      previousYear
    );
    const previousMetrics = await this.getSalesMetrics(
      previousTimeRange,
      farmId
    );

    return {
      ...metrics,
      season,
      year,
      compareToPreviousSeason: {
        revenueChange: calculateGrowthRate(
          metrics.totalRevenue,
          previousMetrics.totalRevenue
        ),
        ordersChange: calculateGrowthRate(
          metrics.totalOrders,
          previousMetrics.totalOrders
        ),
        customerChange: calculateGrowthRate(
          metrics.customerMetrics.newCustomers +
            metrics.customerMetrics.returningCustomers,
          previousMetrics.customerMetrics.newCustomers +
            previousMetrics.customerMetrics.returningCustomers
        ),
      },
    };
  }

  // ============================================
  // FARM PERFORMANCE ANALYTICS
  // ============================================

  /**
   * Get comprehensive farm performance metrics
   */
  static async getFarmPerformanceMetrics(
    farmId: string,
    timeRange: TimeRange
  ): Promise<FarmPerformanceMetrics> {
    const farm = await database.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new Error(`Farm ${farmId} not found`);
    }

    // Get sales data
    const salesMetrics = await this.getSalesMetrics(timeRange, farmId);

    // Get product data
    const products = await database.product.findMany({
      where: { farmId },
    });

    const activeProducts = products.filter((p) => p.inStock).length;
    const soldOutProducts = products.filter((p) => !p.inStock).length;

    // Get inventory value
    const inventory = await database.inventory.findMany({
      where: { farmId },
    });

    const totalInventoryValue = inventory.reduce(
      (sum, item) => sum + item.quantity * item.pricePerUnit,
      0
    );

    // Calculate inventory turnover (simplified)
    const inventoryTurnoverRate =
      salesMetrics.totalRevenue / (totalInventoryValue || 1);
    const daysOfSupply = 30 / (inventoryTurnoverRate || 1);

    // Get order fulfillment data
    const orders = await database.order.findMany({
      where: {
        farmId,
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });

    const totalOrders = orders.length;
    const fulfilledOrders = orders.filter(
      (o) => o.status === "DELIVERED"
    ).length;
    const cancelledOrders = orders.filter(
      (o) => o.status === "CANCELLED"
    ).length;
    const fulfillmentRate = calculatePercentage(fulfilledOrders, totalOrders);

    // Get unique customers
    const uniqueCustomers = new Set(orders.map((o) => o.customerId)).size;
    const averageOrdersPerCustomer =
      uniqueCustomers > 0 ? totalOrders / uniqueCustomers : 0;

    // Calculate average time to fulfill (mock - would need fulfillment timestamps)
    const averageTimeToFulfill = 24; // hours

    return {
      farmId,
      farmName: farm.name,
      totalRevenue: salesMetrics.totalRevenue,
      revenueGrowth: salesMetrics.revenueGrowth,
      averageRevenuePerProduct:
        products.length > 0 ? salesMetrics.totalRevenue / products.length : 0,
      totalProducts: products.length,
      activeProducts,
      soldOutProducts,
      totalInventoryValue,
      inventoryTurnoverRate,
      daysOfSupply,
      totalOrders,
      fulfilledOrders,
      cancelledOrders,
      fulfillmentRate,
      uniqueCustomers,
      averageOrdersPerCustomer,
      customerSatisfactionScore: null, // Would need review data
      averageTimeToFulfill,
      orderAccuracyRate: 98.5, // Mock value
    };
  }

  /**
   * Compare multiple farms
   */
  static async getMultiFarmComparison(
    farmIds: string[],
    timeRange: TimeRange
  ): Promise<MultiFarmComparison> {
    const farms = await Promise.all(
      farmIds.map((farmId) => this.getFarmPerformanceMetrics(farmId, timeRange))
    );

    // Calculate rankings
    const rankings = {
      byRevenue: farms
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .map((f) => f.farmId),
      byOrders: farms
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .map((f) => f.farmId),
      byCustomerSatisfaction: farms
        .sort(
          (a, b) =>
            (b.customerSatisfactionScore || 0) -
            (a.customerSatisfactionScore || 0)
        )
        .map((f) => f.farmId),
      byFulfillmentRate: farms
        .sort((a, b) => b.fulfillmentRate - a.fulfillmentRate)
        .map((f) => f.farmId),
    };

    // Calculate averages
    const averages = {
      revenue: farms.reduce((sum, f) => sum + f.totalRevenue, 0) / farms.length,
      orders: farms.reduce((sum, f) => sum + f.totalOrders, 0) / farms.length,
      fulfillmentRate:
        farms.reduce((sum, f) => sum + f.fulfillmentRate, 0) / farms.length,
      customerSatisfaction:
        farms.reduce((sum, f) => sum + (f.customerSatisfactionScore || 0), 0) /
        farms.length,
    };

    return {
      period: timeRange,
      farms,
      rankings,
      averages,
    };
  }

  // ============================================
  // FINANCIAL REPORTS
  // ============================================

  /**
   * Generate financial report
   */
  static async getFinancialReport(
    timeRange: TimeRange
  ): Promise<FinancialReport> {
    // Get all successful orders
    const orders = await database.order.findMany({
      where: {
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
        status: { not: "CANCELLED" },
      },
      include: {
        payment: true,
      },
    });

    const grossRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );

    // Calculate costs (simplified - would need actual cost data)
    const productCosts = grossRevenue * 0.4; // 40% COGS
    const shippingCosts = orders.reduce(
      (sum, order) => sum + Number(order.shippingCost || 0),
      0
    );
    const platformFees = grossRevenue * 0.05; // 5% platform fee
    const marketingCosts = grossRevenue * 0.1; // 10% marketing

    const totalCosts =
      productCosts + shippingCosts + platformFees + marketingCosts;
    const netRevenue = grossRevenue - totalCosts;

    const grossProfit = grossRevenue - productCosts;
    const netProfit = netRevenue;
    const profitMargin = calculatePercentage(netProfit, grossRevenue);

    // Get previous period
    const previousPeriod = getPreviousPeriod(timeRange);
    const previousRevenue = await database.order.aggregate({
      where: {
        createdAt: {
          gte: previousPeriod.start,
          lte: previousPeriod.end,
        },
        status: { not: "CANCELLED" },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const revenueGrowth = calculateGrowthRate(
      grossRevenue,
      Number(previousRevenue._sum.totalAmount || 0)
    );

    // Transaction analysis
    const refundedOrders = orders.filter((o) => o.status === "REFUNDED").length;
    const disputedOrders = 0; // Mock value

    // Payment methods
    const paymentMethods: Record<
      string,
      { count: number; amount: number; percentage: number }
    > = {};

    for (const order of orders) {
      if (order.payment) {
        const method = order.payment.method || "UNKNOWN";
        if (!paymentMethods[method]) {
          paymentMethods[method] = { count: 0, amount: 0, percentage: 0 };
        }
        paymentMethods[method].count++;
        paymentMethods[method].amount += Number(order.totalAmount);
      }
    }

    // Calculate percentages
    for (const method in paymentMethods) {
      paymentMethods[method].percentage = calculatePercentage(
        paymentMethods[method].amount,
        grossRevenue
      );
    }

    return {
      period: timeRange,
      revenue: {
        gross: grossRevenue,
        net: netRevenue,
        growth: revenueGrowth,
      },
      costs: {
        productCosts,
        shippingCosts,
        platformFees,
        marketingCosts,
        total: totalCosts,
      },
      profit: {
        gross: grossProfit,
        net: netProfit,
        margin: profitMargin,
      },
      transactions: {
        successful: orders.length - refundedOrders,
        refunded: refundedOrders,
        disputed: disputedOrders,
        total: orders.length,
      },
      paymentMethods,
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private static aggregateSalesByDay(
    orders: Array<{ createdAt: Date; totalAmount: number }>,
    timeRange: TimeRange
  ): Array<{ date: string; revenue: number; orders: number }> {
    const dailySales = new Map<string, { revenue: number; orders: number }>();

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      const existing = dailySales.get(dateKey) || { revenue: 0, orders: 0 };

      existing.revenue += Number(order.totalAmount);
      existing.orders += 1;

      dailySales.set(dateKey, existing);
    }

    return Array.from(dailySales.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private static async calculateReturningCustomers(
    customerIds: string[],
    timeRange: TimeRange
  ): Promise<number> {
    let returning = 0;

    for (const customerId of customerIds) {
      const previousOrders = await database.order.count({
        where: {
          customerId,
          createdAt: {
            lt: timeRange.start,
          },
        },
      });

      if (previousOrders > 0) {
        returning++;
      }
    }

    return returning;
  }

  private static getSeasonalTimeRange(
    season: Season,
    year: number
  ): SeasonalTimeRange {
    let startMonth: number;
    let endMonth: number;

    switch (season) {
      case "SPRING":
        startMonth = 2; // March
        endMonth = 4; // May
        break;
      case "SUMMER":
        startMonth = 5; // June
        endMonth = 7; // August
        break;
      case "AUTUMN":
        startMonth = 8; // September
        endMonth = 10; // November
        break;
      case "WINTER":
        startMonth = 11; // December
        endMonth = 1; // February (next year)
        break;
    }

    const start = new Date(year, startMonth, 1, 0, 0, 0, 0);
    const end = new Date(
      season === "WINTER" ? year + 1 : year,
      endMonth + 1,
      0,
      23,
      59,
      59,
      999
    );

    return {
      start,
      end,
      period: "quarter",
      label: `${season} ${year}`,
      season,
      year,
    };
  }

  private static getPreviousSeason(season: Season): Season {
    const seasons: Season[] = ["SPRING", "SUMMER", "AUTUMN", "WINTER"];
    const currentIndex = seasons.indexOf(season);
    const previousIndex = (currentIndex - 1 + seasons.length) % seasons.length;
    return seasons[previousIndex];
  }
}
