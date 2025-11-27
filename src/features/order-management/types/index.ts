// ============================================================================
// DIVINE ORDER MANAGEMENT TYPES
// Agricultural Quantum Order Processing System
// ============================================================================

import type {
  OrderItem,
  OrderStatus,
  PaymentStatus,
  FulfillmentMethod,
  Product,
  UserAddress,
  Prisma,
} from "@prisma/client";

// ============================================================================
// CORE ORDER TYPES
// ============================================================================

/**
 * Complete Order with all relations
 * Quantum state representation of agricultural commerce
 */
export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    farm: true;
    items: {
      include: {
        product: true;
      };
    };
    deliveryAddress: true;
    fulfillment: true;
    reviews: true;
    messages: true;
  };
}>;

/**
 * Decimal type alias for compatibility
 */
export type Decimal = Prisma.Decimal | number | string;

/**
 * Order Item with Product details
 */
export interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

/**
 * Simplified Order for lists and cards
 */
export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: Decimal;
  itemCount: number;
  farmName: string;
  customerName: string;
  createdAt: Date;
  scheduledDate?: Date | null;
  fulfillmentMethod: FulfillmentMethod;
}

// ============================================================================
// ORDER CREATION & UPDATES
// ============================================================================

/**
 * Create Order Request - Divine Order Manifestation
 */
export interface CreateOrderRequest {
  customerId: string;
  farmId: string;
  items: OrderItemInput[];
  fulfillmentMethod: FulfillmentMethod;
  deliveryAddressId?: string;
  scheduledDate?: Date;
  scheduledTimeSlot?: string;
  specialInstructions?: string;
  paymentMethod?: string;
}

/**
 * Order Item Input
 */
export interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice?: number; // Optional, will fetch from product if not provided
}

/**
 * Update Order Request
 */
export interface UpdateOrderRequest {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentMethod?: FulfillmentMethod;
  scheduledDate?: Date;
  scheduledTimeSlot?: string;
  specialInstructions?: string;
  trackingNumber?: string;
  shippingService?: string;
}

/**
 * Cancel Order Request
 */
export interface CancelOrderRequest {
  orderId: string;
  cancelledBy: string;
  cancelReason: string;
}

// ============================================================================
// ORDER FILTERING & SEARCH
// ============================================================================

/**
 * Order Filter Options - Quantum Query Parameters
 */
