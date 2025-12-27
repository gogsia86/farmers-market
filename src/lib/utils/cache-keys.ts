/**
 * ⚡ Cache Keys Utility - Divine Cache Key Generation
 *
 * Standardized cache key patterns for the Farmers Market Platform.
 * Ensures consistent, collision-free cache keys across the application.
 *
 * @module cache-keys
 * @category Utils
 * @divine-pattern QUANTUM_CACHE_COHERENCE
 */

// ============================================================================
// CACHE KEY PATTERNS
// ============================================================================

/**
 * Standardized cache key generators for all entities
 *
 * Pattern: `entity:identifier:operation[:context]`
 * Example: `cart:user123:items`, `product:prod456:details`
 *
 * Benefits:
 * - Type-safe key generation
 * - Consistent naming across app
 * - Easy cache invalidation patterns
 * - Collision prevention
 */
export const CacheKeys = {
  // ==========================================================================
  // CART OPERATIONS
  // ==========================================================================
  cart: {
    /**
     * Cache key for user's cart items
     * @example "cart:user123:items"
     */
    items: (userId: string) => `cart:${userId}:items` as const,

    /**
     * Cache key for cart summary/metadata
     * @example "cart:user123:summary"
     */
    summary: (userId: string) => `cart:${userId}:summary` as const,

    /**
     * Cache key for cart item count
     * @example "cart:user123:count"
     */
    count: (userId: string) => `cart:${userId}:count` as const,

    /**
     * Cache key for cart validation state
     * @example "cart:user123:validation"
     */
    validation: (userId: string) => `cart:${userId}:validation` as const,

    /**
     * Cache key for specific cart item
     * @example "cart:user123:item:prod456"
     */
    item: (userId: string, productId: string) =>
      `cart:${userId}:item:${productId}` as const,
  },

  // ==========================================================================
  // FARM OPERATIONS
  // ==========================================================================
  farm: {
    /**
     * Cache key for farm details
     * @example "farm:farm123:details"
     */
    details: (farmId: string) => `farm:${farmId}:details` as const,

    /**
     * Cache key for farm by slug
     * @example "farm:slug:organic-valley-farm"
     */
    bySlug: (slug: string) => `farm:slug:${slug}` as const,

    /**
     * Cache key for paginated farm list
     * @example "farms:list:page:1:limit:20"
     */
    list: (page: number, limit: number) =>
      `farms:list:page:${page}:limit:${limit}` as const,

    /**
     * Cache key for farms by owner
     * @example "farms:owner:user123"
     */
    byOwner: (ownerId: string) => `farms:owner:${ownerId}` as const,

    /**
     * Cache key for farm statistics
     * @example "farm:farm123:stats"
     */
    stats: (farmId: string) => `farm:${farmId}:stats` as const,

    /**
     * Cache key for farm products count
     * @example "farm:farm123:products:count"
     */
    productsCount: (farmId: string) => `farm:${farmId}:products:count` as const,

    /**
     * Cache key for farm verification status
     * @example "farm:farm123:verification"
     */
    verification: (farmId: string) => `farm:${farmId}:verification` as const,

    /**
     * Cache key for seasonal farm data
     * @example "farm:farm123:season:SPRING"
     */
    seasonal: (farmId: string, season: string) =>
      `farm:${farmId}:season:${season}` as const,
  },

  // ==========================================================================
  // PRODUCT OPERATIONS
  // ==========================================================================
  product: {
    /**
     * Cache key for product details
     * @example "product:prod123:details"
     */
    details: (productId: string) => `product:${productId}:details` as const,

    /**
     * Cache key for product by slug
     * @example "product:slug:fresh-tomatoes"
     */
    bySlug: (slug: string) => `product:slug:${slug}` as const,

    /**
     * Cache key for product by farm slug and product slug
     * @example "product:farm:organic-valley:slug:fresh-tomatoes"
     */
    byFarmAndSlug: (farmSlug: string, productSlug: string) =>
      `product:farm:${farmSlug}:slug:${productSlug}` as const,

    /**
     * Cache key for products by farm (paginated)
     * @example "products:farm:farm123:page:1:limit:20"
     */
    byFarm: (farmId: string, page: number, limit: number) =>
      `products:farm:${farmId}:page:${page}:limit:${limit}` as const,

    /**
     * Cache key for product search results
     * @example "products:search:tomato:page:1"
     */
    search: (query: string, page: number) =>
      `products:search:${query}:page:${page}` as const,

    /**
     * Cache key for product inventory
     * @example "product:prod123:inventory"
     */
    inventory: (productId: string) => `product:${productId}:inventory` as const,

    /**
     * Cache key for related products
     * @example "product:prod123:related:limit:5"
     */
    related: (productId: string, limit: number) =>
      `product:${productId}:related:limit:${limit}` as const,

    /**
     * Cache key for seasonal products
     * @example "products:season:SPRING:page:1"
     */
    seasonal: (season: string, page: number) =>
      `products:season:${season}:page:${page}` as const,

    /**
     * Cache key for product categories
     * @example "products:category:vegetables:page:1"
     */
    byCategory: (category: string, page: number) =>
      `products:category:${category}:page:${page}` as const,
  },

  // ==========================================================================
  // ORDER OPERATIONS
  // ==========================================================================
  order: {
    /**
     * Cache key for order details
     * @example "order:order123:details"
     */
    details: (orderId: string) => `order:${orderId}:details` as const,

    /**
     * Cache key for orders by user (paginated)
     * @example "orders:user:user123:page:1:limit:20"
     */
    byUser: (userId: string, page: number, limit: number) =>
      `orders:user:${userId}:page:${page}:limit:${limit}` as const,

    /**
     * Cache key for orders by farm (paginated)
     * @example "orders:farm:farm123:page:1:limit:20"
     */
    byFarm: (farmId: string, page: number, limit: number) =>
      `orders:farm:${farmId}:page:${page}:limit:${limit}` as const,

    /**
     * Cache key for order statistics
     * @example "orders:user:user123:stats"
     */
    userStats: (userId: string) => `orders:user:${userId}:stats` as const,

    /**
     * Cache key for farm order statistics
     * @example "orders:farm:farm123:stats"
     */
    farmStats: (farmId: string) => `orders:farm:${farmId}:stats` as const,

    /**
     * Cache key for order status
     * @example "order:order123:status"
     */
    status: (orderId: string) => `order:${orderId}:status` as const,

    /**
     * Cache key for recent orders
     * @example "orders:recent:limit:10"
     */
    recent: (limit: number) => `orders:recent:limit:${limit}` as const,

    /**
     * Cache key for orders by date range
     * @example "orders:farm:farm123:range:2024-01-01:2024-12-31"
     */
    byDateRange: (farmId: string, startDate: string, endDate: string) =>
      `orders:farm:${farmId}:range:${startDate}:${endDate}` as const,
  },

  // ==========================================================================
  // USER OPERATIONS
  // ==========================================================================
  user: {
    /**
     * Cache key for user profile
     * @example "user:user123:profile"
     */
    profile: (userId: string) => `user:${userId}:profile` as const,

    /**
     * Cache key for user preferences
     * @example "user:user123:preferences"
     */
    preferences: (userId: string) => `user:${userId}:preferences` as const,

    /**
     * Cache key for user addresses
     * @example "user:user123:addresses"
     */
    addresses: (userId: string) => `user:${userId}:addresses` as const,

    /**
     * Cache key for user by email
     * @example "user:email:john@example.com"
     */
    byEmail: (email: string) => `user:email:${email}` as const,

    /**
     * Cache key for user favorites
     * @example "user:user123:favorites"
     */
    favorites: (userId: string) => `user:${userId}:favorites` as const,
  },

  // ==========================================================================
  // CHECKOUT OPERATIONS
  // ==========================================================================
  checkout: {
    /**
     * Cache key for checkout session
     * @example "checkout:session:sess123"
     */
    session: (sessionId: string) => `checkout:session:${sessionId}` as const,

    /**
     * Cache key for checkout validation
     * @example "checkout:user:user123:validation"
     */
    validation: (userId: string) =>
      `checkout:user:${userId}:validation` as const,

    /**
     * Cache key for shipping options
     * @example "checkout:shipping:user123"
     */
    shippingOptions: (userId: string) => `checkout:shipping:${userId}` as const,

    /**
     * Cache key for payment methods
     * @example "checkout:payment:user123"
     */
    paymentMethods: (userId: string) => `checkout:payment:${userId}` as const,
  },

  // ==========================================================================
  // PAYMENT OPERATIONS
  // ==========================================================================
  payment: {
    /**
     * Cache key for payment intent
     * @example "payment:intent:pi_123"
     */
    intent: (intentId: string) => `payment:intent:${intentId}` as const,

    /**
     * Cache key for payment methods
     * @example "payment:user:user123:methods"
     */
    methods: (userId: string) => `payment:user:${userId}:methods` as const,

    /**
     * Cache key for payment history
     * @example "payment:user:user123:history"
     */
    history: (userId: string) => `payment:user:${userId}:history` as const,
  },

  // ==========================================================================
  // GEOCODING & LOCATION OPERATIONS
  // ==========================================================================
  location: {
    /**
     * Cache key for geocoded address
     * @example "location:geocode:1234+Main+St"
     */
    geocode: (address: string) =>
      `location:geocode:${encodeURIComponent(address)}` as const,

    /**
     * Cache key for reverse geocode
     * @example "location:reverse:40.7128:-74.0060"
     */
    reverseGeocode: (lat: number, lng: number) =>
      `location:reverse:${lat}:${lng}` as const,

    /**
     * Cache key for nearby farms
     * @example "location:nearby:40.7128:-74.0060:radius:10"
     */
    nearbyFarms: (lat: number, lng: number, radiusKm: number) =>
      `location:nearby:${lat}:${lng}:radius:${radiusKm}` as const,
  },

  // ==========================================================================
  // AGRICULTURAL & SEASONAL OPERATIONS
  // ==========================================================================
  agricultural: {
    /**
     * Cache key for seasonal data
     * @example "agricultural:season:SPRING:data"
     */
    seasonalData: (season: string) =>
      `agricultural:season:${season}:data` as const,

    /**
     * Cache key for planting calendar
     * @example "agricultural:planting:calendar:2024"
     */
    plantingCalendar: (year: number) =>
      `agricultural:planting:calendar:${year}` as const,

    /**
     * Cache key for harvest schedule
     * @example "agricultural:harvest:farm123:season:FALL"
     */
    harvestSchedule: (farmId: string, season: string) =>
      `agricultural:harvest:${farmId}:season:${season}` as const,
  },

  // ==========================================================================
  // ANALYTICS & REPORTING
  // ==========================================================================
  analytics: {
    /**
     * Cache key for farm analytics
     * @example "analytics:farm:farm123:range:2024-01-01:2024-12-31"
     */
    farmMetrics: (farmId: string, startDate: string, endDate: string) =>
      `analytics:farm:${farmId}:range:${startDate}:${endDate}` as const,

    /**
     * Cache key for product performance
     * @example "analytics:product:prod123:period:30d"
     */
    productPerformance: (productId: string, period: string) =>
      `analytics:product:${productId}:period:${period}` as const,

    /**
     * Cache key for dashboard summary
     * @example "analytics:dashboard:farm123:summary"
     */
    dashboardSummary: (farmId: string) =>
      `analytics:dashboard:${farmId}:summary` as const,
  },
} as const;

