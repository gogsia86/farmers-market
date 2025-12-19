/**
 * ╔════════════════════════════════════════════════════════════╗
 * ║ 📊 ANALYTICS AGGREGATION API - DIVINE INTELLIGENCE        ║
 * ╠════════════════════════════════════════════════════════════╣
 * ║ POST /api/analytics/aggregate - Aggregate analytics data  ║
 * ╚════════════════════════════════════════════════════════════╝
 */

import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analytics.service";
import type { SearchAnalyticsQuery } from "@/lib/services/analytics.service";
import { z } from "zod";
import { Season, PeriodType } from "@prisma/client";

// ============================================
// VALIDATION SCHEMA
// ============================================

const AggregateSearchAnalyticsSchema = z.object({
  query: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  farmId: z.string().optional(),
  season: z.nativeEnum(Season).optional(),
  period: z.nativeEnum(PeriodType, {
    errorMap: () => ({ message: "Invalid period type" }),
  }),
  periodKey: z
    .string()
    .min(1, "Period key is required")
    .max(50)
    .regex(
      /^(\d{4}(-W\d{2}|-\d{2}|-Q[1-4])?|\d{4})$/,
      "Invalid period key format (e.g., 2024-W23, 2024-06, 2024-Q2, 2024)"
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
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const queryData = validation.data as SearchAnalyticsQuery;

    // Perform aggregation
    const analytics = await analyticsService.aggregateSearchAnalytics(
      queryData
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          id: analytics.id,
          query: analytics.query,
          categoryId: analytics.categoryId,
          farmId: analytics.farmId,
          season: analytics.season,
          period: analytics.period,
          periodKey: analytics.periodKey,
          metrics: {
            volume: {
              totalSearches: analytics.totalSearches,
              uniqueUsers: analytics.uniqueUsers,
              uniqueSessions: analytics.uniqueSessions,
              averageResultsCount: Number(analytics.averageResultsCount),
              noResultsCount: analytics.noResultsCount,
              noResultsRate:
                analytics.totalSearches > 0
                  ? analytics.noResultsCount / analytics.totalSearches
                  : 0,
            },
            engagement: {
              refinementRate: Number(analytics.refinementRate),
              saveRate: Number(analytics.saveRate),
              clickThroughRate: Number(analytics.clickThroughRate),
              conversionRate: Number(analytics.conversionRate),
              bounceRate: Number(analytics.bounceRate),
            },
            performance: {
              averageResponseTime: Number(analytics.averageResponseTime),
              cacheHitRate: Number(analytics.cacheHitRate),
              p95ResponseTime: Number(analytics.p95ResponseTime),
              p99ResponseTime: Number(analytics.p99ResponseTime),
            },
            agricultural: {
              seasonalRelevanceAvg: analytics.seasonalRelevanceAvg
                ? Number(analytics.seasonalRelevanceAvg)
                : null,
              biodynamicEngagement: analytics.biodynamicEngagement
                ? Number(analytics.biodynamicEngagement)
                : null,
            },
          },
          topResults: {
            clicked: analytics.topClickedResults,
            converted: analytics.topConvertedItems,
          },
          calculatedAt: analytics.calculatedAt,
          updatedAt: analytics.updatedAt,
        },
        meta: {
          timestamp: new Date().toISOString(),
          aggregationType: "search_analytics",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analytics aggregation failed:", error);

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
        { status: 404 }
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
      { status: 500 }
    );
  }
}

/**
 * 📊 GET - Retrieve existing aggregated analytics
 * Query params: query, categoryId, farmId, season, period, periodKey
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const query = searchParams.get("query") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const farmId = searchParams.get("farmId") || undefined;
    const seasonParam = searchParams.get("season");
    const periodParam = searchParams.get("period");
    const periodKey = searchParams.get("periodKey");

    // Validate required parameters
    if (!periodParam || !periodKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAMETERS",
            message: "Period and periodKey are required",
          },
        },
        { status: 400 }
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
        { status: 400 }
      );
    }

    const season = seasonParam
      ? Object.values(Season).includes(seasonParam as Season)
        ? (seasonParam as Season)
        : undefined
      : undefined;

    // Fetch from database
    const { database } = await import("@/lib/database");

    const whereClause: any = {
      period: periodParam as PeriodType,
      periodKey,
    };

    if (query !== undefined) whereClause.query = query;
    if (categoryId) whereClause.categoryId = categoryId;
    if (farmId) whereClause.farmId = farmId;
    if (season) whereClause.season = season;

    const analytics = await database.searchAnalytics.findFirst({
      where: whereClause,
      orderBy: { calculatedAt: "desc" },
    });

    if (!analytics) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "No analytics found for the specified parameters",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: analytics.id,
          query: analytics.query,
          categoryId: analytics.categoryId,
          farmId: analytics.farmId,
          season: analytics.season,
          period: analytics.period,
          periodKey: analytics.periodKey,
          metrics: {
            volume: {
              totalSearches: analytics.totalSearches,
              uniqueUsers: analytics.uniqueUsers,
              uniqueSessions: analytics.uniqueSessions,
              averageResultsCount: Number(analytics.averageResultsCount),
              noResultsCount: analytics.noResultsCount,
            },
            engagement: {
              refinementRate: Number(analytics.refinementRate),
              saveRate: Number(analytics.saveRate),
              clickThroughRate: Number(analytics.clickThroughRate),
              conversionRate: Number(analytics.conversionRate),
              bounceRate: Number(analytics.bounceRate),
            },
            performance: {
              averageResponseTime: Number(analytics.averageResponseTime),
              cacheHitRate: Number(analytics.cacheHitRate),
              p95ResponseTime: Number(analytics.p95ResponseTime),
              p99ResponseTime: Number(analytics.p99ResponseTime),
            },
            agricultural: {
              seasonalRelevanceAvg: analytics.seasonalRelevanceAvg
                ? Number(analytics.seasonalRelevanceAvg)
                : null,
              biodynamicEngagement: analytics.biodynamicEngagement
                ? Number(analytics.biodynamicEngagement)
                : null,
            },
          },
          topResults: {
            clicked: analytics.topClickedResults,
            converted: analytics.topConvertedItems,
          },
          calculatedAt: analytics.calculatedAt,
          updatedAt: analytics.updatedAt,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to retrieve analytics:", error);

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
      { status: 500 }
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
    }
  );
}
