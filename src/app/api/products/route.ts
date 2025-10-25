/**
 * PRODUCTS API - DIVINE AGRICULTURAL CATALOG ENDPOINT
 *
 * Manifests product entities through quantum RESTful consciousness.
 * Provides filtering, searching, and sorting across agricultural dimensions.
 *
 * Divine Patterns Applied:
 * - API Route Divine Patterns (04_NEXTJS_DIVINE_IMPLEMENTATION)
 * - Agricultural Quantum Types (02_AGRICULTURAL_QUANTUM_MASTERY)
 * - Performance Reality Bending (03_PERFORMANCE_REALITY_BENDING)
 * - Testing Security Divinity (05_TESTING_SECURITY_DIVINITY)
 *
 * Functional Requirements: FR-001 (Product Catalog)
 *
 * @route GET /api/products
 * @access Public (browsing), Private (detailed info)
 */

import { Season } from "@/types/farm.types";
import type { ProductFilters, QuantumProduct } from "@/types/product.types";
import {
  AgriculturalProductCategory,
  ProductQuantumState,
} from "@/types/product.types";
import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// MOCK DATA - FOR DEVELOPMENT (Replace with Prisma queries)
// ============================================================================

const MOCK_PRODUCTS: QuantumProduct[] = [
  {
    identity: {
      id: "prod_1" as any,
      slug: "organic-heirloom-tomatoes" as any,
      name: "Organic Heirloom Tomatoes",
      description:
        "Sun-ripened heirloom tomatoes grown using biodynamic farming practices. Rich, complex flavor perfect for salads or sauces.",
      shortDescription: "Sun-ripened heirloom tomatoes with complex flavors",
    },
    metadata: {
      category: AgriculturalProductCategory.VEGETABLES,
      subcategory: "Tomatoes",
      variety: "Cherokee Purple",
      farmId: "farm_1" as any,
      growingMethod: "ORGANIC",
      color: "Purple-Red",
      size: "LARGE",
      weight: 250,
      tags: ["organic", "heirloom", "non-gmo", "locally-grown"],
      searchKeywords: [
        "tomato",
        "tomatoes",
        "heirloom",
        "organic",
        "vegetables",
      ],
    },
    inventory: {
      quantumState: ProductQuantumState.AVAILABLE,
      quantityAvailable: 45,
      quantityReserved: 5,
      quantityTotal: 50,
      unit: "lb",
      lastHarvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    pricing: {
      basePrice: 599, // $5.99 in cents
      currency: "USD",
      pricePerUnit: "$5.99/lb",
      onSale: false,
    },
    quality: {
      organic: true,
      certifications: [
        {
          type: "USDA_ORGANIC",
          certifiedBy: "USDA",
          certificationDate: new Date("2023-01-15"),
          verified: true,
        },
      ],
      grade: "A",
      freshness: 95,
      harvestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      shelfLife: 7,
    },
    seasonality: {
      primarySeasons: [Season.SUMMER, Season.FALL],
      availability: [
        { season: Season.SPRING, peakSeason: false, availability: "LOW" },
        { season: Season.SUMMER, peakSeason: true, availability: "HIGH" },
        { season: Season.FALL, peakSeason: true, availability: "HIGH" },
        { season: Season.WINTER, peakSeason: false, availability: "NONE" },
      ],
      isYearRound: false,
    },
    gallery: {
      images: [
        {
          id: "img_1",
          url: "/images/products/heirloom-tomatoes.jpg",
          alt: "Fresh organic heirloom tomatoes",
          isPrimary: true,
          width: 800,
          height: 600,
          format: "WEBP",
          order: 1,
        },
      ],
      primaryImage: {
        id: "img_1",
        url: "/images/products/heirloom-tomatoes.jpg",
        alt: "Fresh organic heirloom tomatoes",
        isPrimary: true,
        width: 800,
        height: 600,
        format: "WEBP",
        order: 1,
      },
      thumbnails: [],
    },
    temporal: {
      createdAt: new Date("2024-06-01"),
      updatedAt: new Date(),
    },
    metrics: {
      views: 1250,
      likes: 89,
      purchases: 45,
      rating: 4.8,
      reviewCount: 23,
    },
  },
  {
    identity: {
      id: "prod_2" as any,
      slug: "fresh-basil-bunch" as any,
      name: "Fresh Basil",
      description:
        "Fragrant organic basil, perfect for pesto, caprese salad, or adding fresh flavor to any dish. Hand-picked this morning.",
      shortDescription: "Fragrant organic basil, freshly picked",
    },
    metadata: {
      category: AgriculturalProductCategory.HERBS,
      variety: "Sweet Basil",
      farmId: "farm_1" as any,
      growingMethod: "ORGANIC",
      color: "Green",
      tags: ["organic", "fresh", "herbs", "locally-grown"],
      searchKeywords: ["basil", "herb", "herbs", "organic", "fresh"],
    },
    inventory: {
      quantumState: ProductQuantumState.LOW_STOCK,
      quantityAvailable: 8,
      quantityReserved: 2,
      quantityTotal: 10,
      unit: "bunch",
      lastHarvestDate: new Date(),
    },
    pricing: {
      basePrice: 349, // $3.49
      currency: "USD",
      pricePerUnit: "$3.49/bunch",
      onSale: true,
      salePrice: 299, // $2.99 (15% off)
      saleEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    quality: {
      organic: true,
      certifications: [
        {
          type: "USDA_ORGANIC",
          certifiedBy: "USDA",
          certificationDate: new Date("2023-01-15"),
          verified: true,
        },
      ],
      grade: "PREMIUM",
      freshness: 100,
      harvestedAt: new Date(),
      shelfLife: 5,
    },
    seasonality: {
      primarySeasons: [Season.SUMMER],
      availability: [
        { season: Season.SPRING, peakSeason: false, availability: "MEDIUM" },
        { season: Season.SUMMER, peakSeason: true, availability: "HIGH" },
        { season: Season.FALL, peakSeason: false, availability: "MEDIUM" },
        { season: Season.WINTER, peakSeason: false, availability: "LOW" },
      ],
      isYearRound: false,
    },
    gallery: {
      images: [
        {
          id: "img_2",
          url: "/images/products/fresh-basil.jpg",
          alt: "Fresh organic basil bunch",
          isPrimary: true,
          width: 800,
          height: 600,
          format: "WEBP",
          order: 1,
        },
      ],
      primaryImage: {
        id: "img_2",
        url: "/images/products/fresh-basil.jpg",
        alt: "Fresh organic basil bunch",
        isPrimary: true,
        width: 800,
        height: 600,
        format: "WEBP",
        order: 1,
      },
      thumbnails: [],
    },
    temporal: {
      createdAt: new Date("2024-07-01"),
      updatedAt: new Date(),
    },
    metrics: {
      views: 856,
      likes: 62,
      purchases: 38,
      rating: 4.9,
      reviewCount: 18,
    },
  },
];

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

/**
 * GET /api/products
 * Retrieve products with optional filtering, searching, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;

    const filters: ProductFilters = {
      categories: searchParams.get("categories")?.split(",") as
        | AgriculturalProductCategory[]
        | undefined,
      farmIds: searchParams.get("farmIds")?.split(",") as any,
      seasons: searchParams.get("seasons")?.split(",") as Season[] | undefined,
      availableNow: searchParams.get("availableNow") === "true",
      organic: searchParams.get("organic") === "true",
      minPrice: searchParams.get("minPrice")
        ? parseInt(searchParams.get("minPrice")!)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseInt(searchParams.get("maxPrice")!)
        : undefined,
      onSale: searchParams.get("onSale") === "true",
      inStock: searchParams.get("inStock") === "true",
      searchQuery: searchParams.get("search") || undefined,
      sortBy: (searchParams.get("sortBy") as any) || "name",
      sortOrder: (searchParams.get("sortOrder") as any) || "asc",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
    };

    // Apply filters to mock data
    let filteredProducts = [...MOCK_PRODUCTS];

    // Filter by categories
    if (filters.categories && filters.categories.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        filters.categories!.includes(p.metadata.category)
      );
    }

    // Filter by organic
    if (filters.organic) {
      filteredProducts = filteredProducts.filter((p) => p.quality.organic);
    }

    // Filter by in stock
    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.inventory.quantumState === ProductQuantumState.AVAILABLE &&
          p.inventory.quantityAvailable > 0
      );
    }

    // Filter by on sale
    if (filters.onSale) {
      filteredProducts = filteredProducts.filter((p) => p.pricing.onSale);
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.pricing.basePrice >= filters.minPrice!
      );
    }
    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.pricing.basePrice <= filters.maxPrice!
      );
    }

    // Search by query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.identity.name.toLowerCase().includes(query) ||
          p.identity.description.toLowerCase().includes(query) ||
          p.metadata.searchKeywords.some((k) => k.toLowerCase().includes(query))
      );
    }

    // Sort products
    if (filters.sortBy) {
      filteredProducts.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case "name":
            comparison = a.identity.name.localeCompare(b.identity.name);
            break;
          case "price":
            comparison = a.pricing.basePrice - b.pricing.basePrice;
            break;
          case "newest":
            comparison =
              b.temporal.createdAt.getTime() - a.temporal.createdAt.getTime();
            break;
          case "popularity":
            comparison = (b.metrics?.views || 0) - (a.metrics?.views || 0);
            break;
          case "rating":
            comparison = (b.metrics?.rating || 0) - (a.metrics?.rating || 0);
            break;
        }
        return filters.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Build response
    return NextResponse.json(
      {
        success: true,
        products: paginatedProducts,
        pagination: {
          total: filteredProducts.length,
          page,
          limit,
          totalPages: Math.ceil(filteredProducts.length / limit),
          hasMore: endIndex < filteredProducts.length,
        },
        filters,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const dynamic = "force-dynamic"; // Disable static optimization for API routes
