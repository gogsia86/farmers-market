import { Farm, FarmRating, Product, Review, User } from "@prisma/client";

/**
 * Review Form Data (from user input)
 */
export interface ReviewFormData {
  rating: number; // 1-5
  title?: string;
  content: string;
  photos?: File[];
  productId: string;
  farmId: string;
  orderId?: string; // For verified purchase
}

/**
 * Review with Relations
 */
export interface ReviewWithRelations extends Review {
  customer: Pick<User, "id" | "name" | "image">;
  product: Pick<Product, "id" | "name" | "images"> | null;
  farm: Pick<Farm, "id" | "name">;
}

/**
 * Farm Rating Statistics
 */
export interface FarmRatingStats extends FarmRating {
  farm: Pick<Farm, "id" | "name" | "slug">;
}

/**
 * Review Filters
 */
export interface ReviewFilters {
  productId?: string;
  farmId?: string;
  userId?: string;
  rating?: number;
  verified?: boolean;
  withPhotos?: boolean;
  sortBy?: "recent" | "helpful" | "rating_high" | "rating_low";
  limit?: number;
  offset?: number;
}

/**
 * Review Creation Response
 */
export interface ReviewCreationResponse {
  success: boolean;
  review?: Review;
  error?: string;
  farmRating?: FarmRating;
}

/**
 * Review Statistics
 */
export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedPurchaseCount: number;
  withPhotosCount: number;
}

/**
 * Review Update Data
 */
export interface ReviewUpdateData {
  title?: string;
  content?: string;
  rating?: number;
  photos?: string[];
}

/**
 * Farmer Response Data
 */
export interface FarmerResponseData {
  response: string;
  reviewId: string;
  farmerId: string;
}
