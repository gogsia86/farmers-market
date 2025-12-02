/**
 * FARM SERVICE - DIVINE DATABASE OPERATIONS
 *
 * Business logic layer for farm entity operations.
 * Separates database concerns from API routes for cleaner architecture.
 *
 * Divine Patterns Applied:
 * - Service layer separation (from divine core principles)
 * - Type-safe database operations
 * - Enlightening error messages
 * - Quantum entity manifestation
 *
 * Functional Requirements: FR-011 (Farm Profile Creation)
 */

import { Prisma } from "@prisma/client";
import { AgriculturalCache } from "@/lib/cache/agricultural-cache";
import { database } from "@/lib/database";
import {
  generateFarmSlug,
  manifestQuantumFarm,
  type CreateFarmRequest,
  type FarmSlug,
  type QuantumFarm,
  type UserId,
} from "@/types/farm.types";

// ============================================================================
// FARM CREATION SERVICE
// ============================================================================

export interface CreateFarmServiceOptions {
  userId: UserId;
  farmData: CreateFarmRequest;
}

export interface CreateFarmServiceResult {
  farm: QuantumFarm;
  slug: FarmSlug;
}

/**
 * Create farm with unique slug generation
 *
 * Handles slug collision detection and quantum farm manifestation.
 * Separates business logic from HTTP concerns.
 *
 * @param options - User ID and farm data
 * @returns Created quantum farm entity
 * @throws Error if slug generation fails or validation fails
 */
