/**
 * Admin Analytics API
 * GET: Platform-wide analytics and metrics
 */

import { auth } from "@/lib/auth";

import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/monitoring/logger";

// ============================================================================
// Helper Functions
// ============================================================================

async function isAdmin(userId: string): Promise<boolean> {
  const user = await database.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

// ============================================================================
// GET /api/admin/analytics - Get platform analytics
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 },
      );
    }

    // Check admin permissions
    const adminCheck = await isAdmin(session.user.id);
    if (!adminCheck) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Admin access required",
          },
        },
        { status: 403 },
      );
    }

    // Get time period from query params (default: last 30 days)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Parallel fetch all analytics data
    const [
      // User metrics
      totalUsers,
      activeUsers,
      newUsersCount,
      usersByRole,

      // Farm metrics
      totalFarms,
      activeFarms,
      pendingFarms,
      newFarmsCount,

      // Product metrics
      totalProducts,
      activeProducts,
      newProductsCount,

      // Order metrics
      totalOrders,
      recentOrders,
      ordersByStatus,

      // Payment metrics
      totalRevenue,
      recentRevenue,
      paymentsByStatus,

      // Review metrics
      totalReviews,
      pendingReviews,
      averageRating,

      // Activity metrics
      recentActivity,
    ] = await Promise.all([
      // Users
      database.user.count(),
      database.user.count({ where: { status: "ACTIVE" } }),
      database.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      database.user.groupBy({
        by: ["role"],
        _count: true,
      }),

      // Farms
      database.farm.count(),
      database.farm.count({ where: { status: "ACTIVE" } }),
      database.farm.count({ where: { status: "PENDING" } }),
      database.farm.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Products
      database.product.count(),
      database.product.count({ where: { status: "ACTIVE" } }),
      database.product.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Orders
      database.order.count(),
      database.order.count({
        where: { createdAt: { gte: startDate } },
      }),
      database.order.groupBy({
        by: ["status"],
        _count: true,
      }),

      // Payments
      database.payment.aggregate({
        _sum: { amount: true },
        where: { status: "PAID" },
      }),
      database.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "PAID",
          paidAt: { gte: startDate },
        },
      }),
      database.payment.groupBy({
        by: ["status"],
        _count: true,
        _sum: { amount: true },
      }),

      // Reviews
      database.review.count(),
      database.review.count({ where: { status: "PENDING" } }),
      database.review.aggregate({
        _avg: { rating: true },
        where: { status: "APPROVED" },
      }),

      // Recent activity
      database.adminAction.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              name: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    // Calculate growth rates
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);

    const [
      previousNewUsers,
      previousNewFarms,
      previousOrders,
      previousRevenue,
    ] = await Promise.all([
      database.user.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
      database.farm.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
      database.order.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
      database.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "PAID",
          paidAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
    ]);

    // Calculate growth percentages
    const userGrowth =
      previousNewUsers > 0
        ? ((newUsersCount - previousNewUsers) / previousNewUsers) * 100
        : 100;
    const farmGrowth =
      previousNewFarms > 0
        ? ((newFarmsCount - previousNewFarms) / previousNewFarms) * 100
        : 100;
    const orderGrowth =
      previousOrders > 0
        ? ((recentOrders - previousOrders) / previousOrders) * 100
        : 100;
    const revenueGrowth =
      previousRevenue._sum.amount && recentRevenue._sum.amount
        ? ((parseFloat(recentRevenue._sum.amount.toString()) -
            parseFloat(previousRevenue._sum.amount.toString())) /
            parseFloat(previousRevenue._sum.amount.toString())) *
          100
        : 100;

    // Get top performing farms by revenue
    const topFarms = await database.farm.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc",
        },
      },
    });

    // Get recent orders with details
    const recentOrdersDetails = await database.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        customerId: true,
      },
    });

    // Get customer details for recent orders
    const customerIds = [
      ...new Set(recentOrdersDetails.map((o: any) => o.customerId)),
    ];
    const customers = await database.user.findMany({
      where: { id: { in: customerIds } },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
      },
    });
    const customerMap = new Map(customers.map((c: any) => [c.id, c]));

    // Format usersByRole
    const roleDistribution = usersByRole.reduce(
      (acc: any, { role, _count }: any) => {
        acc[role] = _count;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Format ordersByStatus
    const statusDistribution = ordersByStatus.reduce(
      (acc: any, { status, _count }: any) => {
        acc[status] = _count;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Format paymentsByStatus
    const paymentDistribution = paymentsByStatus.reduce(
      (acc: any, { status, _count, _sum }: any) => {
        acc[status] = {
          count: _count,
          total: _sum.amount ? parseFloat(_sum.amount.toString()) : 0,
        };
        return acc;
      },
      {} as Record<string, { count: number; total: number }>,
    );

    // Calculate average order value
    const avgOrderValue =
      totalOrders > 0 && totalRevenue._sum.amount
        ? parseFloat(totalRevenue._sum.amount.toString()) / totalOrders
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue: totalRevenue._sum.amount
            ? parseFloat(totalRevenue._sum.amount.toString())
            : 0,
          recentRevenue: recentRevenue._sum.amount
            ? parseFloat(recentRevenue._sum.amount.toString())
            : 0,
          revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
          totalOrders,
          recentOrders,
          orderGrowth: parseFloat(orderGrowth.toFixed(2)),
          avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          newUsers: newUsersCount,
          userGrowth: parseFloat(userGrowth.toFixed(2)),
          byRole: roleDistribution,
        },
        farms: {
          total: totalFarms,
          active: activeFarms,
          pending: pendingFarms,
          newFarms: newFarmsCount,
          farmGrowth: parseFloat(farmGrowth.toFixed(2)),
          topFarms: topFarms.map((farm: any) => ({
            id: farm.id,
            name: farm.name,
            productCount: farm._count.products,
            reviewCount: farm._count.reviews,
          })),
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          newProducts: newProductsCount,
        },
        orders: {
          total: totalOrders,
          recent: recentOrders,
          byStatus: statusDistribution,
          recentOrders: recentOrdersDetails.map((order: any) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalPrice: parseFloat(order.total.toString()),
            createdAt: order.createdAt,
            customer: customerMap.get(order.customerId) || null,
          })),
        },
        payments: {
          byStatus: paymentDistribution,
        },
        reviews: {
          total: totalReviews,
          pending: pendingReviews,
          averageRating: averageRating._avg.rating
            ? parseFloat(averageRating._avg.rating.toFixed(2))
            : 0,
        },
        recentActivity: recentActivity.map((action: any) => ({
          id: action.id,
          actionType: action.type,
          targetType: action.targetType,
          targetId: action.targetId,
          createdAt: action.createdAt,
          admin: action.admin,
          details: action.metadata,
        })),
        period: {
          days,
          startDate,
          endDate: new Date(),
        },
      },
    });
  } catch (error) {
    logger.error("Failed to fetch admin analytics:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ANALYTICS_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch analytics",
        },
      },
      { status: 500 },
    );
  }
}
