/**
 * 🎯 CORE ENTITY TYPES - SINGLE SOURCE OF TRUTH
 *
 * This file is the ONLY place where core domain entity types are defined.
 * All other files MUST import types from here or directly from @prisma/client.
 *
 * RULE: NEVER define duplicate types elsewhere!
 *
 * Divine Patterns Applied:
 * - Single Source of Truth Principle
 * - Type Safety with Prisma Integration
 * - Agricultural Domain Consciousness
 *
 * Architecture:
 * 1. Prisma Types (Base Layer) - Direct from schema
 * 2. Extended Types (Business Layer) - Prisma + computed fields
 * 3. View Models (Presentation Layer) - UI-optimized types
 * 4. API Types (Transport Layer) - Request/response shapes
 *
 * @reference .github/instructions/01_DIVINE_CORE_PRINCIPLES.instructions.md
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 */

// ============================================================================
// PRISMA BASE TYPES - SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Import ALL base types from Prisma schema
 * These are auto-generated and always in sync with database
 */
export type {
  // Core Entities
  User,
  Farm,
  Product,
  Order,
  OrderItem,
  Review,
  Notification,
  UserAddress,

  // Supporting Entities
  CartItem,
  Favorite,

  // Enums
  UserRole,
  FarmStatus,
  ProductCategory,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  FulfillmentMethod,
  NotificationType,

  // Prisma helpers
  Prisma,
} from "@prisma/client";

// Re-import for internal use
import type {
  User as PrismaUser,
  Farm as PrismaFarm,
  Product as PrismaProduct,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  Review as PrismaReview,
  UserAddress as PrismaUserAddress,
  CartItem as PrismaCartItem,
  Notification as PrismaNotification,
  UserRole,
  FarmStatus,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  FulfillmentMethod,
} from "@prisma/client";

// ============================================================================
// EXTENDED TYPES - BASE + COMPUTED FIELDS
// ============================================================================

/**
 * User with computed/derived fields and relations
 * Use this for full user data with all relationships
 */
export interface UserWithRelations extends PrismaUser {
  // Computed fields
  displayName: string; // firstName + lastName or email
  initials: string; // First letter of first and last name
  isVerified: boolean; // emailVerified && phoneVerified

  // Relations (optional for flexibility)
  farms?: FarmWithRelations[];
  orders?: OrderWithRelations[];
  reviews?: ReviewWithRelations[];
  addresses?: PrismaUserAddress[];
  favorites?: FavoriteWithProduct[];
  notifications?: PrismaNotification[];
  cartItems?: CartItemWithProduct[];
}

/**
 * Farm with computed metrics and relations
 * Use this for comprehensive farm data
 */
export interface FarmWithRelations extends Omit<PrismaFarm, "averageRating"> {
  // Computed fields
  averageRating: number; // Average of all product reviews (converted from Decimal)
  totalProducts: number; // Count of active products
  totalOrders: number; // Count of all orders
  isActive: boolean; // status === 'ACTIVE'

  // Relations (optional)
  owner?: UserWithRelations;
  products?: ProductWithRelations[];
  orders?: OrderWithRelations[];
}

/**
 * Product with computed metrics and relations
 * Use this for full product details
 */
export interface ProductWithRelations
  extends Omit<PrismaProduct, "averageRating"> {
  // Computed fields
  averageRating: number; // Average from reviews (converted from Decimal)
  totalReviews: number; // Count of reviews
  isAvailable: boolean; // status === 'ACTIVE' && quantityAvailable > 0
  inStock: boolean; // quantityAvailable > 0

  // Relations (optional)
  farm?: FarmWithRelations;
  reviews?: ReviewWithRelations[];
  orderItems?: PrismaOrderItem[];
}

/**
 * Order with full details and relations
 * Use this for comprehensive order management
 */