export async function createFarmService(
  options: CreateFarmServiceOptions,
): Promise<CreateFarmServiceResult> {
  const { userId, farmData } = options;

  // Input validation
  if (!userId || typeof userId !== "string") {
    throw new Error("Valid user ID is required");
  }

  if (!farmData.name || farmData.name.trim().length < 3) {
    throw new Error("Farm name must be at least 3 characters");
  }

  if (!farmData.city || !farmData.state) {
    throw new Error("City and state are required");
  }

  if (farmData.email && !validateEmail(farmData.email)) {
    throw new Error("Invalid email format");
  }

  // Email validation helper
  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  if (farmData.deliveryRadius && farmData.deliveryRadius < 0) {
    throw new Error("Delivery radius must be positive");
  }

  // Generate unique slug with collision detection
  const slug = await generateUniqueSlug(farmData.name, farmData.city);

  // Create farm in database
  const farm = await database.farm.create({
    data: {
      // Identity
      name: farmData.name,
      slug,
      ownerId: userId,

      // Business
      description: farmData.description,
      story: farmData.story,
      businessName: farmData.businessName,
      yearEstablished: farmData.yearEstablished,
      farmSize: farmData.farmSize,

      // Location
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
      website: farmData.website || null,

      // Practices
      farmingPractices: farmData.farmingPractices || [],
      productCategories: farmData.productCategories || [],

      // Delivery
      deliveryRadius: farmData.deliveryRadius,

      // Status - PENDING until Stripe onboarded
      status: "PENDING",
      verificationStatus: "PENDING",
      stripeOnboarded: false,
      payoutsEnabled: false,
    },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // Manifest quantum farm entity
  const quantumFarm = manifestQuantumFarm(farm);

  return {
    farm: quantumFarm,
    slug: slug as FarmSlug,
  };
}

// ============================================================================
// CHECK EXISTING FARM
// ============================================================================

export interface ExistingFarmCheck {
  exists: boolean;
  farm?: {
    id: string;
    slug: string;
    name: string;
  };
}

/**
 * Check if user already has a farm
 *
 * @param userId - User ID to check
 * @returns Existing farm info if found
 */
export async function checkExistingFarm(
  userId: UserId,
): Promise<ExistingFarmCheck> {
  const farm = await database.farm.findFirst({
    where: {
      ownerId: userId,
    },
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });

  if (!farm) {
    return { exists: false };
  }

  return {
    exists: true,
    farm,
  };
}

// ============================================================================
// UNIQUE SLUG GENERATION
// ============================================================================

const MAX_SLUG_ATTEMPTS = 10;

/**
 * Generate unique farm slug with collision detection
 *
 * Tries base slug first, then appends counter if collision detected.
 *
 * @param name - Farm name
 * @param city - Farm city
 * @returns Unique slug
 * @throws Error if max attempts exceeded
 */
async function generateUniqueSlug(
  name: string,
  city: string,
): Promise<FarmSlug> {
  let slug = generateFarmSlug(name, city);
  let attempt = 0;

  while (attempt < MAX_SLUG_ATTEMPTS) {
    const existing = await database.farm.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    // Collision detected - try with counter
    attempt++;
    slug = `${generateFarmSlug(name, city)}-${attempt}` as FarmSlug;
  }

  throw new Error(
    `Failed to generate unique slug after ${MAX_SLUG_ATTEMPTS} attempts`,
  );
}

// ============================================================================
// FARM RETRIEVAL SERVICES
// ============================================================================

/**
 * Get farm by ID with quantum manifestation
 * Uses agricultural cache for performance
 */
export async function getFarmById(farmId: string): Promise<QuantumFarm | null> {
  // Try cache first
  const cached = await AgriculturalCache.getFarm(farmId);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const farm = await database.farm.findUnique({
    where: { id: farmId },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!farm) {
    return null;
  }

  const quantumFarm = manifestQuantumFarm(farm);

  // Cache the result
  await AgriculturalCache.cacheFarm(farmId, quantumFarm);

  return quantumFarm;
}

/**
 * Get farm by slug with quantum manifestation
 * Uses agricultural cache for performance
 */
export async function getFarmBySlug(slug: string): Promise<QuantumFarm | null> {
  // Try cache first (using slug as key)
  const cacheKey = `farm:slug:${slug}`;
  const cached = await AgriculturalCache.getFarm(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const farm = await database.farm.findUnique({
    where: { slug },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!farm) {
    return null;
  }

  const quantumFarm = manifestQuantumFarm(farm);

  // Cache by both ID and slug
  await Promise.all([
    AgriculturalCache.cacheFarm(farm.id, quantumFarm),
    AgriculturalCache.cacheFarm(cacheKey, quantumFarm),
  ]);

  return quantumFarm;
}

// ============================================================================
// FARM UPDATE SERVICE
// ============================================================================

export interface UpdateFarmServiceOptions {
  farmId: string;
  userId: UserId;
  updateData: Partial<CreateFarmRequest>;
}

/**
 * Update farm with ownership validation
 *
 * @param options - Farm ID, User ID, and update data
 * @returns Updated quantum farm entity
 * @throws Error if user doesn't own the farm
 */
export async function updateFarmService(
  options: UpdateFarmServiceOptions,
): Promise<QuantumFarm> {
  const { farmId, userId, updateData } = options;

  // Verify ownership
  const existingFarm = await database.farm.findUnique({
    where: { id: farmId },
    select: { ownerId: true },
  });

  if (!existingFarm) {
    throw new Error("Farm not found");
  }

  if (existingFarm.ownerId !== userId) {
    throw new Error("Unauthorized: You don't own this farm");
  }

  // Update farm
  const updatedFarm = await database.farm.update({
    where: { id: farmId },
    data: {
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
    },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  const quantumFarm = manifestQuantumFarm(updatedFarm);

  // Invalidate cache
  await AgriculturalCache.invalidateFarm(farmId);

  return quantumFarm;
}

// ============================================================================
// FARM DELETION SERVICE
// ============================================================================

export interface DeleteFarmServiceOptions {
  farmId: string;
  userId: UserId;
}

/**
 * Delete farm with ownership validation
 *
 * Soft delete by setting status to INACTIVE
 *
 * @param options - Farm ID and User ID
 * @throws Error if user doesn't own the farm
 */
export async function deleteFarmService(
  options: DeleteFarmServiceOptions,
): Promise<void> {
  const { farmId, userId } = options;

  // Verify ownership
  const existingFarm = await database.farm.findUnique({
    where: { id: farmId },
    select: { ownerId: true },
  });

  if (!existingFarm) {
    throw new Error("Farm not found");
  }

  if (existingFarm.ownerId !== userId) {
    throw new Error("Unauthorized: You don't own this farm");
  }

  // Soft delete (set status to INACTIVE)
  await database.farm.update({
    where: { id: farmId },
    data: {
      status: "INACTIVE",
    },
  });

  // Invalidate cache
  await AgriculturalCache.invalidateFarm(farmId);
}

// ============================================================================
// FARM LISTING SERVICE
// ============================================================================

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

export interface ListFarmsResult {
  farms: QuantumFarm[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * List farms with pagination and filtering
 *
 * @param options - Pagination and filter options
 * @returns Paginated list of quantum farms
 */
export async function listFarmsService(
  options: ListFarmsOptions = {},
): Promise<ListFarmsResult> {
  const {
    page = 1,
    limit = 20,
    status,
    city,
    state,
    farmingPractices,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const skip = (page - 1) * limit;

  // Note: List queries are not cached due to complexity of filters and pagination
  // Individual farms are cached when retrieved

  // Build where clause
  const where: Prisma.FarmWhereInput = {
    status: { not: "INACTIVE" }, // Only active farms
  };

  if (status) {
    where.status = status; // Override with specific status if provided
  }

  if (city) {
    where.city = { contains: city, mode: "insensitive" };
  }

  if (state) {
    where.state = state;
  }

  if (farmingPractices && farmingPractices.length > 0) {
    where.farmingPractices = {
      hasSome: farmingPractices,
    };
  }

  // Get total count
  const total = await database.farm.count({ where });

  // Get paginated farms
  const farms = await database.farm.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: limit,
  });

  return {
    farms: farms.map(manifestQuantumFarm),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ============================================================================
// FARM SEARCH SERVICE
// ============================================================================

export interface SearchFarmsOptions {
  query: string;
  limit?: number;
}

/**
 * Search farms by name, description, or location
 *
 * @param options - Search query and limit
 * @returns Matching quantum farms
 */
export async function searchFarmsService(
  options: SearchFarmsOptions,
): Promise<QuantumFarm[]> {
  const { query, limit = 10 } = options;

  const farms = await database.farm.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
        { state: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    take: limit,
    orderBy: { name: "asc" },
  });

  return farms.map(manifestQuantumFarm);
}
