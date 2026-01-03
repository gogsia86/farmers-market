/**
 * 🚜 CONSOLIDATED FARMER DASHBOARD API ROUTE
 *
 * Protected endpoint for comprehensive farmer dashboard data
 * Returns farm statistics, recent orders, product performance, and financial metrics
 *
 * Divine Patterns Applied:
 * - Authentication required (401 if not authenticated)
 * - Role-based access (farmers only)
 * - Optimized data aggregation with parallel queries
 * - Agricultural consciousness
 * - Comprehensive error handling
 *
 * Consolidation Note:
 * This route consolidates functionality from:
 * - /api/farmer/dashboard (legacy)
 * - /api/farmers/dashboard (previous)
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 * @version 2.0.0 - Consolidated
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

// Initialize structured logger
const logger = createLogger("farmers-dashboard-api");

/**
 * GET /api/farmers/dashboard
 *
 * Returns comprehensive farmer dashboard data including:
 * - Farm information and status
 * - Financial statistics (revenue, trends)
 * - Order metrics (pending, confirmed, completed)
 * - Product performance and inventory alerts
 * - Recent orders with customer details
 * - Weekly and monthly analytics
 *
 * @auth Required
 * @role FARMER
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "farm": { ... },
 *     "stats": { ... },
 *     "weeklyStats": { ... },
 *     "recentOrders": [ ... ],
 *     "topProducts": [ ... ],
 *     "alerts": [ ... ]
 *   }
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user) {
      logger.warn("Unauthorized dashboard access attempt");
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          message: "Please sign in to access the farmer dashboard",
        },
        { status: 401 }
      );
    }

    // Check if user is a farmer
    if (session.user.role !== "FARMER") {
      logger.warn("Non-farmer attempted to access farmer dashboard", {
        userId: session.user.id,
        role: session.user.role,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Only farmers can access this dashboard",
        },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    logger.debug("Fetching farmer dashboard", { userId });

    // Get user's farms (support for multiple farms)
    const farms = await database.farm.findMany({
      where: {
        ownerId: userId,
      },
      select: {
        id: true,
        name: true,
        status: true,
        description: true,
        location: true,
      },
    });

    if (farms.length === 0) {
      logger.info("Farmer has no farms", { userId });

      // Return empty dashboard for farmers without farms
      return NextResponse.json({
        success: true,
        data: {
          farms: [],
          stats: {
            totalRevenue: 0,
            revenueChange: 0,
            totalOrders: 0,
            ordersChange: 0,
            activeProducts: 0,
            totalCustomers: 0,
            pendingOrders: 0,
          },
          weeklyStats: {
            revenue: 0,
            orders: 0,
            newCustomers: 0,
          },
          recentOrders: [],
          topProducts: [],
          alerts: [
            {
              type: "NO_FARM",
              severity: "info",
              message: "Create your first farm to start selling products",
            },
          ],
        },
        meta: {
          agricultural: {
            consciousness: "DIVINE",
            operation: "DASHBOARD_MANIFESTATION",
            season: getCurrentSeason(),
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    const farmIds = farms.map((f) => f.id);
    const primaryFarm = farms[0]; // Use first farm as primary

    // Calculate date ranges for analytics
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Parallel data fetching for optimal performance
    const [
      totalRevenue,
      lastMonthRevenue,
      totalOrders,
      lastMonthOrders,
      activeProducts,
      pendingOrders,
      confirmedOrders,
      completedOrders,
      recentOrders,
      topProducts,
      uniqueCustomers,
      weekOrders,
      lowStockProducts,
    ] = await Promise.all([
      // Total revenue (current month)
      database.order.aggregate({
        where: {
          items: {
            some: {
              product: {
                farmId: { in: farmIds },
              },
            },
          },
          status: "COMPLETED",
          createdAt: { gte: startOfMonth },
        },
        _sum: {
          total: true,
        },
      }),

      // Last month revenue for comparison
      database.order.aggregate({
        where: {
          items: {
            some: {
              product: {
                farmId: { in: farmIds },
              },
            },
          },
          status: "COMPLETED",
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: {
          total: true,
        },
      }),

      // Total orders (current month)
      database.order.count({
        where: {
          items: {
            some: {
              product: {
                farmId: { in: farmIds },
              },
            },
          },
          createdAt: { gte: startOfMonth },
        },
      }),

      // Last month orders for comparison
      database.order.count({
        where: {
          items: {
            some: {
              product: {
                farmId: { in: farmIds },
              },
            },
          },
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),

      // Active products count
      database.product.count({
        where: {
          farmId: { in: farmIds },
          status: "ACTIVE",
        },
      }),

      // Pending orders
      database.order.count({
        where: {
          status: "PENDING",
          items: {
            some: {
              product: {
                farmId: { in: farmIds },
              },
            },
          },
        },
      }),

      // Confirmed orders
      database.order.count({
        where: {
          status: "CONFIRMED",
          items: {
            some: {
              product: {
                farmId: { in: farmIds },
              },
            },
          },
        },
      }),

      // Completed orders
      database.order.count({
        where: {
          status: "COMPLETED",
          items: {
            some: {
              product: {
                farmId: { in: farmIds },
              },
            },
          },
        },
      }),

      // Recent orders (last 10)
      database.order.findMany({
        where: {
          items: {
            some: {
              product: {
                farmId: { in: farmIds },
              },
            },
          },
        },
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            where: {
              product: {
                farmId: { in: farmIds },
              },
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  farmId: true,
                },
              },
            },
          },
        },
      }),

      // Top products by order count
      database.product.findMany({
        where: {
          farmId: { in: farmIds },
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          price: true,
          quantityAvailable: true,
          farmId: true,
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
      }),

      // Unique customers
      database.user.findMany({
        where: {
          orders: {
            some: {
              items: {
                some: {
                  product: {
                    farmId: { in: farmIds },
                  },
                },
              },
            },
          },
        },
        select: {
          id: true,
        },
      }),

      // Week orders for weekly stats
      database.order.findMany({
        where: {
          createdAt: { gte: startOfWeek },
          items: {
            some: {
              product: {
                farmId: { in: farmIds },
              },
            },
          },
        },
        include: {
          items: {
            where: {
              product: {
                farmId: { in: farmIds },
              },
            },
            include: {
              product: {
                select: {
                  price: true,
                },
              },
            },
          },
        },
      }),

      // Low stock products (quantity < 5)
      database.product.findMany({
        where: {
          farmId: { in: farmIds },
          status: "ACTIVE",
          quantityAvailable: {
            lt: 5,
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          quantityAvailable: true,
        },
      }),
    ]);

    // Calculate revenue change percentage
    const currentRevenue = Number(totalRevenue._sum.total || 0);
    const previousRevenue = Number(lastMonthRevenue._sum.total || 0);
    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Calculate orders change percentage
    const ordersChange =
      lastMonthOrders > 0
        ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100
        : 0;

    // Calculate weekly revenue
    const weekRevenue = weekOrders.reduce((total, order) => {
      const orderTotal = order.items.reduce(
        (sum, item) => sum + Number(item.product.price) * Number(item.quantity ?? 0),
        0
      );
      return total + orderTotal;
    }, 0);

    // Build alerts array
    const alerts: Array<{
      type: string;
      severity: "info" | "warning" | "error";
      message: string;
      data?: any;
    }> = [];

    // Low stock alert
    if (lowStockProducts.length > 0) {
      alerts.push({
        type: "LOW_STOCK",
        severity: "warning",
        message: `${lowStockProducts.length} product${lowStockProducts.length > 1 ? "s are" : " is"} running low on inventory`,
        data: {
          products: lowStockProducts.map((p) => ({
            id: p.id,
            name: p.name,
            stock: p.quantityAvailable,
          })),
        },
      });
    }

    // Pending orders alert
    if (pendingOrders > 0) {
      alerts.push({
        type: "PENDING_ORDERS",
        severity: "info",
        message: `You have ${pendingOrders} pending order${pendingOrders > 1 ? "s" : ""} to review`,
        data: {
          count: pendingOrders,
        },
      });
    }

    logger.info("Farmer dashboard data fetched successfully", {
      userId,
      farmCount: farms.length,
      totalOrders,
      activeProducts,
      totalRevenue: currentRevenue,
      pendingOrders,
    });

    // Format and return response
    return NextResponse.json({
      success: true,
      data: {
        farm: primaryFarm ? {
          id: primaryFarm.id,
          name: primaryFarm.name,
          status: primaryFarm.status,
          description: primaryFarm.description,
          location: primaryFarm.location,
        } : null,
        farms: farms.map((farm) => ({
          id: farm.id,
          name: farm.name,
          status: farm.status,
        })),
        stats: {
          totalRevenue: currentRevenue,
          revenueChange: Math.round(revenueChange * 10) / 10,
          totalOrders,
          ordersChange: Math.round(ordersChange * 10) / 10,
          activeProducts,
          totalCustomers: uniqueCustomers.length,
          pendingOrders,
          confirmedOrders,
          completedOrders,
        },
        weeklyStats: {
          revenue: weekRevenue,
          orders: weekOrders.length,
          newCustomers: 0, // TODO: Calculate actual new customers this week
        },
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName:
            order.customer.name ||
            `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim() ||
            order.customer.email,
          customerEmail: order.customer.email,
          items: order.items.length,
          totalAmount: order.items.reduce(
            (sum, item) =>
              sum + Number(item.product.price) * Number(item.quantity),
            0
          ),
          status: order.status,
          scheduledDate: order.scheduledDate,
          createdAt: order.createdAt.toISOString(),
        })),
        topProducts: topProducts.map((product) => ({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          stockQuantity: product.quantityAvailable,
          orderCount: product._count.orderItems,
          farmId: product.farmId,
        })),
        alerts,
      },
      meta: {
        agricultural: {
          consciousness: "DIVINE",
          operation: "DASHBOARD_MANIFESTATION",
          season: getCurrentSeason(),
          timestamp: new Date().toISOString(),
        },
        requestId: request.headers.get("x-request-id") || undefined,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch farmer dashboard data", error as Error, {
      operation: "GET /api/farmers/dashboard",
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        message: "An error occurred while loading your dashboard",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get current season based on date
 * Used for agricultural consciousness metadata
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return "SPRING";
  if (month >= 6 && month <= 8) return "SUMMER";
  if (month >= 9 && month <= 11) return "FALL";
  return "WINTER";
}

/**
 * 🌟 Divine consolidated farmer dashboard route established ✨
 *
 * Consolidation Summary:
 * - Merged functionality from /api/farmer/dashboard and /api/farmers/dashboard
 * - Enhanced with comprehensive financial analytics
 * - Optimized with parallel database queries
 * - Added revenue and order trend calculations
 * - Included low stock and pending order alerts
 * - Multi-farm support for farmers with multiple properties
 *
 * Features:
 * - Authentication protected (401 if not signed in)
 * - Role-based access control (farmers only)
 * - Comprehensive farm statistics
 * - Recent orders with customer details
 * - Top-performing products
 * - Weekly and monthly analytics
 * - Automated inventory alerts
 * - Agricultural consciousness maintained
 *
 * Ready for quantum farmer operations! 🚜
 */
