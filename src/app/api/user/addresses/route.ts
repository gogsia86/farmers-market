/**
 * 📍 USER ADDRESSES API ENDPOINT - Divine Address Management
 * Handles user address operations with agricultural consciousness
 *
 * Routes:
 * - GET /api/user/addresses - List user's addresses
 * - POST /api/user/addresses - Create new address
 * - PATCH /api/user/addresses - Update address
 * - DELETE /api/user/addresses - Remove address
 *
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 11_KILO_SCALE_ARCHITECTURE
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import type { AddressType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from '@/lib/monitoring/logger';

/**
 * 🔍 GET - List User's Addresses
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to view addresses",
          },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as AddressType | null;

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    // Get all addresses for user
    const addresses = await database.userAddress.findMany({
      where,
      orderBy: [
        { isDefault: "desc" }, // Default addresses first
        { createdAt: "desc" },
      ],
    });

    // Find default address
    const defaultAddress = addresses.find((addr) => addr.isDefault);
    const homeAddresses = addresses.filter((addr) => addr.type === "HOME");
    const workAddresses = addresses.filter((addr) => addr.type === "WORK");
    const otherAddresses = addresses.filter((addr) => addr.type === "OTHER");

    return NextResponse.json({
      success: true,
      data: {
        addresses,
        defaultAddress,
        counts: {
          total: addresses.length,
          home: homeAddresses.length,
          work: workAddresses.length,
          other: otherAddresses.length,
        },
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Address retrieval error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ADDRESS_FETCH_ERROR",
          message: error instanceof Error ? error.message : "Failed to retrieve addresses",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * ➕ POST - Create New Address
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to create addresses",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation schema
    const CreateAddressSchema = z.object({
      type: z.enum(["HOME", "WORK", "OTHER"]),
      label: z.string().max(100).optional(),
      street: z.string().min(3).max(255),
      street2: z.string().max(255).optional().nullable(),
      city: z.string().min(2).max(100),
      state: z.string().min(2).max(50),
      zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
      country: z.string().length(2).default("US"),
      isDefault: z.boolean().default(false),
    });

    const validation = CreateAddressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid address data",
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const addressData = validation.data;

    // If setting as default, unset other default addresses
    if (addressData.isDefault) {
      await database.userAddress.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create new address
    const address = await database.userAddress.create({
      data: {
        userId: session.user.id,
        type: addressData.type as AddressType,
        label: addressData.label || null,
        street: addressData.street,
        street2: addressData.street2 || null,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
        country: addressData.country,
        isDefault: addressData.isDefault,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        address,
        message: "Address created successfully",
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Address creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ADDRESS_CREATE_ERROR",
          message: error instanceof Error ? error.message : "Failed to create address",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * ✏️ PATCH - Update Address
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to update addresses",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation schema
    const UpdateAddressSchema = z.object({
      addressId: z.string().min(1),
      type: z.enum(["HOME", "WORK", "OTHER"]).optional(),
      label: z.string().max(100).optional().nullable(),
      street: z.string().min(3).max(255).optional(),
      street2: z.string().max(255).optional().nullable(),
      city: z.string().min(2).max(100).optional(),
      state: z.string().min(2).max(50).optional(),
      zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
      country: z.string().length(2).optional(),
      isDefault: z.boolean().optional(),
    });

    const validation = UpdateAddressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid address data",
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { addressId, isDefault, ...updates } = validation.data;

    // Get address
    const address = await database.userAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ADDRESS_NOT_FOUND",
            message: "Address not found",
          },
        },
        { status: 404 }
      );
    }

    // Verify ownership
    if (address.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You can only update your own addresses",
          },
        },
        { status: 403 }
      );
    }

    // If setting as default, unset other default addresses
    if (isDefault && !address.isDefault) {
      await database.userAddress.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Update address
    const updatedAddress = await database.userAddress.update({
      where: { id: addressId },
      data: {
        ...updates,
        isDefault: isDefault !== undefined ? isDefault : address.isDefault,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        address: updatedAddress,
        message: "Address updated successfully",
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Address update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ADDRESS_UPDATE_ERROR",
          message: error instanceof Error ? error.message : "Failed to update address",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 🗑️ DELETE - Remove Address
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to delete addresses",
          },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("addressId");

    if (!addressId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "addressId is required",
          },
        },
        { status: 400 }
      );
    }

    // Get address
    const address = await database.userAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ADDRESS_NOT_FOUND",
            message: "Address not found",
          },
        },
        { status: 404 }
      );
    }

    // Verify ownership
    if (address.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You can only delete your own addresses",
          },
        },
        { status: 403 }
      );
    }

    // Check if address is being used in any active orders
    const activeOrders = await database.order.findFirst({
      where: {
        customerId: session.user.id,
        status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] },
        deliveryAddressId: addressId,
      },
    });

    if (activeOrders) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ADDRESS_IN_USE",
            message: "Cannot delete address that is used in active orders",
          },
        },
        { status: 400 }
      );
    }

    // If deleting default address, set another as default
    if (address.isDefault) {
      const otherAddress = await database.userAddress.findFirst({
        where: {
          userId: session.user.id,
          id: { not: addressId },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (otherAddress) {
        await database.userAddress.update({
          where: { id: otherAddress.id },
          data: { isDefault: true },
        });
      }
    }

    // Delete address
    await database.userAddress.delete({
      where: { id: addressId },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Address deleted successfully",
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Address deletion error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ADDRESS_DELETE_ERROR",
          message: error instanceof Error ? error.message : "Failed to delete address",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 🌾 Get current season helper
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}
