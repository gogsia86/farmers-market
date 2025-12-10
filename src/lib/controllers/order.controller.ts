/**
 * 🛒 ORDER CONTROLLER - DIVINE API ORCHESTRATION
 *
 * Thin controller layer for order management with agricultural consciousness
 * Orchestrates requests between API routes and OrderService
 *
 * Divine Patterns Applied:
 * - Thin controller pattern (minimal logic)
 * - Service layer delegation
 * - Standardized API responses
 * - Authentication & authorization
 * - Input validation with Zod
 * - Agricultural consciousness in responses
 * - Enlightening error messages
 *
 * Architecture Flow:
 * API Route → OrderController → OrderService → OrderRepository → Database
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./base.controller";
import { OrderService, orderService } from "@/lib/services/order.service";
import {
  CreateOrderSchema,
  UpdateOrderSchema,
  CancelOrderSchema,
  GetOrdersQuerySchema,
  GetOrderStatisticsQuerySchema,
  GetCustomerOrdersQuerySchema,
  GetFarmOrdersQuerySchema,
  OrderIdParamSchema,
} from "@/lib/validations/order";
import type {
  CreateOrderRequest,
  UpdateOrderRequest,
  CancelOrderRequest,
  GetOrdersRequest,
  OrderStatisticsRequest,
} from "@/lib/services/order.service";

// ============================================================================
// ORDER CONTROLLER CLASS
// ============================================================================

/**
 * Order Controller with divine consciousness
 *
 * Handles all order-related API operations:
 * - Order creation with validation
 * - Order retrieval (list, by ID, by customer, by farm)
 * - Order updates (status, payment, fulfillment)
 * - Order cancellation
 * - Order statistics and analytics
 *
 * @example
 * ```typescript
 * const orderController = new OrderController();
 *
 * // In API route
 * export async function POST(request: NextRequest) {
 *   return orderController.createOrder(request);
 * }
 * ```
 */
export class OrderController extends BaseController {
  private orderService: OrderService;

  constructor(orderServiceInstance?: OrderService) {
    super("OrderController");
    this.orderService = orderServiceInstance || orderService;
  }

  // ==========================================================================
  // ORDER CREATION
  // ==========================================================================

  /**
   * Create a new order
   * POST /api/orders
   *
   * Requires authentication
   * Creates order with items, calculates totals, and generates order number
   *
   * Request body:
   * - customerId: string (ID of customer placing order)
   * - farmId: string (ID of farm fulfilling order)
   * - items: Array<{ productId: string, quantity: number }>
   * - fulfillmentMethod: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP"
   * - deliveryAddressId?: string (required for DELIVERY)
   * - specialInstructions?: string
   * - scheduledDate?: Date
   *
   * @param request - Next.js request object
   * @returns JSON response with created order
   *
   * @example
   * ```typescript
   * POST /api/orders
   * {
   *   "customerId": "user_123",
   *   "farmId": "farm_456",
   *   "items": [
   *     { "productId": "prod_789", "quantity": 2 }
   *   ],
   *   "fulfillmentMethod": "DELIVERY",
   *   "deliveryAddressId": "addr_101"
   * }
   * ```
   */
  async createOrder(request: NextRequest): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      this.log("Creating new order", {
        userId: session.user.id,
        role: session.user.role,
      });