export interface OrderFilterOptions {
  customerId?: string;
  farmId?: string;
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  fulfillmentMethod?: FulfillmentMethod | FulfillmentMethod[];
  dateFrom?: Date;
  dateTo?: Date;
  minTotal?: number;
  maxTotal?: number;
  searchQuery?: string; // Search by order number, customer name, etc.
  sortBy?: OrderSortField;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

/**
 * Order Sort Fields
 */
export type OrderSortField =
  | "createdAt"
  | "updatedAt"
  | "total"
  | "status"
  | "scheduledDate"
  | "orderNumber";

/**
 * Paginated Order Response
 */
export interface PaginatedOrdersResponse {
  orders: OrderWithRelations[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: OrderFilterOptions;
}

// ============================================================================
// ORDER STATISTICS & ANALYTICS
// ============================================================================

/**
 * Order Statistics - Divine Metrics
 */
export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: Decimal;
  averageOrderValue: Decimal;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByPaymentStatus: Record<PaymentStatus, number>;
  ordersByFulfillmentMethod: Record<FulfillmentMethod, number>;
  revenueByMonth: MonthlyRevenue[];
  topProducts: ProductSalesData[];
  topCustomers: CustomerSalesData[];
}

/**
 * Monthly Revenue Data
 */
export interface MonthlyRevenue {
  month: string; // YYYY-MM format
  revenue: Decimal;
  orderCount: number;
  averageOrderValue: Decimal;
}

/**
 * Product Sales Data
 */
export interface ProductSalesData {
  productId: string;
  productName: string;
  totalQuantity: Decimal;
  totalRevenue: Decimal;
  orderCount: number;
}

/**
 * Customer Sales Data
 */
export interface CustomerSalesData {
  customerId: string;
  customerName: string;
  totalOrders: number;
  totalSpent: Decimal;
  averageOrderValue: Decimal;
  lastOrderDate: Date;
}

// ============================================================================
// FULFILLMENT TYPES
// ============================================================================

/**
 * Fulfillment Data
 */
export interface FulfillmentData {
  id: string;
  orderId: string;
  status: FulfillmentStatus;
  trackingNumber?: string | null;
  carrierName?: string | null;
  estimatedDate?: Date | null;
  actualDate?: Date | null;
  proofPhotoUrl?: string | null;
  signature?: string | null;
  recipientName?: string | null;
  deliveryNotes?: string | null;
  gpsLatitude?: Decimal | null;
  gpsLongitude?: Decimal | null;
  deliveryTimestamp?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fulfillment Status (from Prisma schema)
 */
export type FulfillmentStatus =
  | "PENDING"
  | "SCHEDULED"
  | "IN_TRANSIT"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "FAILED";

/**
 * Update Fulfillment Request
 */
export interface UpdateFulfillmentRequest {
  status?: FulfillmentStatus;
  trackingNumber?: string;
  carrierName?: string;
  estimatedDate?: Date;
  actualDate?: Date;
  proofPhotoUrl?: string;
  signature?: string;
  recipientName?: string;
  deliveryNotes?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

/**
 * Payment Data
 */
export interface PaymentData {
  id: string;
  orderId: string;
  amount: Decimal;
  currency: string;
  provider: string;
  transactionId?: string | null;
  status: PaymentStatus;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Process Payment Request
 */
export interface ProcessPaymentRequest {
  orderId: string;
  paymentMethod: string;
  stripePaymentIntentId?: string;
  amount: number;
}

// ============================================================================
// ORDER VALIDATION
// ============================================================================

/**
 * Order Validation Result
 */
export interface OrderValidationResult {
  isValid: boolean;
  errors: OrderValidationError[];
  warnings: OrderValidationWarning[];
}

/**
 * Order Validation Error
 */
export interface OrderValidationError {
  field: string;
  code: string;
  message: string;
  details?: any;
}

/**
 * Order Validation Warning
 */
export interface OrderValidationWarning {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// ORDER TIMELINE & HISTORY
// ============================================================================

/**
 * Order Timeline Event
 */
export interface OrderTimelineEvent {
  id: string;
  orderId: string;
  eventType: OrderEventType;
  status?: OrderStatus;
  description: string;
  performedBy?: string;
  performedByName?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Order Event Types
 */
export type OrderEventType =
  | "ORDER_CREATED"
  | "ORDER_CONFIRMED"
  | "PAYMENT_RECEIVED"
  | "ORDER_PREPARING"
  | "ORDER_READY"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "ORDER_COMPLETED"
  | "ORDER_CANCELLED"
  | "REFUND_ISSUED"
  | "STATUS_CHANGED"
  | "NOTE_ADDED"
  | "MESSAGE_SENT";

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

/**
 * User Address Data (re-exported from Prisma for convenience)
 */
export type UserAddressData = UserAddress;

/**
 * Review Data
 */
export interface ReviewData {
  id: string;
  orderId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
}

/**
 * Message Data
 */
export interface MessageData {
  id: string;
  orderId?: string | null;
  senderId: string;
  content: string;
  createdAt: Date;
}

// ============================================================================
// DIVINE ORDER CONSCIOUSNESS
// ============================================================================

/**
 * Order Consciousness State
 * Represents the quantum awareness of an order's journey
 */
export interface OrderConsciousness {
  orderId: string;
  currentState: OrderStatus;
  previousStates: OrderStatus[];
  transitionCount: number;
  stateHistory: StateTransition[];
  agriculturalAlignment: SeasonalOrderAlignment;
  quantumCoherence: number; // 0-1 scale of order integrity
  divineScore: number; // 0-100 divine perfection score
}

/**
 * State Transition
 */
export interface StateTransition {
  fromState: OrderStatus;
  toState: OrderStatus;
  timestamp: Date;
  triggeredBy: string;
  reason?: string;
}

/**
 * Seasonal Order Alignment
 */
export interface SeasonalOrderAlignment {
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  alignment: "PERFECT" | "GOOD" | "ACCEPTABLE" | "MISALIGNED";
  seasonalProducts: string[];
  freshnessFactor: number; // 0-1 scale
  biodynamicScore: number; // 0-100 score
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Divine API Response for Orders
 */
export interface OrderApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    requestId?: string;
    timestamp: Date;
    pagination?: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  };
  agricultural?: {
    season: string;
    consciousness: "DIVINE" | "QUANTUM" | "ENLIGHTENED";
    orderFlow: string;
  };
}

// ============================================================================
// CART TO ORDER CONVERSION
// ============================================================================

/**
 * Cart to Order Conversion Request
 */
export interface CartToOrderRequest {
  customerId: string;
  farmId: string;
  cartItemIds: string[];
  fulfillmentMethod: FulfillmentMethod;
  deliveryAddressId?: string;
  scheduledDate?: Date;
  scheduledTimeSlot?: string;
  specialInstructions?: string;
  paymentMethodId?: string;
}

// ============================================================================
// ORDER EXPORT TYPES
// ============================================================================

/**
 * Order Export Options
 */
export interface OrderExportOptions {
  format: "CSV" | "PDF" | "EXCEL" | "JSON";
  filters: OrderFilterOptions;
  includeItems: boolean;
  includeCustomer: boolean;
  includeFarm: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Order Export Result
 */
export interface OrderExportResult {
  filename: string;
  fileUrl: string;
  format: string;
  recordCount: number;
  generatedAt: Date;
  expiresAt: Date;
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk Order Update Request
 */
export interface BulkOrderUpdateRequest {
  orderIds: string[];
  updates: Partial<UpdateOrderRequest>;
  performedBy: string;
}

/**
 * Bulk Order Update Result
 */
export interface BulkOrderUpdateResult {
  successCount: number;
  failureCount: number;
  results: Array<{
    orderId: string;
    success: boolean;
    error?: string;
  }>;
}
