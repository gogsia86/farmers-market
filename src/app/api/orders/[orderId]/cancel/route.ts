// ============================================================================
// DIVINE ORDER CANCELLATION API ROUTE - POST
// Phase 3: Controller Integration Complete
// ============================================================================

import { NextRequest } from "next/server";
import { orderController } from "@/lib/controllers/order.controller";

/**
 * 🚫 POST CANCEL ORDER - Divine Cancellation Endpoint
 *
 * Cancels an existing order with agricultural consciousness.
 * Automatically restores product inventory and records cancellation details.
 *
 * Request Body:
 * ```typescript
 * {
 *   cancelReason?: string; // Reason for cancellation (optional)
 *   reason?: string;       // Alias for cancelReason (optional)
 * }
 * ```
 *
 * Cancellation Process:
 * 1. Validates order exists and can be cancelled
 * 2. Checks user authorization
 * 3. Updates order status to CANCELLED
 * 4. Restores product inventory (quantum restoration)
 * 5. Records cancellation metadata
 * 6. Determines if refund should be issued
 *
 * Authorization:
 * - CONSUMER: Can cancel their own orders
 * - FARMER: Can cancel orders for their farms (with reason)
 * - ADMIN: Can cancel any order
 *
 * Cancellable Order Statuses:
 * - PENDING
 * - CONFIRMED
 * - PREPARING
 * - READY
 *
 * Non-Cancellable Statuses:
 * - FULFILLED (already delivered)
 * - COMPLETED (transaction complete)
 * - CANCELLED (already cancelled)
 * - REFUNDED (already processed)
 *
 * Response:
 * - 200: Order cancelled successfully with restoration details
 * - 400: Invalid order status (cannot be cancelled)
 * - 401: Authentication required
 * - 403: Forbidden (insufficient permissions)
 * - 404: Order not found
 * - 500: Server error
 *
 * Response includes:
 * - Updated order data
 * - Cancellation metadata (who, when, why)
 * - Refund status (if applicable)
 * - Inventory restoration confirmation
 * - Agricultural consciousness markers
 *
 * @example
 * POST /api/orders/order_123/cancel
 * {
 *   "cancelReason": "Customer changed mind about order"
 * }
 *
 * @example Success Response
 * {
 *   "success": true,
 *   "data": { ...orderDetails... },
 *   "meta": {
 *     "timestamp": "2025-01-...",
 *     "requestId": "...",
 *     "cancellation": {
 *       "cancelledBy": "user_123",
 *       "cancelledByRole": "CONSUMER",
 *       "cancelReason": "Customer changed mind",
 *       "requiresRefund": true,
 *       "inventoryRestored": true
 *     }
 *   },
 *   "agricultural": {
 *     "season": "WINTER",
 *     "consciousness": "DIVINE",
 *     "orderFlow": "QUANTUM_CANCELLATION_WITH_RESTORATION"
 *   }
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } },
) {
  return orderController.cancelOrder(request, { id: params.orderId });
}

// ============================================================================
// DIVINE ORDER CANCELLATION API - AGRICULTURAL CONSCIOUSNESS
//
// Architecture Flow:
// API Route → OrderController → OrderService → OrderRepository → Database
//
// Controller Benefits:
// ✅ Standardized API responses
// ✅ Consistent error handling
// ✅ Centralized validation (Zod)
// ✅ Agricultural consciousness
// ✅ Automatic inventory restoration
// ✅ Role-based authorization
// ✅ Status validation
// ✅ 95% code reduction (200 lines → 10 lines)
//
// Divine Patterns Applied:
// - Thin controller pattern
// - Service layer delegation
// - Repository pattern
// - Quantum inventory restoration
// - Biodynamic cancellation flow
// - Agricultural consciousness
// - Enlightening error messages
//
// Inventory Restoration:
// When an order is cancelled, the system automatically:
// 1. Retrieves all order items
// 2. Increases product stock quantities
// 3. Updates product availability status
// 4. Logs restoration in audit trail
// 5. Maintains agricultural consciousness
//
// Phase 3 Integration Complete ✅
// ============================================================================
