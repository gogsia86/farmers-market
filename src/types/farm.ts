/**
 * FARM TYPE SYSTEM
 *
 * Complete type definitions for farm profiles, verification, and management.
 * Implements agricultural consciousness with biodynamic patterns.
 *
 * @module types/farm
 */

// ============================================
// FARM CLASSIFICATION TYPES
// ============================================

/**
 * Farm type classifications based on agricultural practices
 */
export type FarmType = "ORGANIC" | "CONVENTIONAL" | "SPECIALTY" | "MIXED";

/**
 * Farm size categories for analytics and filtering
 */
export type FarmSize = "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";

/**
 * Verification status for farm profiles
 */
export type VerificationStatus =
  | "PENDING" // Awaiting admin review
  | "VERIFIED" // Approved and trusted
  | "REJECTED" // Verification denied
  | "SUSPENDED"; // Temporarily suspended

/**
 * Farm operational status
 */
export type FarmStatus = "ACTIVE" | "INACTIVE" | "SEASONAL";

// ============================================
// CERTIFICATION TYPES
// ============================================

/**
 * Agricultural certification types
 */
export type CertificationType =
  | "USDA_ORGANIC"
  | "NON_GMO"
  | "FAIR_TRADE"
  | "BIODYNAMIC"
  | "RAINFOREST_ALLIANCE"
  | "ANIMAL_WELFARE"
  | "SUSTAINABLE"
  | "OTHER";

/**
 * Certification details for farm compliance
 */
export interface Certification {
  id: string;
  type: CertificationType;
  certifier: string;
  certificateNumber: string;
  issuedDate: Date;
  expiryDate?: Date;
  certificateUrl?: string;
  notes?: string;
}

// ============================================
// LOCATION TYPES
// ============================================

/**
 * Geographic coordinates for farm location
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Complete address information
 */
export interface FarmAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: Coordinates;
}

// ============================================
// FARM PROFILE TYPES
// ============================================

/**
 * Complete farm profile with all details
 * Implements holographic component pattern - contains entire farm ecosystem
 */
export interface FarmProfile {
  // Identity
  id: string;
  name: string;
  slug: string;
  description?: string;
  tagline?: string;

  // Location
  address: FarmAddress;
  deliveryRadius?: number; // Miles

  // Classification
  farmType: FarmType;
  farmSize: FarmSize;
  certifications: Certification[];

  // Details
  establishedYear?: number;
  acreage?: number;
  specialties: string[]; // e.g., ["Tomatoes", "Herbs"]
  farmingPractices: string[]; // e.g., ["No-till", "Crop rotation"]

  // Status & Verification
  verificationStatus: VerificationStatus;
  verificationDate?: Date;
  verifiedBy?: string; // Admin user ID
  status: FarmStatus;
  isActive: boolean;

  // Media
  logoUrl?: string;
  coverImageUrl?: string;
  images: string[];

  // Contact
  email?: string;
  phone?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };

  // Business Hours
  businessHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };

  // Relations
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };

  // Statistics (computed)
  productCount?: number;
  rating?: number;
  reviewCount?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// INPUT & UPDATE TYPES
// ============================================

/**
 * Input for creating a new farm profile
 */
export type CreateFarmInput = Omit<
  FarmProfile,
  | "id"
  | "slug"
  | "verificationStatus"
  | "verificationDate"
  | "verifiedBy"
  | "productCount"
  | "rating"
  | "reviewCount"
  | "createdAt"
  | "updatedAt"
  | "owner"
>;

/**
 * Input for updating farm profile
 */
export type UpdateFarmInput = Partial<
  Omit<
    FarmProfile,
    | "id"
    | "slug"
    | "ownerId"
    | "verificationStatus"
    | "verificationDate"
    | "verifiedBy"
    | "createdAt"
    | "updatedAt"
    | "owner"
    | "productCount"
    | "rating"
    | "reviewCount"
  >
>;

/**
 * Verification decision input (admin only)
 */
export interface VerifyFarmInput {
  farmId: string;
  status: "VERIFIED" | "REJECTED";
  notes?: string;
}

// ============================================
// QUERY & FILTER TYPES
// ============================================

/**
 * Farm search and filter parameters
 */
export interface FarmFilters {
  // Type filters
  farmType?: FarmType[];
  farmSize?: FarmSize[];

  // Status filters
  verificationStatus?: VerificationStatus;
  status?: FarmStatus;
  isActive?: boolean;

  // Location filters
  city?: string;
  state?: string;
  zipCode?: string;
  nearLocation?: {
    coordinates: Coordinates;
    radiusMiles: number;
  };

  // Feature filters
  hasProducts?: boolean;
  hasDelivery?: boolean;
  isOrganic?: boolean;
  certificationTypes?: CertificationType[];

  // Search
  search?: string; // Searches name, description, specialties

  // Sorting
  sortBy?: "name" | "rating" | "createdAt" | "distance";
  sortOrder?: "asc" | "desc";
}

/**
 * Pagination options for farm listings
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Paginated response for farm listings
 */
export interface PaginatedFarmResponse {
  farms: FarmProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================
// FARM STATISTICS TYPES
// ============================================

/**
 * Farm statistics and metrics
 */
export interface FarmStats {
  farmId: string;

  // Products
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;

  // Sales
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;

  // Customers
  totalCustomers: number;
  repeatCustomers: number;

  // Ratings
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };

  // Performance
  fulfillmentRate: number; // % of orders fulfilled on time
  responseTime: number; // Average response time in hours
}

// ============================================
// VALIDATION TYPES
// ============================================

/**
 * Farm validation errors
 */
export interface FarmValidationError {
  field: keyof CreateFarmInput | keyof UpdateFarmInput;
  message: string;
}

/**
 * Farm validation result
 */
export interface FarmValidationResult {
  isValid: boolean;
  errors: FarmValidationError[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Standard API response for farm operations
 */
export interface FarmApiResponse<T = FarmProfile> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: FarmValidationError[];
}

/**
 * Farm list API response
 */
export type FarmListResponse = FarmApiResponse<PaginatedFarmResponse>;

/**
 * Farm creation response
 */
export type CreateFarmResponse = FarmApiResponse<FarmProfile>;

/**
 * Farm update response
 */
export type UpdateFarmResponse = FarmApiResponse<FarmProfile>;

/**
 * Farm verification response
 */
export type VerifyFarmResponse = FarmApiResponse<FarmProfile>;

// ============================================
// HELPER TYPES
// ============================================

/**
 * Farm card display data (lightweight)
 */
export interface FarmCardData {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  farmType: FarmType;
  verificationStatus: VerificationStatus;
  logoUrl?: string;
  address: {
    city: string;
    state: string;
  };
  rating?: number;
  reviewCount?: number;
  productCount?: number;
  specialties: string[];
}

/**
 * Farm dropdown option
 */
export interface FarmOption {
  value: string;
  label: string;
  logoUrl?: string;
}
