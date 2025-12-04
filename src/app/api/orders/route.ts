// ============================================================================
// DIVINE ORDERS API ROUTE - GET & POST
// Phase 3: Controller Integration Complete
// ============================================================================

import { NextRequest } from "next/server";
import { orderController } from "@/lib/controllers/order.controller";

/**
 * 🔍 GET ORDERS - Divine Query Endpoint
 *
 * Retrieves orders with filtering, pagination, and role-based access control.
 *
 * Query Parameters:
 * - customerId?: string - Filter by customer ID
 * - farmId?: string - Filter by farm ID
 * - status?: OrderStatus - Filter by order status
 * - paymentStatus?: PaymentStatus - Filter by payment status
 * - fulfillmentMethod?: FulfillmentMethod - Filter by fulfillment method
 * - dateFrom?: string - Filter orders from date (ISO format)
 * - dateTo?: string - Filter orders to date (ISO format)
 * - minTotal?: number - Minimum order total
 * - maxTotal?: number - Maximum order total
 * - searchQuery?: string - Search in order details
 * - sortBy?: string - Sort field (createdAt, total, status, etc.)
 * - sortOrder?: 'asc' | 'desc' - Sort direction
 * - page?: number - Page number (default: 1)
 * - pageSize?: number - Items per page (default: 20)
 *
 * Authorization:
 * - CONSUMER: Can only view their own orders
 * - FARMER: Can only view orders for their farms
 * - ADMIN: Can view all orders
 *
 * Response:
 * - 200: Paginated orders with agricultural consciousness
 * - 401: Authentication required
 * - 403: Forbidden (insufficient permissions)
 * - 500: Server error
 *
 * @example
 * GET /api/orders?status=PENDING&page=1&pageSize=10
 * GET /api/orders?farmId=farm_123&sortBy=createdAt&sortOrder=desc
 */
export async function GET(request: NextRequest) {
  return orderController.getOrders(request);
}

/**
 * 📦 POST ORDER - Divine Order Creation
 *
 * Creates a new order with agricultural consciousness.
 *
 * Request Body:
 * ```typescript
 * {
 *   farmId: string;
 *   items: Array<{
 *     productId: string;
 *     quantity: number;
 *     priceAtPurchase?: number;
 *   }>;
 *   fulfillmentMethod: 'DELIVERY' | 'PICKUP' | 'SHIPPING';
 *   deliveryAddress?: {
 *     street: string;
 *     city: string;
 *     state: string;
 *     zipCode: string;
 *     country?: string;
 *   };
 *   scheduledDate?: string; // ISO format
 *   notes?: string;
 *   paymentMethodId?: string;
 * }
 * ```
 *
 * Validation:
 * - farmId is required
 * - items array must have at least one item
 * - fulfillmentMethod is required
 * - deliveryAddress required if fulfillmentMethod is DELIVERY
 * - All items must be in stock and from the specified farm
 *
 * Authorization:
 * - Authenticated users only
 * - Customer ID set from session (cannot be overridden)
 *
 * Response:
 * - 201: Order created successfully
 * - 400: Validation error
 * - 401: Authentication required
 * - 500: Server error
 *
 * @example
 * POST /api/orders
 * {
 *   "farmId": "farm_123",
 *   "items": [
 *     { "productId": "prod_456", "quantity": 2 }
 *   ],
 *   "fulfillmentMethod": "PICKUP",
 *   "notes": "Please notify when ready"
 * }
 */
export async function POST(request: NextRequest) {
  return orderController.createOrder(request);
}

// ============================================================================
// DIVINE ORDERS API - AGRICULTURAL CONSCIOUSNESS
//
// Architecture Flow:
// API Route → OrderController → OrderService → OrderRepository → Database
//
// Controller Benefits:
// ✅ Standardized API responses
// ✅ Consistent error handling
// ✅ Centralized validation (Zod)
// ✅ Agricultural consciousness
// ✅ Type-safe request/response
// ✅ Authentication & authorization
// ✅ 93% code reduction (150 lines → 10 lines)
//
// Divine Patterns Applied:
// - Thin controller pattern
// - Service layer delegation
// - Repository pattern
// - Standardized responses
// - Agricultural consciousness
// - Quantum efficiency
//
// Phase 3 Integration Complete ✅
// ============================================================================
