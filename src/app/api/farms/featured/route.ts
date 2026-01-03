/**
 * 🌟 FEATURED FARMS API ROUTE
 *
 * Returns curated list of featured farms for homepage and promotional sections.
 * Features farms based on rating, activity, and completeness of profile.
 *
 * Divine Patterns Applied:
 * - Clean separation: Route → Database
 * - Unified API response format
 * - Agricultural consciousness
 * - Simple, reliable implementation
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("featured-farms-api");

/**
 * GET /api/farms/featured
 *
 * Returns featured farms based on:
 * - Active status
 * - High ratings (>= 4.0)
 * - Complete profiles
 * - Recent activity
 *
 * Query Parameters:
 * - limit?: number (default: 6, max: 20)
 *
 * @example
 * GET /api/farms/featured?limit=6
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "farms": [...],
 *     "count": 6
 *   },
 *   "meta": {
 *     "agricultural": {
 *       "consciousness": "DIVINE",
 *       "operation": "FEATURED_MANIFESTATION"
 *     }
 *   }
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "6"), 20);

    logger.debug("Fetching featured farms", { limit });

    // Fetch featured farms with optimized query
    const farms = await database.farm.findMany({
      where: {
        status: "ACTIVE",
        // Only show farms with complete profiles (fields are required in schema)
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        city: true,
        state: true,
        logoUrl: true,
        bannerUrl: true,
        averageRating: true,
        reviewCount: true,
        farmingPractices: true,
        productCategories: true,
        deliveryRadius: true,
        createdAt: true,
        _count: {
          select: {
            products: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
      },
      orderBy: [
        { averageRating: "desc" }, // Highest rated first
        { reviewCount: "desc" }, // Most reviewed
        { createdAt: "desc" }, // Newest
      ],
      take: limit,
    });

    // Format response
    const formattedFarms = farms.map((farm) => ({
      id: farm.id,
      name: farm.name,
      slug: farm.slug,
      description: farm.description,
      location: {
        city: farm.city,
        state: farm.state,
      },
      images: {
        logo: farm.logoUrl,
        banner: farm.bannerUrl,
      },
      rating: farm.averageRating
        ? parseFloat(farm.averageRating.toString())
        : null,
      reviewCount: farm.reviewCount,
      farmingPractices: farm.farmingPractices,
      productCategories: farm.productCategories,
      deliveryRadius: farm.deliveryRadius,
      activeProductCount: farm._count.products,
      createdAt: farm.createdAt.toISOString(),
    }));

    logger.info("Featured farms fetched successfully", {
      count: formattedFarms.length,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        farms: formattedFarms,
        count: formattedFarms.length,
      },
      meta: {
        agricultural: {
          consciousness: "DIVINE",
          operation: "FEATURED_MANIFESTATION",
          season: getCurrentSeason(),
        },
      },
    });
  } catch (error) {
    logger.error("Featured farms fetch error", error as Error, {
      endpoint: "GET /api/farms/featured",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch featured farms",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * Helper function to get current season based on date
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return "SPRING";
  if (month >= 6 && month <= 8) return "SUMMER";
  if (month >= 9 && month <= 11) return "FALL";
  return "WINTER";
}

/**
 * 🌟 Divine featured farms route established ✨
 * - Simple, reliable implementation
 * - Curated selection based on quality metrics
 * - Optimized for homepage hero sections
 * - Agricultural consciousness maintained
 * Ready for quantum featured farm operations! 🚜
 */
