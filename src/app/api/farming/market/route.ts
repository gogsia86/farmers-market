/**
 * 🔄 BACKWARD COMPATIBILITY ALIAS
 *
 * This route is deprecated and redirects to /api/farmers/resources/market
 *
 * @deprecated Use /api/farmers/resources/market instead
 * @see /api/farmers/resources/market for the consolidated implementation
 *
 * Migration Timeline:
 * - Deprecated: December 2025
 * - Sunset Date: June 1, 2026
 *
 * This alias will be maintained until the sunset date to ensure
 * backward compatibility with existing integrations.
 */

import { createDeprecationHandlers } from "@/lib/api/deprecation-alias";

/**
 * Deprecation configuration for farming market endpoint
 */
const deprecationConfig = {
  oldEndpoint: "/api/farming/market",
  newEndpoint: "/api/farmers/resources/market",
  deprecationDate: "2025-12-01",
  sunsetDate: "2026-06-01",
  migrationGuide: "/docs/migrations/api-consolidation-guide.md",
};

/**
 * Create handlers for all HTTP methods using the reusable helper
 */
const handlers = createDeprecationHandlers(deprecationConfig);

/**
 * GET /api/farming/market
 * @deprecated Redirects to /api/farmers/resources/market
 */
export const GET = handlers.GET;

/**
 * POST /api/farming/market
 * @deprecated Redirects to /api/farmers/resources/market
 */
export const POST = handlers.POST;

/**
 * PUT /api/farming/market
 * @deprecated Redirects to /api/farmers/resources/market
 */
export const PUT = handlers.PUT;

/**
 * PATCH /api/farming/market
 * @deprecated Redirects to /api/farmers/resources/market
 */
export const PATCH = handlers.PATCH;

/**
 * DELETE /api/farming/market
 * @deprecated Redirects to /api/farmers/resources/market
 */
export const DELETE = handlers.DELETE;

/**
 * 🔔 DEPRECATION NOTICE
 *
 * This endpoint has been consolidated into /api/farmers/resources/market
 *
 * Please update your integrations to use the new endpoint:
 * - Old: /api/farming/market
 * - New: /api/farmers/resources/market
 *
 * This alias provides automatic redirection and will be maintained
 * until June 1, 2026. After that date, this endpoint will return
 * 410 Gone.
 *
 * Benefits of migrating:
 * - Consistent API structure under /api/farmers/
 * - Better resource organization
 * - Enhanced market insights features
 * - Improved documentation
 * - Long-term support
 *
 * See migration guide: /docs/migrations/api-consolidation-guide.md
 */
