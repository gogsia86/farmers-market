// 🔍 Search & Discovery Type Definitions
// Divine Agricultural Search Consciousness

import type { Prisma } from "@prisma/client";

/**
 * Product search filters
 */
export interface ProductSearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  farmId?: string;
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "ALL";
  organic?: boolean;
  seasonal?: boolean;
  sortBy?: ProductSortOption;
  page?: number;
  limit?: number;
}

/**
 * Farm search filters
 */
export interface FarmSearchFilters {
  query?: string;
  verified?: boolean;
  hasCertification?: boolean;
  radius?: number; // km from a location
  latitude?: number;
  longitude?: number;
  sortBy?: FarmSortOption;
  page?: number;
  limit?: number;
}

/**
 * Product sorting options
 */
export type ProductSortOption =
  | "NEWEST"
  | "PRICE_LOW_TO_HIGH"
  | "PRICE_HIGH_TO_LOW"
  | "NAME_A_Z"
  | "NAME_Z_A"
  | "POPULAR"
  | "RATING";

/**
 * Farm sorting options
 */
export type FarmSortOption =
  | "NEWEST"
  | "NAME_A_Z"
  | "NAME_Z_A"
  | "RATING"
  | "DISTANCE";

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Search result with highlighting
 */
export interface SearchResult<T> {
  item: T;
  score?: number;
  highlights?: {
    field: string;
    match: string;
  }[];
}

/**
 * Agricultural season awareness
 */
export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

/**
 * Seasonal context for search
 */
export interface SeasonalContext {
  currentSeason: Season;
  recommendedCategories: string[];
  seasonalProducts: string[];
}

/**
 * Price range preset
 */
export interface PriceRangePreset {
  label: string;
  min?: number;
  max?: number;
}

/**
 * Search suggestions
 */
export interface SearchSuggestion {
  type: "PRODUCT" | "FARM" | "CATEGORY";
  label: string;
  value: string;
  metadata?: Record<string, any>;
}

/**
 * Filter option for UI
 */
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
  disabled?: boolean;
}

/**
 * Active filters state
 */
export interface ActiveFilters {
  query?: string;
  categories: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  farms: string[];
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "ALL";
  organic?: boolean;
  seasonal?: boolean;
  sortBy?: ProductSortOption;
}

/**
 * Search API request
 */
export interface SearchProductsRequest {
  filters: ProductSearchFilters;
  includeOutOfStock?: boolean;
  includeMetadata?: boolean;
}

/**
 * Search API response
 */
export interface SearchProductsResponse {
  success: boolean;
  data: PaginatedResponse<any>;
  filters?: {
    availableCategories: FilterOption[];
    availableFarms: FilterOption[];
    priceRange: {
      min: number;
      max: number;
    };
  };
  seasonal?: SeasonalContext;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Search state management
 */
export interface SearchState {
  filters: ActiveFilters;
  isLoading: boolean;
  results: any[];
  meta?: PaginationMeta;
  error?: string;
}

/**
 * Search action types
 */
export type SearchAction =
  | { type: "SET_QUERY"; payload: string }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "TOGGLE_CATEGORY"; payload: string }
  | { type: "SET_PRICE_RANGE"; payload: { min?: number; max?: number } }
  | { type: "SET_FARM"; payload: string }
  | { type: "TOGGLE_FARM"; payload: string }
  | { type: "SET_AVAILABILITY"; payload: "IN_STOCK" | "OUT_OF_STOCK" | "ALL" }
  | { type: "TOGGLE_ORGANIC" }
  | { type: "TOGGLE_SEASONAL" }
  | { type: "SET_SORT"; payload: ProductSortOption }
  | { type: "SET_PAGE"; payload: number }
  | { type: "RESET_FILTERS" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_RESULTS"; payload: { results: any[]; meta: PaginationMeta } }
  | { type: "SET_ERROR"; payload: string };

/**
 * Prisma query builder helper types
 */
export type ProductWhereInput = Prisma.ProductWhereInput;
export type ProductOrderByInput = Prisma.ProductOrderByWithRelationInput;
export type FarmWhereInput = Prisma.FarmWhereInput;
export type FarmOrderByInput = Prisma.FarmOrderByWithRelationInput;

/**
 * Search query builder result
 */
export interface SearchQueryBuilder {
  where: ProductWhereInput;
  orderBy: ProductOrderByInput | ProductOrderByInput[];
  skip: number;
  take: number;
  include?: Prisma.ProductInclude;
}

/**
 * Distance calculation result
 */
export interface DistanceResult {
  farmId: string;
  distance: number; // in kilometers
}

/**
 * Agricultural consciousness metadata
 */
export interface AgriculturalMetadata {
  season: Season;
  consciousness: "DIVINE" | "ENLIGHTENED" | "AWARE";
  biodynamicAlignment: number; // 0-100
  temporalCoherence: boolean;
}
