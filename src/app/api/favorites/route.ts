/**
 * ⭐ FAVORITES API ENDPOINT - Divine Wishlist Management
 * Handles user favorites/wishlist with agricultural consciousness
 *
 * Routes:
 * - GET /api/favorites - Get user's favorites (farms & products)
 * - POST /api/favorites - Add farm/product to favorites
 * - DELETE /api/favorites - Remove from favorites
 *
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 11_KILO_SCALE_ARCHITECTURE
 */

import { auth } from "@/lib/auth";

import type { Product } from "@prisma/client";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/monitoring/logger";

/**
 * 🔍 GET - Retrieve User's Favorites
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
            message: "You must be logged in to view favorites",
          },
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "farm", "product", or "all"

    // Build where clause based on type filter
    const where: any = {
      userId: session.user.id,
    };

    if (type === "farm") {
      where.farmId = { not: null };
    } else if (type === "product") {
      where.productId = { not: null };
    }

    // Get all favorites for user
    const favorites = await database.favorite.findMany({
      where,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logoUrl: true,
            bannerUrl: true,
            status: true,
            averageRating: true,
            state: true,
            certifications: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            unit: true,
            category: true,
            images: true,
            status: true,
            quantityAvailable: true,
            organic: true,
            farm: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Separate farms and products
    const favoriteFarms = favorites
      .filter((f: any) => f.farmId !== null)
      .map((f: any) => f);

    const favoriteProducts = favorites
      .filter((f: any) => f.productId !== null)
      .map((f: any) => f);

    return NextResponse.json({
      success: true,
      data: {
        favorites,
        farms: favoriteFarms,
        products: favoriteProducts,
        totalCount: favorites.length,
        farmCount: favoriteFarms.length,
        productCount: favoriteProducts.length,
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Favorites retrieval error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FAVORITES_FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to retrieve favorites",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * ➕ POST - Add to Favorites
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
            message: "You must be logged in to add favorites",
          },
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validation schema - must have either farmId or productId
    const AddFavoriteSchema = z
      .object({
        farmId: z.string().optional(),
        productId: z.string().optional(),
      })
      .refine((data) => data.farmId || data.productId, {
        message: "Either farmId or productId must be provided",
      });

    const validation = AddFavoriteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid favorite data",
            details: validation.error.errors,
          },
        },
        { status: 400 },
      );
    }

    const { farmId, productId } = validation.data;

    // Validate farm if farmId provided
    if (farmId) {
      const farm = await database.farm.findUnique({
        where: { id: farmId },
        select: { id: true, status: true },
      });

      if (!farm) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FARM_NOT_FOUND",
              message: "Farm not found",
            },
          },
          { status: 404 },
        );
      }

      if (farm.status !== "ACTIVE") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FARM_INACTIVE",
              message: "This farm is not currently active",
            },
          },
          { status: 400 },
        );
      }
    }

    // Validate product if productId provided
    if (productId) {
      const product = await database.product.findUnique({
        where: { id: productId },
        select: { id: true, status: true },
      });

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PRODUCT_NOT_FOUND",
              message: "Product not found",
            },
          },
          { status: 404 },
        );
      }
    }

    // Check if already favorited
    const existing = await database.favorite.findFirst({
      where: {
        userId: session.user.id,
        ...(farmId ? { farmId } : {}),
        ...(productId ? { productId } : {}),
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_FAVORITED",
            message: "This item is already in your favorites",
          },
        },
        { status: 400 },
      );
    }

    // Create favorite
    const favorite = await database.favorite.create({
      data: {
        userId: session.user.id,
        farmId: farmId || null,
        productId: productId || null,
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
          },
        },
      },
    });

    // Update wishlist count for analytics
    if (productId) {
      await database.product.update({
        where: { id: productId },
        data: {
          wishlistCount: {
            increment: 1,
          },
        },
      });
    }

    // Note: followersCount tracking would require adding this field to Farm schema
    // Currently commented out as field doesn't exist
    // if (farmId) {
    //   await database.farm.update({
    //     where: { id: farmId },
    //     data: {
    //       followersCount: {
    //         increment: 1,
    //       },
    //     },
    //   });
    // }

    return NextResponse.json({
      success: true,
      data: {
        favorite,
        message: "Added to favorites",
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Add favorite error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FAVORITE_ADD_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to add favorite",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * 🗑️ DELETE - Remove from Favorites
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
            message: "You must be logged in to remove favorites",
          },
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get("favoriteId");
    const farmId = searchParams.get("farmId");
    const productId = searchParams.get("productId");

    // Must provide either favoriteId or farmId/productId
    if (!favoriteId && !farmId && !productId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "favoriteId, farmId, or productId is required",
          },
        },
        { status: 400 },
      );
    }

    let favorite;

    // Find by favoriteId
    if (favoriteId) {
      favorite = await database.favorite.findUnique({
        where: { id: favoriteId },
      });
    } else {
      // Find by farmId or productId
      favorite = await database.favorite.findFirst({
        where: {
          userId: session.user.id,
          ...(farmId ? { farmId } : {}),
          ...(productId ? { productId } : {}),
        },
      });
    }

    if (!favorite) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FAVORITE_NOT_FOUND",
            message: "Favorite not found",
          },
        },
        { status: 404 },
      );
    }

    // Verify ownership
    if (favorite.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You can only remove your own favorites",
          },
        },
        { status: 403 },
      );
    }

    // Delete favorite
    await database.favorite.delete({
      where: { id: favorite.id },
    });

    // Update wishlist count for analytics
    if (favorite.productId) {
      await database.product.update({
        where: { id: favorite.productId },
        data: {
          wishlistCount: {
            decrement: 1,
          },
        },
      });
    }

    // Note: followersCount tracking would require adding this field to Farm schema
    // Currently commented out as field doesn't exist
    // if (favorite.farmId) {
    //   await database.farm.update({
    //     where: { id: favorite.farmId },
    //     data: {
    //       followersCount: {
    //         decrement: 1,
    //       },
    //     },
    //   });
    // }

    return NextResponse.json({
      success: true,
      data: {
        message: "Removed from favorites",
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Remove favorite error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FAVORITE_DELETE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to remove favorite",
        },
      },
      { status: 500 },
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
