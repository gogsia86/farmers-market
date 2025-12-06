/**
 * ⚡ PRODUCT VALIDATION TEST SUITE
 * Comprehensive tests for product validation schemas with divine consciousness
 * Target: 100% coverage
 */

import { describe, it, expect } from "@jest/globals";
import {
  productCategorySchema,
  productUnitSchema,
  pricingSchema,
  inventorySchema,
  attributesSchema,
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  bulkInventoryUpdateSchema,
} from "../product";

describe("⚡ Product Validation Schemas - Divine Test Suite", () => {
  describe("Product Category Schema", () => {
    it("accepts all valid product categories", () => {
      const validCategories = [
        "VEGETABLES",
        "FRUITS",
        "DAIRY",
        "EGGS",
        "MEAT",
        "POULTRY",
        "SEAFOOD",
        "PANTRY",
        "BEVERAGES",
        "BAKED_GOODS",
        "PREPARED_FOODS",
        "FLOWERS",
        "OTHER",
      ];

      validCategories.forEach((category) => {
        const result = productCategorySchema.safeParse(category);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(category);
        }
      });
    });

    it("rejects invalid category values", () => {
      const invalidCategories = [
        "INVALID",
        "vegetables",
        "Fruits",
        "",
        null,
        undefined,
        123,
      ];

      invalidCategories.forEach((category) => {
        const result = productCategorySchema.safeParse(category);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Product Unit Schema", () => {
    it("accepts all valid product units", () => {
      const validUnits = [
        "LB",
        "OZ",
        "KG",
        "G",
        "PIECE",
        "BUNCH",
        "BAG",
        "BOX",
        "DOZEN",
        "PINT",
        "QUART",
        "GALLON",
      ];

      validUnits.forEach((unit) => {
        const result = productUnitSchema.safeParse(unit);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(unit);
        }
      });
    });

    it("rejects invalid unit values", () => {
      const invalidUnits = ["INVALID", "lb", "Kg", "", null, undefined, 456];

      invalidUnits.forEach((unit) => {
        const result = productUnitSchema.safeParse(unit);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Pricing Schema", () => {
    it("accepts valid pricing with base price only", () => {
      const pricing = {
        basePrice: 5.99,
      };

      const result = pricingSchema.safeParse(pricing);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.basePrice).toBe(5.99);
      }
    });

    it("accepts valid pricing with sale price", () => {
      const pricing = {
        basePrice: 10.0,
        salePrice: 7.99,
      };

      const result = pricingSchema.safeParse(pricing);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.basePrice).toBe(10.0);
        expect(result.data.salePrice).toBe(7.99);
      }
    });

    it("accepts valid pricing with bulk pricing tiers", () => {
      const pricing = {
        basePrice: 5.0,
        bulkPricing: [
          { minQuantity: 10, pricePerUnit: 4.5 },
          { minQuantity: 50, pricePerUnit: 4.0 },
          { minQuantity: 100, pricePerUnit: 3.5 },
        ],
      };

      const result = pricingSchema.safeParse(pricing);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bulkPricing).toHaveLength(3);
        expect(result.data.bulkPricing![0].minQuantity).toBe(10);
      }
    });

    it("accepts valid pricing with price history", () => {
      const pricing = {
        basePrice: 6.99,
        priceHistory: [
          { price: 5.99, effectiveDate: new Date("2024-01-01") },
          { price: 6.49, effectiveDate: new Date("2024-06-01") },
        ],
      };

      const result = pricingSchema.safeParse(pricing);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priceHistory).toHaveLength(2);
      }
    });

    it("coerces date strings in price history", () => {
      const pricing = {
        basePrice: 7.99,
        priceHistory: [{ price: 7.5, effectiveDate: "2024-01-01" }],
      };

      const result = pricingSchema.safeParse(pricing);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priceHistory![0].effectiveDate).toBeInstanceOf(Date);
      }
    });

    it("rejects negative base price", () => {
      const pricing = { basePrice: -5.99 };
      const result = pricingSchema.safeParse(pricing);
      expect(result.success).toBe(false);
    });

    it("rejects zero base price", () => {
      const pricing = { basePrice: 0 };
      const result = pricingSchema.safeParse(pricing);
      expect(result.success).toBe(false);
    });

    it("rejects negative sale price", () => {
      const pricing = { basePrice: 10.0, salePrice: -5.0 };
      const result = pricingSchema.safeParse(pricing);
      expect(result.success).toBe(false);
    });

    it("rejects invalid bulk pricing (non-positive minQuantity)", () => {
      const pricing = {
        basePrice: 5.0,
        bulkPricing: [{ minQuantity: 0, pricePerUnit: 4.5 }],
      };
      const result = pricingSchema.safeParse(pricing);
      expect(result.success).toBe(false);
    });

    it("rejects invalid bulk pricing (negative pricePerUnit)", () => {
      const pricing = {
        basePrice: 5.0,
        bulkPricing: [{ minQuantity: 10, pricePerUnit: -4.5 }],
      };
      const result = pricingSchema.safeParse(pricing);
      expect(result.success).toBe(false);
    });
  });

  describe("Inventory Schema", () => {
    it("accepts valid inventory with defaults", () => {
      const inventory = { quantity: 100 };

      const result = inventorySchema.safeParse(inventory);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantity).toBe(100);
        expect(result.data.reserved).toBe(0);
        expect(result.data.lowStockThreshold).toBe(10);
        expect(result.data.allowBackorder).toBe(false);
      }
    });

    it("accepts valid inventory with all fields", () => {
      const inventory = {
        quantity: 50,
        reserved: 5,
        lowStockThreshold: 15,
        restockDate: new Date("2024-12-31"),
        allowBackorder: true,
      };

      const result = inventorySchema.safeParse(inventory);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantity).toBe(50);
        expect(result.data.reserved).toBe(5);
        expect(result.data.lowStockThreshold).toBe(15);
        expect(result.data.allowBackorder).toBe(true);
      }
    });

    it("accepts zero quantity", () => {
      const inventory = { quantity: 0 };
      const result = inventorySchema.safeParse(inventory);
      expect(result.success).toBe(true);
    });

    it("coerces restockDate string to Date", () => {
      const inventory = {
        quantity: 25,
        restockDate: "2024-12-25",
      };

      const result = inventorySchema.safeParse(inventory);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.restockDate).toBeInstanceOf(Date);
      }
    });

    it("rejects negative quantity", () => {
      const inventory = { quantity: -10 };
      const result = inventorySchema.safeParse(inventory);
      expect(result.success).toBe(false);
    });

    it("rejects negative reserved", () => {
      const inventory = { quantity: 100, reserved: -5 };
      const result = inventorySchema.safeParse(inventory);
      expect(result.success).toBe(false);
    });

    it("rejects non-positive lowStockThreshold", () => {
      const inventory = { quantity: 100, lowStockThreshold: 0 };
      const result = inventorySchema.safeParse(inventory);
      expect(result.success).toBe(false);
    });

    it("rejects non-integer quantity", () => {
      const inventory = { quantity: 10.5 };
      const result = inventorySchema.safeParse(inventory);
      expect(result.success).toBe(false);
    });
  });

  describe("Attributes Schema", () => {
    it("accepts empty attributes object", () => {
      const attributes = {};
      const result = attributesSchema.safeParse(attributes);
      expect(result.success).toBe(true);
    });

    it("accepts valid attributes with all fields", () => {
      const attributes = {
        weight: 2.5,
        dimensions: {
          length: 10,
          width: 5,
          height: 3,
          unit: "IN",
        },
        organic: true,
        seasonal: true,
        locallyGrown: true,
        certifications: ["USDA Organic", "Non-GMO"],
        allergens: ["Nuts", "Dairy"],
        storageInstructions: "Keep refrigerated below 40°F",
      };

      const result = attributesSchema.safeParse(attributes);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.weight).toBe(2.5);
        expect(result.data.organic).toBe(true);
        expect(result.data.certifications).toHaveLength(2);
      }
    });

    it("accepts CM dimension unit", () => {
      const attributes = {
        dimensions: {
          length: 25,
          width: 12,
          height: 8,
          unit: "CM",
        },
      };

      const result = attributesSchema.safeParse(attributes);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dimensions?.unit).toBe("CM");
      }
    });

    it("defaults dimension unit to IN", () => {
      const attributes = {
        dimensions: {
          length: 10,
        },
      };

      const result = attributesSchema.safeParse(attributes);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dimensions?.unit).toBe("IN");
      }
    });

    it("defaults boolean flags correctly", () => {
      const attributes = { weight: 1.0 };

      const result = attributesSchema.safeParse(attributes);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.organic).toBe(false);
        expect(result.data.seasonal).toBe(false);
        expect(result.data.locallyGrown).toBe(true);
      }
    });

    it("rejects negative weight", () => {
      const attributes = { weight: -2.5 };
      const result = attributesSchema.safeParse(attributes);
      expect(result.success).toBe(false);
    });

    it("rejects storage instructions exceeding max length", () => {
      const attributes = {
        storageInstructions: "x".repeat(501),
      };
      const result = attributesSchema.safeParse(attributes);
      expect(result.success).toBe(false);
    });

    it("rejects invalid dimension unit", () => {
      const attributes = {
        dimensions: {
          length: 10,
          unit: "MM",
        },
      };
      const result = attributesSchema.safeParse(attributes);
      expect(result.success).toBe(false);
    });
  });

  describe("Create Product Schema", () => {
    const validProduct = {
      name: "Organic Tomatoes",
      description:
        "Fresh, locally grown organic tomatoes perfect for salads and cooking.",
      category: "VEGETABLES",
      farmId: "clxyz123abc456",
      unit: "LB",
      pricing: { basePrice: 4.99 },
      inventory: { quantity: 100 },
      images: ["https://example.com/tomato1.jpg"],
    };

    it("accepts valid complete product data", () => {
      const result = createProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Organic Tomatoes");
        expect(result.data.inStock).toBe(true);
        expect(result.data.featured).toBe(false);
      }
    });

    it("accepts valid product with optional slug", () => {
      const product = {
        ...validProduct,
        slug: "organic-tomatoes-2024",
      };

      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe("organic-tomatoes-2024");
      }
    });

    it("accepts valid product with attributes", () => {
      const product = {
        ...validProduct,
        attributes: {
          organic: true,
          seasonal: true,
          certifications: ["USDA Organic"],
        },
      };

      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(true);
    });

    it("accepts valid product with tags", () => {
      const product = {
        ...validProduct,
        tags: ["organic", "local", "summer"],
      };

      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toHaveLength(3);
      }
    });

    it("accepts valid product with metadata", () => {
      const product = {
        ...validProduct,
        metadata: {
          harvestDate: "2024-07-15",
          fieldNumber: 42,
        },
      };

      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(true);
    });

    it("accepts multiple images up to 10", () => {
      const product = {
        ...validProduct,
        images: Array(10)
          .fill(0)
          .map((_, i) => `https://example.com/image${i}.jpg`),
      };

      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(true);
    });

    it("rejects product name too short", () => {
      const product = { ...validProduct, name: "T" };
      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it("rejects product name too long", () => {
      const product = { ...validProduct, name: "x".repeat(201) };
      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it("rejects invalid slug format", () => {
      const product = { ...validProduct, slug: "Invalid Slug!" };
      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it("rejects description too short", () => {
      const product = { ...validProduct, description: "Short" };
      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it("rejects description too long", () => {
      const product = { ...validProduct, description: "x".repeat(2001) };
      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it("rejects invalid farmId format", () => {
      const product = { ...validProduct, farmId: "invalid-id" };
      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it("rejects empty images array", () => {
      const product = { ...validProduct, images: [] };
      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it("rejects too many images (>10)", () => {
      const product = {
        ...validProduct,
        images: Array(11)
          .fill(0)
          .map((_, i) => `https://example.com/image${i}.jpg`),
      };
      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it("rejects invalid image URLs", () => {
      const product = { ...validProduct, images: ["not-a-url"] };
      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it("rejects missing required fields", () => {
      const product = { name: "Test" };
      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });
  });

  describe("Update Product Schema", () => {
    it("accepts valid partial update with id", () => {
      const update = {
        id: "clxyz123abc456",
        name: "Updated Name",
      };

      const result = updateProductSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Updated Name");
      }
    });

    it("accepts valid update with multiple fields", () => {
      const update = {
        id: "clxyz123abc456",
        name: "Updated Product",
        pricing: { basePrice: 9.99, salePrice: 7.99 },
        inventory: { quantity: 50 },
      };

      const result = updateProductSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("accepts update with only id", () => {
      const update = { id: "clxyz123abc456" };
      const result = updateProductSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("rejects update without id", () => {
      const update = { name: "Updated Name" };
      const result = updateProductSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("rejects update with invalid id format", () => {
      const update = { id: "invalid", name: "Test" };
      const result = updateProductSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("validates fields when provided", () => {
      const update = {
        id: "clxyz123abc456",
        name: "T", // Too short
      };
      const result = updateProductSchema.safeParse(update);
      expect(result.success).toBe(false);
    });
  });

  describe("Product Query Schema", () => {
    it("accepts query with defaults", () => {
      const query = {};

      const result = productQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
        expect(result.data.sortBy).toBe("createdAt");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("accepts query with all filters", () => {
      const query = {
        farmId: "clxyz123abc456",
        category: "VEGETABLES",
        inStock: true,
        featured: true,
        minPrice: 5.0,
        maxPrice: 50.0,
        organic: true,
        seasonal: true,
        search: "tomato",
        tags: ["local", "organic"],
        limit: 50,
        offset: 100,
        sortBy: "price",
        sortOrder: "asc",
      };

      const result = productQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe("VEGETABLES");
        expect(result.data.minPrice).toBe(5.0);
        expect(result.data.tags).toHaveLength(2);
      }
    });

    it("accepts valid sortBy values", () => {
      const sortByValues = ["price", "name", "createdAt", "popularity"];

      sortByValues.forEach((sortBy) => {
        const result = productQuerySchema.safeParse({ sortBy });
        expect(result.success).toBe(true);
      });
    });

    it("accepts valid sortOrder values", () => {
      const sortOrders = ["asc", "desc"];

      sortOrders.forEach((sortOrder) => {
        const result = productQuerySchema.safeParse({ sortOrder });
        expect(result.success).toBe(true);
      });
    });

    it("rejects negative minPrice", () => {
      const query = { minPrice: -5.0 };
      const result = productQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects negative maxPrice", () => {
      const query = { maxPrice: -10.0 };
      const result = productQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects search query exceeding max length", () => {
      const query = { search: "x".repeat(101) };
      const result = productQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects limit exceeding max value", () => {
      const query = { limit: 101 };
      const result = productQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects non-positive limit", () => {
      const query = { limit: 0 };
      const result = productQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects negative offset", () => {
      const query = { offset: -1 };
      const result = productQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects invalid sortBy value", () => {
      const query = { sortBy: "invalid" };
      const result = productQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects invalid sortOrder value", () => {
      const query = { sortOrder: "invalid" };
      const result = productQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });
  });

  describe("Bulk Inventory Update Schema", () => {
    it("accepts valid bulk update with single product", () => {
      const update = {
        products: [{ productId: "clxyz123abc456", quantity: 50 }],
      };

      const result = bulkInventoryUpdateSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.products).toHaveLength(1);
      }
    });

    it("accepts valid bulk update with multiple products", () => {
      const update = {
        products: [
          { productId: "clxyz123abc456", quantity: 50 },
          { productId: "clxyz789def012", quantity: 100 },
          { productId: "clxyz345ghi678", quantity: 25 },
        ],
      };

      const result = bulkInventoryUpdateSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.products).toHaveLength(3);
      }
    });

    it("accepts zero quantity in bulk update", () => {
      const update = {
        products: [{ productId: "clxyz123abc456", quantity: 0 }],
      };

      const result = bulkInventoryUpdateSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("rejects empty products array", () => {
      const update = { products: [] };
      const result = bulkInventoryUpdateSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("rejects negative quantity", () => {
      const update = {
        products: [{ productId: "clxyz123abc456", quantity: -10 }],
      };
      const result = bulkInventoryUpdateSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("rejects non-integer quantity", () => {
      const update = {
        products: [{ productId: "clxyz123abc456", quantity: 10.5 }],
      };
      const result = bulkInventoryUpdateSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("rejects invalid productId format", () => {
      const update = {
        products: [{ productId: "invalid-id", quantity: 50 }],
      };
      const result = bulkInventoryUpdateSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("rejects missing productId", () => {
      const update = {
        products: [{ quantity: 50 }],
      };
      const result = bulkInventoryUpdateSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("rejects missing quantity", () => {
      const update = {
        products: [{ productId: "clxyz123abc456" }],
      };
      const result = bulkInventoryUpdateSchema.safeParse(update);
      expect(result.success).toBe(false);
    });
  });

  describe("Type Inference and Integration", () => {
    it("infers correct types from schemas", () => {
      const product = {
        name: "Test Product",
        description: "Test description for type inference",
        category: "VEGETABLES" as const,
        farmId: "clxyz123abc456",
        unit: "LB" as const,
        pricing: { basePrice: 5.99 },
        inventory: { quantity: 100 },
        images: ["https://example.com/test.jpg"],
      };

      const result = createProductSchema.safeParse(product);
      expect(result.success).toBe(true);

      if (result.success) {
        // Type assertions to verify inference
        const data = result.data;
        expect(typeof data.name).toBe("string");
        expect(typeof data.category).toBe("string");
        expect(typeof data.pricing.basePrice).toBe("number");
        expect(typeof data.inventory.quantity).toBe("number");
        expect(Array.isArray(data.images)).toBe(true);
      }
    });
  });
});
