/**
 * 🚜 FARM SERVICE - DIVINE BUSINESS LOGIC LAYER
 *
 * Business logic layer for farm entity operations using repository pattern.
 * Separates business concerns from database operations and API routes.
 *
 * Divine Patterns Applied:
 * - BaseService extension for standardized patterns
 * - ServiceResponse types for consistent API responses
 * - Repository pattern usage (no direct database access)
 * - Type-safe operations with agricultural consciousness
 * - Enlightening error messages
 * - Quantum entity manifestation
 * - Comprehensive error handling
 * - Service-level caching
 * - OpenTelemetry tracing integration
 *
 * Architecture:
 * Controller → Service (extends BaseService) → Repository → Database
 *
 * Functional Requirements: FR-011 (Farm Profile Creation)
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 * @reference .github/instructions/15_KILO_CODE_DIVINE_INTEGRATION.instructions.md
 */

import { Prisma, FarmStatus } from "@prisma/client";
import { BaseService } from "@/lib/services/base.service";
import type {
  ServiceResponse,
  PaginatedResponse,
} from "@/lib/types/service-response";
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  ErrorCodes,
} from "@/lib/types/service-response";
import type { ServiceError } from "@/lib/types/service-response";
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
 * Extends BaseService for standardized patterns
 *
 * Returns ServiceResponse for all public methods
 *
 * @example
 * ```typescript
 * const service = new FarmService();
 * const response = await service.createFarm(userId, farmData);
 *
 * if (response.success) {
 *   console.log(response.data.slug);
 * } else {
 *   console.error(response.error.message);
 * }
 * ```
 */
export class FarmService extends BaseService {
  private cache = AgriculturalCache;
  private readonly MAX_SLUG_ATTEMPTS = 10;

