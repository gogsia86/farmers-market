import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("marketplace-farm-api");

/**
 * 🌾 FARM PROFILE API - Phase 3
 * Fetch complete farm details by slug
 *
 * GET /api/marketplace/farms/[slug]
 * Returns: Farm profile with products, reviews, certifications, location
 */

interface Props {
  params: {
    slug: string;
  };
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_SLUG",
            message: "Farm slug is required",
          },
        },
        { status: 400 },
      );
    }

    // Fetch farm with all related data
    const farm = await database.farm.findUnique({
      where: {
        slug,
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FARM_NOT_FOUND",
            message: "Farm not found or not available",
          },
        },
        { status: 404 },
      );
    }

    // Format farm data using actual schema fields
    const farmData = {
      id: farm.id,
      name: farm.name,
      slug: farm.slug,
      description: farm.description,
      story: farm.story,
      status: farm.status,
      verificationStatus: farm.verificationStatus,

      // Location
      address: farm.address,
      city: farm.city,
      state: farm.state,
      zipCode: farm.zipCode,
      country: farm.country,
      latitude: Number(farm.latitude),
      longitude: Number(farm.longitude),
      deliveryRadius: farm.deliveryRadius,

      // Details
      businessName: farm.businessName,
      yearEstablished: farm.yearEstablished,
      farmSize: farm.farmSize ? Number(farm.farmSize) : null,

      // Ratings
      averageRating: farm.averageRating ? Number(farm.averageRating) : null,
      reviewCount: farm.reviewCount,

      // Contact
      email: farm.email,
      phone: farm.phone,
      website: farm.website,

      // Images
      images: farm.images,
      logoUrl: farm.logoUrl,
      bannerUrl: farm.bannerUrl,

      // Metadata
      certificationsArray: farm.certificationsArray,
      farmingPractices: farm.farmingPractices,
      productCategories: farm.productCategories,

      // Owner
      owner: {
        id: farm.owner.id,
        name: farm.owner.name,
        avatar: farm.owner.avatar,
        joinedYear: farm.owner.createdAt.getFullYear(),
      },

      // Images
      heroImage: farm.bannerUrl || farm.images?.[0] || null,

      // Stats
      profileViewsCount: farm.profileViewsCount,
      totalOrdersCount: farm.totalOrdersCount,

      // Timestamps
      createdAt: farm.createdAt.toISOString(),
      updatedAt: farm.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: farmData,
    });
  } catch (error) {
    logger.error("Failed to fetch farm profile", error, {
      operation: "getFarmProfile",
      slug: params.slug,
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FARM_FETCH_ERROR",
          message: "Failed to fetch farm profile",
          details:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      },
      { status: 500 },
    );
  }
}
