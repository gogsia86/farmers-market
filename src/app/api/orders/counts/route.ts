import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextResponse } from "next/server";

// Initialize structured logger
const logger = createLogger("orders-counts-api");

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
        { status: 401 },
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

      // Completed orders (FULFILLED and COMPLETED)
      database.order.count({
        where: {
          customerId: session.user.id,
          status: { in: ["FULFILLED", "COMPLETED"] },
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
    logger.error("Failed to fetch order counts", error as Error, {
      operation: "GET /api/orders/counts",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order counts",
      },
      { status: 500 },
    );
  }
}
