/**
 * DIVINE FARM TYPES - AGRICULTURAL QUANTUM CONSCIOUSNESS
 *
 * These types embody the biodynamic essence of farming operations,
 * manifesting agricultural reality through quantum consciousness.
 *
 * Related Divine Instructions:
 * - 02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 * - 01_DIVINE_CORE_PRINCIPLES.instructions.md
 * - 07_DATABASE_QUANTUM_MASTERY.instructions.md
 *
 * Functional Requirements: FR-011 (Farm Profile Creation)
 */

import { Farm, FarmStatus, FarmVerificationStatus } from "@prisma/client";

// ============================================================================
// QUANTUM IDENTIFIERS - Branded Types for Compile-Time Safety
// ============================================================================

type Brand<K, T> = K & { __brand: T };

export type FarmId = Brand<string, "FarmId">;
export type UserId = Brand<string, "UserId">;
export type FarmSlug = Brand<string, "FarmSlug">;

export function createFarmId(id: string): FarmId {
  return id as FarmId;
}

export function createUserId(id: string): UserId {
  return id as UserId;
}

export function createFarmSlug(slug: string): FarmSlug {
  return slug as FarmSlug;
}

// ============================================================================
// SEASONAL CONSCIOUSNESS - Agricultural Time Awareness
// ============================================================================

export enum Season {
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  FALL = "FALL",
  WINTER = "WINTER",
}

export enum MoonPhase {
  NEW_MOON = "NEW_MOON",
  WAXING_CRESCENT = "WAXING_CRESCENT",
  FIRST_QUARTER = "FIRST_QUARTER",
  WAXING_GIBBOUS = "WAXING_GIBBOUS",
  FULL_MOON = "FULL_MOON",
  WANING_GIBBOUS = "WANING_GIBBOUS",
  LAST_QUARTER = "LAST_QUARTER",
  WANING_CRESCENT = "WANING_CRESCENT",
}

export interface SeasonalTimeframe {
  season: Season;
  year: number;
  startDate: Date;
  endDate: Date;
  moonPhase?: MoonPhase;
}

export interface BiodynamicTimeframe extends SeasonalTimeframe {
  plantingWindows: OptimalTimeframe[];
  harvestPredictions: YieldForecast[];
}

export interface OptimalTimeframe {
  cropType: string;
  startDate: Date;
  endDate: Date;
  moonPhasePreference?: MoonPhase[];
  confidence: number; // 0-1
}

export interface YieldForecast {
  cropType: string;
  expectedYield: number;
  unit: string;
  confidence: number; // 0-1
  forecastDate: Date;
}

// ============================================================================
// BIODYNAMIC COORDINATES - Geographic Quantum Resonance
// ============================================================================

export interface BiodynamicCoordinates {
  latitude: number;
  longitude: number;
  elevation?: number;
  climateZone?: string;
  soilType?: string;
  waterSource?: string;
}

export interface GeographicResonance extends BiodynamicCoordinates {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  geohash?: string; // For efficient geospatial queries
}

// ============================================================================
// FARM CONSCIOUSNESS - Core Agricultural Entity
// ============================================================================

export enum FarmConsciousnessState {
  DORMANT = "DORMANT", // Winter rest, planning phase
  AWAKENING = "AWAKENING", // Spring preparation
  GROWING = "GROWING", // Active cultivation
  HARVESTING = "HARVESTING", // Harvest season
  REGENERATING = "REGENERATING", // Post-harvest soil regeneration
}

export interface FarmConsciousness {
  state: FarmConsciousnessState;
  currentSeason: Season;
  activeCrops: string[];
  soilHealth: number; // 0-100
  biodiversityIndex: number; // 0-100
  sustainabilityScore: number; // 0-100
}

// ============================================================================
// QUANTUM FARM ENTITY - Divine Agricultural Manifestation
// ============================================================================

export interface QuantumFarm {
  // Core Identity
  identity: {
    id: FarmId;
    slug: FarmSlug;
    name: string;
    ownerId: UserId;
  };

  // Consciousness Layer
  consciousness: FarmConsciousness;

  // Geographic Resonance
  location: GeographicResonance;

  // Temporal Awareness
  temporal: {
    established: Date;
    currentSeason: Season;
    operatingHours?: OperatingHours;
  };

  // Business Essence
  business: {
    description?: string;
    story?: string;
    businessName?: string;
    yearEstablished?: number;
    farmSize?: number; // acres
  };

