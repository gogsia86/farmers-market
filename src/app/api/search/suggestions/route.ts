// 🔍 Search Suggestions API Route
// Divine Agricultural Autocomplete Consciousness

import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";
import { sanitizeSearchQuery } from "@/lib/utils/search.utils";
import type { SearchSuggestion } from "@/types/search";

/**
 * GET /api/search/suggestions
 * Get autocomplete suggestions based on query
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawQuery = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!rawQuery || rawQuery.trim().length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    const query = sanitizeSearchQuery(rawQuery);

    // Search in parallel across products, farms, and categories
    const [products, farms, categories] = await Promise.all([
      // Product suggestions
      database.product.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
          stockQuantity: {
            gt: 0,
          },
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: {
            take: 1,
            select: {
              url: true,
            },
          },
        },
        take: Math.ceil(limit * 0.6), // 60% products
        orderBy: {
          createdAt: "desc",
        },
      }),

      // Farm suggestions
      database.farm.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
          isVerified: true,
        },
        select: {
          id: true,
          name: true,
          logo: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
        take: Math.ceil(limit * 0.2), // 20% farms
      }),

      // Category suggestions
      database.category.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
        take: Math.ceil(limit * 0.2), // 20% categories
      }),
    ]);

    // Format suggestions
    const suggestions: SearchSuggestion[] = [
      // Products
      ...products.map((product) => ({
        type: "PRODUCT" as const,
        label: product.name,
        value: product.id,
        metadata: {
          price: product.price,
          image: product.images[0]?.url || null,
        },
      })),

      // Farms
      ...farms.map((farm) => ({
        type: "FARM" as const,
        label: farm.name,
        value: farm.id,
        metadata: {
          productCount: farm._count.products,
          logo: farm.logo,
        },
      })),

      // Categories
      ...categories.map((category) => ({
        type: "CATEGORY" as const,
        label: category.name,
        value: category.id,
        metadata: {
          productCount: category._count.products,
        },
      })),
    ];

    // Limit total results
    const limitedSuggestions = suggestions.slice(0, limit);

    return NextResponse.json({
      success: true,
      suggestions: limitedSuggestions,
      query,
    });
  } catch (error) {
    console.error("[SEARCH_SUGGESTIONS_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SUGGESTIONS_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch suggestions",
        },
      },
      { status: 500 }
    );
  }
}
