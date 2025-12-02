/**
 * 📦 DIVINE ORDER MANAGEMENT SERVER ACTIONS
 * Farmers Market Platform - Order Operations with Agricultural Consciousness
 * Version: 1.0 - Server Actions Implementation
 *
 * Features:
 * - Order status management with validation
 * - Status transition rules enforcement
 * - Order notes (internal and customer-facing)
 * - Fulfillment details tracking
 * - Authentication & authorization
 * - Comprehensive error handling
 * - Cache revalidation
 */

"use server";

import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";
import { requireFarmer, getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import {
  ActionResult,
  ActionError,
  ActionErrorCode,
  createSuccessResult,
  createErrorResult,
} from "@/types/actions";
import type { Order, OrderStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Order status validation schema
 */
const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "FULFILLED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
]);

/**
 * Order note schema
 */
const orderNoteSchema = z.object({
  note: z.string().min(1, "Note cannot be empty").max(1000),
  isVisibleToCustomer: z.boolean().default(false),
});

/**
 * Fulfillment details schema
 */
const fulfillmentDetailsSchema = z.object({
  trackingNumber: z.string().optional().nullable(),
  estimatedDate: z.coerce.date().optional().nullable(),
  proofPhotoUrl: z.string().url().optional().nullable(),
  deliveryNotes: z.string().max(500).optional().nullable(),
});

/**
 * Cancellation schema
 */
const cancellationSchema = z.object({
  reason: z
    .string()
    .min(10, "Please provide a reason for cancellation")
    .max(500),
  refundAmount: z.number().positive().optional(),
  notifyCustomer: z.boolean().default(true),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Valid status transitions map
 * Defines which status changes are allowed
 */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["FULFILLED", "CANCELLED"],
  FULFILLED: ["COMPLETED"],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

/**
 * Check if status transition is valid
 */
function isValidStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): boolean {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
}

/**
 * Verify farmer owns order items
 */
async function verifyOrderOwnership(
  orderId: string,
  userId: string,
): Promise<{ valid: boolean; farmId?: string; currentStatus?: OrderStatus }> {
  const order = await database.order.findFirst({
    where: {
      id: orderId,
    },
    select: {
      status: true,
      items: {
        select: {
          product: {
            select: {
              farmId: true,
              farm: {
                select: {
                  ownerId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order || order.items.length === 0) {
    return { valid: false };
  }

  // Check if user owns any of the products in the order
  const ownsAnyProduct = order.items.some(
    (item) => item.product.farm.ownerId === userId,
  );

  if (!ownsAnyProduct) {
    return { valid: false };
  }

  // Get the farm ID from the first product (assuming single-farm orders)
  const farmId = order.items[0]?.product.farmId;

  return {
    valid: true,
    farmId,
    currentStatus: order.status,
  };
}

/**
 * Get timestamp field name for status
 */
function getStatusTimestampField(status: OrderStatus): string | null {
  const timestampMap: Record<string, string> = {
    CONFIRMED: "confirmedAt",
    PREPARING: "preparingAt",
    READY: "readyAt",
    FULFILLED: "fulfilledAt",
    COMPLETED: "completedAt",
    CANCELLED: "cancelledAt",
  };
  return timestampMap[status] || null;
}

// ============================================================================
// UPDATE ORDER STATUS ACTION
// ============================================================================

/**
 * Update order status with validation and transitions
 *
 * @param orderId - ID of the order to update
 * @param newStatus - New status to set
 * @param notes - Optional notes about the status change
 * @returns ActionResult with updated order or error
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  notes?: string,
): Promise<ActionResult<Order>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to update order status",
      );
    }

    // 2. Verify user is a farmer
    const session = await requireFarmer();
    if (!session) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "Only farmers can update order status",
      );
    }

    // 3. Validate new status
    const statusValidation = orderStatusSchema.safeParse(newStatus);
    if (!statusValidation.success) {
      return createErrorResult(
        ActionErrorCode.VALIDATION_ERROR,
        "Invalid order status",
        "status",
      );
    }

    // 4. Verify order ownership
    const ownership = await verifyOrderOwnership(orderId, user.id);
    if (!ownership.valid) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to update this order",
      );
    }

    // 5. Validate status transition
    const currentStatus = ownership.currentStatus!;
    if (!isValidStatusTransition(currentStatus, newStatus)) {
      return createErrorResult(
        ActionErrorCode.INVALID_STATUS_TRANSITION,
        `Cannot transition from ${currentStatus} to ${newStatus}`,
        "status",
        {
          currentStatus,
          attemptedStatus: newStatus,
          validTransitions: VALID_TRANSITIONS[currentStatus],
        },
      );
    }

    // 6. Prepare update data
    const updateData: Prisma.OrderUpdateInput = {
      status: newStatus,
      updatedAt: new Date(),
    };

    // Set appropriate timestamp field
    const timestampField = getStatusTimestampField(newStatus);
    if (timestampField) {
      (updateData as any)[timestampField] = new Date();
    }

    // 7. Update order in database
    const order = await database.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                farmId: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 8. Create status change log entry (if notes provided)
    if (notes) {
      await database.message.create({
        data: {
          orderId,
          senderId: user.id,
          subject: "Order Status Update",
          body: `Status changed to ${newStatus}: ${notes}`,
          createdAt: new Date(),
        },
      });
    }

    // 9. Revalidate relevant caches
    revalidatePath("/farmer/orders");
    revalidatePath(`/farmer/orders/${orderId}`);
    revalidatePath(`/orders/${orderId}`);

    // TODO: Send notification to customer about status change
    // This would integrate with notification service

    // 10. Return success with updated order
    return createSuccessResult(order, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update order status error:", error);

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createErrorResult(ActionErrorCode.NOT_FOUND, "Order not found");
      }
    }

    // Handle ActionError instances
    if (error instanceof ActionError) {
      return createErrorResult(error.code, error.message, error.field);
    }

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to update order status. Please try again.",
    );
  }
}

// ============================================================================
// ADD ORDER NOTE ACTION
// ============================================================================

/**
 * Add note to order (internal or customer-facing)
 *
 * @param orderId - ID of the order
 * @param note - Note content
 * @param isVisibleToCustomer - Whether customer can see the note
 * @returns ActionResult with void or error
 */
export async function addOrderNoteAction(
  orderId: string,
  note: string,
  isVisibleToCustomer: boolean = false,
): Promise<ActionResult<void>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to add order notes",
      );
    }

    // 2. Verify user is a farmer
    const session = await requireFarmer();
    if (!session) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "Only farmers can add order notes",
      );
    }

    // 3. Validate note data
    const validation = orderNoteSchema.safeParse({ note, isVisibleToCustomer });
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResult(
        ActionErrorCode.VALIDATION_ERROR,
        firstError?.message || "Validation failed",
        firstError?.path.join("."),
      );
    }

    // 4. Verify order ownership
    const ownership = await verifyOrderOwnership(orderId, user.id);
    if (!ownership.valid) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to add notes to this order",
      );
    }

    // 5. Create order message/note
    await database.message.create({
      data: {
        orderId,
        senderId: user.id,
        subject: validation.data.isVisibleToCustomer
          ? "Order Note"
          : "Internal Note",
        body: validation.data.note,
        createdAt: new Date(),
      },
    });

    // 6. Revalidate relevant caches
    revalidatePath("/farmer/orders");
    revalidatePath(`/farmer/orders/${orderId}`);
    revalidatePath(`/orders/${orderId}`);

    // TODO: If visible to customer, send notification

    // 7. Return success
    return createSuccessResult(undefined, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Add order note error:", error);

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createErrorResult(ActionErrorCode.NOT_FOUND, "Order not found");
      }
    }

    // Handle ActionError instances
    if (error instanceof ActionError) {
      return createErrorResult(error.code, error.message, error.field);
    }

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to add order note. Please try again.",
    );
  }
}

