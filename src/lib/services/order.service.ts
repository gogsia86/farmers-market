/**
 * 📦 ORDER SERVICE - DIVINE BUSINESS LOGIC LAYER
 *
 * Consolidated order management service extending BaseService pattern.
 * Combines functionality from multiple order-related services into one
 * cohesive, maintainable service with agricultural consciousness.
 *
 * Divine Patterns Applied:
 * - BaseService extension for standardized patterns
 * - ServiceResponse types for consistent API responses
 * - Repository pattern usage (no direct database access)
 * - Type-safe operations with agricultural consciousness
 * - Enlightening error messages
 * - Comprehensive error handling
 * - Service-level caching
 * - OpenTelemetry tracing integration
 * - Validation with warnings for better UX
 * - Order fulfillment workflows
 * - Analytics and statistics
 *
 * Architecture:
 * Controller → Service (extends BaseService) → Repository → Database
 *
 * Functional Requirements: FR-015 (Order Management)
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import { BaseService } from "@/lib/services/base.service";
import type { Order } from "@prisma/client";
import type {
  ServiceResponse,
  PaginatedResponse,
} from "@/lib/types/service-response";
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  ErrorCodes,
} from "@/lib/types/service-response";
import {
  orderRepository,
  type QuantumOrder,
} from "@/lib/repositories/order.repository";
import { productRepository } from "@/lib/repositories/product.repository";
import type { RepositoryOptions } from "@/lib/repositories/base.repository";
import {
  traceServiceOperation,
  addSpanEvent,
  setSpanAttributes,
} from "@/lib/tracing/service-tracer";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
  BusinessLogicError,
} from "@/lib/errors";
import { AgriculturalCache } from "@/lib/cache/agricultural-cache";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Order creation request data
 */
export interface CreateOrderRequest {
  customerId: string;
  farmId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price?: number;
  }>;
  fulfillmentMethod: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";
  deliveryAddressId?: string;
  specialInstructions?: string;
  scheduledDate?: Date;
  scheduledTimeSlot?: string;
}

/**
 * Order update request data
 */
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
  scheduledTimeSlot?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
}

/**
 * Order cancellation request
 */
export interface CancelOrderRequest {
  reason: string;
  cancelledBy: string;
  refundAmount?: number;
}

/**
 * Order listing options
 */
export interface ListOrdersOptions {
  page?: number;
  limit?: number;
  customerId?: string;
  farmId?: string;
  status?: string;
  paymentStatus?: string;
  fulfillmentMethod?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  sortBy?: "createdAt" | "total" | "status";
  sortOrder?: "asc" | "desc";
}

/**
 * Type alias for GetOrdersRequest (used by controller)
 */
export type GetOrdersRequest = ListOrdersOptions;

/**
 * Order statistics request
 */
export interface OrderStatisticsRequest {
  farmId?: string;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Order statistics response
 */
export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByFulfillmentMethod: Record<string, number>;
  revenueByPeriod?: Array<{
    period: string;
    revenue: number;
    orderCount: number;
  }>;
}

/**
 * Order validation result
 */
export interface OrderValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    severity: "low" | "medium" | "high";
  }>;
}

/**
 * Order totals calculation
 */
export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  total: number;
  farmerAmount: number;
}

/**
 * Order validation error class
 */
export class OrderValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "OrderValidationError";
  }
}

// ============================================================================
// ORDER SERVICE CLASS
// ============================================================================

/**
 * Order Service with agricultural consciousness
 * Extends BaseService for standardized patterns
 *
 * Returns ServiceResponse for all public methods
 *
 * @example
 * ```typescript
 * const service = new OrderService();
 * const response = await service.createOrder({
 *   customerId: userId,
 *   farmId: farmId,
 *   items: [{ productId, quantity: 2 }],
 *   fulfillmentMethod: "DELIVERY"
 * });
 *
 * if (response.success) {
 *   console.log(response.data.orderNumber);
 * } else {
 *   console.error(response.error.message);
 * }
 * ```
 */
