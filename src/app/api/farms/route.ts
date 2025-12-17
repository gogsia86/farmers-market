/**
 * 🚜 FARMS API ROUTE - USING DIVINE CONTROLLER PATTERN
 *
 * Handles farm listing and creation endpoints using the controller layer.
 * Demonstrates clean separation: Route → Controller → Service → Repository → Database
 *
 * Divine Patterns Applied:
 * - Controller pattern (HTTP concerns separated from business logic)
 * - Unified API response format
 * - Agricultural consciousness
 * - Rate limiting
 * - Lazy tracing integration
 * - Redis caching with stale-while-revalidate (NEW - Day 5)
 * - Response compression (Brotli/Gzip) (NEW - Day 5)
 * - 50ms target response time (NEW - Day 5)
 *
 * Performance Enhancements (Week 1, Day 5):
 * - GET requests cached for 10 minutes (600s TTL)
 * - Stale-while-revalidate: 2 minutes
 * - Automatic compression (Brotli preferred, Gzip fallback)
 * - Cache invalidation on POST/PUT/DELETE
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 * @reference .github/instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md
 */

import { NextRequest, NextResponse } from "next/server";
import { farmController } from "@/lib/controllers";
import {
  rateLimiters,
  createRateLimitResponse,
} from "@/lib/middleware/rate-limiter";
import { withApiCache, invalidateCacheByTag } from "@/lib/middleware/api-cache";
import { withCompression } from "@/lib/middleware/compression";

/**
 * GET /api/farms
 *
 * List farms with pagination and filtering
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * - status: "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE"
 * - city: string
 * - state: string
 * - sortBy: "name" | "createdAt" | "rating"
 * - sortOrder: "asc" | "desc"
 *
 * @example
 * GET /api/farms?page=1&limit=20&city=Seattle&status=ACTIVE
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [...farms],
 *   "meta": {
 *     "pagination": {
 *       "page": 1,
 *       "limit": 20,
 *       "total": 100,
 *       "totalPages": 5,
 *       "hasNext": true,
 *       "hasPrev": false
 *     }
 *   }
 * }
 */
export const GET = withCompression(
  withApiCache(async (request: NextRequest): Promise<NextResponse> => {
    // Apply rate limiting (public endpoint)
    const rateLimit = await rateLimiters.public.check(request);
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    // Delegate to controller
    // Response will be automatically cached (10 min TTL) and compressed
    return farmController.listFarms(request);
  }),
);

/**
 * POST /api/farms
 *
 * Create new farm (requires FARMER or ADMIN role)
 *
 * Request Body:
 * {
 *   "name": string (required, min 3 chars),
 *   "city": string (required),
 *   "state": string (required, 2-letter code),
 *   "description": string (optional),
 *   "story": string (optional),
 *   "businessName": string (optional),
 *   "yearEstablished": number (optional),
 *   "farmSize": number (optional),
 *   "address": string (optional),
 *   "zipCode": string (optional),
 *   "latitude": number (optional),
 *   "longitude": number (optional),
 *   "email": string (optional, must be valid email),
 *   "phone": string (optional),
 *   "website": string (optional, must be valid URL),
 *   "farmingPractices": string[] (optional),
 *   "productCategories": string[] (optional),
 *   "deliveryRadius": number (optional)
 * }
 *
 * @example
 * POST /api/farms
 * Body: {
 *   "name": "Divine Acres",
 *   "city": "Seattle",
 *   "state": "WA",
 *   "description": "Organic biodynamic farm",
 *   "farmingPractices": ["ORGANIC", "BIODYNAMIC"],
 *   "deliveryRadius": 50
 * }
 *
 * Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "farm-id",
 *     "name": "Divine Acres",
 *     "slug": "divine-acres-seattle",
 *     ...
 *   },
 *   "meta": {
 *     "slug": "divine-acres-seattle",
 *     "agricultural": {
 *       "consciousness": "DIVINE",
 *       "operation": "FARM_MANIFESTATION"
 *     }
 *   }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Apply rate limiting (authenticated endpoint, stricter limits)
  const rateLimit = await rateLimiters.api.check(request);
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  // Delegate to controller (authentication check happens in controller)
  const response = await farmController.createFarm(request);

  // Invalidate farms cache on successful creation
  if (response.status === 201) {
    await invalidateCacheByTag("farms");
    await invalidateCacheByTag("public");
  }

  return response;
}

/**
 * Divine farm routes established ✨🚜
 * Clean architecture with controller separation
 * Performance optimizations applied:
 * - ⚡ Redis caching (10min TTL, 2min stale)
 * - 🗜️ Response compression (Brotli/Gzip)
 * - 🎯 Target: 50ms response time
 * - 📊 Cache hit ratio: 70%+ expected
 * Ready for quantum agricultural operations at scale
 */
