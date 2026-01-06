/**
 * 🌾 FARM VALIDATION SCHEMAS - CENTRALIZED ZOD VALIDATORS
 *
 * Comprehensive validation for all farm-related operations
 * Centralized validation logic for consistency across the application
 *
 * Features:
 * - Type-safe validation with Zod
 * - Comprehensive field validation
 * - Custom error messages
 * - Reusable schemas
 * - Input sanitization
 *
 * @reference .cursorrules - Claude Sonnet 4.5 Validation Patterns
 */

import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS & PRIMITIVES
// ============================================================================

/**
 * Coordinate validation (latitude/longitude)
 */
export const CoordinateSchema = z.object({
  lat: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

/**
 * Location validation
 */
export const LocationSchema = z.object({
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must not exceed 200 characters')
    .trim(),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters')
    .trim(),
  state: z
    .string()
    .length(2, 'State must be a 2-letter code')
    .regex(/^[A-Z]{2}$/, 'State must be uppercase (e.g., WA, CA)')
    .transform((val) => val.toUpperCase()),
  zipCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format (e.g., 98101 or 98101-1234)'),
  country: z
    .string()
    .length(2, 'Country must be a 2-letter code')
    .default('US')
    .transform((val) => val.toUpperCase()),
  coordinates: CoordinateSchema.optional(),
});

/**
 * Farm certifications enum
 */
export const FarmCertificationSchema = z.enum([
  'USDA_ORGANIC',
  'ORGANIC',
  'NON_GMO',
  'BIODYNAMIC',
  'RAINFOREST_ALLIANCE',
  'FAIR_TRADE',
  'ANIMAL_WELFARE_APPROVED',
  'CERTIFIED_NATURALLY_GROWN',
  'FOOD_ALLIANCE_CERTIFIED',
  'SALMON_SAFE',
]);

/**
 * Farming practices enum
 */
export const FarmingPracticeSchema = z.enum([
  'ORGANIC',
  'CONVENTIONAL',
  'PERMACULTURE',
  'HYDROPONIC',
  'AQUAPONIC',
  'REGENERATIVE',
  'BIODYNAMIC',
  'NO_TILL',
  'PASTURE_RAISED',
  'FREE_RANGE',
]);

/**
 * Farm status enum
 */
export const FarmStatusSchema = z.enum([
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'INACTIVE',
]);

// ============================================================================
// CREATE FARM VALIDATION
// ============================================================================

/**
 * Schema for creating a new farm
 */
export const CreateFarmSchema = z
  .object({
    // Basic information
    name: z
      .string()
      .min(3, 'Farm name must be at least 3 characters')
      .max(100, 'Farm name must not exceed 100 characters')
      .regex(
        /^[a-zA-Z0-9\s\-'&.]+$/,
        'Farm name contains invalid characters. Use only letters, numbers, spaces, hyphens, apostrophes, ampersands, and periods'
      )
      .trim()
      .transform((val) =>
        val
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      ),

    slug: z
      .string()
      .min(3, 'Slug must be at least 3 characters')
      .max(100, 'Slug must not exceed 100 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
      .optional(),

    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description must not exceed 2000 characters')
      .trim(),

    story: z
      .string()
      .max(5000, 'Farm story must not exceed 5000 characters')
      .optional(),

    // Location
    address: z
      .string()
      .min(5, 'Address must be at least 5 characters')
      .max(200, 'Address must not exceed 200 characters')
      .trim(),

    city: z
      .string()
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City must not exceed 100 characters')
      .trim(),

    state: z
      .string()
      .length(2, 'State must be a 2-letter code')
      .regex(/^[A-Z]{2}$/, 'State must be uppercase (e.g., WA, CA)')
      .transform((val) => val.toUpperCase()),

    zipCode: z
      .string()
      .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format (e.g., 98101 or 98101-1234)'),

    country: z
      .string()
      .length(2, 'Country must be a 2-letter code')
      .default('US')
      .transform((val) => val.toUpperCase()),

    latitude: z
      .number()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90'),

    longitude: z
      .number()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180'),

    location: LocationSchema.optional(),

    // Contact information
    email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email must not exceed 255 characters')
      .toLowerCase()
      .trim(),

    phone: z
      .string()
      .regex(
        /^\+?1?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
        'Invalid phone number format. Use format: (123) 456-7890 or 123-456-7890'
      )
      .transform((val) => val.replace(/\D/g, '')), // Strip non-digits

    website: z
      .string()
      .url('Invalid website URL')
      .max(255, 'Website URL must not exceed 255 characters')
      .optional()
      .or(z.literal('')),

    // Business information
    businessName: z
      .string()
      .max(200, 'Business name must not exceed 200 characters')
      .optional(),

    taxId: z
      .string()
      .regex(/^\d{2}-?\d{7}$/, 'Invalid Tax ID format (EIN: XX-XXXXXXX)')
      .optional()
      .transform((val) => val?.replace(/-/g, '')),

    businessType: z
      .enum(['SOLE_PROPRIETOR', 'PARTNERSHIP', 'LLC', 'CORPORATION', 'COOPERATIVE', 'OTHER'])
      .optional(),

    yearEstablished: z
      .number()
      .int('Year must be a whole number')
      .min(1800, 'Year established seems too old')
      .max(new Date().getFullYear(), 'Cannot be established in the future')
      .optional(),

    farmSize: z
      .number()
      .positive('Farm size must be positive')
      .max(1000000, 'Farm size seems unrealistic (max 1,000,000 acres)')
      .optional(),

    // Certifications and practices
    certificationsArray: z
      .array(FarmCertificationSchema)
      .max(20, 'Maximum 20 certifications allowed')
      .default([])
      .optional(),

    farmingPractices: z
      .array(FarmingPracticeSchema)
      .min(1, 'Select at least one farming practice')
      .max(10, 'Maximum 10 farming practices allowed')
      .optional(),

    // Operations
    deliveryRadius: z
      .number()
      .int('Delivery radius must be a whole number')
      .positive('Delivery radius must be positive')
      .max(500, 'Delivery radius must not exceed 500 miles')
      .default(25),

    // Owner ID (from session)
    ownerId: z.string().uuid('Invalid owner ID format'),
  })
  .strict(); // Reject unknown fields

// ============================================================================
// UPDATE FARM VALIDATION
// ============================================================================

/**
 * Schema for updating an existing farm
 * All fields are optional (partial update)
 */
export const UpdateFarmSchema = CreateFarmSchema.partial().omit({
  ownerId: true, // Cannot change owner via update
});

// ============================================================================
// QUERY FILTERS VALIDATION
// ============================================================================

/**
 * Schema for farm listing query parameters
 */
export const FarmQuerySchema = z.object({
  // Pagination
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform((val) => Math.max(1, parseInt(val)))
    .default('1'),

  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform((val) => Math.min(100, Math.max(1, parseInt(val))))
    .default('20'),

  // Search
  search: z
    .string()
    .max(100, 'Search term must not exceed 100 characters')
    .trim()
    .optional(),

  // Location filters
  city: z.string().max(100).trim().optional(),

  state: z
    .string()
    .length(2)
    .regex(/^[A-Z]{2}$/)
    .transform((val) => val.toUpperCase())
    .optional(),

  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),

  // Status filter
  status: FarmStatusSchema.optional(),

  // Certification filter
  organic: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  certifications: z.array(FarmCertificationSchema).optional(),

  practices: z.array(FarmingPracticeSchema).optional(),

  // Sorting
  sortBy: z
    .enum(['name', 'createdAt', 'updatedAt', 'rating', 'distance'])
    .default('createdAt'),

  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Geolocation search
  latitude: z
    .string()
    .regex(/^-?\d+\.?\d*$/)
    .transform((val) => parseFloat(val))
    .optional(),

  longitude: z
    .string()
    .regex(/^-?\d+\.?\d*$/)
    .transform((val) => parseFloat(val))
    .optional(),

  radius: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val))
    .default('50'), // Default 50 km
});

// ============================================================================
// FARM ID VALIDATION
// ============================================================================

/**
 * Schema for validating farm ID
 */
export const FarmIdSchema = z.object({
  farmId: z.string().uuid('Invalid farm ID format'),
});

/**
 * Schema for validating farm slug
 */
export const FarmSlugSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
});

