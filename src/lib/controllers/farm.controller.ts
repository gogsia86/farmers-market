/**
 * 🚜 FARM CONTROLLER - API REQUEST HANDLERS
 *
 * Handles all farm-related HTTP requests with divine consciousness.
 * Uses BaseController for unified response patterns and error handling.
 *
 * Divine Patterns Applied:
 * - Controller layer (HTTP → Controller → Service → Repository → Database)
 * - Unified API response format
 * - Agricultural consciousness
 * - Type-safe request handling
 * - Authentication & authorization
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./base.controller";
import {
  farmService,
  type CreateFarmRequest,
  type UpdateFarmRequest,
  type ListFarmsOptions,
} from "@/lib/services/farm.service";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Farm creation validation schema
 */
const CreateFarmSchema = z.object({
  // Identity (required)
  name: z.string().min(3, "Farm name must be at least 3 characters").max(100),
  city: z.string().min(2, "City is required"),
  state: z.string().length(2, "State must be 2-letter code (e.g., WA, CA)"),

  // Business (optional)
  description: z.string().max(1000).optional(),
  story: z.string().max(5000).optional(),
  businessName: z.string().max(200).optional(),
  yearEstablished: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  farmSize: z.number().positive().optional(),

  // Location (required per Prisma schema)
  address: z.string().min(1, "Address is required").max(500),
  zipCode: z.string().min(1, "Zip code is required").max(10),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),

  // Contact (optional)
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().max(20).optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),

  // Practices (optional)
  farmingPractices: z.array(z.string()).optional(),
  productCategories: z.array(z.string()).optional(),

  // Delivery (optional)
  deliveryRadius: z.number().nonnegative().optional(),
});

/**
 * Farm update validation schema (all fields optional)
 */
const UpdateFarmSchema = CreateFarmSchema.partial();

/**
 * Farm listing query parameters schema
 */
const ListFarmsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 1;
      const parsed = parseInt(val);
      return isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 20;
      const parsed = parseInt(val);
      return isNaN(parsed) || parsed < 1 ? 20 : Math.min(parsed, 100);
    }),
  status: z.enum(["ACTIVE", "PENDING", "SUSPENDED", "INACTIVE"]).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "rating"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

/**
 * Farm search query parameters schema
 */
const SearchFarmsQuerySchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
});

/**
 * Nearby farms query parameters schema
 */
const NearbyFarmsQuerySchema = z.object({
  latitude: z.string().transform((val) => parseFloat(val)),
  longitude: z.string().transform((val) => parseFloat(val)),
  radius: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : 50)),
});

// ============================================================================
// FARM CONTROLLER CLASS
// ============================================================================

/**
 * Farm Controller with divine agricultural consciousness
 *
 * Handles all farm-related API endpoints:
 * - GET /api/farms - List farms
 * - POST /api/farms - Create farm
 * - GET /api/farms/[id] - Get farm by ID
 * - PATCH /api/farms/[id] - Update farm
 * - DELETE /api/farms/[id] - Delete farm
 * - GET /api/farms/search - Search farms
 * - GET /api/farms/nearby - Find nearby farms
 *
 * @example
 * ```typescript
 * // In API route: /api/farms/route.ts
 * const controller = new FarmController();
 * export const GET = (req: NextRequest) => controller.listFarms(req);
 * export const POST = (req: NextRequest) => controller.createFarm(req);
 * ```
 */
export class FarmController extends BaseController {
  constructor() {
    super("FarmController");
  }

  // ==========================================================================
  // LIST FARMS - GET /api/farms
  // ==========================================================================

