/**
 * 🌾 DIVINE AGRICULTURAL QUERY KEY FACTORY
 *
 * Centralized query key management with:
 * - Type-safe key generation
 * - Hierarchical key structure
 * - Cache invalidation helpers
 * - Agricultural consciousness
 *
 * @module QueryKeys
 */

// ============================================================================
// TYPE DEFINITIONS - DIVINE TYPE SAFETY
// ============================================================================

/**
 * Base query key structure
 */
export type QueryKey = readonly [string, ...any[]];

/**
 * Query key factory type
 */
export type QueryKeyFactory<T = any> = {
  all: QueryKey;
  lists: () => QueryKey;
  list: (filters?: T) => QueryKey;
  details: () => QueryKey;
  detail: (id: string) => QueryKey;
};

/**
 * Product search filters
 */
export interface ProductSearchFilters {
  query?: string;
  categoryId?: string;
  farmId?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "ALL";
  organic?: boolean;
  seasonal?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}

/**
 * Farm filters
 */
export interface FarmFilters {
  ownerId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Order filters
 */
export interface OrderFilters {
  status?: string;
  userId?: string;
  farmId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// QUERY KEY FACTORIES - HIERARCHICAL STRUCTURE
// ============================================================================

/**
 * Product query keys
 *
 * Hierarchy:
 * - products.all → ["products"]
 * - products.lists() → ["products", "list"]
 * - products.list(filters) → ["products", "list", filters]
 * - products.details() → ["products", "detail"]
 * - products.detail(id) → ["products", "detail", id]
 */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: ProductSearchFilters) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (query: string, filters?: ProductSearchFilters) =>
    [...productKeys.all, "search", query, filters] as const,
  suggestions: (query: string) =>
    [...productKeys.all, "suggestions", query] as const,
  featured: () => [...productKeys.all, "featured"] as const,
  seasonal: (season: string) =>
    [...productKeys.all, "seasonal", season] as const,
  byFarm: (farmId: string) => [...productKeys.all, "by-farm", farmId] as const,
  byCategory: (categoryId: string) =>
    [...productKeys.all, "by-category", categoryId] as const,
};

/**
 * Farm query keys
 */
export const farmKeys = {
  all: ["farms"] as const,
  lists: () => [...farmKeys.all, "list"] as const,
  list: (filters?: FarmFilters) => [...farmKeys.lists(), filters] as const,
  details: () => [...farmKeys.all, "detail"] as const,
  detail: (id: string) => [...farmKeys.details(), id] as const,
  byOwner: (ownerId: string) => [...farmKeys.all, "by-owner", ownerId] as const,
  products: (farmId: string) => [...farmKeys.all, "products", farmId] as const,
  stats: (farmId: string) => [...farmKeys.all, "stats", farmId] as const,
  nearby: (lat: number, lng: number, radius: number) =>
    [...farmKeys.all, "nearby", { lat, lng, radius }] as const,
};

/**
 * Category query keys
 */
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  withCounts: () => [...categoryKeys.all, "with-counts"] as const,
  seasonal: (season: string) =>
    [...categoryKeys.all, "seasonal", season] as const,
};

/**
 * Order query keys
 */
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters?: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  byUser: (userId: string) => [...orderKeys.all, "by-user", userId] as const,
  byFarm: (farmId: string) => [...orderKeys.all, "by-farm", farmId] as const,
  stats: (userId: string) => [...orderKeys.all, "stats", userId] as const,
  recent: (limit: number) => [...orderKeys.all, "recent", limit] as const,
};

/**
 * Cart query keys
 */
export const cartKeys = {
  all: ["cart"] as const,
  items: () => [...cartKeys.all, "items"] as const,
  count: () => [...cartKeys.all, "count"] as const,
  total: () => [...cartKeys.all, "total"] as const,
};

/**
 * User query keys
 */
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: () => [...userKeys.lists()] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: (id: string) => [...userKeys.all, "profile", id] as const,
  preferences: (id: string) => [...userKeys.all, "preferences", id] as const,
  addresses: (id: string) => [...userKeys.all, "addresses", id] as const,
  favorites: (userId: string) =>
    [...userKeys.all, "favorites", userId] as const,
};

