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
 * @throws Error if slug generation fails
 */
export async function createFarmService(
  options: CreateFarmServiceOptions
): Promise<CreateFarmServiceResult> {
  const { userId, farmData } = options;

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
      email: farmData.email,
      phone: farmData.phone,
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
  userId: UserId
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
async function generateUniqueSlug(name: string, city: string): Promise<string> {
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
    slug = `${generateFarmSlug(name, city)}-${attempt}`;
  }

  throw new Error(
    `Failed to generate unique slug after ${MAX_SLUG_ATTEMPTS} attempts`
  );
}

// ============================================================================
// FARM RETRIEVAL SERVICES
// ============================================================================

/**
 * Get farm by ID with quantum manifestation
 */
export async function getFarmById(farmId: string): Promise<QuantumFarm | null> {
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

  return manifestQuantumFarm(farm);
}

/**
 * Get farm by slug with quantum manifestation
 */
export async function getFarmBySlug(slug: string): Promise<QuantumFarm | null> {
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

  return manifestQuantumFarm(farm);
}
