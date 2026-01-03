import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("user-addresses-default-api");

/**
 * PUT /api/users/addresses/[id]/default
 *
 * Set an address as the default delivery address
 * Only the address owner can set their address as default
 */
export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { id } = params;

    // Fetch existing address
    const existingAddress = await database.userAddress.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 },
      );
    }

    // Authorization check - only address owner can set as default
    if (existingAddress.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only modify your own addresses" },
        { status: 403 },
      );
    }

    // Check if already default
    if (existingAddress.isDefault) {
      return NextResponse.json({
        success: true,
        message: "Address is already set as default",
        address: {
          id: existingAddress.id,
          isDefault: existingAddress.isDefault,
        },
      });
    }

    // Use transaction to ensure atomicity
    await database.$transaction([
      // Unset all other defaults for this user
      database.userAddress.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: { isDefault: false },
      }),
      // Set this address as default
      database.userAddress.update({
        where: { id },
        data: {
          isDefault: true,
          updatedAt: new Date(),
        },
      }),
    ]);

    // Fetch updated address
    const updatedAddress = await database.userAddress.findUnique({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Default address updated successfully",
      address: {
        id: updatedAddress!.id,
        type: updatedAddress!.type,
        label: updatedAddress!.label,
        street: updatedAddress!.street,
        street2: updatedAddress!.street2,
        city: updatedAddress!.city,
        state: updatedAddress!.state,
        zipCode: updatedAddress!.zipCode,
        country: updatedAddress!.country,
        isDefault: updatedAddress!.isDefault,
        updatedAt: updatedAddress!.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error("Failed to set default address", error, {
      operation: "setDefaultAddress",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to set default address",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
