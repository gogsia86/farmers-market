// ============================================================================
// DIVINE ORDER STATISTICS API ROUTE - GET
// Phase 3: Controller Integration Complete
// ============================================================================

import { NextRequest } from "next/server";
import { orderController } from "@/lib/controllers/order.controller";

/**
 * 📊 GET ORDER STATISTICS - Divine Analytics Endpoint
 *
 * Retrieves comprehensive order statistics with agricultural consciousness.
 *
 * Query Parameters:
 * - farmId?: string - Filter statistics to specific farm
 * - startDate?: string - Start date for statistics (ISO format)
 * - endDate?: string - End date for statistics (ISO format)
 * - groupBy?: 'day' | 'week' | 'month' - Group statistics by time period
 *
 * Statistics Included:
 * - Total orders count
 * - Orders by status (pending, confirmed, preparing, ready, fulfilled, completed, cancelled)
 * - Total revenue (sum of all order totals)
 * - Average order value
 * - Orders by fulfillment method (delivery, pickup, shipping)
 * - Orders by payment status (pending, paid, failed, refunded)
 * - Top selling products (if available)
 * - Growth metrics (compared to previous period)
 * - Seasonal trends
 *
 * Authorization:
 * - CONSUMER: Can only view their own order statistics
 * - FARMER: Can view statistics for their farms
 * - ADMIN: Can view all statistics (platform-wide)
 *
 * Response:
 * - 200: Order statistics with agricultural consciousness
 * - 401: Authentication required
 * - 403: Forbidden (insufficient permissions)
 * - 500: Server error
 *
 * @example
 * GET /api/orders/statistics
 * GET /api/orders/statistics?farmId=farm_123
 * GET /api/orders/statistics?startDate=2025-01-01&endDate=2025-01-31
 * GET /api/orders/statistics?groupBy=week
 *
 * @example Success Response
 * {
 *   "success": true,
 *   "data": {
 *     "totalOrders": 150,
 *     "totalRevenue": 12500.00,
 *     "averageOrderValue": 83.33,
 *     "ordersByStatus": {
 *       "PENDING": 10,
 *       "CONFIRMED": 15,
 *       "PREPARING": 8,
 *       "READY": 5,
 *       "FULFILLED": 30,
 *       "COMPLETED": 70,
 *       "CANCELLED": 12
 *     },
 *     "ordersByFulfillmentMethod": {
 *       "DELIVERY": 80,
 *       "FARM_PICKUP": 50,
 *       "MARKET_PICKUP": 20
 *     },
 *     "ordersByPaymentStatus": {
 *       "PENDING": 15,
 *       "PAID": 120,
 *       "FAILED": 5,
 *       "REFUNDED": 10
 *     },
 *     "growth": {
 *       "ordersGrowth": 15.5,
 *       "revenueGrowth": 22.3
 *     }
 *   },
 *   "meta": {
 *     "timestamp": "2025-01-...",
 *     "period": {
 *       "startDate": "2025-01-01",
 *       "endDate": "2025-01-31"
 *     }
 *   },
 *   "agricultural": {
 *     "season": "WINTER",
 *     "consciousness": "DIVINE",
 *     "operation": "QUANTUM_ANALYTICS"
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  return orderController.getOrderStatistics(request);
}

// ============================================================================
// DIVINE ORDER STATISTICS API - AGRICULTURAL CONSCIOUSNESS
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
// ✅ Role-based data filtering
// ✅ Query parameter parsing
// ✅ 100% code reduction (new route)
//
// Divine Patterns Applied:
// - Thin controller pattern
// - Service layer delegation
// - Repository pattern with aggregation
// - Standardized responses
// - Agricultural consciousness
// - Quantum analytics
//
// Analytics Features:
// - Real-time statistics calculation
// - Time-based filtering
// - Role-based access control
// - Growth metrics
// - Seasonal awareness
// - Performance optimized queries
// - Cached aggregations
//
// Phase 3 Integration Complete ✅
// ============================================================================
