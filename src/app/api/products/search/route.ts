/**
 * Product Search API Route
 *
 * Provides product search functionality for the Farmers Market Platform
 *
 * @route GET /api/products/search
 */

import { database } from "@/lib/database";
import { logger } from "@/lib/monitoring/logger";
import type { Product, ProductCategory, ProductStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================================================
// TYPES
// ============================================================================

interface ProductSearchResponse {
  success: boolean;
  data?: {
    products: Partial<Product>[];
    count: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    query: string;
    limit: number;
  };
}

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const ProductSearchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
  limit: z.string().optional().default("10").transform(Number),
  category: z
    .enum([
      "VEGETABLES",
      "FRUITS",
      "GRAINS",
      "DAIRY",
      "MEAT",
      "EGGS",
      "HONEY",
      "PRESERVES",
      "BAKED_GOODS",
      "HERBS",
      "OTHER",
    ])
    .optional(),
  organic: z.string().optional(),
  inStock: z.string().optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
});

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * GET /api/products/search - Search for products
 *
 * Query Parameters:
 * - q: string (required) - Search query
 * - limit: number (default: 10, max: 100)
 * - category: ProductCategory (optional)
 * - organic: boolean (optional)
 * - inStock: boolean (optional)
 * - minPrice: number (optional)
 * - maxPrice: number (optional)
 *
 * Returns products matching the search criteria
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ProductSearchResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryValidation = ProductSearchQuerySchema.safeParse({
      q: searchParams.get("q") || "",
      limit: searchParams.get("limit") || "10",
      category: searchParams.get("category") || undefined,
      organic: searchParams.get("organic") || undefined,
      inStock: searchParams.get("inStock") || undefined,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid search parameters",
            details: queryValidation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const {
      q: query,
      limit,
      category,
      organic,
      inStock,
      minPrice,
      maxPrice,
    } = queryValidation.data;

    // Cap limit at 100 for performance
    const cappedLimit = Math.min(limit, 100);

    // Build where clause
    const where: any = {
      status: "ACTIVE" as ProductStatus,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    };

    // Add category filter
    if (category) {
      where.category = category as ProductCategory;
    }

    // Add organic filter
    if (organic === "true") {
      where.organic = true;
    }

    // Add in-stock filter
    if (inStock === "true") {
      where.quantityAvailable = { gt: 0 };
    }

    // Add price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Ensure products are from active, verified farms
    where.farm = {
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
    };

    // Fetch products from database
    const products = await database.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        unit: true,
        quantityAvailable: true,
        category: true,
        organic: true,
        images: true,
        tags: true,
        status: true,
        averageRating: true,
        reviewCount: true,
        purchaseCount: true,
        createdAt: true,
        updatedAt: true,
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            certifications: true,
            averageRating: true,
          },
        },
      },
      orderBy: [
        { purchaseCount: "desc" }, // Popularity first
        { averageRating: "desc" },
        { createdAt: "desc" },
      ],
      take: cappedLimit,
    });

    logger.info("Product search completed successfully", {
      query,
      count: products.length,
      limit: cappedLimit,
    });

    return NextResponse.json({
      success: true,
      data: {
        products,
        count: products.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
        query,
        limit: cappedLimit,
      },
    });
  } catch (error) {
    logger.error("Product search failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SEARCH_ERROR",
          message: "Failed to search products",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// EXPORT ROUTE CONFIG
// ============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
