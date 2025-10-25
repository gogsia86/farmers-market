// src/lib/validation/order.validation.ts
import { database } from "@/lib/database";
import { FulfillmentMethod } from "@prisma/client";

export interface OrderValidationResult {
  valid: boolean;
  errors: string[];
}

export class OrderValidator {
  /**
   * Validate order can be created
   */
  static async validateOrderCreation(
    customerId: string,
    farmId: string,
    items: Array<{ productId: string; quantity: number }>,
    fulfillmentMethod: FulfillmentMethod,
    deliveryAddressId?: string,
    scheduledDate?: Date
  ): Promise<OrderValidationResult> {
    const errors: string[] = [];

    // Validate customer exists
    const customer = await database.user.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      errors.push("Customer not found");
    }

    // Validate farm exists and is active
    const farm = await database.farm.findUnique({
      where: { id: farmId },
    });
    if (!farm) {
      errors.push("Farm not found");
    } else if (farm.status !== "ACTIVE") {
      errors.push(`Farm is not accepting orders (status: ${farm.status})`);
    }

    // Validate items
    if (items.length === 0) {
      errors.push("Order must contain at least one item");
    }

    // Validate products exist and have sufficient inventory
    const productIds = items.map((item) => item.productId);
    const products = await database.product.findMany({
      where: {
        id: { in: productIds },
        farmId: farmId,
      },
    });

    if (products.length !== items.length) {
      errors.push("One or more products not found or do not belong to farm");
    }

    // Check inventory availability
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      if (!product.inStock) {
        errors.push(`Product "${product.name}" is out of stock`);
      }

      if (product.quantity !== null && product.quantity < item.quantity) {
        errors.push(
          `Insufficient quantity for "${product.name}" (available: ${product.quantity}, requested: ${item.quantity})`
        );
      }
    }

    // Validate delivery method and address
    if (fulfillmentMethod === "DELIVERY") {
      if (!deliveryAddressId) {
        errors.push("Delivery address is required for delivery orders");
      } else {
        const address = await database.address.findUnique({
          where: { id: deliveryAddressId, userId: customerId },
        });
        if (!address) {
          errors.push("Delivery address not found or does not belong to user");
        }
      }
    }

    // Validate scheduled date
    if (scheduledDate) {
      const now = new Date();
      if (scheduledDate < now) {
        errors.push("Scheduled date cannot be in the past");
      }

      // Check if date is too far in future (e.g., 30 days)
      const maxDays = 30;
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + maxDays);
      if (scheduledDate > maxDate) {
        errors.push(
          `Scheduled date cannot be more than ${maxDays} days in the future`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate order status transition
   */
  static validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): OrderValidationResult {
    const errors: string[] = [];

    // Define valid status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["READY_FOR_PICKUP", "SHIPPED", "CANCELLED"],
      READY_FOR_PICKUP: ["DELIVERED", "CANCELLED"],
      SHIPPED: ["DELIVERED", "CANCELLED"],
      DELIVERED: ["REFUNDED"],
      CANCELLED: [],
      REFUNDED: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      errors.push(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate order can be cancelled
   */
  static validateOrderCancellation(
    orderStatus: string,
    cancelledBy: "customer" | "farm"
  ): OrderValidationResult {
    const errors: string[] = [];

    // Orders cannot be cancelled after delivery
    const nonCancellableStatuses = ["DELIVERED", "CANCELLED", "REFUNDED"];
    if (nonCancellableStatuses.includes(orderStatus)) {
      errors.push(`Order cannot be cancelled in ${orderStatus} status`);
    }

    // Customers cannot cancel orders that are already shipped
    if (cancelledBy === "customer" && orderStatus === "SHIPPED") {
      errors.push(
        "Customer cannot cancel order that has already been shipped. Please contact farm."
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate refund request
   */
  static async validateRefundRequest(
    orderId: string,
    refundAmount?: number
  ): Promise<OrderValidationResult> {
    const errors: string[] = [];

    const order = await database.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      errors.push("Order not found");
      return { valid: false, errors };
    }

    // Only delivered or cancelled orders can be refunded
    if (order.status !== "DELIVERED" && order.status !== "CANCELLED") {
      errors.push(`Order must be delivered or cancelled to process refund`);
    }

    // Validate refund amount
    if (refundAmount !== undefined) {
      if (refundAmount <= 0) {
        errors.push("Refund amount must be greater than 0");
      }

      const orderTotal = Number(order.total);
      if (refundAmount > orderTotal) {
        errors.push(
          `Refund amount cannot exceed order total (${orderTotal.toFixed(2)})`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