export class OrderService extends BaseService<Order> {
  private readonly TAX_RATE = 0.08; // 8% tax
  private readonly PLATFORM_FEE_RATE = 0.1; // 10% platform fee
  private readonly DELIVERY_FEE_BASE = 5.0; // Base delivery fee

  constructor(
    private repository = orderRepository,
    private productRepo = productRepository,
  ) {
    super({
      serviceName: "OrderService",
      cacheTTL: 1800, // 30 minutes
      cachePrefix: "order",
      enableCaching: true,
      enableTracing: true,
      enableAgriculturalConsciousness: true,
    });
  }

  // ==========================================================================
  // ORDER CREATION
  // ==========================================================================

  /**
   * Create a new order with comprehensive validation
   *
   * Validates order data, checks inventory, calculates totals, and creates
   * the order with all items. Includes validation warnings for better UX.
   *
   * @param data - Order creation data
   * @param options - Repository transaction options
   * @returns ServiceResponse with created order
   */
  async createOrder(
    data: CreateOrderRequest,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<QuantumOrder>> {
    return await traceServiceOperation(
      "OrderService",
      "createOrder",
      {
        "customer.id": data.customerId,
        "farm.id": data.farmId,
        "items.count": data.items.length,
      },
      async (span) => {
        try {
          // Validate order data
          const validation = await this.validateOrderCreation(data);
          if (!validation.valid) {
            return createErrorResponse({
              code: ErrorCodes.VALIDATION_ERROR,
              message: validation.errors[0]?.message || "Validation failed",
              timestamp: new Date().toISOString(),
              details: {
                errors: validation.errors,
                warnings: validation.warnings,
              },
            });
          }
          addSpanEvent("validation_completed");

          // Check inventory availability
          const inventoryCheck = await this.validateInventory(data.items);
          if (!inventoryCheck.valid) {
            return createErrorResponse({
              code: ErrorCodes.VALIDATION_ERROR,
              message: "Some items are out of stock",
              timestamp: new Date().toISOString(),
              details: { errors: inventoryCheck.errors },
            });
          }
          addSpanEvent("inventory_validated");

          // Calculate order totals
          const totals = await this.calculateOrderTotals(
            data.items,
            data.fulfillmentMethod,
          );
          setSpanAttributes({ "order.total": totals.total });
          addSpanEvent("totals_calculated", { total: totals.total });

          // Generate order number
          const orderNumber = await this.generateOrderNumber();
          setSpanAttributes({ "order.number": orderNumber });

          // Fetch product details for order items
          const itemsWithDetails = await Promise.all(
            data.items.map(async (item) => {
              const product = await this.productRepo.findById(item.productId);
              if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
              }

              // Safely extract pricing data from JsonValue
              const pricing = product.pricing as any;
              const basePrice = pricing?.basePrice?.amount || 0;

              return {
                product: { connect: { id: item.productId } },
                productName: product.name,
                unit: product.unit || "unit",
                unitPrice: item.price || basePrice,
                quantity: item.quantity,
                price: item.price || basePrice,
                subtotal: (item.price || basePrice) * item.quantity,
              };
            }),
          );

          // Create order through repository
          const order = await this.repository.manifestOrder(
            {
              customer: { connect: { id: data.customerId } },
              farm: { connect: { id: data.farmId } },
              orderNumber,
              fulfillmentMethod: data.fulfillmentMethod,
              status: "PENDING",
              paymentStatus: "PENDING",
              subtotal: totals.subtotal,
              deliveryFee: totals.deliveryFee,
              platformFee: totals.platformFee,
              tax: totals.tax,
              total: totals.total,
              farmerAmount: totals.farmerAmount,
              specialInstructions: data.specialInstructions,
              scheduledDate: data.scheduledDate,
              scheduledTimeSlot: data.scheduledTimeSlot,
              deliveryAddress: data.deliveryAddressId
                ? { connect: { id: data.deliveryAddressId } }
                : undefined,
              items: {
                create: itemsWithDetails,
              },
            },
            options,
          );

          setSpanAttributes({ "order.id": order.id });
          addSpanEvent("order_created", { orderId: order.id });

          // Invalidate relevant caches
          await this.deleteCache(`customer:${data.customerId}:orders`);
          await this.deleteCache(`farm:${data.farmId}:orders`);
          addSpanEvent("cache_invalidated");

          return createSuccessResponse(order, {
            message: "Order created successfully",
            timestamp: new Date().toISOString(),
            agricultural: {
              consciousness: "DIVINE",
            },
          });
        } catch (error) {
          this.logger.error("Order creation failed", {
            customerId: data.customerId,
            farmId: data.farmId,
            errorMessage:
              error instanceof Error ? error.message : String(error),
          });

          if (error instanceof ValidationError) {
            return createErrorResponse({
              code: ErrorCodes.VALIDATION_ERROR,
              message: error.message,
              timestamp: new Date().toISOString(),
            });
          }

          return createErrorResponse({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to create order",
            timestamp: new Date().toISOString(),
            details: {
              originalError:
                error instanceof Error ? error.message : "Unknown error",
            },
          });
        }
      },
    );
  }