export interface OrderWithRelations extends PrismaOrder {
  // Computed fields
  itemCount: number; // Number of items in order
  canBeCancelled: boolean; // Based on status
  isCompleted: boolean; // status === 'COMPLETED'
  isPending: boolean; // status === 'PENDING'

  // Relations (optional)
  customer?: UserWithRelations;
  farm?: FarmWithRelations;
  items?: OrderItemWithProduct[];
}

/**
 * Order Item with product details
 */
export interface OrderItemWithProduct extends PrismaOrderItem {
  product?: ProductWithRelations;
}

/**
 * Review with user and product details
 */
export interface ReviewWithRelations extends PrismaReview {
  user?: UserWithRelations;
  product?: ProductWithRelations;
}

/**
 * Cart Item with full product details
 */
export interface CartItemWithProduct extends PrismaCartItem {
  product?: ProductWithRelations;
}

/**
 * Favorite with product details
 */
export interface FavoriteWithProduct {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  product?: ProductWithRelations;
}

// ============================================================================
// VIEW MODELS - UI-OPTIMIZED TYPES
// ============================================================================

/**
 * Minimal user info for display (avatars, comments, reviews)
 */
export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
  displayName: string;
  initials: string;
}

/**
 * Minimal farm info for listings
 */
export interface FarmSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  images: string[];
  status: FarmStatus;
  averageRating: number;
  totalProducts: number;
}

/**
 * Product card for marketplace listings
 * Optimized for grid/list views
 */
export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  unit: string;
  quantityAvailable: number;
  images: string[];
  category: string;
  organic: boolean;
  seasonal: boolean;
  status: ProductStatus;

  // Computed
  inStock: boolean;
  averageRating: number;
  totalReviews: number;

  // Minimal farm info
  farm: {
    id: string;
    name: string;
    slug: string;
    address: string;
  };
}

/**
 * Order card for order lists
 * Optimized for order history views
 */
export interface OrderCard {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentMethod: FulfillmentMethod;
  total: number;
  createdAt: Date;
  scheduledDate?: Date | null;

  // Minimal farm info
  farm: {
    id: string;
    name: string;
    images: string[];
  };

  // Item summary
  itemCount: number;
  items?: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    unit: string;
  }>;
}

/**
 * Review card for review displays
 */
export interface ReviewCard {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;

  // User info
  user: {
    id: string;
    displayName: string;
    avatar?: string | null;
    initials: string;
  };

  // Product info (optional)
  product?: {
    id: string;
    name: string;
    slug: string;
  };
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    pagination?: PaginationMeta;
    requestId?: string;
    timestamp?: string;
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ============================================================================
// CREATE/UPDATE REQUEST TYPES
// ============================================================================

/**
 * Farm creation request
 */
export interface CreateFarmRequest {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  phone?: string;
  website?: string;
  certifications?: string[];
  farmingMethods?: string[];
  images?: string[];
}

/**
 * Farm update request
 */
export interface UpdateFarmRequest extends Partial<CreateFarmRequest> {
  status?: FarmStatus;
}

/**
 * Product creation request
 */
export interface CreateProductRequest {
  farmId: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  unit: string;
  quantityAvailable: number;
  organic: boolean;
  seasonal: boolean;
  harvestDate?: Date;
  images?: string[];
  nutritionInfo?: Record<string, unknown>;
}

/**
 * Product update request
 */
export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  status?: ProductStatus;
}

/**
 * Order creation request
 */
export interface CreateOrderRequest {
  farmId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  fulfillmentMethod: FulfillmentMethod;
  scheduledDate?: Date;
  shippingAddressId?: string;
  billingAddressId?: string;
  notes?: string;
}

/**
 * Review creation request
 */
export interface CreateReviewRequest {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
}

/**
 * User registration request
 */
export interface UserRegistrationRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

/**
 * User profile update request
 */
export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
}

// ============================================================================
// FILTER/SEARCH TYPES
// ============================================================================

/**
 * Product search/filter options
 */
