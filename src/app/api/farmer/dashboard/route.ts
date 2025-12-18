/**
 * 🚜 FARMER DASHBOARD API ROUTE
 *
 * Protected endpoint for farmer dashboard data
 * Returns farm statistics, recent orders, and product performance
 *
 * Divine Patterns Applied:
 * - Authentication required (401 if not authenticated)
 * - Role-based access (farmers only)
 * - Optimized data aggregation
 * - Agricultural consciousness
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

/**
 * GET /api/farmer/dashboard
 *
 * Returns farmer dashboard data including:
 * - Farm statistics
 * - Recent orders
 * - Product performance
 * - Revenue metrics
 *
 * @auth Required
 * @role FARMER
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "stats": { ... },
 *     "recentOrders": [ ... ],
 *     "topProducts": [ ... ]
 *   }
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          message: "Please sign in to access the farmer dashboard",
        },
        { status: 401 },
      );
    }

    // Check if user is a farmer
    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Only farmers can access this dashboard",
        },
        { status: 403 },
      );
    }

    // Get farmer's farms
    const farms = await database.farm.findMany({
      where: {
        ownerId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (farms.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          stats: {
            totalRevenue: 0,
            totalOrders: 0,
            activeProducts: 0,
            pendingOrders: 0,
          },
          recentOrders: [],
          topProducts: [],
          farms: [],
        },
        meta: {
          agricultural: {
            consciousness: "DIVINE",
            operation: "DASHBOARD_MANIFESTATION",
            season: getCurrentSeason(),
          },
        },
      });
    }

    const farmIds = farms.map((f) => f.id);

    // Get dashboard statistics
    const [totalRevenue, totalOrders, activeProducts, recentOrders] =
      await Promise.all([
        // Total revenue
        database.order.aggregate({
          where: {
            farmId: { in: farmIds },
            status: "COMPLETED",
          },
          _sum: {
            total: true,
          },
        }),

        // Total completed orders
        database.order.count({
          where: {
            farmId: { in: farmIds },
            status: "COMPLETED",
          },
        }),

        // Active products count
        database.product.count({
          where: {
            farmId: { in: farmIds },
            status: "ACTIVE",
          },
        }),

        // Recent orders (last 10)
        database.order.findMany({
          where: {
            farmId: { in: farmIds },
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        }),
      ]);

    // Get top products by order count
    const topProducts = await database.product.findMany({
      where: {
        farmId: { in: farmIds },
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        price: true,
        quantityAvailable: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: {
        orderItems: {
          _count: "desc",
        },
      },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRevenue: totalRevenue._sum.total || 0,
          totalOrders,
          activeProducts,
          pendingOrders: await database.order.count({
            where: {
              farmId: { in: farmIds },
              status: "PENDING",
            },
          }),
        },
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.total,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          createdAt: order.createdAt.toISOString(),
        })),
        topProducts: topProducts.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          stockQuantity: product.quantityAvailable,
          orderCount: product._count.orderItems,
        })),
        farms: farms.map((farm) => ({
          id: farm.id,
          name: farm.name,
          status: farm.status,
        })),
      },
      meta: {
        agricultural: {
          consciousness: "DIVINE",
          operation: "DASHBOARD_MANIFESTATION",
          season: getCurrentSeason(),
        },
      },
    });
  } catch (error) {
    console.error("Farmer dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * Helper function to get current season based on date
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return "SPRING";
  if (month >= 6 && month <= 8) return "SUMMER";
  if (month >= 9 && month <= 11) return "FALL";
  return "WINTER";
}

/**
 * 🌟 Divine farmer dashboard route established ✨
 * - Authentication protected (401 if not signed in)
 * - Role-based access control (farmers only)
 * - Comprehensive farm statistics
 * - Recent orders and top products
 * - Agricultural consciousness maintained
 * Ready for quantum farmer operations! 🚜
 */
