"use client";

import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { productKeys } from "@/lib/react-query/query-keys";
import type { ProductSearchFilters } from "@/lib/react-query/query-keys";

/**
 * 🌾 DIVINE AGRICULTURAL PRODUCT SEARCH HOOK
 *
 * React Query powered product search with:
 * - Automatic caching and deduplication
 * - Background refetching
 * - Optimistic updates
 * - Agricultural consciousness
 * - Seasonal awareness
 *
 * @module useProductSearch
 */

// ============================================================================
// TYPE DEFINITIONS - DIVINE TYPE SAFETY
// ============================================================================

/**
 * Product search response from API
 */
export interface ProductSearchResponse {
  success: boolean;
  data: Product[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    availableCategories: Array<{ id: string; name: string; _count: number }>;
    availableFarms: Array<{ id: string; name: string; _count: number }>;
    priceRange: { min: number; max: number };
  };
  seasonal?: {
    currentSeason: string;
    recommendedCategories: string[];
    seasonalProducts: number;
  };
}

/**
 * Product entity (simplified - extend based on your schema)
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  category: {
    id: string;
    name: string;
  } | null;
  farm: {
    id: string;
    name: string;
    slug: string;
  };
  organic: boolean;
  seasonal: boolean;
  createdAt: string;
}

/**
 * Hook return type
 */
export interface UseProductSearchReturn {
  // Query state
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;

  // Metadata
  meta: ProductSearchResponse["meta"] | null;
  filters: ProductSearchResponse["filters"] | null;
  seasonal: ProductSearchResponse["seasonal"] | null;

  // Actions
  refetch: () => void;
  prefetchNextPage: () => Promise<void>;

  // Helpers
  isEmpty: boolean;
  hasResults: boolean;
}

// ============================================================================
// API FUNCTIONS - QUANTUM FETCH OPERATIONS
// ============================================================================

/**
 * Fetch products with search filters
 */
async function fetchProducts(
  filters: ProductSearchFilters
): Promise<ProductSearchResponse> {
  // Build query parameters
  const params = new URLSearchParams();

  if (filters.query) params.append("q", filters.query);
  if (filters.categoryId) params.append("category", filters.categoryId);
  if (filters.farmId) params.append("farm", filters.farmId);
  if (filters.minPrice !== undefined) params.append("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.append("maxPrice", String(filters.maxPrice));
  if (filters.availability) params.append("availability", filters.availability);
  if (filters.organic !== undefined) params.append("organic", String(filters.organic));
  if (filters.seasonal !== undefined) params.append("seasonal", String(filters.seasonal));
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));

  const response = await fetch(`/api/search/products?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Product search failed: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// MAIN HOOK - DIVINE PRODUCT SEARCH
// ============================================================================

/**
 * Divine Product Search Hook with React Query
 *
 * Features:
 * - Automatic caching and background refetching
 * - Query deduplication across components
 * - Optimistic updates
 * - Prefetching for next page
 * - Agricultural consciousness
 *
 * @example
 * ```tsx
 * function ProductSearchPage() {
 *   const [filters, setFilters] = useState({ page: 1, limit: 12 });
 *
 *   const {
 *     products,
 *     isLoading,
 *     meta,
 *     prefetchNextPage
 *   } = useProductSearch(filters);
 *
 *   return (
 *     <div>
 *       {isLoading ? (
 *         <ProductGridSkeleton />
 *       ) : (
 *         <ProductGrid products={products} />
 *       )}
 *
 *       <Pagination
 *         meta={meta}
 *         onPageChange={(page) => setFilters({ ...filters, page })}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useProductSearch(
  filters: ProductSearchFilters = {}
): UseProductSearchReturn {
  const queryClient = useQueryClient();

  // Query for products
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    staleTime: 60 * 1000, // 1 minute - products don't change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes - cache for quick navigation
    refetchOnWindowFocus: false, // Don't refetch on window focus for search
    retry: 2,
  });

  // Prefetch next page for smooth pagination
  const prefetchNextPage = useCallback(async () => {
    if (!data?.meta || !data.meta.hasNextPage) {
      return;
    }

    const nextPageFilters = {
      ...filters,
      page: data.meta.currentPage + 1,
    };

    await queryClient.prefetchQuery({
      queryKey: productKeys.list(nextPageFilters),
      queryFn: () => fetchProducts(nextPageFilters),
      staleTime: 60 * 1000,
    });
  }, [data?.meta, filters, queryClient]);

  // Computed values
  const products = useMemo(() => data?.data ?? [], [data]);
  const isEmpty = useMemo(() => products.length === 0 && !isLoading, [products, isLoading]);
  const hasResults = useMemo(() => products.length > 0, [products]);

  return {
    // Query state
    products,
    isLoading,
    isError,
    error: error as Error | null,
    isFetching,

    // Metadata
    meta: data?.meta ?? null,
    filters: data?.filters ?? null,
    seasonal: data?.seasonal ?? null,

    // Actions
    refetch: () => {
      refetch();
    },
    prefetchNextPage,

    // Helpers
    isEmpty,
    hasResults,
  };
}

// ============================================================================
// ADDITIONAL HOOKS - SPECIALIZED SEARCH
// ============================================================================

/**
 * Hook for featured products
 *
 * @example
 * ```tsx
 * function FeaturedSection() {
 *   const { products, isLoading } = useFeaturedProducts();
 *
 *   return (
 *     <section>
 *       <h2>Featured Products</h2>
 *       <ProductGrid products={products} />
 *     </section>
 *   );
 * }
 * ```
 */
export function useFeaturedProducts(limit: number = 8) {
  return useProductSearch({
    sortBy: "featured",
    limit,
    availability: "IN_STOCK",
  });
}

/**
 * Hook for seasonal products
 *
 * @example
 * ```tsx
 * function SeasonalSection() {
 *   const { products, seasonal } = useSeasonalProducts();
 *
 *   return (
 *     <section>
 *       <h2>Fresh This {seasonal?.currentSeason}</h2>
 *       <ProductGrid products={products} />
 *     </section>
 *   );
 * }
 * ```
 */
export function useSeasonalProducts(limit: number = 12) {
  return useProductSearch({
    seasonal: true,
    limit,
    availability: "IN_STOCK",
    sortBy: "newest",
  });
}

/**
 * Hook for organic products
 */
export function useOrganicProducts(limit: number = 12) {
  return useProductSearch({
    organic: true,
    limit,
    availability: "IN_STOCK",
  });
}

/**
 * Hook for products by category
 */
export function useProductsByCategory(
  categoryId: string,
  additionalFilters?: Partial<ProductSearchFilters>
) {
  return useProductSearch({
    categoryId,
    ...additionalFilters,
  });
}

/**
 * Hook for products by farm
 */
export function useProductsByFarm(
  farmId: string,
  additionalFilters?: Partial<ProductSearchFilters>
) {
  return useProductSearch({
    farmId,
    ...additionalFilters,
  });
}
