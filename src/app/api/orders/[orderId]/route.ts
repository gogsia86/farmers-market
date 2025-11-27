// ============================================================================
// DIVINE SINGLE ORDER API ROUTE - GET & PATCH
// Agricultural Quantum Order Details & Updates
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/features/order-management/services/order.service";
import type {
  UpdateOrderRequest,
  OrderApiResponse,
  OrderWithRelations,
} from "@/features/order-management/types";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

// ============================================================================
// GET SINGLE ORDER - Divine Retrieval Endpoint
// ============================================================================

export async function GET(
  _request: NextRequest,
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
            message: "Authentication required to view order details",
          },
        } as OrderApiResponse,
        { status: 401 },
      );
    }

    const { orderId } = params;

    // Fetch order with agricultural consciousness
    const order = await orderService.getOrderById(orderId);

    if (!order) {
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
    if (session.user.role === "CONSUMER") {
      // Customers can only view their own orders
      if (order.customerId !== session.user.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "You do not have permission to view this order",
            },
          } as OrderApiResponse,
          { status: 403 },
        );
      }
    } else if (session.user.role === "FARMER") {
      // Farmers can only view orders for their farms
      const farm = await database.farm.findUnique({
        where: { id: order.farmId },
        select: { ownerId: true },
      });

      if (!farm || farm.ownerId !== session.user.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "You do not have permission to view this order",
            },
          } as OrderApiResponse,
          { status: 403 },
        );
      }
    }
    // ADMIN can view all orders (no additional check)

    return NextResponse.json({
      success: true,
      data: order,
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
      },
      agricultural: {
        season: getCurrentSeason(),
        consciousness: "DIVINE",
        orderFlow: "QUANTUM_DETAIL_RETRIEVAL",
      },
    } as OrderApiResponse<OrderWithRelations>);
  } catch (error) {
    console.error("Failed to fetch order:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch order",
          details: error instanceof Error ? { stack: error.stack } : undefined,
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
// PATCH ORDER - Divine Order Update
// ============================================================================

export async function PATCH(
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
            message: "Authentication required to update order",
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
    let canUpdate = false;

    if (session.user.role === "ADMIN") {
      canUpdate = true;
    } else if (session.user.role === "FARMER") {
      // Farmers can update orders for their farms
      const farm = await database.farm.findUnique({
        where: { id: existingOrder.farmId },
        select: { ownerId: true },
      });

      canUpdate = farm?.ownerId === session.user.id;
    } else if (session.user.role === "CONSUMER") {
      // Customers can only update limited fields (like special instructions)
      canUpdate = existingOrder.customerId === session.user.id;
    }

    if (!canUpdate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to update this order",
          },
        } as OrderApiResponse,
        { status: 403 },
      );
    }

    // Parse request body
    const updates: UpdateOrderRequest = await request.json();

    // Role-based update restrictions
    if (session.user.role === "CONSUMER") {
      // Customers can only update special instructions and delivery info
      const allowedFields = [
        "specialInstructions",
        "scheduledDate",
        "scheduledTimeSlot",
      ];
      const updateKeys = Object.keys(updates);
      const invalidFields = updateKeys.filter(
        (key) => !allowedFields.includes(key),
      );

      if (invalidFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: `Customers cannot update fields: ${invalidFields.join(", ")}`,
            },
          } as OrderApiResponse,
          { status: 403 },
        );
      }
    }

    // Validate status transition if status is being updated
    if (updates.status) {
      try {
        // Simple validation - just check if transition makes sense
        const validTransitions: Record<string, string[]> = {
          PENDING: ["CONFIRMED", "CANCELLED"],
          CONFIRMED: ["PREPARING", "CANCELLED"],
          PREPARING: ["READY", "CANCELLED"],
          READY: ["FULFILLED", "CANCELLED"],
          FULFILLED: ["COMPLETED", "CANCELLED"],
          COMPLETED: [],
          CANCELLED: [],
          REFUNDED: [],
        };

        const allowed = validTransitions[existingOrder.status] || [];
        if (!allowed.includes(updates.status)) {
          throw new Error(
            `Invalid status transition from ${existingOrder.status} to ${updates.status}`,
          );
        }
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_STATUS_TRANSITION",
              message:
                error instanceof Error
                  ? error.message
                  : "Invalid status transition",
            },
          } as OrderApiResponse,
          { status: 400 },
        );
      }
    }

    // Update order with agricultural consciousness
    const updatedOrder = await orderService.updateOrder(orderId, updates);

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
      },
      agricultural: {
        season: getCurrentSeason(),
        consciousness: "DIVINE",
        orderFlow: "QUANTUM_STATE_TRANSITION",
      },
    } as OrderApiResponse<OrderWithRelations>);
  } catch (error) {
    console.error("Failed to update order:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_UPDATE_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to update order",
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
// DELETE ORDER - Soft Delete (Cancel)
// ============================================================================

export async function DELETE(
  _request: NextRequest,
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
            message: "Authentication required to delete order",
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

    // Authorization check - only customer or admin can cancel
    if (
      session.user.role !== "ADMIN" &&
      existingOrder.customerId !== session.user.id
    ) {
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

    // Cancel order
    const cancelledOrder = await orderService.cancelOrder({
      orderId,
      cancelledBy: session.user.id,
      cancelReason: "Cancelled by user via API",
    });

    return NextResponse.json({
      success: true,
      data: cancelledOrder,
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
      },
      agricultural: {
        season: getCurrentSeason(),
        consciousness: "DIVINE",
        orderFlow: "QUANTUM_CANCELLATION",
      },
    } as OrderApiResponse<OrderWithRelations>);
  } catch (error) {
    console.error("Failed to cancel order:", error);

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
// DIVINE ORDER DETAIL API - AGRICULTURAL CONSCIOUSNESS
// Complete order CRUD operations with quantum REST endpoints
// ============================================================================
