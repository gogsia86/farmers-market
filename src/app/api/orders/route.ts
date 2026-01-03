/**
 * 🛒 Orders API - Divine Order Management
 * Handles order creation and retrieval
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { auth } from "@/lib/auth";
import { ValidationError } from "@/lib/services/base.service";
import { orderService } from "@/lib/services/order.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Create order validation schema
 */
const CreateOrderSchema = z.object({
  farmId: z.string().min(1, "Farm ID is required"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        priceUSD: z.number().min(0, "Price must be non-negative"),
      })
    )
    .min(1, "Order must have at least one item"),
  deliveryAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "ZIP code is required"),
    country: z.string().optional(),
  }),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

/**
 * GET /api/orders
 * Retrieve orders with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to view orders",
          },
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status") as any;
    const farmId = searchParams.get("farmId") || undefined;

    // Build filters based on user role
    const filters: any = {};

    if (session.user.role === "FARMER") {
      // Farmers see only their farm's orders
      if (farmId) {
        filters.farmId = farmId;
      } else {
        // Get farmer's farms
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FARM_ID_REQUIRED",
              message: "Farmers must specify a farmId",
            },
          },
          { status: 400 }
        );
      }
    } else if (session.user.role === "CONSUMER") {
      // Consumers see only their orders
      filters.customerId = session.user.id;
    }
    // Admins see all orders (no additional filters)

    if (status) {
      filters.status = status;
    }

    const { orders, total } = await orderService.getOrders(
      filters,
      page,
      limit
    );

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch orders",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to create an order",
          },
        },
        { status: 401 }
      );
    }

    // Only consumers can create orders
    if (session.user.role !== "CONSUMER") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_ERROR",
            message: "Only consumers can create orders",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request
    const validation = CreateOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid order data",
            details: validation.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const orderData = validation.data;

    // Create order
    const order = await orderService.createOrder({
      customerId: session.user.id,
      farmId: orderData.farmId,
      items: orderData.items,
      deliveryAddress: {
        street: orderData.deliveryAddress.street,
        city: orderData.deliveryAddress.city,
        state: orderData.deliveryAddress.state,
        zipCode: orderData.deliveryAddress.zipCode,
        country: orderData.deliveryAddress.country || "US",
      },
      deliveryInstructions: orderData.deliveryInstructions,
      paymentMethod: orderData.paymentMethod,
    });

    return NextResponse.json(
      {
        success: true,
        data: order,
        meta: {
          timestamp: new Date().toISOString(),
          message: "Order created successfully",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            field: (error as any).field,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_CREATION_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to create order",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