// ============================================================================
// FARM TEAM MEMBER VALIDATION
// ============================================================================

/**
 * Schema for adding team member
 */
export const AddTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  role: z.enum(['MANAGER', 'STAFF']).default('STAFF'),
  farmId: z.string().uuid('Invalid farm ID format'),
});

/**
 * Schema for removing team member
 */
export const RemoveTeamMemberSchema = z.object({
  teamMemberId: z.string().uuid('Invalid team member ID format'),
  farmId: z.string().uuid('Invalid farm ID format'),
});

// ============================================================================
// FARM VERIFICATION VALIDATION
// ============================================================================

/**
 * Schema for farm approval
 */
export const ApproveFarmSchema = z.object({
  farmId: z.string().uuid('Invalid farm ID format'),
  notes: z.string().max(1000).optional(),
});

/**
 * Schema for farm rejection
 */
export const RejectFarmSchema = z.object({
  farmId: z.string().uuid('Invalid farm ID format'),
  reason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(1000, 'Rejection reason must not exceed 1000 characters'),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateFarmInput = z.infer<typeof CreateFarmSchema>;
export type UpdateFarmInput = z.infer<typeof UpdateFarmSchema>;
export type FarmQueryInput = z.infer<typeof FarmQuerySchema>;
export type FarmIdInput = z.infer<typeof FarmIdSchema>;
export type FarmSlugInput = z.infer<typeof FarmSlugSchema>;
export type AddTeamMemberInput = z.infer<typeof AddTeamMemberSchema>;
export type RemoveTeamMemberInput = z.infer<typeof RemoveTeamMemberSchema>;
export type ApproveFarmInput = z.infer<typeof ApproveFarmSchema>;
export type RejectFarmInput = z.infer<typeof RejectFarmSchema>;

/**
 * Validation helpers
 */
export const validateCreateFarm = (data: unknown) => CreateFarmSchema.parse(data);
export const validateUpdateFarm = (data: unknown) => UpdateFarmSchema.parse(data);
export const validateFarmQuery = (data: unknown) => FarmQuerySchema.parse(data);
export const validateFarmId = (data: unknown) => FarmIdSchema.parse(data);
export const validateFarmSlug = (data: unknown) => FarmSlugSchema.parse(data);

/**
 * Divine validation achieved ✨
 * Centralized, type-safe, comprehensive validation
 * Ready for production at kilo-scale
 */
