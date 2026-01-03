import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

// Initialize structured logger
const logger = createLogger("users-favorites-api");

/**
 * GET /api/users/favorites
 *
 * Fetch authenticated user's favorite farms and products
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

    // Fetch favorites
    const favorites = await database.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            bannerUrl: true,
            city: true,
            state: true,
            _count: {
              select: { products: true },
            },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            unit: true,
            primaryPhotoUrl: true,
            inStock: true,
            farm: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Separate farms and products
    const favoriteFarms = favorites
      .filter((f) => f.farmId && f.farm)
      .map((f) => ({
        id: f.farm!.id,
        name: f.farm!.name,
        slug: f.farm!.slug,
        description: f.farm!.description || "",
        imageUrl: f.farm!.bannerUrl || null,
        location: {
          city: f.farm!.city || "",
          state: f.farm!.state || "",
        },
        productsCount: f.farm!._count.products,
      }));

    const favoriteProducts = favorites
      .filter((f) => f.productId && f.product)
      .map((f) => ({
        id: f.product!.id,
        name: f.product!.name,
        slug: f.product!.slug,
        price: Number(f.product!.price),
        unit: f.product!.unit,
        imageUrl: f.product!.primaryPhotoUrl || null,
        farmName: f.product!.farm.name,
        farmSlug: f.product!.farm.slug,
        inStock: f.product!.inStock,
      }));

    return NextResponse.json({
      success: true,
      farms: favoriteFarms,
      products: favoriteProducts,
      total: favorites.length,
    });
  } catch (error) {
    logger.error("Failed to fetch favorites", error as Error, {
      operation: "GET /api/users/favorites",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch favorites",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/users/favorites
 *
 * Add a farm or product to favorites
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
    const { farmId, productId, type } = body;

    // Validation
    if (!type || (type !== "farm" && type !== "product")) {
      return NextResponse.json(
        { success: false, error: "Invalid type. Must be 'farm' or 'product'" },
        { status: 400 },
      );
    }

    if (type === "farm" && !farmId) {
      return NextResponse.json(
        { success: false, error: "Farm ID is required" },
        { status: 400 },
      );
    }

    if (type === "product" && !productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 },
      );
    }

    // Check if already favorited
    const existing = await database.favorite.findFirst({
      where: {
        userId: session.user.id,
        ...(type === "farm" ? { farmId } : { productId }),
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already in favorites" },
        { status: 400 },
      );
    }

    // Create favorite
    const favorite = await database.favorite.create({
      data: {
        userId: session.user.id,
        ...(type === "farm" ? { farmId } : { productId }),
      },
    });

    logger.info("Favorite added", {
      userId: session.user.id,
      type,
      favoriteId: favorite.id,
      ...(type === "farm" ? { farmId } : { productId }),
    });

    return NextResponse.json({
      success: true,
      message: "Added to favorites",
      favorite: {
        id: favorite.id,
        type,
      },
    });
  } catch (error) {
    logger.error("Failed to add favorite", error as Error, {
      operation: "POST /api/users/favorites",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add favorite",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/users/favorites
 *
 * Remove a farm or product from favorites
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { farmId, productId, type } = body;

    // Validation
    if (!type || (type !== "farm" && type !== "product")) {
      return NextResponse.json(
        { success: false, error: "Invalid type. Must be 'farm' or 'product'" },
        { status: 400 },
      );
    }

    // Delete favorite
    const result = await database.favorite.deleteMany({
      where: {
        userId: session.user.id,
        ...(type === "farm" ? { farmId } : { productId }),
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "Favorite not found" },
        { status: 404 },
      );
    }

    logger.info("Favorite removed", {
      userId: session.user.id,
      type,
      ...(type === "farm" ? { farmId } : { productId }),
    });

    return NextResponse.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    logger.error("Failed to remove favorite", error as Error, {
      operation: "DELETE /api/users/favorites",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove favorite",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
