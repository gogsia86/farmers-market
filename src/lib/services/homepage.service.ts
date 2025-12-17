/**
 * HOMEPAGE SERVICE
 *
 * Provides optimized data fetching for homepage components
 * - Featured farms with real-time stats
 * - Trending products based on views and purchases
 * - Platform statistics
 * - Seasonal products
 * - New farmers
 */

import { database } from "@/lib/database";
import type { Farm, Product, User } from "@prisma/client";

// ============================================================================
// Types
// ============================================================================

export interface FeaturedFarm extends Farm {
  owner: User;
  products: Product[];
  _count: {
    products: number;
    reviews: number;
    orders: number;
  };
}

export interface TrendingProduct extends Product {
  farm: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
  };
}

export interface PlatformStats {
  totalFarms: number;
  activeFarms: number;
  totalProducts: number;
  availableProducts: number;
  totalOrders: number;
  activeUsers: number;
  verifiedFarms: number;
  organicProducts: number;
  timestamp: string;
}

export interface NewFarmer {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  logoUrl: string | null;
  description: string | null;
  productCount: number;
  createdAt: Date;
}

export interface SeasonalProduct extends TrendingProduct {
  seasonalStart: Date | null;
  seasonalEnd: Date | null;
  harvestDate: Date | null;
}

// ============================================================================
// Featured Farms
// ============================================================================

