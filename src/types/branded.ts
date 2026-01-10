/**
 * 🏷️ BRANDED TYPES - TYPE-SAFE IDs
 *
 * Prevents accidentally mixing different entity IDs at compile time.
 * Uses TypeScript's branded type pattern for zero runtime overhead.
 *
 * Divine Patterns Applied:
 * - Type-level branding (compile-time safety)
 * - Zero runtime cost
 * - Agricultural consciousness
 *
 * @reference .github/instructions/01_DIVINE_CORE_PRINCIPLES.instructions.md
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 *
 * @example
 * ```typescript
 * // ✅ CORRECT - Type-safe ID usage
 * const farmId: FarmId = "farm_123" as FarmId;
 * const farm = await getFarmById(farmId);
 *
 * // ❌ COMPILE ERROR - Prevents mixing ID types
 * const productId: ProductId = "product_456" as ProductId;
 * const farm = await getFarmById(productId); // Type error!
 * ```
 */

// ============================================================================
// BRAND TYPE HELPER
// ============================================================================

/**
 * Brand<K, T> creates a branded type that prevents mixing different types
 * even if they have the same underlying structure.
 *
 * @template K - The base type (usually string)
 * @template T - The brand/tag to distinguish this type
 */
type Brand<K, T> = K & { readonly __brand: T };

// ============================================================================
// ENTITY ID TYPES
// ============================================================================

/**
 * Unique identifier for Farm entities
 * @example "farm_clh8x1a2b3c4d5e6f7g8h9i0"
 */
export type FarmId = Brand<string, "FarmId">;

/**
 * Unique identifier for User entities
 * @example "user_clh8x1a2b3c4d5e6f7g8h9i0"
 */
export type UserId = Brand<string, "UserId">;

/**
 * Unique identifier for Product entities
 * @example "product_clh8x1a2b3c4d5e6f7g8h9i0"
 */
export type ProductId = Brand<string, "ProductId">;

/**
 * Unique identifier for Order entities
 * @example "order_clh8x1a2b3c4d5e6f7g8h9i0"
 */
export type OrderId = Brand<string, "OrderId">;

/**
 * Unique identifier for Cart entities
 * @example "cart_clh8x1a2b3c4d5e6f7g8h9i0"
 */
export type CartId = Brand<string, "CartId">;

/**
 * Unique identifier for CartItem entities
 * @example "cartitem_clh8x1a2b3c4d5e6f7g8h9i0"
 */
export type CartItemId = Brand<string, "CartItemId">;

/**
 * Unique identifier for Review entities
 * @example "review_clh8x1a2b3c4d5e6f7g8h9i0"
 */
export type ReviewId = Brand<string, "ReviewId">;

/**
 * Unique identifier for Notification entities
 * @example "notification_clh8x1a2b3c4d5e6f7g8h9i0"
 */
export type NotificationId = Brand<string, "NotificationId">;

/**
 * Unique identifier for Payment entities
 * @example "payment_clh8x1a2b3c4d5e6f7g8h9i0"
 */
export type PaymentId = Brand<string, "PaymentId">;

/**
 * Unique identifier for Shipment entities
 * @example "shipment_clh8x1a2b3c4d5e6f7g8h9i0"
 */
export type ShipmentId = Brand<string, "ShipmentId">;

// ============================================================================
// BRAND CASTING HELPERS
// ============================================================================

/**
 * Safely cast a string to a branded ID type
 * Use sparingly - typically at API boundaries or when parsing external data
 *
 * @example
 * ```typescript
 * const farmId = brandId<FarmId>("farm_123");
 * const farm = await getFarmById(farmId);
 * ```
 */
export function brandId<T extends Brand<string, string>>(id: string): T {
  return id as T;
}

/**
 * Remove the brand from an ID to get the raw string
 * Useful when interacting with external APIs or non-typed code
 *
 * @example
 * ```typescript
 * const farmId: FarmId = "farm_123" as FarmId;
 * const rawId: string = unbrandId(farmId);
 * ```
 */
export function unbrandId<T extends Brand<string, string>>(id: T): string {
  return id as string;
}

/**
 * Type guard to check if a string is a valid branded ID format
 * Validates the prefix matches the expected entity type
 *
 * @example
 * ```typescript
 * if (isFarmId(someString)) {
 *   const farm = await getFarmById(someString as FarmId);
 * }
 * ```
 */
export function isFarmId(id: string): id is FarmId {
  return id.startsWith("farm_") || id.startsWith("clh"); // Prisma CUID format
}

export function isUserId(id: string): id is UserId {
  return id.startsWith("user_") || id.startsWith("clh");
}

export function isProductId(id: string): id is ProductId {
  return id.startsWith("product_") || id.startsWith("clh");
}

export function isOrderId(id: string): id is OrderId {
  return id.startsWith("order_") || id.startsWith("clh");
}

export function isCartId(id: string): id is CartId {
  return id.startsWith("cart_") || id.startsWith("clh");
}

