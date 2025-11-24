/**
 * FARM API TYPES - Divine Type Definitions
 * Complete type safety for farm operations
 */

import type { Farm, User, FarmStatus } from "@prisma/client";

/**
 * QUANTUM FARM WITH RELATIONS
 * Complete farm entity with all relationships
 */
export interface QuantumFarm extends Farm {
  owner: Pick<User, "id" | "name" | "email">;
  _count: {
    products: number;
    orders: number;
  };
}

/**
 * CREATE FARM REQUEST
 * Input validation for farm creation
 */
export interface CreateFarmRequest {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  ownerId: string;
  email: string;
  phone: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  certifications?: string[];
  images?: string[];
}

/**
 * UPDATE FARM REQUEST
 * Input validation for farm updates
 */
export interface UpdateFarmRequest {
  name?: string;
  description?: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  certifications?: string[];
  images?: string[];
  status?: FarmStatus;
}

/**
 * FARM FILTERS
 * Query parameters for farm search and filtering
 */
export interface FarmFilters {
  status?: FarmStatus;
  ownerId?: string;
  searchTerm?: string;
  certified?: boolean;
  hasProducts?: boolean;
  organic?: boolean;
}

/**
 * FARM STATISTICS
 * Aggregated metrics for farm consciousness
 */
export interface FarmStatistics {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  inactive: number;
  averageProducts: number;
  totalProducts: number;
}

/**
 * PAGINATED FARM RESPONSE
 * Response format for farm lists
 */
export interface PaginatedFarmResponse {
  farms: QuantumFarm[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  statistics?: FarmStatistics;
}

/**
 * FARM VALIDATION ERROR
 * Structured validation error details
 */
export interface FarmValidationError {
  field: string;
  message: string;
  value?: any;
}