// ============================================================================
// CACHE INVALIDATION PATTERNS
// ============================================================================

/**
 * Pattern generators for bulk cache invalidation
 */
export const CachePatterns = {
  /**
   * Pattern to invalidate all cart caches for a user
   * @example "cart:user123:*"
   */
  allUserCart: (userId: string) => `cart:${userId}:*`,

  /**
   * Pattern to invalidate all farm caches
   * @example "farm:farm123:*"
   */
  allFarmData: (farmId: string) => `farm:${farmId}:*`,

  /**
   * Pattern to invalidate all product caches for a farm
   * @example "products:farm:farm123:*"
   */
  allFarmProducts: (farmId: string) => `products:farm:${farmId}:*`,

  /**
   * Pattern to invalidate all order caches for a user
   * @example "orders:user:user123:*"
   */
  allUserOrders: (userId: string) => `orders:user:${userId}:*`,

  /**
   * Pattern to invalidate all order caches for a farm
   * @example "orders:farm:farm123:*"
   */
  allFarmOrders: (farmId: string) => `orders:farm:${farmId}:*`,

  /**
   * Pattern to invalidate all product caches
   * @example "product:prod123:*"
   */
  allProductData: (productId: string) => `product:${productId}:*`,
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Type helper to extract function types from nested cache key objects
 */
type ExtractCacheKeyFunctions<T> = T extends (...args: any[]) => any
  ? ReturnType<T>
  : T extends Record<string, any>
    ? {
        [K in keyof T]: T[K] extends (...args: any[]) => any
          ? ReturnType<T[K]>
          : never;
      }[keyof T]
    : never;

/**
 * Type for all valid cache keys
 */
export type CacheKey = ExtractCacheKeyFunctions<
  (typeof CacheKeys)[keyof typeof CacheKeys]
>;

/**
 * Type for cache invalidation patterns
 */
export type CachePattern = ReturnType<
  (typeof CachePatterns)[keyof typeof CachePatterns]
>;