  constructor(private repository = farmRepository) {
    super({
      serviceName: "FarmService",
      cacheTTL: 3600,
      cachePrefix: "farm",
      enableCaching: true,
      enableTracing: true,
      enableAgriculturalConsciousness: true,
    });
  }

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
   * - ServiceResponse for type-safe return
   * - Slug collision detection with retry logic
   * - Agricultural consciousness in naming
   * - Enlightening error messages
   *
   * Functional Requirement: FR-011 (Farm Profile Creation)
   *
   * @param userId - User ID of the farm owner (must have FARMER role)
   * @param farmData - Farm creation data including name, location, and practices
   * @param options - Repository transaction options for coordinated operations
   * @returns ServiceResponse with created farm and generated slug
   *
   * @example
   * ```typescript
   * const response = await farmService.createFarm(session.user.id, {
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
   * if (response.success) {
   *   console.log(response.data.slug); // "divine-acres-biodynamic-farm-seattle"
   *   console.log(response.data.farm.status); // "PENDING"
   * }
   * ```
   */
  async createFarm(
    userId: string,
    farmData: CreateFarmRequest,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<FarmServiceResult>> {
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
        try {
          // Validate inputs
          try {
            this.validateCreateFarmRequest(userId, farmData);
          } catch (validationError) {
            if (validationError instanceof ValidationError) {
              return createErrorResponse({
                code: ErrorCodes.VALIDATION_ERROR,
                message: validationError.message,
                timestamp: new Date(),
              });
            }
            throw validationError;
          }
          addSpanEvent("validation_completed");

          // Check if user already has a farm
          const existingCheck = await this.checkExistingFarm(userId);
          if (existingCheck.exists) {
            return createErrorResponse({
              code: ErrorCodes.RESOURCE_EXISTS,
              message: "User already has a farm",
              timestamp: new Date(),
              details: {
                existingFarmId: existingCheck.farm?.id,
              },
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
            ...(farmData.businessName && {
              businessName: farmData.businessName,
            }),
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

          const result: FarmServiceResult = {
            farm,
            slug,
          };

          return createSuccessResponse(result, {
            message: "Farm created successfully",
            timestamp: new Date(),
            agricultural: {
              season: this.getCurrentSeason(),
              consciousness: "DIVINE",
              entityType: "farm",
            },
          });
        } catch (error) {
          this.logger.error("Farm creation failed", {
            userId,
            farmName: farmData.name,
            errorMessage:
              error instanceof Error ? error.message : String(error),
            errorType:
              error instanceof Error ? error.constructor.name : typeof error,
          });

          if (error instanceof ValidationError) {
            return createErrorResponse({
              code: ErrorCodes.VALIDATION_ERROR,
              message: error.message,
              timestamp: new Date(),
            });
          }

          if (error instanceof ConflictError) {
            return createErrorResponse({
              code: ErrorCodes.RESOURCE_EXISTS,
              message: error.message,
              timestamp: new Date(),
              details: error.details,
            });
          }

          return createErrorResponse({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to create farm",
            timestamp: new Date(),
            details: {
              originalError:
                error instanceof Error ? error.message : "Unknown error",
            },
          });
        }
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
   * @returns ServiceResponse with quantum farm or null if not found
   *
   * @example
   * ```typescript
   * const response = await service.getFarmById("farm-id");
   * if (response.success && response.data) {
   *   console.log(response.data.name);
   * }
   * ```
   */
  async getFarmById(
    farmId: string,
  ): Promise<ServiceResponse<QuantumFarm | null>> {
    try {
      // Try cache first
      const cached = await AgriculturalCache.getFarm(farmId);
      if (cached) {
        return createSuccessResponse(cached, {
          message: "Farm retrieved from cache",
          timestamp: new Date(),
        });
      }

      // Fetch from repository
      const farm = await this.repository.findById(farmId);

      if (!farm) {
        return createSuccessResponse(null, {
          message: "Farm not found",
          timestamp: new Date(),
        });
      }

      // Cache the result
      await AgriculturalCache.cacheFarm(farmId, farm);

      return createSuccessResponse(farm, {
        message: "Farm retrieved successfully",
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error("Failed to get farm by ID", { farmId, error });
      return createErrorResponse({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve farm",
        timestamp: new Date(),
        details: { farmId },
      });
    }
  }

  /**
   * Get farm by slug with caching
   *
   * @param slug - Farm slug
   * @returns ServiceResponse with quantum farm or null if not found
   *
   * @example
   * ```typescript
   * const response = await service.getFarmBySlug("divine-acres-seattle");
   * if (response.success && response.data) {
   *   console.log(response.data.name);
   * }
   * ```
   */
  async getFarmBySlug(
    slug: string,
  ): Promise<ServiceResponse<QuantumFarm | null>> {
    try {
      // Try cache first (using slug as key)
      const cacheKey = `farm:slug:${slug}`;
      const cached = await AgriculturalCache.getFarm(cacheKey);
      if (cached) {
        return createSuccessResponse(cached, {
          message: "Farm retrieved from cache",
          timestamp: new Date(),
        });
      }

      // Fetch from repository
      const farm = await this.repository.findBySlug(slug);

      if (!farm) {
        return createSuccessResponse(null, {
          message: "Farm not found",
          timestamp: new Date(),
        });
      }

      // Cache by both ID and slug
      await Promise.all([
        AgriculturalCache.cacheFarm(farm.id, farm),
        AgriculturalCache.cacheFarm(cacheKey, farm),
      ]);

      return createSuccessResponse(farm, {
        message: "Farm retrieved successfully",
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error("Failed to get farm by slug", { slug, error });
      return createErrorResponse({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve farm",
        timestamp: new Date(),
        details: { slug },
      });
    }
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
   * @returns ServiceResponse with array of farms owned by user
   */
  async getFarmsByOwnerId(
    userId: string,
  ): Promise<ServiceResponse<QuantumFarm[]>> {
    try {
      const farms = await this.repository.findByOwnerId(userId);
      return createSuccessResponse(farms, {
        message: "Farms retrieved successfully",
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error("Failed to get farms by owner", { userId, error });
      return createErrorResponse({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve farms",
        timestamp: new Date(),
        details: { userId },
      });
    }
  }

  /**
   * Get all active farms that have products available
   *
   * Returns only farms with status="ACTIVE" that have at least one active
   * product. Used for marketplace listings and featured farms.
   *
   * @returns ServiceResponse with array of active farms with their products
   *
   * @example
   * ```typescript
   * const response = await farmService.getActiveFarmsWithProducts();
   * if (response.success) {
   *   // Display on marketplace homepage
   *   response.data.forEach(farm => console.log(farm.name));
   * }
   * ```
   */
  async getActiveFarmsWithProducts(): Promise<ServiceResponse<QuantumFarm[]>> {
    try {
      const farms = await this.repository.findActiveWithProducts();
      return createSuccessResponse(farms, {
        message: "Active farms retrieved successfully",
        timestamp: new Date(),
        agricultural: {
          season: this.getCurrentSeason(),
          consciousness: "DIVINE",
          entityType: "farm",
        },
      });
    } catch (error) {
      this.logger.error("Failed to get active farms with products", { error });
      return createErrorResponse({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve active farms",
        timestamp: new Date(),
      });
    }
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
   * @returns ServiceResponse with updated quantum farm
   *
   * @example
   * ```typescript
   * const response = await service.updateFarm("farm-id", session.user.id, {
   *   description: "Updated description"
   * });
   *
   * if (response.success) {
   *   console.log(response.data.description);
   * }
   * ```
   */
  async updateFarm(
    farmId: string,
    userId: string,
    updateData: UpdateFarmRequest,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<QuantumFarm>> {
    try {
      // Verify farm exists
      const existingFarm = await this.repository.findById(farmId);

      if (!existingFarm) {
        return createErrorResponse({
          code: ErrorCodes.NOT_FOUND,
          message: "Farm not found",
          timestamp: new Date(),
          details: { farmId },
        });
      }

      // Verify ownership
      if (existingFarm.ownerId !== userId) {
        return createErrorResponse({
          code: ErrorCodes.FORBIDDEN_ACTION,
          message: "Unauthorized: You don't own this farm",
          timestamp: new Date(),
          details: { farmId, userId },
        });
      }

      // Prepare update data
      const prismaUpdateData: Prisma.FarmUpdateInput = {
        // Only update provided fields
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.description && { description: updateData.description }),
        ...(updateData.story && { story: updateData.story }),
        ...(updateData.businessName && {
          businessName: updateData.businessName,
        }),
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
        ...(updateData.website !== undefined && {
          website: updateData.website,
        }),
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

      return createSuccessResponse(updatedFarm, {
        message: "Farm updated successfully",
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error("Farm update failed", { farmId, userId, error });

      if (error instanceof NotFoundError) {
        return createErrorResponse({
          code: ErrorCodes.NOT_FOUND,
          message: error.message,
          timestamp: new Date(),
          details: { farmId },
        });
      }

      if (error instanceof AuthorizationError) {
        return createErrorResponse({
          code: ErrorCodes.FORBIDDEN_ACTION,
          message: error.message,
          timestamp: new Date(),
          details: { farmId, userId },
        });
      }

      return createErrorResponse({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to update farm",
        timestamp: new Date(),
        details: {
          originalError:
            error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  /**
   * Update farm status
   *
   * @param farmId - Farm ID
   * @param status - New status
   * @param options - Repository options
   * @returns ServiceResponse with updated farm
   */
  async updateFarmStatus(
    farmId: string,
    status: string,
    options?: RepositoryOptions,
  ): Promise<ServiceResponse<QuantumFarm>> {
    try {
      const farm = await this.repository.updateStatus(farmId, status, options);

      // Invalidate cache
      await AgriculturalCache.invalidateFarm(farmId);

      return createSuccessResponse(farm, {
        message: "Farm status updated successfully",
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error("Farm status update failed", { farmId, status, error });
      return createErrorResponse({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to update farm status",
        timestamp: new Date(),
        details: { farmId, status },
      });
    }
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
   * @returns ServiceResponse indicating success or failure
   */
  async deleteFarm(
    farmId: string,
    userId: string,
  ): Promise<ServiceResponse<void>> {
    try {
      // Verify farm exists
      const existingFarm = await this.repository.findById(farmId);

      if (!existingFarm) {
        return createErrorResponse({
          code: ErrorCodes.NOT_FOUND,
          message: "Farm not found",
          timestamp: new Date(),
          details: { farmId },
        });
      }

      // Verify ownership
      if (existingFarm.ownerId !== userId) {
        return createErrorResponse({
          code: ErrorCodes.FORBIDDEN_ACTION,
          message: "Unauthorized: You don't own this farm",
          timestamp: new Date(),
          details: { farmId, userId },
        });
      }

      // Soft delete (set status to INACTIVE)
      await this.repository.update(farmId, {
        status: "INACTIVE",
      });

      // Invalidate cache
      await AgriculturalCache.invalidateFarm(farmId);

      return createSuccessResponse(undefined, {
        message: "Farm deleted successfully",
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error("Farm deletion failed", { farmId, userId, error });

      if (error instanceof NotFoundError) {
        return createErrorResponse({
          code: ErrorCodes.NOT_FOUND,
          message: error.message,
          timestamp: new Date(),
          details: { farmId },
        });
      }

      if (error instanceof AuthorizationError) {
        return createErrorResponse({
          code: ErrorCodes.FORBIDDEN_ACTION,
          message: error.message,
          timestamp: new Date(),
          details: { farmId, userId },
        });
      }

      return createErrorResponse({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to delete farm",
        timestamp: new Date(),
        details: {
          originalError:
            error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  // ==========================================================================
  // FARM LISTING & SEARCH
  // ==========================================================================

  /**
   * List farms with pagination and filtering
   *
   * @param options - Pagination and filter options
   * @returns PaginatedResponse with quantum farms
   *
   * @example
   * ```typescript
   * const response = await service.listFarms({
   *   page: 1,
   *   limit: 20,
   *   city: "Seattle",
   *   status: "ACTIVE"
   * });
   *
   * if (response.success) {
   *   console.log(`Total: ${response.pagination.total}`);
   *   response.data.forEach(farm => console.log(farm.name));
   * }
   * ```
   */
  async listFarms(
    options: ListFarmsOptions = {},
  ): Promise<PaginatedResponse<QuantumFarm>> {
    try {
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

      return createPaginatedResponse(
        farms,
        {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        {
          message: "Farms retrieved successfully",
          timestamp: new Date(),
          agricultural: {
            season: this.getCurrentSeason(),
            consciousness: "DIVINE",
            entityType: "farm",
          },
        },
      );
    } catch (error) {
      this.logger.error("Failed to list farms", { options, error });
      return {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: "Failed to retrieve farms",
          timestamp: new Date(),
        },
        data: [],
        pagination: {
          page: options.page || 1,
          limit: options.limit || 20,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  /**
   * Search farms by name, description, or location
   *
   * @param options - Search query and limit
   * @returns ServiceResponse with matching quantum farms
   *
   * @example
   * ```typescript
   * const response = await service.searchFarms({
   *   query: "organic",
   *   limit: 10
   * });
   *
   * if (response.success) {
   *   response.data.forEach(farm => console.log(farm.name));
   * }
   * ```
   */
  async searchFarms(
    options: SearchFarmsOptions,
  ): Promise<ServiceResponse<QuantumFarm[]>> {
    try {
      const { query, limit = 10 } = options;

      const farms = await this.repository.searchFarms(query, {
        take: limit,
      });

      return createSuccessResponse(farms, {
        message: "Search completed successfully",
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error("Farm search failed", { options, error });
      return createErrorResponse({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to search farms",
        timestamp: new Date(),
        details: { query: options.query },
      });
    }
  }

  /**
   * Get all farms in a specific city.
   *
   * @param city - City name
   * @returns ServiceResponse with array of farms in the city
   *
   * @example
   * ```typescript
   * const response = await farmService.getFarmsByCity("Seattle");
   * if (response.success) {
   *   response.data.forEach(farm => console.log(farm.name));
   * }
   * ```
   */
  async getFarmsByCity(city: string): Promise<ServiceResponse<QuantumFarm[]>> {
    try {
      const farms = await this.repository.findByCity(city);
      return createSuccessResponse(farms, {
        message: "Farms retrieved successfully",
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error("Failed to get farms by city", { city, error });
      return createErrorResponse({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve farms",
        timestamp: new Date(),
        details: { city },
      });
    }
  }

  /**
   * Get all farms in a specific state.
   *
   * @param state - State code (e.g., "WA", "CA")
   * @returns ServiceResponse with array of farms in the state
   *
   * @example
   * ```typescript
   * const response = await farmService.getFarmsByState("WA");
   * if (response.success) {
   *   response.data.forEach(farm => console.log(farm.name));
   * }
   * ```
   */
  async getFarmsByState(
    state: string,
  ): Promise<ServiceResponse<QuantumFarm[]>> {
    try {
      const farms = await this.repository.findByState(state);
      return createSuccessResponse(farms, {
        message: "Farms retrieved successfully",
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error("Failed to get farms by state", { state, error });
      return createErrorResponse({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve farms",
        timestamp: new Date(),
        details: { state },
      });
    }
  }

  /**
   * Find farms near specific coordinates
   *
   * @param latitude - Latitude
   * @param longitude - Longitude
   * @param radiusKm - Search radius in kilometers
   * @returns ServiceResponse with array of farms within radius, sorted by distance
   *
   * @example
   * ```typescript
   * const response = await service.findNearbyFarms(47.6062, -122.3321, 50);
   * if (response.success) {
   *   response.data.forEach(farm => console.log(farm.name));
   * }
   * ```
   */
  async findNearbyFarms(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
  ): Promise<ServiceResponse<QuantumFarm[]>> {
    try {
      const farms = await this.repository.findNearLocation(
        latitude,
        longitude,
        radiusKm,
      );

      return createSuccessResponse(farms, {
        message: "Nearby farms retrieved successfully",
        timestamp: new Date(),
        agricultural: {
          season: this.getCurrentSeason(),
          consciousness: "DIVINE",
          entityType: "farm",
        },
      });
    } catch (error) {
      this.logger.error("Failed to find nearby farms", {
        latitude,
        longitude,
        radiusKm,
        error,
      });
      return createErrorResponse({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to find nearby farms",
        timestamp: new Date(),
        details: { latitude, longitude, radiusKm },
      });
    }
  }

  // ==========================================================================
  // AGRICULTURAL CONSCIOUSNESS HELPERS
  // ==========================================================================

  /**
   * Get current season based on date
   *
   * @returns Current season
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth();

    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Singleton instance of FarmService
 * Use this for all farm operations
 */
export const farmService = new FarmService();
