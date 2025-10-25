/**
 * ANALYTICS API ROUTES - Sales & Performance
 * Divine business intelligence endpoints
 *
 * @divine-pattern RESTful analytics API
 * @reference .github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

import { AnalyticsService } from "@/lib/services/analytics.service";
import {
  TimePeriod,
  TimeRange,
  getTimeRangeForPeriod,
} from "@/types/analytics.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/analytics/sales - Get sales metrics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse time range
    const period = (searchParams.get("period") as TimePeriod) || "month";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const farmId = searchParams.get("farmId") || undefined;

    let timeRange: TimeRange;

    if (startDate && endDate) {
      // Custom range
      timeRange = {
        start: new Date(startDate),
        end: new Date(endDate),
        period: "custom",
        label: "Custom Range",
      };
    } else {
      // Predefined period
      timeRange = getTimeRangeForPeriod(period);
    }

    const metrics = await AnalyticsService.getSalesMetrics(timeRange, farmId);

    return NextResponse.json({
      success: true,
      data: metrics,
      timeRange: {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString(),
        period: timeRange.period,
      },
    });
  } catch (error) {
    console.error("Sales analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch sales metrics",
      },
      { status: 500 }
    );
  }
}
