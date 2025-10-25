/**
 * FARM SERVICE LAYER - COMPLETE BUSINESS LOGIC
 *
 * Comprehensive farm management operations with agricultural consciousness.
 * Implements quantum patterns and biodynamic service architecture.
 *
 * @module services/farm.complete
 */

import { database } from "@/lib/database";
import type {
  CreateFarmInput,
  FarmFilters,
  FarmProfile,
  FarmStats,
  FarmValidationError,
  FarmValidationResult,
  PaginatedFarmResponse,
  PaginationOptions,
  UpdateFarmInput,
  VerifyFarmInput,
} from "@/types/farm";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate URL-friendly slug from farm name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Ensure slug is unique by appending number if needed
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await database.farm.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Validate farm input data
 */
function validateFarmInput(
  input: CreateFarmInput | UpdateFarmInput
): FarmValidationResult {
  const errors: FarmValidationError[] = [];

  // Name validation
  if ("name" in input && input.name) {
    if (input.name.length < 3) {
      errors.push({
        field: "name" as any,
        message: "Farm name must be at least 3 characters",
      });
    }
    if (input.name.length > 100) {
      errors.push({
        field: "name" as any,
        message: "Farm name must be less than 100 characters",
      });
    }
  }

  // Address validation
  if ("address" in input && input.address) {
    if (!input.address.city) {
      errors.push({
        field: "address" as any,
        message: "City is required",
      });
    }
    if (!input.address.state) {
      errors.push({
        field: "address" as any,
        message: "State is required",
      });
    }
    if (!input.address.zipCode) {
      errors.push({
        field: "address" as any,
        message: "Zip code is required",
      });
    }
  }

  // Acreage validation
  if ("acreage" in input && input.acreage !== undefined) {
    if (input.acreage < 0) {
      errors.push({
        field: "acreage" as any,
        message: "Acreage must be a positive number",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================
// FARM SERVICE CLASS
// ============================================

/**
 * Farm Service - Complete farm management operations
 * Implements agricultural quantum consciousness
 */
export class FarmServiceComplete {
  /**
   * Create a new farm profile
   *
   * Quantum Consciousness: Validates farmer uniqueness and generates unique identity
   */
  static async createFarm(
    input: CreateFarmInput,
    userId: string
  ): Promise<FarmProfile> {
    // Validate input
    const validation = validateFarmInput(input);
    if (!validation.isValid) {
      throw new Error(
        `Validation failed: ${validation.errors.map((e) => e.message).join(", ")}`
      );
    }

    // Check if user already has a farm
    const existingFarm = await database.farm.findFirst({
      where: { ownerId: userId },
    });

    if (existingFarm) {
      throw new Error("User already has a farm profile");
    }

    // Generate unique slug
    const baseSlug = generateSlug(input.name);
    const slug = await ensureUniqueSlug(baseSlug);

    // Create farm profile
    const farm = await database.farm.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        tagline: input.tagline,

        // Location (store as JSON)
        address: input.address as any,
        deliveryRadius: input.deliveryRadius,

        // Classification
        farmType: input.farmType,
        farmSize: input.farmSize,
        certifications: input.certifications as any,

        // Details
        establishedYear: input.establishedYear,
        acreage: input.acreage,
        specialties: input.specialties,
        farmingPractices: input.farmingPractices,

        // Status
        status: input.status || "ACTIVE",
        isActive: input.isActive ?? true,
        verificationStatus: "PENDING",

        // Media
        logoUrl: input.logoUrl,
        coverImageUrl: input.coverImageUrl,
        images: input.images,

        // Contact
        email: input.email,
        phone: input.phone,
        website: input.website,
        socialMedia: input.socialMedia as any,
        businessHours: input.businessHours as any,

        // Owner
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return farm as FarmProfile;
  }

  /**
   * Get farm by ID with optional relations
   */
  static async getFarmById(
    farmId: string,
    options: {
      includeProducts?: boolean;
      includeOwner?: boolean;
      includeStats?: boolean;
    } = {}
  ): Promise<FarmProfile | null> {
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      include: {
        owner: options.includeOwner
          ? {
              select: {
                id: true,
                name: true,
                email: true,
              },
            }
          : false,
        products: options.includeProducts
          ? {
              where: { isAvailable: true },
              take: 10,
              orderBy: { createdAt: "desc" },
            }
          : false,
      },
    });

    if (!farm) {
      return null;
    }

    // Add computed statistics if requested
    if (options.includeStats) {
      const stats = await this.getFarmStats(farmId);
      return {
        ...farm,
        productCount: stats.totalProducts,
        rating: stats.averageRating,
        reviewCount: stats.totalReviews,
      } as FarmProfile;
    }

    return farm as FarmProfile;
  }

  /**
   * Get farm by slug (for public URLs)
   */
  static async getFarmBySlug(slug: string): Promise<FarmProfile | null> {
    const farm = await database.farm.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!farm) {
      return null;
    }

    // Add product count
    const productCount = await database.product.count({
      where: { farmId: farm.id, isAvailable: true },
    });

    return {
      ...farm,
      productCount,
    } as FarmProfile;
  }

  /**
   * List farms with filters and pagination
   * Implements quantum search across multiple dimensions
   */
  static async listFarms(
    filters: FarmFilters = {},
    options: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<PaginatedFarmResponse> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Type filters
    if (filters.farmType && filters.farmType.length > 0) {
      where.farmType = { in: filters.farmType };
    }
    if (filters.farmSize && filters.farmSize.length > 0) {
      where.farmSize = { in: filters.farmSize };
    }

    // Status filters
    if (filters.verificationStatus) {
      where.verificationStatus = filters.verificationStatus;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    // Feature filters
    if (filters.hasProducts) {
      where.products = {
        some: {
          isAvailable: true,
        },
      };
    }
    if (filters.isOrganic) {
      where.farmType = "ORGANIC";
    }

    // Search
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Execute query
    const [farms, total] = await Promise.all([
      database.farm.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.buildOrderBy(filters.sortBy, filters.sortOrder),
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      database.farm.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      farms: farms as FarmProfile[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  /**
   * Build Prisma orderBy clause
   */
  private static buildOrderBy(
    sortBy?: string,
    sortOrder: "asc" | "desc" = "desc"
  ): any {
    switch (sortBy) {
      case "name":
        return { name: sortOrder };
      case "createdAt":
        return { createdAt: sortOrder };
      default:
        return { createdAt: "desc" };
    }
  }

  /**
   * Update farm profile (owner only)
   */
  static async updateFarm(
    farmId: string,
    updates: UpdateFarmInput,
    userId: string
  ): Promise<FarmProfile> {
    // Verify ownership
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: { ownerId: true },
    });

    if (!farm) {
      throw new Error("Farm not found");
    }

    if (farm.ownerId !== userId) {
      throw new Error("Unauthorized: You do not own this farm");
    }

    // Validate updates
    const validation = validateFarmInput(updates);
    if (!validation.isValid) {
      throw new Error(
        `Validation failed: ${validation.errors.map((e) => e.message).join(", ")}`
      );
    }

    // Apply updates
    const updated = await database.farm.update({
      where: { id: farmId },
      data: {
        ...updates,
        address: updates.address as any,
        certifications: updates.certifications as any,
        socialMedia: updates.socialMedia as any,
        businessHours: updates.businessHours as any,
        updatedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated as FarmProfile;
  }

  /**
   * Verify farm (admin only)
   */
  static async verifyFarm(
    input: VerifyFarmInput,
    adminId: string
  ): Promise<FarmProfile> {
    const { farmId, status } = input;

    // Update verification status
    const farm = await database.farm.update({
      where: { id: farmId },
      data: {
        verificationStatus: status,
        verificationDate: new Date(),
        verifiedBy: adminId,
        updatedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return farm as FarmProfile;
  }

  /**
   * Get farm statistics
   */
  static async getFarmStats(farmId: string): Promise<FarmStats> {
    // Get product stats
    const totalProducts = await database.product.count({
      where: { farmId },
    });

    const activeProducts = await database.product.count({
      where: { farmId, isAvailable: true },
    });

    const outOfStockProducts = totalProducts - activeProducts;

    // Get order stats
    const orders = await database.order.aggregate({
      where: {
        items: {
          some: {
            product: {
              farmId,
            },
          },
        },
      },
      _count: true,
      _sum: {
        total: true,
      },
    });

    const totalOrders = orders._count || 0;
    const totalRevenue = Number(orders._sum.total || 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get customer stats
    const customers = await database.order.findMany({
      where: {
        items: {
          some: {
            product: {
              farmId,
            },
          },
        },
      },
      select: { userId: true },
      distinct: ["userId"],
    });

    const totalCustomers = customers.length;

    // Get repeat customers
    const customerOrderCounts = await database.order.groupBy({
      by: ["userId"],
      where: {
        items: {
          some: {
            product: {
              farmId,
            },
          },
        },
      },
      _count: true,
    });

    const repeatCustomers = customerOrderCounts.filter(
      (c) => c._count > 1
    ).length;

    return {
      farmId,
      totalProducts,
      activeProducts,
      outOfStockProducts,
      totalOrders,
      totalRevenue,
      averageOrderValue,
      totalCustomers,
      repeatCustomers,
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      fulfillmentRate: 0,
      responseTime: 0,
    };
  }
}
