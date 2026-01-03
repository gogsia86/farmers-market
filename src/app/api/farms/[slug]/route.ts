import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("farms-slug-api");

/**
 * 🌾 FARM DETAIL API ENDPOINT
 * Fetch complete farm details by slug for public viewing
 *
 * GET /api/farms/[slug]
 * Returns: Complete farm profile with products, reviews, owner info, and statistics
 *
 * Features:
 * - Public access (no authentication required)
 * - Returns only ACTIVE and VERIFIED farms
 * - Includes related products (active only)
 * - Includes review statistics
 * - Includes owner information
 * - Agricultural consciousness enabled
 */

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    // In Next.js 15, params is a Promise that needs to be awaited
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    // Debug logging
    logger.debug("Farm detail request", {
      url: request.url,
      slug,
    });

    // Validate slug parameter
    if (!slug || typeof slug !== "string") {
      logger.warn("Invalid slug parameter", {
        slug,
        type: typeof slug,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SLUG",
            message: "Farm slug is required and must be a valid string",
          },
        },
        { status: 400 },
      );
    }

    // Handle special endpoint: /api/farms/featured
    if (slug.toLowerCase() === "featured") {
      logger.debug("Featured endpoint detected via slug route");
      const { searchParams } = new URL(request.url);
      const limit = Math.min(parseInt(searchParams.get("limit") || "6"), 20);

      // Fetch featured farms with optimized query
      const farms = await database.farm.findMany({
        where: {
          status: "ACTIVE",
          name: { not: "" },
          city: { not: "" },
          state: { not: "" },
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
          { averageRating: "desc" },
          { reviewCount: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
      });

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
          avatar: farm.logoUrl,
          cover: farm.bannerUrl,
        },
        rating: farm.averageRating,
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
          cached: true,
          agricultural: {
            consciousness: "DIVINE",
            operation: "FEATURED_MANIFESTATION",
          },
        },
      });
    }

    // Fetch farm with all related data
    const farm = await database.farm.findUnique({
      where: {
        slug,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
        products: {
          where: {
            inStock: true,
            status: "ACTIVE",
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            unit: true,
            inStock: true,
            images: true,
            category: true,
            organic: true,
            featured: true,
            averageRating: true,
            reviewCount: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
        reviews: {
          where: {
            status: "APPROVED",
          },
          select: {
            id: true,
            rating: true,
            reviewText: true,
            createdAt: true,
            customer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            products: true,
            reviews: true,
            orders: true,
          },
        },
      },
    });

    // Check if farm exists
    if (!farm) {
      logger.debug("Farm not found", { slug });
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

    // Check if farm is accessible (active and verified for public viewing)
    // Note: Remove this check if you want to allow viewing of all farms
    if (farm.status !== "ACTIVE" || farm.verificationStatus !== "VERIFIED") {
      logger.debug("Farm not available for viewing", {
        slug,
        status: farm.status,
        verificationStatus: farm.verificationStatus,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FARM_NOT_AVAILABLE",
            message: "This farm is not currently available for viewing",
          },
        },
        { status: 403 },
      );
    }

    // Increment profile views count (fire and forget)
    database.farm
      .update({
        where: { id: farm.id },
        data: {
          profileViewsCount: {
            increment: 1,
          },
        },
      })
      .catch((error) => {
        logger.error("Failed to update farm view count", error as Error, {
          farmId: farm.id,
          slug,
        });
        // Don't fail the request if view count update fails
      });

    // Format response data with proper type conversions
    const farmData = {
      id: farm.id,
      name: farm.name,
      slug: farm.slug,
      description: farm.description,
      story: farm.story,
      status: farm.status,
      verificationStatus: farm.verificationStatus,

      // Location information
      address: farm.address,
      city: farm.city,
      state: farm.state,
      zipCode: farm.zipCode,
      country: farm.country,
      latitude: farm.latitude ? Number(farm.latitude) : null,
      longitude: farm.longitude ? Number(farm.longitude) : null,
      deliveryRadius: farm.deliveryRadius,

      // Business details
      businessName: farm.businessName,
      yearEstablished: farm.yearEstablished,
      farmSize: farm.farmSize ? Number(farm.farmSize) : null,

      // Ratings and reviews
      averageRating: farm.averageRating ? Number(farm.averageRating) : null,
      reviewCount: farm.reviewCount,
      reviews: farm.reviews.map((review) => ({
        id: review.id,
        rating: Number(review.rating),
        comment: review.reviewText,
        createdAt: review.createdAt.toISOString(),
        customer: {
          id: review.customer.id,
          name: review.customer.name,
          avatar: review.customer.avatar,
        },
      })),

      // Contact information
      email: farm.email,
      phone: farm.phone,
      website: farm.website,

      // Images
      images: farm.images || [],
      logoUrl: farm.logoUrl,
      bannerUrl: farm.bannerUrl,

      // Metadata
      certifications: farm.certificationsArray || [],
      farmingPractices: farm.farmingPractices || [],
      productCategories: farm.productCategories || [],

      // Owner information
      owner: {
        id: farm.owner.id,
        name:
          farm.owner.name ||
          `${farm.owner.firstName || ""} ${farm.owner.lastName || ""}`.trim(),
        avatar: farm.owner.avatar,
        joinedYear: farm.owner.createdAt.getFullYear(),
      },

      // Products
      products: farm.products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        unit: product.unit,
        inStock: product.inStock,
        images: product.images || [],
        category: product.category,
        organic: product.organic,
        featured: product.featured,
        averageRating: product.averageRating
          ? Number(product.averageRating)
          : null,
        reviewCount: product.reviewCount,
      })),

      // Statistics
      stats: {
        totalProducts: farm._count.products,
        totalReviews: farm._count.reviews,
        totalOrders: farm._count.orders,
        profileViews: farm.profileViewsCount,
      },

      // Timestamps
      createdAt: farm.createdAt.toISOString(),
      updatedAt: farm.updatedAt.toISOString(),
    };

    logger.info("Farm details fetched successfully", {
      farmId: farm.id,
      slug,
      productCount: farm.products.length,
      reviewCount: farm.reviews.length,
    });

    return NextResponse.json(
      {
        success: true,
        data: farmData,
        agricultural: {
          consciousness: "active",
          season: getCurrentSeason(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Farm detail API error", error as Error, {
      endpoint: "GET /api/farms/[slug]",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FARM_FETCH_ERROR",
          message: "Failed to fetch farm details",
          details:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * Helper function to determine current agricultural season
 * Can be expanded with more sophisticated logic based on location
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return "SPRING";
  if (month >= 6 && month <= 8) return "SUMMER";
  if (month >= 9 && month <= 11) return "FALL";
  return "WINTER";
}
