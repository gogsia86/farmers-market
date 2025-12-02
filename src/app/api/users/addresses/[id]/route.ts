import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

/**
 * PUT /api/users/addresses/[id]
 *
 * Update an existing address
 * Only the address owner can update their address
 */
export async function PUT(
  request: NextRequest,
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
    const body = await request.json();
    const {
      type,
      label,
      street,
      street2,
      city,
      state,
      zipCode,
      country,
      isDefault,
    } = body;

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

    // Authorization check - only address owner can update
    if (existingAddress.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only update your own addresses" },
        { status: 403 },
      );
    }

    // Build update data
    const updateData: any = {};
    if (type !== undefined) {
      if (!["HOME", "WORK", "OTHER"].includes(type)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid type. Must be HOME, WORK, or OTHER",
          },
          { status: 400 },
        );
      }
      updateData.type = type;
    }
    if (label !== undefined) updateData.label = label?.trim() || null;
    if (street !== undefined) {
      if (street.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "Street address cannot be empty" },
          { status: 400 },
        );
      }
      updateData.street = street.trim();
    }
    if (street2 !== undefined) updateData.street2 = street2?.trim() || null;
    if (city !== undefined) {
      if (city.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "City cannot be empty" },
          { status: 400 },
        );
      }
      updateData.city = city.trim();
    }
    if (state !== undefined) {
      if (state.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "State cannot be empty" },
          { status: 400 },
        );
      }
      updateData.state = state.trim();
    }
    if (zipCode !== undefined) {
      if (zipCode.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "ZIP code cannot be empty" },
          { status: 400 },
        );
      }
      updateData.zipCode = zipCode.trim();
    }
    if (country !== undefined) updateData.country = country;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    updateData.updatedAt = new Date();

    // If setting as default, unset all other defaults first
    if (isDefault) {
      await database.userAddress.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    // Update address
    const updatedAddress = await database.userAddress.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      address: {
        id: updatedAddress.id,
        type: updatedAddress.type,
        label: updatedAddress.label,
        street: updatedAddress.street,
        street2: updatedAddress.street2,
        city: updatedAddress.city,
        state: updatedAddress.state,
        zipCode: updatedAddress.zipCode,
        country: updatedAddress.country,
        isDefault: updatedAddress.isDefault,
        updatedAt: updatedAddress.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Address update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update address",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/users/addresses/[id]
 *
 * Delete an existing address
 * Only the address owner can delete their address
 * Cannot delete the default address if it's the only one
 */
export async function DELETE(
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

    // Authorization check - only address owner can delete
    if (existingAddress.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own addresses" },
        { status: 403 },
      );
    }

    // Check if this is the only address
    const addressCount = await database.userAddress.count({
      where: { userId: session.user.id },
    });

    if (addressCount === 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete your only address. Add a new address first.",
        },
        { status: 400 },
      );
    }

    // If deleting default address, set another one as default
    if (existingAddress.isDefault) {
      const nextAddress = await database.userAddress.findFirst({
        where: {
          userId: session.user.id,
          id: { not: id },
        },
        orderBy: { createdAt: "desc" },
      });

      if (nextAddress) {
        await database.userAddress.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    // Delete address
    await database.userAddress.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Address deletion error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete address",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
