/**
 * AGRICULTURAL VALIDATION DIVINE PATTERNS
 * Comprehensive validation for farming domain entities
 *
 * References:
 * - 02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 * - 12_ERROR_HANDLING_VALIDATION.instructions.md
 */

import { z } from "zod";

// ============================================
// SEASONAL VALIDATION SCHEMAS
// ============================================

export const SeasonSchema = z.enum(["SPRING", "SUMMER", "FALL", "WINTER"]);

export const SeasonalValidationSchema = z.object({
  season: SeasonSchema,
  lunarPhase: z.enum([
    "NEW_MOON",
    "WAXING_CRESCENT",
    "FIRST_QUARTER",
    "WAXING_GIBBOUS",
    "FULL_MOON",
    "WANING_GIBBOUS",
    "LAST_QUARTER",
    "WANING_CRESCENT",
  ]),
  soilTemperature: z.number().min(-10).max(40),
  moistureLevel: z.number().min(0).max(1),
  biodynamicCompliance: z.boolean().default(false),
  agriculturalConsciousness: z.number().min(0).max(1).default(0.5),
});

// ============================================
// FARM VALIDATION SCHEMAS
// ============================================

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const FarmValidationSchema = z.object({
  name: z
    .string()
    .min(3, "Farm name must be at least 3 characters")
    .max(100, "Farm name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-'\.]+$/, "Farm name contains invalid characters"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),

  address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must not exceed 200 characters"),

  coordinates: CoordinatesSchema.optional(),

  certifications: z.array(z.string()).default([]),

  biodynamicPractices: z
    .array(
      z.enum([
        "COMPOSTING",
        "CROP_ROTATION",
        "LUNAR_PLANTING",
        "BIODYNAMIC_PREPARATIONS",
        "COMPANION_PLANTING",
        "NATURAL_PEST_CONTROL",
      ])
    )
    .default([]),

  seasonalData: SeasonalValidationSchema.optional(),

  sustainabilityScore: z.number().min(0).max(100).optional(),

  tags: z.array(z.string()).max(20, "Too many tags").default([]),
});

// ============================================
// PRODUCT VALIDATION SCHEMAS
// ============================================

export const ProductValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name too long"),

  description: z.string().max(500, "Description too long").optional(),

  price: z
    .number()
    .positive("Price must be positive")
    .max(10000, "Price exceeds maximum"),

  unit: z.enum(["lb", "kg", "oz", "g", "each", "bunch", "dozen", "box"]),

  category: z.string().min(1, "Category required"),

  inStock: z.boolean().default(true),

  quantity: z
    .number()
    .int("Quantity must be integer")
    .min(0, "Quantity cannot be negative")
    .optional(),

  organic: z.boolean().default(false),

  seasonal: z.boolean().default(false),

  harvestDate: z.date().optional(),
});

// ============================================
// SEARCH & FILTER VALIDATION
// ============================================

export const FarmSearchSchema = z.object({
  query: z.string().max(100).optional(),
  season: SeasonSchema.optional(),
  biodynamicOnly: z.boolean().default(false),
  minBiodynamicScore: z.number().min(0).max(100).optional(),
  sustainabilityLevel: z
    .enum(["BASIC", "INTERMEDIATE", "ADVANCED", "DIVINE"])
    .optional(),
  withinRadius: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      radiusKm: z.number().min(1).max(500),
    })
    .optional(),
  certifications: z.array(z.string()).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z
    .enum([
      "name",
      "biodynamicScore",
      "sustainabilityScore",
      "distance",
      "createdAt",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================
// VALIDATION HELPERS
// ============================================

export function validateSeasonalAlignment(
  season: z.infer<typeof SeasonSchema>,
  cropType: string
): boolean {
  const seasonalCrops: Record<string, z.infer<typeof SeasonSchema>[]> = {
    TOMATOES: ["SPRING", "SUMMER"],
    LETTUCE: ["SPRING", "FALL"],
    PUMPKINS: ["FALL"],
    CITRUS: ["WINTER"],
  };

  const validSeasons = seasonalCrops[cropType.toUpperCase()];
  return validSeasons ? validSeasons.includes(season) : true;
}

export function validateBiodynamicCompliance(practices: string[]): {
  compliant: boolean;
  score: number;
  missing: string[];
} {
  const requiredPractices = ["COMPOSTING", "CROP_ROTATION"];
  const missing = requiredPractices.filter((p) => !practices.includes(p));

  return {
    compliant: missing.length === 0,
    score: (practices.length / 6) * 100,
    missing,
  };
}

export function sanitizeSearchQuery(query: string): string {
  // Remove SQL injection attempts
  return query
    .replace(/[';\"\\]/g, "")
    .replace(/DROP|DELETE|INSERT|UPDATE|CREATE/gi, "")
    .trim()
    .slice(0, 100);
}

// ============================================
// TYPE EXPORTS
// ============================================

export type Season = z.infer<typeof SeasonSchema>;
export type SeasonalValidation = z.infer<typeof SeasonalValidationSchema>;
export type FarmValidation = z.infer<typeof FarmValidationSchema>;
export type ProductValidation = z.infer<typeof ProductValidationSchema>;
export type FarmSearch = z.infer<typeof FarmSearchSchema>;
