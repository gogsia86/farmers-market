/**
 * DASHBOARD ANALYTICS API
 * Comprehensive dashboard metrics
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

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
        { status: 403 }
      );
    }

    const farmIds = farmId ? [farmId] : userFarms.map((f) => f.id);

    // Get last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all metrics in parallel
    const [orders, products, reviews, lowInventory] = await Promise.all([
      // Orders
      database.order.findMany({
        where: {
          farmId: { in: farmIds },
          createdAt: { gte: thirtyDaysAgo },
        },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Products
      database.product.findMany({
        where: { farmId: { in: farmIds } },
        include: {
          reviews: true,
        },
      }),

      // Reviews
      database.review.findMany({
        where: {
          product: {
            farmId: { in: farmIds },
          },
        },
      }),

      // Low inventory products
      database.product.findMany({
        where: {
          farmId: { in: farmIds },
          quantity: { lte: 10 },
        },
        take: 5,
      }),
    ]);

    // Calculate metrics
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number.parseFloat(order.total.toString()),
      0
    );
    const averageOrderValue =
      orders.length > 0 ? totalRevenue / orders.length : 0;

    // Top products by sales
    const productSales = new Map<string, number>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const current = productSales.get(item.productId) || 0;
        productSales.set(item.productId, current + item.quantity);
      });
    });

    const topProducts = Array.from(productSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, quantity]) => {
        const product = products.find((p) => p.id === productId);
        return {
          productId,
          name: product?.name || "Unknown",
          quantity,
          revenue: orders
            .flatMap((o) => o.items)
            .filter((i) => i.productId === productId)
            .reduce(
              (sum, item) =>
                sum + Number.parseFloat(item.price.toString()) * item.quantity,
              0
            ),
          rating:
            (product?.reviews.length ?? 0 > 0)
              ? (product?.reviews.reduce((sum, r) => sum + r.rating, 0) ?? 0) /
                (product?.reviews.length ?? 1)
              : 0,
        };
      });

    // Farm performance
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.inStock).length;
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const response = {
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        averageOrderValue,
        totalProducts,
        activeProducts,
        averageRating,
      },
      topProducts,
      recentOrders: orders.map((order) => ({
        id: order.id,
        total: order.total,
        status: order.status,
        itemCount: order.items.length,
        createdAt: order.createdAt,
      })),
      lowInventory: lowInventory.map((product) => ({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        status: product.quantity === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
      })),
      alerts: {
        lowInventoryCount: lowInventory.length,
        pendingOrders: orders.filter((o) => o.status === "PENDING").length,
        needsReview: reviews.filter((r) => !r.response).length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard analytics" },
      { status: 500 }
    );
  }
}