  /**
   * List farms with pagination and filtering
   *
   * @param request - NextRequest
   * @returns Paginated list of farms
   *
   * @example
   * GET /api/farms?page=1&limit=20&city=Seattle&status=ACTIVE
   */
  async listFarms(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      // Validate and parse query parameters
      const queryParams = this.validateQuery(request, ListFarmsQuerySchema);

      const options: ListFarmsOptions = {
        page: queryParams.page,
        limit: queryParams.limit,
        status: queryParams.status,
        city: queryParams.city,
        state: queryParams.state,
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
      };

      // Get farms from service
      const result = await farmService.listFarms(options);

      // Check for service errors
      if (!result.success) {
        return this.internalError(result.error.message);
      }

      // Return paginated response
      return this.successWithPagination(
        result.data.items,
        {
          page: result.data.pagination.page,
          limit: options.limit || 20,
          total: result.data.pagination.total,
          totalPages: result.data.pagination.totalPages,
        },
        {
          agricultural: {
            consciousness: "ACTIVE",
            operation: "LIST_FARMS",
          },
        },
      );
    });
  }

  // ==========================================================================
  // CREATE FARM - POST /api/farms
  // ==========================================================================

  /**
   * Create new farm (requires FARMER role)
   *
   * @param request - NextRequest with farm data
   * @returns Created farm
   *
   * @example
   * POST /api/farms
   * Body: { name: "Divine Acres", city: "Seattle", state: "WA", ... }
   */
  async createFarm(request: NextRequest): Promise<NextResponse> {
    return this.handleAuthorizedRequest(
      request,
      ["FARMER", "ADMIN"],
      async (session) => {
        // Validate request body
        const farmData = await this.validateBody(request, CreateFarmSchema);
        if (!farmData) {
          return this.badRequest("Invalid farm data");
        }

        // Create farm through service
        const result = await farmService.createFarm(
          session.user.id,
          farmData as CreateFarmRequest,
        );

        // Check for service errors
        if (!result.success) {
          return this.internalError(result.error.message);
        }

        this.log("createFarm:success", {
          farmId: result.data.farm.id,
          slug: result.data.slug,
          ownerId: session.user.id,
        });

        // Return created response
        return this.created(result.data.farm, {
          slug: result.data.slug,
          agricultural: {
            consciousness: "DIVINE",
            operation: "FARM_MANIFESTATION",
            season: "PLANTING",
          },
        });
      },
    );
  }

  // ==========================================================================
  // GET FARM - GET /api/farms/[id]
  // ==========================================================================

  /**
   * Get farm by ID or slug
   *
   * @param request - NextRequest
   * @param params - Route params with id
   * @returns Farm details
   *
   * @example
   * GET /api/farms/farm-id-123
   * GET /api/farms/divine-acres-seattle
   */
  async getFarm(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      const { id } = params;

      // Try to get farm by ID or slug
      let farm = await farmService.getFarmById(id);

      // Check for service errors on ID lookup
      if (!farm.success) {
        return this.internalError(farm.error.message);
      }

      // If not found by ID, try by slug
      if (!farm.data) {
        farm = await farmService.getFarmBySlug(id);

        // Check for service errors on slug lookup
        if (!farm.success) {
          return this.internalError(farm.error.message);
        }

        // If still not found, return 404
        if (!farm.data) {
          return this.notFound("Farm", id);
        }
      }

      return this.success(farm.data, {
        agricultural: {
          consciousness: "QUANTUM",
          operation: "FARM_RETRIEVAL",
        },
      });
    });
  }

  // ==========================================================================
  // UPDATE FARM - PATCH /api/farms/[id]
  // ==========================================================================

  /**
   * Update farm (requires ownership)
   *
   * @param request - NextRequest with update data
   * @param params - Route params with id
   * @returns Updated farm
   *
   * @example
   * PATCH /api/farms/farm-id-123
   * Body: { description: "Updated description", ... }
   */
  async updateFarm(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      const { id } = params;

      // Validate request body
      const updateData = await this.validateBody(request, UpdateFarmSchema);
      if (!updateData) {
        return this.badRequest("Invalid update data");
      }

      // Update farm through service (ownership check inside)
      const farm = await farmService.updateFarm(
        id,
        session.user.id,
        updateData as UpdateFarmRequest,
      );

      // Check for service errors
      if (!farm.success) {
        return this.internalError(farm.error.message);
      }

      this.log("updateFarm:success", {
        farmId: id,
        ownerId: session.user.id,
      });

      return this.success(farm.data, {
        agricultural: {
          consciousness: "BIODYNAMIC",
          operation: "FARM_TRANSFORMATION",
        },
      });
    });
  }

  // ==========================================================================
  // DELETE FARM - DELETE /api/farms/[id]
  // ==========================================================================

  /**
   * Delete farm (soft delete, requires ownership)
   *
   * @param request - NextRequest
   * @param params - Route params with id
   * @returns No content response
   *
   * @example
   * DELETE /api/farms/farm-id-123
   */
  async deleteFarm(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      const { id } = params;

      // Delete farm through service (ownership check inside)
      await farmService.deleteFarm(id, session.user.id);

      this.log("deleteFarm:success", {
        farmId: id,
        ownerId: session.user.id,
      });

      return this.noContent();
    });
  }

  // ==========================================================================
  // SEARCH FARMS - GET /api/farms/search
  // ==========================================================================

  /**
   * Search farms by name, description, or location
   *
   * @param request - NextRequest with search query
   * @returns Matching farms
   *
   * @example
   * GET /api/farms/search?query=organic&limit=10
   */
  async searchFarms(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      // Validate query parameters
      const queryParams = this.validateQuery(request, SearchFarmsQuerySchema);

      // Search farms through service
      const farms = await farmService.searchFarms({
        query: queryParams.query,
        limit: queryParams.limit,
      });

      // Check for service errors
      if (!farms.success) {
        return this.internalError(farms.error.message);
      }

      return this.success(farms.data, {
        count: farms.data.length,
        searchQuery: queryParams.query,
        agricultural: {
          consciousness: "ACTIVE",
          operation: "FARM_SEARCH",
        },
      });
    });
  }

  // ==========================================================================
  // NEARBY FARMS - GET /api/farms/nearby
  // ==========================================================================

  /**
   * Find farms near specific coordinates
   *
   * @param request - NextRequest with location params
   * @returns Nearby farms sorted by distance
   *
   * @example
   * GET /api/farms/nearby?latitude=47.6062&longitude=-122.3321&radius=50
   */
  async findNearbyFarms(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      // Validate query parameters
      const queryParams = this.validateQuery(request, NearbyFarmsQuerySchema);

      // Find nearby farms through service
      const farms = await farmService.findNearbyFarms(
        queryParams.latitude,
        queryParams.longitude,
        queryParams.radius,
      );

      // Check for service errors
      if (!farms.success) {
        return this.internalError(farms.error.message);
      }

      return this.success(farms.data, {
        count: farms.data.length,
        searchRadius: queryParams.radius,
        searchLocation: {
          latitude: queryParams.latitude,
          longitude: queryParams.longitude,
        },
        agricultural: {
          consciousness: "QUANTUM",
          operation: "SPATIAL_FARM_SEARCH",
        },
      });
    });
  }

  // ==========================================================================
  // GET MY FARMS - GET /api/farms/my
  // ==========================================================================

  /**
   * Get farms owned by authenticated user
   *
   * @param request - NextRequest
   * @returns User's farms
   *
   * @example
   * GET /api/farms/my
   */
  async getMyFarms(request: NextRequest): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      // Get farms for current user
      const farms = await farmService.getFarmsByOwnerId(session.user.id);

      // Check for service errors
      if (!farms.success) {
        return this.internalError(farms.error.message);
      }

      return this.success(farms.data, {
        count: farms.data.length,
        ownerId: session.user.id,
        agricultural: {
          consciousness: "BIODYNAMIC",
          operation: "OWNER_FARM_RETRIEVAL",
        },
      });
    });
  }

  // ==========================================================================
  // CHECK EXISTING FARM - GET /api/farms/check-existing
  // ==========================================================================

  /**
   * Check if authenticated user already has a farm
   *
   * @param request - NextRequest
   * @returns Existing farm check result
   *
   * @example
   * GET /api/farms/check-existing
   */
  async checkExistingFarm(request: NextRequest): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      // Check if user has existing farm
      const check = await farmService.checkExistingFarm(session.user.id);

      return this.success(check, {
        userId: session.user.id,
      });
    });
  }

  // ==========================================================================
  // GET FARMS BY CITY - GET /api/farms/by-city/[city]
  // ==========================================================================

  /**
   * Get farms by city
   *
   * @param request - NextRequest
   * @param params - Route params with city
   * @returns Farms in city
   *
   * @example
   * GET /api/farms/by-city/Seattle
   */
  async getFarmsByCity(
    request: NextRequest,
    params: { city: string },
  ): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      const { city } = params;

      // Get farms by city
      const farms = await farmService.getFarmsByCity(city);

      // Check for service errors
      if (!farms.success) {
        return this.internalError(farms.error.message);
      }

      return this.success(farms.data, {
        total: farms.data.length,
        agricultural: {
          consciousness: "ACTIVE",
          operation: "FARMS_BY_CITY",
        },
      });
    });
  }

  // ==========================================================================
  // GET FARMS BY STATE - GET /api/farms/by-state/[state]
  // ==========================================================================

  /**
   * Get farms by state
   *
   * @param request - NextRequest
   * @param params - Route params with state
   * @returns Farms in state
   *
   * @example
   * GET /api/farms/by-state/WA
   */
  async getFarmsByState(
    request: NextRequest,
    params: { state: string },
  ): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      const { state } = params;

      const farms = await farmService.getFarmsByState(state);

      // Check for service errors
      if (!farms.success) {
        return this.internalError(farms.error.message);
      }

      return this.success(farms.data, {
        count: farms.data.length,
        state,
        agricultural: {
          consciousness: "ACTIVE",
          operation: "STATE_FARM_RETRIEVAL",
        },
      });
    });
  }
}

/**
 * Export singleton instance for use in API routes
 */
export const farmController = new FarmController();

/**
 * Divine farm controller consciousness achieved ✨🚜🎯
 * Unified API patterns with agricultural consciousness
 * Ready to scale from 1 to 1 billion requests with quantum efficiency
 */
