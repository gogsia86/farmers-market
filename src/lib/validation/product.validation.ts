/**
 * PRODUCT VALIDATION
 * Divine validation schemas for agricultural products
 * Reference: 12_ERROR_HANDLING_VALIDATION.instructions.md
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS
// ============================================

export const ProductCategorySchema = z.enum([
  "VEGETABLES",
  "FRUITS",
  "DAIRY",
  "MEAT",
  "GRAINS",
  "HERBS",
  "HONEY",
  "EGGS",
  "FLOWERS",
  "OTHER",
]);

export const ProductStatusSchema = z.enum([
  "ACTIVE",
  "DRAFT",
  "OUT_OF_STOCK",
  "DISCONTINUED",
]);

export const SeasonSchema = z.enum(["SPRING", "SUMMER", "FALL", "WINTER"]);

// ============================================
// PRICING SCHEMA
// ============================================

export const PricingSchema = z.object({
  basePrice: z.object({
    amount: z.number().positive("Price must be positive"),
    currency: z.string().default("USD"),
  }),
  compareAtPrice: z
    .object({
      amount: z.number().positive(),
      currency: z.string().default("USD"),
    })
    .optional(),
  bulkPricing: z
    .array(
      z.object({
        minQuantity: z.number().int().positive(),
        pricePerUnit: z.number().positive(),
      })
    )
    .optional(),
  unit: z.string().min(1, "Unit is required"),
  unitType: z.enum(["WEIGHT", "VOLUME", "COUNT"]).default("COUNT"),
});

// ============================================
// INVENTORY SCHEMA
// ============================================

export const InventorySchema = z.object({
  quantity: z.number().int().nonnegative("Quantity cannot be negative"),
  reservedQuantity: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().positive().default(10),
  allowBackorder: z.boolean().default(false),
  trackInventory: z.boolean().default(true),
});

// ============================================
// IMAGES SCHEMA
// ============================================

export const ProductImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  alt: z.string().optional(),
  isPrimary: z.boolean().default(false),
  order: z.number().int().nonnegative().default(0),
});

// ============================================
// CREATE PRODUCT SCHEMA
// ============================================

export const CreateProductSchema = z.object({
  farmId: z.string().uuid("Invalid farm ID"),
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(200, "Product name too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description too long")
    .optional(),
  category: ProductCategorySchema,
  subCategory: z.string().max(100).optional(),
  pricing: PricingSchema,
  inventory: InventorySchema,
  images: z
    .array(ProductImageSchema)
    .min(1, "At least one image required")
    .max(10, "Maximum 10 images allowed"),
  attributes: z
    .object({
      isOrganic: z.boolean().default(false),
      isNonGMO: z.boolean().default(false),
      isGlutenFree: z.boolean().default(false),
      isVegan: z.boolean().default(false),
      locallyGrown: z.boolean().default(false),
    })
    .optional(),
  seasons: z.array(SeasonSchema).optional(),
  tags: z.array(z.string().max(50)).max(20, "Maximum 20 tags").optional(),
  harvestDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  nutritionalInfo: z
    .object({
      servingSize: z.string().optional(),
      calories: z.number().optional(),
      protein: z.number().optional(),
      carbohydrates: z.number().optional(),
      fat: z.number().optional(),
    })
    .optional(),
  certifications: z
    .array(z.enum(["ORGANIC", "NON_GMO", "FAIR_TRADE", "KOSHER", "HALAL"]))
    .optional(),
});

// ============================================
// UPDATE PRODUCT SCHEMA
// ============================================

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string().uuid("Invalid product ID"),
});

// ============================================
// PRODUCT FILTERS SCHEMA
// ============================================

export const ProductFiltersSchema = z.object({
  farmId: z.string().uuid().optional(),
  farmIds: z.array(z.string().uuid()).optional(),
  category: ProductCategorySchema.optional(),
  categories: z.array(ProductCategorySchema).optional(),
  subCategory: z.string().optional(),
  status: ProductStatusSchema.optional(),
  isActive: z.boolean().optional(),
  inStock: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isOrganic: z.boolean().optional(),
  isNonGMO: z.boolean().optional(),
  season: SeasonSchema.optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(["name", "price", "newest", "popular"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// ============================================
// VALIDATION HELPERS
// ============================================

export function validateCreateProduct(data: unknown) {
  return CreateProductSchema.parse(data);
}

export function validateUpdateProduct(data: unknown) {
  return UpdateProductSchema.parse(data);
}

export function validateProductFilters(data: unknown) {
  return ProductFiltersSchema.parse(data);
}

// ============================================
// BUSINESS RULE VALIDATORS
// ============================================

export function validateProductAvailability(product: {
  inventory: { quantity: number; reservedQuantity: number };
  status: string;
}): { available: boolean; reason?: string } {
  if (product.status !== "ACTIVE") {
    return { available: false, reason: "Product is not active" };
  }

  const availableQty =
    product.inventory.quantity - product.inventory.reservedQuantity;
  if (availableQty <= 0) {
    return { available: false, reason: "Product out of stock" };
  }

  return { available: true };
}

export function validateOrderQuantity(
  requestedQty: number,
  product: {
    inventory: {
      quantity: number;
      reservedQuantity: number;
      allowBackorder: boolean;
    };
  }
): { valid: boolean; reason?: string } {
  if (requestedQty <= 0) {
    return { valid: false, reason: "Quantity must be positive" };
  }

  const availableQty =
    product.inventory.quantity - product.inventory.reservedQuantity;
  if (requestedQty > availableQty && !product.inventory.allowBackorder) {
    return {
      valid: false,
      reason: `Only ${availableQty} units available`,
    };
  }

  return { valid: true };
}
