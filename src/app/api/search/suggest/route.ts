/**
 * 🔍 SEARCH AUTOCOMPLETE API ENDPOINT
 * Returns product and farm suggestions for search autocomplete
 *
 * Divine Patterns:
 * - Fuzzy matching for better UX
 * - Fast response (< 50ms target)
 * - Debounced on client side
 * - Agricultural consciousness
 */

import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache suggestions for 1 minute

interface SearchSuggestion {
  type: "product" | "farm" | "category";
  id: string;
  name: string;
  description?: string;
  image?: string | null;
  farmName?: string;
  city?: string;
  state?: string;
  category?: string;
  price?: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate query
    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Query must be at least 2 characters",
        },
        { status: 400 }
      );
    }

    // Limit to prevent abuse
    const maxLimit = Math.min(limit, 20);

    // Search both products and farms in parallel
    const [products, farms] = await Promise.all([
      // Search products
      database.product.findMany({
        where: {
          status: "ACTIVE",
          inStock: true,
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
            {
              category: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          primaryImage: true,
          pricePerUnit: true,
          category: true,
          farm: {
            select: {
              name: true,
              city: true,
              state: true,
            },
          },
        },
        take: Math.floor(maxLimit * 0.7), // 70% products
        orderBy: [
          {
            name: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      }),

      // Search farms
      database.farm.findMany({
        where: {
          status: "ACTIVE",
          verificationStatus: "VERIFIED",
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
            {
              city: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          coverImage: true,
          city: true,
          state: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
        take: Math.floor(maxLimit * 0.3), // 30% farms
        orderBy: {
          name: "asc",
        },
      }),
    ]);

    // Format suggestions
    const suggestions: SearchSuggestion[] = [
      // Product suggestions
      ...products.map((product) => ({
        type: "product" as const,
        id: product.id,
        name: product.name,
        description: product.description || undefined,
        image: product.primaryImage,
        farmName: product.farm.name,
        city: product.farm.city || undefined,
        state: product.farm.state || undefined,
        category: product.category,
        price: product.pricePerUnit,
      })),

      // Farm suggestions
      ...farms.map((farm) => ({
        type: "farm" as const,
        id: farm.id,
        name: farm.name,
        description: farm.description || undefined,
        image: farm.coverImage,
        city: farm.city || undefined,
        state: farm.state || undefined,
        productCount: farm._count.products,
      })),
    ];

    // Sort by relevance (exact match first, then partial match)
    const sortedSuggestions = suggestions.sort((a, b) => {
      const aNameLower = a.name.toLowerCase();
      const bNameLower = b.name.toLowerCase();
      const queryLower = query.toLowerCase();

      // Exact match
      if (aNameLower === queryLower) return -1;
      if (bNameLower === queryLower) return 1;

      // Starts with query
      if (aNameLower.startsWith(queryLower) && !bNameLower.startsWith(queryLower))
        return -1;
      if (bNameLower.startsWith(queryLower) && !aNameLower.startsWith(queryLower))
        return 1;

      // Alphabetical
      return aNameLower.localeCompare(bNameLower);
    });

    // Add category suggestions if query matches common categories
    const categoryMatches = getCategorySuggestions(query);
    const allSuggestions = [...categoryMatches, ...sortedSuggestions].slice(
      0,
      maxLimit
    );

    return NextResponse.json(
      {
        success: true,
        data: allSuggestions,
        meta: {
          query,
          count: allSuggestions.length,
          products: products.length,
          farms: farms.length,
          categories: categoryMatches.length,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("[SEARCH_SUGGEST_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch search suggestions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Get category suggestions based on query
 */
function getCategorySuggestions(query: string): SearchSuggestion[] {
  const categories = [
    { name: "Vegetables", icon: "🥕" },
    { name: "Fruits", icon: "🍎" },
    { name: "Dairy", icon: "🥛" },
    { name: "Eggs", icon: "🥚" },
    { name: "Meat", icon: "🥩" },
    { name: "Poultry", icon: "🍗" },
    { name: "Seafood", icon: "🐟" },
    { name: "Pantry", icon: "🫙" },
    { name: "Beverages", icon: "🧃" },
    { name: "Baked Goods", icon: "🍞" },
    { name: "Prepared Foods", icon: "🍱" },
    { name: "Flowers", icon: "🌸" },
    { name: "Honey", icon: "🍯" },
    { name: "Herbs", icon: "🌿" },
  ];

  const queryLower = query.toLowerCase();

  return categories
    .filter((cat) => cat.name.toLowerCase().includes(queryLower))
    .map((cat) => ({
      type: "category" as const,
      id: `category-${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: cat.name,
      description: `Browse all ${cat.name.toLowerCase()}`,
      category: cat.name.toUpperCase().replace(/\s+/g, "_"),
    }))
    .slice(0, 3); // Max 3 category suggestions
}
