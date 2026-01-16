/**
 * 🔄 Interaction Utilities Test Suite
 * Comprehensive tests for user interaction query helpers and agricultural context
 */

import {
    InteractionTypeMap,
    createAgriculturalContext,
    createFarmInteractionWhere,
    createProductInteractionAggregation,
    createProductInteractionWhere,
    createProductsInteractionWhere,
    createUserProductInteractionsWhere,
    extractFarmIdsFromInteractions,
    extractProductIdsFromInteractions,
    getCollaborativeFilteringTypes,
    getFarmIdFromInteraction,
    getInteractionWeight,
    getProductIdFromInteraction,
    getTrendingInteractionTypes,
    isHighValueInteraction,
    parseAgriculturalContext,
} from "@/lib/utils/interaction.utils";
import { describe, expect, it } from "@jest/globals";

// ============================================================================
// InteractionTypeMap Tests
// ============================================================================

describe("🔄 Interaction Utilities", () => {
  describe("InteractionTypeMap", () => {
    it("should have VIEW type", () => {
      expect(InteractionTypeMap.VIEW).toBe("VIEW");
    });

    it("should have CLICK type", () => {
      expect(InteractionTypeMap.CLICK).toBe("CLICK");
    });

    it("should have SEARCH type", () => {
      expect(InteractionTypeMap.SEARCH).toBe("SEARCH");
    });

    it("should have PURCHASE type", () => {
      expect(InteractionTypeMap.PURCHASE).toBe("PURCHASE");
    });

    it("should have ADD_TO_CART type", () => {
      expect(InteractionTypeMap.ADD_TO_CART).toBe("ADD_TO_CART");
    });

    it("should have FAVORITE type", () => {
      expect(InteractionTypeMap.FAVORITE).toBe("FAVORITE");
    });

    it("should have SHARE type", () => {
      expect(InteractionTypeMap.SHARE).toBe("SHARE");
    });

    it("should have REVIEW type", () => {
      expect(InteractionTypeMap.REVIEW).toBe("REVIEW");
    });

    it("should have 8 interaction types", () => {
      expect(Object.keys(InteractionTypeMap).length).toBe(8);
    });
  });

  // ============================================================================
  // createProductInteractionWhere Tests
  // ============================================================================

  describe("createProductInteractionWhere", () => {
    it("should create basic where clause", () => {
      const where = createProductInteractionWhere("prod_123");

      expect(where.entityType).toBe("product");
      expect(where.entityId).toBe("prod_123");
    });

    it("should include interaction types when provided", () => {
      const where = createProductInteractionWhere("prod_123", ["VIEW", "CLICK"]);

      expect(where.type).toEqual({ in: ["VIEW", "CLICK"] });
    });

    it("should not include type filter when types not provided", () => {
      const where = createProductInteractionWhere("prod_123");

      expect(where.type).toBeUndefined();
    });

    it("should handle empty interaction types array", () => {
      const where = createProductInteractionWhere("prod_123", []);

      expect(where.type).toBeUndefined();
    });

    it("should handle single interaction type", () => {
      const where = createProductInteractionWhere("prod_123", ["PURCHASE"]);

      expect(where.type).toEqual({ in: ["PURCHASE"] });
    });

    it("should handle all interaction types", () => {
      const types = ["VIEW", "CLICK", "SEARCH", "PURCHASE", "ADD_TO_CART", "FAVORITE", "SHARE", "REVIEW"];
      const where = createProductInteractionWhere("prod_123", types as any);

      expect(where.type).toEqual({ in: types });
    });

    it("should handle different product IDs", () => {
      const where1 = createProductInteractionWhere("prod_abc");
      const where2 = createProductInteractionWhere("prod_xyz");

      expect(where1.entityId).toBe("prod_abc");
      expect(where2.entityId).toBe("prod_xyz");
    });
  });

  // ============================================================================
  // createProductsInteractionWhere Tests
  // ============================================================================

  describe("createProductsInteractionWhere", () => {
    it("should create where clause for multiple products", () => {
      const where = createProductsInteractionWhere(["prod_1", "prod_2", "prod_3"]);

      expect(where.entityType).toBe("product");
      expect(where.entityId).toEqual({ in: ["prod_1", "prod_2", "prod_3"] });
    });

    it("should include interaction types when provided", () => {
      const where = createProductsInteractionWhere(["prod_1", "prod_2"], ["VIEW", "PURCHASE"]);

      expect(where.type).toEqual({ in: ["VIEW", "PURCHASE"] });
    });

    it("should handle single product ID", () => {
      const where = createProductsInteractionWhere(["prod_1"]);

      expect(where.entityId).toEqual({ in: ["prod_1"] });
    });

    it("should handle empty product IDs array", () => {
      const where = createProductsInteractionWhere([]);

      expect(where.entityId).toEqual({ in: [] });
    });

    it("should handle empty interaction types", () => {
      const where = createProductsInteractionWhere(["prod_1"], []);

      expect(where.type).toBeUndefined();
    });

    it("should handle many product IDs", () => {
      const ids = Array.from({ length: 100 }, (_, i) => `prod_${i}`);
      const where = createProductsInteractionWhere(ids);

      expect(where.entityId).toEqual({ in: ids });
    });
  });

  // ============================================================================
  // createUserProductInteractionsWhere Tests
  // ============================================================================

  describe("createUserProductInteractionsWhere", () => {
    it("should create where clause for user", () => {
      const where = createUserProductInteractionsWhere("user_123");

      expect(where.userId).toBe("user_123");
      expect(where.entityType).toBe("product");
    });

    it("should include interaction types when provided", () => {
      const where = createUserProductInteractionsWhere("user_123", ["FAVORITE", "PURCHASE"]);

      expect(where.type).toEqual({ in: ["FAVORITE", "PURCHASE"] });
    });

    it("should handle different user IDs", () => {
      const where1 = createUserProductInteractionsWhere("user_abc");
      const where2 = createUserProductInteractionsWhere("user_xyz");

      expect(where1.userId).toBe("user_abc");
      expect(where2.userId).toBe("user_xyz");
    });

    it("should handle no interaction types", () => {
      const where = createUserProductInteractionsWhere("user_123");

      expect(where.type).toBeUndefined();
    });

    it("should handle empty interaction types array", () => {
      const where = createUserProductInteractionsWhere("user_123", []);

      expect(where.type).toBeUndefined();
    });

    it("should always set entityType to product", () => {
      const where = createUserProductInteractionsWhere("user_123", ["VIEW"]);

      expect(where.entityType).toBe("product");
    });
  });

  // ============================================================================
  // createFarmInteractionWhere Tests
  // ============================================================================

  describe("createFarmInteractionWhere", () => {
    it("should create basic where clause for farm", () => {
      const where = createFarmInteractionWhere("farm_123");

      expect(where.entityType).toBe("farm");
      expect(where.entityId).toBe("farm_123");
    });

    it("should include interaction types when provided", () => {
      const where = createFarmInteractionWhere("farm_123", ["VIEW", "FAVORITE"]);

      expect(where.type).toEqual({ in: ["VIEW", "FAVORITE"] });
    });

    it("should handle no interaction types", () => {
      const where = createFarmInteractionWhere("farm_123");

      expect(where.type).toBeUndefined();
    });

    it("should handle different farm IDs", () => {
      const where1 = createFarmInteractionWhere("farm_abc");
      const where2 = createFarmInteractionWhere("farm_xyz");

      expect(where1.entityId).toBe("farm_abc");
      expect(where2.entityId).toBe("farm_xyz");
    });

    it("should handle all interaction types", () => {
      const types = ["VIEW", "CLICK", "FAVORITE"];
      const where = createFarmInteractionWhere("farm_123", types as any);

      expect(where.type).toEqual({ in: types });
    });
  });

  // ============================================================================
  // getProductIdFromInteraction Tests
  // ============================================================================

  describe("getProductIdFromInteraction", () => {
    it("should return product ID for product interaction", () => {
      const interaction = {
        entityType: "product",
        entityId: "prod_123",
      };

      expect(getProductIdFromInteraction(interaction)).toBe("prod_123");
    });

    it("should return null for farm interaction", () => {
      const interaction = {
        entityType: "farm",
        entityId: "farm_123",
      };

      expect(getProductIdFromInteraction(interaction)).toBeNull();
    });

    it("should return null for other entity types", () => {
      const interaction = {
        entityType: "order",
        entityId: "order_123",
      };

      expect(getProductIdFromInteraction(interaction)).toBeNull();
    });

    it("should handle different product IDs", () => {
      const interaction1 = { entityType: "product", entityId: "prod_abc" };
      const interaction2 = { entityType: "product", entityId: "prod_xyz" };

      expect(getProductIdFromInteraction(interaction1)).toBe("prod_abc");
      expect(getProductIdFromInteraction(interaction2)).toBe("prod_xyz");
    });

    it("should be case sensitive for entity type", () => {
      const interaction = {
        entityType: "Product",
        entityId: "prod_123",
      };

      expect(getProductIdFromInteraction(interaction)).toBeNull();
    });
  });

  // ============================================================================
  // getFarmIdFromInteraction Tests
  // ============================================================================

  describe("getFarmIdFromInteraction", () => {
    it("should return farm ID for farm interaction", () => {
      const interaction = {
        entityType: "farm",
        entityId: "farm_123",
      };

      expect(getFarmIdFromInteraction(interaction)).toBe("farm_123");
    });

    it("should return null for product interaction", () => {
      const interaction = {
        entityType: "product",
        entityId: "prod_123",
      };

      expect(getFarmIdFromInteraction(interaction)).toBeNull();
    });

    it("should return null for other entity types", () => {
      const interaction = {
        entityType: "order",
        entityId: "order_123",
      };

      expect(getFarmIdFromInteraction(interaction)).toBeNull();
    });

    it("should handle different farm IDs", () => {
      const interaction1 = { entityType: "farm", entityId: "farm_abc" };
      const interaction2 = { entityType: "farm", entityId: "farm_xyz" };

      expect(getFarmIdFromInteraction(interaction1)).toBe("farm_abc");
      expect(getFarmIdFromInteraction(interaction2)).toBe("farm_xyz");
    });
  });

  // ============================================================================
  // getInteractionWeight Tests
  // ============================================================================

  describe("getInteractionWeight", () => {
    it("should return highest weight for PURCHASE", () => {
      expect(getInteractionWeight("PURCHASE")).toBe(5.0);
    });

    it("should return weight for ADD_TO_CART", () => {
      expect(getInteractionWeight("ADD_TO_CART")).toBe(3.0);
    });

    it("should return weight for FAVORITE", () => {
      expect(getInteractionWeight("FAVORITE")).toBe(2.5);
    });

    it("should return weight for REVIEW", () => {
      expect(getInteractionWeight("REVIEW")).toBe(2.0);
    });

    it("should return weight for SHARE", () => {
      expect(getInteractionWeight("SHARE")).toBe(1.5);
    });

    it("should return weight for VIEW", () => {
      expect(getInteractionWeight("VIEW")).toBe(1.0);
    });

    it("should return weight for CLICK", () => {
      expect(getInteractionWeight("CLICK")).toBe(0.8);
    });

    it("should return weight for SEARCH", () => {
      expect(getInteractionWeight("SEARCH")).toBe(0.5);
    });

    it("should have PURCHASE as highest weight", () => {
      const purchaseWeight = getInteractionWeight("PURCHASE");
      const viewWeight = getInteractionWeight("VIEW");
      const clickWeight = getInteractionWeight("CLICK");

      expect(purchaseWeight).toBeGreaterThan(viewWeight);
      expect(purchaseWeight).toBeGreaterThan(clickWeight);
    });

    it("should order weights correctly", () => {
      expect(getInteractionWeight("PURCHASE")).toBeGreaterThan(getInteractionWeight("ADD_TO_CART"));
      expect(getInteractionWeight("ADD_TO_CART")).toBeGreaterThan(getInteractionWeight("FAVORITE"));
      expect(getInteractionWeight("FAVORITE")).toBeGreaterThan(getInteractionWeight("REVIEW"));
      expect(getInteractionWeight("REVIEW")).toBeGreaterThan(getInteractionWeight("SHARE"));
      expect(getInteractionWeight("SHARE")).toBeGreaterThan(getInteractionWeight("VIEW"));
      expect(getInteractionWeight("VIEW")).toBeGreaterThan(getInteractionWeight("CLICK"));
      expect(getInteractionWeight("CLICK")).toBeGreaterThan(getInteractionWeight("SEARCH"));
    });
  });

  // ============================================================================
  // isHighValueInteraction Tests
  // ============================================================================

  describe("isHighValueInteraction", () => {
    it("should return true for PURCHASE", () => {
      expect(isHighValueInteraction("PURCHASE")).toBe(true);
    });

    it("should return true for ADD_TO_CART", () => {
      expect(isHighValueInteraction("ADD_TO_CART")).toBe(true);
    });

    it("should return true for FAVORITE", () => {
      expect(isHighValueInteraction("FAVORITE")).toBe(true);
    });

    it("should return true for REVIEW", () => {
      expect(isHighValueInteraction("REVIEW")).toBe(true);
    });

    it("should return false for VIEW", () => {
      expect(isHighValueInteraction("VIEW")).toBe(false);
    });

    it("should return false for CLICK", () => {
      expect(isHighValueInteraction("CLICK")).toBe(false);
    });

    it("should return false for SEARCH", () => {
      expect(isHighValueInteraction("SEARCH")).toBe(false);
    });

    it("should return false for SHARE", () => {
      expect(isHighValueInteraction("SHARE")).toBe(false);
    });

    it("should identify 4 high value interactions", () => {
      const allTypes = ["VIEW", "CLICK", "SEARCH", "PURCHASE", "ADD_TO_CART", "FAVORITE", "SHARE", "REVIEW"];
      const highValueCount = allTypes.filter((t) => isHighValueInteraction(t as any)).length;
      expect(highValueCount).toBe(4);
    });
  });

  // ============================================================================
  // getCollaborativeFilteringTypes Tests
  // ============================================================================

  describe("getCollaborativeFilteringTypes", () => {
    it("should return array of interaction types", () => {
      const types = getCollaborativeFilteringTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
    });

    it("should include VIEW", () => {
      const types = getCollaborativeFilteringTypes();

      expect(types).toContain("VIEW");
    });

    it("should include ADD_TO_CART", () => {
      const types = getCollaborativeFilteringTypes();

      expect(types).toContain("ADD_TO_CART");
    });

    it("should include PURCHASE", () => {
      const types = getCollaborativeFilteringTypes();

      expect(types).toContain("PURCHASE");
    });

    it("should include FAVORITE", () => {
      const types = getCollaborativeFilteringTypes();

      expect(types).toContain("FAVORITE");
    });

    it("should return 4 types", () => {
      const types = getCollaborativeFilteringTypes();

      expect(types.length).toBe(4);
    });

    it("should return consistent results", () => {
      const types1 = getCollaborativeFilteringTypes();
      const types2 = getCollaborativeFilteringTypes();

      expect(types1).toEqual(types2);
    });
  });

  // ============================================================================
  // getTrendingInteractionTypes Tests
  // ============================================================================

  describe("getTrendingInteractionTypes", () => {
    it("should return array of interaction types", () => {
      const types = getTrendingInteractionTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
    });

    it("should include VIEW", () => {
      const types = getTrendingInteractionTypes();

      expect(types).toContain("VIEW");
    });

    it("should include ADD_TO_CART", () => {
      const types = getTrendingInteractionTypes();

      expect(types).toContain("ADD_TO_CART");
    });

    it("should include PURCHASE", () => {
      const types = getTrendingInteractionTypes();

      expect(types).toContain("PURCHASE");
    });

    it("should return 3 types", () => {
      const types = getTrendingInteractionTypes();

      expect(types.length).toBe(3);
    });

    it("should return consistent results", () => {
      const types1 = getTrendingInteractionTypes();
      const types2 = getTrendingInteractionTypes();

      expect(types1).toEqual(types2);
    });

    it("should not include FAVORITE", () => {
      const types = getTrendingInteractionTypes();

      expect(types).not.toContain("FAVORITE");
    });
  });

  // ============================================================================
  // createProductInteractionAggregation Tests
  // ============================================================================

  describe("createProductInteractionAggregation", () => {
    it("should return aggregation config", () => {
      const agg = createProductInteractionAggregation();

      expect(agg).toHaveProperty("by");
      expect(agg).toHaveProperty("_count");
    });

    it("should group by entityId", () => {
      const agg = createProductInteractionAggregation();

      expect(agg.by).toContain("entityId");
    });

    it("should count id field", () => {
      const agg = createProductInteractionAggregation();

      expect(agg._count.id).toBe(true);
    });

    it("should have exactly one by field", () => {
      const agg = createProductInteractionAggregation();

      expect(agg.by.length).toBe(1);
    });

    it("should return consistent results", () => {
      const agg1 = createProductInteractionAggregation();
      const agg2 = createProductInteractionAggregation();

      expect(agg1).toEqual(agg2);
    });
  });

  // ============================================================================
  // extractProductIdsFromInteractions Tests
  // ============================================================================

  describe("extractProductIdsFromInteractions", () => {
    it("should extract product IDs", () => {
      const interactions = [
        { entityType: "product", entityId: "prod_1" },
        { entityType: "product", entityId: "prod_2" },
      ];

      const ids = extractProductIdsFromInteractions(interactions);

      expect(ids).toEqual(["prod_1", "prod_2"]);
    });

    it("should filter out non-product interactions", () => {
      const interactions = [
        { entityType: "product", entityId: "prod_1" },
        { entityType: "farm", entityId: "farm_1" },
        { entityType: "product", entityId: "prod_2" },
      ];

      const ids = extractProductIdsFromInteractions(interactions);

      expect(ids).toEqual(["prod_1", "prod_2"]);
      expect(ids).not.toContain("farm_1");
    });

    it("should remove duplicates", () => {
      const interactions = [
        { entityType: "product", entityId: "prod_1" },
        { entityType: "product", entityId: "prod_1" },
        { entityType: "product", entityId: "prod_2" },
      ];

      const ids = extractProductIdsFromInteractions(interactions);

      expect(ids).toHaveLength(2);
      expect(ids).toContain("prod_1");
      expect(ids).toContain("prod_2");
    });

    it("should handle empty array", () => {
      const ids = extractProductIdsFromInteractions([]);

      expect(ids).toEqual([]);
    });

    it("should handle all non-product interactions", () => {
      const interactions = [
        { entityType: "farm", entityId: "farm_1" },
        { entityType: "order", entityId: "order_1" },
      ];

      const ids = extractProductIdsFromInteractions(interactions);

      expect(ids).toEqual([]);
    });

    it("should preserve order of first occurrence", () => {
      const interactions = [
        { entityType: "product", entityId: "prod_3" },
        { entityType: "product", entityId: "prod_1" },
        { entityType: "product", entityId: "prod_2" },
      ];

      const ids = extractProductIdsFromInteractions(interactions);

      expect(ids[0]).toBe("prod_3");
    });
  });

  // ============================================================================
  // extractFarmIdsFromInteractions Tests
  // ============================================================================

  describe("extractFarmIdsFromInteractions", () => {
    it("should extract farm IDs", () => {
      const interactions = [
        { entityType: "farm", entityId: "farm_1" },
        { entityType: "farm", entityId: "farm_2" },
      ];

      const ids = extractFarmIdsFromInteractions(interactions);

      expect(ids).toEqual(["farm_1", "farm_2"]);
    });

    it("should filter out non-farm interactions", () => {
      const interactions = [
        { entityType: "farm", entityId: "farm_1" },
        { entityType: "product", entityId: "prod_1" },
        { entityType: "farm", entityId: "farm_2" },
      ];

      const ids = extractFarmIdsFromInteractions(interactions);

      expect(ids).toEqual(["farm_1", "farm_2"]);
      expect(ids).not.toContain("prod_1");
    });

    it("should remove duplicates", () => {
      const interactions = [
        { entityType: "farm", entityId: "farm_1" },
        { entityType: "farm", entityId: "farm_1" },
        { entityType: "farm", entityId: "farm_2" },
      ];

      const ids = extractFarmIdsFromInteractions(interactions);

      expect(ids).toHaveLength(2);
      expect(ids).toContain("farm_1");
      expect(ids).toContain("farm_2");
    });

    it("should handle empty array", () => {
      const ids = extractFarmIdsFromInteractions([]);

      expect(ids).toEqual([]);
    });

    it("should handle all non-farm interactions", () => {
      const interactions = [
        { entityType: "product", entityId: "prod_1" },
        { entityType: "order", entityId: "order_1" },
      ];

      const ids = extractFarmIdsFromInteractions(interactions);

      expect(ids).toEqual([]);
    });
  });

  // ============================================================================
  // createAgriculturalContext Tests
  // ============================================================================

  describe("createAgriculturalContext", () => {
    it("should create context with season", () => {
      const context = createAgriculturalContext("SPRING");

      expect(context.season).toBe("SPRING");
    });

    it("should create context with source", () => {
      const context = createAgriculturalContext(undefined, "mobile");

      expect(context.source).toBe("mobile");
    });

    it("should create context with both season and source", () => {
      const context = createAgriculturalContext("SUMMER", "mobile");

      expect(context.season).toBe("SUMMER");
      expect(context.source).toBe("mobile");
    });

    it("should default to UNKNOWN season", () => {
      const context = createAgriculturalContext();

      expect(context.season).toBe("UNKNOWN");
    });

    it("should default to web source", () => {
      const context = createAgriculturalContext();

      expect(context.source).toBe("web");
    });

    it("should include timestamp", () => {
      const context = createAgriculturalContext();

      expect(context.timestamp).toBeDefined();
      expect(typeof context.timestamp).toBe("string");
    });

    it("should create valid ISO timestamp", () => {
      const context = createAgriculturalContext();
      const date = new Date(context.timestamp);

      expect(date.toString()).not.toBe("Invalid Date");
    });

    it("should handle different seasons", () => {
      const spring = createAgriculturalContext("SPRING");
      const summer = createAgriculturalContext("SUMMER");
      const fall = createAgriculturalContext("FALL");
      const winter = createAgriculturalContext("WINTER");

      expect(spring.season).toBe("SPRING");
      expect(summer.season).toBe("SUMMER");
      expect(fall.season).toBe("FALL");
      expect(winter.season).toBe("WINTER");
    });

    it("should handle different sources", () => {
      const web = createAgriculturalContext(undefined, "web");
      const mobile = createAgriculturalContext(undefined, "mobile");
      const app = createAgriculturalContext(undefined, "app");

      expect(web.source).toBe("web");
      expect(mobile.source).toBe("mobile");
      expect(app.source).toBe("app");
    });
  });

  // ============================================================================
  // parseAgriculturalContext Tests
  // ============================================================================

  describe("parseAgriculturalContext", () => {
    it("should parse season from metadata", () => {
      const metadata = { season: "SPRING" };
      const context = parseAgriculturalContext(metadata);

      expect(context.season).toBe("SPRING");
    });

    it("should parse source from metadata", () => {
      const metadata = { source: "mobile" };
      const context = parseAgriculturalContext(metadata);

      expect(context.source).toBe("mobile");
    });

    it("should parse location from metadata", () => {
      const metadata = { location: "California" };
      const context = parseAgriculturalContext(metadata);

      expect(context.location).toBe("California");
    });

    it("should parse all fields from metadata", () => {
      const metadata = {
        season: "SUMMER",
        source: "app",
        location: "Texas",
      };
      const context = parseAgriculturalContext(metadata);

      expect(context.season).toBe("SUMMER");
      expect(context.source).toBe("app");
      expect(context.location).toBe("Texas");
    });

    it("should return empty object for null metadata", () => {
      const context = parseAgriculturalContext(null);

      expect(context).toEqual({});
    });

    it("should return empty object for undefined metadata", () => {
      const context = parseAgriculturalContext(undefined);

      expect(context).toEqual({});
    });

    it("should return empty object for non-object metadata", () => {
      const context1 = parseAgriculturalContext("string" as any);
      const context2 = parseAgriculturalContext(123 as any);
      const context3 = parseAgriculturalContext(true as any);

      expect(context1).toEqual({});
      expect(context2).toEqual({});
      expect(context3).toEqual({});
    });

    it("should handle partial metadata", () => {
      const metadata = { season: "FALL" };
      const context = parseAgriculturalContext(metadata);

      expect(context.season).toBe("FALL");
      expect(context.source).toBeUndefined();
      expect(context.location).toBeUndefined();
    });

    it("should handle empty metadata object", () => {
      const context = parseAgriculturalContext({});

      expect(context.season).toBeUndefined();
      expect(context.source).toBeUndefined();
      expect(context.location).toBeUndefined();
    });

    it("should ignore extra fields", () => {
      const metadata = {
        season: "WINTER",
        source: "web",
        location: "New York",
        extraField: "ignored",
      };
      const context = parseAgriculturalContext(metadata);

      expect(context.season).toBe("WINTER");
      expect(context.source).toBe("web");
      expect(context.location).toBe("New York");
      expect(Object.keys(context).length).toBe(3);
    });
  });
});
