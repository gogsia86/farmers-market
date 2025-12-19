/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔄 USER INTERACTION UTILITIES - QUERY HELPERS                   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Purpose: Helper utilities for UserInteraction queries           ║
 * ║  Features:                                                       ║
 * ║    • Product interaction queries                                ║
 * ║    • Type-safe interaction filtering                            ║
 * ║    • Agricultural context handling                              ║
 * ║  Version: 1.0.0                                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { Prisma, InteractionType } from "@prisma/client";

/**
 * Map interaction types to appropriate values
 * UserInteraction uses 'type' field with InteractionType enum
 */
export const InteractionTypeMap = {
  VIEW: "VIEW" as InteractionType,
  CLICK: "CLICK" as InteractionType,
  SEARCH: "SEARCH" as InteractionType,
  PURCHASE: "PURCHASE" as InteractionType,
  ADD_TO_CART: "ADD_TO_CART" as InteractionType,
  FAVORITE: "FAVORITE" as InteractionType,
  SHARE: "SHARE" as InteractionType,
  REVIEW: "REVIEW" as InteractionType,
} as const;

/**
 * Create where clause for product interactions
 * @param productId - Product ID to filter by
 * @param interactionTypes - Array of interaction types
 * @returns Prisma where clause
 */
export function createProductInteractionWhere(
  productId: string,
  interactionTypes?: InteractionType[],
): Prisma.UserInteractionWhereInput {
  const where: Prisma.UserInteractionWhereInput = {
    entityType: "product",
    entityId: productId,
  };

  if (interactionTypes && interactionTypes.length > 0) {
    where.type = { in: interactionTypes };
  }

  return where;
}

/**
 * Create where clause for multiple product interactions
 * @param productIds - Array of product IDs
 * @param interactionTypes - Array of interaction types
 * @returns Prisma where clause
 */
export function createProductsInteractionWhere(
  productIds: string[],
  interactionTypes?: InteractionType[],
): Prisma.UserInteractionWhereInput {
  const where: Prisma.UserInteractionWhereInput = {
    entityType: "product",
    entityId: { in: productIds },
  };

  if (interactionTypes && interactionTypes.length > 0) {
    where.type = { in: interactionTypes };
  }

  return where;
}

/**
 * Create where clause for user product interactions
 * @param userId - User ID
 * @param interactionTypes - Array of interaction types
 * @returns Prisma where clause
 */
export function createUserProductInteractionsWhere(
  userId: string,
  interactionTypes?: InteractionType[],
): Prisma.UserInteractionWhereInput {
  const where: Prisma.UserInteractionWhereInput = {
    userId,
    entityType: "product",
  };

  if (interactionTypes && interactionTypes.length > 0) {
    where.type = { in: interactionTypes };
  }

  return where;
}

/**
 * Create where clause for farm interactions
 * @param farmId - Farm ID to filter by
 * @param interactionTypes - Array of interaction types
 * @returns Prisma where clause
 */
export function createFarmInteractionWhere(
  farmId: string,
  interactionTypes?: InteractionType[],
): Prisma.UserInteractionWhereInput {
  const where: Prisma.UserInteractionWhereInput = {
    entityType: "farm",
    entityId: farmId,
  };

  if (interactionTypes && interactionTypes.length > 0) {
    where.type = { in: interactionTypes };
  }

  return where;
}

/**
 * Get product ID from interaction
 * @param interaction - UserInteraction record
 * @returns Product ID if interaction is product-related, null otherwise
 */
export function getProductIdFromInteraction(interaction: {
  entityType: string;
  entityId: string;
}): string | null {
  return interaction.entityType === "product" ? interaction.entityId : null;
}

/**
 * Get farm ID from interaction
 * @param interaction - UserInteraction record
 * @returns Farm ID if interaction is farm-related, null otherwise
 */
export function getFarmIdFromInteraction(interaction: {
  entityType: string;
  entityId: string;
}): string | null {
  return interaction.entityType === "farm" ? interaction.entityId : null;
}

/**
 * Calculate interaction weight based on type
 * @param type - Interaction type
 * @returns Weight value (higher = more important)
 */
export function getInteractionWeight(type: InteractionType): number {
  const weights: Record<InteractionType, number> = {
    PURCHASE: 5.0,
    ADD_TO_CART: 3.0,
    FAVORITE: 2.5,
    REVIEW: 2.0,
    SHARE: 1.5,
    VIEW: 1.0,
    CLICK: 0.8,
    SEARCH: 0.5,
  };

  return weights[type] || 0.5;
}

/**
 * Check if interaction type is a high-value action
 * @param type - Interaction type
 * @returns True if high-value action
 */
export function isHighValueInteraction(type: InteractionType): boolean {
  const highValueTypes: InteractionType[] = [
    "PURCHASE",
    "ADD_TO_CART",
    "FAVORITE",
    "REVIEW",
  ];
  return highValueTypes.includes(type);
}

/**
 * Get product interaction types for collaborative filtering
 * @returns Array of interaction types useful for recommendations
 */
export function getCollaborativeFilteringTypes(): InteractionType[] {
  return ["VIEW", "ADD_TO_CART", "PURCHASE", "FAVORITE"];
}

/**
 * Get product interaction types for trending analysis
 * @returns Array of interaction types for trending products
 */
export function getTrendingInteractionTypes(): InteractionType[] {
  return ["VIEW", "ADD_TO_CART", "PURCHASE"];
}

/**
 * Create aggregation for product interactions
 * @returns Prisma groupBy configuration
 */
export function createProductInteractionAggregation(): {
  by: Prisma.UserInteractionScalarFieldEnum[];
  _count: Prisma.UserInteractionCountAggregateInputType;
} {
  return {
    by: ["entityId"],
    _count: {
      id: true,
    },
  };
}

/**
 * Extract product IDs from interactions
 * @param interactions - Array of interactions
 * @returns Array of unique product IDs
 */
export function extractProductIdsFromInteractions(
  interactions: Array<{ entityType: string; entityId: string }>,
): string[] {
  return [
    ...new Set(
      interactions
        .filter((i) => i.entityType === "product")
        .map((i) => i.entityId),
    ),
  ];
}

/**
 * Extract farm IDs from interactions
 * @param interactions - Array of interactions
 * @returns Array of unique farm IDs
 */
export function extractFarmIdsFromInteractions(
  interactions: Array<{ entityType: string; entityId: string }>,
): string[] {
  return [
    ...new Set(
      interactions
        .filter((i) => i.entityType === "farm")
        .map((i) => i.entityId),
    ),
  ];
}

/**
 * Create agricultural context for interaction
 * @param season - Current season
 * @param source - Interaction source
 * @returns Agricultural context object
 */
export function createAgriculturalContext(
  season?: string,
  source?: string,
): Record<string, any> {
  return {
    season: season || "UNKNOWN",
    source: source || "web",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Parse agricultural context from interaction metadata
 * @param metadata - Interaction metadata
 * @returns Parsed agricultural context
 */
export function parseAgriculturalContext(metadata: any): {
  season?: string;
  source?: string;
  location?: string;
} {
  if (!metadata || typeof metadata !== "object") {
    return {};
  }

  return {
    season: metadata.season,
    source: metadata.source,
    location: metadata.location,
  };
}
