/**
 * 📊 Email Analytics API Route - Divine Agricultural Communication Intelligence
 *
 * Provides comprehensive analytics and metrics for email communications.
 * Tracks delivery, engagement, and performance with quantum precision.
 *
 * @module api/analytics/email
 * @category API Routes
 * @agricultural-consciousness DIVINE
 * @sprint Sprint 4 - Email Enhancements
 */

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import type { AnalyticsFilters } from "@/lib/services/email-analytics.service";
import { emailAnalyticsService } from "@/lib/services/email-analytics.service";
import type { EmailStatus, EmailType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("email-analytics-api");

/**
 * Analytics query validation schema
 */
const AnalyticsQuerySchema = z.object({
  startDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  emailType: z.string().optional() as z.ZodType<EmailType | undefined>,
  status: z.string().optional() as z.ZodType<EmailStatus | undefined>,
  userId: z.string().optional(),
});

/**
 * GET /api/analytics/email
 *
 * Retrieves comprehensive email analytics summary.
 * Requires admin authentication.
 *
 * Query Parameters:
 * - startDate (optional): Start date for analytics (ISO string)
 * - endDate (optional): End date for analytics (ISO string)
 * - emailType (optional): Filter by email type
 * - status (optional): Filter by email status
 * - userId (optional): Filter by user ID
 *
 * @returns {AnalyticsSummary} Comprehensive analytics data
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/analytics/email?startDate=2025-01-01&endDate=2025-01-31');
 * const data = await response.json();
 * console.log(data.deliveryStats);
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to view email analytics",
          },
        },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_REQUIRED",
            message: "Only administrators can view email analytics",
          },
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      emailType: searchParams.get("emailType") || undefined,
      status: searchParams.get("status") || undefined,
      userId: searchParams.get("userId") || undefined,
    };

    // Validate query parameters
    const validation = AnalyticsQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: validation.error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const filters: AnalyticsFilters = validation.data;

    logger.debug("Fetching email analytics", {
      userId: session.user.id,
      filters: {
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        emailType: filters.emailType,
        status: filters.status,
      },
    });

    // Get analytics summary
    const summary = await emailAnalyticsService.getAnalyticsSummary(filters);

    logger.info("Email analytics fetched successfully", {
      userId: session.user.id,
      totalEmails: summary.totalEmails,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          summary,
          filters,
          meta: {
            generatedAt: new Date().toISOString(),
            generatedBy: session.user.id,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error fetching email analytics", error as Error, {
      endpoint: "GET /api/analytics/email",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ANALYTICS_FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch email analytics",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/email/comparison
 *
 * Gets performance comparison between current and previous period.
 * Requires admin authentication.
 *
 * @param {Object} request.body - Date range for comparison
 * @returns {Object} Current vs previous period comparison
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/analytics/email/comparison', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     currentStart: '2025-01-01',
 *     currentEnd: '2025-01-31'
 *   })
 * });
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to view email analytics",
          },
        },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_REQUIRED",
            message: "Only administrators can view email analytics",
          },
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate dates
    const ComparisonSchema = z.object({
      currentStart: z.string().transform((val) => new Date(val)),
      currentEnd: z.string().transform((val) => new Date(val)),
    });

    const validation = ComparisonSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid date range",
            details: validation.error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const { currentStart, currentEnd } = validation.data;

    logger.debug("Fetching email performance comparison", {
      userId: session.user.id,
      currentStart: currentStart.toISOString(),
      currentEnd: currentEnd.toISOString(),
    });

    // Get performance comparison
    const comparison = await emailAnalyticsService.getPerformanceComparison(
      currentStart,
      currentEnd
    );

    logger.info("Email performance comparison fetched successfully", {
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          comparison,
          meta: {
            generatedAt: new Date().toISOString(),
            generatedBy: session.user.id,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error fetching performance comparison", error as Error, {
      endpoint: "POST /api/analytics/email",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "COMPARISON_FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch performance comparison",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
