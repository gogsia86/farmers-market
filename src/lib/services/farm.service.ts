/**
 * 🚜 BIODYNAMIC FARM SERVICE
 * Divine farm management service with agricultural consciousness
 *
 * Features:
 * - Complete CRUD operations for farms
 * - Farm verification and approval workflow
 * - Team member management
 * - Certification tracking
 * - Performance metrics and analytics
 * - Seasonal awareness and biodynamic patterns
 *
 * Architecture:
 * - Service Layer (Business Logic)
 * - Uses canonical database import
 * - Full type safety with Prisma types
 * - Comprehensive error handling
 * - Agricultural domain intelligence
 */

import { database } from "@/lib/database";
import type {
  Farm,
  FarmStatus,
  FarmTeamMember,
  Prisma,
  User,
  UserRole,
} from "@prisma/client";

/**
 * 🌾 CREATE FARM REQUEST TYPE
 */
export interface CreateFarmRequest {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  latitude: number;
  longitude: number;
  location?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  ownerId: string;
  phone: string;
  email: string;
  website?: string;
  certifications?: string[];
}

/**
 * 🌾 UPDATE FARM REQUEST TYPE
 */
export interface UpdateFarmRequest {
  name?: string;
  description?: string;
  location?: Prisma.InputJsonValue;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  bannerUrl?: string;
  status?: FarmStatus;
  verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
  certificationsArray?: string[];
}

/**
 * 🌾 FARM WITH RELATIONS TYPE
 */
export type FarmWithRelations = Farm & {
  owner: User;
  products?: any[];
  teamMembers?: FarmTeamMember[];
};

/**
 * 🌾 VALIDATION ERROR
 */
export class FarmValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: any
  ) {
    super(message);
    this.name = "FarmValidationError";
  }
}

/**
 * 🌾 BIODYNAMIC FARM SERVICE CLASS
 */
export class BiodynamicFarmService {
  /**
   * 🌱 CREATE NEW FARM
   * Manifests a new farm into the quantum database with complete agricultural consciousness
   */
  async createFarm(farmData: CreateFarmRequest): Promise<Farm> {
    // Validate farm data
    await this.validateFarmData(farmData);

    // Generate unique slug from farm name
    const slug = await this.generateUniqueSlug(farmData.name);

    // Create farm in database
    const farm = await database.farm.create({
      data: {
        name: farmData.name,
        slug,
        description: farmData.description,
        address: farmData.address,
        city: farmData.city,
        state: farmData.state,
        zipCode: farmData.zipCode,
        country: farmData.country || "US",
        latitude: farmData.latitude,
        longitude: farmData.longitude,
        location: farmData.location as Prisma.InputJsonValue,
        ownerId: farmData.ownerId,
        phone: farmData.phone,
        email: farmData.email,
        website: farmData.website ?? null,
        status: "PENDING" as FarmStatus,
        certificationsArray: farmData.certifications || [],
        // Initialize metrics
        totalRevenueUSD: 0,
        totalOrdersCount: 0,
        averageRating: 0,
        reviewCount: 0,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return farm;
  }

  /**
   * 🔍 GET FARM BY ID
   * Retrieves a single farm with complete quantum coherence
   */
  async getFarmById(
    farmId: string,
    includeRelations: boolean = false
  ): Promise<FarmWithRelations | null> {
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      include: {
        owner: true,
        products: includeRelations,
        teamMembers: includeRelations
          ? {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          }
          : false,
      },
    });

    return farm;
  }

  /**
   * 🔍 GET FARM BY SLUG
   * Retrieves farm by URL-friendly slug
   */
  async getFarmBySlug(slug: string): Promise<FarmWithRelations | null> {
    const farm = await database.farm.findUnique({
      where: { slug },
      include: {
        owner: true,
        products: true,
      },
    });

    return farm;
  }

  /**
   * 📋 GET ALL FARMS
   * Retrieves farms with pagination and filtering
   */
  async getAllFarms(options?: {
    page?: number;
    limit?: number;
    status?: FarmStatus;
    ownerId?: string;
    searchQuery?: string;
  }): Promise<{ farms: Farm[]; total: number; hasMore: boolean }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.FarmWhereInput = {};

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.ownerId) {
      where.ownerId = options.ownerId;
    }

