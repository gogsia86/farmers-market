// src/app/api/orders/route.ts
import { auth } from "@/lib/auth";
import { OrderService } from "@/lib/services/order.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const CreateOrderSchema = z.object({
  farmId: z.string(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1),
      })
    )
    .min(1),
  fulfillmentMethod: z.enum(["DELIVERY", "FARM_PICKUP", "MARKET_PICKUP"]),
  deliveryAddressId: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledTimeSlot: z.string().optional(),
  specialInstructions: z.string().optional(),
});

/**
 * POST /api/orders - Create new order
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Create order
    const order = await OrderService.createOrder({
      customerId: session.user.id,
      ...validation.data,
      scheduledDate: validation.data.scheduledDate
        ? new Date(validation.data.scheduledDate)
        : undefined,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders - Get user's orders
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get orders
    const orders = await OrderService.getCustomerOrders(session.user.id);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
