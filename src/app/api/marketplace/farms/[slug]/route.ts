import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

/**
 * 🌾 FARM PROFILE API - Phase 3
 * Fetch complete farm details by slug
 *
 * GET /api/marketplace/farms/[slug]
 * Returns: Farm profile with products, reviews, certifications, location
 */

interface PageParams {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: PageParams) {
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
        products: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            isFeatured: "desc",
          },
          take: 20,
          include: {
            photos: {
              where: { isPrimary: true },
              take: 1,
              select: {
                photoUrl: true,
                thumbnailUrl: true,
                altText: true,
              },
            },
          },
        },
        certifications: {
          where: {
            status: "APPROVED",
          },
          select: {
            id: true,
            type: true,
            certifierName: true,
            issueDate: true,
            expirationDate: true,
          },
        },
        reviews: {
          where: {
            status: "APPROVED",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                name: true,
                avatar: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        photos: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
          select: {
            id: true,
            photoUrl: true,
            thumbnailUrl: true,
            caption: true,
            altText: true,
            isPrimary: true,
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

    // Format products
    const formattedProducts = farm.products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: parseFloat(product.price.toString()),
      unit: product.unit,
      category: product.category,
      inStock: product.stockQuantity > 0,
      stockQuantity: product.stockQuantity,
      organic: product.isOrganic,
      rating: product.averageRating,
      reviewCount: product.reviewCount,
      image:
        product.photos[0]?.thumbnailUrl ||
        product.photos[0]?.photoUrl ||
        "/images/placeholder-product.jpg",
    }));

    // Format reviews
    const formattedReviews = farm.reviews.map((review) => ({
      id: review.id,
      customerName:
        review.customer.name ||
        `${review.customer.firstName || ""} ${review.customer.lastName || ""}`.trim() ||
        "Anonymous",
      customerAvatar: review.customer.avatar,
      rating: review.rating,
      reviewText: review.reviewText,
      createdAt: review.createdAt.toISOString(),
      isVerifiedPurchase: review.isVerifiedPurchase,
      productName: review.product?.name,
    }));

    // Format certifications
    const formattedCertifications = farm.certifications.map((cert) => ({
      id: cert.id,
      type: cert.type,
      certifierName: cert.certifierName,
      issueDate: cert.issueDate.toISOString(),
      expirationDate: cert.expirationDate?.toISOString(),
    }));

    // Format photos
    const formattedPhotos = farm.photos.map((photo) => ({
      id: photo.id,
      url: photo.photoUrl,
      thumbnailUrl: photo.thumbnailUrl,
      caption: photo.caption,
      altText: photo.altText,
      isPrimary: photo.isPrimary,
    }));

    // Format farm data
    const farmData = {
      id: farm.id,
      name: farm.name,
      slug: farm.slug,
      description: farm.description,
      story: farm.story,
      tagline: farm.tagline || farm.description?.substring(0, 100) + "...",
      farmType: farm.farmType,

      // Location
      address: farm.address,
      city: farm.city,
      state: farm.state,
      zipCode: farm.zipCode,
      latitude: farm.latitude,
      longitude: farm.longitude,
      deliveryRadius: farm.deliveryRadius,

      // Details
      farmSize: farm.size,
      establishedYear: farm.establishedYear,

      // Ratings
      rating: farm.averageRating,
      reviewCount: farm.totalReviews,

      // Contact
      email: farm.contactEmail,
      phone: farm.contactPhone,
      website: farm.website,

      // Metadata
      certifications: farm.certifications.map((c) => c.type),
      farmingPractices: (farm.practices as string[]) || [],
      specialties: (farm.specialties as string[]) || [],

      // Operating hours (from JSON field)
      operatingHours: (farm.operatingHours as Record<string, string>) || {},

      // Social media (from JSON field)
      socialMedia: (farm.socialMedia as Record<string, string>) || {},

      // Owner
      owner: {
        id: farm.owner.id,
        name:
          farm.owner.name ||
          `${farm.owner.firstName || ""} ${farm.owner.lastName || ""}`.trim(),
        avatar: farm.owner.avatar,
        joinedYear: farm.owner.createdAt.getFullYear(),
        bio: farm.ownerBio || "",
      },

      // Related data
      products: formattedProducts,
      reviews: formattedReviews,
      certificationsDetails: formattedCertifications,
      photos: formattedPhotos,
      heroImage:
        formattedPhotos.find((p) => p.isPrimary)?.url ||
        formattedPhotos[0]?.url,

      // Timestamps
      createdAt: farm.createdAt.toISOString(),
      updatedAt: farm.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: farmData,
    });
  } catch (error) {
    console.error("[FARM_PROFILE_API_ERROR]", error);
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
