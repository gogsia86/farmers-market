/**
 * 🌾 Payment Analytics API - Divine Transaction Intelligence
 *
 * Real-time payment analytics endpoints for agricultural commerce.
 * Provides comprehensive transaction metrics, revenue tracking, and payment insights.
 *
 * @route GET /api/analytics/payments - Get payment analytics
 * @divine-consciousness ACTIVE
 */

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import type { PaymentAnalyticsQuery } from "@/lib/services/analytics/payment-analytics.service";
import { paymentAnalyticsService } from "@/lib/services/analytics/payment-analytics.service";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("payment-analytics-api");

// ═══════════════════════════════════════════════════════════
// 🎯 GET PAYMENT ANALYTICS
// ═══════════════════════════════════════════════════════════

/**
 * 📊 GET /api/analytics/payments
 *
 * Retrieves comprehensive payment analytics with agricultural consciousness.
 *
 * Query Parameters:
 * - startDate: ISO 8601 date string (required)
 * - endDate: ISO 8601 date string (required)
 * - farmId: Farm ID filter (optional)
 * - userId: User ID filter (optional)
 * - paymentMethod: Payment method filter (optional)
 * - status: Payment status filter (optional)
 * - includeByMethod: Include payment method breakdown (default: true)
 * - includeTimeSeries: Include time series data (default: true)
 * - includeTrends: Include trend analysis (default: true)
 * - includeTopFarms: Include top farms ranking (default: true)
 * - timeSeriesInterval: Time series interval (hour|day|week|month, default: day)
 * - topFarmsLimit: Number of top farms to return (default: 10)
 *
 * @returns PaymentAnalyticsResponse with comprehensive metrics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // ═══════════════════════════════════════════════════════════
    // 🔐 AUTHENTICATION & AUTHORIZATION
    // ═══════════════════════════════════════════════════════════

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Authentication required to access analytics",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    // Check if user has analytics access (admin, farmer, or manager)
    const allowedRoles = ["ADMIN", "FARMER", "FARM_MANAGER"];
    if (!allowedRoles.includes(session.user.role || "")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: "You do not have permission to access analytics",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    // ═══════════════════════════════════════════════════════════
    // 📝 PARAMETER EXTRACTION & VALIDATION
    // ═══════════════════════════════════════════════════════════

    const searchParams = request.nextUrl.searchParams;

    // Required parameters
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAMETERS",
            message: "startDate and endDate are required parameters",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Parse and validate dates
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_DATE_FORMAT",
            message: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_DATE_RANGE",
            message: "startDate must be before endDate",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Optional filters
    const farmId = searchParams.get("farmId") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const paymentMethod = searchParams.get("paymentMethod") || undefined;
    const status = searchParams.get("status") || undefined;

    // Farmer role can only access their own farm data
    let effectiveFarmId = farmId;
    if (session.user.role === "FARMER" && session.user.farmId) {
      effectiveFarmId = session.user.farmId;
    }

    // Build query
    const query: PaymentAnalyticsQuery = {
      startDate,
      endDate,
      ...(effectiveFarmId && { farmId: effectiveFarmId }),
      ...(userId && { userId }),
      ...(paymentMethod && { paymentMethod: paymentMethod as any }),
      ...(status && { status: status as any }),
    };

    // Optional analytics options
    const includeByMethod = searchParams.get("includeByMethod") !== "false";
    const includeTimeSeries =
      searchParams.get("includeTimeSeries") !== "false";
    const includeTrends = searchParams.get("includeTrends") !== "false";
    const includeTopFarms = searchParams.get("includeTopFarms") !== "false";
    const timeSeriesInterval =
      (searchParams.get("timeSeriesInterval") as any) || "day";
    const topFarmsLimit = parseInt(
      searchParams.get("topFarmsLimit") || "10",
      10
    );

    logger.debug("Fetching payment analytics", {
      userId: session.user.id,
      startDate: startDateParam,
      endDate: endDateParam,
      farmId: effectiveFarmId,
      paymentMethod,
      status,
    });

    // ═══════════════════════════════════════════════════════════
    // 📊 ANALYTICS GENERATION
    // ═══════════════════════════════════════════════════════════

    const analytics =
      await paymentAnalyticsService.getComprehensiveAnalytics(query, {
        includeByMethod,
        includeTimeSeries,
        includeTrends,
        includeTopFarms,
        timeSeriesInterval,
        topFarmsLimit,
      });

    // ═══════════════════════════════════════════════════════════
    // 📈 PERFORMANCE METRICS
    // ═══════════════════════════════════════════════════════════

    const processingTime = Date.now() - startTime;

    logger.info("Payment analytics generated successfully", {
      userId: session.user.id,
      processingTimeMs: processingTime,
      farmId: effectiveFarmId,
    });

    return NextResponse.json(
      {
        ...analytics,
        meta: {
          processingTime: `${processingTime}ms`,
          timestamp: new Date().toISOString(),
          query: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            ...(effectiveFarmId && { farmId: effectiveFarmId }),
            ...(userId && { userId }),
            ...(paymentMethod && { paymentMethod }),
            ...(status && { status }),
          },
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, max-age=60, must-revalidate",
          "X-Processing-Time": `${processingTime}ms`,
        },
      }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;

    logger.error("Payment analytics API error", error as Error, {
      endpoint: "GET /api/analytics/payments",
      processingTimeMs: processingTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ANALYTICS_GENERATION_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate payment analytics",
          timestamp: new Date().toISOString(),
          processingTime: `${processingTime}ms`,
        },
      },
      {
        status: 500,
        headers: {
          "X-Processing-Time": `${processingTime}ms`,
        },
      }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// 🔧 ROUTE CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