  // Contact Manifestation
  contact: {
    email: string;
    phone: string;
    website?: string;
    socialMedia?: SocialMediaLinks;
  };

  // Agricultural Practices
  practices: {
    farmingMethods: string[]; // organic, regenerative, biodynamic
    certifications: FarmCertification[];
    productCategories: string[];
  };

  // Delivery Reality
  delivery: {
    pickupEnabled: boolean;
    deliveryEnabled: boolean;
    deliveryRadius?: number; // miles
    fulfillmentMethods: string[];
  };

  // Status & Verification
  status: {
    farmStatus: FarmStatus;
    verificationStatus: FarmVerificationStatus;
    stripeOnboarded: boolean;
    payoutsEnabled: boolean;
  };

  // Quantum Metrics
  metrics: {
    profileViews: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating?: number;
    reviewCount: number;
  };

  // Temporal Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    verifiedAt?: Date;
  };
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface OperatingHours {
  monday?: TimeWindow;
  tuesday?: TimeWindow;
  wednesday?: TimeWindow;
  thursday?: TimeWindow;
  friday?: TimeWindow;
  saturday?: TimeWindow;
  sunday?: TimeWindow;
  timezone: string;
}

export interface TimeWindow {
  open: string; // HH:mm format
  close: string;
  closed?: boolean;
}

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
}

export interface FarmCertification {
  type: string;
  issuingBody: string;
  certificationNumber?: string;
  issuedDate?: Date;
  expiryDate?: Date;
  verified: boolean;
}

export interface FarmPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateFarmRequest {
  name: string;
  description?: string;
  story?: string;

  // Location (required)
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;

  // Contact (required)
  email: string;
  phone: string;
  website?: string;

  // Optional business details
  businessName?: string;
  yearEstablished?: number;
  farmSize?: number;

  // Practices
  farmingPractices?: string[];
  productCategories?: string[];

  // Delivery options
  deliveryRadius?: number;
}

export interface UpdateFarmRequest {
  name?: string;
  description?: string;
  story?: string;
  phone?: string;
  website?: string;
  yearEstablished?: number;
  farmSize?: number;
  farmingPractices?: string[];
  productCategories?: string[];
  deliveryRadius?: number;
}

export interface FarmResponse {
  farm: QuantumFarm;
}

