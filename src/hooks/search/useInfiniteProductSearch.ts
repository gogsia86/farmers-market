"use client";

import {
  useInfiniteQuery,
  useQueryClient,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useCallback, useMemo, useEffect } from "react";
import { productKeys } from "@/lib/react-query/query-keys";
import type { ProductSearchFilters } from "@/lib/react-query/query-keys";
import type { Product, ProductSearchResponse } from "./useProductSearch";

/**
 * 🌾 DIVINE AGRICULTURAL INFINITE SCROLL HOOK
 *
 * Infinite scroll product search with:
 * - Automatic page loading on scroll
 * - Background refetching
 * - Optimistic updates
 * - Agricultural consciousness
 * - Memory-efficient caching (HP OMEN: 64GB RAM)
 *
 * @module useInfiniteProductSearch
 */

// ============================================================================
// TYPE DEFINITIONS - DIVINE TYPE SAFETY
// ============================================================================

/**
 * Infinite query page param
 */
interface PageParam {
  page: number;
}

/**
 * Hook return type
 */
export interface UseInfiniteProductSearchReturn {
  // Query state
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;

  // Actions
  fetchNextPage: () => void;
  refetch: () => void;

  // Metadata
  totalItems: number;
  totalPages: number;
  currentPage: number;

  // Helpers
  isEmpty: boolean;
  hasResults: boolean;
}

// ============================================================================
// API FUNCTIONS - QUANTUM FETCH OPERATIONS
// ============================================================================

/**
 * Fetch products page for infinite scroll
 */
