/**
 * 🚜 FARM SERVICE - DIVINE BUSINESS LOGIC LAYER
 *
 * Business logic layer for farm entity operations using repository pattern.
 * Separates business concerns from database operations and API routes.
 *
 * Divine Patterns Applied:
 * - Service layer separation (from divine core principles)
 * - Repository pattern usage (no direct database access)
 * - Type-safe operations with agricultural consciousness
 * - Enlightening error messages
 * - Quantum entity manifestation
 * - Comprehensive error handling
 * - Canonical database usage
 *
 * Architecture:
 * Controller → Service → Repository → Database
 *
 * Functional Requirements: FR-011 (Farm Profile Creation)
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 */

import { Prisma, FarmStatus } from "@prisma/client";
import { database } from "@/lib/database";
import {
  farmRepository,
  type QuantumFarm,
} from "@/lib/repositories/farm.repository";
import { AgriculturalCache } from "@/lib/cache/agricultural-cache";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
} from "@/lib/errors";
import type { RepositoryOptions } from "@/lib/repositories/base.repository";
import {
  traceServiceOperation,
  addSpanEvent,
  setSpanAttributes,
} from "@/lib/tracing/service-tracer";

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Custom error class for farm service operations
 */
export class FarmServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "FarmServiceError";
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Farm creation request data
 */
export interface CreateFarmRequest {
  // Identity
  name: string;

  // Business
  description?: string;
  story?: string;
  businessName?: string;
  yearEstablished?: number;
  farmSize?: number;

  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;

  // Contact
  email?: string;
  phone?: string;
  website?: string;

  // Practices
  farmingPractices?: string[];
  productCategories?: string[];

  // Delivery
  deliveryRadius?: number;
}

/**
 * Farm update request data
 */
export type UpdateFarmRequest = Partial<CreateFarmRequest>;

/**
 * Farm service result with metadata
 */
export interface FarmServiceResult {
  farm: QuantumFarm;
  slug: string;
}

/**
 * Existing farm check result
 */
export interface ExistingFarmCheck {
  exists: boolean;
  farm?: {
    id: string;
    slug: string;
    name: string;
  };
}

/**
 * Farm listing options
 */
export interface ListFarmsOptions {
  page?: number;
  limit?: number;
  status?: string;
  city?: string;
  state?: string;
  farmingPractices?: string[];
  sortBy?: "name" | "createdAt" | "rating";
  sortOrder?: "asc" | "desc";
}

/**
 * Farm listing result with pagination
 */
