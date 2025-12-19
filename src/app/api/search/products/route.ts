// 🔍 Product Search API Route
// Divine Agricultural Search Consciousness

import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";
import {
  buildProductSearchQuery,
  calculatePaginationMeta,
  parseSearchParams,
  getCurrentSeason,
  getSeasonalContext,
} from "@/lib/utils/search.utils";
import type {
  SearchProductsResponse,
  FilterOption,
} from "@/types/search";

/**
 * GET /api/search/products
 * Search products with filters, pagination, and sorting
 */
export async function GET(request: NextRequest) {
  try {
    // Parse search parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const filters = parseSearchParams(searchParams);

    // Build Prisma query
    const queryConfig = buildProductSearchQuery(filters);

    // Execute search query and count in parallel
    const [products, totalCount] = await Promise.all([
      database.product.findMany(queryConfig),
      database.product.count({ where: queryConfig.where }),
    ]);

    // Calculate pagination metadata
    const meta = calculatePaginationMeta(
      totalCount,
      filters.page || 1,
      filters.limit || 12
    );

    // Get available filters (categories, farms, price range)
    const [categories, farms, priceStats] = await Promise.all([
      // Get categories with product counts
      database.category.findMany({
        where: {
          products: {
            some: queryConfig.where,
          },
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      // Get farms with product counts
      database.farm.findMany({
        where: {
          products: {
            some: queryConfig.where,
          },
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      // Get price range
      database.product.aggregate({
        where: queryConfig.where,
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    // Format filter options
    const availableCategories: FilterOption[] = categories.map((cat) => ({
      label: cat.name,
      value: cat.id,
      count: cat._count.products,
    }));

    const availableFarms: FilterOption[] = farms.map((farm) => ({
      label: farm.name,
      value: farm.id,
      count: farm._count.products,
    }));

    // Get seasonal context
    const currentSeason = getCurrentSeason();
    const seasonalContext = getSeasonalContext(currentSeason);

    // Build response
    const response: SearchProductsResponse = {
      success: true,
      data: {
        data: products,
        meta,
      },
      filters: {
        availableCategories,
        availableFarms,
        priceRange: {
          min: priceStats._min.price || 0,
          max: priceStats._max.price || 1000,
        },
      },
      seasonal: seasonalContext,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[PRODUCT_SEARCH_ERROR]", error);

    const response: SearchProductsResponse = {
      success: false,
      data: {
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 12,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      error: {
        code: "SEARCH_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to search products",
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/search/products
 * Advanced search with body parameters
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters, includeOutOfStock = false, includeMetadata = true } = body;

    // Override availability if includeOutOfStock is false
    if (!includeOutOfStock && !filters.availability) {
      filters.availability = "IN_STOCK";
    }

    // Build and execute query
    const queryConfig = buildProductSearchQuery(filters);

    const [products, totalCount] = await Promise.all([
      database.product.findMany(queryConfig),
      database.product.count({ where: queryConfig.where }),
    ]);

    const meta = calculatePaginationMeta(
      totalCount,
      filters.page || 1,
      filters.limit || 12
    );

    // Only include metadata if requested
    let filterMetadata = undefined;
    let seasonalContext = undefined;

    if (includeMetadata) {
      const [categories, farms, priceStats] = await Promise.all([
        database.category.findMany({
          where: {
            products: {
              some: queryConfig.where,
            },
          },
          include: {
            _count: {
              select: { products: true },
            },
          },
        }),
        database.farm.findMany({
          where: {
            products: {
              some: queryConfig.where,
            },
          },
          include: {
            _count: {
              select: { products: true },
            },
          },
        }),
        database.product.aggregate({
          where: queryConfig.where,
          _min: { price: true },
          _max: { price: true },
        }),
      ]);

      filterMetadata = {
        availableCategories: categories.map((cat) => ({
          label: cat.name,
          value: cat.id,
          count: cat._count.products,
        })),
        availableFarms: farms.map((farm) => ({
          label: farm.name,
          value: farm.id,
          count: farm._count.products,
        })),
        priceRange: {
          min: priceStats._min.price || 0,
          max: priceStats._max.price || 1000,
        },
      };

      const currentSeason = getCurrentSeason();
      seasonalContext = getSeasonalContext(currentSeason);
    }

    const response: SearchProductsResponse = {
      success: true,
      data: {
        data: products,
        meta,
      },
      filters: filterMetadata,
      seasonal: seasonalContext,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[PRODUCT_SEARCH_POST_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SEARCH_ERROR",
          message: error instanceof Error ? error.message : "Search failed",
        },
      },
      { status: 500 }
    );
  }
}
