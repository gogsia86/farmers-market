/**
 * 🛒 Order Service - Divine Commerce Management
 * Comprehensive order management with payment processing and fulfillment
 * Following: 11_KILO_SCALE_ARCHITECTURE & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { database } from "@/lib/database";
import { BaseService, NotFoundError, ValidationError } from "@/lib/services/base.service";
import { emailService } from "@/lib/services/email.service";
import type { Order, OrderItem, OrderStatus, Prisma } from "@prisma/client";

/**
 * Order validation error
 */
export class OrderValidationError extends ValidationError {
  constructor(message: string, field?: string) {
    super(message, field);
    this.name = "OrderValidationError";
  }
}

/**
 * Create order request type
 */
export interface CreateOrderRequest {
  customerId: string;
  farmId: string;
  items: Array<{
    productId: string;
    quantity: number;
    priceUSD: number;
  }>;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  deliveryInstructions?: string;
  paymentMethod: string;
}

/**
 * Checkout order request type (supports multiple farms)
 */
export interface CheckoutOrderRequest {
  userId: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryInfo: {
    preferredDate: string;
    preferredTime: string;
    deliveryInstructions?: string;
  };
  paymentMethod: {
    method: "card" | "wallet";
    saveCard?: boolean;
  };
  cartItems: Array<{
    productId: string;
    farmId: string;
    quantity: number;
    priceAtPurchase: number;
  }>;
  totals: {
    subtotal: number;
    deliveryFee: number;
    platformFee: number;
    tax: number;
    total: number;
  };
}

/**
 * Update order request type
 */
export interface UpdateOrderRequest {
  status?: OrderStatus;
  trackingNumber?: string;
  deliveryNotes?: string;
}

/**
 * Order with relations
 */
export type OrderWithRelations = Order & {
  customer?: any;
  farm?: any;
  items?: OrderItem[];
};

/**
 * Order filter options
 */
export interface OrderFilterOptions {
  customerId?: string;
  farmId?: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  minTotal?: number;
  maxTotal?: number;
}

/**
 * 🛒 Order Service
 */
class OrderService extends BaseService {
  constructor() {
    super("OrderService");
  }

