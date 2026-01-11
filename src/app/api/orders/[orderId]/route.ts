/**
 * 🛒 Order by ID API - Divine Order Operations
 * Handles individual order operations (get, update, cancel)
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { auth } from "@/lib/auth";
import { NotFoundError, ValidationError } from "@/lib/services/base.service";
import { orderService } from "@/lib/services/order.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/monitoring/logger";

/**
 * Update order validation schema
 */
const UpdateOrderSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "FULFILLED",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  trackingNumber: z.string().optional(),
  deliveryNotes: z.string().optional(),
});

/**
 * GET /api/orders/[orderId]
 * Retrieve a specific order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to view order details",
          },
        },
        { status: 401 },
      );
    }

    const { orderId } = params;

    const order = await orderService.getOrderById(orderId);

    // Authorization: users can only see their own orders or orders from their farms
    if (
      session.user.role === "CONSUMER" &&
      order.customerId !== session.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_ERROR",
            message: "You don't have permission to view this order",
          },
        },
        { status: 403 },
      );
    }

    if (session.user.role === "FARMER") {
      // Check if user owns the farm
      if (order.farm?.ownerId !== session.user.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTHORIZATION_ERROR",
              message: "You don't have permission to view this order",
            },
          },
          { status: 403 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: order,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(`GET /api/orders/[orderId] error:`, {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: error.message,
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch order",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/orders/[orderId]
 * Update order status or tracking information
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to update orders",
          },
        },
        { status: 401 },
      );
    }

    // Only farmers and admins can update orders
    if (session.user.role !== "FARMER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_ERROR",
            message: "Only farmers and admins can update orders",
          },
        },
        { status: 403 },
      );
    }

    const { orderId } = params;
    const body = await request.json();

    // Validate request
    const validation = UpdateOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid update data",
            details: validation.error.format(),
          },
        },
        { status: 400 },
      );
    }

    const updates = validation.data;

    const order = await orderService.updateOrder(
      orderId,
      updates,
      session.user.id,
    );

    return NextResponse.json({
      success: true,
      data: order,
      meta: {
        timestamp: new Date().toISOString(),
        message: "Order updated successfully",
      },
    });
  } catch (error) {
    logger.error(`PATCH /api/orders/[orderId] error:`, {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: error.message,
          },
        },
        { status: 404 },
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            field: (error as any).field,
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_UPDATE_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to update order",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/orders/[orderId]
 * Cancel an order
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to cancel orders",
          },
        },
        { status: 401 },
      );
    }

    const { orderId } = params;

    const order = await orderService.cancelOrder(orderId, session.user.id);

    return NextResponse.json({
      success: true,
      data: order,
      meta: {
        timestamp: new Date().toISOString(),
        message: "Order cancelled successfully",
      },
    });
  } catch (error) {
    logger.error(`DELETE /api/orders/[orderId] error:`, {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: error.message,
          },
        },
        { status: 404 },
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            field: (error as any).field,
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_CANCELLATION_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to cancel order",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
