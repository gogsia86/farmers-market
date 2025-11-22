import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { ProductService } from "@/lib/services/product.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * DIVINE PRODUCT API ROUTE
 * Biodynamic product management with seasonal awareness
 */

// Validation schemas
const ProductQuerySchema = z.object({
  farmId: z.string().optional(),
  category: z.string().optional(),
  inStock: z.boolean().optional(),
  organic: z.boolean().optional(),
  seasonal: z.boolean().optional(),
  searchTerm: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(["name", "price", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const CreateProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().optional(),
  farmId: z.string().min(1, "Farm ID is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  quantity: z.number().int().min(0).optional(),
  inStock: z.boolean().default(true),
  organic: z.boolean().default(false),
  seasonal: z.boolean().default(false),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * GET /api/products
 * Retrieve products with biodynamic filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const queryValidation = ProductQuerySchema.safeParse({
      farmId: searchParams.get("farmId"),
      category: searchParams.get("category"),
      inStock: searchParams.get("inStock") === "true",
      organic: searchParams.get("organic") === "true",
      seasonal: searchParams.get("seasonal") === "true",
      searchTerm: searchParams.get("searchTerm"),
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      limit: Number(searchParams.get("limit")) || 20,
      offset: Number(searchParams.get("offset")) || 0,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: queryValidation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      farmId,
      category,
      inStock,
      organic,
      seasonal,
      searchTerm,
      minPrice,
      maxPrice,
      limit,
      offset,
      sortBy,
      sortOrder,
    } = queryValidation.data;

    // Build where clause with agricultural consciousness
    const where: any = {};
    if (farmId) where.farmId = farmId;
    if (category) where.category = category;
    if (inStock !== undefined) where.inStock = inStock;
    if (organic !== undefined) where.organic = organic;
    if (seasonal !== undefined) where.seasonal = seasonal;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { tags: { has: searchTerm } },
      ];
    }

    // Execute quantum parallel queries
    const [products, total] = await Promise.all([
      database.product.findMany({
        where,
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { [sortBy]: sortOrder },
      }),
      database.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        farmId,
        category,
        inStock,
        organic,
        seasonal,
      },
    });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/products
 * Create product with biodynamic validation
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate product data
    const validation = CreateProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Verify farm ownership
    const farm = await database.farm.findUnique({
      where: { id: validation.data.farmId },
      select: { ownerId: true },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: "Farm not found",
        },
        { status: 404 },
      );
    }

    if (farm.ownerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Only farm owners can add products",
        },
        { status: 403 },
      );
    }

    // Use product service with agricultural consciousness
    // Type assertion needed as schema validation ensures data correctness
    const product = await ProductService.createProduct(
      validation.data as any,
      session.user.id,
    );

    return NextResponse.json(
      {
        success: true,
        product,
        message: "Product created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Product creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
