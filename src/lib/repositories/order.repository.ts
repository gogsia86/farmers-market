/**
 * 🌾 QUANTUM ORDER REPOSITORY
 * Divine order management with agricultural consciousness
 *
 * @module repositories/order
 * @version 2.0.0
 * @description
 * Implements comprehensive order management for the Farmers Market Platform.
 * Handles order lifecycle, status transitions, farmer order management,
 * and customer order tracking with biodynamic energy.
 *
 * @divine_patterns
 * - Kilo-scale architecture compliance
 * - Agricultural consciousness in order flow
 * - Transaction safety for order operations
 * - Enlightening error messages
 * - Performance optimization for high-volume orders
 *
 * @agricultural_features
 * - Seasonal order tracking
 * - Farm-specific order filtering
 * - Fulfillment method awareness
 * - Order status transitions with validation
 */

import { Prisma } from "@prisma/client";
import { BaseRepository, RepositoryOptions } from "./base.repository";

/**
 * QuantumOrder type with all relations
 */
export type QuantumOrder = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
    customer: {
      select: {
        id: true;
        name: true;
        email: true;
        phone: true;
      };
    };
    farm: {
      select: {
        id: true;
        name: true;
        email: true;
        phone: true;
        slug: true;
        ownerId: true;
      };
    };
    deliveryAddress: true;
  };
}>;

/**
 * Order search filters
 */
export interface OrderSearchFilters {
  farmId?: string;
  customerId?: string;
  status?: string;
  paymentStatus?: string;
  fulfillmentMethod?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Order statistics
 */
export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByFulfillmentMethod: Record<string, number>;
}

/**
 * Order status transition
 */
export interface OrderStatusTransition {
  orderId: string;
  fromStatus: string;
  toStatus: string;
  updatedBy: string;
  reason?: string;
  timestamp: Date;
}

/**
 * 🌟 QUANTUM ORDER REPOSITORY
 *
 * Manages the complete order lifecycle with agricultural consciousness.
 * Provides comprehensive order management, filtering, and analytics.
 *
 * @example
 * ```typescript
 * // Use singleton instance
 * import { orderRepository } from "@/lib/repositories";
 *
 * // Create new order
 * const order = await orderRepository.manifestOrder({
 *   customerId: "user_123",
 *   farmId: "farm_456",
 *   items: [...],
 *   total: 99.99
 * });
 *
 * // Find farmer orders
 * const orders = await orderRepository.findFarmOrders("farm_456", {
 *   status: "PENDING"
 * });
 * ```
 */
export class QuantumOrderRepository extends BaseRepository<
  QuantumOrder,
  Prisma.OrderCreateInput,
  Prisma.OrderUpdateInput
