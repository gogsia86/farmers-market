import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Create logger for marketplace products API
const logger = createLogger("marketplace-products-api");

/**
 * 🔍 MARKETPLACE PRODUCTS API - Phase 3
 * Advanced product filtering and search
 *
 * Query Parameters:
 * - search: string (search by name, description)
 * - category: string (filter by product category)
 * - minPrice: number (minimum price)
 * - maxPrice: number (maximum price)
 * - maxDistance: number (maximum distance in miles)
 * - organic: boolean (organic only)
 * - inStock: boolean (in stock only)
 * - certifications: string[] (farm certifications)
 * - sortBy: string (relevance, price-asc, price-desc, rating, distance, newest)
 * - page: number (pagination)
 * - limit: number (results per page)
 * - farmId: string (filter by specific farm)
 */

interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDistance?: number;
  organic?: boolean;
  inStock?: boolean;
  certifications?: string[];
  sortBy?: string;
  page?: number;
  limit?: number;
  farmId?: string;
  lat?: number;
  lng?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: ProductFilters = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      minPrice: searchParams.get("minPrice")
        ? parseFloat(searchParams.get("minPrice")!)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseFloat(searchParams.get("maxPrice")!)
        : undefined,
      maxDistance: searchParams.get("maxDistance")
        ? parseFloat(searchParams.get("maxDistance")!)
        : undefined,
      organic: searchParams.get("organic") === "true",
      inStock: searchParams.get("inStock") === "true",
      sortBy: searchParams.get("sortBy") || "relevance",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "24"),
      farmId: searchParams.get("farmId") || undefined,
      lat: searchParams.get("lat")
        ? parseFloat(searchParams.get("lat")!)
        : undefined,
      lng: searchParams.get("lng")
        ? parseFloat(searchParams.get("lng")!)
        : undefined,
    };

    // Parse certifications array
    const certsParam = searchParams.get("certifications");
    if (certsParam) {
      filters.certifications = certsParam.split(",");
    }

    // Build Prisma where clause
    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
      farm: {
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
      },
    };

    // Search filter
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        {
          farm: {
            name: { contains: filters.search, mode: "insensitive" },
          },
        },
      ];
    }

    // Category filter
    if (filters.category) {
      where.category = filters.category as any;
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    // Stock filter
    if (filters.inStock) {
      where.inStock = true;
    }

    // Organic filter
    if (filters.organic) {
      where.organic = true;
    }

    // Farm filter
    if (filters.farmId) {
      where.farmId = filters.farmId;
    }

    // Certification filters - using certificationsArray from Farm model
    if (filters.certifications && filters.certifications.length > 0) {
      // Note: certificationsArray is a Json field, filtering would need to be done post-query
      // or use a different approach. Skipping for now.
    }

    // Build orderBy clause
    let orderBy: Prisma.ProductOrderByWithRelationInput[] = [];

    switch (filters.sortBy) {
      case "price-asc":
        orderBy = [{ price: "asc" }];
        break;
      case "price-desc":
        orderBy = [{ price: "desc" }];
        break;
      case "rating":
        orderBy = [{ averageRating: "desc" }];
        break;
      case "newest":
        orderBy = [{ createdAt: "desc" }];
        break;
      case "relevance":
      default:
        // Default ordering: featured first, then by rating
        orderBy = [{ featured: "desc" }, { averageRating: "desc" }];
        break;
    }

    // Calculate pagination
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 24, 100); // Max 100 items per page
    const skip = (page - 1) * limit;

    // Fetch products with pagination
    const [products, totalCount] = await Promise.all([
      database.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
              city: true,
              state: true,
              averageRating: true,
              certifications: {
                select: {
                  type: true,
                },
              },
            },
          },
        },
      }),
      database.product.count({ where }),
    ]);

    // Format response data
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: parseFloat(product.price.toString()),
      unit: product.unit,
      category: product.category,
      inStock: product.inStock,
      quantityAvailable: product.quantityAvailable
        ? Number(product.quantityAvailable)
        : null,
      organic: product.organic,
      rating: product.averageRating,
      reviewCount: product.reviewCount,
      image:
        product.primaryPhotoUrl ||
        product.images[0] ||
        "/images/placeholder-product.jpg",
      farm: {
        id: product.farm.id,
        name: product.farm.name,
        slug: product.farm.slug,
        location: `${product.farm.city}, ${product.farm.state}`,
        rating: product.farm.averageRating,
        certifications: product.farm.certifications.map((c) => c.type),
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: formattedProducts,
      meta: {
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          search: filters.search,
          category: filters.category,
          priceRange: {
            min: filters.minPrice,
            max: filters.maxPrice,
          },
          organic: filters.organic,
          inStock: filters.inStock,
          certifications: filters.certifications,
          sortBy: filters.sortBy,
        },
      },
    });
  } catch (error) {
    logger.error("Failed to fetch marketplace products", error, {
      operation: "GET /api/marketplace/products",
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCTS_FETCH_ERROR",
          message: "Failed to fetch products",
          details:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * Get product categories with counts
 */
export async function POST(_request: NextRequest) {
  try {
    // Get all categories with product counts
    const categories = await database.product.groupBy({
      by: ["category"],
      where: {
        status: "ACTIVE",
        farm: {
          status: "ACTIVE",
          verificationStatus: "VERIFIED",
        },
      },
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: "desc",
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories.map((cat) => ({
        category: cat.category,
        count: cat._count.category,
      })),
    });
  } catch (error) {
    logger.error("Failed to fetch product categories", error, {
      operation: "POST /api/marketplace/products",
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CATEGORIES_FETCH_ERROR",
          message: "Failed to fetch categories",
        },
      },
      { status: 500 },
    );
  }
}