// ============================================================================
// UPDATE FULFILLMENT DETAILS ACTION
// ============================================================================

/**
 * Update order fulfillment details (tracking, estimated date, etc.)
 *
 * @param orderId - ID of the order
 * @param data - Fulfillment details
 * @returns ActionResult with void or error
 */
export async function updateFulfillmentAction(
  orderId: string,
  data: {
    trackingNumber?: string | null;
    estimatedDate?: Date | null;
    proofPhotoUrl?: string | null;
    deliveryNotes?: string | null;
  },
): Promise<ActionResult<void>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to update fulfillment details",
      );
    }

    // 2. Verify user is a farmer
    const session = await requireFarmer();
    if (!session) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "Only farmers can update fulfillment details",
      );
    }

    // 3. Validate fulfillment data
    const validation = fulfillmentDetailsSchema.safeParse(data);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResult(
        ActionErrorCode.VALIDATION_ERROR,
        firstError?.message || "Validation failed",
        firstError?.path.join("."),
      );
    }

    // 4. Verify order ownership
    const ownership = await verifyOrderOwnership(orderId, user.id);
    if (!ownership.valid) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to update this order",
      );
    }

    // 5. Update order with fulfillment details
    await database.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: validation.data.trackingNumber,
        specialInstructions: validation.data.deliveryNotes,
        updatedAt: new Date(),
      },
    });

    // Update fulfillment record if it exists
    const fulfillment = await database.fulfillment.findUnique({
      where: { orderId },
    });

    if (fulfillment) {
      await database.fulfillment.update({
        where: { orderId },
        data: {
          estimatedDate: validation.data.estimatedDate,
          proofPhotoUrl: validation.data.proofPhotoUrl,
          deliveryNotes: validation.data.deliveryNotes,
          updatedAt: new Date(),
        },
      });
    } else if (validation.data.estimatedDate || validation.data.proofPhotoUrl) {
      // Create fulfillment record if needed
      await database.fulfillment.create({
        data: {
          orderId,
          estimatedDate: validation.data.estimatedDate,
          proofPhotoUrl: validation.data.proofPhotoUrl,
          deliveryNotes: validation.data.deliveryNotes,
        },
      });
    }

    // 6. Create note about fulfillment update
    const noteText = [];
    if (validation.data.trackingNumber) {
      noteText.push(`Tracking number: ${validation.data.trackingNumber}`);
    }
    if (validation.data.estimatedDate) {
      noteText.push(
        `Estimated delivery: ${validation.data.estimatedDate.toLocaleDateString()}`,
      );
    }

    if (noteText.length > 0) {
      await database.message.create({
        data: {
          orderId,
          senderId: user.id,
          subject: "Fulfillment Update",
          body: `Fulfillment updated: ${noteText.join(", ")}`,
          createdAt: new Date(),
        },
      });
    }

    // 7. Revalidate relevant caches
    revalidatePath("/farmer/orders");
    revalidatePath(`/farmer/orders/${orderId}`);
    revalidatePath(`/orders/${orderId}`);

    // TODO: Send notification to customer with tracking info

    // 8. Return success
    return createSuccessResult(undefined, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update fulfillment error:", error);

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createErrorResult(ActionErrorCode.NOT_FOUND, "Order not found");
      }
    }

    // Handle ActionError instances
    if (error instanceof ActionError) {
      return createErrorResult(error.code, error.message, error.field);
    }

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to update fulfillment details. Please try again.",
    );
  }
}

