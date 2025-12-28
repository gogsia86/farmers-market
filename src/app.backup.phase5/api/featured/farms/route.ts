/**
 * 🌟 FEATURED FARMS API ENDPOINT
 * Returns top-rated, admin-featured, or recently active farms for homepage
 *
 * Divine Patterns:
 * - Real database integration (no mock data)
 * - Agricultural consciousness
 * - Caching with seasonal awareness
 * - Performance optimized
 */

import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "6", 10);
    const strategy = searchParams.get("strategy") || "top-rated"; // top-rated, recent, random

    let farms;

    switch (strategy) {
      case "top-rated": {
        // Get farms with highest average ratings
        farms = await database.farm.findMany({
          where: {
            status: "ACTIVE",
            verificationStatus: "VERIFIED",
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            city: true,
            state: true,
            bannerUrl: true,
            logoUrl: true,
            latitude: true,
            longitude: true,
            _count: {
              select: {
                products: true,
                reviews: true,
              },
            },
            reviews: {
              select: {
                rating: true,
              },
            },
          },
          take: limit * 2, // Get more to filter and sort
        });

        // Calculate average ratings and sort
        const farmsWithRatings = farms
          .map((farm) => {
            const totalRating = farm.reviews.reduce(
              (sum: number, review: { rating: number }) => sum + review.rating,
              0,
            );
            const averageRating =
              farm.reviews.length > 0 ? totalRating / farm.reviews.length : 0;

            return {
              ...farm,
              averageRating,
              totalReviews: farm.reviews.length,
              reviews: undefined, // Remove reviews array from response
            };
          })
          .filter((farm) => farm.averageRating >= 4.0) // Only show highly-rated farms
          .sort((a, b) => {
            // Sort by rating, then by review count
            if (b.averageRating === a.averageRating) {
              return b.totalReviews - a.totalReviews;
            }
            return b.averageRating - a.averageRating;
          })
          .slice(0, limit);

        farms = farmsWithRatings;
        break;
      }

      case "recent": {
        // Get recently active farms (with recent products)
        farms = await database.farm.findMany({
          where: {
            status: "ACTIVE",
            verificationStatus: "VERIFIED",
            products: {
              some: {
                status: "ACTIVE",
                inStock: true,
              },
            },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            city: true,
            state: true,
            bannerUrl: true,
            logoUrl: true,
            latitude: true,
            longitude: true,
            createdAt: true,
            _count: {
              select: {
                products: true,
                reviews: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
        });
        break;
      }

      case "random": {
        // Get random selection of active farms
        const totalFarms = await database.farm.count({
          where: {
            status: "ACTIVE",
            verificationStatus: "VERIFIED",
          },
        });

        const skip = Math.max(
          0,
          Math.floor(Math.random() * (totalFarms - limit)),
        );

        farms = await database.farm.findMany({
          where: {
            status: "ACTIVE",
            verificationStatus: "VERIFIED",
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            city: true,
            state: true,
            bannerUrl: true,
            logoUrl: true,
            latitude: true,
            longitude: true,
            _count: {
              select: {
                products: true,
                reviews: true,
              },
            },
          },
          skip,
          take: limit,
        });
        break;
      }

      default:
        // Default to top-rated
        farms = await database.farm.findMany({
          where: {
            status: "ACTIVE",
            verificationStatus: "VERIFIED",
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            city: true,
            state: true,
            bannerUrl: true,
            logoUrl: true,
            latitude: true,
            longitude: true,
            _count: {
              select: {
                products: true,
                reviews: true,
              },
            },
          },
          take: limit,
        });
    }

    return NextResponse.json(
      {
        success: true,
        data: farms,
        meta: {
          count: farms.length,
          strategy,
          agricultural: {
            consciousness: "divine",
            season: getCurrentSeason(),
          },
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("[FEATURED_FARMS_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch featured farms",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Get current season based on month
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return "SPRING";
  if (month >= 6 && month <= 8) return "SUMMER";
  if (month >= 9 && month <= 11) return "FALL";
  return "WINTER";
}
