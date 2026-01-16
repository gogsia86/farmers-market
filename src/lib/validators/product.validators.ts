/**
 * ⚡ PRODUCT VALIDATION SCHEMAS
 * Zod schemas for product operations with divine consciousness
 */
import { z } from "zod";

// Product category validation
export const productCategorySchema = z.enum([
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
]);

// Product unit validation
export const productUnitSchema = z.enum([
  "LB", // Pound
  "OZ", // Ounce
  "KG", // Kilogram
  "G", // Gram
  "PIECE", // Individual item
  "BUNCH", // Bundle
  "BAG", // Bag
  "BOX", // Box
  "DOZEN", // 12 items
  "PINT", // Liquid measure
  "QUART", // Liquid measure
  "GALLON", // Liquid measure
]);

// Pricing schema
export const pricingSchema = z.object({
  basePrice: z.number().positive(),
  salePrice: z.number().positive().optional(),
  bulkPricing: z
    .array(
      z.object({
        minQuantity: z.number().int().positive(),
        pricePerUnit: z.number().positive(),
      }),
    )
    .optional(),
  priceHistory: z
    .array(
      z.object({
        price: z.number().positive(),
        effectiveDate: z.coerce.date(),
      }),
    )
    .optional(),
});

// Inventory schema
export const inventorySchema = z.object({
  quantity: z.number().int().min(0),
  reserved: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().positive().default(10),
  restockDate: z.coerce.date().optional(),
  allowBackorder: z.boolean().default(false),
});

// Product attributes schema
export const attributesSchema = z.object({
  weight: z.number().positive().optional(),
  dimensions: z
    .object({
      length: z.number().positive().optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      unit: z.enum(["IN", "CM"]).default("IN"),
    })
    .optional(),
  organic: z.boolean().default(false),
  seasonal: z.boolean().default(false),
  locallyGrown: z.boolean().default(true),
  certifications: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  storageInstructions: z.string().max(500).optional(),
});

// Create product schema
export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().min(10).max(2000),
  category: productCategorySchema,
  farmId: z.string().cuid(),
  unit: productUnitSchema,
  pricing: pricingSchema,
  inventory: inventorySchema,
  attributes: attributesSchema.optional(),
  images: z
    .array(z.string().url())
    .min(1, "At least one image required")
    .max(10),
  tags: z.array(z.string()).optional(),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Update product schema
export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().cuid(),
});

// Product query schema
export const productQuerySchema = z.object({
  farmId: z.string().cuid().optional(),
  category: productCategorySchema.optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  organic: z.boolean().optional(),
  seasonal: z.boolean().optional(),
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z
    .enum(["price", "name", "createdAt", "popularity"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Bulk update inventory schema
export const bulkInventoryUpdateSchema = z.object({
  products: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().min(0),
      }),
    )
    .min(1),
});

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type BulkInventoryUpdate = z.infer<typeof bulkInventoryUpdateSchema>;
export type ProductCategory = z.infer<typeof productCategorySchema>;
export type ProductUnit = z.infer<typeof productUnitSchema>;
export type Pricing = z.infer<typeof pricingSchema>;
export type Inventory = z.infer<typeof inventorySchema>;
export type ProductAttributes = z.infer<typeof attributesSchema>;