// ============================================================================
// CANCEL ORDER ACTION
// ============================================================================

/**
 * Cancel order with reason
 *
 * @param orderId - ID of the order to cancel
 * @param data - Cancellation details
 * @returns ActionResult with updated order or error
 */
export async function cancelOrderAction(
  orderId: string,
  data: {
    reason: string;
    refundAmount?: number;
    notifyCustomer?: boolean;
  },
): Promise<ActionResult<Order>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to cancel orders",
      );
    }

    // 2. Verify user is a farmer
    const session = await requireFarmer();
    if (!session) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "Only farmers can cancel orders",
      );
    }

    // 3. Validate cancellation data
    const validation = cancellationSchema.safeParse(data);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResult(
        ActionErrorCode.VALIDATION_ERROR,
        firstError?.message || "Validation failed",
        firstError?.path.join("."),
      );
    }

    // 4. Verify order ownership
    const ownership = await verifyOrderOwnership(orderId, user.id);
    if (!ownership.valid) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to cancel this order",
      );
    }

    // 5. Check if order can be cancelled
    const currentStatus = ownership.currentStatus!;
    if (
      !["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(currentStatus)
    ) {
      return createErrorResult(
        ActionErrorCode.BUSINESS_RULE_VIOLATION,
        `Cannot cancel order with status ${currentStatus}`,
        "status",
      );
    }

    // 6. Update order status to CANCELLED
    const order = await database.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelReason: validation.data.reason,
        cancelledBy: user.id,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 7. Create cancellation note
    await database.message.create({
      data: {
        orderId,
        senderId: user.id,
        subject: "Order Cancellation",
        body: `Order cancelled: ${validation.data.reason}`,
        createdAt: new Date(),
      },
    });

    // 8. Restore product inventory
    for (const item of order.items) {
      await database.product.update({
        where: { id: item.productId },
        data: {
          quantityAvailable: {
            increment: item.quantity,
          },
        },
      });
    }

    // 9. Revalidate relevant caches
    revalidatePath("/farmer/orders");
    revalidatePath(`/farmer/orders/${orderId}`);
    revalidatePath(`/orders/${orderId}`);

    // TODO: Process refund if refundAmount provided
    // TODO: Send cancellation notification to customer

    // 10. Return success with cancelled order
    return createSuccessResult(order, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createErrorResult(ActionErrorCode.NOT_FOUND, "Order not found");
      }
    }

    // Handle ActionError instances
    if (error instanceof ActionError) {
      return createErrorResult(error.code, error.message, error.field);
    }

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to cancel order. Please try again.",
    );
  }
}

// ============================================================================
// GET ORDER DETAILS ACTION (Read-only)
// ============================================================================

/**
 * Get detailed order information for farmer
 *
 * @param orderId - ID of the order to retrieve
 * @returns ActionResult with order details or error
 */
export async function getOrderDetailsAction(
  orderId: string,
): Promise<ActionResult<Order>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to view order details",
      );
    }

    // 2. Verify order ownership
    const ownership = await verifyOrderOwnership(orderId, user.id);
    if (!ownership.valid) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to view this order",
      );
    }

    // 3. Fetch order with all details
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                farm: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            sender: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return createErrorResult(ActionErrorCode.NOT_FOUND, "Order not found");
    }

    // 4. Return order details
    return createSuccessResult(order, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get order details error:", error);

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to fetch order details. Please try again.",
    );
  }
}
