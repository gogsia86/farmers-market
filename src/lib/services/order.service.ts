/**
 * 📦 ORDER SERVICE - CONSOLIDATED IMPLEMENTATION
 *
 * Unified order management service combining best features from:
 * - Standard service (production-proven patterns)
 * - Refactored service (repository pattern, authorization)
 * - Feature module (advanced analytics, validation warnings, agricultural features)
 *
 * Architecture:
 * - Repository pattern for database abstraction
 * - Authorization checks for secure operations
 * - Validation with errors AND warnings for better UX
 * - Advanced analytics and statistics
 * - Optional agricultural consciousness features
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import { database } from "@/lib/database";
import type { Order, OrderItem, User, Farm } from "@prisma/client";
import { ValidationError as AppValidationError } from "@/lib/errors/ValidationError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { BusinessLogicError } from "@/lib/errors/BusinessLogicError";

// ============================================
// CONFIGURATION
// ============================================

const FEATURES = {
  agriculturalConsciousness:
    process.env.ENABLE_AGRICULTURAL_FEATURES === "true",
  seasonalValidation: process.env.ENABLE_SEASONAL_VALIDATION === "true",
  advancedAnalytics: true, // Always enabled
  validationWarnings: true, // Always enabled
};

// ============================================
// TYPE DEFINITIONS
// ============================================

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
  scheduledDate?: Date;
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
  scheduledDate?: Date;
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
  fulfillmentMethod?: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";
}

export interface GetOrdersResponse {
  orders: OrderWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  customer: User;
  farm: Farm;
  fulfillment?: any;
  deliveryAddress?: any;
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
  farmId?: string;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByFulfillmentMethod?: Record<string, number>;
  revenueByMonth?: Array<{
    month: string;
    revenue: number;
    orderCount: number;
    averageOrderValue: number;
  }>;
  topProducts?: Array<{
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
  }>;
  topCustomers?: Array<{
    customerName: string;
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: Date;
  }>;
}

export interface OrderValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: "low" | "medium" | "high";
  suggestion?: string;
}

export interface ValidateOrderResult {
  isValid: boolean;
  errors: OrderValidationError[];
  warnings: ValidationWarning[];
}

export interface CartToOrderRequest {
  cartId: string;
  customerId: string;
  farmId: string;
  fulfillmentMethod: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";
  deliveryAddressId?: string;
  scheduledDate?: Date;
  scheduledTimeSlot?: string;
  specialInstructions?: string;
}

export interface SeasonalOrderAlignment {
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  freshnessFactor: number;
  biodynamicScore: number;
}

export interface OrderConsciousness {
  orderId: string;
  currentState: string;
  previousStates: string[];
  transitionCount: number;
  stateHistory: Array<{ status: string; timestamp: Date }>;
  agriculturalAlignment?: {
    seasonalAlignment: SeasonalOrderAlignment;
    quantumCoherence: number;
    divineScore: number;
  };
}

// Legacy support interface
export interface CreateOrderInput {
  userId: string;
  farmId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  fulfillmentMethod: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";
  deliveryAddressId?: string;
  notes?: string;
}

// ============================================
// ORDER SERVICE CLASS
// ============================================

export class OrderService {
  private readonly TAX_RATE = 0.08; // 8% tax
  private readonly PLATFORM_FEE_RATE = 0.1; // 10% platform fee
  private readonly DELIVERY_FEE = 5.0; // $5 delivery fee

  // ===== CORE CRUD OPERATIONS =====

  /**
   * Create a new order with comprehensive validation
   * Includes validation warnings for better UX
   */
  async createOrder(
    request: CreateOrderRequest,
    _currentUserId?: string,
  ): Promise<OrderWithDetails> {
    // Enhanced validation with warnings
    const validation = await this.validateOrderWithWarnings(request);

    if (!validation.isValid) {
      const firstError = validation.errors[0];
      if (!firstError) {
        throw new AppValidationError(
          "order",
          "Order validation failed",
          undefined,
          { allErrors: validation.errors },
        );
      }
      throw new AppValidationError(
        firstError.field,
        firstError.message,
        undefined,
        { allErrors: validation.errors },
      );
    }

    // Log warnings if present (don't block order)
    if (validation.warnings.length > 0 && FEATURES.validationWarnings) {
      console.warn("⚠️ Order validation warnings:", validation.warnings);
    }

    // Calculate order totals
    const totals = await this.calculateOrderTotals(
      request.items,
      request.fulfillmentMethod,
      request.farmId,
    );

    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Create order in transaction
    const order = await database.$transaction(async (tx) => {
      // Create the order
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
          scheduledDate: request.scheduledDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          customer: true,
          farm: true,
          items: true,
        },
      });

      // Create order items
      for (const item of request.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) continue;

        const unitPrice = Number(product.price);
        const subtotal = unitPrice * item.quantity;

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            unit: product.unit,
            unitPrice,
            subtotal,
            productSnapshot: product as any,
          },
        });

        // Decrement inventory
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantityAvailable: {
              decrement: item.quantity,
            },
          },
        });
      }

      // TODO: Create order status history entry when table is added to schema
      // await tx.orderStatusHistory.create({
      //   data: {
      //     orderId: newOrder.id,
      //     status: "PENDING",
      //     createdAt: new Date(),
      //   },
      // });

      return newOrder;
    });

    return order as OrderWithDetails;
  }

  /**
   * Get order by ID with full relations
   */
  async getOrderById(orderId: string): Promise<OrderWithDetails | null> {
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
    const order = await database.order.findFirst({
      where: { orderNumber },
      include: {
        customer: true,
        farm: true,
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
   * Update order with authorization checks
   */
  async updateOrder(
    orderId: string,
    updates: UpdateOrderRequest,
    currentUserId?: string,
  ): Promise<OrderWithDetails> {
    const existingOrder = await this.getOrderById(orderId);

    if (!existingOrder) {
      throw new NotFoundError("Order", orderId);
    }

    // Authorization check
    if (currentUserId) {
      const isCustomer = existingOrder.customerId === currentUserId;
      const isFarmOwner = existingOrder.farm.ownerId === currentUserId;

      if (!isCustomer && !isFarmOwner && currentUserId !== "admin") {
        throw new AppValidationError(
          "authorization",
          "You don't have permission to update this order",
        );
      }
    }

    // Validate status transition if status is being updated
    if (updates.status && updates.status !== existingOrder.status) {
      this.validateStatusTransition(
        existingOrder.status as any,
        updates.status,
      );
    }

    const updatedOrder = await database.order.update({
      where: { id: orderId },
      data: {
        status: updates.status,
        paymentStatus: updates.paymentStatus,
        fulfillmentMethod: updates.fulfillmentMethod,
        specialInstructions: updates.specialInstructions,
        scheduledDate: updates.scheduledDate,
        updatedAt: new Date(),
        confirmedAt: updates.status === "CONFIRMED" ? new Date() : undefined,
        fulfilledAt: updates.status === "FULFILLED" ? new Date() : undefined,
        completedAt: updates.status === "COMPLETED" ? new Date() : undefined,
      },
      include: {
        customer: true,
        farm: true,
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

  /**
   * Cancel order with authorization and inventory restoration
   */
  async cancelOrder(
    orderId: string,
    request: CancelOrderRequest,
    currentUserId?: string,
  ): Promise<OrderWithDetails> {
    const existingOrder = await this.getOrderById(orderId);

    if (!existingOrder) {
      throw new NotFoundError("Order", orderId);
    }

    // Authorization check
    if (currentUserId) {
      const isCustomer = existingOrder.customerId === currentUserId;
      const isFarmOwner = existingOrder.farm.ownerId === currentUserId;

      if (!isCustomer && !isFarmOwner && currentUserId !== "admin") {
        throw new AppValidationError(
          "authorization",
          "You don't have permission to cancel this order",
        );
      }
    }

    // Check if order can be cancelled
    const cancellableStatuses = ["PENDING", "CONFIRMED", "PREPARING"];
    if (!cancellableStatuses.includes(existingOrder.status)) {
      throw new BusinessLogicError(
        `Cannot cancel order in ${existingOrder.status} status`,
        "CANCEL_ORDER",
        { currentStatus: existingOrder.status },
      );
    }

    const cancelledOrder = await database.$transaction(async (tx) => {
      // Restore inventory
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

      // Update order
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
          customer: true,
          farm: true,
          items: {
            include: {
              product: true,
            },
          },
          deliveryAddress: true,
          fulfillment: true,
        },
      });

      // TODO: Update status history when table is added to schema
      // await tx.orderStatusHistory.updateMany({
      //   where: { orderId },
      //   data: {
      //     status: "CANCELLED",
      //     updatedAt: new Date(),
      //   },
      // });

      return updated;
    });

    return cancelledOrder as OrderWithDetails;
  }

  /**
   * List orders with advanced filtering and pagination
   */
  async getOrders(request: GetOrdersRequest): Promise<GetOrdersResponse> {
    const page = request.page || 1;
    const limit = request.limit || 20;
    const skip = (page - 1) * limit;

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

    if (request.fulfillmentMethod) {
      where.fulfillmentMethod = request.fulfillmentMethod;
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
      where.OR = [
        { orderNumber: { contains: request.search, mode: "insensitive" } },
        {
          customer: {
            firstName: { contains: request.search, mode: "insensitive" },
          },
        },
        {
          customer: {
            lastName: { contains: request.search, mode: "insensitive" },
          },
        },
        { farm: { name: { contains: request.search, mode: "insensitive" } } },
      ];
    }

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
          deliveryAddress: true,
          fulfillment: true,
        },
      }),
      database.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      orders: orders as OrderWithDetails[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  // ===== CONVENIENCE METHODS =====

  /**
   * Get orders for a specific customer
   */
  async getCustomerOrders(
    customerId: string,
    page = 1,
    limit = 20,
  ): Promise<GetOrdersResponse> {
    return this.getOrders({ customerId, page, limit });
  }

  /**
   * Get orders for a specific farm
   */
  async getFarmOrders(
    farmId: string,
    page = 1,
    limit = 20,
  ): Promise<GetOrdersResponse> {
    return this.getOrders({ farmId, page, limit });
  }

  /**
   * Get orders ready for fulfillment
   */
  async getOrdersForFulfillment(farmId: string): Promise<OrderWithDetails[]> {
    const result = await this.getOrders({
      farmId,
      status: "READY",
      limit: 100,
    });
    return result.orders;
  }

  /**
   * Get scheduled orders for a specific date
   */
  async getScheduledOrders(
    farmId: string,
    date: Date,
  ): Promise<OrderWithDetails[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.getOrders({
      farmId,
      startDate: startOfDay,
      endDate: endOfDay,
      limit: 100,
    });

    return result.orders;
  }

  /**
   * Complete an order (set status to COMPLETED)
   */
  async completeOrder(
    orderId: string,
    currentUserId?: string,
  ): Promise<OrderWithDetails> {
    return this.updateOrder(orderId, { status: "COMPLETED" }, currentUserId);
  }

  // ===== CART TO ORDER CONVERSION (FROM FEATURE MODULE) =====

  /**
   * Transform cart items into an order
   * This is a convenience method for checkout flows
   */
  async transformCartToOrder(
    request: CartToOrderRequest,
  ): Promise<CreateOrderRequest> {
    const cartItems = await database.cartItem.findMany({
      where: {
        id: request.cartId,
      },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      throw new AppValidationError("cart", "Cart is empty");
    }

    const orderItems = cartItems.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
    }));

    const orderRequest: CreateOrderRequest = {
      customerId: request.customerId,
      farmId: request.farmId,
      items: orderItems,
      fulfillmentMethod: request.fulfillmentMethod,
      deliveryAddressId: request.deliveryAddressId,
      specialInstructions: request.specialInstructions,
      scheduledDate: request.scheduledDate,
    };

    // Clear cart after conversion
    // Delete cart items after successful conversion
    await database.cartItem.deleteMany({
      where: {
        id: request.cartId,
      },
    });

    return orderRequest;
  }

  // ===== STATISTICS & ANALYTICS =====

  /**
   * Get comprehensive order statistics
   * Includes advanced analytics from feature module
   */
  async getOrderStatistics(
    request: OrderStatisticsRequest,
  ): Promise<OrderStatistics> {
    const where: any = {};

    if (request.farmId) {
      where.farmId = request.farmId;
    }

    if (request.customerId) {
      where.customerId = request.customerId;
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

    const orders = await database.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByStatus: Record<string, number> = {};
    const ordersByFulfillmentMethod: Record<string, number> = {};

    for (const order of orders) {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
      ordersByFulfillmentMethod[order.fulfillmentMethod] =
        (ordersByFulfillmentMethod[order.fulfillmentMethod] || 0) + 1;
    }

    const stats: OrderStatistics = {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      ordersByFulfillmentMethod,
    };

    // Add advanced analytics if enabled
    if (FEATURES.advancedAnalytics) {
      stats.revenueByMonth = this.calculateMonthlyRevenue(orders);
      stats.topProducts = this.calculateTopProducts(orders);
      stats.topCustomers = await this.calculateTopCustomers(orders);
    }

    return stats;
  }

  /**
   * Calculate monthly revenue breakdown
   */
  private calculateMonthlyRevenue(orders: any[]): Array<{
    month: string;
    revenue: number;
    orderCount: number;
    averageOrderValue: number;
  }> {
    const monthlyData = new Map<string, { revenue: number; count: number }>();

    for (const order of orders) {
      const month = new Date(order.createdAt).toISOString().slice(0, 7); // YYYY-MM

      const existing = monthlyData.get(month) || { revenue: 0, count: 0 };
      existing.revenue += order.total;
      existing.count += 1;
      monthlyData.set(month, existing);
    }

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orderCount: data.count,
        averageOrderValue: data.revenue / data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Calculate top products by revenue and quantity
   */
  private calculateTopProducts(orders: any[]): Array<{
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
  }> {
    const productData = new Map<
      string,
      { name: string; quantity: number; revenue: number; count: number }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const existing = productData.get(item.productId) || {
          name: item.productName,
          quantity: 0,
          revenue: 0,
          count: 0,
        };

        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
        existing.count += 1;
        productData.set(item.productId, existing);
      }
    }

    return Array.from(productData.values())
      .map((data) => ({
        productName: data.name,
        totalQuantity: data.quantity,
        totalRevenue: data.revenue,
        orderCount: data.count,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }

  /**
   * Calculate top customers by spending
   */
  private async calculateTopCustomers(orders: any[]): Promise<
    Array<{
      customerName: string;
      totalOrders: number;
      totalSpent: number;
      averageOrderValue: number;
      lastOrderDate: Date;
    }>
  > {
    const customerData = new Map<
      string,
      { name: string; orders: number; spent: number; lastOrder: Date }
    >();

    for (const order of orders) {
      const existing = customerData.get(order.customerId) || {
        name: "",
        orders: 0,
        spent: 0,
        lastOrder: order.createdAt,
      };

      existing.orders += 1;
      existing.spent += order.total;
      if (order.createdAt > existing.lastOrder) {
        existing.lastOrder = order.createdAt;
      }
      customerData.set(order.customerId, existing);
    }

    // Fetch customer names
    const customerIds = Array.from(customerData.keys());
    const customers = await database.user.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    const customerMap = new Map(
      customers.map((c) => [c.id, `${c.firstName} ${c.lastName}`]),
    );

    return Array.from(customerData.entries())
      .map(([customerId, data]) => ({
        customerName: customerMap.get(customerId) || "Unknown",
        totalOrders: data.orders,
        totalSpent: data.spent,
        averageOrderValue: data.spent / data.orders,
        lastOrderDate: data.lastOrder,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }

  // ===== VALIDATION =====

  /**
   * Enhanced validation with warnings (from feature module)
   * Returns both errors (blockers) and warnings (suggestions)
   */
  async validateOrderWithWarnings(
    request: CreateOrderRequest,
  ): Promise<ValidateOrderResult> {
    const errors: OrderValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate customer
    const customer = await database.user.findUnique({
      where: { id: request.customerId },
    });

    if (!customer) {
      errors.push({
        field: "customerId",
        message: "Customer not found",
        code: "CUSTOMER_NOT_FOUND",
      });
    }

    // Validate farm
    const farm = await database.farm.findUnique({
      where: { id: request.farmId },
    });

    if (!farm) {
      errors.push({
        field: "farmId",
        message: "Farm not found",
        code: "FARM_NOT_FOUND",
      });
    } else if (farm.status !== "ACTIVE") {
      errors.push({
        field: "farmId",
        message: "Farm is not active",
        code: "FARM_INACTIVE",
      });
    }

    // Validate items
    if (!request.items || request.items.length === 0) {
      errors.push({
        field: "items",
        message: "Order must contain at least one item",
        code: "EMPTY_ORDER",
      } as OrderValidationError);
    }

    // Validate each item
    for (let i = 0; i < (request.items || []).length; i++) {
      const item = request.items[i];
      if (!item) continue;

      const product = await database.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        errors.push({
          field: `items[${i}].productId`,
          message: `Product with ID ${item.productId} not found`,
          code: "INVALID_PRODUCT",
        } as OrderValidationError);
        continue;
      }

      if (product.farmId !== request.farmId) {
        errors.push({
          field: `items[${i}].productId`,
          message: `Product does not belong to specified farm`,
          code: "PRODUCT_FARM_MISMATCH",
        } as OrderValidationError);
      }

      if (product.status !== "ACTIVE") {
        errors.push({
          field: `items[${i}].productId`,
          message: `Product ${product.name} is not available`,
          code: "PRODUCT_UNAVAILABLE",
        } as OrderValidationError);
      }

      if (item.quantity <= 0) {
        errors.push({
          field: `items[${i}].quantity`,
          message: "Quantity must be greater than 0",
          code: "INVALID_QUANTITY",
        } as OrderValidationError);
      }

      if (
        product.quantityAvailable &&
        Number(product.quantityAvailable) < item.quantity
      ) {
        errors.push({
          field: `items[${i}].quantity`,
          message: `Insufficient inventory for ${product.name}. Available: ${product.quantityAvailable}`,
          code: "INSUFFICIENT_INVENTORY",
        } as OrderValidationError);
      }

      // Warnings for low stock
      if (
        product.quantityAvailable &&
        Number(product.quantityAvailable) > 0 &&
        Number(product.quantityAvailable) < item.quantity * 1.5 &&
        FEATURES.validationWarnings
      ) {
        warnings.push({
          field: `items[${i}].productId`,
          message: `Low stock for ${product.name}. Consider ordering soon.`,
          severity: "medium",
          suggestion: `Only ${product.quantityAvailable} units available`,
        });
      }
    }

    // Validate delivery address if required
    if (request.fulfillmentMethod === "DELIVERY") {
      if (!request.deliveryAddressId) {
        errors.push({
          field: "deliveryAddressId",
          message: "Delivery address is required for delivery orders",
          code: "DELIVERY_ADDRESS_REQUIRED",
        } as OrderValidationError);
      } else {
        const address = await database.address.findUnique({
          where: { id: request.deliveryAddressId },
        });

        if (!address) {
          errors.push({
            field: "deliveryAddressId",
            message: "Delivery address not found",
            code: "ADDRESS_NOT_FOUND",
          } as OrderValidationError);
        } else if (address.userId !== request.customerId) {
          errors.push({
            field: "deliveryAddressId",
            message: "Delivery address does not belong to customer",
            code: "ADDRESS_OWNERSHIP_MISMATCH",
          } as OrderValidationError);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
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
      READY: ["FULFILLED"],
      FULFILLED: ["COMPLETED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BusinessLogicError(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
        "UPDATE_ORDER_STATUS",
        { currentStatus, newStatus },
      );
    }
  }

  /**
   * Calculate order totals
   */
  async calculateOrderTotals(
    items: Array<{ productId: string; quantity: number }>,
    fulfillmentMethod: string,
    _farmId: string,
  ): Promise<OrderTotals> {
    let subtotal = 0;

    for (const item of items) {
      const product = await database.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) continue;

      subtotal += Number(product.price) * item.quantity;
    }

    // Check if farm has custom delivery fee (for future use)
    // const farm = await database.farm.findUnique({
    //   where: { id: farmId },
    // });

    const deliveryFee =
      fulfillmentMethod === "DELIVERY" ? this.DELIVERY_FEE : 0;

    const platformFee = subtotal * this.PLATFORM_FEE_RATE;

    const taxBase = subtotal + deliveryFee;
    const tax = taxBase * this.TAX_RATE;

    const totalAmount = subtotal + deliveryFee + platformFee + tax;

    const farmerAmount = totalAmount - platformFee - deliveryFee;

    return {
      subtotal,
      deliveryFee,
      platformFee,
      tax,
      totalAmount,
      farmerAmount,
    };
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const prefix = "ORD";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `${prefix}-${timestamp}-${random}`;

    // Check uniqueness
    const existing = await database.order.findFirst({
      where: { orderNumber },
    });

    if (existing) {
      // Recurse if collision (extremely rare)
      return this.generateOrderNumber();
    }

    return orderNumber;
  }

  // ===== AGRICULTURAL CONSCIOUSNESS (OPTIONAL) =====

  /**
   * Get agricultural consciousness for an order
   * Only available when ENABLE_AGRICULTURAL_FEATURES=true
   */
  async getOrderConsciousness(
    orderId: string,
  ): Promise<OrderConsciousness | null> {
    if (!FEATURES.agriculturalConsciousness) {
      return null;
    }

    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new NotFoundError("Order", orderId);
    }

    // Status history tracking would go here
    // Note: orderStatusHistory table not yet in schema
    const statusHistory: any[] = [];

    const seasonalAlignment = await this.calculateSeasonalAlignment(
      order.items,
    );
    const quantumCoherence = this.calculateQuantumCoherence(order);
    const divineScore = this.calculateDivineScore(
      seasonalAlignment,
      quantumCoherence,
      order.status,
    );

    return {
      orderId: order.id,
      currentState: order.status,
      previousStates: statusHistory.map((h) => h.status),
      transitionCount: statusHistory.length,
      stateHistory: statusHistory.map((h) => ({
        status: h.status,
        timestamp: h.createdAt,
      })),
      agriculturalAlignment: {
        seasonalAlignment,
        quantumCoherence,
        divineScore,
      },
    };
  }

  /**
   * Calculate seasonal alignment for order items
   */
  private async calculateSeasonalAlignment(
    orderItems: any[],
  ): Promise<SeasonalOrderAlignment> {
    const currentMonth = new Date().getMonth();
    const season = this.getSeasonFromMonth(currentMonth);

    // Check if products are in season
    const seasonalProducts = orderItems.filter((item) => {
      const tags = item.product?.tags || [];
      return tags.includes(season.toLowerCase());
    });

    const seasonalRatio = seasonalProducts.length / orderItems.length;

    const freshnessFactor = seasonalRatio;
    const biodynamicScore = seasonalRatio * 100;

    return {
      season,
      freshnessFactor,
      biodynamicScore,
    };
  }

  /**
   * Get season from month
   */
  private getSeasonFromMonth(
    month: number,
  ): "SPRING" | "SUMMER" | "FALL" | "WINTER" {
    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }

  /**
   * Calculate quantum coherence
   */
  private calculateQuantumCoherence(order: any): number {
    let coherence = 0;

    // Base coherence on order progression
    const statusProgression: Record<string, number> = {
      PENDING: 0.2,
      CONFIRMED: 0.4,
      PREPARING: 0.6,
      READY: 0.8,
      FULFILLED: 0.9,
      COMPLETED: 1.0,
      CANCELLED: 0.0,
    };

    coherence = statusProgression[order.status] || 0;

    return coherence;
  }

  /**
   * Calculate divine score
   */
  private calculateDivineScore(
    seasonalAlignment: SeasonalOrderAlignment,
    quantumCoherence: number,
    status: string,
  ): number {
    const seasonalScore = seasonalAlignment.biodynamicScore / 100;
    const coherenceScore = quantumCoherence;

    const statusScore: Record<string, number> = {
      PENDING: 0.5,
      CONFIRMED: 0.6,
      PREPARING: 0.7,
      READY: 0.8,
      FULFILLED: 0.9,
      COMPLETED: 1.0,
      CANCELLED: 0.0,
    };

    const score =
      seasonalScore * 0.4 +
      coherenceScore * 0.3 +
      (statusScore[status] || 0) * 0.3;

    return score * 100; // Return as percentage
  }

  // ===== STATIC HELPER METHODS (LEGACY SUPPORT) =====

  /**
   * Static helper for creating orders (backward compatibility)
   */
  static async createOrder(data: CreateOrderInput): Promise<OrderWithDetails> {
    const service = new OrderService();
    const request: CreateOrderRequest = {
      customerId: data.userId,
      farmId: data.farmId,
      items: data.items,
      fulfillmentMethod: data.fulfillmentMethod,
      deliveryAddressId: data.deliveryAddressId,
      specialInstructions: data.notes,
    };
    return service.createOrder(request);
  }

  /**
   * Static helper for getting order by ID
   */
  static async getOrderById(orderId: string): Promise<OrderWithDetails | null> {
    const service = new OrderService();
    return service.getOrderById(orderId);
  }

  /**
   * Static helper for updating order status
   */
  static async updateOrderStatus(
    orderId: string,
    status: UpdateOrderRequest["status"],
    _currentUserId?: string,
  ): Promise<OrderWithDetails> {
    const service = new OrderService();
    return service.updateOrder(orderId, { status }, _currentUserId);
  }

  /**
   * Static helper for getting user orders
   */
  static async getUserOrders(userId: string): Promise<GetOrdersResponse> {
    const service = new OrderService();
    return service.getCustomerOrders(userId);
  }

  /**
   * Static helper for getting farm orders
   */
  static async getFarmOrders(farmId: string): Promise<GetOrdersResponse> {
    const service = new OrderService();
    return service.getFarmOrders(farmId);
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const orderService = new OrderService();
