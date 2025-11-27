// ============================================================================
// DIVINE ORDERS API ROUTE - GET & POST
// Agricultural Quantum Order Management Endpoints
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/features/order-management/services/order.service";
import type {
  CreateOrderRequest,
  OrderFilterOptions,
  OrderApiResponse,
  PaginatedOrdersResponse,
  OrderWithRelations,
} from "@/features/order-management/types";
import type {
  OrderStatus,
  PaymentStatus,
  FulfillmentMethod,
} from "@prisma/client";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

// ============================================================================
// GET ORDERS - Divine Query Endpoint
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Authentication required to view orders",
          },
        } as OrderApiResponse,
        { status: 401 },
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;

    // Build filters with agricultural consciousness
    const filters: OrderFilterOptions = {
      customerId: searchParams.get("customerId") || undefined,
      farmId: searchParams.get("farmId") || undefined,
      status: searchParams.get("status") as OrderStatus | undefined,
      paymentStatus: searchParams.get("paymentStatus") as
        | PaymentStatus
        | undefined,
      fulfillmentMethod: searchParams.get("fulfillmentMethod") as
        | FulfillmentMethod
        | undefined,
      dateFrom: searchParams.get("dateFrom")
        ? new Date(searchParams.get("dateFrom")!)
        : undefined,
      dateTo: searchParams.get("dateTo")
        ? new Date(searchParams.get("dateTo")!)
        : undefined,
      minTotal: searchParams.get("minTotal")
        ? parseFloat(searchParams.get("minTotal")!)
        : undefined,
      maxTotal: searchParams.get("maxTotal")
        ? parseFloat(searchParams.get("maxTotal")!)
        : undefined,
      searchQuery: searchParams.get("searchQuery") || undefined,
      sortBy:
        (searchParams.get("sortBy") as
          | "createdAt"
          | "updatedAt"
          | "total"
          | "status"
          | "scheduledDate"
          | "orderNumber") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      pageSize: searchParams.get("pageSize")
        ? parseInt(searchParams.get("pageSize")!)
        : 20,
    };

    // Role-based filtering
    if (session.user.role === "CONSUMER") {
      // Customers can only see their own orders
      filters.customerId = session.user.id;
    } else if (session.user.role === "FARMER") {
      // Farmers can only see orders for their farms
      // If farmId is provided, validate farmer owns it
      if (filters.farmId) {
        const farm = await database.farm.findUnique({
          where: { id: filters.farmId },
          select: { ownerId: true },
        });

        if (!farm || farm.ownerId !== session.user.id) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "FORBIDDEN",
                message: "You do not have access to this farm's orders",
              },
            } as OrderApiResponse,
            { status: 403 },
          );
        }
      } else {
        // Get all farms owned by farmer
        const farms = await database.farm.findMany({
          where: { ownerId: session.user.id },
          select: { id: true },
        });

        if (farms.length === 0) {
          // Farmer has no farms, return empty result
          return NextResponse.json({
            success: true,
            data: {
              orders: [],
              pagination: {
                page: 1,
                pageSize: filters.pageSize || 20,
                totalCount: 0,
                totalPages: 0,
                hasNext: false,
                hasPrevious: false,
              },
              filters,
            },
            meta: {
              timestamp: new Date(),
            },
            agricultural: {
              season: getCurrentSeason(),
              consciousness: "DIVINE",
              orderFlow: "QUANTUM_RETRIEVAL",
            },
          } as OrderApiResponse<PaginatedOrdersResponse>);
        }

        // Set farmId filter to farmer's farms (only first one for now)
        filters.farmId = farms[0]?.id;
      }
    }
    // ADMIN can see all orders (no additional filtering)

    // Fetch orders with divine consciousness
    const result = await orderService.getOrders(filters);

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date(),
        pagination: result.pagination,
      },
      agricultural: {
        season: getCurrentSeason(),
        consciousness: "DIVINE",
        orderFlow: "QUANTUM_RETRIEVAL",
      },
    } as OrderApiResponse<PaginatedOrdersResponse>);
  } catch (error) {
    console.error("Failed to fetch orders:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch orders",
          details: error instanceof Error ? { stack: error.stack } : undefined,
        },
        meta: {
          timestamp: new Date(),
        },
      } as OrderApiResponse,
      { status: 500 },
    );
  }
}

// ============================================================================
// POST ORDER - Divine Order Creation
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Authentication required to create orders",
          },
        } as OrderApiResponse,
        { status: 401 },
      );
    }

    // Parse request body
    const body: CreateOrderRequest = await request.json();

    // Validate request
    if (!body.farmId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Farm ID is required",
          },
        } as OrderApiResponse,
        { status: 400 },
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Order must contain at least one item",
          },
        } as OrderApiResponse,
        { status: 400 },
      );
    }

    if (!body.fulfillmentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Fulfillment method is required",
          },
        } as OrderApiResponse,
        { status: 400 },
      );
    }

    // Set customer ID from session
    body.customerId = session.user.id;

    // Create order with agricultural consciousness
    const order = await orderService.createOrder(body);

    return NextResponse.json(
      {
        success: true,
        data: order,
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
        agricultural: {
          season: getCurrentSeason(),
          consciousness: "DIVINE",
          orderFlow: "QUANTUM_MANIFESTATION",
        },
      } as OrderApiResponse<OrderWithRelations>,
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create order:", error);

    // Check if it's a validation error
    if (error instanceof Error && error.name === "OrderValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            details: (error as any).errors || undefined,
          },
          meta: {
            timestamp: new Date(),
          },
        } as OrderApiResponse,
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_CREATE_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to create order",
        },
        meta: {
          timestamp: new Date(),
        },
      } as OrderApiResponse,
      { status: 500 },
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current season based on month
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;

  if (month >= 3 && month <= 5) return "SPRING";
  if (month >= 6 && month <= 8) return "SUMMER";
  if (month >= 9 && month <= 11) return "FALL";
  return "WINTER";
}

// ============================================================================
// DIVINE ORDERS API - AGRICULTURAL CONSCIOUSNESS
// Complete order management with quantum REST endpoints
// ============================================================================
