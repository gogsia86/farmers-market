/**
 * 📊 PLATFORM STATISTICS API ENDPOINT
 * Returns real-time platform metrics for homepage and dashboards
 *
 * Divine Patterns:
 * - Real database aggregation (no mock data)
 * - Performance optimized with selective queries
 * - Caching for frequently accessed stats
 * - Agricultural consciousness integration
 */

import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 600; // Cache for 10 minutes

export async function GET(_request: NextRequest) {
  try {
    // Run all stat queries in parallel for maximum performance
    const [
      totalFarms,
      activeFarms,
      totalProducts,
      activeProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      citiesCovered,
    ] = await Promise.all([
      // Total farms (all statuses)
      database.farm.count(),

      // Active verified farms
      database.farm.count({
        where: {
          status: "ACTIVE",
          verificationStatus: "VERIFIED",
        },
      }),

      // Total products
      database.product.count(),

      // Active products in stock
      database.product.count({
        where: {
          status: "ACTIVE",
          inStock: true,
        },
      }),

      // Total orders
      database.order.count(),

      // Total registered users
      database.user.count({
        where: {
          status: "ACTIVE",
        },
      }),

      // Total revenue (sum of completed orders)
      database.order.aggregate({
        where: {
          status: {
            in: ["DELIVERED", "COMPLETED"],
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Distinct cities covered (from active farms)
      database.farm.findMany({
        where: {
          status: "ACTIVE",
          verificationStatus: "VERIFIED",
          city: {
            not: null,
          },
        },
        select: {
          city: true,
          state: true,
        },
        distinct: ["city"],
      }),
    ]);

    // Calculate derived stats
    const totalRevenueAmount = totalRevenue._sum.totalAmount || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenueAmount / totalOrders : 0;
    const productPerFarm = activeFarms > 0 ? Math.round(activeProducts / activeFarms) : 0;

    // Format numbers for display
    const stats = {
      // Core metrics
      farms: {
        total: totalFarms,
        active: activeFarms,
        display: formatNumber(activeFarms),
        label: "Local Farms",
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        display: formatNumber(activeProducts),
        label: "Fresh Products",
      },
      customers: {
        total: totalUsers,
        display: formatNumber(totalUsers),
        label: "Happy Customers",
      },
      cities: {
        total: citiesCovered.length,
        display: citiesCovered.length.toString(),
        label: "Cities Covered",
      },

      // Business metrics
      orders: {
        total: totalOrders,
        display: formatNumber(totalOrders),
        label: "Orders Fulfilled",
      },
      revenue: {
        total: totalRevenueAmount,
        display: formatCurrency(totalRevenueAmount),
        label: "Total Revenue",
      },
      averageOrderValue: {
        amount: averageOrderValue,
        display: formatCurrency(averageOrderValue),
        label: "Avg. Order Value",
      },
      productPerFarm: {
        count: productPerFarm,
        display: productPerFarm.toString(),
        label: "Products per Farm",
      },

      // Growth indicators
      growth: {
        farmsThisMonth: await getFarmsThisMonth(),
        ordersThisMonth: await getOrdersThisMonth(),
        revenueThisMonth: await getRevenueThisMonth(),
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
          agricultural: {
            consciousness: "divine",
            season: getCurrentSeason(),
          },
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  } catch (error) {
    console.error("[PLATFORM_STATS_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch platform statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Format number for display (1234 -> "1,234" or "1.2K")
 */
function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  if (num >= 1000) {
    return `${Math.floor(num / 1000)},${(num % 1000).toString().padStart(3, "0")}`;
  }
  return num.toString();
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get current season based on month
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return "SPRING";
  if (month >= 6 && month <= 8) return "SUMMER";
  if (month >= 9 && month <= 11) return "FALL";
  return "WINTER";
}

/**
 * Get farms created this month
 */
async function getFarmsThisMonth(): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return database.farm.count({
    where: {
      createdAt: {
        gte: startOfMonth,
      },
    },
  });
}

/**
 * Get orders this month
 */
async function getOrdersThisMonth(): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return database.order.count({
    where: {
      createdAt: {
        gte: startOfMonth,
      },
    },
  });
}

/**
 * Get revenue this month
 */
async function getRevenueThisMonth(): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const result = await database.order.aggregate({
    where: {
      createdAt: {
        gte: startOfMonth,
      },
      status: {
        in: ["DELIVERED", "COMPLETED"],
      },
    },
    _sum: {
      totalAmount: true,
    },
  });

  return result._sum.totalAmount || 0;
}
