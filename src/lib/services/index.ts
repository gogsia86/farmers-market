/**
 * SERVICE LAYER BARREL EXPORT
 * Canonical imports for all platform services
 *
 * Divine Patterns Applied:
 * - Single source of truth for service imports
 * - Consistent service access across the application
 * - Simplified dependency management
 *
 * Usage:
 * ```typescript
 * import { geocodingService, emailService } from "@/lib/services";
 * ```
 *
 * @module Services
 */

// ============================================================================
// GEOCODING SERVICE
// ============================================================================

export {
  geocodingService,
  GeocodingService,
  type GeocodeResult,
  type GeocodeOptions,
  type Coordinates,
} from "./geocoding.service";

// ============================================================================
// EMAIL SERVICE
// ============================================================================

export {
  emailService,
  EmailService,
  type EmailOptions,
  type WelcomeEmailData,
  type FarmApprovalEmailData,
  type FarmRejectionEmailData,
  type SupportTicketEmailData,
  type OrderConfirmationEmailData,
} from "../email/email.service";

// ============================================================================
// PRODUCT SERVICE
// ============================================================================

export { ProductService } from "./product.service";

// ============================================================================
// FARM SERVICE
// ============================================================================

export {
  farmService,
  FarmService,
  type CreateFarmRequest,
  type UpdateFarmRequest,
  type FarmServiceResult,
  type ListFarmsOptions,
  type ListFarmsResult,
} from "./farm.service";

// ============================================================================
// ORDER SERVICE
// ============================================================================

export { orderService, OrderService } from "./order.service";

// ============================================================================
// CART SERVICE
// ============================================================================

export { cartService, CartService } from "./cart.service";

// ============================================================================
// MARKETPLACE SERVICE
// ============================================================================

export {
  marketplaceService,
  MarketplaceService,
  type MarketplaceFilters,
  type ProductWithFarm,
  type MarketplaceProductsResult,
  type FeaturedFarm,
  type FeaturedFarmsResult,
  type SeasonalRecommendation,
} from "./marketplace.service";

// ============================================================================
// FARMER SERVICE
// ============================================================================

export {
  farmerService,
  FarmerService,
  type FarmerRegistrationData,
  type FarmerProfile,
  type FarmerDashboardStats,
  type FarmerVerificationStatus,
  type UpdateFarmerProfileData,
} from "./farmer.service";

// ============================================================================
// PAYMENT SERVICE
// ============================================================================

export { paymentService, PaymentService } from "./payment.service";

// ============================================================================
// SHIPPING SERVICE
// ============================================================================

export { ShippingService } from "./shipping.service";

/**
 * Service Layer Pattern
 *
 * All services follow these conventions:
 *
 * 1. **Singleton Pattern**: Export a singleton instance (e.g., `geocodingService`)
 * 2. **Class Export**: Export the class for testing/extension (e.g., `GeocodingService`)
 * 3. **Type Exports**: Export all related types for type safety
 * 4. **Error Handling**: All methods handle errors gracefully and return null/false on failure
 * 5. **Logging**: Use console.log with emoji prefixes for visibility
 * 6. **Agricultural Consciousness**: Domain-specific features where applicable
 *
 * Architecture:
 * ```
 * Route Handler / Component
 *        ↓
 *   Service Layer (this file)
 *        ↓
 *   Repository Layer (database access)
 *        ↓
 *   Database (Prisma)
 * ```
 */
