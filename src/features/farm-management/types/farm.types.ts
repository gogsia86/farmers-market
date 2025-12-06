/**
 * FARM MANAGEMENT TYPE DEFINITIONS
 * Enterprise-grade types with agricultural consciousness
 *
 * ⚠️ MIGRATION NOTICE: Core entity types moved to @/types/core-entities
 * This file now re-exports and extends core types.
 *
 * Implements patterns from:
 * - 11_KILO_SCALE_ARCHITECTURE.instructions.md
 * - 02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 * - 01_DIVINE_CORE_PRINCIPLES.instructions.md (Single Source of Truth)
 */

// ============================================
// CORE TYPE RE-EXPORTS
// ============================================

/**
 * Import core entities from single source of truth
 * ✅ CORRECT: Import from canonical location
 * ❌ NEVER: Define duplicate types here
 */
export type {
  // Core Entities
  Farm,
  User,
  Product,

  // Extended Types
  FarmWithRelations,
  UserWithRelations,
  ProductWithRelations,

  // View Models
  FarmSummary,
  UserSummary,
  ProductCard,

  // Enums
  FarmStatus,
  UserRole,
  ProductStatus,

  // Utility Types
  Coordinates,
  Location,

  // Request Types
  CreateFarmRequest,
  UpdateFarmRequest,

  // API Types
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
} from "@/types/core-entities";

// ============================================
// FARM-SPECIFIC TYPES (Not in core-entities)
// ============================================

/**
 * Farm filter options for search/listing
 */
export interface FarmFilters {
  status?: string;
  ownerId?: string;
  certified?: boolean;
  searchTerm?: string;
  hasProducts?: boolean;
  organic?: boolean;
  city?: string;
  state?: string;
  certifications?: string[];
  minRating?: number;
}

/**
 * Pagination options for queries
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: {
    field: string;
    direction: "asc" | "desc";
  };
}

/**
 * Paginated result wrapper (kept for backward compatibility)
 * @deprecated Use PaginatedResponse<T> from core-entities instead
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================
// VALIDATION TYPES
// ============================================

/**
 * Validation options for farm operations
 */
export interface ValidationOptions {
  respectSeasonalBoundaries: boolean;
  validateSoilCompatibility: boolean;
  checkBiodynamicCompliance: boolean;
}

/**
 * Seasonal validation result
 */
export interface SeasonalValidationResult {
  valid: boolean;
  season: string;
  recommendations: string[];
  warnings: string[];
}

/**
 * Biodynamic compliance validation result
 */
export interface BiodynamicValidationResult {
  compliant: boolean;
  score: number;
  violations: string[];
  improvements: string[];
}

// ============================================
// AGRICULTURAL CONSCIOUSNESS TYPES
// ============================================

/**
 * Agricultural consciousness metrics for farms
 */
export interface AgriculturalConsciousness {
  soilAwareness: number;
  seasonalAlignment: number;
  biodynamicCompliance: number;
  sustainabilityScore: number;
  communityIntegration: number;
}

/**
 * Soil memory tracking for biodynamic farming
 */
export interface SoilMemory {
  farmId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  soilType: string;
  healthIndex: number;
  nutrientLevels: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    organicMatter: number;
  };
  previousCrops: Array<{
    crop: string;
    year: number;
    yield: string;
  }>;
  biodynamicTreatments: Array<{
    treatment: string;
    date: Date;
  }>;
  celestialInfluences: {
    lastFullMoonTreatment: Date;
    planetaryAlignments: string[];
  };
  recordedAt: Date;
  lastUpdated: Date;
}

// ============================================
// API ERROR TYPES (Farm-specific extensions)
// ============================================

/**
 * Extended API error for farm operations
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  path?: string;
  agriculturalContext?: {
    season?: string;
    lunarPhase?: string;
    soilConditions?: string;
  };
}

/**
 * API metadata for farm operations
 */
export interface ApiMeta {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: Record<string, any>;
  requestId?: string;
  responseTime?: number;
  agriculturalConsciousness?: number;
}

/**
 * Agricultural metadata for API responses
 */
export interface AgriculturalMetadata {
  season: string;
  lunarPhase: string;
  soilConditions: any;
  biodynamicAlignment: any;
  seasonalRecommendations: string[];
  agriculturalConsciousness: number;
}

// ============================================
// SERVICE INTERFACES
// ============================================

/**
 * Farm service interface
 * Defines contract for farm business logic operations
 */
export interface IFarmService {
  createFarm(request: any): Promise<any>;
  getFarmById(id: string): Promise<any>;
  updateFarm(id: string, request: any): Promise<any>;
  deleteFarm(id: string): Promise<void>;
  searchFarms(
    filters: FarmFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<any>>;
}

/**
 * Farm repository interface
 * Defines contract for farm data access operations
 */
export interface IFarmRepository {
  create(data: any): Promise<any>;
  findById(id: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
  findMany(
    filters: FarmFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<any>>;
}

// ============================================
// TYPE COMPATIBILITY HELPERS
// ============================================

/**
 * Helper to convert PaginatedResponse to PaginatedResult
 * For backward compatibility during migration
 */
export function toPaginatedResult<T>(response: {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}): PaginatedResult<T> {
  return {
    data: response.items,
    pagination: {
      page: response.pagination.page,
      limit: response.pagination.pageSize,
      total: response.pagination.totalItems,
      pages: response.pagination.totalPages,
      hasNext: response.pagination.hasNextPage,
      hasPrev: response.pagination.hasPreviousPage,
    },
  };
}