async function fetchProductsPage(
  filters: ProductSearchFilters,
  pageParam: number = 1,
): Promise<ProductSearchResponse> {
  const params = new URLSearchParams();

  if (filters.query) params.append("q", filters.query);
  if (filters.categoryId) params.append("category", filters.categoryId);
  if (filters.farmId) params.append("farm", filters.farmId);
  if (filters.minPrice !== undefined)
    params.append("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.append("maxPrice", String(filters.maxPrice));
  if (filters.availability) params.append("availability", filters.availability);
  if (filters.organic !== undefined)
    params.append("organic", String(filters.organic));
  if (filters.seasonal !== undefined)
    params.append("seasonal", String(filters.seasonal));
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.limit) params.append("limit", String(filters.limit));

  // Always use pageParam for infinite scroll
  params.append("page", String(pageParam));

  const response = await fetch(`/api/search/products?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Product search failed: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// MAIN HOOK - DIVINE INFINITE SCROLL
// ============================================================================

/**
 * Divine Infinite Scroll Product Search Hook
 *
 * Features:
 * - Automatic page loading
 * - Smooth infinite scroll experience
 * - Memory-efficient caching
 * - Background refetching
 * - Agricultural consciousness
 *
 * @example
 * ```tsx
 * function InfiniteProductList() {
 *   const [filters, setFilters] = useState({ limit: 20 });
 *   const {
 *     products,
 *     isLoading,
 *     hasNextPage,
 *     fetchNextPage,
 *     isFetchingNextPage
 *   } = useInfiniteProductSearch(filters);
 *
 *   // Intersection Observer for auto-loading
 *   const observerRef = useRef<IntersectionObserver>();
 *   const lastElementRef = useCallback((node: HTMLElement) => {
 *     if (isFetchingNextPage) return;
 *     if (observerRef.current) observerRef.current.disconnect();
 *
 *     observerRef.current = new IntersectionObserver((entries) => {
 *       if (entries[0].isIntersecting && hasNextPage) {
 *         fetchNextPage();
 *       }
 *     });
 *
 *     if (node) observerRef.current.observe(node);
 *   }, [isFetchingNextPage, hasNextPage, fetchNextPage]);
 *
 *   return (
 *     <div>
 *       {products.map((product, index) => (
 *         <ProductCard
 *           key={product.id}
 *           product={product}
 *           ref={index === products.length - 1 ? lastElementRef : null}
 *         />
 *       ))}
 *       {isFetchingNextPage && <ProductCardSkeleton />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteProductSearch(
  filters: ProductSearchFilters = {},
): UseInfiniteProductSearchReturn {
  const queryClient = useQueryClient();

  // Ensure limit is set for infinite scroll (default: 20)
  const normalizedFilters = useMemo(
    () => ({
      ...filters,
      limit: filters.limit || 20,
    }),
    [filters],
  );

  // Infinite query for products
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage: fetchNext,
    refetch,
  } = useInfiniteQuery({
    queryKey: [...productKeys.list(normalizedFilters), "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      fetchProductsPage(normalizedFilters, pageParam),
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasNextPage) {
        return undefined;
      }
      return lastPage.meta.currentPage + 1;
    },
    initialPageParam: 1,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Flatten all pages into single product array
  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  // Get metadata from last page
  const lastPage = useMemo(
    () => data?.pages[data.pages.length - 1],
    [data?.pages],
  );

  const totalItems = useMemo(() => lastPage?.meta.totalItems ?? 0, [lastPage]);
  const totalPages = useMemo(() => lastPage?.meta.totalPages ?? 0, [lastPage]);
  const currentPage = useMemo(
    () => lastPage?.meta.currentPage ?? 1,
    [lastPage],
  );

  // Computed values
  const isEmpty = useMemo(
    () => products.length === 0 && !isLoading,
    [products, isLoading],
  );
  const hasResults = useMemo(() => products.length > 0, [products]);

  // Fetch next page wrapper
  const fetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNext();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNext]);

  return {
    // Query state
    products,
    isLoading,
    isError,
    error: error as Error | null,
    isFetching,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,

    // Actions
    fetchNextPage,
    refetch: () => {
      refetch();
    },

    // Metadata
    totalItems,
    totalPages,
    currentPage,

    // Helpers
    isEmpty,
    hasResults,
  };
}

// ============================================================================
// INTERSECTION OBSERVER HOOK - AUTO-LOAD ON SCROLL
// ============================================================================

/**
 * Hook to automatically trigger infinite scroll using Intersection Observer
 *
 * @example
 * ```tsx
 * function InfiniteProductList() {
 *   const {
 *     products,
 *     hasNextPage,
 *     fetchNextPage,
 *     isFetchingNextPage
 *   } = useInfiniteProductSearch(filters);
 *
 *   const { lastElementRef } = useInfiniteScroll({
 *     hasNextPage,
 *     fetchNextPage,
 *     isFetchingNextPage
 *   });
 *
 *   return (
 *     <div>
 *       {products.map((product, index) => (
 *         <div
 *           key={product.id}
 *           ref={index === products.length - 1 ? lastElementRef : null}
 *         >
 *           <ProductCard product={product} />
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteScroll({
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  threshold = 0.5,
  rootMargin = "100px",
}: {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  threshold?: number;
  rootMargin?: string;
}) {
  const observerRef = useMemo<IntersectionObserver | null>(() => null, []);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isFetchingNextPage) return;

      // Disconnect previous observer
      if (observerRef) {
        observerRef.disconnect();
      }

      // Create new observer
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        },
        {
          threshold,
          rootMargin,
        },
      );

      // Observe new element
      if (node) {
        observer.observe(node);
      }

      return () => {
        observer.disconnect();
      };
    },
    [
      isFetchingNextPage,
      hasNextPage,
      fetchNextPage,
      threshold,
      rootMargin,
      observerRef,
    ],
  );

  return {
    lastElementRef,
  };
}

// ============================================================================
// SPECIALIZED INFINITE SCROLL HOOKS
// ============================================================================

/**
 * Infinite scroll for featured products
 */
export function useInfiniteFeaturedProducts(limit: number = 20) {
  return useInfiniteProductSearch({
    sortBy: "featured",
    limit,
    availability: "IN_STOCK",
  });
}

/**
 * Infinite scroll for seasonal products
 */
export function useInfiniteSeasonalProducts(limit: number = 20) {
  return useInfiniteProductSearch({
    seasonal: true,
    limit,
    availability: "IN_STOCK",
    sortBy: "newest",
  });
}

/**
 * Infinite scroll for products by category
 */
export function useInfiniteProductsByCategory(
  categoryId: string,
  limit: number = 20,
) {
  return useInfiniteProductSearch({
    categoryId,
    limit,
  });
}

/**
 * Infinite scroll for products by farm
 */
export function useInfiniteProductsByFarm(farmId: string, limit: number = 20) {
  return useInfiniteProductSearch({
    farmId,
    limit,
  });
}