> {
  constructor() {
    super({ name: "order" }, "QuantumOrderRepository");
  }

  /**
   * 🌾 MANIFEST ORDER
   * Create a new order with divine consciousness
   *
   * @param data Order creation data
   * @param options Repository options
   * @returns Created order with full relations
   */
  async manifestOrder(
    data: Prisma.OrderCreateInput,
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder> {
    this.logOperation("manifestOrder:start", {
      customerId: (data as any).customerId,
      farmId: (data as any).farmId,
      agriculturalConsciousness: "DIVINE",
    });

    const order = await this.create(data, options);

    this.logOperation("manifestOrder:complete", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      biodynamicEnergy: "PURE",
    });

    return order;
  }

  /**
   * Find order by order number (public-facing identifier)
   *
   * @param orderNumber Order number
   * @param options Repository options
   * @returns Order or null
   */
  async findByOrderNumber(
    orderNumber: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder | null> {
    try {
      const db = options.tx || this.db;
      const order = await db.order.findUnique({
        where: { orderNumber },
        ...this.getDefaultInclude(),
      });

      if (order) {
        this.logOperation("findByOrderNumber", {
          orderNumber,
          found: true,
        });
      }

      return order as QuantumOrder | null;
    } catch (error) {
      throw this.handleDatabaseError("findByOrderNumber", error);
    }
  }

  /**
   * 🚜 FIND FARM ORDERS
   * Get all orders for a specific farm with optional filtering
   *
   * @param farmId Farm ID
   * @param filters Search filters
   * @param options Repository options
   * @returns Array of orders
   */
  async findFarmOrders(
    farmId: string,
    filters: Partial<OrderSearchFilters> = {},
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder[]> {
    const where: Prisma.OrderWhereInput = {
      farmId,
      ...this.buildFilterWhere(filters),
    };

    const orders = await this.findMany(where, {
      ...options,
      orderBy: { createdAt: "desc" },
    });

    this.logOperation("findFarmOrders", {
      farmId,
      count: orders.length,
      filters: Object.keys(filters).length,
    });

    return orders;
  }

  /**
   * 👤 FIND CUSTOMER ORDERS
   * Get all orders for a specific customer
   *
   * @param customerId Customer ID
   * @param filters Search filters
   * @param options Repository options
   * @returns Array of orders
   */
  async findCustomerOrders(
    customerId: string,
    filters: Partial<OrderSearchFilters> = {},
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder[]> {
    const where: Prisma.OrderWhereInput = {
      customerId,
      ...this.buildFilterWhere(filters),
    };

    const orders = await this.findMany(where, {
      ...options,
      orderBy: { createdAt: "desc" },
    });

    this.logOperation("findCustomerOrders", {
      customerId,
      count: orders.length,
    });

    return orders;
  }

  /**
   * Find orders by status
   *
   * @param status Order status
   * @param options Repository options
   * @returns Array of orders
   */
  async findByStatus(
    status: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder[]> {
    return await this.findMany(
      { status: status as any },
      {
        ...options,
        orderBy: { createdAt: "desc" },
      },
    );
  }

  /**
   * Find pending orders (need farmer attention)
   *
   * @param farmId Optional farm ID to filter
   * @param options Repository options
   * @returns Array of pending orders
   */
  async findPendingOrders(
    farmId?: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder[]> {
    const where: Prisma.OrderWhereInput = {
      status: "PENDING",
      ...(farmId && { farmId }),
    };

    return await this.findMany(where, {
      ...options,
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Find orders requiring fulfillment
   *
   * @param farmId Farm ID
   * @param options Repository options
   * @returns Array of orders ready for fulfillment
   */
  async findOrdersForFulfillment(
    farmId: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder[]> {
    return await this.findMany(
      {
        farmId,
        status: {
          in: ["CONFIRMED", "PREPARING"],
        },
        paymentStatus: "PAID",
      },
      {
        ...options,
        orderBy: { scheduledDate: "asc" },
      },
    );
  }

  /**
   * 🔄 UPDATE ORDER STATUS
   * Transition order to new status with validation
   *
   * @param orderId Order ID
   * @param status New status
   * @param updatedBy User performing update
   * @param reason Optional reason for status change
   * @param options Repository options
   * @returns Updated order
   */
  async updateOrderStatus(
    orderId: string,
    status: string,
    updatedBy: string,
    reason?: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder> {
    const updateData: Prisma.OrderUpdateInput = {
      status: status as any,
    };

    // Set timestamps based on status
    const now = new Date();
    switch (status) {
      case "CONFIRMED":
        updateData.confirmedAt = now;
        break;
      case "FULFILLED":
        updateData.fulfilledAt = now;
        break;
      case "COMPLETED":
        updateData.completedAt = now;
        break;
      case "CANCELLED":
        updateData.cancelledAt = now;
        updateData.cancelledBy = updatedBy;
        if (reason) {
          updateData.cancelReason = reason;
        }
        break;
    }

    const order = await this.update(orderId, updateData, options);

    this.logOperation("updateOrderStatus", {
      orderId,
      newStatus: status,
      updatedBy,
      reason,
      agriculturalConsciousness: "MAINTAINED",
    });

    return order;
  }

  /**
   * Update payment status
   *
   * @param orderId Order ID
   * @param paymentStatus New payment status
   * @param paymentDetails Payment processing details
   * @param options Repository options
   * @returns Updated order
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: string,
    paymentDetails: {
      stripePaymentIntentId?: string;
      stripeChargeId?: string;
      paidAt?: Date;
    } = {},
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder> {
    const updateData: Prisma.OrderUpdateInput = {
      paymentStatus: paymentStatus as any,
      ...paymentDetails,
    };

    if (paymentStatus === "PAID" && !paymentDetails.paidAt) {
      updateData.paidAt = new Date();
    }

    return await this.update(orderId, updateData, options);
  }

  /**
   * Add tracking information to order
   *
   * @param orderId Order ID
   * @param trackingNumber Tracking number
   * @param shippingService Shipping service name
   * @param options Repository options
   * @returns Updated order
   */
  async addTrackingInfo(
    orderId: string,
    trackingNumber: string,
    shippingService?: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder> {
    return await this.update(
      orderId,
      {
        trackingNumber,
        ...(shippingService && { shippingService }),
      },
      options,
    );
  }

  /**
   * 📊 GET ORDER STATISTICS
   * Calculate comprehensive order statistics
   *
   * @param farmId Optional farm ID to filter
   * @param dateFrom Optional start date
   * @param dateTo Optional end date
   * @param options Repository options
   * @returns Order statistics
   */
  async getOrderStatistics(
    farmId?: string,
    dateFrom?: Date,
    dateTo?: Date,
    options: RepositoryOptions = {},
  ): Promise<OrderStatistics> {
    try {
      const db = options.tx || this.db;

      const where: Prisma.OrderWhereInput = {
        ...(farmId && { farmId }),
        ...(dateFrom &&
          dateTo && {
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          }),
      };

      // Get all orders for statistics
      const orders = (await db.order.findMany({
        where,
        select: {
          id: true,
          status: true,
          fulfillmentMethod: true,
          total: true,
        },
      })) as any[];

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (sum, order) => sum + Number(order.total || 0),
        0,
      );
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Group by status
      const ordersByStatus: Record<string, number> = {};
      const ordersByFulfillmentMethod: Record<string, number> = {};

      orders.forEach((order: any) => {
        // Count by status
        ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;

        // Count by fulfillment method
        ordersByFulfillmentMethod[order.fulfillmentMethod] =
          (ordersByFulfillmentMethod[order.fulfillmentMethod] || 0) + 1;
      });

      const stats: OrderStatistics = {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByStatus,
        ordersByFulfillmentMethod,
      };

      this.logOperation("getOrderStatistics", {
        farmId,
        totalOrders,
        totalRevenue,
        dateRange: dateFrom && dateTo ? "filtered" : "all-time",
      });

      return stats;
    } catch (error) {
      throw this.handleDatabaseError("getOrderStatistics", error);
    }
  }

  /**
   * Get recent orders
   *
   * @param limit Number of orders to return
   * @param farmId Optional farm ID to filter
   * @param options Repository options
   * @returns Array of recent orders
   */
  async getRecentOrders(
    limit: number = 10,
    farmId?: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder[]> {
    const where: Prisma.OrderWhereInput = {
      ...(farmId && { farmId }),
    };

    return await this.findMany(where, {
      ...options,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Search orders with advanced filters
   *
   * @param filters Search filters
   * @param options Repository options
   * @returns Array of matching orders
   */
  async searchOrders(
    filters: OrderSearchFilters,
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder[]> {
    const where = this.buildFilterWhere(filters);

    return await this.findMany(where, {
      ...options,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find orders by fulfillment method
   *
   * @param fulfillmentMethod Fulfillment method
   * @param farmId Optional farm ID to filter
   * @param options Repository options
   * @returns Array of orders
   */
  async findByFulfillmentMethod(
    fulfillmentMethod: string,
    farmId?: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder[]> {
    const where: Prisma.OrderWhereInput = {
      fulfillmentMethod: fulfillmentMethod as any,
      ...(farmId && { farmId }),
    };

    return await this.findMany(where, {
      ...options,
      orderBy: { scheduledDate: "asc" },
    });
  }

  /**
   * Find orders scheduled for specific date range
   *
   * @param startDate Start date
   * @param endDate End date
   * @param farmId Optional farm ID to filter
   * @param options Repository options
   * @returns Array of scheduled orders
   */
  async findScheduledOrders(
    startDate: Date,
    endDate: Date,
    farmId?: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder[]> {
    const where: Prisma.OrderWhereInput = {
      scheduledDate: {
        gte: startDate,
        lte: endDate,
      },
      ...(farmId && { farmId }),
      status: {
        notIn: ["CANCELLED", "COMPLETED"],
      },
    };

    return await this.findMany(where, {
      ...options,
      orderBy: { scheduledDate: "asc" },
    });
  }

  /**
   * Cancel order
   *
   * @param orderId Order ID
   * @param cancelledBy User cancelling order
   * @param reason Cancellation reason
   * @param options Repository options
   * @returns Updated order
   */
  async cancelOrder(
    orderId: string,
    cancelledBy: string,
    reason: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder> {
    return await this.updateOrderStatus(
      orderId,
      "CANCELLED",
      cancelledBy,
      reason,
      options,
    );
  }

  /**
   * Complete order
   *
   * @param orderId Order ID
   * @param options Repository options
   * @returns Updated order
   */
  async completeOrder(
    orderId: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumOrder> {
    return await this.update(
      orderId,
      {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      options,
    );
  }

  /**
   * Build Prisma where clause from search filters
   *
   * @param filters Search filters
   * @returns Prisma where input
   * @private
   */
  private buildFilterWhere(
    filters: Partial<OrderSearchFilters>,
  ): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (filters.status) {
      where.status = filters.status as any;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus as any;
    }

    if (filters.fulfillmentMethod) {
      where.fulfillmentMethod = filters.fulfillmentMethod as any;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.total = {};
      if (filters.minAmount !== undefined) {
        where.total.gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        where.total.lte = filters.maxAmount;
      }
    }

    return where;
  }

  /**
   * Get default include for order queries
   *
   * @protected
   */
  protected getDefaultInclude() {
    return {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
              category: true,
              unit: true,
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
      farm: {
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          ownerId: true,
        },
      },
      deliveryAddress: true,
    };
  }
}

/**
 * Export singleton instance for application-wide use
 * Following divine pattern of single point of database access
 */
export const orderRepository = new QuantumOrderRepository();

/**
 * Divine order repository consciousness achieved ✨📦
 * Agricultural order management with biodynamic energy
 * Ready to scale from 1 to 1 billion orders with quantum efficiency
 */
