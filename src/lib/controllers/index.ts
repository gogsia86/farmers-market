/**
 * 🎯 CONTROLLERS INDEX - DIVINE API LAYER EXPORTS
 *
 * Central export point for all controllers.
 * Following divine pattern of organized exports.
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 */

// Base Controller
export { BaseController } from "./base.controller";
export type {
  SuccessResponse,
  ErrorResponse,
  PaginationMeta,
  AgriculturalMetadata,
  ValidationErrorDetail,
  ApiResponse,
  AuthSession,
} from "./base.controller";

// Farm Controller
export { FarmController, farmController } from "./farm.controller";

/**
 * Divine controller layer established ✨
 * Unified API patterns for all agricultural operations
 * Ready to scale from 1 to 1 billion requests
 */