export interface ProductFilterOptions {
  search?: string;
  category?: string;
  farmId?: string;
  minPrice?: number;
  maxPrice?: number;
  organic?: boolean;
  seasonal?: boolean;
  inStock?: boolean;
  sortBy?: "name" | "price" | "rating" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

/**
 * Farm search/filter options
 */
export interface FarmFilterOptions {
  search?: string;
  city?: string;
  state?: string;
  status?: FarmStatus;
  certifications?: string[];
  sortBy?: "name" | "rating" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

/**
 * Order filter options
 */
export interface OrderFilterOptions {
  customerId?: string;
  farmId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentMethod?: FulfillmentMethod;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "createdAt" | "total" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

// ============================================================================
// LOCATION TYPES
// ============================================================================

/**
 * Coordinates for geolocation
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Full location with address
 */
export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  coordinates?: Coordinates;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Pick specific fields from Prisma types
 */
export type PickFields<T, K extends keyof T> = Pick<T, K>;

/**
 * Omit specific fields from Prisma types
 */
export type OmitFields<T, K extends keyof T> = Omit<T, K>;

/**
 * Type for sorting
 */
export type SortOrder = "asc" | "desc";

/**
 * Type for date range filters
 */
export interface DateRange {
  start: Date;
  end: Date;
}

// ============================================================================
// AGRICULTURAL CONSCIOUSNESS TYPES
// ============================================================================

/**
 * Seasonal context for agricultural operations
 */
export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

/**
 * Lunar phase for biodynamic farming
 */
export type LunarPhase =
  | "NEW_MOON"
  | "WAXING_CRESCENT"
  | "FIRST_QUARTER"
  | "WAXING_GIBBOUS"
  | "FULL_MOON"
  | "WANING_GIBBOUS"
  | "LAST_QUARTER"
  | "WANING_CRESCENT";

/**
 * Agricultural consciousness context
 */
export interface AgriculturalContext {
  season: Season;
  lunarPhase: LunarPhase;
  localClimate?: string;
  soilType?: string;
  growingZone?: string;
}

/**
 * Biodynamic calendar entry
 */
export interface BiodynamicCalendarEntry {
  date: Date;
  season: Season;
  lunarPhase: LunarPhase;
  recommendedActivities: string[];
  notRecommendedActivities: string[];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if user is a farmer
 */
export function isFarmer(user: PrismaUser): boolean {
  return user.role === "FARMER";
}

/**
 * Check if user is admin
 */
export function isAdmin(user: PrismaUser): boolean {
  return ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role);
}

/**
 * Check if user is customer
 */
export function isCustomer(user: PrismaUser): boolean {
  return user.role === "CONSUMER";
}

/**
 * Check if user is active
 */
export function isActiveUser(user: PrismaUser): boolean {
  return user.status === "ACTIVE";
}

/**
 * Check if farm is active
 */
export function isActiveFarm(farm: PrismaFarm): boolean {
  return farm.status === "ACTIVE";
}

/**
 * Check if product is available
 */
export function isProductAvailable(product: PrismaProduct): boolean {
  return (
    product.status === "ACTIVE" &&
    product.quantityAvailable !== null &&
    Number(product.quantityAvailable) > 0
  );
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(order: PrismaOrder): boolean {
  return ["PENDING", "CONFIRMED"].includes(order.status);
}

// ============================================================================
// EXPORTS - SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * ⚠️ IMPORTANT: ALWAYS IMPORT FROM THIS FILE
 *
 * ✅ CORRECT:
 * import type { User, Farm, Product } from '@/types/core-entities';
 *
 * ❌ WRONG:
 * export interface User { ... } // DON'T DO THIS ANYWHERE ELSE!
 *
 * If you need Prisma client types directly:
 * import type { User, Farm } from '@prisma/client';
 *
 * But prefer importing from this file for consistency.
 */

export default {
  // This file is the single source of truth for all core entity types
  // All types are exported at the top level
};
