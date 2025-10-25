// src/app/api/orders/farm/[farmId]/route.ts
import { auth } from "@/lib/auth";
import { OrderService } from "@/lib/services/order.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Query parameters schema
const FarmOrdersQuerySchema = z.object({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "READY_FOR_PICKUP",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

/**
 * GET /api/orders/farm/[farmId] - Get farm's orders
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { farmId: string } }
) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Authorization - only farm owner can access farm orders
    if (session.user.farmId !== params.farmId) {
      return NextResponse.json(
        { error: "Unauthorized to access farm orders" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryValidation = FarmOrdersQuerySchema.safeParse({
      status: searchParams.get("status"),
      limit: Number(searchParams.get("limit")) || 50,
      offset: Number(searchParams.get("offset")) || 0,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    // Get farm orders
    const orders = await OrderService.getFarmOrders(params.farmId);

    // Filter by status if provided
    let filteredOrders = orders;
    if (queryValidation.data.status) {
      filteredOrders = orders.filter(
        (order) => order.status === queryValidation.data.status
      );
    }

    // Apply pagination
    const { limit, offset } = queryValidation.data;
    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    return NextResponse.json({
      orders: paginatedOrders,
      pagination: {
        total: filteredOrders.length,
        limit,
        offset,
        hasMore: offset + limit < filteredOrders.length,
      },
    });
  } catch (error) {
    console.error("Farm orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch farm orders" },
      { status: 500 }
    );
  }
}
