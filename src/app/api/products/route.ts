/**
 * 🌾 PRODUCTS API ROUTE
 * RESTful API for product catalog with agricultural consciousness
 *
 * Endpoints:
 * - GET /api/products - List all products with advanced filtering
 * - POST /api/products - Create new product (authenticated farmer)
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import type { Product, ProductCategory, ProductStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/monitoring/logger";

// ============================================================================
// TYPES & VALIDATION
// ============================================================================

const ProductQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  search: z.string().optional(),
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
  farmId: z.string().optional(),
  organic: z.string().optional(),
  inStock: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "price", "name", "popularity"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const CreateProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(2000),
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
  ]),
  farmId: z.string(),
  price: z.number().positive(),
  unit: z.string(),
  quantityAvailable: z.number().nonnegative(),
  images: z.array(z.string().url()).optional(),
  organic: z.boolean().optional(),
  harvestDate: z.string().optional(),
  storageInstructions: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface ProductCreateResponse {
  success: boolean;
  data?: Product;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ============================================================================
// GET /api/products - LIST PRODUCTS
// ============================================================================

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ProductListResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryValidation = ProductQuerySchema.safeParse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      farmId: searchParams.get("farmId") || undefined,
      organic: searchParams.get("organic") || undefined,
      inStock: searchParams.get("inStock") || undefined,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          success: false,
          data: {
            products: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          },
        },
        { status: 400 },
      );
    }

    const {
      page,
      limit,
      search,
      category,
      farmId,
      organic,
      inStock,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    } = queryValidation.data;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      status: "ACTIVE" as ProductStatus,
    };

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

    // Farm filter
    if (farmId) {
      where.farmId = farmId;
    }

    // Organic filter
    if (organic === "true") {
      where.organic = true;
    }

    // In stock filter
    if (inStock === "true") {
      where.quantityAvailable = { gt: 0 };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
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
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
              certifications: true,
            },
          },
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
      },
    });
  } catch (error) {
    logger.error("GET /api/products error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        data: {
          products: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST /api/products - CREATE PRODUCT
// ============================================================================

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ProductCreateResponse>> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 },
      );
    }

    const user = session.user as any;

    // Check if user is a farmer or admin
    if (user.role !== "FARMER" && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only farmers can create products",
          },
        },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid product data",
            details: validation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const productData = validation.data;

    // Verify farm ownership
    const farm = await database.farm.findUnique({
      where: { id: productData.farmId },
      select: { id: true, ownerId: true },
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

    if (farm.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to add products to this farm",
          },
        },
        { status: 403 },
      );
    }

    // Generate slug from product name
    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Create product
    const product = await database.product.create({
      data: {
        name: productData.name,
        slug,
        description: productData.description,
        category: productData.category as ProductCategory,
        farmId: productData.farmId,
        price: productData.price,
        unit: productData.unit,
        quantityAvailable: productData.quantityAvailable,
        images: productData.images || [],
        organic: productData.organic || false,
        harvestDate: productData.harvestDate
          ? new Date(productData.harvestDate)
          : null,
        storageInstructions: productData.storageInstructions || null,
        tags: productData.tags || [],
        status: "ACTIVE" as ProductStatus,
        viewsCount: 0,
        cartAddsCount: 0,
        purchaseCount: 0,
        wishlistCount: 0,
        reviewCount: 0,
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: product as unknown as Product,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("POST /api/products error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create product",
        },
      },
      { status: 500 },
    );
  }
}
