/**
 * 🛒 CHECKOUT CREATE ORDER API ROUTE
 * Creates order(s) from checkout session
 *
 * Features:
 * - Convert cart to order(s)
 * - Validate cart and stock
 * - Create orders per farm
 * - Process payment intent
 * - Clear cart on success
 * - Agricultural consciousness
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkoutService } from "@/lib/services/checkout.service";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const CreateOrderSchema = z.object({
  shippingAddress: z
    .object({
      id: z.string().optional(),
      street: z.string().min(1, "Street address is required"),
      street2: z.string().optional(),
      city: z.string().min(1, "City is required"),
      state: z.string().min(2, "State is required"),
      zipCode: z.string().min(5, "Valid ZIP code is required"),
      country: z.string().default("US"),
    })
    .optional(),
  shippingAddressId: z.string().optional(),
  fulfillmentMethod: z.enum(["DELIVERY", "PICKUP"]),
  deliveryInstructions: z.string().optional(),
  specialInstructions: z.string().optional(),
  paymentMethodId: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
});

// ============================================================================
// POST - CREATE ORDER FROM CHECKOUT
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Validate that either shippingAddressId or shippingAddress is provided for delivery
    if (data.fulfillmentMethod === "DELIVERY") {
      if (!data.shippingAddressId && !data.shippingAddress) {
        return NextResponse.json(
          {
            success: false,
            error: "Shipping address is required for delivery",
          },
          { status: 400 },
        );
      }
    }

    // Create order(s) from checkout
    const result = await checkoutService.createOrderFromCheckout({
      userId,
      shippingAddressId: data.shippingAddressId,
      shippingAddress: data.shippingAddress,
      fulfillmentMethod: data.fulfillmentMethod as any,
      deliveryInstructions: data.deliveryInstructions,
      specialInstructions: data.specialInstructions,
      paymentMethodId: data.paymentMethodId,
      stripePaymentIntentId: data.stripePaymentIntentId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to create order",
        },
        { status: 400 },
      );
    }

    // Handle multiple orders (one per farm) or single order
    const orders = Array.isArray(result.order) ? result.order : [result.order];
    const primaryOrder = orders[0];

    // Return success response
    return NextResponse.json(
      {
        success: true,
        order: {
          id: primaryOrder.id,
          orderNumber: primaryOrder.orderNumber,
          status: primaryOrder.status,
          total: primaryOrder.total,
          itemCount: primaryOrder.items.length,
          farmCount: orders.length,
        },
        orders: orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          farmId: order.farmId,
          farmName: order.farm.name,
          total: order.total,
          itemCount: order.items.length,
        })),
        message:
          orders.length > 1
            ? `${orders.length} orders created successfully`
            : "Order created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating order from checkout:", error);

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while creating your order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// GET - GET CHECKOUT STATUS
// ============================================================================

export async function GET(_request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // Get checkout status
    const status = await checkoutService.getCheckoutStatus(userId);

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error("Error getting checkout status:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get checkout status",
      },
      { status: 500 },
    );
  }
}
