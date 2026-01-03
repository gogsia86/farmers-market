/**
 * 🔄 BACKWARD COMPATIBILITY ALIAS
 *
 * This route is deprecated and redirects to /api/agricultural/consciousness
 *
 * @deprecated Use /api/agricultural/consciousness instead
 * @see /api/agricultural/consciousness for the consolidated implementation
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
 * Deprecation configuration for agricultural consciousness endpoint
 */
const deprecationConfig = {
  oldEndpoint: "/api/agricultural-consciousness",
  newEndpoint: "/api/agricultural/consciousness",
  deprecationDate: "2025-12-01",
  sunsetDate: "2026-06-01",
  migrationGuide: "/docs/migrations/api-consolidation-guide.md",
};

/**
 * Create handlers for all HTTP methods using the reusable helper
 */
const handlers = createDeprecationHandlers(deprecationConfig);

/**
 * GET /api/agricultural-consciousness
 * @deprecated Redirects to /api/agricultural/consciousness
 */
export const GET = handlers.GET;

/**
 * POST /api/agricultural-consciousness
 * @deprecated Redirects to /api/agricultural/consciousness
 */
export const POST = handlers.POST;

/**
 * PUT /api/agricultural-consciousness
 * @deprecated Redirects to /api/agricultural/consciousness
 */
export const PUT = handlers.PUT;

/**
 * PATCH /api/agricultural-consciousness
 * @deprecated Redirects to /api/agricultural/consciousness
 */
export const PATCH = handlers.PATCH;

/**
 * DELETE /api/agricultural-consciousness
 * @deprecated Redirects to /api/agricultural/consciousness
 */
export const DELETE = handlers.DELETE;

/**
 * 🔔 DEPRECATION NOTICE
 *
 * This endpoint has been consolidated into /api/agricultural/consciousness
 *
 * Please update your integrations to use the new endpoint:
 * - Old: /api/agricultural-consciousness
 * - New: /api/agricultural/consciousness
 *
 * This alias provides automatic redirection and will be maintained
 * until June 1, 2026. After that date, this endpoint will return
 * 410 Gone.
 *
 * Benefits of migrating:
 * - Consistent API structure under /api/agricultural/
 * - Better resource organization
 * - Enhanced agricultural consciousness features
 * - Improved documentation
 * - Long-term support
 *
 * See migration guide: /docs/migrations/api-consolidation-guide.md
 */
