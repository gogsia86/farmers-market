/**
 * 🚚 ORDER FULFILLMENT SERVICE - Divine Order Processing
 *
 * Handles all order fulfillment operations:
 * - Order status transitions
 * - Order updates and modifications
 * - Order cancellation with stock restoration
 * - Fulfillment tracking
 * - Order completion
 *
 * Split from the monolithic order.service.ts for better maintainability.
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import { database } from "@/lib/database";
import type { Order, OrderItem } from "@prisma/client";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { BusinessLogicError } from "@/lib/errors/BusinessLogicError";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type OrderStatusType =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "FULFILLED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatusType =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface UpdateOrderRequest {
  status?: OrderStatusType;
  paymentStatus?: PaymentStatusType;
  fulfillmentMethod?: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";
  specialInstructions?: string;
  scheduledDate?: Date;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
}

export interface CancelOrderRequest {
  reason: string;
  cancelledBy: string;
  refundRequested?: boolean;
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  customer?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  farm?: {
    id: string;
    name: string;
    ownerId: string;
  };
}

export interface StatusTransitionResult {
  success: boolean;
  previousStatus: OrderStatusType;
  newStatus: OrderStatusType;
  timestamp: Date;
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Valid status transitions for orders
 * Key: current status, Value: array of allowed next statuses
 */
