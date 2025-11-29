import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

/**
 * GET /api/orders/counts
 *
 * Get count of orders by status for the authenticated user
 * Returns: active, completed, cancelled counts
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch counts in parallel
    const [activeCount, completedCount, cancelledCount] = await Promise.all([
      // Active orders (PENDING, CONFIRMED, PREPARING, READY)
      database.order.count({
        where: {
          customerId: session.user.id,
          status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] },
        },
      }),

      // Completed orders (DELIVERED)
      database.order.count({
        where: {
          customerId: session.user.id,
          status: "DELIVERED",
        },
      }),

      // Cancelled orders
      database.order.count({
        where: {
          customerId: session.user.id,
          status: "CANCELLED",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        active: activeCount,
        completed: completedCount,
        cancelled: cancelledCount,
      },
    });
  } catch (error) {
    console.error("Failed to fetch order counts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order counts",
      },
      { status: 500 }
    );
  }
}
