import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

/**
 * GET /api/users/dashboard
 *
 * Fetch dashboard data for authenticated consumer
 * Returns: stats, recent orders, favorite farms
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Fetch all dashboard data in parallel for performance
    const [
      activeOrdersCount,
      totalOrdersCount,
      favoriteCount,
      recentOrders,
      completedOrders,
      favoriteFarms,
    ] = await Promise.all([
      // Count active orders
      database.order.count({
        where: {
          customerId: session.user.id,
          status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] },
        },
      }),

      // Count total orders
      database.order.count({
        where: { customerId: session.user.id },
      }),

      // Count favorites
      database.favorite.count({
        where: { userId: session.user.id },
      }),

      // Fetch recent orders
      database.order.findMany({
        where: { customerId: session.user.id },
        include: {
          farm: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Fetch completed orders for pending reviews count
      database.order.findMany({
        where: {
          customerId: session.user.id,
          status: "COMPLETED",
        },
        include: {
          reviews: true,
        },
      }),

      // Fetch favorite farms
      database.favorite.findMany({
        where: { userId: session.user.id },
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
              bannerUrl: true,
            },
          },
        },
        take: 10,
      }),
    ]);

    // Calculate pending reviews (orders without reviews)
    const pendingReviews = completedOrders.filter(
      (order: any) => !order.reviews || order.reviews.length === 0,
    ).length;

    // Format response data
    const stats = {
      activeOrders: activeOrdersCount,
      totalOrders: totalOrdersCount,
      favoriteCount,
      pendingReviews,
    };

    const formattedOrders = recentOrders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      farmName: order.farm.name,
      status: order.status.toLowerCase(),
      totalAmount: Number(order.total),
      createdAt: order.createdAt.toISOString(),
    }));

    const formattedFarms = Array.isArray(favoriteFarms)
      ? favoriteFarms.map((fav: any) => ({
          id: fav.farm.id,
          name: fav.farm.name,
          slug: fav.farm.slug,
          imageUrl: fav.farm.bannerUrl || null,
        }))
      : [];

    return NextResponse.json({
      success: true,
      stats,
      recentOrders: formattedOrders,
      favoriteFarms: formattedFarms,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