    if (options?.searchQuery) {
      where.OR = [
        { name: { contains: options.searchQuery, mode: "insensitive" } },
        { description: { contains: options.searchQuery, mode: "insensitive" } },
      ];
    }

    // Execute parallel queries for farms and count
    const [farms, total] = await Promise.all([
      database.farm.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      database.farm.count({ where }),
    ]);

    return {
      farms,
      total,
      hasMore: skip + farms.length < total,
    };
  }

  /**
   * ✏️ UPDATE FARM
   * Updates farm with quantum precision
   */
  async updateFarm(
    farmId: string,
    updates: UpdateFarmRequest,
    userId: string
  ): Promise<Farm> {
    // Verify farm exists and user has permission
    await this.verifyFarmOwnership(farmId, userId);

    // Update slug if name changed
    let slug: string | undefined;
    if (updates.name) {
      slug = await this.generateUniqueSlug(updates.name, farmId);
    }

    // Build update data with proper types
    const updateData: Prisma.FarmUpdateInput = {
      ...updates,
      updatedAt: new Date(),
    };

    if (slug) {
      updateData.slug = slug;
    }

    const farm = await database.farm.update({
      where: { id: farmId },
      data: updateData,
      include: {
        owner: true,
      },
    });

    return farm;
  }

  /**
   * 🗑️ DELETE FARM
   * Soft delete farm (sets status to DELETED)
   */
  async deleteFarm(farmId: string, userId: string): Promise<void> {
    // Verify farm exists and user has permission
    await this.verifyFarmOwnership(farmId, userId);

    await database.farm.update({
      where: { id: farmId },
      data: {
        status: "INACTIVE" as FarmStatus,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * ✅ APPROVE FARM
   * Admin function to approve farm verification
   */
  async approveFarm(
    farmId: string,
    adminId: string
  ): Promise<Farm> {
    const farm = await database.farm.update({
      where: { id: farmId },
      data: {
        status: "ACTIVE" as FarmStatus,
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return farm;
  }

  /**
   * ❌ REJECT FARM
   * Admin function to reject farm verification
   */
  async rejectFarm(
    farmId: string,
    adminId: string,
    reason: string
  ): Promise<Farm> {
    const farm = await database.farm.update({
      where: { id: farmId },
      data: {
        status: "INACTIVE" as FarmStatus,
        verificationStatus: "REJECTED",
        updatedAt: new Date(),
      },
    });

    return farm;
  }

  /**
   * 👥 ADD TEAM MEMBER
   * Adds a team member to the farm
   */
  async addTeamMember(
    farmId: string,
    userId: string,
    email: string,
    role: "MANAGER" | "STAFF" = "STAFF",
    invitedBy: string
  ): Promise<FarmTeamMember> {
    const teamMember = await database.farmTeamMember.create({
      data: {
        farmId,
        userId,
        email,
        role,
        invitedBy,
        status: "INVITED",
      },
    });

    return teamMember;
  }

  /**
   * 👥 REMOVE TEAM MEMBER
   * Removes a team member from the farm
   */
  async removeTeamMember(
    farmId: string,
    teamMemberId: string,
    ownerId: string
  ): Promise<void> {
    // Verify ownership
    await this.verifyFarmOwnership(farmId, ownerId);

    await database.farmTeamMember.delete({
      where: { id: teamMemberId },
    });
  }

  /**
   * 📊 GET FARM METRICS
   * Retrieves farm performance metrics
   */
  async getFarmMetrics(farmId: string): Promise<{
    totalRevenue: number;
    totalOrders: number;
    averageRating: number;
    totalReviews: number;
    totalProducts: number;
    activeProducts: number;
  }> {
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      include: {
        products: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!farm) {
      throw new Error("Farm not found");
    }

    const activeProducts = farm.products?.filter(
      (p) => p.status === "ACTIVE"
    ).length || 0;

    return {
      totalRevenue: farm.totalRevenueUSD?.toNumber() || 0,
      totalOrders: farm.totalOrdersCount || 0,
      averageRating: farm.averageRating?.toNumber() || 0,
      totalReviews: farm.reviewCount || 0,
      totalProducts: farm.products?.length || 0,
      activeProducts,
    };
  }

  /**
   * 🔐 VERIFY FARM OWNERSHIP
   * Verifies that a user owns or has access to a farm
   */
  async verifyFarmOwnership(
    farmId: string,
    userId: string
  ): Promise<boolean> {
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: {
        ownerId: true,
        teamMembers: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    if (!farm) {
      throw new Error("Farm not found");
    }

    // User is owner or team member
    const hasAccess =
      farm.ownerId === userId || farm.teamMembers.length > 0;

    if (!hasAccess) {
      throw new Error("Unauthorized: You don't have access to this farm");
    }

    return true;
  }

  /**
   * ✅ VALIDATE FARM DATA
   * Validates farm data before creation
   */
  private async validateFarmData(
    farmData: CreateFarmRequest
  ): Promise<void> {
    // Validate name
    if (!farmData.name || farmData.name.trim().length < 3) {
      throw new FarmValidationError(
        "Farm name must be at least 3 characters long",
        "name",
        farmData.name
      );
    }

    if (farmData.name.length > 100) {
      throw new FarmValidationError(
        "Farm name must be less than 100 characters",
        "name",
        farmData.name
      );
    }

    // Validate description
    if (!farmData.description || farmData.description.trim().length < 10) {
      throw new FarmValidationError(
        "Farm description must be at least 10 characters long",
        "description",
        farmData.description
      );
    }

    // Validate address
    if (!farmData.address || farmData.address.trim().length === 0) {
      throw new FarmValidationError(
        "Farm address is required",
        "address",
        farmData.address
      );
    }

    // Validate city
    if (!farmData.city || farmData.city.trim().length === 0) {
      throw new FarmValidationError(
        "Farm city is required",
        "city",
        farmData.city
      );
    }

    // Validate state
    if (!farmData.state || farmData.state.trim().length === 0) {
      throw new FarmValidationError(
        "Farm state is required",
        "state",
        farmData.state
      );
    }

    // Validate coordinates
    if (typeof farmData.latitude !== 'number' || typeof farmData.longitude !== 'number') {
      throw new FarmValidationError(
        "Farm coordinates (latitude and longitude) are required",
        "coordinates",
        { latitude: farmData.latitude, longitude: farmData.longitude }
      );
    }

    // Validate owner exists
    const owner = await database.user.findUnique({
      where: { id: farmData.ownerId },
    });

    if (!owner) {
      throw new FarmValidationError(
        "Farm owner not found",
        "ownerId",
        farmData.ownerId
      );
    }

    // Validate owner role (must be FARMER or ADMIN)
    const allowedRoles: UserRole[] = ["FARMER", "ADMIN", "SUPER_ADMIN"];
    if (!allowedRoles.includes(owner.role)) {
      throw new FarmValidationError(
        "Only farmers and admins can create farms",
        "ownerId",
        owner.role
      );
    }
  }

  /**
   * 🔤 GENERATE UNIQUE SLUG
   * Generates URL-friendly slug from farm name
   */
  private async generateUniqueSlug(
    name: string,
    excludeFarmId?: string
  ): Promise<string> {
    // Convert to lowercase and replace spaces with hyphens
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug exists
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await database.farm.findUnique({
        where: { slug: uniqueSlug },
        select: { id: true },
      });

      // If no existing farm or it's the same farm being updated
      if (!existing || existing.id === excludeFarmId) {
        break;
      }

      // Add counter to make it unique
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }
}

/**
 * 🌾 EXPORT SINGLETON INSTANCE
 * Canonical farm service instance for application-wide use
 */
export const farmService = new BiodynamicFarmService();
