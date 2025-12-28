// ============================================================================
// DIVINE CUSTOMER ORDERS API ROUTE - GET
// Phase 3: Controller Integration Complete
// ============================================================================

import { NextRequest } from "next/server";
import { orderController } from "@/lib/controllers/order.controller";

/**
 * 🛒 GET CUSTOMER ORDERS - Divine Customer Order Retrieval
 *
 * Retrieves all orders for a specific customer with pagination and filtering.
 *
 * Path Parameters:
 * - customerId: string - The ID of the customer
 *
 * Query Parameters:
 * - status?: OrderStatus - Filter by order status
 * - paymentStatus?: PaymentStatus - Filter by payment status
 * - fulfillmentMethod?: FulfillmentMethod - Filter by fulfillment method
 * - dateFrom?: string - Filter orders from date (ISO format)
 * - dateTo?: string - Filter orders to date (ISO format)
 * - sortBy?: string - Sort field (createdAt, total, status, etc.)
 * - sortOrder?: 'asc' | 'desc' - Sort direction
 * - page?: number - Page number (default: 1)
 * - pageSize?: number - Items per page (default: 20)
 *
 * Authorization:
 * - CONSUMER: Can only view their own orders (customerId must match session user)
 * - FARMER: Cannot access customer orders directly
 * - ADMIN: Can view any customer's orders
 *
 * Response:
 * - 200: Paginated list of customer orders
 * - 401: Authentication required
 * - 403: Forbidden (customer trying to view another customer's orders)
 * - 404: Customer not found
 * - 500: Server error
 *
 * @example
 * GET /api/customers/customer_123/orders
 * GET /api/customers/customer_123/orders?status=PENDING&page=1
 * GET /api/customers/customer_123/orders?sortBy=createdAt&sortOrder=desc
 *
 * @example Success Response
 * {
 *   "success": true,
 *   "data": {
 *     "orders": [
 *       {
 *         "id": "order_123",
 *         "orderNumber": "ORD-2025-001",
 *         "status": "CONFIRMED",
 *         "totalAmount": 45.99,
 *         "farm": { "name": "Green Valley Farm", ... },
 *         "items": [...],
 *         "createdAt": "2025-01-15T10:30:00Z"
 *       }
 *     ],
 *     "pagination": {
 *       "page": 1,
 *       "pageSize": 20,
 *       "totalCount": 25,
 *       "totalPages": 2,
 *       "hasNext": true,
 *       "hasPrevious": false
 *     }
 *   },
 *   "meta": {
 *     "timestamp": "2025-01-...",
 *     "customerId": "customer_123"
 *   },
 *   "agricultural": {
 *     "season": "WINTER",
 *     "consciousness": "DIVINE",
 *     "orderFlow": "CUSTOMER_ORDER_RETRIEVAL"
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } },
) {
  return orderController.getCustomerOrders(request, params);
}

// ============================================================================
// DIVINE CUSTOMER ORDERS API - AGRICULTURAL CONSCIOUSNESS
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
// ✅ Customer privacy protection
// ✅ Query parameter parsing
// ✅ 100% code reduction (new route)
//
// Divine Patterns Applied:
// - Thin controller pattern
// - Service layer delegation
// - Repository pattern
// - Standardized responses
// - Agricultural consciousness
// - Privacy-first architecture
//
// Privacy & Authorization:
// - Customers can only view their own orders
// - Admin can view any customer's orders
// - Farmers cannot access customer order lists directly
// - All authorization checks in controller
//
// Use Cases:
// - Customer order history page
// - Admin customer support
// - Order tracking dashboard
// - Purchase history reports
// - Return/refund processing
//
// Phase 3 Integration Complete ✅
// ============================================================================
