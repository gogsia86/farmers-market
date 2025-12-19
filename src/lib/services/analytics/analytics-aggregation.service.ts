/**
 * Analytics Aggregation Service
 *
 * Computes and stores aggregated analytics metrics for different time periods.
 * Runs periodic aggregation jobs to generate analytics data for dashboards.
 *
 * @module AnalyticsAggregationService
 * @category Analytics
 */

import { database } from "@/lib/database";
import { PeriodType, Season } from "@prisma/client";
import { SearchEventService } from "./search-event.service";
import { UserInteractionService } from "./user-interaction.service";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AggregationInput {
  periodType: PeriodType;
  periodStart: Date;
  periodEnd: Date;
}

export interface AggregationResult {
  id: string;
  periodType: PeriodType;
  periodStart: Date;
  periodEnd: Date;
  metrics: {
    totalSearches: number;
    uniqueUsers: number;
    uniqueQueries: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    avgResultsCount: number;
    avgClickThrough: number;
    conversionRate: number;
  };
  topQueries: Array<{ query: string; count: number }>;
  topFilters: Array<{ filter: string; count: number }>;
  topCategories: Array<{ category: string; count: number }>;
  seasonalTrends: Record<Season, number>;
  farmPopularity: Array<{ farmId: string; interactions: number }>;
}

export interface DashboardMetrics {
  overview: {
    totalSearches: number;
    totalInteractions: number;
    totalRevenue: number;
    activeUsers: number;
    growthRate: number;
  };
  searchMetrics: {
    avgResponseTime: number;
    p95ResponseTime: number;
    avgResultsCount: number;
    topQueries: Array<{ query: string; count: number }>;
    trendingSearches: Array<{ query: string; growth: number }>;
  };
  conversionMetrics: {
    viewToClick: number;
    clickToCart: number;
    cartToPurchase: number;
    overallConversion: number;
  };
  popularProducts: Array<{
    productId: string;
    views: number;
    purchases: number;
    revenue: number;
    conversionRate: number;
  }>;
  timeSeriesData: Array<{
    date: Date;
    searches: number;
    interactions: number;
    revenue: number;
  }>;
}

// ============================================================================
// Analytics Aggregation Service
// ============================================================================