export interface FarmListResponse {
  farms: QuantumFarm[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ============================================================================
// QUERY FILTERS - Reality Filtering
// ============================================================================

export interface FarmQueryFilters {
  search?: string;
  categories?: string[];
  certifications?: string[];
  deliveryEnabled?: boolean;
  withinRadius?: {
    latitude: number;
    longitude: number;
    radiusMiles: number;
  };
  status?: FarmStatus[];
  season?: Season;
}

export interface FarmSortOptions {
  field: "name" | "createdAt" | "rating" | "distance";
  direction: "asc" | "desc";
}

// ============================================================================
// ERROR TYPES - Enlightening Failures
// ============================================================================

export class FarmCreationError extends Error {
  constructor(
    message: string,
    public readonly code: FarmErrorCode,
    public readonly resolutionPath: string[]
  ) {
    super(message);
    this.name = "FarmCreationError";
  }
}

export enum FarmErrorCode {
  FARM_ALREADY_EXISTS = "FARM_ALREADY_EXISTS",
  INVALID_COORDINATES = "INVALID_COORDINATES",
  GEOCODING_FAILED = "GEOCODING_FAILED",
  SLUG_GENERATION_FAILED = "SLUG_GENERATION_FAILED",
  UNAUTHORIZED = "UNAUTHORIZED",
  VALIDATION_FAILED = "VALIDATION_FAILED",
}

// ============================================================================
// TYPE GUARDS - Runtime Type Safety
// ============================================================================

export function isQuantumFarm(obj: unknown): obj is QuantumFarm {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "identity" in obj &&
    "consciousness" in obj &&
    "location" in obj
  );
}

export function isFarmId(id: unknown): id is FarmId {
  return typeof id === "string" && id.length > 0;
}

// ============================================================================
// UTILITY FUNCTIONS - Reality Helpers
// ============================================================================

/**
 * Transform Prisma Farm model to Quantum Farm entity
 * Manifests agricultural consciousness from database reality
 */
export function manifestQuantumFarm(
  prismaFarm: Farm & {
    photos?: FarmPhoto[];
    certifications?: any[];
  }
): QuantumFarm {
  const currentSeason = determineCurrentSeason();
  const consciousnessState = determineFarmConsciousness(
    currentSeason,
    prismaFarm.status
  );

  return {
    identity: {
      id: createFarmId(prismaFarm.id),
      slug: createFarmSlug(prismaFarm.slug),
      name: prismaFarm.name,
      ownerId: createUserId(prismaFarm.ownerId),
    },
    consciousness: {
      state: consciousnessState,
      currentSeason,
      activeCrops: [], // TODO: Implement from products
      soilHealth: 100, // TODO: Calculate from practices
      biodiversityIndex: 100, // TODO: Calculate
      sustainabilityScore: 100, // TODO: Calculate
    },
    location: {
      latitude: Number(prismaFarm.latitude),
      longitude: Number(prismaFarm.longitude),
      address: prismaFarm.address,
      city: prismaFarm.city,
      state: prismaFarm.state,
      zipCode: prismaFarm.zipCode,
      country: prismaFarm.country,
    },
    temporal: {
      established: prismaFarm.createdAt,
      currentSeason,
    },
    business: {
      description: prismaFarm.description || undefined,
      story: prismaFarm.story || undefined,
      businessName: prismaFarm.businessName || undefined,
      yearEstablished: prismaFarm.yearEstablished || undefined,
      farmSize: prismaFarm.farmSize ? Number(prismaFarm.farmSize) : undefined,
    },
    contact: {
      email: prismaFarm.email,
      phone: prismaFarm.phone,
      website: prismaFarm.website || undefined,
    },
    practices: {
      farmingMethods: (prismaFarm.farmingPractices as string[]) || [],
      certifications: [], // TODO: Map certifications
      productCategories: (prismaFarm.productCategories as string[]) || [],
    },
    delivery: {
      pickupEnabled: true, // Default
      deliveryEnabled: prismaFarm.deliveryRadius ? true : false,
      deliveryRadius: prismaFarm.deliveryRadius || undefined,
      fulfillmentMethods: ["FARM_PICKUP"],
    },
    status: {
      farmStatus: prismaFarm.status,
      verificationStatus: prismaFarm.verificationStatus,
      stripeOnboarded: prismaFarm.stripeOnboarded,
      payoutsEnabled: prismaFarm.payoutsEnabled,
    },
    metrics: {
      profileViews: prismaFarm.profileViewsCount,
      totalOrders: prismaFarm.totalOrdersCount,
      totalRevenue: Number(prismaFarm.totalRevenueUSD),
      averageRating: prismaFarm.averageRating
        ? Number(prismaFarm.averageRating)
        : undefined,
      reviewCount: prismaFarm.reviewCount,
    },
    metadata: {
      createdAt: prismaFarm.createdAt,
      updatedAt: prismaFarm.updatedAt,
      verifiedAt: prismaFarm.verifiedAt || undefined,
    },
  };
}

/**
 * Determine current season based on date and hemisphere
 */
export function determineCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth(); // 0-11

  // Northern hemisphere seasons
  if (month >= 2 && month <= 4) return Season.SPRING; // Mar-May
  if (month >= 5 && month <= 7) return Season.SUMMER; // Jun-Aug
  if (month >= 8 && month <= 10) return Season.FALL; // Sep-Nov
  return Season.WINTER; // Dec-Feb
}

/**
 * Determine farm consciousness state based on season and status
 */
export function determineFarmConsciousness(
  season: Season,
  status: FarmStatus
): FarmConsciousnessState {
  if (status !== "ACTIVE") return FarmConsciousnessState.DORMANT;

  switch (season) {
    case Season.WINTER:
      return FarmConsciousnessState.REGENERATING;
    case Season.SPRING:
      return FarmConsciousnessState.AWAKENING;
    case Season.SUMMER:
      return FarmConsciousnessState.GROWING;
    case Season.FALL:
      return FarmConsciousnessState.HARVESTING;
    default:
      return FarmConsciousnessState.DORMANT;
  }
}

/**
 * Generate unique slug from farm name
 * Handles collisions by appending location
 */
export function generateFarmSlug(name: string, city?: string): string {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (city) {
    const citySlug = city
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    slug = `${slug}-${citySlug}`;
  }

  return slug;
}
