/**
 * Admin Orders Management API
 * GET: List all orders with filters
 * PATCH: Update order status and process refunds
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { notificationService } from "@/lib/services/notification.service";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

// ============================================================================
// Initialize Stripe
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

// ============================================================================
// Validation Schemas
// ============================================================================

const GetOrdersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "READY",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
      "PAYMENT_FAILED",
    ])
    .optional(),
  search: z.string().optional(),
  farmId: z.string().cuid().optional(),
  customerId: z.string().cuid().optional(),
  sortBy: z.enum(["createdAt", "totalPrice", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const UpdateOrderSchema = z.object({
  orderId: z.string().cuid(),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "READY",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
      "PAYMENT_FAILED",
    ])
    .optional(),
  refund: z
    .object({
      amount: z.number().positive().optional(),
      reason: z.string().min(10),
      fullRefund: z.boolean().default(true),
    })
    .optional(),
});

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

async function logAdminAction(
  adminId: string,
  actionType: string,
  targetId: string,
  details?: Record<string, any>
): Promise<void> {
  await database.adminAction.create({
    data: {
      adminId,
      actionType: actionType as any,
      targetType: "ORDER",
      targetId,
      details: details ? JSON.parse(JSON.stringify(details)) : null,
    },
  });
}

// ============================================================================
// GET /api/admin/orders - List all orders
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
        { status: 401 }
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
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      search: searchParams.get("search"),
      farmId: searchParams.get("farmId"),
      customerId: searchParams.get("customerId"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    };

    const validation = GetOrdersSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { page, limit, status, search, farmId, customerId, sortBy, sortOrder } =
      validation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (farmId) {
      where.orderItems = {
        some: {
          product: {
            farmId,
          },
        },
      };
    }

    // Fetch orders and total count
    const [orders, total] = await Promise.all([
      database.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              name: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  farmId: true,
                  farm: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          payment: {
            select: {
              id: true,
              status: true,
              amount: true,
              refundAmount: true,
              stripePaymentIntentId: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip,
      }),
      database.order.count({ where }),
    ]);

    // Get statistics
    const [
      totalOrders,
      pendingCount,
      confirmedCount,
      deliveredCount,
      cancelledCount,
    ] = await Promise.all([
      database.order.count(),
      database.order.count({ where: { status: "PENDING" } }),
      database.order.count({ where: { status: "CONFIRMED" } }),
      database.order.count({ where: { status: "DELIVERED" } }),
      database.order.count({ where: { status: "CANCELLED" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map((order) => ({
          ...order,
          totalPrice: parseFloat(order.totalPrice.toString()),
          subtotal: parseFloat(order.subtotal.toString()),
          tax: parseFloat(order.tax.toString()),
          deliveryFee: parseFloat(order.deliveryFee.toString()),
          payment: order.payment
            ? {
              ...order.payment,
              amount: parseFloat(order.payment.amount.toString()),
              refundAmount: order.payment.refundAmount
                ? parseFloat(order.payment.refundAmount.toString())
                : null,
            }
            : null,
          orderItems: order.orderItems.map((item) => ({
            ...item,
            price: parseFloat(item.price.toString()),
            subtotal: parseFloat(item.subtotal.toString()),
          })),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalOrders,
          pendingCount,
          confirmedCount,
          deliveredCount,
          cancelledCount,
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ORDERS_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch orders",
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/admin/orders - Update order and process refunds
// ============================================================================

export async function PATCH(request: NextRequest): Promise<NextResponse> {
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
        { status: 401 }
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
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = UpdateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { orderId, status, refund } = validation.data;

    // Get the order
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
          },
        },
        { status: 404 }
      );
    }

    // Handle refund if requested
    if (refund) {
      if (!order.payment || !order.payment.stripePaymentIntentId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "NO_PAYMENT_FOUND",
              message: "No payment found for this order",
            },
          },
          { status: 400 }
        );
      }

      try {
        const refundAmount = refund.fullRefund
          ? undefined
          : Math.round((refund.amount || 0) * 100); // Convert to cents

        // Process refund through Stripe
        const stripeRefund = await stripe.refunds.create({
          payment_intent: order.payment.stripePaymentIntentId,
          amount: refundAmount,
          reason: "requested_by_customer",
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            refundReason: refund.reason,
            adminId: session.user.id,
          },
        });

        // Update payment record
        await database.payment.update({
          where: { id: order.payment.id },
          data: {
            status: refund.fullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
            refundedAt: new Date(),
            refundAmount: stripeRefund.amount / 100,
          },
        });

        // Update order status
        await database.order.update({
          where: { id: orderId },
          data: {
            status: refund.fullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
          },
        });

        // Log admin action
        await logAdminAction(session.user.id, "ORDER_REFUNDED", orderId, {
          refundAmount: stripeRefund.amount / 100,
          fullRefund: refund.fullRefund,
          reason: refund.reason,
          stripeRefundId: stripeRefund.id,
        });

        // Send notification to customer
        if (order.customer) {
          await notificationService.createNotification({
            userId: order.customer.id,
            type: "PAYMENT_RECEIVED",
            channels: ["IN_APP", "EMAIL"],
            title: refund.fullRefund ? "Refund processed" : "Partial refund processed",
            body: `Your refund of $${(stripeRefund.amount / 100).toFixed(2)} for order #${order.orderNumber} has been processed.`,
            data: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              refundAmount: stripeRefund.amount / 100,
              fullRefund: refund.fullRefund,
              reason: refund.reason,
            },
          });
        }
      } catch (error) {
        console.error("Refund processing failed:", error);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "REFUND_FAILED",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to process refund",
            },
          },
          { status: 500 }
        );
      }
    }

    // Update order status if provided
    if (status && status !== order.status) {
      await database.order.update({
        where: { id: orderId },
        data: { status },
      });

      // Log admin action
      await logAdminAction(session.user.id, "ORDER_STATUS_CHANGED", orderId, {
        previousStatus: order.status,
        newStatus: status,
      });

      // Send notification to customer
      if (order.customer) {
        await notificationService.sendOrderNotification(
          order.customer.id,
          order.id,
          status,
          {
            orderNumber: order.orderNumber,
            total: order.totalPrice.toNumber(),
          }
        );
      }
    }

    // Fetch updated order
    const updatedOrder = await database.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                farmId: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder
          ? {
            ...updatedOrder,
            totalPrice: parseFloat(updatedOrder.totalPrice.toString()),
            subtotal: parseFloat(updatedOrder.subtotal.toString()),
            tax: parseFloat(updatedOrder.tax.toString()),
            deliveryFee: parseFloat(updatedOrder.deliveryFee.toString()),
            payment: updatedOrder.payment
              ? {
                ...updatedOrder.payment,
                amount: parseFloat(updatedOrder.payment.amount.toString()),
                refundAmount: updatedOrder.payment.refundAmount
                  ? parseFloat(updatedOrder.payment.refundAmount.toString())
                  : null,
              }
              : null,
          }
          : null,
      },
    });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_ORDER_ERROR",
          message: error instanceof Error ? error.message : "Failed to update order",
        },
      },
      { status: 500 }
    );
  }
}
