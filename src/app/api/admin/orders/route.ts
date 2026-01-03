/**
 * Admin Orders Management API
 * GET: List all orders with filters
 * PATCH: Update order status
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
  apiVersion: "2025-12-15.clover" as any,
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
      "PREPARING",
      "READY",
      "FULFILLED",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  search: z.string().optional(),
  farmId: z.string().cuid().optional(),
  customerId: z.string().cuid().optional(),
  sortBy: z.enum(["createdAt", "total", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const UpdateOrderSchema = z.object({
  orderId: z.string().cuid(),
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
  type: string,
  targetId: string,
  description: string,
  metadata?: Record<string, any>
): Promise<void> {
  await database.adminAction.create({
    data: {
      adminId,
      type: type as any,
      targetType: "ORDER",
      targetId,
      description,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
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
    if (farmId) where.farmId = farmId;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
      ];
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
          items: {
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
          Payment: {
            select: {
              id: true,
              status: true,
              amount: true,
              stripePaymentIntentId: true,
              paidAt: true,
            },
          },
          farm: {
            select: {
              id: true,
              name: true,
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
      completedCount,
      cancelledCount,
    ] = await Promise.all([
      database.order.count(),
      database.order.count({ where: { status: "PENDING" } }),
      database.order.count({ where: { status: "CONFIRMED" } }),
      database.order.count({ where: { status: "COMPLETED" } }),
      database.order.count({ where: { status: "CANCELLED" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map((order) => ({
          ...order,
          total: parseFloat(order.total.toString()),
          subtotal: parseFloat(order.subtotal.toString()),
          tax: parseFloat(order.tax.toString()),
          deliveryFee: parseFloat(order.deliveryFee.toString()),
          platformFee: parseFloat(order.platformFee.toString()),
          discount: parseFloat(order.discount.toString()),
          farmerAmount: parseFloat(order.farmerAmount.toString()),
          Payment: order.Payment
            ? {
              ...order.Payment,
              amount: parseFloat(order.Payment.amount.toString()),
            }
            : null,
          items: order.items.map((item) => ({
            ...item,
            unitPrice: parseFloat(item.unitPrice.toString()),
            quantity: parseFloat(item.quantity.toString()),
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
          completedCount,
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
        Payment: true,
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
      if (!order.Payment || !order.Payment.stripePaymentIntentId) {
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
          payment_intent: order.Payment.stripePaymentIntentId,
          amount: refundAmount,
          reason: "requested_by_customer",
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            refundReason: refund.reason,
            adminId: session.user.id,
          },
        });

        // Create refund record
        await database.refund.create({
          data: {
            orderId: order.id,
            amount: stripeRefund.amount / 100,
            reason: refund.reason,
            stripeRefundId: stripeRefund.id,
            status: "COMPLETED",
            processedAt: new Date(),
          },
        });

        // Update payment status
        const totalRefunded = await database.refund.aggregate({
          where: { orderId: order.id },
          _sum: { amount: true },
        });

        const refundedAmount = totalRefunded._sum.amount
          ? (typeof totalRefunded._sum.amount === 'number'
            ? totalRefunded._sum.amount
            : totalRefunded._sum.amount.toNumber())
          : 0;
        const orderTotal = order.total.toNumber();
        const isFullRefund = refundedAmount >= orderTotal;

        await database.payment.update({
          where: { id: order.Payment.id },
          data: {
            status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
          },
        });

        // Update order payment status
        await database.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
          },
        });

        // Log admin action
        await logAdminAction(
          session.user.id,
          "ORDER_REFUNDED",
          orderId,
          `Refund processed: $${(stripeRefund.amount / 100).toFixed(2)}`,
          {
            refundAmount: stripeRefund.amount / 100,
            fullRefund: refund.fullRefund,
            reason: refund.reason,
            stripeRefundId: stripeRefund.id,
          }
        );

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
      await logAdminAction(
        session.user.id,
        "SETTING_CHANGED",
        orderId,
        `Order status changed from ${order.status} to ${status}`,
        {
          previousStatus: order.status,
          newStatus: status,
        }
      );

      // Send notification to customer
      if (order.customer) {
        await notificationService.sendOrderNotification(
          order.customer.id,
          order.id,
          status,
          {
            orderNumber: order.orderNumber,
            total: order.total.toNumber(),
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
        items: {
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
        Payment: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder
          ? {
            ...updatedOrder,
            total: parseFloat(updatedOrder.total.toString()),
            subtotal: parseFloat(updatedOrder.subtotal.toString()),
            tax: parseFloat(updatedOrder.tax.toString()),
            deliveryFee: parseFloat(updatedOrder.deliveryFee.toString()),
            platformFee: parseFloat(updatedOrder.platformFee.toString()),
            discount: parseFloat(updatedOrder.discount.toString()),
            farmerAmount: parseFloat(updatedOrder.farmerAmount.toString()),
            Payment: updatedOrder.Payment
              ? {
                ...updatedOrder.Payment,
                amount: parseFloat(updatedOrder.Payment.amount.toString()),
              }
              : null,
            items: updatedOrder.items.map((item) => ({
              ...item,
              unitPrice: parseFloat(item.unitPrice.toString()),
              quantity: parseFloat(item.quantity.toString()),
              subtotal: parseFloat(item.subtotal.toString()),
            })),
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
