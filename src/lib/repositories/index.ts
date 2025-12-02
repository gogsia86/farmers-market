/**
 * 🏗️ REPOSITORY LAYER - DIVINE EXPORTS
 *
 * Central export point for all repositories following kilo-scale architecture.
 * Single source of truth for database access patterns.
 *
 * Divine Patterns Applied:
 * - Repository pattern (isolates database operations)
 * - Single point of import for all repositories
 * - Type-safe exports
 * - Agricultural consciousness throughout
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md
 *
 * @example
 * ```typescript
 * // Import base repository for extending
 * import { BaseRepository } from "@/lib/repositories";
 *
 * // Import specific repository
 * import { farmRepository, type QuantumFarm } from "@/lib/repositories";
 *
 * // Use in service
 * const farm = await farmRepository.findBySlug("divine-acres-seattle");
 * ```
 */

// ============================================================================
// BASE REPOSITORY
// ============================================================================

export {
  BaseRepository,
  type RepositoryOptions,
  type RepositoryWithTransaction,
} from "./base.repository";

// ============================================================================
// FARM REPOSITORY
// ============================================================================

export {
  QuantumFarmRepository,
  farmRepository,
  type QuantumFarm,
  type FarmSearchResult,
} from "./farm.repository";

// ============================================================================
// PRODUCT REPOSITORY
// ============================================================================

export {
  QuantumProductRepository,
  productRepository,
  type QuantumProduct,
  type ProductSearchFilters,
  type ProductWithAvailability,
} from "./product.repository";

// ============================================================================
// ORDER REPOSITORY (Coming Soon)
// ============================================================================

// TODO: Implement OrderRepository
// export {
//   QuantumOrderRepository,
//   orderRepository,
//   type QuantumOrder
// } from "./order.repository";

// ============================================================================
// USER REPOSITORY (Coming Soon)
// ============================================================================

// TODO: Implement UserRepository
// export {
//   QuantumUserRepository,
//   userRepository,
//   type QuantumUser
// } from "./user.repository";

/**
 * Repository layer divine perfection achieved ✨
 * Database access isolated for maximum testability
 * Agricultural consciousness integrated at foundation
 * Ready to scale from 1 to 1 billion users with quantum efficiency
 */
