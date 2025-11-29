/**
 * 📦 ORDER SERVICE
 * Handles order creation, management, and tracking
 * Following divine agricultural patterns with comprehensive order management
 */

import { database } from "@/lib/database";
import type { Order, OrderItem, User, Farm } from "@prisma/client";
import { ValidationError } from "@/lib/errors/ValidationError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { BusinessLogicError } from "@/lib/errors/BusinessLogicError";

export interface CreateOrderRequest {
  customerId: string;
  farmId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  fulfillmentMethod: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";
  deliveryAddressId?: string;
  specialInstructions?: string;
}

export interface UpdateOrderRequest {
  status?:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "FULFILLED"
    | "COMPLETED"
    | "CANCELLED";
  paymentStatus?:
    | "PENDING"
    | "PROCESSING"
    | "PAID"
    | "FAILED"
    | "REFUNDED"
    | "PARTIALLY_REFUNDED";
  fulfillmentMethod?: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";
  specialInstructions?: string;
}

export interface CancelOrderRequest {
  reason: string;
  cancelledBy: string;
}

export interface GetOrdersRequest {
  page?: number;
  limit?: number;
  status?:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "FULFILLED"
    | "COMPLETED"
    | "CANCELLED";
  customerId?: string;
  farmId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface GetOrdersResponse {
  orders: OrderWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  customer: User;
  farm: Farm;
  fulfillment?: any;
}

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  totalAmount: number;
  farmerAmount: number;
}

export interface OrderStatisticsRequest {
  farmId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
}

export class OrderService {
  private readonly TAX_RATE = 0.08; // 8% tax
  private readonly PLATFORM_FEE_RATE = 0.1; // 10% platform fee
  private readonly DELIVERY_FEE = 5.0; // $5 delivery fee

  /**
   * Create new order with validation and inventory management
   */
  async createOrder(request: CreateOrderRequest): Promise<OrderWithDetails> {
    // Validate order data (skip address check for legacy API)
    const skipAddressCheck = request.deliveryAddressId === "legacy-address";
    if (!skipAddressCheck) {
      this.validateOrderData(request);
    } else {
      // Minimal validation for legacy API
      if (!request.items || request.items.length === 0) {
        throw new ValidationError(
          "Order must contain at least one item",
          "EMPTY_ORDER",
        );
      }
      for (const item of request.items) {
        if (item.quantity <= 0) {
          throw new ValidationError(
            "Quantity must be positive",
            "INVALID_QUANTITY",
          );
        }
      }
    }

    // Verify customer exists
    const customer = await database.user.findUnique({
      where: { id: request.customerId },
    });
    if (!customer) {
      throw new NotFoundError("Customer not found", "CUSTOMER_NOT_FOUND");
    }

    // Verify farm exists
    const farm = await database.farm.findUnique({
      where: { id: request.farmId },
    });
    if (!farm) {
      throw new NotFoundError("Farm not found", "FARM_NOT_FOUND");
    }

    // Verify delivery address if required (skip for legacy API)
    if (
      request.fulfillmentMethod === "DELIVERY" &&
      !request.deliveryAddressId &&
      request.deliveryAddressId !== "legacy-address"
    ) {
      throw new ValidationError(
        "Delivery address required",
        "DELIVERY_ADDRESS_REQUIRED",
      );
    }

    // Get all products and validate
    const productIds = request.items.map((item) => item.productId);
    const products = await database.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
    }

