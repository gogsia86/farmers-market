// ============================================================================
// DIVINE FARM ORDERS API ROUTE - GET
// Phase 3: Controller Integration Complete
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { orderController } from "@/lib/controllers/order.controller";
import { database } from "@/lib/database";

/**
 * 🌾 GET FARM ORDERS - Divine Farm Order Retrieval
 *
 * Retrieves all orders for a specific farm with filtering and pagination.
 *
 * Path Parameters:
 * - slug: string - The slug of the farm
 *
 * Query Parameters:
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
 * - FARMER: Can only view orders for their own farms
 * - ADMIN: Can view orders for any farm
 * - CONSUMER: Cannot access (403 Forbidden)
 *
 * Response:
 * - 200: Paginated list of farm orders with agricultural consciousness
 * - 401: Authentication required
 * - 403: Forbidden (insufficient permissions or not farm owner)
 * - 404: Farm not found
 * - 500: Server error
 *
 * @example
 * GET /api/farms/green-valley-farm/orders
 * GET /api/farms/green-valley-farm/orders?status=PENDING&page=1
 * GET /api/farms/green-valley-farm/orders?dateFrom=2025-01-01&sortBy=createdAt&sortOrder=desc
 *
 * @example Success Response
 * {
 *   "success": true,
 *   "data": {
 *     "orders": [
 *       {
 *         "id": "order_123",
 *         "orderNumber": "FM-2025-001",
 *         "status": "PENDING",
 *         "total": 85.50,
 *         "customer": { ... },
 *         "items": [ ... ],
 *         ...
 *       }
 *     ],
 *     "pagination": {
 *       "page": 1,
 *       "pageSize": 20,
 *       "totalCount": 45,
 *       "totalPages": 3,
 *       "hasNext": true,
 *       "hasPrevious": false
 *     }
 *   },
 *   "meta": {
 *     "timestamp": "2025-01-...",
 *     "farmId": "farm_123"
 *   },
 *   "agricultural": {
 *     "season": "WINTER",
 *     "consciousness": "DIVINE",
 *     "orderFlow": "FARM_QUANTUM_RETRIEVAL",
 *     "farmName": "Green Valley Farm"
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    // Resolve slug to farmId
    const farm = await database.farm.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FARM_NOT_FOUND",
            message: "Farm not found",
          },
        },
        { status: 404 },
      );
    }

    // Call controller with farmId
    return orderController.getFarmOrders(request, { farmId: farm.id });
  } catch (error) {
    console.error("[FARM_ORDERS_SLUG_RESOLUTION_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FARM_ORDERS_ERROR",
          message: "Failed to fetch farm orders",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// DIVINE FARM ORDERS API - AGRICULTURAL CONSCIOUSNESS
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
// ✅ Farm ownership verification
// ✅ Role-based authorization
// ✅ 100% code reduction (new route)
//
// Divine Patterns Applied:
// - Thin controller pattern
// - Service layer delegation
// - Repository pattern
// - Standardized responses
// - Agricultural consciousness
// - Quantum efficiency
//
// Farm Order Features:
// - Real-time order tracking
// - Automatic filtering by farm
// - Farm ownership validation
// - Status management
// - Revenue tracking
// - Customer information
// - Fulfillment coordination
// - Inventory sync
//
// Use Cases:
// - Farmer dashboard order list
// - Order fulfillment tracking
// - Revenue analytics
// - Customer order history
// - Delivery scheduling
// - Inventory management
//
// Phase 3 Integration Complete ✅
// ============================================================================
