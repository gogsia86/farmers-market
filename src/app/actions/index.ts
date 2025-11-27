/**
 * 🌟 DIVINE SERVER ACTIONS - CENTRAL EXPORT
 * Farmers Market Platform - Server Actions Index
 * Version: 1.0 - Action Orchestration
 *
 * This file exports all server actions for easy importing throughout the application.
 * Follow divine patterns: import actions from a single source for consistency.
 */

// ============================================================================
// PRODUCT ACTIONS
// ============================================================================

export {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  toggleProductStatusAction,
  bulkUpdateStockAction,
} from "./product.actions";

// ============================================================================
// ORDER ACTIONS
// ============================================================================

export {
  updateOrderStatusAction,
  addOrderNoteAction,
  updateFulfillmentAction,
  cancelOrderAction,
  getOrderDetailsAction,
} from "./order.actions";

// ============================================================================
// SETTINGS ACTIONS
// ============================================================================

export {
  updateFarmProfileAction,
  updateNotificationSettingsAction,
  updatePaymentSettingsAction,
  updateBusinessHoursAction,
  getFarmSettingsAction,
} from "./settings.actions";

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  ActionResult,
  ActionError,
  ActionErrorCodeType,
} from "@/types/actions";

export {
  ActionErrorCode,
  createSuccessResult,
  createErrorResult,
  isSuccessResult,
  isErrorResult,
} from "@/types/actions";

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Using product actions in a component
 *
 * ```typescript
 * import { createProductAction } from "@/app/actions";
 *
 * async function handleSubmit(data: ProductFormData) {
 *   const result = await createProductAction(farmId, data);
 *
 *   if (result.success) {
 *     console.log("Product created:", result.data);
 *     router.push("/farmer/products");
 *   } else {
 *     console.error("Error:", result.error?.message);
 *   }
 * }
 * ```
 */

/**
 * Example 2: Using order actions
 *
 * ```typescript
 * import { updateOrderStatusAction } from "@/app/actions";
 *
 * async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
 *   const result = await updateOrderStatusAction(orderId, newStatus);
 *
 *   if (result.success) {
 *     toast.success("Order status updated");
 *     revalidate();
 *   } else {
 *     toast.error(result.error?.message);
 *   }
 * }
 * ```
 */

/**
 * Example 3: Using settings actions
 *
 * ```typescript
 * import { updateFarmProfileAction } from "@/app/actions";
 *
 * async function handleProfileUpdate(farmId: string, data: FarmProfileData) {
 *   const result = await updateFarmProfileAction(farmId, data);
 *
 *   if (result.success) {
 *     console.log("Farm updated:", result.data);
 *   } else {
 *     console.error("Error:", result.error);
 *   }
 * }
 * ```
 */

/**
 * Example 4: Error handling with type guards
 *
 * ```typescript
 * import { createProductAction, isSuccessResult, isErrorResult } from "@/app/actions";
 *
 * const result = await createProductAction(farmId, data);
 *
 * if (isSuccessResult(result)) {
 *   // TypeScript knows result.data is defined
 *   console.log(result.data.id);
 * }
 *
 * if (isErrorResult(result)) {
 *   // TypeScript knows result.error is defined
 *   console.error(result.error.code, result.error.message);
 * }
 * ```
 */
