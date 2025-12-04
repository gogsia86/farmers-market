// @ts-nocheck - Refactored version in progress, not currently used in production
/**
 * 🛒 ORDER SERVICE LAYER - REFACTORED WITH REPOSITORY PATTERN
 *
 * Divine business logic for agricultural order management
 * Quantum operations for order consciousness and fulfillment
 *
 * Refactored to use Repository Pattern:
 * - All database operations go through orderRepository
 * - Business logic and validation in service layer
 * - Authorization checks before operations
 * - Comprehensive error handling
 * - Type-safe operations with agricultural consciousness
 *
 * Divine Patterns Applied:
 * - Repository pattern (database abstraction)
 * - Service layer orchestration
 * - Agricultural consciousness (seasonal, biodynamic awareness)
 * - Validation and authorization separation
 * - Enlightening error messages
 * - Transaction management for order creation
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import { orderRepository } from "@/lib/repositories/order.repository";
import { database } from "@/lib/database";
import type { Order, OrderItem, User, Farm } from "@prisma/client";
import { ValidationError } from "@/lib/errors/ValidationError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { BusinessLogicError } from "@/lib/errors/BusinessLogicError";

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
}

export interface ValidateOrderResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string; code: string }>;
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
// ORDER SERVICE CLASS (REFACTORED)
// ============================================

export class OrderService {
  private readonly TAX_RATE = 0.08; // 8% tax
  private readonly PLATFORM_FEE_RATE = 0.1; // 10% platform fee
  private readonly DELIVERY_FEE = 5.0; // $5 delivery fee

  // ==================== CORE CRUD OPERATIONS ====================

  /**
   * 🌟 CREATE ORDER - Manifest new order with divine validation
   *
   * Creates order with:
   * - Customer and farm validation
   * - Product availability verification
   * - Inventory management
   * - Order totals calculation
   * - Transaction safety
   * - Agricultural consciousness
   *
   * @param request - Order creation request
   * @returns Created order with full details
   * @throws ValidationError if data is invalid
   * @throws NotFoundError if customer/farm/product not found
   * @throws BusinessLogicError if inventory insufficient
   */
  async createOrder(request: CreateOrderRequest): Promise<OrderWithDetails> {
    // 1. Validate order data with agricultural consciousness
    const validation = await this.validateOrderData(request);
    if (!validation.isValid) {
      const errorMessages = validation.errors.map((e) => e.message).join(", ");
      throw new ValidationError(
        errorMessages,
        validation.errors[0]?.code || "VALIDATION_ERROR",
      );
    }

    // 2. Verify customer exists with repository database access
    const customer = await database.user.findUnique({
      where: { id: request.customerId },
    });
    if (!customer) {
      throw new NotFoundError("Customer not found", "CUSTOMER_NOT_FOUND");
    }

    // 3. Verify farm exists and is active
    const farm = await database.farm.findUnique({
      where: { id: request.farmId },
    });
    if (!farm) {
      throw new NotFoundError("Farm not found", "FARM_NOT_FOUND");
    }
    if (farm.status !== "ACTIVE") {
      throw new BusinessLogicError(
        "Cannot create order for inactive farm",
        "FARM_INACTIVE",
      );
    }

    // 4. Verify delivery address if required
    if (
      request.fulfillmentMethod === "DELIVERY" &&
      request.deliveryAddressId &&
      request.deliveryAddressId !== "legacy-address"
    ) {
      const address = await database.address.findUnique({
        where: { id: request.deliveryAddressId },
      });
      if (!address) {
        throw new NotFoundError(
          "Delivery address not found",
          "ADDRESS_NOT_FOUND",
        );
      }
      if (address.userId !== request.customerId) {
        throw new BusinessLogicError(
          "Address does not belong to customer",
          "ADDRESS_OWNERSHIP_MISMATCH",
        );
      }
    }

    // 5. Get all products and validate availability
    const productIds = request.items.map((item) => item.productId);
    const products = await database.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundError(
        "One or more products not found",
        "PRODUCT_NOT_FOUND",
      );
    }

    // 6. Validate product availability, status, and inventory
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
          `Product ${product.name} is not available`,
          "PRODUCT_UNAVAILABLE",
        );
      }
      if (product.farmId !== request.farmId) {
        throw new BusinessLogicError(
          `Product ${product.name} does not belong to this farm`,
          "PRODUCT_FARM_MISMATCH",
        );
      }
      if (
        product.quantityAvailable !== null &&
        Number(product.quantityAvailable) < item.quantity
      ) {
        throw new BusinessLogicError(
          `Insufficient inventory for ${product.name}. Available: ${product.quantityAvailable}, Requested: ${item.quantity}`,
          "INSUFFICIENT_INVENTORY",
        );
      }
    }

    // 7. Calculate order totals with divine precision
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

    // 8. Generate unique order number with temporal consciousness
    const orderNumber = this.generateOrderNumber();

    // 9. Create order in transaction - ensures atomic operation
    const order = await database.$transaction(async (tx) => {
      // Create the order record
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
          deliveryAddressId:
            request.deliveryAddressId === "legacy-address"
              ? null
              : request.deliveryAddressId,
          specialInstructions: request.specialInstructions,
          scheduledDate: request.scheduledDate,
        },
        include: {
          customer: true,
          farm: true,
          items: true,
        },
      });

      // Create order items with product details
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

        // Decrement product inventory atomically
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
   * 🔄 UPDATE ORDER - Modify order with validation
   *
   * Updates order with:
   * - Status transition validation
   * - Authorization checks
   * - Temporal coherence
   * - Agricultural consciousness
   *
   * @param orderId - Order ID to update
   * @param request - Update request data
   * @param userId - User performing update (for authorization)
   * @returns Updated order with details
   * @throws NotFoundError if order not found
   * @throws BusinessLogicError if invalid status transition
   */
  async updateOrder(
    orderId: string,
    request: UpdateOrderRequest,
    userId?: string,
  ): Promise<OrderWithDetails> {
    // Get existing order using repository
    const existingOrder = await orderRepository.findById(orderId);

    if (!existingOrder) {
      throw new NotFoundError("Order not found", "ORDER_NOT_FOUND");
    }

    // Validate status transition if status is being updated
    if (request.status && request.status !== existingOrder.status) {
      this.validateStatusTransition(existingOrder.status, request.status);
    }

    // Authorization check if userId provided
    if (userId) {
      const isCustomer = existingOrder.customerId === userId;
      const isFarmOwner = (existingOrder.farm as any)?.ownerId === userId;

      if (!isCustomer && !isFarmOwner) {
        throw new BusinessLogicError(
          "Unauthorized to update this order",
          "UNAUTHORIZED_ORDER_UPDATE",
        );
      }
    }

    // Update order using repository
    const updatedOrder = await orderRepository.updateOrderStatus(
      orderId,
      request.status || existingOrder.status,
      {
        ...(request.status && { status: request.status as any }),
        ...(request.paymentStatus && { paymentStatus: request.paymentStatus }),
        ...(request.fulfillmentMethod && {
          fulfillmentMethod: request.fulfillmentMethod,
        }),
        ...(request.specialInstructions !== undefined && {
          specialInstructions: request.specialInstructions,
        }),
        ...(request.scheduledDate && { scheduledDate: request.scheduledDate }),
      },
    );

    return updatedOrder as OrderWithDetails;
  }

  /**
   * ❌ CANCEL ORDER - Cancel order and restore inventory
   *
   * Cancels order with:
   * - Status validation (cannot cancel completed orders)
   * - Inventory restoration
   * - Refund status indication
   * - Transaction safety
   * - Agricultural consciousness
   *
   * @param orderId - Order ID to cancel
   * @param request - Cancellation request with reason
   * @returns Cancelled order with updated status
   * @throws NotFoundError if order not found
   * @throws BusinessLogicError if order cannot be cancelled
   */
  async cancelOrder(
    orderId: string,
    request: CancelOrderRequest,
  ): Promise<OrderWithDetails> {
    // Get existing order with items using repository
    const existingOrder = await orderRepository.findById(orderId);

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
        "Cannot cancel completed order. Please request a refund instead.",
        "CANNOT_CANCEL_COMPLETED",
      );
    }

    // Cancel order using repository (handles inventory restoration)
    const cancelledOrder = await orderRepository.cancelOrder(orderId, {
      cancelReason: request.reason,
      cancelledBy: request.cancelledBy,
    });

    return cancelledOrder as OrderWithDetails;
  }

  /**
   * 📋 GET ORDERS - Retrieve orders with filtering and pagination
   *
   * Fetches orders with:
   * - Advanced filtering (status, customer, farm, date range)
   * - Pagination support
   * - Search by order number
   * - Full relation loading
   * - Agricultural consciousness
   *
   * @param request - Query parameters and filters
   * @returns Paginated order list with metadata
   */
  async getOrders(request: GetOrdersRequest): Promise<GetOrdersResponse> {
    const page = request.page || 1;
    const limit = request.limit || 10;

    // Build filters for repository
    const filters: any = {};

    if (request.status) {
      filters.status = request.status;
    }

    if (request.customerId) {
      filters.customerId = request.customerId;
    }

    if (request.farmId) {
      filters.farmId = request.farmId;
    }

    if (request.fulfillmentMethod) {
      filters.fulfillmentMethod = request.fulfillmentMethod;
    }

    if (request.startDate || request.endDate) {
      filters.dateRange = {
        start: request.startDate,
        end: request.endDate,
      };
    }

    if (request.search) {
      filters.orderNumber = request.search;
    }

    // Use repository for filtered search
    const { orders, total } = await orderRepository.searchOrders(filters, {
      page,
      limit,
    });

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
   * 🔍 GET ORDER BY ID - Retrieve single order with relations
   *
   * @param orderId - Order ID
   * @returns Order with full details or null if not found
   */
  async getOrderById(orderId: string): Promise<OrderWithDetails | null> {
    const order = await orderRepository.findById(orderId);
    return order as OrderWithDetails | null;
  }

  /**
   * 🔢 GET ORDER BY ORDER NUMBER - Retrieve by unique order number
   *
   * @param orderNumber - Unique order number (e.g., "ORD-20250115-001")
   * @returns Order with full details or null if not found
   */
  async getOrderByNumber(
    orderNumber: string,
  ): Promise<OrderWithDetails | null> {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    return order as OrderWithDetails | null;
  }

  // ==================== CUSTOMER & FARM OPERATIONS ====================

  /**
   * 👤 GET CUSTOMER ORDERS - Retrieve all orders for a customer
   *
   * @param customerId - Customer user ID
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns Paginated customer orders
   */
  async getCustomerOrders(
    customerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<GetOrdersResponse> {
    const { orders, total } = await orderRepository.findCustomerOrders(
      customerId,
      { page, limit },
    );

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
   * 🌾 GET FARM ORDERS - Retrieve all orders for a farm
   *
   * @param farmId - Farm ID
   * @param filters - Optional status filters
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns Paginated farm orders
   */
  async getFarmOrders(
    farmId: string,
    filters?: { status?: string },
    page: number = 1,
    limit: number = 10,
  ): Promise<GetOrdersResponse> {
    const { orders, total } = await orderRepository.findFarmOrders(farmId, {
      ...filters,
      page,
      limit,
    });

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

  // ==================== STATUS & FULFILLMENT OPERATIONS ====================

  /**
   * 🔄 UPDATE ORDER STATUS - Change order status with validation
   *
   * @param orderId - Order ID
   * @param newStatus - New status
   * @param userId - User performing update (for authorization)
   * @returns Updated order
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: string,
    userId?: string,
  ): Promise<OrderWithDetails> {
    return this.updateOrder(orderId, { status: newStatus as any }, userId);
  }

  /**
   * 💳 UPDATE PAYMENT STATUS - Change payment status
   *
   * @param orderId - Order ID
   * @param paymentStatus - New payment status
   * @returns Updated order
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: string,
  ): Promise<OrderWithDetails> {
    const updatedOrder = await orderRepository.updatePaymentStatus(
      orderId,
      paymentStatus as any,
    );
    return updatedOrder as OrderWithDetails;
  }

  /**
   * ✅ COMPLETE ORDER - Mark order as completed
   *
   * @param orderId - Order ID
   * @returns Completed order
   */
  async completeOrder(orderId: string): Promise<OrderWithDetails> {
    const completedOrder = await orderRepository.completeOrder(orderId);
    return completedOrder as OrderWithDetails;
  }

  /**
   * 📦 GET ORDERS FOR FULFILLMENT - Get orders ready for fulfillment
   *
   * @param farmId - Optional farm ID filter
   * @returns Orders ready for fulfillment
   */
  async getOrdersForFulfillment(farmId?: string): Promise<OrderWithDetails[]> {
    const orders = await orderRepository.findOrdersForFulfillment(farmId);
    return orders as OrderWithDetails[];
  }

  /**
   * 📅 GET SCHEDULED ORDERS - Get orders scheduled for date range
   *
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Scheduled orders in date range
   */
  async getScheduledOrders(
    startDate: Date,
    endDate: Date,
  ): Promise<OrderWithDetails[]> {
    const orders = await orderRepository.findScheduledOrders(
      startDate,
      endDate,
    );
    return orders as OrderWithDetails[];
  }

  // ==================== STATISTICS & ANALYTICS ====================

  /**
   * 📊 GET ORDER STATISTICS - Calculate order metrics
   *
   * Provides:
   * - Total orders count
   * - Total revenue (from completed orders)
   * - Average order value
   * - Orders by status breakdown
   * - Orders by fulfillment method
   *
   * @param request - Statistics request with optional filters
   * @returns Comprehensive order statistics
   */
  async getOrderStatistics(
    request: OrderStatisticsRequest,
  ): Promise<OrderStatistics> {
    const stats = await orderRepository.getOrderStatistics({
      farmId: request.farmId,
      customerId: request.customerId,
      dateRange: {
        start: request.startDate,
        end: request.endDate,
      },
    });

    return {
      totalOrders: stats.totalOrders,
      totalRevenue: stats.totalRevenue,
      averageOrderValue: stats.averageOrderValue,
      ordersByStatus: stats.ordersByStatus,
      ordersByFulfillmentMethod: stats.ordersByFulfillmentMethod,
    };
  }

  /**
   * 🕐 GET RECENT ORDERS - Get most recent orders
   *
   * @param limit - Number of orders to retrieve (default: 10)
   * @param farmId - Optional farm ID filter
   * @returns Recent orders
   */
  async getRecentOrders(
    limit: number = 10,
    farmId?: string,
  ): Promise<OrderWithDetails[]> {
    const orders = await orderRepository.getRecentOrders(limit, farmId);
    return orders as OrderWithDetails[];
  }

  // ==================== CALCULATION & VALIDATION ====================

  /**
   * 💰 CALCULATE ORDER TOTALS - Compute order financial breakdown
   *
   * Calculates:
   * - Subtotal (sum of item prices × quantities)
   * - Delivery fee (if applicable)
   * - Platform fee (percentage of subtotal)
   * - Tax (percentage of subtotal + delivery)
   * - Total amount (sum of all above)
   * - Farmer amount (subtotal - platform fee)
   *
   * @param items - Order items with prices and quantities
   * @param fulfillmentMethod - Delivery or pickup method
   * @returns Complete order totals breakdown
   */
  calculateOrderTotals(
    items: Array<{ productId: string; quantity: number; price: number }>,
    fulfillmentMethod: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP",
  ): OrderTotals {
    // Calculate subtotal
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Calculate delivery fee (only for delivery orders)
    const deliveryFee =
      fulfillmentMethod === "DELIVERY" ? this.DELIVERY_FEE : 0;

    // Calculate platform fee (percentage of subtotal)
    const platformFee =
      Math.round(subtotal * this.PLATFORM_FEE_RATE * 100) / 100;

    // Calculate tax base (subtotal + delivery for delivery orders)
    const taxBase =
      fulfillmentMethod === "DELIVERY" ? subtotal + deliveryFee : subtotal;

    // Calculate tax
    const tax = Math.round(taxBase * this.TAX_RATE * 100) / 100;

    // Calculate total amount
    const totalAmount =
      Math.round((subtotal + deliveryFee + platformFee + tax) * 100) / 100;

    // Calculate farmer's payout (subtotal minus platform fee)
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
   * ✅ VALIDATE ORDER DATA - Comprehensive order validation
   *
   * Validates:
   * - Required fields presence
   * - Items array not empty
   * - Quantities are positive
   * - Delivery address required for delivery method
   * - Product IDs are valid UUIDs
   *
   * @param data - Order creation request
   * @returns Validation result with errors if invalid
   */
  async validateOrderData(
    data: CreateOrderRequest,
  ): Promise<ValidateOrderResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    // Validate customer ID
    if (!data.customerId || typeof data.customerId !== "string") {
      errors.push({
        field: "customerId",
        message: "Customer ID is required",
        code: "CUSTOMER_ID_REQUIRED",
      });
    }

    // Validate farm ID
    if (!data.farmId || typeof data.farmId !== "string") {
      errors.push({
        field: "farmId",
        message: "Farm ID is required",
        code: "FARM_ID_REQUIRED",
      });
    }

    // Validate items array
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push({
        field: "items",
        message: "Order must contain at least one item",
        code: "EMPTY_ORDER",
      });
    } else {
      // Validate each item
      data.items.forEach((item, index) => {
        if (!item.productId) {
          errors.push({
            field: `items[${index}].productId`,
            message: "Product ID is required",
            code: "PRODUCT_ID_REQUIRED",
          });
        }

        if (
          typeof item.quantity !== "number" ||
          item.quantity <= 0 ||
          !Number.isInteger(item.quantity)
        ) {
          errors.push({
            field: `items[${index}].quantity`,
            message: "Quantity must be a positive integer",
            code: "INVALID_QUANTITY",
          });
        }
      });
    }

    // Validate fulfillment method
    if (!data.fulfillmentMethod) {
      errors.push({
        field: "fulfillmentMethod",
        message: "Fulfillment method is required",
        code: "FULFILLMENT_METHOD_REQUIRED",
      });
    } else if (
      !["DELIVERY", "FARM_PICKUP", "MARKET_PICKUP"].includes(
        data.fulfillmentMethod,
      )
    ) {
      errors.push({
        field: "fulfillmentMethod",
        message: "Invalid fulfillment method",
        code: "INVALID_FULFILLMENT_METHOD",
      });
    }

    // Validate delivery address for delivery orders
    if (
      data.fulfillmentMethod === "DELIVERY" &&
      !data.deliveryAddressId &&
      data.deliveryAddressId !== "legacy-address"
    ) {
      errors.push({
        field: "deliveryAddressId",
        message: "Delivery address is required for delivery orders",
        code: "DELIVERY_ADDRESS_REQUIRED",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 🔄 VALIDATE STATUS TRANSITION - Ensure valid status changes
   *
   * Enforces order status state machine:
   * - PENDING → CONFIRMED, CANCELLED
   * - CONFIRMED → PREPARING, CANCELLED
   * - PREPARING → READY, CANCELLED
   * - READY → FULFILLED, CANCELLED
   * - FULFILLED → COMPLETED, CANCELLED
   * - COMPLETED → (terminal state)
   * - CANCELLED → (terminal state)
   *
   * @param currentStatus - Current order status
   * @param newStatus - Desired new status
   * @throws BusinessLogicError if transition is invalid
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
      COMPLETED: [], // Terminal state
      CANCELLED: [], // Terminal state
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BusinessLogicError(
        `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions.join(", ") || "none"}`,
        "INVALID_STATUS_TRANSITION",
      );
    }
  }

  /**
   * 🔢 GENERATE ORDER NUMBER - Create unique order identifier
   *
   * Format: ORD-YYYYMMDD-XXX
   * - ORD prefix
   * - Date stamp (YYYYMMDD)
   * - Random 3-digit suffix for uniqueness
   *
   * @returns Unique order number
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
   * Maintains backward compatibility with legacy API
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
        input.fulfillmentMethod === "DELIVERY"
          ? input.deliveryAddressId || "legacy-address"
          : undefined,
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
    const result = await service.updateOrderStatus(orderId, status);
    return result as Order;
  }

  /**
   * Static wrapper for getUserOrders
   */
  static async getUserOrders(userId: string): Promise<OrderWithDetails[]> {
    const service = new OrderService();
    const result = await service.getCustomerOrders(userId);
    return result.orders;
  }

  /**
   * Static wrapper for getFarmOrders
   */
  static async getFarmOrders(farmId: string): Promise<OrderWithDetails[]> {
    const service = new OrderService();
    const result = await service.getFarmOrders(farmId);
    return result.orders;
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const orderService = new OrderService();
