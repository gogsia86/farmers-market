/**
 * VALIDATE DISCOUNT CODE API
 * POST /api/marketing/discounts/validate
 *
 * Validates discount code at checkout
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ValidateSchema = z.object({
  code: z.string().min(1),
  orderAmount: z.number().positive(),
  userId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number(),
        price: z.number(),
      })
    )
    .optional(),
});

/**
 * POST - Validate discount code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ValidateSchema.parse(body);

    // Import validation logic from parent route
    const result = await validateCode(
      validated.code,
      validated.orderAmount,
      validated.userId
    );

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      discount: result.discount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Discount validation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to validate discount code",
      },
      { status: 500 }
    );
  }
}

/**
 * Validate discount code (shared logic)
 */
async function validateCode(
  code: string,
  orderAmount: number,
  userId?: string
) {
  // Mock discount lookup (in production, query database)
  const mockDiscounts = [
    {
      code: "WELCOME10",
      type: "FIXED_AMOUNT",
      value: 10,
      minOrderAmount: 30,
      isActive: true,
      expiresAt: undefined,
      maxUses: undefined,
      usedCount: 89,
      eligibleUsers: { userType: "NEW" },
    },
    {
      code: "SUMMER20",
      type: "PERCENTAGE",
      value: 20,
      minOrderAmount: 50,
      isActive: true,
      expiresAt: new Date("2025-12-31"),
      maxUses: 500,
      usedCount: 234,
    },
    {
      code: "FREESHIP",
      type: "FREE_SHIPPING",
      value: 0,
      minOrderAmount: 75,
      isActive: true,
    },
  ];

  const discount = mockDiscounts.find((d) => d.code === code.toUpperCase());

  if (!discount) {
    return { valid: false, error: "Invalid discount code" };
  }

  if (!discount.isActive) {
    return { valid: false, error: "This discount code is no longer active" };
  }

  if (discount.expiresAt && new Date() > discount.expiresAt) {
    return { valid: false, error: "This discount code has expired" };
  }

  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return {
      valid: false,
      error: "This discount code has reached its usage limit",
    };
  }

  if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
    return {
      valid: false,
      error: `Minimum order of $${discount.minOrderAmount} required`,
    };
  }

  // Calculate discount
  let discountAmount = 0;
  let finalAmount = orderAmount;

  if (discount.type === "PERCENTAGE") {
    discountAmount = (orderAmount * discount.value) / 100;
    finalAmount = orderAmount - discountAmount;
  } else if (discount.type === "FIXED_AMOUNT") {
    discountAmount = Math.min(discount.value, orderAmount);
    finalAmount = orderAmount - discountAmount;
  } else if (discount.type === "FREE_SHIPPING") {
    // Shipping handled separately
    finalAmount = orderAmount;
  }

  return {
    valid: true,
    discount: {
      type: discount.type,
      value: discount.value,
      discountAmount,
      finalAmount,
    },
  };
}
