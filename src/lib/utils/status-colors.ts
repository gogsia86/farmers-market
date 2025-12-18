/**
 * 🎨 STATUS COLOR UTILITIES
 * Standardized status badge and indicator colors across the platform
 *
 * Purpose:
 * - Consistent status visualization
 * - Single source of truth for status colors
 * - Easy to update and maintain
 *
 * Reference: DESIGN_SYSTEM_ANALYSIS.md - Status Colors Section
 */

// Order Status Types
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

// Farm Status Types
export type FarmStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";

// Payment Status Types
export type PaymentStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED";

// Payout Status Types
export type PayoutStatus = "COMPLETED" | "PENDING" | "PROCESSING" | "FAILED";

// Product Status Types
export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED" | "OUT_OF_STOCK";

// Generic Status Types
export type GenericStatus =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default";

/**
 * Get Tailwind classes for order status badges
 * @param status Order status
 * @returns Tailwind class string for background and text colors
 */
export function getOrderStatusClasses(status: OrderStatus): string {
  const statusColors: Record<OrderStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    PREPARING: "bg-purple-100 text-purple-800 border-purple-200",
    READY: "bg-green-100 text-green-800 border-green-200",
    COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };

  return statusColors[status] || statusColors.PENDING;
}

/**
 * Get Tailwind classes for farm status badges
 * @param status Farm status
 * @returns Tailwind class string for background and text colors
 */
export function getFarmStatusClasses(status: FarmStatus): string {
  const statusColors: Record<FarmStatus, string> = {
    ACTIVE: "bg-green-100 text-green-800 border-green-200",
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    SUSPENDED: "bg-red-100 text-red-800 border-red-200",
    INACTIVE: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return statusColors[status] || statusColors.PENDING;
}

/**
 * Get Tailwind classes for payment status badges
 * @param status Payment status
 * @returns Tailwind class string for background and text colors
 */
export function getPaymentStatusClasses(status: PaymentStatus): string {
  const statusColors: Record<PaymentStatus, string> = {
    PAID: "bg-green-100 text-green-800 border-green-200",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    FAILED: "bg-red-100 text-red-800 border-red-200",
    REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return statusColors[status] || statusColors.PENDING;
}

/**
 * Get Tailwind classes for payout status badges
 * @param status Payout status
 * @returns Tailwind class string for background and text colors
 */
export function getPayoutStatusClasses(status: PayoutStatus): string {
  const statusColors: Record<PayoutStatus, string> = {
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
    FAILED: "bg-red-100 text-red-800 border-red-200",
  };

  return statusColors[status] || statusColors.PENDING;
}

/**
 * Get Tailwind classes for product status badges
 * @param status Product status
 * @returns Tailwind class string for background and text colors
 */
export function getProductStatusClasses(status: ProductStatus): string {
  const statusColors: Record<ProductStatus, string> = {
    ACTIVE: "bg-green-100 text-green-800 border-green-200",
    DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
    ARCHIVED: "bg-amber-100 text-amber-800 border-amber-200",
    OUT_OF_STOCK: "bg-red-100 text-red-800 border-red-200",
  };

  return statusColors[status] || statusColors.DRAFT;
}

/**
 * Get Tailwind classes for generic status badges
 * @param status Generic status type
 * @returns Tailwind class string for background and text colors
 */
export function getGenericStatusClasses(status: GenericStatus): string {
  const statusColors: Record<GenericStatus, string> = {
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    error: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    default: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return statusColors[status] || statusColors.default;
}

/**
 * Get human-readable label for order status
 * @param status Order status
 * @returns Formatted status label
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    READY: "Ready for Pickup",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  return labels[status] || status;
}

/**
 * Get human-readable label for farm status
 * @param status Farm status
 * @returns Formatted status label
 */
export function getFarmStatusLabel(status: FarmStatus): string {
  const labels: Record<FarmStatus, string> = {
    ACTIVE: "Active",
    PENDING: "Pending Verification",
    SUSPENDED: "Suspended",
    INACTIVE: "Inactive",
  };

  return labels[status] || status;
}

/**
 * Get icon emoji for order status (optional, for visual enhancement)
 * @param status Order status
 * @returns Emoji icon
 */
export function getOrderStatusIcon(status: OrderStatus): string {
  const icons: Record<OrderStatus, string> = {
    PENDING: "⏳",
    CONFIRMED: "✅",
    PREPARING: "👨‍🍳",
    READY: "📦",
    COMPLETED: "🎉",
    CANCELLED: "❌",
  };

  return icons[status] || "📋";
}

/**
 * Get icon emoji for farm status
 * @param status Farm status
 * @returns Emoji icon
 */
export function getFarmStatusIcon(status: FarmStatus): string {
  const icons: Record<FarmStatus, string> = {
    ACTIVE: "✅",
    PENDING: "⏳",
    SUSPENDED: "⚠️",
    INACTIVE: "💤",
  };

  return icons[status] || "🏪";
}

/**
 * Determine if status is a positive/success state
 * @param status Order status
 * @returns Boolean indicating positive state
 */
export function isPositiveStatus(status: OrderStatus): boolean {
  return ["CONFIRMED", "READY", "COMPLETED"].includes(status);
}

/**
 * Determine if status is a negative/error state
 * @param status Order status
 * @returns Boolean indicating negative state
 */
export function isNegativeStatus(status: OrderStatus): boolean {
  return status === "CANCELLED";
}

/**
 * Determine if status is a pending/in-progress state
 * @param status Order status
 * @returns Boolean indicating pending state
 */
export function isPendingStatus(status: OrderStatus): boolean {
  return ["PENDING", "PREPARING"].includes(status);
}

/**
 * Get status variant for Badge component
 * @param status Generic status type
 * @returns Badge variant type
 */
export function getStatusVariant(
  status: GenericStatus,
): "default" | "secondary" | "outline" | "success" | "warning" | "error" {
  const variants: Record<
    GenericStatus,
    "default" | "secondary" | "outline" | "success" | "warning" | "error"
  > = {
    success: "success",
    warning: "warning",
    error: "error",
    info: "secondary",
    default: "default",
  };

  return variants[status];
}
