/**
 * 🌾 Order Analytics API - Divine Order Intelligence
 *
 * Real-time order analytics endpoints for agricultural commerce.
 * Provides comprehensive order metrics, customer insights, and product performance.
 *
 * @route GET /api/analytics/orders - Get order analytics
 * @divine-consciousness ACTIVE
 */

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import type { OrderAnalyticsQuery } from "@/lib/services/analytics/order-analytics.service";
import { orderAnalyticsService } from "@/lib/services/analytics/order-analytics.service";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("order-analytics-api");

// ═══════════════════════════════════════════════════════════
// 🎯 GET ORDER ANALYTICS
// ═══════════════════════════════════════════════════════════

/**
 * 📊 GET /api/analytics/orders
 *
 * Retrieves comprehensive order analytics with agricultural consciousness.
 *
 * Query Parameters:
 * - startDate: ISO 8601 date string (required)
 * - endDate: ISO 8601 date string (required)
 * - farmId: Farm ID filter (optional)
 * - customerId: Customer ID filter (optional)
 * - status: Order status filter (optional)
 * - productId: Product ID filter (optional)
 * - includeTopCustomers: Include top customers (default: true)
 * - includeTopProducts: Include top products (default: true)
 * - includeTrends: Include trend analysis (default: true)
 * - includeFulfillment: Include fulfillment metrics (default: true)
 * - includeTimeSeries: Include time series data (default: true)
 * - topCustomersLimit: Number of top customers (default: 10)
 * - topProductsLimit: Number of top products (default: 10)
 * - timeSeriesInterval: Time series interval (hour|day|week|month, default: day)
 *
 * @returns OrderAnalyticsResponse with comprehensive metrics
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
        { status: 401 },
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
        { status: 403 },
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
        { status: 400 },
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
        { status: 400 },
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
        { status: 400 },
      );
    }

    // Optional filters
    const farmId = searchParams.get("farmId") || undefined;
    const customerId = searchParams.get("customerId") || undefined;
    const status = searchParams.get("status") || undefined;
    const productId = searchParams.get("productId") || undefined;

    // Farmer role can only access their own farm data
    let effectiveFarmId = farmId;
    if (session.user.role === "FARMER" && session.user.farmId) {
      effectiveFarmId = session.user.farmId;
    }

    // Build query
    const query: OrderAnalyticsQuery = {
      startDate,
      endDate,
      ...(effectiveFarmId && { farmId: effectiveFarmId }),
      ...(customerId && { customerId }),
      ...(status && { status: status as any }),
      ...(productId && { productId }),
    };

    // Optional analytics options
    const includeTopCustomers =
      searchParams.get("includeTopCustomers") !== "false";
    const includeTopProducts =
      searchParams.get("includeTopProducts") !== "false";
    const includeTrends = searchParams.get("includeTrends") !== "false";
    const includeFulfillment =
      searchParams.get("includeFulfillment") !== "false";
    const includeTimeSeries = searchParams.get("includeTimeSeries") !== "false";
    const topCustomersLimit = parseInt(
      searchParams.get("topCustomersLimit") || "10",
      10,
    );
    const topProductsLimit = parseInt(
      searchParams.get("topProductsLimit") || "10",
      10,
    );
    const timeSeriesInterval =
      (searchParams.get("timeSeriesInterval") as any) || "day";

    logger.debug("Fetching order analytics", {
      userId: session.user.id,
      startDate: startDateParam,
      endDate: endDateParam,
      farmId: effectiveFarmId,
      customerId,
      status,
      productId,
    });

    // ═══════════════════════════════════════════════════════════
    // 📊 ANALYTICS GENERATION
    // ═══════════════════════════════════════════════════════════

    const analytics = await orderAnalyticsService.getComprehensiveAnalytics(
      query,
      {
        includeTopCustomers,
        includeTopProducts,
        includeTrends,
        includeFulfillment,
        includeTimeSeries,
        topCustomersLimit,
        topProductsLimit,
        timeSeriesInterval,
      },
    );

    // ═══════════════════════════════════════════════════════════
    // 📈 PERFORMANCE METRICS
    // ═══════════════════════════════════════════════════════════

    const processingTime = Date.now() - startTime;

    logger.info("Order analytics generated successfully", {
      userId: session.user.id,
      processingTimeMs: processingTime,
      startDate: startDateParam,
      endDate: endDateParam,
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
            ...(customerId && { customerId }),
            ...(status && { status }),
            ...(productId && { productId }),
          },
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, max-age=60, must-revalidate",
          "X-Processing-Time": `${processingTime}ms`,
        },
      },
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;

    logger.error("Order analytics generation failed", error as Error, {
      endpoint: "GET /api/analytics/orders",
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
              : "Failed to generate order analytics",
          timestamp: new Date().toISOString(),
          processingTime: `${processingTime}ms`,
        },
      },
      {
        status: 500,
        headers: {
          "X-Processing-Time": `${processingTime}ms`,
        },
      },
    );
  }
}

// ═══════════════════════════════════════════════════════════
// 🔧 ROUTE CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