export async function getFeaturedFarms(options: {
  limit?: number;
  featured?: boolean;
}): Promise<FeaturedFarm[]> {
  const { limit = 6, featured = true } = options;

  try {
    const farms = await database.farm.findMany({
      where: {
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
        ...(featured && { averageRating: { gte: 4.5 } }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        story: true,
        status: true,
        verificationStatus: true,
        verifiedBy: true,
        verifiedAt: true,
        rejectionReason: true,
        ownerId: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        latitude: true,
        longitude: true,
        location: true,
        images: true,
        logoUrl: true,
        bannerUrl: true,
        businessName: true,
        taxId: true,
        businessType: true,
        yearEstablished: true,
        farmSize: true,
        certificationsArray: true,
        stripeAccountId: true,
        stripeOnboarded: true,
        stripeOnboardedAt: true,
        payoutsEnabled: true,
        stripeDetailsSubmitted: true,
        payoutSchedule: true,
        productCategories: true,
        farmingPractices: true,
        deliveryRadius: true,
        profileViewsCount: true,
        totalOrdersCount: true,
        totalRevenueUSD: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
            phone: true,
            avatar: true,
            role: true,
            status: true,
            approvedBy: true,
            approvedAt: true,
            suspendedBy: true,
            suspendedAt: true,
            suspensionReason: true,
            emailVerified: true,
            emailVerifiedAt: true,
            phoneVerified: true,
            phoneVerifiedAt: true,
            verificationToken: true,
            verificationExpiry: true,
            resetToken: true,
            resetTokenExpiry: true,
            dietaryPreferences: true,
            notificationPreferences: true,
            privacySettings: true,
            lastLoginAt: true,
            lastLoginIP: true,
            loginCount: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        products: {
          where: {
            status: "ACTIVE",
            inStock: true,
          },
          take: 4,
          orderBy: { viewsCount: "desc" },
        },
        _count: {
          select: {
            products: true,
            reviews: true,
            orders: true,
          },
        },
      },
      orderBy: [
        { averageRating: "desc" },
        { totalOrdersCount: "desc" },
        { profileViewsCount: "desc" },
      ],
      take: limit,
    });

    return farms as FeaturedFarm[];
  } catch (error) {
    console.error("Error fetching featured farms:", error);
    return [];
  }
}

// ============================================================================
// Trending Products
// ============================================================================

export async function getTrendingProducts(options: {
  limit?: number;
  timeframe?: "day" | "week" | "month";
}): Promise<TrendingProduct[]> {
  const { limit = 8, timeframe = "week" } = options;

  // Calculate date threshold based on timeframe
  const now = new Date();
  const dateThreshold = new Date();

  switch (timeframe) {
    case "day":
      dateThreshold.setDate(now.getDate() - 1);
      break;
    case "week":
      dateThreshold.setDate(now.getDate() - 7);
      break;
    case "month":
      dateThreshold.setMonth(now.getMonth() - 1);
      break;
  }

  try {
    const products = await database.product.findMany({
      where: {
        status: "ACTIVE",
        inStock: true,
        createdAt: { gte: dateThreshold },
      },
      select: {
        id: true,
        farmId: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        status: true,
        price: true,
        compareAtPrice: true,
        unit: true,
        trackInventory: true,
        quantityAvailable: true,
        lowStockThreshold: true,
        allowBackorder: true,
        inStock: true,
        organic: true,
        seasonal: true,
        featured: true,
        seasonalStart: true,
        seasonalEnd: true,
        harvestDate: true,
        storageInstructions: true,
        primaryPhotoUrl: true,
        photoUrls: true,
        images: true,
        hasVariants: true,
        variants: true,
        tags: true,
        pricing: true,
        inventory: true,
        attributes: true,
        scheduledPublishAt: true,
        scheduledUnpublishAt: true,
        publishedAt: true,
        viewsCount: true,
        cartAddsCount: true,
        purchaseCount: true,
        wishlistCount: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true,
        updatedAt: true,
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: [
        { viewsCount: "desc" },
        { cartAddsCount: "desc" },
        { purchaseCount: "desc" },
      ],
      take: limit,
    });

    return products as TrendingProduct[];
  } catch (error) {
    console.error("Error fetching trending products:", error);
    return [];
  }
}

// ============================================================================
// Platform Statistics
// ============================================================================

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const [
      totalFarms,
      activeFarms,
      totalProducts,
      availableProducts,
      totalOrders,
      activeUsers,
      verifiedFarms,
      organicProducts,
    ] = await Promise.all([
      // Total farms
      database.farm.count(),

      // Active farms
      database.farm.count({
        where: { status: "ACTIVE" },
      }),

      // Total products
      database.product.count(),

      // Available products
      database.product.count({
        where: {
          status: "ACTIVE",
          inStock: true,
        },
      }),

      // Total orders
      database.order.count(),

      // Active users
      database.user.count({
        where: { status: "ACTIVE" },
      }),

      // Verified farms
      database.farm.count({
        where: { verificationStatus: "VERIFIED" },
      }),

      // Organic products
      database.product.count({
        where: {
          organic: true,
          status: "ACTIVE",
        },
      }),
    ]);

    return {
      totalFarms,
      activeFarms,
      totalProducts,
      availableProducts,
      totalOrders,
      activeUsers,
      verifiedFarms,
      organicProducts,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching platform stats:", error);

    // Return default stats on error
    return {
      totalFarms: 0,
      activeFarms: 0,
      totalProducts: 0,
      availableProducts: 0,
      totalOrders: 0,
      activeUsers: 0,
      verifiedFarms: 0,
      organicProducts: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// New Farmers
// ============================================================================

export async function getNewFarmers(options: {
  limit?: number;
  daysAgo?: number;
}): Promise<NewFarmer[]> {
  const { limit = 6, daysAgo = 30 } = options;

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

  try {
    const farms = await database.farm.findMany({
      where: {
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
        createdAt: { gte: dateThreshold },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
        logoUrl: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return farms.map((farm) => ({
      id: farm.id,
      name: farm.name,
      slug: farm.slug,
      city: farm.city,
      state: farm.state,
      logoUrl: farm.logoUrl,
      description: farm.description,
      productCount: farm._count.products,
      createdAt: farm.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching new farmers:", error);
    return [];
  }
}

// ============================================================================
// Seasonal Products
// ============================================================================

export async function getSeasonalProducts(options: {
  limit?: number;
  currentSeasonOnly?: boolean;
}): Promise<SeasonalProduct[]> {
  const { limit = 8, currentSeasonOnly = true } = options;

  const now = new Date();

  try {
    const products = await database.product.findMany({
      where: {
        status: "ACTIVE",
        inStock: true,
        seasonal: true,
        ...(currentSeasonOnly && {
          OR: [
            {
              seasonalStart: { lte: now },
              seasonalEnd: { gte: now },
            },
            {
              seasonalStart: null,
              seasonalEnd: null,
            },
          ],
        }),
      },
      select: {
        id: true,
        farmId: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        status: true,
        price: true,
        compareAtPrice: true,
        unit: true,
        trackInventory: true,
        quantityAvailable: true,
        lowStockThreshold: true,
        allowBackorder: true,
        inStock: true,
        organic: true,
        seasonal: true,
        featured: true,
        seasonalStart: true,
        seasonalEnd: true,
        harvestDate: true,
        storageInstructions: true,
        primaryPhotoUrl: true,
        photoUrls: true,
        images: true,
        hasVariants: true,
        variants: true,
        tags: true,
        pricing: true,
        inventory: true,
        attributes: true,
        scheduledPublishAt: true,
        scheduledUnpublishAt: true,
        publishedAt: true,
        viewsCount: true,
        cartAddsCount: true,
        purchaseCount: true,
        wishlistCount: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true,
        updatedAt: true,
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: [
        { featured: "desc" },
        { averageRating: "desc" },
        { viewsCount: "desc" },
      ],
      take: limit,
    });

    return products as SeasonalProduct[];
  } catch (error) {
    console.error("Error fetching seasonal products:", error);
    return [];
  }
}

// ============================================================================
// Featured Products (General)
// ============================================================================

export async function getFeaturedProducts(options: {
  limit?: number;
}): Promise<TrendingProduct[]> {
  const { limit = 8 } = options;

  try {
    const products = await database.product.findMany({
      where: {
        status: "ACTIVE",
        inStock: true,
        featured: true,
      },
      select: {
        id: true,
        farmId: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        status: true,
        price: true,
        compareAtPrice: true,
        unit: true,
        trackInventory: true,
        quantityAvailable: true,
        lowStockThreshold: true,
        allowBackorder: true,
        inStock: true,
        organic: true,
        seasonal: true,
        featured: true,
        seasonalStart: true,
        seasonalEnd: true,
        harvestDate: true,
        storageInstructions: true,
        primaryPhotoUrl: true,
        photoUrls: true,
        images: true,
        hasVariants: true,
        variants: true,
        tags: true,
        pricing: true,
        inventory: true,
        attributes: true,
        scheduledPublishAt: true,
        scheduledUnpublishAt: true,
        publishedAt: true,
        viewsCount: true,
        cartAddsCount: true,
        purchaseCount: true,
        wishlistCount: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true,
        updatedAt: true,
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: [
        { averageRating: "desc" },
        { viewsCount: "desc" },
      ],
      take: limit,
    });

    return products as TrendingProduct[];
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

// ============================================================================
// Get Current Season
// ============================================================================

export function getCurrentSeason(): "SPRING" | "SUMMER" | "FALL" | "WINTER" {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}

// ============================================================================
// Cache Helper (for future Redis integration)
// ============================================================================

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  // For now, just call the fetcher
  // In the future, integrate Redis caching here
  return await fetcher();
}
