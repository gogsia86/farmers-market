/**
 * QUANTUM FARM TYPE DEFINITIONS
 * Divine type system for agricultural consciousness
 */

// ============================================================================
// CORE FARM TYPES WITH AGRICULTURAL CONSCIOUSNESS
// ============================================================================

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";
export type FarmState = "GROWING" | "HARVESTING" | "REGENERATING" | "RESTING";
export type FarmStatus =
  | "ACTIVE"
  | "PENDING_VERIFICATION"
  | "SUSPENDED"
  | "INACTIVE";
export type VerificationStatus =
  | "VERIFIED"
  | "PENDING"
  | "REJECTED"
  | "NOT_STARTED";

export interface QuantumIdentifier {
  readonly brand: unique symbol;
}

export type FarmId = string & QuantumIdentifier;
export type UserId = string & QuantumIdentifier;
export type FarmSlug = string & QuantumIdentifier;

// ============================================================================
// FARM CONSCIOUSNESS LAYER
// ============================================================================

export interface FarmConsciousness {
  state: FarmState;
  currentSeason: Season;
  activeCrops: string[];
  soilHealth: number;
  biodiversityIndex: number;
  sustainabilityScore: number;
}

// ============================================================================
// GEOGRAPHIC & TEMPORAL DATA
// ============================================================================

export interface FarmLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface FarmTemporal {
  established: Date;
  currentSeason: Season;
}

// ============================================================================
// BUSINESS & CONTACT INFORMATION
// ============================================================================

export interface FarmBusiness {
  description: string;
  story: string;
  businessName: string;
  yearEstablished: number;
  farmSize: number;
}

export interface FarmContact {
  email: string;
  phone: string;
  website?: string;
}

// ============================================================================
// AGRICULTURAL PRACTICES
// ============================================================================

export interface FarmPractices {
  farmingMethods: string[];
  certifications: string[];
  productCategories: string[];
}

// ============================================================================
// DELIVERY & LOGISTICS
// ============================================================================

export interface FarmDelivery {
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  deliveryRadius: number;
}

// ============================================================================
// VISUAL MANIFESTATION
// ============================================================================

export interface FarmVisual {
  logo?: string;
  coverImage?: string;
  photos: string[];
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export interface FarmMetrics {
  totalProducts: number;
  avgRating: number;
  totalReviews: number;
  totalOrders: number;
}

// ============================================================================
// OPERATIONAL STATUS
// ============================================================================

export interface FarmOperationalStatus {
  farmStatus: FarmStatus;
  verificationStatus: VerificationStatus;
  stripeOnboarded: boolean;
  payoutsEnabled: boolean;
}

// ============================================================================
// QUANTUM FARM ENTITY - COMPLETE TYPE
// ============================================================================

export interface QuantumFarm {
  identity: {
    id: FarmId;
    slug: FarmSlug;
    name: string;
    ownerId: UserId;
  };

  consciousness: FarmConsciousness;
  location: FarmLocation;
  temporal: FarmTemporal;
  business: FarmBusiness;
  contact: FarmContact;
  practices: FarmPractices;
  delivery: FarmDelivery;
  visual: FarmVisual;
  metrics: FarmMetrics;
  status: FarmOperationalStatus;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateFarmRequest {
  // Identity
  name: string;
  description: string;

  // Business
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
  farmingMethods?: string[];
  farmingPractices?: string[];
  certifications?: string[];
  productCategories?: string[];

  // Delivery
  deliveryRadius?: number;

  // Legacy support (optional coordinates object)
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UpdateFarmRequest extends Partial<CreateFarmRequest> {
  id: FarmId;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isFarmId = (value: string): value is FarmId => {
  return typeof value === "string" && value.length > 0;
};

export const isQuantumFarm = (value: unknown): value is QuantumFarm => {
  if (!value || typeof value !== "object") return false;

  const farm = value as QuantumFarm;

  return (
    farm.identity?.id !== undefined &&
    farm.identity?.name !== undefined &&
    farm.consciousness !== undefined &&
    farm.location !== undefined
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a unique farm slug from name and city
 * Format: farm-name-city (e.g., "green-valley-farm-portland")
 */
export function generateFarmSlug(name: string, city?: string): FarmSlug {
  const slugBase = name
    .toLowerCase()
    .trim()
    .replaceAll(/[^\w\s-]/g, "") // Remove special chars
    .replaceAll(/\s+/g, "-") // Replace spaces with hyphens
    .replaceAll(/-+/g, "-"); // Remove duplicate hyphens

  const citySlug = city
    ? `-${city
        .toLowerCase()
        .trim()
        .replaceAll(/[^\w\s-]/g, "")
        .replaceAll(/\s+/g, "-")}`
    : "";

  return `${slugBase}${citySlug}` as FarmSlug;
}

/**
 * Manifest a quantum farm entity from database farm record
 * Transforms Prisma farm data into QuantumFarm structure
 */
export function manifestQuantumFarm(farm: any): QuantumFarm {
  return {
    identity: {
      id: farm.id as FarmId,
      name: farm.name,
      slug: farm.slug as FarmSlug,
      ownerId: farm.ownerId as UserId,
    },
    consciousness: {
      state: "GROWING" as FarmState,
      currentSeason: getCurrentSeason(),
      activeCrops: [],
      soilHealth: 75,
      biodiversityIndex: 70,
      sustainabilityScore: 80,
    },
    location: {
      latitude: Number(farm.latitude) || 0,
      longitude: Number(farm.longitude) || 0,
      address: farm.address,
      city: farm.city,
      state: farm.state,
      zipCode: farm.zipCode,
      country: farm.country || "US",
    },
    temporal: {
      established: farm.createdAt,
      currentSeason: getCurrentSeason(),
    },
    business: {
      description: farm.description || "",
      story: farm.story || "",
      businessName: farm.businessName || farm.name,
      yearEstablished: farm.yearEstablished || new Date().getFullYear(),
      farmSize: farm.farmSize || 0,
    },
    contact: {
      email: farm.email || "",
      phone: farm.phone || "",
      website: farm.website,
    },
    practices: {
      farmingMethods: farm.farmingPractices || [],
      certifications: farm.certifications || [],
      productCategories: farm.productCategories || [],
    },
    delivery: {
      pickupEnabled: true,
      deliveryEnabled: true,
      deliveryRadius: farm.deliveryRadius || 0,
    },
    visual: {
      logo: farm.logoUrl,
      coverImage: farm.coverImageUrl,
      photos: farm.images || [],
    },
    metrics: {
      totalProducts: farm._count?.products || 0,
      totalOrders: 0,
      avgRating: 0,
      totalReviews: 0,
    },
    status: {
      farmStatus: farm.status as FarmStatus,
      verificationStatus: farm.verificationStatus as VerificationStatus,
      stripeOnboarded: farm.stripeOnboarded || false,
      payoutsEnabled: farm.payoutsEnabled || false,
    },
  };
}

/**
 * Get current season based on date
 */
function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}
