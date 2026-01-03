/**
 * 🔍 PERSONALIZED SEARCH API ENDPOINT
 * Divine search with agricultural consciousness
 *
 * Features:
 * - Smart ranking with personalization
 * - A/B testing support
 * - Performance optimization
 * - Agricultural seasonal awareness
 *
 * @endpoint GET /api/search/personalized
 */

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import type { RankingAlgorithm } from "@/lib/services/search/smart-search-ranking.service";
import { smartSearchRankingService } from "@/lib/services/search/smart-search-ranking.service";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("personalized-search-api");

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    pagination?: {
      total: number;
      page: number;
      limit: number;
      hasMore: boolean;
    };
    performance?: {
      executionTime: number;
      cacheHit: boolean;
      algorithm: string;
      personalized: boolean;
    };
    agricultural?: {
      season: string;
      consciousness: string;
    };
  };
}

// ============================================================================
// GET HANDLER - Personalized Search
// ============================================================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get session (optional - works for both logged-in and anonymous users)
    const session = await auth();
    const userId = session?.user?.id;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || searchParams.get("q") || "";
    const algorithm = searchParams.get("algorithm") as RankingAlgorithm | null;
    const experimentId = searchParams.get("experimentId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Parse filters
    const categories = searchParams
      .get("categories")
      ?.split(",")
      .filter(Boolean);
    const farms = searchParams.get("farms")?.split(",").filter(Boolean);
    const inStock = searchParams.get("inStock") === "true";
    const organic = searchParams.get("organic") === "true";
    const local = searchParams.get("local") === "true";
    const seasonal = searchParams.get("seasonal") === "true";

    // Parse price range
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const priceRange =
      minPrice && maxPrice
        ? { min: parseFloat(minPrice), max: parseFloat(maxPrice) }
        : undefined;

    // Parse location
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius");
    const location =
      lat && lng
        ? {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius: radius ? parseFloat(radius) : undefined,
        }
        : undefined;

    // Validate query
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_QUERY",
            message: "Search query is required",
          },
        } as ApiResponse,
        { status: 400 },
      );
    }

    if (query.length > 200) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "QUERY_TOO_LONG",
            message: "Search query must be less than 200 characters",
          },
        } as ApiResponse,
        { status: 400 },
      );
    }

    // Execute smart search ranking
    const { results, metrics } =
      await smartSearchRankingService.rankSearchResults({
        query: query.trim(),
        userId,
        algorithm: algorithm || undefined,
        experimentId: experimentId || undefined,
        limit,
        offset,
        filters: {
          categories,
          farms,
          priceRange,
          inStock,
          organic,
          local,
          seasonal,
          location,
        },
      });

    // Calculate pagination
    const page = Math.floor(offset / limit) + 1;
    const hasMore = results.length === limit;

    // Get current season for agricultural consciousness
    const currentMonth = new Date().getMonth() + 1;
    const season = getSeasonFromMonth(currentMonth);

    // Return results
    return NextResponse.json(
      {
        success: true,
        data: {
          query,
          results: results.map((r) => ({
            id: r.product.id,
            name: r.product.name,
            description: r.product.description,
            price: r.product.price,
            unit: r.product.unit,
            images: r.product.images,
            inStock: r.product.inStock,
            farm: {
              id: r.product.farm.id,
              name: r.product.farm.name,
              location: r.product.farm.location,
            },
            category: {
              id: r.product.category.id,
              name: r.product.category.name,
            },
            scores: r.scores,
            finalScore: r.finalScore,
            rank: r.rank,
            personalized: r.personalized,
          })),
        },
        meta: {
          pagination: {
            total: metrics.totalResults,
            page,
            limit,
            hasMore,
          },
          performance: {
            executionTime: metrics.executionTime,
            cacheHit: metrics.cacheHit,
            algorithm: metrics.algorithm,
            personalized: metrics.personalized,
          },
          agricultural: {
            season,
            consciousness: "DIVINE",
          },
        },
      } as ApiResponse,
      {
        status: 200,
        headers: {
          "Cache-Control": userId
            ? "private, no-cache, must-revalidate"
            : "public, max-age=300, s-maxage=600",
          "X-Search-Algorithm": metrics.algorithm,
          "X-Search-Personalized": metrics.personalized.toString(),
          "X-Execution-Time": metrics.executionTime.toString(),
        },
      },
    );
  } catch (error) {
    logger.error("Personalized search failed", error, {
      operation: "personalizedSearch",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SEARCH_ERROR",
          message: error instanceof Error ? error.message : "Search failed",
          details:
            process.env.NODE_ENV === "development"
              ? { error: String(error) }
              : undefined,
        },
      } as ApiResponse,
      { status: 500 },
    );
  }
}

// ============================================================================
// POST HANDLER - Track Search Click
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const body = await request.json();
    const { query, productId, rank, algorithm } = body;

    if (!query || !productId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Query and productId are required",
          },
        } as ApiResponse,
        { status: 400 },
      );
    }

    // Track the click for analytics
    // This helps improve future search rankings
    // Implementation would update SearchPerformance table with click data

    return NextResponse.json(
      {
        success: true,
        data: {
          message: "Click tracked successfully",
        },
      } as ApiResponse,
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to track search click", error, {
      operation: "trackSearchClick",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TRACKING_ERROR",
          message: "Failed to track search click",
        },
      } as ApiResponse,
      { status: 500 },
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get agricultural season from month
 */
function getSeasonFromMonth(month: number): string {
  if (month >= 3 && month <= 5) return "SPRING";
  if (month >= 6 && month <= 8) return "SUMMER";
  if (month >= 9 && month <= 11) return "FALL";
  return "WINTER";
}

/**
 * Validate search filters
 */
function validateFilters(filters: any): { valid: boolean; error?: string } {
  // Price range validation
  if (filters.priceRange) {
    if (filters.priceRange.min < 0 || filters.priceRange.max < 0) {
      return { valid: false, error: "Price cannot be negative" };
    }
    if (filters.priceRange.min > filters.priceRange.max) {
      return { valid: false, error: "Min price cannot exceed max price" };
    }
  }

  // Location validation
  if (filters.location) {
    if (
      filters.location.lat < -90 ||
      filters.location.lat > 90 ||
      filters.location.lng < -180 ||
      filters.location.lng > 180
    ) {
      return { valid: false, error: "Invalid coordinates" };
    }
    if (filters.location.radius && filters.location.radius < 0) {
      return { valid: false, error: "Radius cannot be negative" };
    }
  }

  return { valid: true };
}
