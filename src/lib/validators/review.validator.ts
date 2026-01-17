/**
 * REVIEW VALIDATORS - DIVINE INPUT VALIDATION
 * ===========================================
 *
 * Comprehensive Zod schemas for review system validation
 * Ensures data integrity and type safety for all review operations
 *
 * Features:
 * - Create/update review validation
 * - Rating constraints (1-5)
 * - Review text length limits
 * - Farmer response validation
 * - Review filtering validation
 * - Moderation input validation
 *
 * @module ReviewValidators
 * @version 2.0.0
 */

import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Review rating schema
 * Must be integer between 1-5
 */
export const RatingSchema = z
  .number()
  .int('Rating must be a whole number')
  .min(1, 'Rating must be at least 1 star')
  .max(5, 'Rating cannot exceed 5 stars');

/**
 * Review text schema
 * Optional but has max length
 */
export const ReviewTextSchema = z
  .string()
  .max(500, 'Review text cannot exceed 500 characters')
  .optional();

/**
 * Photo URL schema
 * Optional URL validation
 */
export const PhotoUrlSchema = z
  .string()
  .url('Invalid photo URL')
  .max(500, 'Photo URL too long')
  .optional();

/**
 * Review status enum
 */
export const ReviewStatusSchema = z.enum(['PENDING', 'APPROVED', 'FLAGGED', 'REMOVED'], {
  errorMap: () => ({ message: 'Invalid review status' }),
});

// ============================================================================
// CREATE REVIEW SCHEMAS
// ============================================================================

/**
 * Create review input validation
 */
export const CreateReviewSchema = z.object({
  farmId: z
    .string()
    .min(1, 'Farm ID is required')
    .cuid('Invalid farm ID format'),

  productId: z
    .string()
    .cuid('Invalid product ID format')
    .optional(),

  customerId: z
    .string()
    .min(1, 'Customer ID is required')
    .cuid('Invalid customer ID format'),

  orderId: z
    .string()
    .cuid('Invalid order ID format')
    .optional(),

  rating: RatingSchema,

  reviewText: ReviewTextSchema,

  photoUrl: PhotoUrlSchema,
});

/**
 * Type inference for CreateReviewSchema
 */
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

// ============================================================================
// UPDATE REVIEW SCHEMAS
// ============================================================================

/**
 * Update review input validation
 * All fields optional since it's a partial update
 */
export const UpdateReviewSchema = z.object({
  rating: RatingSchema.optional(),
  reviewText: ReviewTextSchema,
  photoUrl: PhotoUrlSchema,
});

/**
 * Type inference for UpdateReviewSchema
 */
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;

// ============================================================================
// FARMER RESPONSE SCHEMAS
// ============================================================================

/**
 * Farmer response input validation
 */
export const FarmerResponseSchema = z.object({
  reviewId: z
    .string()
    .min(1, 'Review ID is required')
    .cuid('Invalid review ID format'),

  farmerId: z
    .string()
    .min(1, 'Farmer ID is required')
    .cuid('Invalid farmer ID format'),

  response: z
    .string()
    .min(10, 'Response must be at least 10 characters')
    .max(500, 'Response cannot exceed 500 characters'),
});

/**
 * Type inference for FarmerResponseSchema
 */
export type FarmerResponseInput = z.infer<typeof FarmerResponseSchema>;

// ============================================================================
// MODERATION SCHEMAS
// ============================================================================

/**
 * Flag review input validation
 */
export const FlagReviewSchema = z.object({
  reviewId: z
    .string()
    .min(1, 'Review ID is required')
    .cuid('Invalid review ID format'),

  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(255, 'Reason cannot exceed 255 characters'),

  flaggedBy: z
    .string()
    .min(1, 'User ID is required')
    .cuid('Invalid user ID format'),
});

/**
 * Type inference for FlagReviewSchema
 */
export type FlagReviewInput = z.infer<typeof FlagReviewSchema>;

/**
 * Moderate review input validation
 */
export const ModerateReviewSchema = z.object({
  reviewId: z
    .string()
    .min(1, 'Review ID is required')
    .cuid('Invalid review ID format'),

  moderatorId: z
    .string()
    .min(1, 'Moderator ID is required')
    .cuid('Invalid moderator ID format'),

  status: ReviewStatusSchema,

  moderationNotes: z
    .string()
    .max(500, 'Moderation notes cannot exceed 500 characters')
    .optional(),
});

