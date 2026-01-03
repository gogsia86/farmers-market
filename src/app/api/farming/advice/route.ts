/**
 * 🔄 BACKWARD COMPATIBILITY ALIAS
 *
 * This route is deprecated and redirects to /api/farmers/resources/advice
 *
 * @deprecated Use /api/farmers/resources/advice instead
 * @see /api/farmers/resources/advice for the consolidated implementation
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
 * Deprecation configuration for farming advice endpoint
 */
const deprecationConfig = {
  oldEndpoint: "/api/farming/advice",
  newEndpoint: "/api/farmers/resources/advice",
  deprecationDate: "2025-12-01",
  sunsetDate: "2026-06-01",
  migrationGuide: "/docs/migrations/api-consolidation-guide.md",
};

/**
 * Create handlers for all HTTP methods using the reusable helper
 */
const handlers = createDeprecationHandlers(deprecationConfig);

/**
 * GET /api/farming/advice
 * @deprecated Redirects to /api/farmers/resources/advice
 */
export const GET = handlers.GET;

/**
 * POST /api/farming/advice
 * @deprecated Redirects to /api/farmers/resources/advice
 */
export const POST = handlers.POST;

/**
 * PUT /api/farming/advice
 * @deprecated Redirects to /api/farmers/resources/advice
 */
export const PUT = handlers.PUT;

/**
 * PATCH /api/farming/advice
 * @deprecated Redirects to /api/farmers/resources/advice
 */
export const PATCH = handlers.PATCH;

/**
 * DELETE /api/farming/advice
 * @deprecated Redirects to /api/farmers/resources/advice
 */
export const DELETE = handlers.DELETE;

/**
 * 🔔 DEPRECATION NOTICE
 *
 * This endpoint has been consolidated into /api/farmers/resources/advice
 *
 * Please update your integrations to use the new endpoint:
 * - Old: /api/farming/advice
 * - New: /api/farmers/resources/advice
 *
 * This alias provides automatic redirection and will be maintained
 * until June 1, 2026. After that date, this endpoint will return
 * 410 Gone.
 *
 * Benefits of migrating:
 * - Consistent API structure under /api/farmers/
 * - Better resource organization
 * - Enhanced farming advice features
 * - Improved documentation
 * - Long-term support
 *
 * See migration guide: /docs/migrations/api-consolidation-guide.md
 */