  // ==========================================================================
  // ORDER RETRIEVAL
  // ==========================================================================

  /**
   * Get order by ID with authorization check
   *
   * @param orderId - Order ID
   * @param userId - User ID requesting the order
   * @param options - Repository options
   * @returns ServiceResponse with order
   */
  async getOrderById(
    orderId: string,
    userId: string,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<QuantumOrder>> {
    return await traceServiceOperation(
      "OrderService",
      "getOrderById",
      { "order.id": orderId, "user.id": userId },
      async (span) => {
        try {
          // Check cache
          const cacheKey = `order:${orderId}`;
          const cached = await this.getCached<QuantumOrder>(
            cacheKey,
            async () => {
              return null as any;
            },
          );
          if (cached) {
            addSpanEvent("cache_hit");

            // Still need to check authorization
            if (
              cached.customerId !== userId &&
              cached.farm.ownerId !== userId
            ) {
              return createErrorResponse({
                code: ErrorCodes.FORBIDDEN_ACTION,
                message: "Not authorized to view this order",
                timestamp: new Date().toISOString(),
              });
            }

            return createSuccessResponse(cached);
          }

          // Fetch from repository
          const order = await this.repository.findById(orderId, options);
          if (!order) {
            return createErrorResponse({
              code: ErrorCodes.NOT_FOUND,
              message: "Order not found",
              timestamp: new Date().toISOString(),
              details: { orderId },
            });
          }

          // Authorization check
          if (order.customerId !== userId && order.farm.ownerId !== userId) {
            return createErrorResponse({
              code: ErrorCodes.FORBIDDEN_ACTION,
              message: "Not authorized to view this order",
              timestamp: new Date().toISOString(),
            });
          }

          // Cache result
          await this.setCached(cacheKey, order);

          return createSuccessResponse(order, {
            message: "Order retrieved successfully",
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          this.logger.error("Failed to get order", {
            orderId,
            userId,
            error: error instanceof Error ? error.message : String(error),
          });

          return createErrorResponse({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to retrieve order",
            timestamp: new Date().toISOString(),
          });
        }
      },
    );
  }

  /**
   * Get order by order number
   *
   * @param orderNumber - Order number
   * @param userId - User ID requesting the order
   * @param options - Repository options
   * @returns ServiceResponse with order
   */
  async getOrderByNumber(
    orderNumber: string,
    userId: string,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<QuantumOrder>> {
    return await traceServiceOperation(
      "OrderService",
      "getOrderByNumber",
      { "order.number": orderNumber },
      async (span) => {
        try {
          const order = await this.repository.findByOrderNumber(
            orderNumber,
            options,
          );
          if (!order) {
            return createErrorResponse({
              code: ErrorCodes.NOT_FOUND,
              message: "Order not found",
              timestamp: new Date().toISOString(),
            });
          }

          // Authorization check
          if (order.customerId !== userId && order.farm.ownerId !== userId) {
            return createErrorResponse({
              code: ErrorCodes.FORBIDDEN_ACTION,
              message: "Not authorized to view this order",
              timestamp: new Date().toISOString(),
            });
          }

          return createSuccessResponse(order);
        } catch (error) {
          return createErrorResponse({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to retrieve order",
            timestamp: new Date().toISOString(),
          });
        }
      },
    );
  }

  /**
   * List orders with pagination and filtering
   *
   * @param options - Listing options
   * @returns PaginatedResponse with orders
   */
  async listOrders(
    options: ListOrdersOptions = {},
  ): Promise<PaginatedResponse<QuantumOrder>> {
    return await traceServiceOperation(
      "OrderService",
      "listOrders",
      {
        "customer.id": options.customerId,
        "farm.id": options.farmId,
      },
      async (span) => {
        try {
          const page = options.page || 1;
          const limit = options.limit || 20;
          const skip = (page - 1) * limit;

          const filters: any = {};
          if (options.customerId) filters.customerId = options.customerId;
          if (options.farmId) filters.farmId = options.farmId;
          if (options.status) filters.status = options.status;
          if (options.paymentStatus)
            filters.paymentStatus = options.paymentStatus;
          if (options.fulfillmentMethod)
            filters.fulfillmentMethod = options.fulfillmentMethod;
          if (options.startDate || options.endDate) {
            filters.dateRange = {
              start: options.startDate,
              end: options.endDate,
            };
          }

          const [orders, total] = await Promise.all([
            this.repository.findMany({
              where: this.buildOrderFilters(filters),
              take: limit,
              skip,
              orderBy: {
                [options.sortBy || "createdAt"]: options.sortOrder || "desc",
              },
            }),
            this.repository.count({ where: this.buildOrderFilters(filters) }),
          ]);

          const totalPages = Math.ceil(total / limit);

          return createPaginatedResponse(
            orders,
            {
              page,
              limit,
              total,
              totalPages,
              hasNext: page < totalPages,
              hasPrevious: page > 1,
            },
            {
              message: "Orders retrieved successfully",
              timestamp: new Date().toISOString(),
              agricultural: {
                consciousness: "DIVINE",
              },
            },
          );
        } catch (error) {
          this.logger.error("Failed to list orders", {
            error: error instanceof Error ? error.message : String(error),
          });

          return createPaginatedResponse(
            [],
            {
              page: options.page || 1,
              limit: options.limit || 20,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrevious: false,
            },
            {
              message: "Failed to retrieve orders",
              timestamp: new Date().toISOString(),
            },
          );
        }
      },
    );
  }

  /**
   * Get customer orders
   *
   * @param customerId - Customer ID
   * @param options - Listing options
   * @returns PaginatedResponse with customer orders
   */
  async getCustomerOrders(
    customerId: string,
    options: ListOrdersOptions = {},
  ): Promise<PaginatedResponse<QuantumOrder>> {
    return await this.listOrders({ ...options, customerId });
  }

  /**
   * Get farm orders
   *
   * @param farmId - Farm ID
   * @param options - Listing options
   * @returns PaginatedResponse with farm orders
   */
  async getFarmOrders(
    farmId: string,
    options: ListOrdersOptions = {},
  ): Promise<PaginatedResponse<QuantumOrder>> {
    return await this.listOrders({ ...options, farmId });
  }

  // ==========================================================================
  // ORDER UPDATES
  // ==========================================================================

  /**
   * Update order details
   *
   * @param orderId - Order ID
   * @param updates - Update data
   * @param userId - User ID performing the update
   * @param options - Repository options
   * @returns ServiceResponse with updated order
   */
  async updateOrder(
    orderId: string,
    updates: UpdateOrderRequest,
    userId: string,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<QuantumOrder>> {
    return await traceServiceOperation(
      "OrderService",
      "updateOrder",
      { "order.id": orderId },
      async (span) => {
        try {
          // Fetch existing order
          const existingOrder = await this.repository.findById(
            orderId,
            options,
          );
          if (!existingOrder) {
            return createErrorResponse({
              code: ErrorCodes.NOT_FOUND,
              message: "Order not found",
              timestamp: new Date().toISOString(),
            });
          }

          // Authorization check
          if (
            existingOrder.customerId !== userId &&
            existingOrder.farm.ownerId !== userId
          ) {
            return createErrorResponse({
              code: ErrorCodes.FORBIDDEN_ACTION,
              message: "Not authorized to update this order",
              timestamp: new Date().toISOString(),
            });
          }

          // Validate status transition if status is being updated
          if (updates.status && updates.status !== existingOrder.status) {
            const canTransition = this.validateStatusTransition(
              existingOrder.status,
              updates.status,
            );
            if (!canTransition) {
              return createErrorResponse({
                code: ErrorCodes.VALIDATION_ERROR,
                message: `Cannot transition from ${existingOrder.status} to ${updates.status}`,
                timestamp: new Date().toISOString(),
              });
            }
          }

          // Update order
          const updated = await this.repository.update(
            orderId,
            updates as any,
            options,
          );

          // Invalidate cache
          await this.deleteCache(`order:${orderId}`);
          await this.deleteCache(`customer:${existingOrder.customerId}:orders`);
          await this.deleteCache(`farm:${existingOrder.farmId}:orders`);

          return createSuccessResponse(updated, {
            message: "Order updated successfully",
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          this.logger.error("Failed to update order", {
            orderId,
            error: error instanceof Error ? error.message : String(error),
          });

          return createErrorResponse({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to update order",
            timestamp: new Date().toISOString(),
          });
        }
      },
    );
  }

  /**
   * Update order status with workflow validation
   *
   * @param orderId - Order ID
   * @param status - New status
   * @param userId - User ID performing the update
   * @param options - Repository options
   * @returns ServiceResponse with updated order
   */
  async updateOrderStatus(
    orderId: string,
    status: string,
    userId: string,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<QuantumOrder>> {
    return await traceServiceOperation(
      "OrderService",
      "updateOrderStatus",
      { "order.id": orderId, "new.status": status },
      async (span) => {
        try {
          const order = await this.repository.findById(orderId, options);
          if (!order) {
            return createErrorResponse({
              code: ErrorCodes.NOT_FOUND,
              message: "Order not found",
              timestamp: new Date().toISOString(),
            });
          }

          // Authorization check (only farm owner can update status)
          if (order.farm.ownerId !== userId) {
            return createErrorResponse({
              code: ErrorCodes.FORBIDDEN_ACTION,
              message: "Only farm owner can update order status",
              timestamp: new Date().toISOString(),
              details: { userId, farmOwnerId: order.farm.ownerId },
            });
          }

          // Validate transition
          if (!this.validateStatusTransition(order.status, status)) {
            return createErrorResponse({
              code: ErrorCodes.VALIDATION_ERROR,
              message: `Invalid status transition: ${order.status} → ${status}`,
              timestamp: new Date().toISOString(),
            });
          }

          // Update status
          const updated = await this.repository.updateOrderStatus(
            orderId,
            status as any,
            userId,
            undefined, // reason
            options,
          );

          // Invalidate cache
          await this.deleteCache(`order:${orderId}`);

          return createSuccessResponse(updated, {
            message: `Order status updated to ${status}`,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          return createErrorResponse({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to update order status",
            timestamp: new Date().toISOString(),
          });
        }
      },
    );
  }

  /**
   * Cancel an order
   *
   * @param orderId - Order ID
   * @param request - Cancellation request
   * @param userId - User ID cancelling the order
   * @param options - Repository options
   * @returns ServiceResponse with cancelled order
   */
  async cancelOrder(
    orderId: string,
    request: CancelOrderRequest,
    userId: string,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<QuantumOrder>> {
    return await traceServiceOperation(
      "OrderService",
      "cancelOrder",
      { "order.id": orderId },
      async (span) => {
        try {
          const order = await this.repository.findById(orderId, options);
          if (!order) {
            return createErrorResponse({
              code: ErrorCodes.NOT_FOUND,
              message: "Order not found",
              timestamp: new Date().toISOString(),
            });
          }

          // Authorization check
          if (order.customerId !== userId && order.farm.ownerId !== userId) {
            return createErrorResponse({
              code: ErrorCodes.FORBIDDEN,
              message: "Not authorized to cancel this order",
              timestamp: new Date().toISOString(),
              details: {
                userId,
                customerId: order.customerId,
                farmOwnerId: order.farm.ownerId,
              },
            });
          }

          // Check if order can be cancelled
          const cancellableStatuses = ["PENDING", "CONFIRMED"];
          if (!cancellableStatuses.includes(order.status)) {
            return createErrorResponse({
              code: ErrorCodes.VALIDATION_ERROR,
              message: `Cannot cancel order with status ${order.status}`,
              timestamp: new Date().toISOString(),
            });
          }

          // Cancel order
          const cancelled = await this.repository.cancelOrder(
            orderId,
            userId,
            "Cancelled by user",
            options,
          );

          // Invalidate cache
          await this.deleteCache(`order:${orderId}`);

          return createSuccessResponse(cancelled, {
            message: "Order cancelled successfully",
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          return createErrorResponse({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to cancel order",
            timestamp: new Date().toISOString(),
          });
        }
      },
    );
  }

  // ==========================================================================
  // ORDER FULFILLMENT
  // ==========================================================================

  /**
   * Confirm an order (farmer accepts)
   */
  async confirmOrder(
    orderId: string,
    userId: string,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<QuantumOrder>> {
    return await this.updateOrderStatus(orderId, "CONFIRMED", userId, options);
  }

  /**
   * Mark order as preparing
   */
  async prepareOrder(
    orderId: string,
    userId: string,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<QuantumOrder>> {
    return await this.updateOrderStatus(orderId, "PREPARING", userId, options);
  }

  /**
   * Mark order as ready for pickup/delivery
   */
  async markOrderReady(
    orderId: string,
    userId: string,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<QuantumOrder>> {
    return await this.updateOrderStatus(orderId, "READY", userId, options);
  }

  /**
   * Mark order as fulfilled
   */
  async fulfillOrder(
    orderId: string,
    userId: string,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<QuantumOrder>> {
    return await this.updateOrderStatus(orderId, "FULFILLED", userId, options);
  }

  /**
   * Complete an order
   */
  async completeOrder(
    orderId: string,
    userId: string,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<QuantumOrder>> {
    return await traceServiceOperation(
      "OrderService",
      "completeOrder",
      { "order.id": orderId },
      async (span) => {
        try {
          const order = await this.repository.findById(orderId, options);
          if (!order) {
            return createErrorResponse({
              code: ErrorCodes.NOT_FOUND,
              message: "Order not found",
              timestamp: new Date().toISOString(),
            });
          }

          // Complete order
          const completed = await this.repository.completeOrder(
            orderId,
            options,
          );

          // Invalidate cache
          await this.deleteCache(`order:${orderId}`);

          return createSuccessResponse(completed, {
            message: "Order completed successfully",
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          return createErrorResponse({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to complete order",
            timestamp: new Date().toISOString(),
          });
        }
      },
    );
  }

  // ==========================================================================
  // ORDER ANALYTICS
  // ==========================================================================

  /**
   * Get order statistics
   *
   * @param request - Statistics request
   * @returns ServiceResponse with order statistics
   */
  async getOrderStatistics(
    request: OrderStatisticsRequest = {},
  ): Promise<ServiceResponse<OrderStatistics>> {
    return await traceServiceOperation(
      "OrderService",
      "getOrderStatistics",
      { "farm.id": request.farmId },
      async (span) => {
        try {
          const stats = await this.repository.getOrderStatistics(
            request.farmId,
            request.startDate,
            request.endDate,
          );

          return createSuccessResponse(stats as OrderStatistics, {
            message: "Order statistics retrieved successfully",
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          return createErrorResponse({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to retrieve order statistics",
            timestamp: new Date().toISOString(),
          });
        }
      },
    );
  }

  /**
   * Get revenue for a farm or customer
   *
   * @param entityId - Farm ID or Customer ID
   * @param entityType - "farm" or "customer"
   * @param startDate - Start date
   * @param endDate - End date
   * @returns ServiceResponse with revenue amount
   */
  async getRevenue(
    entityId: string,
    entityType: "farm" | "customer",
    startDate: Date,
    endDate: Date,
  ): Promise<ServiceResponse<number>> {
    return await traceServiceOperation(
      "OrderService",
      "getRevenue",
      { "entity.id": entityId, "entity.type": entityType },
      async (span) => {
        try {
          const statsRequest: OrderStatisticsRequest = {
            startDate,
            endDate,
          };

          if (entityType === "farm") {
            statsRequest.farmId = entityId;
          } else {
            statsRequest.customerId = entityId;
          }

          const stats = await this.repository.getOrderStatistics(
            statsRequest as any,
          );

          return createSuccessResponse(stats.totalRevenue, {
            message: "Revenue calculated successfully",
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          return createErrorResponse({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to calculate revenue",
            timestamp: new Date().toISOString(),
          });
        }
      },
    );
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  /**
   * Validate order creation data
   */
  private async validateOrderCreation(
    data: CreateOrderRequest,
  ): Promise<OrderValidationResult> {
    const errors: OrderValidationResult["errors"] = [];
    const warnings: OrderValidationResult["warnings"] = [];

    // Required fields
    if (!data.customerId) {
      errors.push({
        field: "customerId",
        message: "Customer ID is required",
        code: "CUSTOMER_ID_REQUIRED",
      });
    }

    if (!data.farmId) {
      errors.push({
        field: "farmId",
        message: "Farm ID is required",
        code: "FARM_ID_REQUIRED",
      });
    }

    if (!data.items || data.items.length === 0) {
      errors.push({
        field: "items",
        message: "Order must contain at least one item",
        code: "ITEMS_REQUIRED",
      });
    }

    if (!data.fulfillmentMethod) {
      errors.push({
        field: "fulfillmentMethod",
        message: "Fulfillment method is required",
        code: "FULFILLMENT_METHOD_REQUIRED",
      });
    }

    // Delivery address required for delivery
    if (data.fulfillmentMethod === "DELIVERY" && !data.deliveryAddressId) {
      errors.push({
        field: "deliveryAddressId",
        message: "Delivery address is required for delivery orders",
        code: "DELIVERY_ADDRESS_REQUIRED",
      });
    }

    // Warnings
    if (data.scheduledDate && data.scheduledDate < new Date()) {
      warnings.push({
        field: "scheduledDate",
        message: "Scheduled date is in the past",
        severity: "high",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate inventory availability
   */
  private async validateInventory(
    items: CreateOrderRequest["items"],
  ): Promise<OrderValidationResult> {
    const errors: OrderValidationResult["errors"] = [];

    for (const item of items) {
      const product = await this.productRepo.findById(item.productId);

      if (!product) {
        errors.push({
          field: `items.${item.productId}`,
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND",
        });
        continue;
      }

      if (product.status !== "ACTIVE") {
        errors.push({
          field: `items.${item.productId}`,
          message: `Product ${product.name} is not available`,
          code: "PRODUCT_NOT_AVAILABLE",
        });
      }

      // Check inventory if product has inventory tracking
      const inventory = product.inventory as any;
      if (inventory && typeof inventory === "object") {
        const available =
          Number(inventory.quantity || 0) -
          Number(inventory.reservedQuantity || 0);
        if (available < item.quantity) {
          errors.push({
            field: `items.${item.productId}`,
            message: `Insufficient stock for ${product.name}. Available: ${available}`,
            code: "INSUFFICIENT_STOCK",
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Calculate order totals
   */
  private async calculateOrderTotals(
    items: CreateOrderRequest["items"],
    fulfillmentMethod: string,
  ): Promise<OrderTotals> {
    let subtotal = 0;

    // Calculate subtotal
    for (const item of items) {
      const product = await this.productRepo.findById(item.productId);
      if (product) {
        const price = item.price || Number(product.price);
        subtotal += price * item.quantity;
      }
    }

    // Calculate fees
    const deliveryFee =
      fulfillmentMethod === "DELIVERY" ? this.DELIVERY_FEE_BASE : 0;
    const platformFee = subtotal * this.PLATFORM_FEE_RATE;
    const tax = subtotal * this.TAX_RATE;
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
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): boolean {
    const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PREPARING", "CANCELLED"],
      PREPARING: ["READY", "CANCELLED"],
      READY: ["FULFILLED"],
      FULFILLED: ["COMPLETED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Build order filters for queries
   */
  private buildOrderFilters(filters: any): any {
    const where: any = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.farmId) {
      where.farmId = filters.farmId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.fulfillmentMethod) {
      where.fulfillmentMethod = filters.fulfillmentMethod;
    }

    if (filters.dateRange) {
      where.createdAt = {};
      if (filters.dateRange.start) {
        where.createdAt.gte = filters.dateRange.start;
      }
      if (filters.dateRange.end) {
        where.createdAt.lte = filters.dateRange.end;
      }
    }

    return where;
  }

  /**
   * List orders with filters and pagination
   *
   * @param options - Filtering and pagination options
   * @returns ServiceResponse with paginated orders
   */
  async getOrders(
    options: GetOrdersRequest = {},
  ): Promise<ServiceResponse<PaginatedOrdersResult>> {
    return this.safeExecute("getOrders", async () => {
      const {
        page = 1,
        limit = 20,
        customerId,
        farmId,
        status,
        paymentStatus,
        fulfillmentMethod,
        startDate,
        endDate,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      if (customerId) where.customerId = customerId;
      if (farmId) where.farmId = farmId;
      if (status) where.status = status;
      if (paymentStatus) where.paymentStatus = paymentStatus;
      if (fulfillmentMethod) where.fulfillmentMethod = fulfillmentMethod;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }
      if (search) {
        where.OR = [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { customer: { name: { contains: search, mode: "insensitive" } } },
          { farm: { name: { contains: search, mode: "insensitive" } } },
        ];
      }

      // Fetch orders and total count
      const [orders, total] = await Promise.all([
        this.database.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            customer: { select: { id: true, name: true, email: true } },
            farm: { select: { id: true, name: true, slug: true } },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    primaryPhotoUrl: true,
                    unit: true,
                  },
                },
              },
            },
            deliveryAddress: true,
          },
        }),
        this.database.order.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return this.success({
        orders: orders as any[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      });
    });
  }
}

// ============================================================================
// TYPES FOR getOrders RETURN
// ============================================================================

interface PaginatedOrdersResult {
  orders: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Export singleton instance
export const orderService = new OrderService();
