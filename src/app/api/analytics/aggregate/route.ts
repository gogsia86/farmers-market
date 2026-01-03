/**
 * ╔════════════════════════════════════════════════════════════╗
 * ║ 📊 ANALYTICS AGGREGATION API - DIVINE INTELLIGENCE        ║
 * ╠════════════════════════════════════════════════════════════╣
 * ║ POST /api/analytics/aggregate - Aggregate analytics data  ║
 * ╚════════════════════════════════════════════════════════════╝
 */

import { createLogger } from "@/lib/logger";
import type { SearchAnalyticsQuery } from "@/lib/services/analytics.service";
import { analyticsService } from "@/lib/services/analytics.service";
import { PeriodType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("analytics-aggregate-api");

// ============================================
// VALIDATION SCHEMA
// ============================================

const AggregateSearchAnalyticsSchema = z.object({
  period: z.nativeEnum(PeriodType),
  periodKey: z
    .string()
    .min(1, "Period key is required")
    .max(50)
    .regex(
      /^(\d{4}(-W\d{2}|-\d{2}|-Q[1-4])?|\d{4})$/,
      "Invalid period key format (e.g., 2024-W23, 2024-06, 2024-Q2, 2024)",
    ),
});

// ============================================
// API HANDLERS
// ============================================

/**
 * 📊 POST - Aggregate search analytics for period
 *
 * Calculates comprehensive metrics including:
 * - Search volume and unique users
 * - Performance metrics (response time, cache hit rate)
 * - Interaction metrics (CTR, conversion, bounce rate)
 * - Agricultural consciousness metrics
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request
    const validation = AggregateSearchAnalyticsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid aggregation request",
            details: validation.error.issues,
          },
        },
        { status: 400 },
      );
    }

    const queryData = validation.data as SearchAnalyticsQuery;

    logger.info("Starting analytics aggregation", {
      period: queryData.period,
      periodKey: queryData.periodKey,
    });

    // Perform aggregation
    const analytics =
      await analyticsService.aggregateSearchAnalytics(queryData);

    logger.info("Analytics aggregation completed", {
      analyticsId: analytics.id,
      period: analytics.periodType,
      totalSearches: analytics.totalSearches,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: analytics.id,
          periodType: analytics.periodType,
          periodStart: analytics.periodStart,
          periodEnd: analytics.periodEnd,
          metrics: {
            volume: {
              totalSearches: analytics.totalSearches,
              uniqueUsers: analytics.uniqueUsers,
              uniqueQueries: analytics.uniqueQueries,
              avgResultsCount: Number(analytics.avgResultsCount),
            },
            engagement: {
              avgClickThrough: Number(analytics.avgClickThrough),
              conversionRate: Number(analytics.conversionRate),
            },
            performance: {
              avgResponseTime: analytics.avgResponseTime,
              p95ResponseTime: analytics.p95ResponseTime,
            },
          },
          topQueries: analytics.topQueries,
          topFilters: analytics.topFilters,
          topCategories: analytics.topCategories,
          seasonalTrends: analytics.seasonalTrends,
          farmPopularity: analytics.farmPopularity,
          createdAt: analytics.createdAt,
        },
        meta: {
          timestamp: new Date().toISOString(),
          aggregationType: "search_analytics",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Analytics aggregation failed", error as Error, {
      endpoint: "POST /api/analytics/aggregate",
    });

    // Check for specific error types
    if (error instanceof Error && error.message.includes("No events found")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_DATA_AVAILABLE",
            message: "No search events found for the specified period",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "AGGREGATION_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to aggregate analytics",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

/**
 * 📊 GET - Retrieve existing aggregated analytics
 * Query params: period, periodStart
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const periodParam = searchParams.get("period");
    const periodStartParam = searchParams.get("periodStart");

    // Validate required parameters
    if (!periodParam || !periodStartParam) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAMETERS",
            message: "Period and periodStart are required",
          },
        },
        { status: 400 },
      );
    }

    // Validate enums
    if (!Object.values(PeriodType).includes(periodParam as PeriodType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PERIOD",
            message: "Invalid period type",
          },
        },
        { status: 400 },
      );
    }

    // Parse date
    const periodStart = new Date(periodStartParam);
    if (isNaN(periodStart.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_DATE",
            message: "Invalid periodStart date format",
          },
        },
        { status: 400 },
      );
    }

    logger.debug("Fetching aggregated analytics", {
      period: periodParam,
      periodStart: periodStartParam,
    });

    // Fetch from database
    const { database } = await import("@/lib/database");

    const analytics = await database.searchAnalytics.findFirst({
      where: {
        periodType: periodParam as PeriodType,
        periodStart,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!analytics) {
      logger.debug("No analytics found for specified parameters", {
        period: periodParam,
        periodStart: periodStartParam,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "No analytics found for the specified parameters",
          },
        },
        { status: 404 },
      );
    }

    logger.info("Retrieved aggregated analytics", {
      analyticsId: analytics.id,
      period: analytics.periodType,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: analytics.id,
          periodType: analytics.periodType,
          periodStart: analytics.periodStart,
          periodEnd: analytics.periodEnd,
          metrics: {
            volume: {
              totalSearches: analytics.totalSearches,
              uniqueUsers: analytics.uniqueUsers,
              uniqueQueries: analytics.uniqueQueries,
              avgResultsCount: Number(analytics.avgResultsCount),
            },
            engagement: {
              avgClickThrough: Number(analytics.avgClickThrough),
              conversionRate: Number(analytics.conversionRate),
            },
            performance: {
              avgResponseTime: analytics.avgResponseTime,
              p95ResponseTime: analytics.p95ResponseTime,
            },
          },
          topQueries: analytics.topQueries,
          topFilters: analytics.topFilters,
          topCategories: analytics.topCategories,
          seasonalTrends: analytics.seasonalTrends,
          farmPopularity: analytics.farmPopularity,
          createdAt: analytics.createdAt,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to retrieve analytics", error as Error, {
      endpoint: "GET /api/analytics/aggregate",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RETRIEVAL_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to retrieve analytics",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

/**
 * ⚙️ OPTIONS - CORS preflight
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  );
}
