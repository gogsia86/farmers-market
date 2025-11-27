// ============================================================================
// DIVINE ORDER SERVICE - QUANTUM AGRICULTURAL ORDER PROCESSING
// ============================================================================
// Agricultural consciousness in every transaction
// From cart manifestation to harvest delivery
// ============================================================================

import { database } from "@/lib/database";
import { Prisma } from "@prisma/client";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  FulfillmentMethod,
} from "@prisma/client";
import type {
  CreateOrderRequest,
  UpdateOrderRequest,
  CancelOrderRequest,
  OrderWithRelations,
  OrderFilterOptions,
  PaginatedOrdersResponse,
  OrderStatistics,
  OrderValidationResult,
  OrderValidationError as OrderValidationErrorType,
  OrderValidationWarning,
  CartToOrderRequest,
  OrderConsciousness,
  SeasonalOrderAlignment,
} from "../types";

// ============================================================================
// DIVINE ORDER SERVICE CLASS
// ============================================================================

export class OrderService {
  /**
   * Create Order - Manifest Agricultural Commerce
   * Transforms customer intent into quantum order reality
   */
  async createOrder(request: CreateOrderRequest): Promise<OrderWithRelations> {
    // Validate order request
    const validation = await this.validateOrderData(request);
    if (!validation.isValid) {
      throw new OrderValidationError(
        "Order validation failed",
        validation.errors,
      );
    }

    // Calculate order totals with agricultural consciousness
    const orderCalculation = await this.calculateOrderTotals(request);

    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Create order in transaction to ensure quantum coherence
    const order = await database.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: request.customerId,
          farmId: request.farmId,
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotal: new Prisma.Decimal(orderCalculation.subtotal),
          deliveryFee: new Prisma.Decimal(orderCalculation.deliveryFee),
          platformFee: new Prisma.Decimal(orderCalculation.platformFee),
          tax: new Prisma.Decimal(orderCalculation.tax),
          total: new Prisma.Decimal(orderCalculation.total),
          farmerAmount: new Prisma.Decimal(orderCalculation.farmerAmount),
          fulfillmentMethod: request.fulfillmentMethod,
          deliveryAddressId: request.deliveryAddressId,
          scheduledDate: request.scheduledDate,
          scheduledTimeSlot: request.scheduledTimeSlot,
          specialInstructions: request.specialInstructions,
          createdAt: new Date(),
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
        },
      });

      // Create order items
      for (const item of request.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const unitPrice = item.unitPrice ?? Number(product.price);
        const subtotal = unitPrice * item.quantity;

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            productName: product.name,
            quantity: new Prisma.Decimal(item.quantity),
            unit: product.unit,
            unitPrice: new Prisma.Decimal(unitPrice),
            subtotal: new Prisma.Decimal(subtotal),
            productSnapshot: product as any,
          },
        });

        // Update product inventory if tracked
        if (product.trackInventory && product.quantityAvailable !== null) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantityAvailable: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Create fulfillment record
      await tx.fulfillment.create({
        data: {
          orderId: newOrder.id,
          status: "PENDING",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return newOrder;
    });

    // Return complete order with relations
    return this.getOrderById(order.id) as Promise<OrderWithRelations>;
  }

  /**
   * Get Order by ID - Quantum Retrieval
   */
  async getOrderById(orderId: string): Promise<OrderWithRelations | null> {
    return await database.order.findUnique({
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
        reviews: true,
        messages: true,
      },
    });
  }

  /**
   * Get Order by Order Number
   */
  async getOrderByNumber(
    orderNumber: string,
  ): Promise<OrderWithRelations | null> {
    return await database.order.findUnique({
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
        reviews: true,
        messages: true,
      },
    });
  }

  /**
   * Get Orders with Filters - Divine Query System
   */
  async getOrders(
    filters: OrderFilterOptions,
  ): Promise<PaginatedOrdersResponse> {
    const {
      customerId,
      farmId,
      status,
      paymentStatus,
      fulfillmentMethod,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      searchQuery,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      pageSize = 20,
    } = filters;

    // Build where clause with agricultural consciousness
    const where: Prisma.OrderWhereInput = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (farmId) {
      where.farmId = farmId;
    }

    if (status) {
      where.status = Array.isArray(status) ? { in: status } : status;
    }

    if (paymentStatus) {
      where.paymentStatus = Array.isArray(paymentStatus)
        ? { in: paymentStatus }
        : paymentStatus;
    }

    if (fulfillmentMethod) {
      where.fulfillmentMethod = Array.isArray(fulfillmentMethod)
        ? { in: fulfillmentMethod }
        : fulfillmentMethod;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    if (minTotal || maxTotal) {
      where.total = {};
      if (minTotal) {
        where.total.gte = new Prisma.Decimal(minTotal);
      }
      if (maxTotal) {
        where.total.lte = new Prisma.Decimal(maxTotal);
      }
    }

    if (searchQuery) {
      where.OR = [
        { orderNumber: { contains: searchQuery, mode: "insensitive" } },
        {
          customer: {
            firstName: { contains: searchQuery, mode: "insensitive" },
          },
        },
        {
          customer: {
            lastName: { contains: searchQuery, mode: "insensitive" },
          },
        },
        { farm: { name: { contains: searchQuery, mode: "insensitive" } } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Execute quantum query
    const [orders, totalCount] = await Promise.all([
      database.order.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
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
          reviews: true,
          messages: true,
        },
      }),
      database.order.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      orders,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
      filters,
    };
  }

  /**
   * Update Order - Quantum State Transition
   */
  async updateOrder(
    orderId: string,
    updates: UpdateOrderRequest,
  ): Promise<OrderWithRelations> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Validate state transition if status is being updated
    if (updates.status) {
      this.validateStatusTransition(order.status, updates.status);
    }

    // Update order
    const updatedOrder = await database.order.update({
      where: { id: orderId },
      data: {
        ...updates,
        updatedAt: new Date(),
        // Set timestamps based on status
        ...(updates.status === "CONFIRMED" && { confirmedAt: new Date() }),
        ...(updates.status === "FULFILLED" && { fulfilledAt: new Date() }),
        ...(updates.status === "COMPLETED" && { completedAt: new Date() }),
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
        reviews: true,
        messages: true,
      },
    });

    return updatedOrder;
  }

  /**
   * Cancel Order - Quantum Cancellation
   */
  async cancelOrder(request: CancelOrderRequest): Promise<OrderWithRelations> {
    const order = await this.getOrderById(request.orderId);
    if (!order) {
      throw new Error(`Order not found: ${request.orderId}`);
    }

    // Validate cancellation is allowed
    if (!this.canCancelOrder(order.status)) {
      throw new Error(`Cannot cancel order in ${order.status} status`);
    }

    // Cancel order in transaction to restore inventory
    const cancelledOrder = await database.$transaction(async (tx) => {
      // Restore inventory for all items
      for (const item of order.items) {
        if (item.product.trackInventory) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantityAvailable: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // Update order status
      const updated = await tx.order.update({
        where: { id: request.orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelledBy: request.cancelledBy,
          cancelReason: request.cancelReason,
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
          reviews: true,
          messages: true,
        },
      });

      // Update fulfillment status
      await tx.fulfillment.updateMany({
        where: { orderId: request.orderId },
        data: {
          status: "FAILED",
          updatedAt: new Date(),
        },
      });

      return updated;
    });

    return cancelledOrder;
  }

  /**
   * Get Order Statistics - Divine Metrics
   */
  async getOrderStatistics(filters?: {
    farmId?: string;
    customerId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<OrderStatistics> {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.farmId) {
      where.farmId = filters.farmId;
    }

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    // Get all orders matching filter
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

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum.add(order.total),
      new Prisma.Decimal(0),
    );
    const averageOrderValue =
      totalOrders > 0 ? totalRevenue.div(totalOrders) : new Prisma.Decimal(0);

    // Orders by status
    const ordersByStatus = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<OrderStatus, number>,
    );

    // Orders by payment status
    const ordersByPaymentStatus = orders.reduce(
      (acc, order) => {
        acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
        return acc;
      },
      {} as Record<PaymentStatus, number>,
    );

    // Orders by fulfillment method
    const ordersByFulfillmentMethod = orders.reduce(
      (acc, order) => {
        acc[order.fulfillmentMethod] = (acc[order.fulfillmentMethod] || 0) + 1;
        return acc;
      },
      {} as Record<FulfillmentMethod, number>,
    );

    // Revenue by month
    const revenueByMonth = this.calculateMonthlyRevenue(orders);

    // Top products
    const topProducts = this.calculateTopProducts(orders);

    // Top customers
    const topCustomers = await this.calculateTopCustomers(orders);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      ordersByPaymentStatus,
      ordersByFulfillmentMethod,
      revenueByMonth,
      topProducts,
      topCustomers,
    };
  }

  /**
   * Convert Cart to Order - Divine Transformation
   */
  async convertCartToOrder(
    request: CartToOrderRequest,
  ): Promise<OrderWithRelations> {
    // Get cart items
    const cartItems = await database.cartItem.findMany({
      where: {
        id: { in: request.cartItemIds },
        userId: request.customerId,
      },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      throw new Error("No cart items found");
    }

    // Convert cart items to order items
    const orderItems = cartItems.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      unitPrice: Number(item.product.price),
    }));

    // Create order
    const order = await this.createOrder({
      customerId: request.customerId,
      farmId: request.farmId,
      items: orderItems,
      fulfillmentMethod: request.fulfillmentMethod,
      deliveryAddressId: request.deliveryAddressId,
      scheduledDate: request.scheduledDate,
      scheduledTimeSlot: request.scheduledTimeSlot,
      specialInstructions: request.specialInstructions,
    });

    // Delete cart items after successful order creation
    await database.cartItem.deleteMany({
      where: {
        id: { in: request.cartItemIds },
      },
    });

    return order;
  }

  /**
   * Get Order Consciousness - Divine Awareness
   */
  async getOrderConsciousness(orderId: string): Promise<OrderConsciousness> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Calculate seasonal alignment
    const seasonalAlignment = await this.calculateSeasonalAlignment(order);

    // Calculate quantum coherence (order integrity)
    const quantumCoherence = this.calculateQuantumCoherence(order);

    // Calculate divine score
    const divineScore = this.calculateDivineScore(
      order,
      seasonalAlignment,
      quantumCoherence,
    );

    return {
      orderId: order.id,
      currentState: order.status,
      previousStates: [], // Would need to track in audit log
      transitionCount: 0, // Would need to track in audit log
      stateHistory: [], // Would need to track in audit log
      agriculturalAlignment: seasonalAlignment,
      quantumCoherence,
      divineScore,
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Validate Order Request
   * @returns Validation result with errors and warnings
   */
  private async validateOrderData(
    request: CreateOrderRequest,
  ): Promise<OrderValidationResult> {
    const errors: OrderValidationErrorType[] = [];
    const warnings: OrderValidationWarning[] = [];

    // Validate customer exists
    const customer = await database.user.findUnique({
      where: { id: request.customerId },
    });
    if (!customer) {
      errors.push({
        field: "customerId",
        code: "CUSTOMER_NOT_FOUND",
        message: `Customer not found: ${request.customerId}`,
      } as OrderValidationErrorType);
    }

    // Validate farm exists
    const farm = await database.farm.findUnique({
      where: { id: request.farmId },
    });
    if (!farm) {
      errors.push({
        field: "farmId",
        code: "FARM_NOT_FOUND",
        message: "Farm not found",
      });
    }

    // Validate items
    if (!request.items || request.items.length === 0) {
      errors.push({
        field: "items",
        code: "NO_ITEMS",
        message: "Order must contain at least one item",
      } as OrderValidationErrorType);
    }

    // Validate each item
    for (const item of request.items) {
      const product = await database.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        errors.push({
          field: `items.${item.productId}`,
          code: "PRODUCT_NOT_FOUND",
          message: `Product not found: ${item.productId}`,
        } as OrderValidationErrorType);
        continue;
      }

      // Check inventory
      if (product.trackInventory && product.quantityAvailable !== null) {
        if (Number(product.quantityAvailable) < item.quantity) {
          errors.push({
            field: `items.${item.productId}`,
            code: "INSUFFICIENT_STOCK",
            message: `Insufficient stock for ${product.name}. Available: ${product.quantityAvailable}, Requested: ${item.quantity}`,
          } as OrderValidationErrorType);
        }
      }

      // Check if product is available
      if (product.status !== "ACTIVE") {
        errors.push({
          field: `items.${item.productId}`,
          code: "PRODUCT_NOT_AVAILABLE",
          message: `Product ${product.name} is not available (status: ${product.status})`,
        } as OrderValidationErrorType);
      }
    }

    // Validate delivery address if delivery method
    if (
      request.fulfillmentMethod === "DELIVERY" &&
      !request.deliveryAddressId
    ) {
      errors.push({
        field: "deliveryAddressId",
        code: "DELIVERY_ADDRESS_REQUIRED",
        message: "Delivery address is required for delivery orders",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calculate Order Totals
   */
  private async calculateOrderTotals(request: CreateOrderRequest) {
    let subtotal = 0;

    // Calculate subtotal from items
    for (const item of request.items) {
      const product = await database.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const unitPrice = item.unitPrice ?? Number(product.price);
      subtotal += unitPrice * item.quantity;
    }

    // Get farm for delivery fee
    const farm = await database.farm.findUnique({
      where: { id: request.farmId },
    });

    if (!farm) {
      throw new Error(`Farm not found: ${request.farmId}`);
    }

    const deliveryFee = request.fulfillmentMethod === "DELIVERY" ? 0 : 0; // TODO: Get delivery fee from farm settings

    // Calculate platform fee (e.g., 10% of subtotal)
    const platformFeeRate = 0.1;
    const platformFee = subtotal * platformFeeRate;

    // Calculate tax (e.g., 8% of subtotal)
    const taxRate = 0.08;
    const tax = subtotal * taxRate;

    // Calculate total
    const total = subtotal + deliveryFee + tax;

    // Calculate farmer amount (subtotal - platform fee)
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
   * Generate Unique Order Number
   */
  private async generateOrderNumber(): Promise<string> {
    const prefix = "FM";
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const orderNumber = `${prefix}${timestamp}${random}`;

    // Check if order number already exists (unlikely but possible)
    const existing = await database.order.findUnique({
      where: { orderNumber },
    });

    if (existing) {
      // Recursively generate new number
      return this.generateOrderNumber();
    }

    return orderNumber;
  }

  /**
   * Validate Status Transition
   */
  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
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
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  /**
   * Check if Order Can Be Cancelled
   */
  private canCancelOrder(status: OrderStatus): boolean {
    const cancellableStatuses: OrderStatus[] = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
    ];
    return cancellableStatuses.includes(status);
  }

  /**
   * Calculate Monthly Revenue
   */
  private calculateMonthlyRevenue(orders: Order[]) {
    const monthlyData = new Map<
      string,
      { revenue: Prisma.Decimal; count: number }
    >();

    for (const order of orders) {
      const month = order.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const existing = monthlyData.get(month) || {
        revenue: new Prisma.Decimal(0),
        count: 0,
      };

      monthlyData.set(month, {
        revenue: existing.revenue.add(order.total),
        count: existing.count + 1,
      });
    }

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orderCount: data.count,
      averageOrderValue: data.revenue.div(data.count),
    }));
  }

  /**
   * Calculate Top Products
   */
  private calculateTopProducts(orders: any[]) {
    const productData = new Map<
      string,
      {
        name: string;
        quantity: Prisma.Decimal;
        revenue: Prisma.Decimal;
        count: number;
      }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const existing = productData.get(item.productId) || {
          name: item.productName,
          quantity: new Prisma.Decimal(0),
          revenue: new Prisma.Decimal(0),
          count: 0,
        };

        productData.set(item.productId, {
          name: item.productName,
          quantity: existing.quantity.add(item.quantity),
          revenue: existing.revenue.add(item.subtotal),
          count: existing.count + 1,
        });
      }
    }

    return Array.from(productData.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        totalQuantity: data.quantity,
        totalRevenue: data.revenue,
        orderCount: data.count,
      }))
      .sort((a, b) => Number(b.totalRevenue.sub(a.totalRevenue)))
      .slice(0, 10);
  }

  /**
   * Calculate Top Customers
   */
  private async calculateTopCustomers(orders: Order[]) {
    const customerData = new Map<
      string,
      { name: string; orders: number; spent: Prisma.Decimal; lastOrder: Date }
    >();

    for (const order of orders) {
      const existing = customerData.get(order.customerId) || {
        name: "",
        orders: 0,
        spent: new Prisma.Decimal(0),
        lastOrder: order.createdAt,
      };

      customerData.set(order.customerId, {
        name: existing.name,
        orders: existing.orders + 1,
        spent: existing.spent.add(order.total),
        lastOrder:
          order.createdAt > existing.lastOrder
            ? order.createdAt
            : existing.lastOrder,
      });
    }

    // Get customer names
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
        customerId,
        customerName: customerMap.get(customerId) || "Unknown",
        totalOrders: data.orders,
        totalSpent: data.spent,
        averageOrderValue: data.spent.div(data.orders),
        lastOrderDate: data.lastOrder,
      }))
      .sort((a, b) => Number(b.totalSpent.sub(a.totalSpent)))
      .slice(0, 10);
  }

  /**
   * Calculate Seasonal Alignment - Agricultural Consciousness
   */
  private async calculateSeasonalAlignment(
    order: OrderWithRelations,
  ): Promise<SeasonalOrderAlignment> {
    const currentMonth = new Date().getMonth() + 1;
    const season = this.getSeasonFromMonth(currentMonth);

    // Get seasonal products
    const seasonalProducts = order.items
      .filter((item) => {
        const tags = item.product.tags;
        return Array.isArray(tags) && tags.includes(season.toLowerCase());
      })
      .map((item) => item.productName);

    // Calculate alignment
    const seasonalRatio = seasonalProducts.length / order.items.length;
    let alignment: "PERFECT" | "GOOD" | "ACCEPTABLE" | "MISALIGNED";

    if (seasonalRatio >= 0.8) alignment = "PERFECT";
    else if (seasonalRatio >= 0.5) alignment = "GOOD";
    else if (seasonalRatio >= 0.3) alignment = "ACCEPTABLE";
    else alignment = "MISALIGNED";

    return {
      season,
      alignment,
      seasonalProducts,
      freshnessFactor: seasonalRatio,
      biodynamicScore: Math.round(seasonalRatio * 100),
    };
  }

  /**
   * Get Season from Month
   */
  private getSeasonFromMonth(
    month: number,
  ): "SPRING" | "SUMMER" | "FALL" | "WINTER" {
    if (month >= 3 && month <= 5) return "SPRING";
    if (month >= 6 && month <= 8) return "SUMMER";
    if (month >= 9 && month <= 11) return "FALL";
    return "WINTER";
  }

  /**
   * Calculate Quantum Coherence - Order Integrity
   */
  private calculateQuantumCoherence(order: OrderWithRelations): number {
    let coherence = 1.0;

    // Reduce coherence for missing fields
    if (!order.deliveryAddressId && order.fulfillmentMethod === "DELIVERY") {
      coherence -= 0.2;
    }
    if (!order.scheduledDate) coherence -= 0.1;
    if (!order.specialInstructions) coherence -= 0.05;

    // Reduce coherence for incomplete fulfillment
    if (!order.fulfillment) coherence -= 0.3;

    return Math.max(0, coherence);
  }

  /**
   * Calculate Divine Score - Overall Order Quality
   */
  private calculateDivineScore(
    order: OrderWithRelations,
    seasonalAlignment: SeasonalOrderAlignment,
    quantumCoherence: number,
  ): number {
    const seasonalScore = seasonalAlignment.biodynamicScore * 0.4;
    const coherenceScore = quantumCoherence * 100 * 0.4;
    const statusScore =
      order.status === "COMPLETED"
        ? 20
        : order.status === "FULFILLED"
          ? 15
          : 10;

    return Math.round(seasonalScore + coherenceScore + statusScore);
  }
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class OrderValidationError extends Error {
  constructor(
    message: string,
    public errors: OrderValidationErrorType[],
  ) {
    super(message);
    this.name = "OrderValidationError";
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const orderService = new OrderService();
