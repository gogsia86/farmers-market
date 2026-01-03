/**
 * DASHBOARD ANALYTICS API
 * Comprehensive dashboard metrics
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("dashboard-analytics-api");

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

    logger.debug("Dashboard analytics request", {
      userId: session.user.id,
      farmId: farmId || "all",
    });

    // Get user's farms
    const userFarms = await database.farm.findMany({
      where: session.user.role === "ADMIN" ? {} : { ownerId: session.user.id },
      select: { id: true },
    });

    if (userFarms.length === 0) {
      return NextResponse.json(
        {
          error: "No farms found",
        },
        { status: 403 },
      );
    }

    const farmIds = farmId ? [farmId] : userFarms.map((f) => f.id);

    // Get last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all metrics in parallel with optimized queries
    const [orderStats, recentOrders, products, lowInventory] =
      await Promise.all([
        // Order aggregation for statistics
        database.order.aggregate({
          where: {
            farmId: { in: farmIds },
            createdAt: { gte: thirtyDaysAgo },
          },
          _sum: { total: true },
          _count: true,
          _avg: { total: true },
        }),

        // Recent orders with minimal data
        database.order.findMany({
          where: {
            farmId: { in: farmIds },
            createdAt: { gte: thirtyDaysAgo },
          },
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            items: {
              select: {
                id: true,
                productId: true,
                quantity: true,
                unitPrice: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),

        // Products with selective fields and limited reviews
        database.product.findMany({
          where: { farmId: { in: farmIds } },
          select: {
            id: true,
            name: true,
            inStock: true,
            quantityAvailable: true,
            reviews: {
              select: { rating: true },
              take: 100, // Limit reviews per product
            },
          },
        }),

        // Low inventory with minimal fields
        database.product.findMany({
          where: {
            farmId: { in: farmIds },
            quantityAvailable: { lte: 10 },
          },
          select: {
            id: true,
            name: true,
            quantityAvailable: true,
          },
          take: 5,
        }),
      ]);

    // Calculate metrics from aggregation
    const totalRevenue = Number(orderStats._sum.total || 0);
    const totalOrders = orderStats._count;
    const averageOrderValue = Number(orderStats._avg.total || 0);

    // Top products by sales (optimized)
    const productSales = new Map<
      string,
      { quantity: number; revenue: number }
    >();
    recentOrders.forEach((order) => {
      order.items.forEach((item) => {
        const current = productSales.get(item.productId) || {
          quantity: 0,
          revenue: 0,
        };
        productSales.set(item.productId, {
          quantity: current.quantity + Number(item.quantity),
          revenue:
            current.revenue + Number(item.unitPrice) * Number(item.quantity),
        });
      });
    });

    const topProducts = Array.from(productSales.entries())
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 5)
      .map(([productId, stats]) => {
        const product = products.find((p) => p.id === productId);
        const avgRating = product?.reviews.length
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
          product.reviews.length
          : 0;

        return {
          productId,
          name: product?.name || "Unknown",
          quantity: stats.quantity,
          revenue: stats.revenue,
          rating: avgRating,
        };
      });

    // Farm performance (optimized)
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.inStock).length;

    // Calculate average rating from all product reviews
    const allReviews = products.flatMap((p) => p.reviews);
    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    const response = {
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalProducts,
        activeProducts,
        averageRating,
      },
      topProducts,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        total: order.total,
        status: order.status,
        itemCount: order.items.length,
        createdAt: order.createdAt,
      })),
      lowInventory: lowInventory.map((product) => ({
        id: product.id,
        name: product.name,
        quantity: product.quantityAvailable || 0,
        status:
          (product.quantityAvailable || 0) === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
      })),
      alerts: {
        lowInventoryCount: lowInventory.length,
        pendingOrders: recentOrders.filter((o) => o.status === "PENDING")
          .length,
        needsReview: 0, // Reviews not fetched separately anymore - can be calculated if needed
      },
    };

    logger.info("Dashboard analytics fetched successfully", {
      userId: session.user.id,
      farmCount: farmIds.length,
      totalOrders,
      totalProducts,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Dashboard analytics error", error as Error, {
      endpoint: "GET /api/analytics/dashboard",
    });
    return NextResponse.json(
      { error: "Failed to fetch dashboard analytics" },
      { status: 500 },
    );
  }
}
