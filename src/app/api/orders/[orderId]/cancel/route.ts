// ============================================================================
// DIVINE ORDER CANCELLATION API ROUTE - POST
// Agricultural Quantum Order Cancellation with Inventory Restoration
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/features/order-management/services/order.service";
import type {
  CancelOrderRequest,
  OrderApiResponse,
  OrderWithRelations,
} from "@/features/order-management/types";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

// ============================================================================
// POST CANCEL ORDER - Divine Cancellation Endpoint
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } },
) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Authentication required to cancel order",
          },
        } as OrderApiResponse,
        { status: 401 },
      );
    }

    const { orderId } = params;

    // Fetch existing order
    const existingOrder = await orderService.getOrderById(orderId);

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: `Order not found: ${orderId}`,
          },
        } as OrderApiResponse,
        { status: 404 },
      );
    }

    // Authorization check
    let canCancel = false;

    if (session.user.role === "ADMIN") {
      canCancel = true;
    } else if (session.user.role === "CONSUMER") {
      // Customers can cancel their own orders
      canCancel = existingOrder.customerId === session.user.id;
    } else if (session.user.role === "FARMER") {
      // Farmers can cancel orders for their farms (with reason)
      const farm = await database.farm.findUnique({
        where: { id: existingOrder.farmId },
        select: { ownerId: true },
      });

      canCancel = farm?.ownerId === session.user.id;
    }

    if (!canCancel) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to cancel this order",
          },
        } as OrderApiResponse,
        { status: 403 },
      );
    }

    // Check if order can be cancelled based on status
    const cancellableStatuses = ["PENDING", "CONFIRMED", "PREPARING", "READY"];

    if (!cancellableStatuses.includes(existingOrder.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ORDER_STATUS",
            message: `Orders with status ${existingOrder.status} cannot be cancelled`,
            details: {
              currentStatus: existingOrder.status,
              cancellableStatuses,
            },
          },
        } as OrderApiResponse,
        { status: 400 },
      );
    }

    // Parse request body for cancel reason
    const body = await request.json().catch(() => ({}));
    const cancelReason =
      body.cancelReason ||
      body.reason ||
      "Order cancelled by user without reason";

    // Build cancel request
    const cancelRequest: CancelOrderRequest = {
      orderId,
      cancelledBy: session.user.id,
      cancelReason,
    };

    // Cancel order with agricultural consciousness
    // This will:
    // 1. Update order status to CANCELLED
    // 2. Restore product inventory
    // 3. Update fulfillment status
    // 4. Record cancellation details
    const cancelledOrder = await orderService.cancelOrder(cancelRequest);

    // Determine if refund should be issued
    const shouldRefund = existingOrder.paymentStatus === "PAID";

    return NextResponse.json(
      {
        success: true,
        data: cancelledOrder,
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          cancellation: {
            cancelledBy: session.user.id,
            cancelledByRole: session.user.role,
            cancelReason,
            requiresRefund: shouldRefund,
            inventoryRestored: true,
          },
        },
        agricultural: {
          season: getCurrentSeason(),
          consciousness: "DIVINE",
          orderFlow: "QUANTUM_CANCELLATION_WITH_RESTORATION",
        },
      } as OrderApiResponse<OrderWithRelations>,
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to cancel order:", error);

    // Check if error is due to invalid status
    if (
      error instanceof Error &&
      error.message.includes("Cannot cancel order")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CANCELLATION",
            message: error.message,
          },
          meta: {
            timestamp: new Date(),
          },
        } as OrderApiResponse,
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_CANCEL_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to cancel order",
        },
        meta: {
          timestamp: new Date(),
        },
      } as OrderApiResponse,
      { status: 500 },
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current season based on month
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;

  if (month >= 3 && month <= 5) return "SPRING";
  if (month >= 6 && month <= 8) return "SUMMER";
  if (month >= 9 && month <= 11) return "FALL";
  return "WINTER";
}

// ============================================================================
// DIVINE ORDER CANCELLATION API - AGRICULTURAL CONSCIOUSNESS
// Complete order cancellation with quantum inventory restoration
// ============================================================================