/**
 * Review query keys
 */
export const reviewKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewKeys.all, "list"] as const,
  list: (filters?: { productId?: string; farmId?: string }) =>
    [...reviewKeys.lists(), filters] as const,
  details: () => [...reviewKeys.all, "detail"] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
  byProduct: (productId: string) =>
    [...reviewKeys.all, "by-product", productId] as const,
  byFarm: (farmId: string) => [...reviewKeys.all, "by-farm", farmId] as const,
  byUser: (userId: string) => [...reviewKeys.all, "by-user", userId] as const,
  stats: (entityId: string, entityType: "PRODUCT" | "FARM") =>
    [...reviewKeys.all, "stats", entityType, entityId] as const,
};

/**
 * Search history query keys
 */
export const searchHistoryKeys = {
  all: ["search-history"] as const,
  recent: (userId: string, limit: number) =>
    [...searchHistoryKeys.all, "recent", userId, limit] as const,
  popular: (limit: number) =>
    [...searchHistoryKeys.all, "popular", limit] as const,
};

/**
 * Saved searches query keys
 */
export const savedSearchKeys = {
  all: ["saved-searches"] as const,
  lists: () => [...savedSearchKeys.all, "list"] as const,
  list: (filters?: {
    folderId?: string;
    tags?: string[];
    seasonalPreference?: string;
    isPublic?: boolean;
  }) => [...savedSearchKeys.all, "list", filters] as const,
  byUser: (userId: string) =>
    [...savedSearchKeys.all, "by-user", userId] as const,
  details: () => [...savedSearchKeys.all, "detail"] as const,
  detail: (id: string) => [...savedSearchKeys.all, "detail", id] as const,
  execute: (id: string, params?: { limit?: number; offset?: number }) =>
    [...savedSearchKeys.all, "execute", id, params] as const,
  stats: (userId: string) => [...savedSearchKeys.all, "stats", userId] as const,
  folders: (userId: string) =>
    [...savedSearchKeys.all, "folders", userId] as const,
  shared: (token: string) => [...savedSearchKeys.all, "shared", token] as const,
};

/**
 * Analytics query keys
 */
export const analyticsKeys = {
  all: ["analytics"] as const,
  pageViews: (params: { startDate?: string; endDate?: string }) =>
    [...analyticsKeys.all, "page-views", params] as const,
  searchMetrics: (params: { startDate?: string; endDate?: string }) =>
    [...analyticsKeys.all, "search-metrics", params] as const,
  productPerformance: (productId: string) =>
    [...analyticsKeys.all, "product-performance", productId] as const,
  farmPerformance: (farmId: string) =>
    [...analyticsKeys.all, "farm-performance", farmId] as const,
};

/**
 * Notification query keys
 */
export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (userId: string, filters?: { unreadOnly?: boolean }) =>
    [...notificationKeys.lists(), userId, filters] as const,
  unreadCount: (userId: string) =>
    [...notificationKeys.all, "unread-count", userId] as const,
};

// ============================================================================
// CACHE INVALIDATION HELPERS - DIVINE CACHE MANAGEMENT
// ============================================================================

/**
 * Get all query keys that should be invalidated when a product changes
 *
 * @example
 * ```ts
 * // After creating/updating a product
 * await queryClient.invalidateQueries({ queryKey: productKeys.all });
 * ```
 */
export function getProductInvalidationKeys(productId?: string): QueryKey[] {
  const keys: QueryKey[] = [
    productKeys.all,
    productKeys.lists(),
    productKeys.featured(),
  ];

  if (productId) {
    keys.push(productKeys.detail(productId));
  }

  return keys;
}

/**
 * Get all query keys that should be invalidated when a farm changes
 */
export function getFarmInvalidationKeys(farmId?: string): QueryKey[] {
  const keys: QueryKey[] = [farmKeys.all, farmKeys.lists()];

  if (farmId) {
    keys.push(farmKeys.detail(farmId));
    keys.push(farmKeys.products(farmId));
    keys.push(farmKeys.stats(farmId));
  }

  return keys;
}

/**
 * Get all query keys that should be invalidated when an order changes
 */