/**
 * Type inference for ModerateReviewSchema
 */
export type ModerateReviewInput = z.infer<typeof ModerateReviewSchema>;

// ============================================================================
// QUERY/FILTER SCHEMAS
// ============================================================================

/**
 * Review filters validation
 */
export const ReviewFiltersSchema = z.object({
  farmId: z.string().cuid('Invalid farm ID format').optional(),

  productId: z.string().cuid('Invalid product ID format').optional(),

  customerId: z.string().cuid('Invalid customer ID format').optional(),

  rating: z
    .number()
    .int()
    .min(1)
    .max(5)
    .or(z.string().transform((val) => parseInt(val, 10)))
    .optional(),

  status: ReviewStatusSchema.optional(),

  isVerifiedPurchase: z
    .boolean()
    .or(z.string().transform((val) => val === 'true'))
    .optional(),

  page: z
    .number()
    .int()
    .positive()
    .or(z.string().transform((val) => parseInt(val, 10)))
    .default(1),

  pageSize: z
    .number()
    .int()
    .positive()
    .max(100, 'Page size cannot exceed 100')
    .or(z.string().transform((val) => parseInt(val, 10)))
    .default(20),

  sortBy: z
    .enum(['createdAt', 'rating', 'helpfulCount'])
    .default('createdAt'),

  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc'),
});

/**
 * Type inference for ReviewFiltersSchema
 */
export type ReviewFilters = z.infer<typeof ReviewFiltersSchema>;

// ============================================================================
// HELPFUL VOTING SCHEMAS
// ============================================================================

/**
 * Mark review as helpful/unhelpful validation
 */
export const VoteReviewSchema = z.object({
  reviewId: z
    .string()
    .min(1, 'Review ID is required')
    .cuid('Invalid review ID format'),

  userId: z
    .string()
    .min(1, 'User ID is required')
    .cuid('Invalid user ID format'),
});

/**
 * Type inference for VoteReviewSchema
 */
export type VoteReviewInput = z.infer<typeof VoteReviewSchema>;

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

/**
 * Pagination query parameters
 */
export const PaginationSchema = z.object({
  page: z
    .number()
    .int()
    .positive()
    .or(z.string().transform((val) => parseInt(val, 10)))
    .default(1),

  pageSize: z
    .number()
    .int()
    .positive()
    .max(100)
    .or(z.string().transform((val) => parseInt(val, 10)))
    .default(20),
});

/**
 * Type inference for PaginationSchema
 */
export type PaginationParams = z.infer<typeof PaginationSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate and sanitize review input
 * Removes leading/trailing whitespace and normalizes data
 */
export function sanitizeReviewInput(input: any): any {
  return {
    ...input,
    reviewText: input.reviewText?.trim(),
    photoUrl: input.photoUrl?.trim(),
  };
}

/**
 * Validate rating value
 * Ensures rating is within valid range
 */
export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/**
 * Validate review text length
 * Checks if review text is within allowed character limit
 */
export function isValidReviewText(text: string): boolean {
  return text.length <= 500;
}

/**
 * Validate photo URL format
 * Checks if URL is valid and not too long
 */
export function isValidPhotoUrl(url: string): boolean {
  try {
    new URL(url);
    return url.length <= 500;
  } catch {
    return false;
  }
}

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export const ReviewValidators = {
  // Base schemas
  Rating: RatingSchema,
  ReviewText: ReviewTextSchema,
  PhotoUrl: PhotoUrlSchema,
  ReviewStatus: ReviewStatusSchema,

  // Operation schemas
  CreateReview: CreateReviewSchema,
  UpdateReview: UpdateReviewSchema,
  FarmerResponse: FarmerResponseSchema,
  FlagReview: FlagReviewSchema,
  ModerateReview: ModerateReviewSchema,

  // Query schemas
  ReviewFilters: ReviewFiltersSchema,
  VoteReview: VoteReviewSchema,
  Pagination: PaginationSchema,

  // Helper functions
  sanitizeReviewInput,
  isValidRating,
  isValidReviewText,
  isValidPhotoUrl,
};

export default ReviewValidators;
