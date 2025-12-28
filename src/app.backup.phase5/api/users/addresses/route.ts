import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

/**
 * GET /api/users/addresses
 *
 * Fetch all addresses for authenticated user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const addresses = await database.userAddress.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    const formattedAddresses = addresses.map((address) => ({
      id: address.id,
      type: address.type,
      label: address.label,
      street: address.street,
      street2: address.street2,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault,
      createdAt: address.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      addresses: formattedAddresses,
      total: addresses.length,
    });
  } catch (error) {
    console.error("Addresses fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch addresses",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/users/addresses
 *
 * Create a new address for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

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

    // Validation
    if (!type || !["HOME", "WORK", "OTHER"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid type. Must be HOME, WORK, or OTHER",
        },
        { status: 400 },
      );
    }

    if (!street || street.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Street address is required" },
        { status: 400 },
      );
    }

    if (!city || city.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "City is required" },
        { status: 400 },
      );
    }

    if (!state || state.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "State is required" },
        { status: 400 },
      );
    }

    if (!zipCode || zipCode.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "ZIP code is required" },
        { status: 400 },
      );
    }

    // If this is set as default, unset all other defaults first
    if (isDefault) {
      await database.userAddress.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Create address
    const address = await database.userAddress.create({
      data: {
        userId: session.user.id,
        type,
        label: label?.trim() || null,
        street: street.trim(),
        street2: street2?.trim() || null,
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: country || "US",
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Address created successfully",
      address: {
        id: address.id,
        type: address.type,
        label: address.label,
        street: address.street,
        street2: address.street2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        isDefault: address.isDefault,
        createdAt: address.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Address creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create address",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
