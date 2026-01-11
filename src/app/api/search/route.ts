/**
 * 🔍 Unified Search API - Divine Discovery Engine
 * Comprehensive search across farms and products with advanced filtering
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { database } from "@/lib/database";
import type {
  Farm,
  Product,
  ProductCategory,
  ProductStatus,
} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/monitoring/logger";

/**
 * Search query validation schema
 */
const SearchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
  type: z.enum(["all", "farms", "products"]).optional().default("all"),
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
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      radius: z.number().optional().default(25),
    })
    .optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  inStock: z.string().optional(),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  sortBy: z
    .enum(["relevance", "price", "rating", "distance", "createdAt"])
    .optional()
    .default("relevance"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

interface SearchResponse {
  success: boolean;
  data?: {
    farms: Farm[];
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      totalFarms: number;
      totalProducts: number;
      totalPages: number;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    query: string;
    type: string;
    executionTime?: number;
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * GET /api/search
 * Unified search endpoint for farms and products
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<SearchResponse>> {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    // Parse location if provided
    let location: { lat: number; lng: number; radius: number } | undefined;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius");

    if (lat && lng) {
      location = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius: radius ? parseFloat(radius) : 25,
      };
    }

    // Validate query parameters
    const queryValidation = SearchQuerySchema.safeParse({
      q: searchParams.get("q") || "",
      type: searchParams.get("type") || "all",
      category: searchParams.get("category") || undefined,
      organic: searchParams.get("organic") || undefined,
      location,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      inStock: searchParams.get("inStock") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      sortBy: searchParams.get("sortBy") || "relevance",
      sortOrder: searchParams.get("sortOrder") || "desc",
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
      type,
      category,
      organic,
      location: searchLocation,
      minPrice,
      maxPrice,
      inStock,
      page,
      limit,
      sortBy,
      sortOrder,
    } = queryValidation.data;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let farms: any[] = [];
    let products: any[] = [];
    let totalFarms = 0;
    let totalProducts = 0;

    // Search Farms
    if (type === "all" || type === "farms") {
      const farmWhere: any = {
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { location: { path: ["city"], string_contains: query } },
          { location: { path: ["state"], string_contains: query } },
        ],
      };

      // Location filter for farms
      if (searchLocation) {
        // Note: For production, use PostGIS or similar for efficient geo queries
        // This is a simplified version
        farmWhere.latitude = {
          gte: searchLocation.lat - searchLocation.radius / 69,
          lte: searchLocation.lat + searchLocation.radius / 69,
        };
        farmWhere.longitude = {
          gte: searchLocation.lng - searchLocation.radius / 69,
          lte: searchLocation.lng + searchLocation.radius / 69,
        };
      }

      const farmOrderBy: any = {};
      if (sortBy === "rating") {
        farmOrderBy.averageRating = sortOrder;
      } else if (sortBy === "createdAt") {
        farmOrderBy.createdAt = sortOrder;
      } else {
        farmOrderBy.createdAt = "desc"; // Default
      }

      [farms, totalFarms] = await Promise.all([
        database.farm.findMany({
          where: farmWhere,
          skip: type === "farms" ? skip : 0,
          take:
            type === "farms"
              ? limitNum
              : Math.min(Math.floor(limitNum / 2), 10),
          orderBy: farmOrderBy,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            location: true,
            latitude: true,
            longitude: true,
            bannerUrl: true,
            certifications: true,
            averageRating: true,
            reviewCount: true,
            totalOrdersCount: true,
            status: true,
            verificationStatus: true,
            createdAt: true,
            updatedAt: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                name: true,
              },
            },
          },
        }),
        database.farm.count({ where: farmWhere }),
      ]);

      // Calculate distance if location provided
      if (searchLocation && farms.length > 0) {
        farms = farms.map((farm: any) => {
          const distance =
            farm.latitude && farm.longitude
              ? calculateDistance(
                  searchLocation.lat,
                  searchLocation.lng,
                  parseFloat(farm.latitude.toString()),
                  parseFloat(farm.longitude.toString()),
                )
              : null;
          return { ...farm, distance };
        });

        // Sort by distance if requested
        if (sortBy === "distance") {
          farms.sort((a, b) => {
            const distA = a.distance ?? Infinity;
            const distB = b.distance ?? Infinity;
            return sortOrder === "asc" ? distA - distB : distB - distA;
          });
        }
      }
    }

    // Search Products
    if (type === "all" || type === "products") {
      const productWhere: any = {
        status: "ACTIVE" as ProductStatus,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      };

      // Category filter
      if (category) {
        productWhere.category = category as ProductCategory;
      }

      // Organic filter
      if (organic === "true") {
        productWhere.organic = true;
      }

      // In stock filter
      if (inStock === "true") {
        productWhere.quantityAvailable = { gt: 0 };
      }

      // Price range filter
      if (minPrice || maxPrice) {
        productWhere.price = {};
        if (minPrice) {
          productWhere.price.gte = parseFloat(minPrice);
        }
        if (maxPrice) {
          productWhere.price.lte = parseFloat(maxPrice);
        }
      }

      // Farm location filter (if location provided)
      if (searchLocation) {
        productWhere.farm = {
          latitude: {
            gte: searchLocation.lat - searchLocation.radius / 69,
            lte: searchLocation.lat + searchLocation.radius / 69,
          },
          longitude: {
            gte: searchLocation.lng - searchLocation.radius / 69,
            lte: searchLocation.lng + searchLocation.radius / 69,
          },
          status: "ACTIVE",
          verificationStatus: "VERIFIED",
        };
      }

      const productOrderBy: any = {};
      if (sortBy === "price") {
        productOrderBy.price = sortOrder;
      } else if (sortBy === "rating") {
        productOrderBy.averageRating = sortOrder;
      } else if (sortBy === "createdAt") {
        productOrderBy.createdAt = sortOrder;
      } else {
        productOrderBy.purchaseCount = "desc"; // Relevance = popularity
      }

      [products, totalProducts] = await Promise.all([
        database.product.findMany({
          where: productWhere,
          skip: type === "products" ? skip : 0,
          take:
            type === "products"
              ? limitNum
              : Math.min(Math.floor(limitNum / 2), 10),
          orderBy: productOrderBy,
          include: {
            farm: {
              select: {
                id: true,
                name: true,
                slug: true,
                latitude: true,
                longitude: true,
                certifications: true,
                averageRating: true,
              },
            },
          },
        }),
        database.product.count({ where: productWhere }),
      ]);

      // Calculate distance for products (based on farm location)
      if (searchLocation && products.length > 0) {
        products = products.map((product: any) => {
          const distance =
            product.farm.latitude && product.farm.longitude
              ? calculateDistance(
                  searchLocation.lat,
                  searchLocation.lng,
                  parseFloat(product.farm.latitude.toString()),
                  parseFloat(product.farm.longitude.toString()),
                )
              : null;
          return { ...product, distance };
        });

        // Sort by distance if requested
        if (sortBy === "distance") {
          products.sort((a, b) => {
            const distA = a.distance ?? Infinity;
            const distB = b.distance ?? Infinity;
            return sortOrder === "asc" ? distA - distB : distB - distA;
          });
        }
      }
    }

    const total =
      type === "farms"
        ? totalFarms
        : type === "products"
          ? totalProducts
          : totalFarms + totalProducts;
    const totalPages = Math.ceil(total / limitNum);
    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        farms: farms as unknown as Farm[],
        products: products as unknown as Product[],
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalFarms,
          totalProducts,
          totalPages,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        query,
        type,
        executionTime,
      },
    });
  } catch (error) {
    logger.error("GET /api/search error:", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SEARCH_ERROR",
          message: error instanceof Error ? error.message : "Search failed",
        },
      },
      { status: 500 },
    );
  }
}
