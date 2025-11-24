/**
 * FARM MANAGEMENT TYPE DEFINITIONS
 * Enterprise-grade types with agricultural consciousness
 *
 * Implements patterns from:
 * - 11_KILO_SCALE_ARCHITECTURE.instructions.md
 * - 02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 */

// ============================================
// CORE FARM TYPES
// ============================================

export interface Farm {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  coordinates: Coordinates;
  status: FarmStatus;
  ownerId: string;
  owner?: User;
  products?: Product[];
  certifications: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  agriculturalExperience?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  inStock: boolean;
  quantity?: number;
  farmId: string;
  organic: boolean;
  seasonal: boolean;
}

export enum FarmStatus {
  ACTIVE = "ACTIVE",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  SUSPENDED = "SUSPENDED",
  INACTIVE = "INACTIVE",
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface CreateFarmRequest {
  name: string;
  description: string;
  address: string;
  coordinates: Coordinates;
  certifications?: string[];
  images?: string[];
}

export interface UpdateFarmRequest {
  name?: string;
  description?: string;
  address?: string;
  coordinates?: Coordinates;
  certifications?: string[];
  images?: string[];
  status?: FarmStatus;
}

export interface FarmFilters {
  status?: FarmStatus;
  ownerId?: string;
  certified?: boolean;
  searchTerm?: string;
  hasProducts?: boolean;
  organic?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: {
    field: string;
    direction: "asc" | "desc";
  };
}

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

export interface ValidationOptions {
  respectSeasonalBoundaries: boolean;
  validateSoilCompatibility: boolean;
  checkBiodynamicCompliance: boolean;
}

export interface SeasonalValidationResult {
  valid: boolean;
  season: string;
  recommendations: string[];
  warnings: string[];
}

export interface BiodynamicValidationResult {
  compliant: boolean;
  score: number;
  violations: string[];
  improvements: string[];
}

// ============================================
// AGRICULTURAL CONSCIOUSNESS TYPES
// ============================================

export interface AgriculturalConsciousness {
  soilAwareness: number;
  seasonalAlignment: number;
  biodynamicCompliance: number;
  sustainabilityScore: number;
  communityIntegration: number;
}

export interface SoilMemory {
  farmId: string;
  coordinates: Coordinates;
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
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  agricultural?: AgriculturalMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  path?: string;
}

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
}

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

export interface IFarmService {
  createFarm(request: CreateFarmRequest): Promise<Farm>;
  getFarmById(id: string): Promise<Farm | null>;
  updateFarm(id: string, request: UpdateFarmRequest): Promise<Farm>;
  deleteFarm(id: string): Promise<void>;
  searchFarms(
    filters: FarmFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Farm>>;
}

export interface IFarmRepository {
  create(data: CreateFarmRequest): Promise<Farm>;
  findById(id: string): Promise<Farm | null>;
  update(id: string, data: UpdateFarmRequest): Promise<Farm>;
  delete(id: string): Promise<void>;
  findMany(
    filters: FarmFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Farm>>;
}
