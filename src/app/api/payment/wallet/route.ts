/**
 * 🔄 BACKWARD COMPATIBILITY ALIAS
 *
 * This route is deprecated and redirects to /api/payments/wallet
 *
 * @deprecated Use /api/payments/wallet instead
 * @see /api/payments/wallet for the consolidated implementation
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
 * Deprecation configuration for payment wallet endpoint
 */
const deprecationConfig = {
  oldEndpoint: "/api/payment/wallet",
  newEndpoint: "/api/payments/wallet",
  deprecationDate: "2025-12-01",
  sunsetDate: "2026-06-01",
  migrationGuide: "/docs/migrations/api-consolidation-guide.md",
};

/**
 * Create handlers for all HTTP methods using the reusable helper
 */
const handlers = createDeprecationHandlers(deprecationConfig);

/**
 * GET /api/payment/wallet
 * @deprecated Redirects to /api/payments/wallet
 */
export const GET = handlers.GET;

/**
 * POST /api/payment/wallet
 * @deprecated Redirects to /api/payments/wallet
 */
export const POST = handlers.POST;

/**
 * PUT /api/payment/wallet
 * @deprecated Redirects to /api/payments/wallet
 */
export const PUT = handlers.PUT;

/**
 * PATCH /api/payment/wallet
 * @deprecated Redirects to /api/payments/wallet
 */
export const PATCH = handlers.PATCH;

/**
 * DELETE /api/payment/wallet
 * @deprecated Redirects to /api/payments/wallet
 */
export const DELETE = handlers.DELETE;

/**
 * 🔔 DEPRECATION NOTICE
 *
 * This endpoint has been consolidated into /api/payments/wallet
 *
 * Please update your integrations to use the new endpoint:
 * - Old: /api/payment/wallet
 * - New: /api/payments/wallet
 *
 * This alias provides automatic redirection and will be maintained
 * until June 1, 2026. After that date, this endpoint will return
 * 410 Gone.
 *
 * Benefits of migrating:
 * - Consistent API structure under /api/payments/
 * - Better payment organization
 * - Enhanced wallet features
 * - Improved documentation
 * - Long-term support
 *
 * See migration guide: /docs/migrations/api-consolidation-guide.md
 */