const VALID_STATUS_TRANSITIONS: Record<OrderStatusType, OrderStatusType[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["FULFILLED", "CANCELLED"],
  FULFILLED: ["COMPLETED"],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

/**
 * Statuses that allow cancellation
 */
const CANCELLABLE_STATUSES: OrderStatusType[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
];

// ============================================
// ORDER FULFILLMENT SERVICE
// ============================================

export class OrderFulfillmentService {
  // ========================================
  // ORDER RETRIEVAL
  // ========================================

  /**
   * Get order by ID with full details
   */
  async getOrderById(orderId: string): Promise<OrderWithDetails | null> {
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        deliveryAddress: true,
        fulfillment: true,
      },
    });

    return order as OrderWithDetails | null;
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(
    orderNumber: string,
  ): Promise<OrderWithDetails | null> {
    const order = await database.order.findUnique({
      where: { orderNumber },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        deliveryAddress: true,
        fulfillment: true,
      },
    });

    return order as OrderWithDetails | null;
  }

  // ========================================
  // STATUS MANAGEMENT
  // ========================================

  /**
   * Update order status with validation
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatusType,
    userId: string,
  ): Promise<StatusTransitionResult> {
    const order = await this.getOrderById(orderId);

    if (!order) {
      throw new NotFoundError("Order", orderId);
    }

    // Validate authorization
    const isAuthorized = await this.validateAuthorization(order, userId);
    if (!isAuthorized) {
      throw new BusinessLogicError(
        "You are not authorized to update this order",
        "UNAUTHORIZED_ORDER_UPDATE",
        { orderId, userId },
      );
    }

    // Validate status transition
    const currentStatus = order.status as OrderStatusType;
    if (!this.isValidStatusTransition(currentStatus, newStatus)) {
      throw new BusinessLogicError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        "INVALID_STATUS_TRANSITION",
        {
          currentStatus,
          requestedStatus: newStatus,
          allowedTransitions: VALID_STATUS_TRANSITIONS[currentStatus],
        },
      );
    }

    // Update the order with appropriate timestamp
    const updateData: Record<string, any> = {
      status: newStatus,
      updatedAt: new Date(),
    };

    // Set appropriate timestamp based on new status
    switch (newStatus) {
      case "CONFIRMED":
        updateData.confirmedAt = new Date();
        break;
      case "FULFILLED":
        updateData.fulfilledAt = new Date();
        break;
      case "COMPLETED":
        updateData.completedAt = new Date();
        break;
    }

    await database.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return {
      success: true,
      previousStatus: currentStatus,
      newStatus,
      timestamp: new Date(),
    };
  }

  /**
   * Update order details
   */
  async updateOrder(
    orderId: string,
    updates: UpdateOrderRequest,
    userId: string,
  ): Promise<OrderWithDetails> {
    const order = await this.getOrderById(orderId);

    if (!order) {
      throw new NotFoundError("Order", orderId);
    }

    // Validate authorization
    const isAuthorized = await this.validateAuthorization(order, userId);
    if (!isAuthorized) {
      throw new BusinessLogicError(
        "You are not authorized to update this order",
        "UNAUTHORIZED_ORDER_UPDATE",
        { orderId, userId },
      );
    }

    // Validate status transition if status is being updated
    if (updates.status) {
      const currentStatus = order.status as OrderStatusType;
      if (!this.isValidStatusTransition(currentStatus, updates.status)) {
        throw new BusinessLogicError(
          `Invalid status transition from ${currentStatus} to ${updates.status}`,
          "INVALID_STATUS_TRANSITION",
          { currentStatus, requestedStatus: updates.status },
        );
      }
    }

    // Build update data
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (updates.status) {
      updateData.status = updates.status;
      // Set appropriate timestamp
      switch (updates.status) {
        case "CONFIRMED":
          updateData.confirmedAt = new Date();
          break;
        case "FULFILLED":
          updateData.fulfilledAt = new Date();
          break;
        case "COMPLETED":
          updateData.completedAt = new Date();
          break;
      }
    }

    if (updates.paymentStatus) updateData.paymentStatus = updates.paymentStatus;
    if (updates.fulfillmentMethod)
      updateData.fulfillmentMethod = updates.fulfillmentMethod;
    if (updates.specialInstructions !== undefined)
      updateData.specialInstructions = updates.specialInstructions;
    if (updates.scheduledDate) updateData.scheduledDate = updates.scheduledDate;
    if (updates.trackingNumber)
      updateData.trackingNumber = updates.trackingNumber;
    if (updates.trackingUrl) updateData.trackingUrl = updates.trackingUrl;
    if (updates.estimatedDelivery)
      updateData.estimatedDelivery = updates.estimatedDelivery;

    const updatedOrder = await database.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        deliveryAddress: true,
        fulfillment: true,
      },
    });

    return updatedOrder as OrderWithDetails;
  }

  // ========================================
  // CANCELLATION
  // ========================================

  /**
   * Cancel an order with stock restoration
   */
  async cancelOrder(
    orderId: string,
    request: CancelOrderRequest,
  ): Promise<OrderWithDetails> {
    const order = await this.getOrderById(orderId);

    if (!order) {
      throw new NotFoundError("Order", orderId);
    }

    // Check if order can be cancelled
    const currentStatus = order.status as OrderStatusType;
    if (!CANCELLABLE_STATUSES.includes(currentStatus)) {
      throw new BusinessLogicError(
        `Order cannot be cancelled. Current status: ${currentStatus}`,
        "ORDER_NOT_CANCELLABLE",
        {
          currentStatus,
          cancellableStatuses: CANCELLABLE_STATUSES,
        },
      );
    }

    // Cancel order and restore stock in transaction
    const cancelledOrder = await database.$transaction(async (tx) => {
      // Restore stock for each item
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantityAvailable: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelledBy: request.cancelledBy,
          cancelReason: request.reason,
          updatedAt: new Date(),
        },
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          farm: {
            select: {
              id: true,
              name: true,
              ownerId: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          deliveryAddress: true,
          fulfillment: true,
        },
      });

      return updated;
    });

    return cancelledOrder as OrderWithDetails;
  }

  // ========================================
  // COMPLETION
  // ========================================

  /**
   * Mark order as complete
   */
  async completeOrder(
    orderId: string,
    userId: string,
  ): Promise<OrderWithDetails> {
    return this.updateOrder(orderId, { status: "COMPLETED" }, userId);
  }

  /**
   * Mark order as fulfilled (shipped/ready for pickup)
   */
  async fulfillOrder(
    orderId: string,
    userId: string,
    trackingInfo?: {
      trackingNumber?: string;
      trackingUrl?: string;
      estimatedDelivery?: Date;
    },
  ): Promise<OrderWithDetails> {
    return this.updateOrder(
      orderId,
      {
        status: "FULFILLED",
        ...trackingInfo,
      },
      userId,
    );
  }

  /**
   * Confirm order (after payment)
   */
  async confirmOrder(
    orderId: string,
    userId: string,
  ): Promise<OrderWithDetails> {
    return this.updateOrder(
      orderId,
      {
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
      userId,
    );
  }

  /**
   * Start preparing order
   */
  async startPreparing(
    orderId: string,
    userId: string,
  ): Promise<OrderWithDetails> {
    return this.updateOrder(orderId, { status: "PREPARING" }, userId);
  }

  /**
   * Mark order as ready for pickup/delivery
   */
  async markReady(orderId: string, userId: string): Promise<OrderWithDetails> {
    return this.updateOrder(orderId, { status: "READY" }, userId);
  }

  // ========================================
  // VALIDATION HELPERS
  // ========================================

  /**
   * Check if status transition is valid
   */
  isValidStatusTransition(
    currentStatus: OrderStatusType,
    newStatus: OrderStatusType,
  ): boolean {
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Get allowed next statuses for an order
   */
  getAllowedNextStatuses(currentStatus: OrderStatusType): OrderStatusType[] {
    return VALID_STATUS_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Check if order can be cancelled
   */
  canBeCancelled(status: OrderStatusType): boolean {
    return CANCELLABLE_STATUSES.includes(status);
  }

  /**
   * Validate user authorization for order operations
   */
  private async validateAuthorization(
    order: OrderWithDetails,
    userId: string,
  ): Promise<boolean> {
    // Customer can update their own orders
    if (order.customerId === userId) {
      return true;
    }

    // Farm owner can update orders for their farm
    if (order.farm?.ownerId === userId) {
      return true;
    }

    // Check if user is admin
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role === "ADMIN";
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  /**
   * Get orders ready for fulfillment
   */
  async getOrdersForFulfillment(
    farmId: string,
    limit: number = 50,
  ): Promise<OrderWithDetails[]> {
    const orders = await database.order.findMany({
      where: {
        farmId,
        status: {
          in: ["CONFIRMED", "PREPARING"],
        },
      },
      take: limit,
      orderBy: {
        createdAt: "asc",
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        deliveryAddress: true,
        fulfillment: true,
      },
    });

    return orders as OrderWithDetails[];
  }

  /**
   * Get scheduled orders for a date range
   */
  async getScheduledOrders(
    farmId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<OrderWithDetails[]> {
    const orders = await database.order.findMany({
      where: {
        farmId,
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          notIn: ["CANCELLED", "COMPLETED"],
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        deliveryAddress: true,
        fulfillment: true,
      },
    });

    return orders as OrderWithDetails[];
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const orderFulfillmentService = new OrderFulfillmentService();
export default orderFulfillmentService;
