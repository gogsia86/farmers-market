/**
 * FARM VALIDATION SCHEMAS
 *
 * Zod validation schemas for farm profile operations.
 * Implements input sanitization and security validation.
 *
 * @module validation/farm
 */

import { z } from "zod";

// ============================================
// ADDRESS SCHEMA
// ============================================

export const AddressSchema = z.object({
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().length(2, "State must be 2-letter code (e.g., CA, NY)"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid zip code format"),
  country: z.string().default("US"),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
});

// ============================================
// CERTIFICATION SCHEMA
// ============================================

export const CertificationSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    "USDA_ORGANIC",
    "NON_GMO",
    "FAIR_TRADE",
    "BIODYNAMIC",
    "RAINFOREST_ALLIANCE",
    "ANIMAL_WELFARE",
    "SUSTAINABLE",
    "OTHER",
  ]),
  certifier: z.string().min(2, "Certifier name required"),
  certificateNumber: z.string().min(1, "Certificate number required"),
  issuedDate: z.coerce.date(),
  expiryDate: z.coerce.date().optional(),
  certificateUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

// ============================================
// BUSINESS HOURS SCHEMA
// ============================================

const DayHoursSchema = z.object({
  open: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  close: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

export const BusinessHoursSchema = z.object({
  monday: DayHoursSchema.optional(),
  tuesday: DayHoursSchema.optional(),
  wednesday: DayHoursSchema.optional(),
  thursday: DayHoursSchema.optional(),
  friday: DayHoursSchema.optional(),
  saturday: DayHoursSchema.optional(),
  sunday: DayHoursSchema.optional(),
});

// ============================================
// CREATE FARM SCHEMA
// ============================================

export const CreateFarmSchema = z.object({
  // Identity
  name: z
    .string()
    .min(3, "Farm name must be at least 3 characters")
    .max(100, "Farm name too long"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000)
    .optional(),
  tagline: z.string().max(100, "Tagline too long").optional(),

  // Location
  address: AddressSchema,
  deliveryRadius: z.number().min(0).max(100).optional(),

  // Classification
  farmType: z.enum(["ORGANIC", "CONVENTIONAL", "SPECIALTY", "MIXED"]),
  farmSize: z.enum(["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]),
  certifications: z.array(CertificationSchema).default([]),

  // Details
  establishedYear: z
    .number()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  acreage: z.number().min(0).max(100000).optional(),
  specialties: z.array(z.string()).default([]),
  farmingPractices: z.array(z.string()).default([]),

  // Status
  status: z.enum(["ACTIVE", "INACTIVE", "SEASONAL"]).default("ACTIVE"),
  isActive: z.boolean().default(true),

  // Media
  logoUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).default([]),

  // Contact
  email: z.string().email().optional(),
  phone: z
    .string()
    .regex(/^[\d\s\-\(\)]+$/, "Invalid phone format")
    .optional(),
  website: z.string().url().optional(),
  socialMedia: z
    .object({
      facebook: z.string().url().optional(),
      instagram: z.string().url().optional(),
      twitter: z.string().url().optional(),
    })
    .optional(),
  businessHours: BusinessHoursSchema.optional(),
});

// ============================================
// UPDATE FARM SCHEMA
// ============================================

export const UpdateFarmSchema = CreateFarmSchema.partial().omit({
  status: true,
  isActive: true,
});

// ============================================
// FARM QUERY SCHEMA
// ============================================

export const FarmQuerySchema = z.object({
  // Type filters
  farmType: z
    .array(z.enum(["ORGANIC", "CONVENTIONAL", "SPECIALTY", "MIXED"]))
    .optional(),
  farmSize: z
    .array(z.enum(["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]))
    .optional(),

  // Status filters
  verificationStatus: z
    .enum(["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"])
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SEASONAL"]).optional(),
  isActive: z.coerce.boolean().optional(),

  // Location filters
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().optional(),

  // Feature filters
  hasProducts: z.coerce.boolean().optional(),
  hasDelivery: z.coerce.boolean().optional(),
  isOrganic: z.coerce.boolean().optional(),

  // Search
  search: z.string().optional(),

  // Sorting
  sortBy: z.enum(["name", "rating", "createdAt", "distance"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),

  // Pagination
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ============================================
// VERIFY FARM SCHEMA
// ============================================

export const VerifyFarmSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  notes: z.string().optional(),
});

// ============================================
// EXPORT TYPE INFERENCE
// ============================================

export type CreateFarmSchemaType = z.infer<typeof CreateFarmSchema>;
export type UpdateFarmSchemaType = z.infer<typeof UpdateFarmSchema>;
export type FarmQuerySchemaType = z.infer<typeof FarmQuerySchema>;
export type VerifyFarmSchemaType = z.infer<typeof VerifyFarmSchema>;