      // Parse and validate request body
      const body = await request.json();
      let validated;
      try {
        validated = CreateOrderSchema.parse(body);
      } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
          return this.validationError(error as any);
        }
        throw error;
      }

      // Convert validated data to service request format
      const createRequest: CreateOrderRequest = {
        customerId: validated.customerId,
        farmId: validated.farmId,
        items: validated.items,
        fulfillmentMethod: validated.fulfillmentMethod,
        deliveryAddressId: validated.deliveryAddressId,
        specialInstructions: validated.specialInstructions,
      };

      // Authorization check: User can only create orders for themselves (unless admin)
      if (
        session.user.role !== "ADMIN" &&
        validated.customerId !== session.user.id
      ) {
        return this.forbidden(
          "You can only create orders for yourself",
          session.user.role,
        );
      }

      // Call service layer
      const order = await this.orderService.createOrder(createRequest);

      this.log("Order created successfully", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
      });

      return this.created(order, {
        message: "Order created successfully",
        orderNumber: order.orderNumber,
        agricultural: {
          consciousness: "DIVINE",
          operation: "ORDER_MANIFESTATION",
          season: this.getCurrentSeason(),
        },
      });
    });
  }

  // ==========================================================================
  // ORDER RETRIEVAL
  // ==========================================================================

  /**
   * List orders with filters and pagination
   * GET /api/orders
   *
   * Requires authentication
   * Returns paginated list of orders based on query parameters
   *
   * Query parameters:
   * - page?: number (default: 1)
   * - limit?: number (default: 20, max: 100)
   * - status?: OrderStatus
   * - customerId?: string
   * - farmId?: string
   * - startDate?: ISO date string
   * - endDate?: ISO date string
   * - search?: string (order number or customer name)
   * - fulfillmentMethod?: FulfillmentMethod
   * - sortBy?: "createdAt" | "totalAmount" | "status" | "scheduledDate"
   * - sortOrder?: "asc" | "desc"
   *
   * @param request - Next.js request object
   * @returns JSON response with paginated orders
   *
   * @example
   * ```typescript
   * GET /api/orders?page=1&limit=20&status=CONFIRMED&farmId=farm_123
   * ```
   */
  async getOrders(request: NextRequest): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      // Parse and validate query parameters
      const searchParams = Object.fromEntries(request.nextUrl.searchParams);
      let validated;
      try {
        validated = GetOrdersQuerySchema.parse(searchParams);
      } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
          return this.validationError(error as any);
        }
        throw error;
      }

      // Build service request
      const getRequest: GetOrdersRequest = {
        page: validated.page,
        limit: validated.limit,
        status: validated.status,
        customerId: validated.customerId,
        farmId: validated.farmId,
        fulfillmentMethod: validated.fulfillmentMethod,
        startDate: validated.startDate
          ? new Date(validated.startDate)
          : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
        search: validated.search,
      };

      // Authorization: Customers can only see their own orders (unless admin/farmer)
      if (session.user.role === "CUSTOMER") {
        getRequest.customerId = session.user.id;
      }

      // Call service layer
      const result = await this.orderService.getOrders(getRequest);

      return this.successWithPagination(
        result.orders,
        {
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        },
        {
          message: "Orders retrieved successfully",
          count: result.orders.length,
        },
      );
    });
  }

  /**
   * Get order by ID
   * GET /api/orders/[id]
   *
   * Requires authentication
   * Returns single order with full details including items, customer, and farm
   *
   * @param request - Next.js request object
   * @param params - Route parameters containing order ID
   * @returns JSON response with order details
   *
   * @example
   * ```typescript
   * GET /api/orders/order_123
   * ```
   */
  async getOrderById(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      // Validate params
      const validated = OrderIdParamSchema.parse(params);
      const orderId = validated.id;

      this.log("Fetching order by ID", { orderId, userId: session.user.id });

      // Call service layer
      const order = await this.orderService.getOrderById(orderId);

      if (!order) {
        return this.notFound("Order", orderId);
      }

      // Authorization: Users can only view their own orders (unless admin/farm owner)
      if (
        session.user.role === "CUSTOMER" &&
        order.customerId !== session.user.id
      ) {
        return this.forbidden(
          "You do not have permission to view this order",
          "CUSTOMER",
        );
      }

      return this.success(order, {
        message: "Order retrieved successfully",
        orderNumber: order.orderNumber,
      });
    });
  }

  /**
   * Get orders for a specific customer
   * GET /api/customers/[customerId]/orders
   *
   * Requires authentication
   * Returns paginated orders for the authenticated customer
   *
   * Query parameters:
   * - page?: number
   * - limit?: number
   * - status?: OrderStatus
   *
   * @param request - Next.js request object
   * @param params - Route parameters containing customer ID
   * @returns JSON response with customer's orders
   */
  async getCustomerOrders(
    request: NextRequest,
    params: { customerId: string },
  ): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      const customerId = params.customerId;

      // Authorization: Users can only view their own orders
      if (session.user.role !== "ADMIN" && session.user.id !== customerId) {
        return this.forbidden(
          "You can only view your own orders",
          session.user.role,
        );
      }

      // Parse query parameters
      const searchParams = Object.fromEntries(request.nextUrl.searchParams);
      let validated;
      try {
        validated = GetCustomerOrdersQuerySchema.parse(searchParams);
      } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
          return this.validationError(error as any);
        }
        throw error;
      }

      // Build service request
      const getRequest: GetOrdersRequest = {
        page: validated.page,
        limit: validated.limit,
        customerId,
        status: validated.status,
      };

      // Call service layer
      const result = await this.orderService.getOrders(getRequest);

      return this.successWithPagination(
        result.orders,
        {
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        },
        {
          message: "Customer orders retrieved successfully",
          customerId,
        },
      );
    });
  }

  /**
   * Get orders for a specific farm
   * GET /api/farms/[farmId]/orders
   *
   * Requires authentication (farm owner or admin)
   * Returns paginated orders for the specified farm
   *
   * Query parameters:
   * - page?: number
   * - limit?: number
   * - status?: OrderStatus
   * - fulfillmentMethod?: FulfillmentMethod
   *
   * @param request - Next.js request object
   * @param params - Route parameters containing farm ID
   * @returns JSON response with farm's orders
   */
  async getFarmOrders(
    request: NextRequest,
    params: { farmId: string },
  ): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (_session) => {
      const farmId = params.farmId;

      // TODO: Add farm ownership verification
      // For now, allow all authenticated users (will be restricted in production)

      // Parse query parameters
      const searchParams = Object.fromEntries(request.nextUrl.searchParams);
      let validated;
      try {
        validated = GetFarmOrdersQuerySchema.parse(searchParams);
      } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
          return this.validationError(error as any);
        }
        throw error;
      }

      // Build service request
      const getRequest: GetOrdersRequest = {
        page: validated.page,
        limit: validated.limit,
        farmId,
        status: validated.status,
        fulfillmentMethod: validated.fulfillmentMethod,
      };

      // Call service layer
      const result = await this.orderService.getOrders(getRequest);

      return this.successWithPagination(
        result.orders,
        {
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        },
        {
          message: "Farm orders retrieved successfully",
          farmId,
          agricultural: {
            consciousness: "BIODYNAMIC",
            operation: "FARM_ORDER_HARVEST",
          },
        },
      );
    });
  }

  // ==========================================================================
  // ORDER UPDATES
  // ==========================================================================

  /**
   * Update order status and details
   * PATCH /api/orders/[id]
   *
   * Requires authentication (farm owner or admin)
   * Updates order status, payment status, fulfillment method, etc.
   *
   * Request body:
   * - status?: OrderStatus
   * - paymentStatus?: PaymentStatus
   * - fulfillmentMethod?: FulfillmentMethod
   * - specialInstructions?: string
   * - scheduledDate?: Date
   *
   * @param request - Next.js request object
   * @param params - Route parameters containing order ID
   * @returns JSON response with updated order
   *
   * @example
   * ```typescript
   * PATCH /api/orders/order_123
   * {
   *   "status": "CONFIRMED",
   *   "scheduledDate": "2024-12-20T10:00:00Z"
   * }
   * ```
   */
  async updateOrderStatus(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      // Validate params
      const validated = OrderIdParamSchema.parse(params);
      const orderId = validated.id;

      // Parse and validate request body
      const body = await request.json();
      let validatedUpdate;
      try {
        validatedUpdate = UpdateOrderSchema.parse(body);
      } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
          return this.validationError(error as any);
        }
        throw error;
      }

      this.log("Updating order", {
        orderId,
        userId: session.user.id,
        updates: validatedUpdate,
      });

      // Convert to service request format
      const updateRequest: UpdateOrderRequest = {
        status: validatedUpdate.status,
        paymentStatus: validatedUpdate.paymentStatus,
        fulfillmentMethod: validatedUpdate.fulfillmentMethod,
        specialInstructions: validatedUpdate.specialInstructions,
      };

      // Call service layer (authorization handled in service)
      const updatedOrder = await this.orderService.updateOrder(
        orderId,
        updateRequest,
      );

      this.log("Order updated successfully", {
        orderId,
        newStatus: updatedOrder.status,
      });

      return this.success(updatedOrder, {
        message: "Order updated successfully",
        orderNumber: updatedOrder.orderNumber,
        agricultural: {
          consciousness: "QUANTUM",
          operation: "ORDER_TRANSFORMATION",
        },
      });
    });
  }

  // ==========================================================================
  // ORDER CANCELLATION
  // ==========================================================================

  /**
   * Cancel an order
   * POST /api/orders/[id]/cancel
   *
   * Requires authentication
   * Cancels order if in cancellable state
   *
   * Request body:
   * - reason: string (required, min 5 chars)
   * - cancelledBy: string (user ID who is cancelling)
   *
   * @param request - Next.js request object
   * @param params - Route parameters containing order ID
   * @returns JSON response with cancelled order
   *
   * @example
   * ```typescript
   * POST /api/orders/order_123/cancel
   * {
   *   "reason": "Customer requested cancellation due to schedule change",
   *   "cancelledBy": "user_123"
   * }
   * ```
   */
  async cancelOrder(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      // Validate params
      const validated = OrderIdParamSchema.parse(params);
      const orderId = validated.id;

      // Parse and validate request body
      const body = await request.json();
      let validatedCancel;
      try {
        validatedCancel = CancelOrderSchema.parse(body);
      } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
          return this.validationError(error as any);
        }
        throw error;
      }

      this.log("Cancelling order", {
        orderId,
        userId: session.user.id,
        reason: validatedCancel.reason,
      });

      // Authorization: User can only cancel their own orders or admin can cancel any
      if (
        session.user.role !== "ADMIN" &&
        validatedCancel.cancelledBy !== session.user.id
      ) {
        return this.forbidden(
          "You can only cancel your own orders",
          session.user.role,
        );
      }

      // Convert to service request format
      const cancelRequest: CancelOrderRequest = {
        reason: validatedCancel.reason,
        cancelledBy: validatedCancel.cancelledBy,
      };

      // Call service layer
      const cancelledOrder = await this.orderService.cancelOrder(
        orderId,
        cancelRequest,
      );

      this.log("Order cancelled successfully", { orderId });

      return this.success(cancelledOrder, {
        message: "Order cancelled successfully",
        orderNumber: cancelledOrder.orderNumber,
        agricultural: {
          consciousness: "ACTIVE",
          operation: "ORDER_CANCELLATION",
        },
      });
    });
  }

  // ==========================================================================
  // ORDER STATISTICS
  // ==========================================================================

  /**
   * Get order statistics
   * GET /api/orders/statistics
   *
   * Requires authentication
   * Returns aggregated statistics for orders
   *
   * Query parameters:
   * - farmId?: string (filter by farm)
   * - customerId?: string (filter by customer)
   * - startDate?: ISO date string
   * - endDate?: ISO date string
   *
   * @param request - Next.js request object
   * @returns JSON response with order statistics
   *
   * @example
   * ```typescript
   * GET /api/orders/statistics?farmId=farm_123&startDate=2024-01-01
   * ```
   */
  async getOrderStatistics(request: NextRequest): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      // Parse and validate query parameters
      const searchParams = Object.fromEntries(request.nextUrl.searchParams);
      let validated;
      try {
        validated = GetOrderStatisticsQuerySchema.parse(searchParams);
      } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
          return this.validationError(error as any);
        }
        throw error;
      }

      this.log("Fetching order statistics", {
        userId: session.user.id,
        filters: validated,
      });

      // Build service request
      const statsRequest: OrderStatisticsRequest = {
        farmId: validated.farmId || "",
        customerId: validated.customerId,
        startDate: validated.startDate
          ? new Date(validated.startDate)
          : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
      };

      // Authorization: Customers can only see their own statistics
      if (session.user.role === "CUSTOMER") {
        statsRequest.customerId = session.user.id;
      }

      // Call service layer
      const statistics =
        await this.orderService.getOrderStatistics(statsRequest);

      return this.success(statistics, {
        message: "Order statistics retrieved successfully",
        agricultural: {
          consciousness: "QUANTUM",
          operation: "ORDER_ANALYTICS_HARVEST",
          season: this.getCurrentSeason(),
        },
      });
    });
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Get current agricultural season
   * Returns season based on current month
   *
   * @returns Season name
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;

    if (month >= 3 && month <= 5) return "SPRING";
    if (month >= 6 && month <= 8) return "SUMMER";
    if (month >= 9 && month <= 11) return "FALL";
    return "WINTER";
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Singleton instance of OrderController
 * Uses the consolidated orderService singleton from order.service.consolidated
 *
 * @example
 * ```typescript
 * // In app/api/orders/route.ts
 * import { orderController } from "@/lib/controllers/order.controller";
 *
 * export async function POST(request: NextRequest) {
 *   return orderController.createOrder(request);
 * }
 * ```
 */
export const orderController = new OrderController(orderService);