export interface ListFarmsResult {
  farms: QuantumFarm[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Farm search options
 */
export interface SearchFarmsOptions {
  query: string;
  limit?: number;
}

// ============================================================================
// FARM SERVICE CLASS
// ============================================================================

/**
 * Farm Service with agricultural consciousness
 * Handles all farm-related business logic
 *
 * @example
 * ```typescript
 * const service = new FarmService();
 * const result = await service.createFarm(userId, farmData);
 * ```
 */
export class FarmService {
  private cache = AgriculturalCache;

  constructor(private repository = farmRepository) {}

  // ==========================================================================
  // FARM CREATION
  // ==========================================================================

  /**
   * Create a new farm with agricultural consciousness
   *
   * Validates farm data, generates unique slug, and manifests the farm into the
   * database with biodynamic awareness. Sets initial status to PENDING for admin
   * verification and Stripe onboarding.
   *
   * Divine Patterns Applied:
   * - Slug collision detection with retry logic
   * - Agricultural consciousness in naming
   * - Type-safe operations
   * - Enlightening error messages
   *
   * Functional Requirement: FR-011 (Farm Profile Creation)
   *
   * @param userId - User ID of the farm owner (must have FARMER role)
   * @param farmData - Farm creation data including name, location, and practices
   * @param options - Repository transaction options for coordinated operations
   * @returns Created farm with complete profile and generated slug
   * @throws {ValidationError} If farm data fails validation (name too short, invalid email, etc.)
   * @throws {ConflictError} If user already has a farm or slug generation fails
   *
   * @example
   * ```typescript
   * const result = await farmService.createFarm(session.user.id, {
   *   name: "Divine Acres Biodynamic Farm",
   *   city: "Seattle",
   *   state: "WA",
   *   address: "123 Farm Road",
   *   zipCode: "98101",
   *   latitude: 47.6062,
   *   longitude: -122.3321,
   *   description: "Organic farm practicing biodynamic methods",
   *   farmingPractices: ["ORGANIC", "BIODYNAMIC"],
   *   productCategories: ["VEGETABLES", "FRUITS"],
   *   deliveryRadius: 50
   * });
   *
   * console.log(result.slug); // "divine-acres-biodynamic-farm-seattle"
   * console.log(result.farm.status); // "PENDING"
   * ```
   */
  async createFarm(
    userId: string,
    farmData: CreateFarmRequest,
    options?: RepositoryOptions,
  ): Promise<FarmServiceResult> {
    return await traceServiceOperation(
      "FarmService",
      "createFarm",
      {
        "farm.name": farmData.name,
        "farm.city": farmData.city,
        "farm.state": farmData.state,
        "user.id": userId,
        "entity.type": "farm",
      },
      async (_span) => {
        // Validate inputs
        this.validateCreateFarmRequest(userId, farmData);
        addSpanEvent("validation_completed");

        // Check if user already has a farm
        const existingCheck = await this.checkExistingFarm(userId);
        if (existingCheck.exists) {
          throw new ConflictError("User already has a farm", {
            existingFarmId: existingCheck.farm?.id,
          });
        }
        addSpanEvent("existing_check_completed", { exists: false });

        // Generate unique slug with collision detection
        const slug = await this.generateUniqueSlug(
          farmData.name,
          farmData.city,
        );
        setSpanAttributes({ "farm.slug": slug });
        addSpanEvent("slug_generated", { slug });

        // Prepare farm data for creation
        const createData: Prisma.FarmCreateInput = {
          // Identity
          name: farmData.name,
          slug,
          owner: { connect: { id: userId } },

          // Business
          ...(farmData.description && { description: farmData.description }),
          ...(farmData.story && { story: farmData.story }),
          ...(farmData.businessName && { businessName: farmData.businessName }),
          ...(farmData.yearEstablished && {
            yearEstablished: farmData.yearEstablished,
          }),
          ...(farmData.farmSize && { farmSize: farmData.farmSize }),

          // Location (required fields per schema)
          address: farmData.address,
          city: farmData.city,
          state: farmData.state,
          zipCode: farmData.zipCode,
          country: "US",
          latitude: farmData.latitude,
          longitude: farmData.longitude,

          // Contact
          email: farmData.email || "",
          phone: farmData.phone || "",
          ...(farmData.website !== undefined && {
            website: farmData.website || null,
          }),

          // Practices (using Prisma Json field)
          ...(farmData.farmingPractices && {
            farmingPractices: farmData.farmingPractices,
          }),
          ...(farmData.productCategories && {
            productCategories: farmData.productCategories,
          }),

          // Delivery
          ...(farmData.deliveryRadius !== undefined && {
            deliveryRadius: farmData.deliveryRadius,
          }),

          // Status - PENDING until verified and Stripe onboarded
          status: "PENDING",
          verificationStatus: "PENDING",
          stripeOnboarded: false,
          payoutsEnabled: false,
        };

        // Create farm through repository
        const farm = await this.repository.manifestFarm(createData, options);
        setSpanAttributes({ "farm.id": farm.id });
        addSpanEvent("farm_created", { farmId: farm.id });

        // Invalidate cache
        await this.cache.invalidateFarm(farm.id);
        addSpanEvent("cache_invalidated");

        return {
          farm,
          slug,
        };
      },
    );
  }

  /**
   * Validate farm creation request
   *
   * @param userId - User ID
   * @param farmData - Farm data to validate
   * @throws ValidationError if validation fails
   */
  private validateCreateFarmRequest(
    userId: string,
    farmData: CreateFarmRequest,
  ): void {
    if (!userId || typeof userId !== "string") {
      throw new ValidationError("Valid user ID is required");
    }

    if (!farmData.name || farmData.name.trim().length < 3) {
      throw new ValidationError("Farm name must be at least 3 characters");
    }

    if (!farmData.city || !farmData.state) {
      throw new ValidationError("City and state are required");
    }

    if (!farmData.address || farmData.address.trim().length === 0) {
      throw new ValidationError("Address is required");
    }

    if (!farmData.zipCode || farmData.zipCode.trim().length === 0) {
      throw new ValidationError("Zip code is required");
    }

    if (
      farmData.latitude === undefined ||
      farmData.latitude === null ||
      farmData.latitude < -90 ||
      farmData.latitude > 90
    ) {
      throw new ValidationError(
        "Valid latitude is required (between -90 and 90)",
      );
    }

    if (
      farmData.longitude === undefined ||
      farmData.longitude === null ||
      farmData.longitude < -180 ||
      farmData.longitude > 180
    ) {
      throw new ValidationError(
        "Valid longitude is required (between -180 and 180)",
      );
    }

    if (farmData.email && !this.validateEmail(farmData.email)) {
      throw new ValidationError("Invalid email format");
    }

    if (farmData.deliveryRadius && farmData.deliveryRadius < 0) {
      throw new ValidationError("Delivery radius must be positive");
    }
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ==========================================================================
  // UNIQUE SLUG GENERATION
  // ==========================================================================

  private readonly MAX_SLUG_ATTEMPTS = 10;

  /**
   * Generate unique farm slug with collision detection
   *
   * Tries base slug first, then appends counter if collision detected.
   *
   * @param name - Farm name
   * @param city - Farm city
   * @returns Unique slug
   * @throws ConflictError if max attempts exceeded
   */
  private async generateUniqueSlug(
    name: string,
    city: string,
  ): Promise<string> {
    let slug = this.generateSlug(name, city);
    let attempt = 0;

    while (attempt < this.MAX_SLUG_ATTEMPTS) {
      const isAvailable = await this.repository.isSlugAvailable(slug);

      if (isAvailable) {
        return slug;
      }

      // Collision detected - try with counter
      attempt++;
      slug = `${this.generateSlug(name, city)}-${attempt}`;
    }

    throw new ConflictError(
      `Failed to generate unique slug after ${this.MAX_SLUG_ATTEMPTS} attempts`,
      { name, city },
    );
  }

  /**
   * Generate slug from name and city
   */
  private generateSlug(name: string, city: string): string {
    const slugPart = (str: string) =>
      str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return `${slugPart(name)}-${slugPart(city)}`;
  }

  // ==========================================================================
  // FARM RETRIEVAL
  // ==========================================================================

  /**
   * Get farm by ID with caching
   *
   * @param farmId - Farm ID
   * @returns Quantum farm or null if not found
   *
   * @example
   * ```typescript
   * const farm = await service.getFarmById("farm-id");
   * ```
   */
  async getFarmById(farmId: string): Promise<QuantumFarm | null> {
    // Try cache first
    const cached = await AgriculturalCache.getFarm(farmId);
    if (cached) {
      return cached;
    }

    // Fetch from repository
    const farm = await this.repository.findById(farmId);

    if (!farm) {
      return null;
    }

    // Cache the result
    await AgriculturalCache.cacheFarm(farmId, farm);

    return farm;
  }

  /**
   * Get farm by slug with caching
   *
   * @param slug - Farm slug
   * @returns Quantum farm or null if not found
   *
   * @example
   * ```typescript
   * const farm = await service.getFarmBySlug("divine-acres-seattle");
   * ```
   */
  async getFarmBySlug(slug: string): Promise<QuantumFarm | null> {
    // Try cache first (using slug as key)
    const cacheKey = `farm:slug:${slug}`;
    const cached = await AgriculturalCache.getFarm(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from repository
    const farm = await this.repository.findBySlug(slug);

    if (!farm) {
      return null;
    }

    // Cache by both ID and slug
    await Promise.all([
      AgriculturalCache.cacheFarm(farm.id, farm),
      AgriculturalCache.cacheFarm(cacheKey, farm),
    ]);

    return farm;
  }

  /**
   * Check if user already has a farm
   *
   * @param userId - User ID to check
   * @returns Existing farm info if found
   */
  async checkExistingFarm(userId: string): Promise<ExistingFarmCheck> {
    const farms = await this.repository.findByOwnerId(userId);

    if (farms.length === 0) {
      return { exists: false };
    }

    const farm = farms[0];
    if (!farm) {
      return { exists: false };
    }

    return {
      exists: true,
      farm: {
        id: farm.id,
        slug: farm.slug,
        name: farm.name,
      },
    };
  }

  /**
   * Get farms by owner ID
   *
   * @param userId - User ID
   * @returns Array of farms owned by user
   */
  async getFarmsByOwnerId(userId: string): Promise<QuantumFarm[]> {
    return await this.repository.findByOwnerId(userId);
  }

  /**
   * Get all active farms that have products available
   *
   * Returns only farms with status="ACTIVE" that have at least one active
   * product. Used for marketplace listings and featured farms.
   *
   * @returns Array of active farms with their products
   *
   * @example
   * ```typescript
   * const activeFarms = await farmService.getActiveFarmsWithProducts();
   * // Display on marketplace homepage
   * ```
   */
  async getActiveFarmsWithProducts(): Promise<QuantumFarm[]> {
    return await this.repository.findActiveWithProducts();
  }

  // ==========================================================================
  // FARM UPDATE
  // ==========================================================================

  /**
   * Update farm with ownership validation
   *
   * @param farmId - Farm ID
   * @param userId - User ID (must be owner)
   * @param updateData - Farm update data
   * @param options - Repository options
   * @returns Updated quantum farm
   * @throws NotFoundError if farm not found
   * @throws AuthorizationError if user doesn't own the farm
   *
   * @example
   * ```typescript
   * const farm = await service.updateFarm("farm-id", session.user.id, {
   *   description: "Updated description"
   * });
   * ```
   */
  async updateFarm(
    farmId: string,
    userId: string,
    updateData: UpdateFarmRequest,
    options?: RepositoryOptions,
  ): Promise<QuantumFarm> {
    // Verify farm exists
    const existingFarm = await this.repository.findById(farmId);

    if (!existingFarm) {
      throw new NotFoundError("Farm", farmId);
    }

    // Verify ownership
    if (existingFarm.ownerId !== userId) {
      throw new AuthorizationError(
        "Unauthorized: You don't own this farm",
        "FARMER",
      );
    }

    // Prepare update data
    const prismaUpdateData: Prisma.FarmUpdateInput = {
      // Only update provided fields
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.description && { description: updateData.description }),
      ...(updateData.story && { story: updateData.story }),
      ...(updateData.businessName && { businessName: updateData.businessName }),
      ...(updateData.yearEstablished && {
        yearEstablished: updateData.yearEstablished,
      }),
      ...(updateData.farmSize && { farmSize: updateData.farmSize }),
      ...(updateData.address && { address: updateData.address }),
      ...(updateData.city && { city: updateData.city }),
      ...(updateData.state && { state: updateData.state }),
      ...(updateData.zipCode && { zipCode: updateData.zipCode }),
      ...(updateData.latitude !== undefined && {
        latitude: updateData.latitude,
      }),
      ...(updateData.longitude !== undefined && {
        longitude: updateData.longitude,
      }),
      ...(updateData.email && { email: updateData.email }),
      ...(updateData.phone && { phone: updateData.phone }),
      ...(updateData.website !== undefined && { website: updateData.website }),
      ...(updateData.farmingPractices && {
        farmingPractices: updateData.farmingPractices,
      }),
      ...(updateData.productCategories && {
        productCategories: updateData.productCategories,
      }),
      ...(updateData.deliveryRadius !== undefined && {
        deliveryRadius: updateData.deliveryRadius,
      }),
    };

    // Update through repository
    const updatedFarm = await this.repository.update(
      farmId,
      prismaUpdateData,
      options,
    );

    // Invalidate cache
    await AgriculturalCache.invalidateFarm(farmId);

    return updatedFarm;
  }

  /**
   * Update farm status
   *
   * @param farmId - Farm ID
   * @param status - New status
   * @param options - Repository options
   * @returns Updated farm
   */
  async updateFarmStatus(
    farmId: string,
    status: string,
    options?: RepositoryOptions,
  ): Promise<QuantumFarm> {
    const farm = await this.repository.updateStatus(farmId, status, options);

    // Invalidate cache
    await AgriculturalCache.invalidateFarm(farmId);

    return farm;
  }

  // ==========================================================================
  // FARM DELETION
  // ==========================================================================

  /**
   * Delete farm with ownership validation
   *
   * Soft delete by setting status to INACTIVE
   *
   * @param farmId - Farm ID
   * @param userId - User ID (must be owner)
   * @throws NotFoundError if farm not found
   * @throws AuthorizationError if user doesn't own the farm
   */
  async deleteFarm(farmId: string, userId: string): Promise<void> {
    // Verify farm exists
    const existingFarm = await this.repository.findById(farmId);

    if (!existingFarm) {
      throw new NotFoundError("Farm", farmId);
    }

    // Verify ownership
    if (existingFarm.ownerId !== userId) {
      throw new AuthorizationError(
        "Unauthorized: You don't own this farm",
        "FARMER",
      );
    }

    // Soft delete (set status to INACTIVE)
    await this.repository.update(farmId, {
      status: "INACTIVE",
    });

    // Invalidate cache
    await AgriculturalCache.invalidateFarm(farmId);
  }

  // ==========================================================================
  // FARM LISTING & SEARCH
  // ==========================================================================

  /**
   * List farms with pagination and filtering
   *
   * @param options - Pagination and filter options
   * @returns Paginated list of quantum farms
   *
   * @example
   * ```typescript
   * const result = await service.listFarms({
   *   page: 1,
   *   limit: 20,
   *   city: "Seattle",
   *   status: "ACTIVE"
   * });
   * ```
   */
  async listFarms(options: ListFarmsOptions = {}): Promise<ListFarmsResult> {
    const {
      page = 1,
      limit = 20,
      status,
      city,
      state,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.FarmWhereInput = {
      status: { not: "INACTIVE" }, // Only non-deleted farms
    };

    if (status) {
      where.status = status as FarmStatus; // Override with specific status if provided
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (state) {
      where.state = state;
    }

    // Get farms through repository
    const farms = await this.repository.findMany(where, {
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    // Get total count
    const total = await this.repository.count(where);

    return {
      farms,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search farms by name, description, or location
   *
   * @param options - Search query and limit
   * @returns Matching quantum farms
   *
   * @example
   * ```typescript
   * const farms = await service.searchFarms({
   *   query: "organic",
   *   limit: 10
   * });
   * ```
   */
  async searchFarms(options: SearchFarmsOptions): Promise<QuantumFarm[]> {
    const { query, limit = 10 } = options;

    return await this.repository.searchFarms(query, {
      take: limit,
    });
  }

  /**
   * Get all farms in a specific city.
   *
   * @param city - City name
   * @returns Array of farms in the city
   *
   * @example
   * ```typescript
   * const seattleFarms = await farmService.getFarmsByCity("Seattle");
   * ```
   */
  async getFarmsByCity(city: string): Promise<QuantumFarm[]> {
    return await this.repository.findByCity(city);
  }

  /**
   * Get all farms in a specific state.
   *
   * @param state - State code (e.g., "WA", "CA")
   * @returns Array of farms in the state
   *
   * @example
   * ```typescript
   * const waFarms = await farmService.getFarmsByState("WA");
   * ```
   */
  async getFarmsByState(state: string): Promise<QuantumFarm[]> {
    return await this.repository.findByState(state);
  }

  /**
   * Find farms near specific coordinates
   *
   * @param latitude - Latitude
   * @param longitude - Longitude
   * @param radiusKm - Search radius in kilometers
   * @returns Array of farms within radius, sorted by distance
   *
   * @example
   * ```typescript
   * const nearbyFarms = await service.findNearbyFarms(47.6062, -122.3321, 50);
   * ```
   */
  async findNearbyFarms(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
  ): Promise<QuantumFarm[]> {
    return await this.repository.findNearLocation(
      latitude,
      longitude,
      radiusKm,
    );
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Export singleton instance for application-wide use
 * Following divine pattern of single point of business logic access
 */
export const farmService = new FarmService();

/**
 * Divine farm service consciousness achieved ✨🚜
 * Repository pattern integrated at service layer
 * Ready to scale from 1 to 1 billion farms with biodynamic energy
 */
