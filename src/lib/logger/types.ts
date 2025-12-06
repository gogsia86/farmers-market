/**
 * 🌾 AGRICULTURAL DOMAIN LOGGING TYPES
 * Farmers Market Platform - Domain-Specific Logging Contexts
 *
 * Purpose: Type-safe logging contexts for agricultural domain operations
 * Usage: Import and use with logger for structured, consistent logging
 *
 * Reference: 02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 * Version: 1.0
 */

import type { LogContext } from "./index";

// ============================================================================
// FARM DOMAIN CONTEXTS
// ============================================================================

/**
 * Context for farm-related operations
 */
export interface FarmContext extends LogContext {
  farmId: string;
  farmName?: string;
  farmerId?: string;
  farmerEmail?: string;
  operation: string;
  farmStatus?: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | "INACTIVE";
  location?: {
    address?: string;
    city?: string;
    state?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

/**
 * Context for farm creation operations
 */
export interface FarmCreationContext extends LogContext {
  farmName: string;
  farmerId: string;
  location: string;
  farmingPractices?: string[];
  certifications?: string[];
}

/**
 * Context for farm verification operations
 */
export interface FarmVerificationContext extends LogContext {
  farmId: string;
  farmName: string;
  verificationStatus: string;
  verifiedBy?: string;
  verificationNotes?: string;
}

// ============================================================================
// PRODUCT DOMAIN CONTEXTS
// ============================================================================

/**
 * Context for product-related operations
 */
export interface ProductContext extends LogContext {
  productId: string;
  productName?: string;
  farmId?: string;
  category?: string;
  price?: number;
  unit?: string;
  stock?: number;
  operation: string;
}

/**
 * Context for product catalog operations
 */
export interface ProductCatalogContext extends LogContext {
  farmId: string;
  totalProducts?: number;
  activeProducts?: number;
  categories?: string[];
  season?: string;
}

/**
 * Context for inventory operations
 */
export interface InventoryContext extends LogContext {
  productId: string;
  previousStock?: number;
  newStock: number;
  operation: "UPDATE" | "RESTOCK" | "DEPLETE" | "ADJUST";
  reason?: string;
}

// ============================================================================
// ORDER DOMAIN CONTEXTS
// ============================================================================

/**
 * Context for order operations
 */
export interface OrderContext extends LogContext {
  orderId: string;
  customerId: string;
  farmId?: string;
  totalAmount?: number;
  itemCount?: number;
  status: string;
  operation: string;
}

/**
 * Context for order creation
 */
export interface OrderCreationContext extends LogContext {
  customerId: string;
  farmIds: string[];
  totalAmount: number;
  itemCount: number;
  deliveryMethod?: string;
  paymentMethod?: string;
}

/**
 * Context for order fulfillment
 */
export interface OrderFulfillmentContext extends LogContext {
  orderId: string;
  farmId: string;
  previousStatus: string;
  newStatus: string;
  trackingNumber?: string;
  carrier?: string;
}

// ============================================================================
// PAYMENT DOMAIN CONTEXTS
// ============================================================================

/**
 * Context for payment operations
 */
export interface PaymentContext extends LogContext {
  paymentIntentId?: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  operation: string;
  customerId?: string;
  paymentMethod?: string;
}

/**
 * Context for Stripe webhook events
 */
export interface StripeWebhookContext extends LogContext {
  eventId: string;
  eventType: string;
  livemode: boolean;
  paymentIntentId?: string;
  orderId?: string;
  amount?: number;
}

/**
 * Context for payout operations
 */
export interface PayoutContext extends LogContext {
  payoutId: string;
  farmerId: string;
  amount: number;
  currency: string;
  status: string;
  destination?: string;
  arrivalDate?: string;
}

/**
 * Context for refund operations
 */
export interface RefundContext extends LogContext {
  refundId: string;
  paymentIntentId: string;
  orderId: string;
  amount: number;
  reason?: string;
  status: string;
}

// ============================================================================
// USER & AUTH DOMAIN CONTEXTS
// ============================================================================

/**
 * Context for authentication operations
 */
export interface AuthContext extends LogContext {
  userId?: string;
  email?: string;
  operation: string;
  role?: "CUSTOMER" | "FARMER" | "ADMIN";
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Context for user registration
 */
export interface RegistrationContext extends LogContext {
  email: string;
  role: "CUSTOMER" | "FARMER";
  provider?: string;
  referralSource?: string;
}

/**
 * Context for password operations
 */
export interface PasswordContext extends LogContext {
  userId: string;
  operation: "RESET" | "CHANGE" | "VERIFY";
  success: boolean;
}

// ============================================================================
// INFRASTRUCTURE CONTEXTS
// ============================================================================

/**
 * Context for geocoding operations
 */
export interface GeocodingContext extends LogContext {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  cached?: boolean;
  provider?: string;
  fallbackUsed?: boolean;
  state?: string;
}

/**
 * Context for cache operations
 */
export interface CacheContext extends LogContext {
  key: string;
  operation: "GET" | "SET" | "DELETE" | "CLEAR";
  hit?: boolean;
  ttl?: number;
  size?: number;
  provider?: "MEMORY" | "REDIS";
}

/**
 * Context for email operations
 */
export interface EmailContext extends LogContext {
  to: string | string[];
  subject: string;
  template?: string;
  operation: "SEND" | "QUEUE" | "RETRY";
  provider?: string;
  messageId?: string;
}

/**
 * Context for file upload operations
 */
export interface FileUploadContext extends LogContext {
  fileName: string;
  fileSize: number;
  mimeType: string;
  destination: string;
  operation: "UPLOAD" | "DELETE" | "TRANSFORM";
  userId?: string;
  farmId?: string;
  productId?: string;
}

/**
 * Context for database operations
 */
export interface DatabaseContext extends LogContext {
  model: string;
  operation: "CREATE" | "READ" | "UPDATE" | "DELETE" | "QUERY";
  recordId?: string;
  queryDuration?: number;
  rowsAffected?: number;
}

// ============================================================================
// API & REQUEST CONTEXTS
// ============================================================================

/**
 * Context for API requests
 */
export interface ApiRequestContext extends LogContext {
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ipAddress?: string;
  requestId?: string;
}

/**
 * Context for webhook operations
 */
export interface WebhookContext extends LogContext {
  provider: string;
  eventType: string;
  webhookId?: string;
  verified: boolean;
  retryCount?: number;
}

// ============================================================================
// NOTIFICATION CONTEXTS
// ============================================================================

/**
 * Context for notification operations
 */
export interface NotificationContext extends LogContext {
  notificationId: string;
  userId: string;
  type: string;
  channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
  status: "SENT" | "DELIVERED" | "FAILED" | "PENDING";
  operation: string;
}

/**
 * Context for real-time operations (WebSocket)
 */
export interface RealtimeContext extends LogContext {
  connectionId: string;
  userId?: string;
  event: string;
  channel?: string;
  operation: "CONNECT" | "DISCONNECT" | "SEND" | "RECEIVE";
}

// ============================================================================
// ANALYTICS & MONITORING CONTEXTS
// ============================================================================

/**
 * Context for performance monitoring
 */
export interface PerformanceContext extends LogContext {
  operation: string;
  duration: number;
  memory?: {
    used: number;
    total: number;
  };
  cpu?: number;
  threshold?: number;
  exceeded?: boolean;
}

/**
 * Context for error tracking
 */
export interface ErrorTrackingContext extends LogContext {
  errorCode: string;
  errorType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  affected?: {
    users?: number;
    orders?: number;
    farms?: number;
  };
  resolution?: string;
}

// ============================================================================
// SEARCH & DISCOVERY CONTEXTS
// ============================================================================

/**
 * Context for search operations
 */
export interface SearchContext extends LogContext {
  query: string;
  filters?: Record<string, any>;
  resultCount?: number;
  duration?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Context for recommendation operations
 */
export interface RecommendationContext extends LogContext {
  userId: string;
  algorithm: string;
  itemCount: number;
  category?: string;
  accuracy?: number;
}

// ============================================================================
// SEASONAL & AGRICULTURAL CONTEXTS
// ============================================================================

/**
 * Context for seasonal operations
 */
export interface SeasonalContext extends LogContext {
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  operation: string;
  productsAffected?: number;
  farmsAffected?: number;
}

/**
 * Context for biodynamic calendar operations
 */
export interface BiodynamicContext extends LogContext {
  date: string;
  lunarPhase?: string;
  recommendation?: string;
  operation: string;
  appropriateActivities?: string[];
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type AnyDomainContext =
  | FarmContext
  | FarmCreationContext
  | FarmVerificationContext
  | ProductContext
  | ProductCatalogContext
  | InventoryContext
  | OrderContext
  | OrderCreationContext
  | OrderFulfillmentContext
  | PaymentContext
  | StripeWebhookContext
  | PayoutContext
  | RefundContext
  | AuthContext
  | RegistrationContext
  | PasswordContext
  | GeocodingContext
  | CacheContext
  | EmailContext
  | FileUploadContext
  | DatabaseContext
  | ApiRequestContext
  | WebhookContext
  | NotificationContext
  | RealtimeContext
  | PerformanceContext
  | ErrorTrackingContext
  | SearchContext
  | RecommendationContext
  | SeasonalContext
  | BiodynamicContext;