export class AnalyticsAggregationService {
  /**
   * Aggregate analytics for a specific period
   */
  static async aggregatePeriod(
    input: AggregationInput,
  ): Promise<AggregationResult> {
    const { periodType, periodStart, periodEnd } = input;

    // Get search events for the period
    const searchEvents = await database.searchEvent.findMany({
      where: {
        timestamp: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      select: {
        id: true,
        userId: true,
        query: true,
        filters: true,
        resultsCount: true,
        resultsShown: true,
        clickedResults: true,
        responseTime: true,
        currentSeason: true,
      },
    });

    // Get user interactions for the period
    const interactions = await database.userInteraction.findMany({
      where: {
        timestamp: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      select: {
        userId: true,
        type: true,
        entityType: true,
        entityId: true,
        metadata: true,
      },
    });

    // Calculate metrics
    const totalSearches = searchEvents.length;
    const uniqueUsers = new Set(
      searchEvents.filter((e) => e.userId).map((e) => e.userId),
    ).size;

    const uniqueQueries = new Set(
      searchEvents.filter((e) => e.query).map((e) => e.query),
    ).size;

    // Response time metrics
    const responseTimes = searchEvents
      .map((e) => e.responseTime)
      .filter((t): t is number => t !== null)
      .sort((a, b) => a - b);
    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length,
          )
        : 0;
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p95ResponseTime = responseTimes[p95Index] || 0;

    // Average results count
    const avgResultsCount =
      totalSearches > 0
        ? searchEvents.reduce((sum, e) => sum + e.resultsCount, 0) /
          totalSearches
        : 0;

    // Click-through rate
    const searchesWithClicks = searchEvents.filter(
      (e) => e.clickedResults.length > 0,
    ).length;
    const avgClickThrough =
      totalSearches > 0 ? searchesWithClicks / totalSearches : 0;

    // Conversion rate
    const purchases = interactions.filter((i) => i.type === "PURCHASE").length;
    const conversionRate = totalSearches > 0 ? purchases / totalSearches : 0;

    // Top queries
    const queryCount = new Map<string, number>();
    searchEvents.forEach((e) => {
      if (e.query) {
        queryCount.set(e.query, (queryCount.get(e.query) || 0) + 1);
      }
    });
    const topQueries = Array.from(queryCount.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top filters
    const filterCount = new Map<string, number>();
    searchEvents.forEach((e) => {
      const filters = e.filters as Record<string, any>;
      Object.keys(filters).forEach((key) => {
        const filterKey = `${key}:${JSON.stringify(filters[key])}`;
        filterCount.set(filterKey, (filterCount.get(filterKey) || 0) + 1);
      });
    });
    const topFilters = Array.from(filterCount.entries())
      .map(([filter, count]) => ({ filter, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top categories
    const categoryCount = new Map<string, number>();
    searchEvents.forEach((e) => {
      const filters = e.filters as Record<string, any>;
      if (filters.category) {
        categoryCount.set(
          filters.category,
          (categoryCount.get(filters.category) || 0) + 1,
        );
      }
    });
    const topCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Seasonal trends
    const seasonalTrends: Record<Season, number> = {
      [Season.SPRING]: 0,
      [Season.SUMMER]: 0,
      [Season.FALL]: 0,
      [Season.WINTER]: 0,
    };
    searchEvents.forEach((e) => {
      if (e.currentSeason) {
        seasonalTrends[e.currentSeason]++;
      }
    });

    // Farm popularity
    const farmInteractions = new Map<string, number>();
    interactions
      .filter((i) => i.entityType === "farm" || (i.metadata as any)?.farmId)
      .forEach((i) => {
        const farmId =
          i.entityType === "farm" ? i.entityId : (i.metadata as any)?.farmId;
        if (farmId) {
          farmInteractions.set(farmId, (farmInteractions.get(farmId) || 0) + 1);
        }
      });
    const farmPopularity = Array.from(farmInteractions.entries())
      .map(([farmId, interactions]) => ({ farmId, interactions }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 10);

    // Store aggregated data
    const aggregation = await database.searchAnalytics.create({
      data: {
        periodType,
        periodStart,
        periodEnd,
        totalSearches,
        uniqueUsers,
        uniqueQueries,
        avgResponseTime,
        p95ResponseTime,
        avgResultsCount,
        avgClickThrough,
        conversionRate,
        topQueries,
        topFilters,
        topCategories,
        seasonalTrends,
        farmPopularity,
        // Additional required fields
        period: periodType,
        averageResultsCount: avgResultsCount,
        refinementRate: 0,
        saveRate: 0,
        bounceRate: 0,
        averageResponseTime: avgResponseTime,
        cacheHitRate: 0,
        p99ResponseTime: p95ResponseTime,
        clickThroughRate: avgClickThrough,
      },
    });

    return {
      id: aggregation.id,
      periodType,
      periodStart,
      periodEnd,
      metrics: {
        totalSearches,
        uniqueUsers,
        uniqueQueries,
        avgResponseTime,
        p95ResponseTime,
        avgResultsCount: Math.round(avgResultsCount * 100) / 100,
        avgClickThrough: Math.round(avgClickThrough * 10000) / 100,
        conversionRate: Math.round(conversionRate * 10000) / 100,
      },
      topQueries,
      topFilters,
      topCategories,
      seasonalTrends,
      farmPopularity,
    };
  }

  /**
   * Aggregate hourly analytics
   */
  static async aggregateHourly(
    date: Date = new Date(),
  ): Promise<AggregationResult> {
    const periodStart = new Date(date);
    periodStart.setMinutes(0, 0, 0);

    const periodEnd = new Date(periodStart);
    periodEnd.setHours(periodEnd.getHours() + 1);

    return this.aggregatePeriod({
      periodType: PeriodType.HOUR,
      periodStart,
      periodEnd,
    });
  }

  /**
   * Aggregate daily analytics
   */
  static async aggregateDaily(
    date: Date = new Date(),
  ): Promise<AggregationResult> {
    const periodStart = new Date(date);
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 1);

    return this.aggregatePeriod({
      periodType: PeriodType.DAY,
      periodStart,
      periodEnd,
    });
  }

  /**
   * Aggregate weekly analytics
   */
  static async aggregateWeekly(
    date: Date = new Date(),
  ): Promise<AggregationResult> {
    const periodStart = new Date(date);
    periodStart.setHours(0, 0, 0, 0);
    periodStart.setDate(periodStart.getDate() - periodStart.getDay());

    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 7);

    return this.aggregatePeriod({
      periodType: PeriodType.WEEK,
      periodStart,
      periodEnd,
    });
  }

  /**
   * Aggregate monthly analytics
   */
  static async aggregateMonthly(
    date: Date = new Date(),
  ): Promise<AggregationResult> {
    const periodStart = new Date(date.getFullYear(), date.getMonth(), 1);

    const periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    return this.aggregatePeriod({
      periodType: PeriodType.MONTH,
      periodStart,
      periodEnd,
    });
  }

  /**
   * Get aggregated analytics for a period
   */
  static async getAggregation(
    periodType: PeriodType,
    periodStart: Date,
    periodEnd: Date,
  ) {
    const aggregation = await database.searchAnalytics.findFirst({
      where: {
        periodType,
        periodStart: {
          gte: periodStart,
          lt: periodEnd,
        },
      },
      orderBy: {
        periodStart: "desc",
      },
    });

    return aggregation;
  }

  /**
   * Get time series data
   */
  static async getTimeSeries(
    startDate: Date,
    endDate: Date,
    periodType: PeriodType = PeriodType.DAY,
  ) {
    const aggregations = await database.searchAnalytics.findMany({
      where: {
        periodType,
        periodStart: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        periodStart: "asc",
      },
    });

    return aggregations.map((a) => ({
      date: a.periodStart,
      totalSearches: a.totalSearches,
      uniqueUsers: a.uniqueUsers,
      avgResponseTime: a.avgResponseTime,
      conversionRate: parseFloat(a.conversionRate.toString()),
    }));
  }

  /**
   * Get dashboard metrics
   */
  static async getDashboardMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<DashboardMetrics> {
    // Get search stats
    const searchStats = await SearchEventService.getStats({
      startDate,
      endDate,
    });

    // Get interaction stats
    const interactionStats = await UserInteractionService.getStats({
      startDate,
      endDate,
    });

    // Get trending searches
    const trendingSearches = await SearchEventService.getTrendingSearches(5, 7);

    // Get popular products
    const popularProducts = await UserInteractionService.getPopularProducts(
      startDate,
      endDate,
      10,
    );

    // Get conversion metrics
    const conversionMetrics = await SearchEventService.getConversionRate(
      startDate,
      endDate,
    );

    // Calculate revenue (sum of purchase interactions)
    const purchases = await database.userInteraction.findMany({
      where: {
        type: "PURCHASE",
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        value: true,
      },
    });

    const totalRevenue = purchases.reduce((sum, p) => {
      return sum + (p.value ? parseFloat(p.value.toString()) : 0);
    }, 0);

    // Calculate growth rate (vs previous period)
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousPeriodStart = new Date(startDate.getTime() - periodLength);
    const previousPeriodEnd = startDate;

    const previousSearches = await database.searchEvent.count({
      where: {
        timestamp: {
          gte: previousPeriodStart,
          lt: previousPeriodEnd,
        },
      },
    });

    const growthRate =
      previousSearches > 0
        ? ((searchStats.totalSearches - previousSearches) / previousSearches) *
          100
        : 100;

    // Get time series data
    const timeSeries = await this.getTimeSeries(
      startDate,
      endDate,
      PeriodType.DAY,
    );
    const timeSeriesData = timeSeries.map((t) => ({
      date: t.date,
      searches: t.totalSearches,
      interactions: interactionStats.totalInteractions / timeSeries.length, // Average per period
      revenue: totalRevenue / timeSeries.length, // Average per period
    }));

    return {
      overview: {
        totalSearches: searchStats.totalSearches,
        totalInteractions: interactionStats.totalInteractions,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        activeUsers: searchStats.uniqueUsers,
        growthRate: Math.round(growthRate * 10) / 10,
      },
      searchMetrics: {
        avgResponseTime: searchStats.avgResponseTime,
        p95ResponseTime: searchStats.p95ResponseTime,
        avgResultsCount: searchStats.avgResultsCount,
        topQueries: searchStats.topQueries,
        trendingSearches: trendingSearches.map((t) => ({
          query: t.query,
          growth: t.growth,
        })),
      },
      conversionMetrics: {
        viewToClick: interactionStats.conversionFunnel.viewToClick,
        clickToCart: interactionStats.conversionFunnel.clickToCart,
        cartToPurchase: interactionStats.conversionFunnel.cartToPurchase,
        overallConversion: interactionStats.conversionFunnel.viewToPurchase,
      },
      popularProducts: popularProducts.map((p) => ({
        productId: p.productId,
        views: p.views,
        purchases: p.purchases,
        revenue: 0, // Would need to calculate from actual purchase values
        conversionRate: p.conversionRate,
      })),
      timeSeriesData,
    };
  }

  /**
   * Run all aggregations for a date
   */
  static async runDailyAggregations(date: Date = new Date()) {
    const results = {
      hourly: [] as AggregationResult[],
      daily: null as AggregationResult | null,
    };

    // Aggregate each hour of the day
    for (let hour = 0; hour < 24; hour++) {
      const hourDate = new Date(date);
      hourDate.setHours(hour, 0, 0, 0);

      try {
        const hourlyResult = await this.aggregateHourly(hourDate);
        results.hourly.push(hourlyResult);
      } catch (error) {
        console.error(`Failed to aggregate hour ${hour}:`, error);
      }
    }

    // Aggregate the full day
    try {
      results.daily = await this.aggregateDaily(date);
    } catch (error) {
      console.error("Failed to aggregate daily:", error);
    }

    return results;
  }

  /**
   * Clean up old aggregations (data retention)
   */
  static async cleanupOldAggregations(daysToKeep = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Keep hourly for 7 days, daily for 90 days, weekly/monthly/quarterly/yearly forever
    const hourlyResult = await database.searchAnalytics.deleteMany({
      where: {
        periodType: PeriodType.HOUR,
        periodStart: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const dailyResult = await database.searchAnalytics.deleteMany({
      where: {
        periodType: PeriodType.DAY,
        periodStart: {
          lt: cutoffDate,
        },
      },
    });

    return hourlyResult.count + dailyResult.count;
  }

  /**
   * Get real-time analytics (last hour)
   */
  static async getRealTimeMetrics() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [searches, interactions] = await Promise.all([
      database.searchEvent.count({
        where: {
          timestamp: { gte: oneHourAgo },
        },
      }),
      database.userInteraction.count({
        where: {
          timestamp: { gte: oneHourAgo },
        },
      }),
    ]);

    const activeUsers = await database.searchEvent.findMany({
      where: {
        timestamp: { gte: oneHourAgo },
        userId: { not: null },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    return {
      searches,
      interactions,
      activeUsers: activeUsers.length,
      timestamp: now,
    };
  }

  /**
   * Compare two periods
   */
  static async comparePeriods(
    period1Start: Date,
    period1End: Date,
    period2Start: Date,
    period2End: Date,
  ) {
    const [metrics1, metrics2] = await Promise.all([
      this.getDashboardMetrics(period1Start, period1End),
      this.getDashboardMetrics(period2Start, period2End),
    ]);

    return {
      period1: metrics1,
      period2: metrics2,
      comparison: {
        searchGrowth:
          metrics2.overview.totalSearches > 0
            ? ((metrics1.overview.totalSearches -
                metrics2.overview.totalSearches) /
                metrics2.overview.totalSearches) *
              100
            : 0,
        revenueGrowth:
          metrics2.overview.totalRevenue > 0
            ? ((metrics1.overview.totalRevenue -
                metrics2.overview.totalRevenue) /
                metrics2.overview.totalRevenue) *
              100
            : 0,
        userGrowth:
          metrics2.overview.activeUsers > 0
            ? ((metrics1.overview.activeUsers - metrics2.overview.activeUsers) /
                metrics2.overview.activeUsers) *
              100
            : 0,
        conversionChange:
          metrics1.conversionMetrics.overallConversion -
          metrics2.conversionMetrics.overallConversion,
      },
    };
  }
}