  /**
   * Create new order
   */
  async createOrder(request: CreateOrderRequest): Promise<OrderWithRelations> {
    return this.withQuantumTransaction(async (tx) => {
      // Validate items
      if (!request.items || request.items.length === 0) {
        throw new ValidationError("Order must have at least one item", "items");
      }

      // Calculate totals
      const subtotalUSD = request.items.reduce(
        (sum, item) => sum + item.priceUSD * item.quantity,
        0
      );

      // TODO: Calculate tax and shipping based on location
      const taxUSD = subtotalUSD * 0.08; // 8% tax (placeholder)
      const shippingUSD = 5.99; // Flat rate (placeholder)
      const totalUSD = subtotalUSD + taxUSD + shippingUSD;

      // Create order
      const order = await tx.order.create({
        data: {
          customerId: request.customerId,
          farmId: request.farmId,
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotal: subtotalUSD,
          tax: taxUSD,
          deliveryFee: shippingUSD,
          platformFee: 0,
          discount: 0,
          total: totalUSD,
          farmerAmount: totalUSD * 0.9, // 90% to farmer, 10% platform fee
          fulfillmentMethod: "DELIVERY",
          shippingAddress: request.deliveryAddress as any,
          specialInstructions: request.deliveryInstructions,
          items: {
            create: await Promise.all(
              request.items.map(async (item) => {
                const product = await tx.product.findUnique({
                  where: { id: item.productId },
                  select: { name: true, unit: true },
                });
                return {
                  productId: item.productId,
                  productName: product?.name || "Unknown Product",
                  quantity: item.quantity,
                  unit: product?.unit || "unit",
                  unitPrice: item.priceUSD,
                  subtotal: item.priceUSD * item.quantity,
                  productSnapshot: product as any,
                };
              })
            ),
          },
        },
        include: {
          customer: true,
          farm: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update product inventory
      for (const item of request.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantityAvailable: {
              decrement: item.quantity,
            },
            purchaseCount: {
              increment: 1,
            },
          },
        });
      }

      // Update farm metrics
      await tx.farm.update({
        where: { id: request.farmId },
        data: {
          totalOrdersCount: {
            increment: 1,
          },
          totalRevenueUSD: {
            increment: Number(totalUSD),
          },
        },
      });

      this.log("info", "Order created", {
        orderId: order.id,
        customerId: request.customerId,
        farmId: request.farmId,
        totalUSD,
      });

      // Send order confirmation email
      if (order.customer?.email) {
        try {
          await emailService.sendOrderConfirmationEmail(
            order.customer.email,
            {
              orderId: order.id,
              orderNumber: order.orderNumber,
              customerName: order.customer.name || "Valued Customer",
              farmName: order.farm?.name || "Farm",
              items: order.items.map(item => ({
                name: item.productName,
                quantity: item.quantity,
                unit: item.unit,
                price: item.unitPrice,
                subtotal: item.subtotal
              })),
              subtotal: order.subtotal,
              tax: order.tax,
              deliveryFee: order.deliveryFee,
              total: order.total,
              orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${order.id}`
            }
          );
          this.log("info", "Order confirmation email sent", { orderId: order.id });
        } catch (emailError) {
          // Don't block order creation if email fails
          this.log("error", "Failed to send order confirmation email", {
            orderId: order.id,
            error: emailError instanceof Error ? emailError.message : "Unknown error"
          });
        }
      }

      return order;
    });
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<OrderWithRelations> {
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        farm: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError("Order", orderId);
    }

    return order;
  }

  /**
   * Get orders with filters
   */
  async getOrders(
    filters: OrderFilterOptions,
    page: number = 1,
    limit: number = 20
  ): Promise<{ orders: OrderWithRelations[]; total: number }> {
    const where: Prisma.OrderWhereInput = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.farmId) {
      where.farmId = filters.farmId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters.minTotal !== undefined || filters.maxTotal !== undefined) {
      where.total = {};
      if (filters.minTotal !== undefined) {
        where.total.gte = filters.minTotal;
      }
      if (filters.maxTotal !== undefined) {
        where.total.lte = filters.maxTotal;
      }
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      database.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          farm: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      database.order.count({ where }),
    ]);

    return { orders, total };
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    userId: string
  ): Promise<Order> {
    return this.withQuantumTransaction(async (tx) => {
      // Verify order exists and user has permission
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          farm: true,
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        },
      });

      if (!order) {
        throw new NotFoundError("Order", orderId);
      }

      // Check if user is farm owner or admin
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (
        order.farm.ownerId !== userId &&
        user?.role !== "ADMIN"
      ) {
        throw new ValidationError("Unauthorized to update order", "userId");
      }

      // Update order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      this.log("info", "Order status updated", {
        orderId,
        status,
        userId,
      });

      // Send status update email for important status changes
      if (order?.customer?.email && ["FULFILLED", "COMPLETED", "CANCELLED"].includes(status)) {
        try {
          const statusMessages = {
            FULFILLED: "Your order has been shipped and is on its way! 🚚",
            COMPLETED: "Your order has been delivered! We hope you enjoy your fresh products. 🌾",
            CANCELLED: "Your order has been cancelled. If you have questions, please contact support."
          };

          await emailService.sendEmail({
            to: order.customer.email,
            subject: `Order Update - ${order.orderNumber}`,
            template: status === "FULFILLED" ? "order_shipped" : status === "COMPLETED" ? "order_delivered" : "order_confirmation",
            data: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              customerName: `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || "Valued Customer",
              status,
              statusMessage: statusMessages[status as keyof typeof statusMessages],
              orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${order.id}`,
              trackingNumber: updatedOrder.trackingNumber
            }
          });
          this.log("info", "Order status update email sent", { orderId, status });
        } catch (emailError) {
          // Don't block status update if email fails
          this.log("error", "Failed to send status update email", {
            orderId,
            status,
            error: emailError instanceof Error ? emailError.message : "Unknown error"
          });
        }
      }

      return updatedOrder;
    });
  }

  /**
   * Update order
   */
  async updateOrder(
    orderId: string,
    updates: UpdateOrderRequest,
    userId: string
  ): Promise<Order> {
    return this.withQuantumTransaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { farm: true },
      });

      if (!order) {
        throw new NotFoundError("Order", orderId);
      }

      // Check permissions
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (
        order.farm.ownerId !== userId &&
        user?.role !== "ADMIN"
      ) {
        throw new ValidationError("Unauthorized to update order", "userId");
      }

      // Update order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updates,
      });

      this.log("info", "Order updated", { orderId, userId });

      return updatedOrder;
    });
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    return this.withQuantumTransaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          farm: true,
        },
      });

      if (!order) {
        throw new NotFoundError("Order", orderId);
      }

      // Check if user can cancel (customer or farm owner)
      if (order.customerId !== userId && order.farm.ownerId !== userId) {
        throw new ValidationError("Unauthorized to cancel order", "userId");
      }

      // Check if order can be cancelled
      if (
        order.status === "COMPLETED" ||
        order.status === "CANCELLED"
      ) {
        throw new ValidationError(
          `Cannot cancel order with status: ${order.status}`,
          "status"
        );
      }

      // Restore product inventory
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantityAvailable: {
              increment: this.toNumber(item.quantity),
            },
          },
        });
      }

      // Update farm metrics
      await tx.farm.update({
        where: { id: order.farmId },
        data: {
          totalOrdersCount: {
            decrement: 1,
          },
          totalRevenueUSD: {
            decrement: this.toNumber(order.total),
          },
        },
      });

      // Cancel order
      const cancelledOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
        },
      });

      this.log("info", "Order cancelled", { orderId, userId });

      return cancelledOrder;
    });
  }

  /**
   * Get customer order history
   */
  async getCustomerOrderHistory(
    customerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ orders: OrderWithRelations[]; total: number }> {
    return this.getOrders({ customerId }, page, limit);
  }

  /**
   * Get customer orders (alias for getCustomerOrderHistory)
   * Added for test compatibility
   */
  async getCustomerOrders(
    customerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ orders: OrderWithRelations[]; total: number }> {
    return this.getCustomerOrderHistory(customerId, page, limit);
  }

  /**
   * Get farm orders
   */
  async getFarmOrders(
    farmId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ orders: OrderWithRelations[]; total: number }> {
    return this.getOrders({ farmId }, page, limit);
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(
    farmId?: string,
    customerId?: string
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
  }> {
    const where: Prisma.OrderWhereInput = {};

    if (farmId) {
      where.farmId = farmId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [orders, ordersByStatus] = await Promise.all([
      database.order.findMany({
        where,
        select: {
          total: true,
          status: true,
        },
      }),
      database.order.groupBy({
        by: ["status"],
        where,
        _count: {
          status: true,
        },
      }),
    ]);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + this.toNumber(order.total),
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statusCounts: Record<string, number> = {};
    ordersByStatus.forEach((item: any) => {
      statusCounts[item.status] = item._count.status;
    });

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus: statusCounts,
    };
  }

  // ============================================================================
  // CONVENIENCE HELPER METHODS - STATUS TRANSITIONS
  // ============================================================================

  /**
   * 🔧 CONFIRM ORDER
   * Confirms order (CONFIRMED status)
   */
  async confirmOrder(orderId: string, userId: string): Promise<Order> {
    return this.updateOrderStatus(orderId, "CONFIRMED", userId);
  }

  /**
   * 🔧 PREPARE ORDER
   * Marks order as being prepared (PREPARING status)
   */
  async prepareOrder(orderId: string, userId: string): Promise<Order> {
    return this.updateOrderStatus(orderId, "PREPARING", userId);
  }

  /**
   * 🔧 MARK ORDER READY
   * Marks order as ready for pickup/delivery (READY status)
   */
  async markOrderReady(orderId: string, userId: string): Promise<Order> {
    return this.updateOrderStatus(orderId, "READY", userId);
  }

  /**
   * 🔧 FULFILL ORDER
   * Marks order as fulfilled (picked up or delivered)
   */
  async fulfillOrder(orderId: string, userId: string): Promise<Order> {
    return this.updateOrderStatus(orderId, "FULFILLED", userId);
  }

  /**
   * 🔧 COMPLETE ORDER
   * Marks order as completed (final status)
   */
  async completeOrder(orderId: string, userId: string): Promise<Order> {
    return this.updateOrderStatus(orderId, "COMPLETED", userId);
  }

  // ============================================================================
  // TEST COMPATIBILITY - EXPOSE INTERNALS
  // ============================================================================

  /**
   * Get database instance (for testing)
   */
  get database() {
    return database;
  }

  /**
   * Get repository instance (for testing)
   * Note: This service uses direct database access, but exposes this for compatibility
   */
  get repository() {
    return this.database;
  }

  /**
   * Get cache instance (for testing)
   * Note: Cache not yet implemented, returns null for test compatibility
   */
  get cache() {
    return null;
  }

  /**
   * 🛒 CREATE ORDER FROM CHECKOUT
   * Creates orders from checkout wizard (supports multiple farms)
   */
  async createOrderFromCheckout(
    request: CheckoutOrderRequest
  ): Promise<OrderWithRelations[]> {
    return this.withQuantumTransaction(async (tx) => {
      // Validate cart items
      if (!request.cartItems || request.cartItems.length === 0) {
        throw new ValidationError("Cart is empty", "cartItems");
      }

      // Validate all products are still available
      await this.validateCheckoutItems(request.cartItems);

      // Group items by farm
      const ordersByFarm = this.groupCartItemsByFarm(request.cartItems);

      // Generate base order number
      const baseOrderNumber = this.generateCheckoutOrderNumber();

      const createdOrders: OrderWithRelations[] = [];
      let orderIndex = 0;

      // Create order for each farm
      for (const [farmId, items] of Object.entries(ordersByFarm)) {
        orderIndex++;

        // Calculate farm-specific totals
        const farmTotals = this.calculateCheckoutFarmTotals(
          items,
          request.totals
        );

        // Create order
        const order = await tx.order.create({
          data: {
            orderNumber:
              ordersByFarm.size > 1
                ? `${baseOrderNumber}-${orderIndex}`
                : baseOrderNumber,
            customerId: request.userId,
            farmId,
            status: "PENDING",
            paymentStatus: "PENDING",
            subtotal: farmTotals.subtotal,
            deliveryFee: farmTotals.deliveryFee,
            platformFee: farmTotals.platformFee,
            tax: farmTotals.tax,
            total: farmTotals.total,
            farmerAmount: farmTotals.farmerAmount,
            fulfillmentMethod: "DELIVERY",
            shippingAddress: request.shippingAddress as any,
            specialInstructions: request.deliveryInfo.deliveryInstructions,
            scheduledDate: new Date(request.deliveryInfo.preferredDate),
            scheduledTimeSlot: request.deliveryInfo.preferredTime,
          },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            farm: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
        });

        // Create order items
        await this.createCheckoutOrderItems(tx, order.id, items);

        // Update product inventory
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantityAvailable: {
                decrement: item.quantity,
              },
              purchaseCount: {
                increment: 1,
              },
            },
          });
        }

        // Update farm metrics
        await tx.farm.update({
          where: { id: farmId },
          data: {
            totalOrdersCount: {
              increment: 1,
            },
            totalRevenueUSD: {
              increment: Number(farmTotals.total),
            },
          },
        });

        createdOrders.push(order);
      }

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId: request.userId },
      });

      this.log("info", "Orders created from checkout", {
        userId: request.userId,
        orderCount: createdOrders.length,
        total: request.totals.total,
      });

      // Send order confirmation emails for all created orders
      for (const order of createdOrders) {
        if (order.customer?.email && order.items) {
          try {
            await emailService.sendOrderConfirmationEmail(
              order.customer.email,
              {
                orderId: order.id,
                orderNumber: order.orderNumber,
                customerName: `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || "Valued Customer",
                farmName: order.farm?.name || "Farm",
                items: order.items.map(item => ({
                  name: item.productName,
                  quantity: item.quantity,
                  unit: item.unit,
                  price: item.unitPrice,
                  subtotal: item.subtotal
                })),
                subtotal: order.subtotal,
                tax: order.tax,
                deliveryFee: order.deliveryFee,
                total: order.total,
                orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${order.id}`
              }
            );
            this.log("info", "Checkout order confirmation email sent", {
              orderId: order.id,
              orderNumber: order.orderNumber
            });
          } catch (emailError) {
            // Don't block checkout if email fails
            this.log("error", "Failed to send checkout confirmation email", {
              orderId: order.id,
              orderNumber: order.orderNumber,
              error: emailError instanceof Error ? emailError.message : "Unknown error"
            });
          }
        }
      }

      return createdOrders;
    });
  }

  /**
   * Validate checkout items availability
   * @private
   */
  private async validateCheckoutItems(
    items: CheckoutOrderRequest["cartItems"]
  ) {
    for (const item of items) {
      const product = await database.product.findUnique({
        where: { id: item.productId },
        select: { id: true, status: true, quantityAvailable: true },
      });

      if (!product || product.status !== "ACTIVE") {
        throw new ValidationError(
          `Product ${item.productId} is no longer available`,
          "cartItems"
        );
      }

      if (
        product.quantityAvailable !== null &&
        Number(product.quantityAvailable) < item.quantity
      ) {
        throw new ValidationError(
          `Insufficient stock for product ${item.productId}`,
          "cartItems"
        );
      }
    }
  }

  /**
   * Group cart items by farm
   * @private
   */
  private groupCartItemsByFarm(items: CheckoutOrderRequest["cartItems"]) {
    const groups = new Map<string, CheckoutOrderRequest["cartItems"]>();

    for (const item of items) {
      if (!groups.has(item.farmId)) {
        groups.set(item.farmId, []);
      }
      groups.get(item.farmId)!.push(item);
    }

    return groups;
  }

  /**
   * Calculate farm-specific totals from checkout
   * @private
   */
  private calculateCheckoutFarmTotals(
    items: CheckoutOrderRequest["cartItems"],
    totalTotals: CheckoutOrderRequest["totals"]
  ) {
    const subtotal = items.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0
    );

    // Proportional fees if multiple farms
    const proportion = subtotal / totalTotals.subtotal;
    const deliveryFee = totalTotals.deliveryFee * proportion;
    const platformFee = subtotal * 0.15; // 15% platform fee
    const tax = (subtotal + deliveryFee) * 0.08; // 8% tax
    const total = subtotal + deliveryFee + platformFee + tax;
    const farmerAmount = subtotal - platformFee;

    return {
      subtotal,
      deliveryFee,
      platformFee,
      tax,
      total,
      farmerAmount,
    };
  }

  /**
   * Create order items from checkout
   * @private
   */
  private async createCheckoutOrderItems(
    tx: Prisma.TransactionClient,
    orderId: string,
    items: CheckoutOrderRequest["cartItems"]
  ) {
    // Fetch product details
    const productIds = items.map((item: any) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, unit: true },
    });

    const productMap = new Map(products.map((p: any) => [p.id, p]));

    const orderItems = items.map((item: any) => {
      const product = productMap.get(item.productId);
      return {
        orderId,
        productId: item.productId,
        productName: product?.name || "Unknown Product",
        quantity: item.quantity,
        unit: product?.unit || "unit",
        unitPrice: item.priceAtPurchase,
        subtotal: item.priceAtPurchase * item.quantity,
        productSnapshot: product as any,
      };
    });

    await tx.orderItem.createMany({
      data: orderItems,
    });
  }

  /**
   * Get logger instance (for testing)
   * Wraps the log method for test compatibility
   */
  get logger() {
    return {
      info: (message: string, meta?: any) => this.log("info", message, meta),
      warn: (message: string, meta?: any) => this.log("warn", message, meta),
      error: (message: string, meta?: any) => this.log("error", message, meta),
    };
  }

  /**
   * Generate order number for checkout
   * @private
   */
  private generateCheckoutOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FM${timestamp}${random}`;
  }

  /**
   * Validate status transition (private helper for testing compatibility)
   * @private
   */
  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): boolean {
    // Valid transitions map
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PREPARING", "CANCELLED"],
      PREPARING: ["READY", "CANCELLED"],
      READY: ["FULFILLED", "CANCELLED"],
      FULFILLED: ["COMPLETED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }
}

// Export singleton instance
export const orderService = new OrderService();

// Export class for testing
export { OrderService };
