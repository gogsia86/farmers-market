/**
 * ⚡ CROP VALIDATION SCHEMAS
 * Zod schemas for agricultural crop operations with divine consciousness
 */
import { z } from "zod";

// Seasons enum validation
export const seasonSchema = z.enum(["SPRING", "SUMMER", "FALL", "WINTER"]);

// Growth phase validation
export const growthPhaseSchema = z.enum([
  "SEED",
  "GERMINATION",
  "VEGETATIVE",
  "FLOWERING",
  "FRUITING",
  "HARVEST",
  "DORMANT",
]);

// Crop type validation
export const cropTypeSchema = z.enum([
  "VEGETABLE",
  "FRUIT",
  "GRAIN",
  "LEGUME",
  "HERB",
  "ROOT",
  "LEAF",
  "FLOWER",
]);

// Create crop schema
export const createCropSchema = z.object({
  name: z.string().min(2, "Crop name must be at least 2 characters").max(100),
  scientificName: z.string().optional(),
  type: cropTypeSchema,
  description: z.string().max(1000).optional(),
  farmId: z.string().cuid(),
  plantingDate: z.coerce.date(),
  expectedHarvestDate: z.coerce.date(),
  growthPhase: growthPhaseSchema.default("SEED"),
  season: seasonSchema,
  requirements: z
    .object({
      sunlight: z.enum(["FULL_SUN", "PARTIAL_SHADE", "FULL_SHADE"]).optional(),
      waterFrequency: z
        .enum(["DAILY", "EVERY_OTHER_DAY", "WEEKLY", "BI_WEEKLY"])
        .optional(),
      soilType: z.enum(["SANDY", "CLAY", "LOAM", "SILT", "PEAT"]).optional(),
      temperature: z
        .object({
          min: z.number().optional(),
          max: z.number().optional(),
          optimal: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Update crop schema
export const updateCropSchema = createCropSchema.partial().extend({
  id: z.string().cuid(),
});

// Seasonal cycle schema
export const seasonalCycleSchema = z.object({
  cropId: z.string().cuid(),
  season: seasonSchema,
  plantingWindow: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }),
  harvestWindow: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }),
  expectedYield: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
});

// Query filters
export const cropQuerySchema = z.object({
  farmId: z.string().cuid().optional(),
  season: seasonSchema.optional(),
  type: cropTypeSchema.optional(),
  growthPhase: growthPhaseSchema.optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Type exports
export type CreateCropInput = z.infer<typeof createCropSchema>;
export type UpdateCropInput = z.infer<typeof updateCropSchema>;
export type SeasonalCycleInput = z.infer<typeof seasonalCycleSchema>;
export type CropQuery = z.infer<typeof cropQuerySchema>;
export type Season = z.infer<typeof seasonSchema>;
export type GrowthPhase = z.infer<typeof growthPhaseSchema>;
export type CropType = z.infer<typeof cropTypeSchema>;