    // Validate product availability and inventory
    for (const item of request.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new NotFoundError(
          `Product ${item.productId} not found`,
          "PRODUCT_NOT_FOUND",
        );
      }
      if (product.status !== "ACTIVE") {
        throw new BusinessLogicError(
          "Product is not available",
          "PRODUCT_UNAVAILABLE",
        );
      }
      if (
        product.quantityAvailable !== null &&
        Number(product.quantityAvailable) < item.quantity
      ) {
        throw new BusinessLogicError(
          "Insufficient inventory",
          "INSUFFICIENT_INVENTORY",
        );
      }
    }

    // Calculate order totals
    const itemsWithPrices = request.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price),
      };
    });

    const totals = this.calculateOrderTotals(
      itemsWithPrices,
      request.fulfillmentMethod,
    );

    // Generate order number
    const orderNumber = this.generateOrderNumber();

    // Create order in transaction
    const order = await database.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: request.customerId,
          farmId: request.farmId,
          status: "PENDING",
          paymentStatus: "PENDING",
          fulfillmentMethod: request.fulfillmentMethod,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          platformFee: totals.platformFee,
          tax: totals.tax,
          total: totals.totalAmount,
          farmerAmount: totals.farmerAmount,
          deliveryAddressId: request.deliveryAddressId,
          specialInstructions: request.specialInstructions,
        },
        include: {
          customer: true,
          farm: true,
          items: true,
        },
      });

      // Create order items
      for (const item of itemsWithPrices) {
        const product = products.find((p) => p.id === item.productId)!;
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: item.price,
            subtotal: item.price * item.quantity,
            unit: product.unit,
          },
        });

        // Decrement product inventory
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantityAvailable: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return order as OrderWithDetails;
  }

  /**
   * Update order with status validation
   */
  async updateOrder(
    orderId: string,
    request: UpdateOrderRequest,
  ): Promise<OrderWithDetails> {
    // Get existing order
    const existingOrder = await database.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        farm: true,
        items: true,
      },
    });

    if (!existingOrder) {
      throw new NotFoundError("Order not found", "ORDER_NOT_FOUND");
    }

    // Validate status transition if status is being updated
    if (request.status && request.status !== existingOrder.status) {
      this.validateStatusTransition(existingOrder.status, request.status);
    }

    // Update order
    const updatedOrder = await database.order.update({
      where: { id: orderId },
      data: {
        status: request.status,
        paymentStatus: request.paymentStatus,
        fulfillmentMethod: request.fulfillmentMethod,
        specialInstructions: request.specialInstructions,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        farm: true,
        items: true,
      },
    });

    return updatedOrder as OrderWithDetails;
  }

  /**
   * Cancel order and restore inventory
   */
  async cancelOrder(
    orderId: string,
    request: CancelOrderRequest,
  ): Promise<OrderWithDetails> {
    // Get existing order with items
    const existingOrder = await database.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        farm: true,
        items: true,
      },
    });

    if (!existingOrder) {
      throw new NotFoundError("Order not found", "ORDER_NOT_FOUND");
    }

    if (existingOrder.status === "CANCELLED") {
      throw new BusinessLogicError(
        "Order is already cancelled",
        "ORDER_ALREADY_CANCELLED",
      );
    }

    if (existingOrder.status === "COMPLETED") {
      throw new BusinessLogicError(
        "Cannot cancel completed order",
        "CANNOT_CANCEL_COMPLETED",
      );
    }

    // Cancel order in transaction
    const cancelledOrder = await database.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelReason: request.reason,
          cancelledBy: request.cancelledBy,
          cancelledAt: new Date(),
        },
        include: {
          customer: true,
          farm: true,
          items: true,
        },
      });

      // Restore inventory for each item
      for (const item of existingOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantityAvailable: {
              increment: item.quantity,
            },
          },
        });
      }

      return updated;
    });

    return cancelledOrder as OrderWithDetails;
  }

  /**
   * Get orders with filtering and pagination
   */
  async getOrders(request: GetOrdersRequest): Promise<GetOrdersResponse> {
    const page = request.page || 1;
    const limit = request.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (request.status) {
      where.status = request.status;
    }

    if (request.customerId) {
      where.customerId = request.customerId;
    }

    if (request.farmId) {
      where.farmId = request.farmId;
    }

    if (request.startDate || request.endDate) {
      where.createdAt = {};
      if (request.startDate) {
        where.createdAt.gte = request.startDate;
      }
      if (request.endDate) {
        where.createdAt.lte = request.endDate;
      }
    }

    if (request.search) {
      where.orderNumber = {
        contains: request.search,
      };
    }

    // Get orders and total count
    const [orders, total] = await Promise.all([
      database.order.findMany({
        where,
        include: {
          customer: true,
          farm: true,
          items: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      database.order.count({ where }),
    ]);

    return {
      orders: orders as OrderWithDetails[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get order by ID with all relations
   */
  async getOrderById(orderId: string): Promise<OrderWithDetails | null> {
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        farm: true,
        items: true,
        fulfillment: true,
      },
    });

    return order as OrderWithDetails | null;
  }

  /**
   * Get order statistics for a farm
   */
  async getOrderStatistics(
    request: OrderStatisticsRequest,
  ): Promise<OrderStatistics> {
    const where: any = {
      farmId: request.farmId,
    };

    if (request.startDate || request.endDate) {
      where.createdAt = {};
      if (request.startDate) {
        where.createdAt.gte = request.startDate;
      }
      if (request.endDate) {
        where.createdAt.lte = request.endDate;
      }
    }

    const orders = await database.order.findMany({
      where,
    });

    const totalOrders = orders.length;

    // Calculate revenue from COMPLETED orders only
    const completedOrders = orders.filter(
      (order) => order.status === "COMPLETED",
    );
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + (Number(order.total) || 0),
      0,
    );

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByStatus: Record<string, number> = {};
    for (const order of orders) {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    }

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
    };
  }

  /**
   * Calculate order totals
   */
  calculateOrderTotals(
    items: Array<{ productId: string; quantity: number; price: number }>,
    fulfillmentMethod: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP",
  ): OrderTotals {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const deliveryFee =
      fulfillmentMethod === "DELIVERY" ? this.DELIVERY_FEE : 0;
    const platformFee =
      Math.round(subtotal * this.PLATFORM_FEE_RATE * 100) / 100;

    // For delivery orders, calculate tax on subtotal + delivery fee
    // For pickup orders, calculate tax on subtotal only
    const taxBase =
      fulfillmentMethod === "DELIVERY" ? subtotal + deliveryFee : subtotal;
    const tax = Math.round(taxBase * this.TAX_RATE * 100) / 100;
    const totalAmount =
      Math.round((subtotal + deliveryFee + platformFee + tax) * 100) / 100;
    const farmerAmount = Math.round((subtotal - platformFee) * 100) / 100;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      platformFee,
      tax,
      totalAmount,
      farmerAmount,
    };
  }

  /**
   * Validate order data
   */
  validateOrderData(data: CreateOrderRequest): void {
    if (!data.items || data.items.length === 0) {
      throw new ValidationError(
        "Order must contain at least one item",
        "EMPTY_ORDER",
      );
    }

    for (const item of data.items) {
      if (item.quantity <= 0) {
        throw new ValidationError(
          "Quantity must be positive",
          "INVALID_QUANTITY",
        );
      }
    }

    if (data.fulfillmentMethod === "DELIVERY" && !data.deliveryAddressId) {
      throw new ValidationError(
        "Delivery address required",
        "DELIVERY_ADDRESS_REQUIRED",
      );
    }
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): void {
    const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PREPARING", "CANCELLED"],
      PREPARING: ["READY", "CANCELLED"],
      READY: ["FULFILLED", "CANCELLED"],
      FULFILLED: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BusinessLogicError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        "INVALID_STATUS_TRANSITION",
      );
    }
  }

  /**
   * Generate unique order number
   */
  generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `ORD-${year}${month}${day}-${random}`;
  }

  // ==================== STATIC WRAPPER METHODS FOR BACKWARD COMPATIBILITY ====================

  /**
   * Static wrapper for createOrder - creates instance and delegates
   */
  static async createOrder(input: CreateOrderInput): Promise<OrderWithDetails> {
    const service = new OrderService();

    // Convert old CreateOrderInput format to new CreateOrderRequest format
    const request: CreateOrderRequest = {
      customerId: input.userId,
      farmId: input.farmId,
      items: input.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      fulfillmentMethod: input.fulfillmentMethod,
      // For legacy API, use a placeholder address ID for delivery
      deliveryAddressId:
        input.fulfillmentMethod === "DELIVERY" ? "legacy-address" : undefined,
      specialInstructions: input.notes,
    };

    return service.createOrder(request);
  }

  /**
   * Static wrapper for getOrderById
   */
  static async getOrderById(orderId: string): Promise<OrderWithDetails | null> {
    const service = new OrderService();
    return service.getOrderById(orderId);
  }

  /**
   * Static wrapper for updateOrderStatus
   */
  static async updateOrderStatus(
    orderId: string,
    status:
      | "PENDING"
      | "CONFIRMED"
      | "PREPARING"
      | "READY"
      | "FULFILLED"
      | "COMPLETED"
      | "CANCELLED",
  ): Promise<Order> {
    const service = new OrderService();
    const result = await service.updateOrder(orderId, { status });
    return result as Order;
  }

  /**
   * Static wrapper for getUserOrders
   */
  static async getUserOrders(userId: string): Promise<OrderWithDetails[]> {
    const service = new OrderService();
    const result = await service.getOrders({ customerId: userId });
    return result.orders;
  }

  /**
   * Static wrapper for getFarmOrders
   */
  static async getFarmOrders(farmId: string): Promise<OrderWithDetails[]> {
    const service = new OrderService();
    const result = await service.getOrders({ farmId });
    return result.orders;
  }
}

// Legacy interface for backward compatibility
export interface CreateOrderInput {
  userId: string;
  farmId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    unit: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  fulfillmentMethod: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";
  notes?: string;
}
