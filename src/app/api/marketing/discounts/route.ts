/**
 * DISCOUNT CODES API
 * Divine promotional discount system
 *
 * Endpoints:
 * - POST /api/marketing/discounts - Create discount code
 * - GET /api/marketing/discounts - List discount codes
 * - POST /api/marketing/discounts/validate - Validate code at checkout
 * - DELETE /api/marketing/discounts/:id - Delete discount code
 */

import type { DiscountCode, DiscountType } from "@/types/marketing.types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const CreateDiscountSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9]+$/),
  type: z.enum([
    "PERCENTAGE",
    "FIXED_AMOUNT",
    "FREE_SHIPPING",
    "BUY_ONE_GET_ONE",
  ]),
  value: z.number().positive(),
  minOrderAmount: z.number().optional(),
  maxUses: z.number().positive().optional(),
  expiresAt: z.string().optional(),
  applicableTo: z
    .object({
      productIds: z.array(z.string()).optional(),
      farmIds: z.array(z.string()).optional(),
      categories: z.array(z.string()).optional(),
    })
    .optional(),
  eligibleUsers: z
    .object({
      userIds: z.array(z.string()).optional(),
      userType: z.enum(["NEW", "EXISTING", "ALL"]).optional(),
    })
    .optional(),
});

const ValidateDiscountSchema = z.object({
  code: z.string(),
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

// Mock database
const discounts: DiscountCode[] = [
  // Predefined discount codes
  {
    id: "disc_welcome",
    code: "WELCOME10",
    type: "FIXED_AMOUNT",
    value: 10,
    minOrderAmount: 30,
    maxUses: undefined,
    usedCount: 89,
    expiresAt: undefined,
    isActive: true,
    eligibleUsers: {
      userType: "NEW",
    },
    createdAt: new Date("2025-10-01"),
    updatedAt: new Date("2025-10-20"),
  },
  {
    id: "disc_summer",
    code: "SUMMER20",
    type: "PERCENTAGE",
    value: 20,
    minOrderAmount: 50,
    maxUses: 500,
    usedCount: 234,
    expiresAt: new Date("2025-12-31"),
    isActive: true,
    createdAt: new Date("2025-10-01"),
    updatedAt: new Date("2025-10-20"),
  },
  {
    id: "disc_freeship",
    code: "FREESHIP",
    type: "FREE_SHIPPING",
    value: 0,
    minOrderAmount: 75,
    maxUses: undefined,
    usedCount: 156,
    expiresAt: undefined,
    isActive: true,
    createdAt: new Date("2025-10-01"),
    updatedAt: new Date("2025-10-20"),
  },
];

/**
 * POST - Create new discount code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateDiscountSchema.parse(body);

    // Check if code already exists
    const existing = discounts.find((d) => d.code === validated.code);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Discount code already exists",
        },
        { status: 400 }
      );
    }

    // Create discount
    const discount: DiscountCode = {
      id: `disc_${Date.now()}`,
      code: validated.code,
      type: validated.type,
      value: validated.value,
      minOrderAmount: validated.minOrderAmount,
      maxUses: validated.maxUses,
      usedCount: 0,
      expiresAt: validated.expiresAt
        ? new Date(validated.expiresAt)
        : undefined,
      isActive: true,
      applicableTo: validated.applicableTo,
      eligibleUsers: validated.eligibleUsers,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    discounts.push(discount);

    return NextResponse.json(
      {
        success: true,
        discount,
        message: "Discount code created successfully",
      },
      { status: 201 }
    );
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

    console.error("Discount creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create discount code",
      },
      { status: 500 }
    );
  }
}

/**
 * GET - List all discount codes
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get("active");
    const type = searchParams.get("type") as DiscountType | null;

    let filtered = discounts;

    if (active !== null) {
      filtered = filtered.filter((d) => d.isActive === (active === "true"));
    }

    if (type) {
      filtered = filtered.filter((d) => d.type === type);
    }

    return NextResponse.json({
      success: true,
      discounts: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error("Discount list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch discount codes",
      },
      { status: 500 }
    );
  }
}

/**
 * Validate discount code endpoint (separate route)
 */
export async function validateDiscountCode(
  code: string,
  orderAmount: number,
  userId?: string
) {
  const discount = discounts.find((d) => d.code === code.toUpperCase());

  if (!discount) {
    return {
      valid: false,
      error: "Invalid discount code",
    };
  }

  if (!discount.isActive) {
    return {
      valid: false,
      error: "This discount code is no longer active",
    };
  }

  // Check expiration
  if (discount.expiresAt && new Date() > discount.expiresAt) {
    return {
      valid: false,
      error: "This discount code has expired",
    };
  }

  // Check usage limit
  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return {
      valid: false,
      error: "This discount code has reached its usage limit",
    };
  }

  // Check minimum order amount
  if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
    return {
      valid: false,
      error: `Minimum order of $${discount.minOrderAmount} required`,
    };
  }

  // Calculate discount amount
  let discountAmount = 0;
  let finalAmount = orderAmount;

  switch (discount.type) {
    case "PERCENTAGE":
      discountAmount = (orderAmount * discount.value) / 100;
      finalAmount = orderAmount - discountAmount;
      break;
    case "FIXED_AMOUNT":
      discountAmount = Math.min(discount.value, orderAmount);
      finalAmount = orderAmount - discountAmount;
      break;
    case "FREE_SHIPPING":
      // Shipping discount handled separately
      discountAmount = 0; // Will be calculated with shipping
      finalAmount = orderAmount;
      break;
    case "BUY_ONE_GET_ONE":
      // BOGO logic would go here
      discountAmount = 0;
      finalAmount = orderAmount;
      break;
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