export function isNotificationId(id: string): id is NotificationId {
  return id.startsWith("notification_") || id.startsWith("clh");
}

// ============================================================================
// BULK ID OPERATIONS
// ============================================================================

/**
 * Brand an array of string IDs to a specific type
 *
 * @example
 * ```typescript
 * const rawIds = ["farm_1", "farm_2", "farm_3"];
 * const farmIds = brandIds<FarmId>(rawIds);
 * ```
 */
export function brandIds<T extends Brand<string, string>>(ids: string[]): T[] {
  return ids.map((id: any) => id as T);
}

/**
 * Unbrand an array of branded IDs to raw strings
 *
 * @example
 * ```typescript
 * const farmIds: FarmId[] = ["farm_1" as FarmId, "farm_2" as FarmId];
 * const rawIds = unbrandIds(farmIds);
 * ```
 */
export function unbrandIds<T extends Brand<string, string>>(
  ids: T[],
): string[] {
  return ids.map((id: any) => id as string);
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate and brand an ID, throwing if invalid
 *
 * @throws {Error} If ID format is invalid
 *
 * @example
 * ```typescript
 * const farmId = validateAndBrandFarmId("farm_123");
 * // Throws if invalid format
 * ```
 */
export function validateAndBrandFarmId(id: string): FarmId {
  if (!isFarmId(id)) {
    throw new Error(`Invalid farm ID format: ${id}`);
  }
  return id as FarmId;
}

export function validateAndBrandUserId(id: string): UserId {
  if (!isUserId(id)) {
    throw new Error(`Invalid user ID format: ${id}`);
  }
  return id as UserId;
}

export function validateAndBrandProductId(id: string): ProductId {
  if (!isProductId(id)) {
    throw new Error(`Invalid product ID format: ${id}`);
  }
  return id as ProductId;
}

export function validateAndBrandOrderId(id: string): OrderId {
  if (!isOrderId(id)) {
    throw new Error(`Invalid order ID format: ${id}`);
  }
  return id as OrderId;
}

// ============================================================================
// ZOD SCHEMA INTEGRATION (Optional)
// ============================================================================

/**
 * Zod schemas for branded ID validation
 * Import zod separately if needed
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 *
 * const FarmIdSchema = z.string().refine(isFarmId).transform(id => id as FarmId);
 *
 * const CreateOrderSchema = z.object({
 *   farmId: FarmIdSchema,
 *   userId: z.string().refine(isUserId).transform(id => id as UserId),
 * });
 * ```
 */

// ============================================================================
// TYPE UTILITIES
// ============================================================================

/**
 * Extract the base type from a branded type
 *
 * @example
 * ```typescript
 * type Base = UnBrand<FarmId>; // string
 * ```
 */
export type UnBrand<T> = T extends Brand<infer K, unknown> ? K : T;

/**
 * Extract the brand tag from a branded type
 *
 * @example
 * ```typescript
 * type Tag = BrandTag<FarmId>; // "FarmId"
 * ```
 */
export type BrandTag<T> = T extends Brand<unknown, infer Tag> ? Tag : never;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * @example Service Layer Usage
 *
 * ```typescript
 * import { FarmId, UserId, brandId } from '@/types/branded';
 *
 * class FarmService {
 *   async getFarmById(id: FarmId): Promise<Farm | null> {
 *     return await database.farm.findUnique({
 *       where: { id: unbrandId(id) }
 *     });
 *   }
 *
 *   async getFarmsByOwnerId(ownerId: UserId): Promise<Farm[]> {
 *     return await database.farm.findMany({
 *       where: { ownerId: unbrandId(ownerId) }
 *     });
 *   }
 * }
 * ```
 */

/**
 * @example API Route Usage
 *
 * ```typescript
 * import { validateAndBrandFarmId } from '@/types/branded';
 *
 * export async function GET(
 *   request: NextRequest,
 *   { params }: { params: { id: string } }
 * ) {
 *   try {
 *     const farmId = validateAndBrandFarmId(params.id);
 *     const farm = await farmService.getFarmById(farmId);
 *     return NextResponse.json({ success: true, data: farm });
 *   } catch (error) {
 *     return NextResponse.json({ success: false, error: error.message }, { status: 400 });
 *   }
 * }
 * ```
 */

/**
 * @example Type Safety Demonstration
 *
 * ```typescript
 * // ✅ Compile-time safety
 * const farmId: FarmId = "farm_123" as FarmId;
 * const productId: ProductId = "product_456" as ProductId;
 *
 * getFarmById(farmId); // ✅ Works
 * getFarmById(productId); // ❌ Type error - prevents bugs!
 *
 * // ✅ Runtime validation
 * const userInput = request.query.get('farmId');
 * if (isFarmId(userInput)) {
 *   const farm = await getFarmById(userInput as FarmId);
 * }
 * ```
 */

/**
 * Divine branded types established ✨
 * Zero runtime overhead, maximum type safety
 * Agricultural consciousness preserved
 */