export function getOrderInvalidationKeys(
  orderId?: string,
  userId?: string,
  farmId?: string,
): QueryKey[] {
  const keys: QueryKey[] = [orderKeys.all, orderKeys.lists()];

  if (orderId) {
    keys.push(orderKeys.detail(orderId));
  }

  if (userId) {
    keys.push(orderKeys.byUser(userId));
    keys.push(orderKeys.stats(userId));
  }

  if (farmId) {
    keys.push(orderKeys.byFarm(farmId));
  }

  return keys;
}

/**
 * Get all query keys that should be invalidated when a review changes
 */
export function getReviewInvalidationKeys(
  reviewId?: string,
  productId?: string,
  farmId?: string,
  userId?: string,
): QueryKey[] {
  const keys: QueryKey[] = [reviewKeys.all, reviewKeys.lists()];

  if (reviewId) {
    keys.push(reviewKeys.detail(reviewId));
  }

  if (productId) {
    keys.push(reviewKeys.byProduct(productId));
    keys.push(reviewKeys.stats(productId, "PRODUCT"));
    keys.push(productKeys.detail(productId)); // Product rating might change
  }

  if (farmId) {
    keys.push(reviewKeys.byFarm(farmId));
    keys.push(reviewKeys.stats(farmId, "FARM"));
    keys.push(farmKeys.detail(farmId)); // Farm rating might change
  }

  if (userId) {
    keys.push(reviewKeys.byUser(userId));
  }

  return keys;
}

/**
 * Get all query keys that should be invalidated when cart changes
 */
export function getCartInvalidationKeys(): QueryKey[] {
  return [cartKeys.all, cartKeys.items(), cartKeys.count(), cartKeys.total()];
}

// ============================================================================
// PREFETCH HELPERS - QUANTUM OPTIMIZATION
// ============================================================================

/**
 * Get keys to prefetch for product detail page
 */
export function getProductDetailPrefetchKeys(productId: string): QueryKey[] {
  return [
    productKeys.detail(productId),
    reviewKeys.byProduct(productId),
    reviewKeys.stats(productId, "PRODUCT"),
  ];
}

/**
 * Get keys to prefetch for farm detail page
 */
export function getFarmDetailPrefetchKeys(farmId: string): QueryKey[] {
  return [
    farmKeys.detail(farmId),
    farmKeys.products(farmId),
    farmKeys.stats(farmId),
    reviewKeys.byFarm(farmId),
    reviewKeys.stats(farmId, "FARM"),
  ];
}

/**
 * Get keys to prefetch for search page
 */
export function getSearchPagePrefetchKeys(): QueryKey[] {
  return [categoryKeys.withCounts(), farmKeys.lists(), productKeys.featured()];
}

// ============================================================================
// UTILITY FUNCTIONS - DIVINE HELPERS
// ============================================================================

/**
 * Check if a query key matches a pattern
 *
 * @example
 * ```ts
 * const matches = matchesQueryKey(
 *   ["products", "detail", "123"],
 *   productKeys.details()
 * );
 * // Returns: true
 * ```
 */
export function matchesQueryKey(key: QueryKey, pattern: QueryKey): boolean {
  if (pattern.length > key.length) {
    return false;
  }

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] !== key[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Export all query keys for convenience
 */
export const queryKeys = {
  products: productKeys,
  farms: farmKeys,
  categories: categoryKeys,
  orders: orderKeys,
  cart: cartKeys,
  users: userKeys,
  reviews: reviewKeys,
  searchHistory: searchHistoryKeys,
  savedSearches: savedSearchKeys,
  analytics: analyticsKeys,
  notifications: notificationKeys,
} as const;

/**
 * Export invalidation helpers
 */
export const invalidationHelpers = {
  product: getProductInvalidationKeys,
  farm: getFarmInvalidationKeys,
  order: getOrderInvalidationKeys,
  review: getReviewInvalidationKeys,
  cart: getCartInvalidationKeys,
} as const;

/**
 * Export prefetch helpers
 */
export const prefetchHelpers = {
  productDetail: getProductDetailPrefetchKeys,
  farmDetail: getFarmDetailPrefetchKeys,
  searchPage: getSearchPagePrefetchKeys,
} as const;
