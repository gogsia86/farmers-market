/**
 * 🌾 Products by Farm API - Divine Farm Product Catalog
 * Retrieve all products for a specific farm
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { database } from "@/lib/database";
import type { Product, ProductCategory, ProductStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from '@/lib/monitoring/logger';

/**
 * Query parameters validation schema
 */
const ProductQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  search: z.string().optional(),
  category: z.enum([
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
  ]).optional(),
  organic: z.string().optional(),
  inStock: z.string().optional(),
  status: z.enum(["ACTIVE", "OUT_OF_STOCK", "DISCONTINUED", "DRAFT"]).optional(),
  sortBy: z.enum(["createdAt", "price", "name", "popularity"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

interface ProductListResponse {
  success: boolean;
  data?: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    farm?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: string;
  };
}

/**
 * GET /api/farms/[farmId]/products
 * Retrieve all products for a specific farm with filtering and pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { farmId: string } }
): Promise<NextResponse<ProductListResponse>> {
  try {
    const { farmId } = params;

    // Verify farm exists
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FARM_NOT_FOUND",
            message: `Farm with ID ${farmId} not found`,
          },
        },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryValidation = ProductQuerySchema.safeParse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      organic: searchParams.get("organic") || undefined,
      inStock: searchParams.get("inStock") || undefined,
      status: searchParams.get("status") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
          },
        },
        { status: 400 }
      );
    }

    const {
      page,
      limit,
      search,
      category,
      organic,
      inStock,
      status,
      sortBy,
      sortOrder,
    } = queryValidation.data;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      farmId: farmId,
    };

    // Default to showing only ACTIVE products for public access
    // unless status is explicitly specified
    if (!status) {
      where.status = "ACTIVE" as ProductStatus;
    } else {
      where.status = status as ProductStatus;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Category filter
    if (category) {
      where.category = category as ProductCategory;
    }

    // Organic filter
    if (organic === "true") {
      where.organic = true;
    }

    // In stock filter
    if (inStock === "true") {
      where.quantityAvailable = { gt: 0 };
    }

    // Build order by clause
    let orderBy: any = { [sortBy]: sortOrder };
    if (sortBy === "popularity") {
      orderBy = { purchaseCount: sortOrder };
    }

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      database.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          category: true,
          farmId: true,
          price: true,
          unit: true,
          quantityAvailable: true,
          images: true,
          organic: true,
          harvestDate: true,
          storageInstructions: true,
          tags: true,
          status: true,
          viewsCount: true,
          cartAddsCount: true,
          purchaseCount: true,
          wishlistCount: true,
          reviewCount: true,
          averageRating: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      database.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return NextResponse.json({
      success: true,
      data: {
        products: products as unknown as Product[],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
        farm: {
          id: farm.id,
          name: farm.name,
          slug: farm.slug,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(`GET /api/farms/[farmId]/products error:`, {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCT_FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch farm products",
        },
      },
      { status: 500 }
    );
  }
}
