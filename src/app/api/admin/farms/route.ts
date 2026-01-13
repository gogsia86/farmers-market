/**
 * 🔐 ADMIN FARMS LIST API - Divine Farm Management System
 * Handles farm listing and filtering for admin panel
 *
 * Routes:
 * - GET /api/admin/farms - List all farms with filtering
 *
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 11_KILO_SCALE_ARCHITECTURE
 */

import { auth } from "@/lib/auth";
import { logger } from "@/lib/monitoring/logger";
import { farmService } from "@/lib/services/farm.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * ✅ GET - List all farms for admin management
 * Query params:
 * - status: Filter by verification status (PENDING, VERIFIED, REJECTED)
 * - search: Search by farm name or owner email
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to access farm management",
          },
        },
        { status: 401 },
      );
    }

    // Check admin authorization
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Only admins can access farm management",
          },
        },
        { status: 403 },
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get("status");
    const searchQuery = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    // Build filter options for optimized service
    const filterOptions: any = {
      page,
      limit: pageSize,
      searchQuery,
      status: statusFilter,
    };

    // Fetch farms with pagination using optimized service
    const result = await farmService.getAllFarms(filterOptions);

    // Extract data from service result
    const farms = result.farms;
    const totalCount = result.total;

    // Calculate stats (these could be moved to service layer in future)
    const stats = {
      total: totalCount,
      pending: farms.filter((f: any) => f.verificationStatus === "PENDING")
        .length,
      verified: farms.filter((f: any) => f.verificationStatus === "VERIFIED")
        .length,
      rejected: farms.filter((f: any) => f.verificationStatus === "REJECTED")
        .length,
    };

    return NextResponse.json({
      success: true,
      data: farms,
      meta: {
        pagination: {
          page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          totalItems: totalCount,
          hasNext: page * pageSize < totalCount,
          hasPrevious: page > 1,
        },
        stats,
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Admin farms list error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch farms",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * 🌾 Get current season helper
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}
