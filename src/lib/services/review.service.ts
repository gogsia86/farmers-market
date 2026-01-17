/**
 * REVIEW SERVICE - DIVINE AGRICULTURAL BUSINESS LOGIC
 * ====================================================
 *
 * Comprehensive review management system for the Farmers Market Platform
 * Handles review creation, moderation, ratings, and farmer responses
 *
 * Features:
 * - Create and manage reviews with ratings
 * - Verified purchase validation
 * - Review moderation and flagging
 * - Farmer response system
 * - Average rating calculations
 * - Helpful/unhelpful voting
 * - Photo uploads support
 *
 * @module ReviewService
 * @version 2.0.0
 */

import { cache } from "@/lib/cache/";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/monitoring/logger";
import type { OrderStatus, Review, ReviewStatus } from "@prisma/client";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CreateReviewInput {
  farmId: string;
  productId?: string;
  customerId: string;
  orderId?: string;
  rating: number;
  reviewText?: string;
  photoUrl?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  reviewText?: string;
  photoUrl?: string;
}

export interface ReviewFilters {
  farmId?: string;
  productId?: string;
  customerId?: string;
  rating?: number;
  status?: ReviewStatus;
  isVerifiedPurchase?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "rating" | "helpfulCount";
  sortOrder?: "asc" | "desc";
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verifiedPurchasePercentage: number;
}

export interface FarmerResponseInput {
  reviewId: string;
  farmerId: string;
  response: string;
}

export interface FlagReviewInput {
  reviewId: string;
  reason: string;
  flaggedBy: string;
}

export interface ModerateReviewInput {
  reviewId: string;
  moderatorId: string;
  status: ReviewStatus;
  moderationNotes?: string;
}

// ============================================================================
// REVIEW SERVICE CLASS
// ============================================================================

export class ReviewService {
  private readonly logger = createLogger("ReviewService");

  // ==========================================================================
  // CREATE & UPDATE OPERATIONS
  // ==========================================================================

  /**
   * Create a new review
   * - Validates customer hasn't already reviewed this farm/product
   * - Checks for verified purchase if orderId provided
   * - Calculates and updates farm/product average rating
   */
  async createReview(input: CreateReviewInput): Promise<Review> {
    this.logger.info("Creating review", {
      farmId: input.farmId,
      customerId: input.customerId,
    });

    // Validate rating range
    if (input.rating < 1 || input.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if customer already reviewed this farm/product
    const existingReview = await this.findExistingReview(
      input.customerId,
      input.farmId,
      input.productId,
    );

    if (existingReview) {
      throw new Error(
        "You have already reviewed this " +
          (input.productId ? "product" : "farm"),
      );
    }

    // Verify purchase if orderId provided
    let isVerifiedPurchase = false;
    if (input.orderId) {
      isVerifiedPurchase = await this.verifyPurchase(
        input.orderId,
        input.customerId,
        input.farmId,
        input.productId,
      );
    }

    // Create review
    const review = await database.review.create({
      data: {
        farmId: input.farmId,
        productId: input.productId,
        customerId: input.customerId,
        orderId: input.orderId,
        rating: input.rating,
        reviewText: input.reviewText,
        photoUrl: input.photoUrl,
        isVerifiedPurchase,
        status: "PENDING", // Reviews are moderated by default
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Invalidate cache
    await this.invalidateReviewCache(input.farmId, input.productId);

    // Update average ratings asynchronously
    this.updateAverageRatings(input.farmId, input.productId ?? undefined).catch(
      (error) => {
        this.logger.error("Failed to update average ratings", {
          error,
          farmId: input.farmId,
        });
      },
    );

    this.logger.info("Review created successfully", { reviewId: review.id });

    return review;
  }

  /**
   * Update an existing review
   * - Only the review author can update
   * - Recalculates average ratings
   */
  async updateReview(
    reviewId: string,
    customerId: string,
    input: UpdateReviewInput,
  ): Promise<Review> {
    this.logger.info("Updating review", { reviewId, customerId });

    // Verify ownership
    const existingReview = await database.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      throw new Error("Review not found");
    }

    if (existingReview.customerId !== customerId) {
      throw new Error("You can only update your own reviews");
    }

    // Validate rating if provided
    if (input.rating && (input.rating < 1 || input.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Update review
    const updatedReview = await database.review.update({
      where: { id: reviewId },
      data: {
        rating: input.rating,
        reviewText: input.reviewText,
        photoUrl: input.photoUrl,
        status: "PENDING", // Reset to pending after edit
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Invalidate cache
    await this.invalidateReviewCache(
      existingReview.farmId,
      existingReview.productId ?? undefined,
    );

    // Update average ratings if rating changed
    if (input.rating && input.rating !== existingReview.rating) {
      this.updateAverageRatings(
        existingReview.farmId,
        existingReview.productId ?? undefined,
      ).catch((error) => {
        this.logger.error("Failed to update average ratings", { error });
      });
    }

    this.logger.info("Review updated successfully", { reviewId });

    return updatedReview;
  }

  /**
   * Delete a review
   * - Only author or admin can delete
   * - Soft delete by setting status to REMOVED
   */
  async deleteReview(
    reviewId: string,
    userId: string,
    isAdmin = false,
  ): Promise<void> {
    this.logger.info("Deleting review", { reviewId, userId });

    const review = await database.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error("Review not found");
    }

    if (!isAdmin && review.customerId !== userId) {
      throw new Error("You can only delete your own reviews");
    }

    // Soft delete
    await database.review.update({
      where: { id: reviewId },
      data: {
        status: "REMOVED",
        moderatedBy: userId,
        moderatedAt: new Date(),
      },
    });

    // Invalidate cache
    await this.invalidateReviewCache(
      review.farmId,
      review.productId ?? undefined,
    );

    // Update average ratings
    this.updateAverageRatings(
      review.farmId,
      review.productId ?? undefined,
    ).catch((error) => {
      this.logger.error("Failed to update average ratings", { error });
    });

    this.logger.info("Review deleted successfully", { reviewId });
  }

  // ==========================================================================
  // READ OPERATIONS
  // ==========================================================================

  /**
   * Get reviews with filters and pagination
   */
  async getReviews(filters: ReviewFilters): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const {
      farmId,
      productId,
      customerId,
      rating,
      status = "APPROVED",
      isVerifiedPurchase,
      page = 1,
      pageSize = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    // Build where clause
    const where: any = {};

    if (farmId) where.farmId = farmId;
    if (productId) where.productId = productId;
    if (customerId) where.customerId = customerId;
    if (rating) where.rating = rating;
    if (status) where.status = status;
    if (isVerifiedPurchase !== undefined)
      where.isVerifiedPurchase = isVerifiedPurchase;

    // Cache key
    const cacheKey = `reviews:${JSON.stringify(where)}:${page}:${pageSize}:${sortBy}:${sortOrder}`;

    // Try cache first
    const cached = await cache.get<any>(cacheKey);
    if (cached) {
      this.logger.debug("Reviews cache hit", { cacheKey });
      return cached;
    }

    // Execute query
    const [reviews, total] = await Promise.all([
      database.review.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      database.review.count({ where }),
    ]);

    const result = {
      reviews,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Get a single review by ID
   */
  async getReviewById(reviewId: string): Promise<Review | null> {
    return await database.review.findUnique({
      where: { id: reviewId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Get review statistics for a farm or product
   */
  async getReviewStats(
    farmId?: string,
    productId?: string,
  ): Promise<ReviewStats> {
    const cacheKey = `review-stats:${farmId || "none"}:${productId || "none"}`;

    // Try cache first
    const cached = await cache.get<ReviewStats>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = { status: "APPROVED" };
    if (farmId) where.farmId = farmId;
    if (productId) where.productId = productId;

    // Get all approved reviews
    const reviews = await database.review.findMany({
      where,
      select: {
        rating: true,
        isVerifiedPurchase: true,
      },
    });

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        verifiedPurchasePercentage: 0,
      };
    }

    // Calculate statistics
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    let verifiedCount = 0;

    reviews.forEach((review) => {
      totalRating += review.rating;
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      if (review.isVerifiedPurchase) verifiedCount++;
    });

    const stats: ReviewStats = {
      totalReviews,
      averageRating: Math.round((totalRating / totalReviews) * 10) / 10,
      ratingDistribution,
      verifiedPurchasePercentage: Math.round(
        (verifiedCount / totalReviews) * 100,
      ),
    };

    // Cache for 10 minutes
    await cache.set(cacheKey, stats, 600);

    return stats;
  }

  // ==========================================================================
  // FARMER RESPONSE
  // ==========================================================================

  /**
   * Add farmer response to a review
   */
  async addFarmerResponse(input: FarmerResponseInput): Promise<Review> {
    const { reviewId, farmerId, response } = input;

    this.logger.info("Adding farmer response", { reviewId, farmerId });

    // Get review and verify farmer owns the farm
    const review = await database.review.findUnique({
      where: { id: reviewId },
      include: {
        farm: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.farm.ownerId !== farmerId) {
      throw new Error("You can only respond to reviews on your own farm");
    }

    // Update review with response
    const updatedReview = await database.review.update({
      where: { id: reviewId },
      data: {
        farmerResponse: response,
        farmerRespondedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Invalidate cache
    await this.invalidateReviewCache(
      review.farmId,
      review.productId ?? undefined,
    );

    this.logger.info("Farmer response added successfully", { reviewId });

    return updatedReview;
  }

  // ==========================================================================
  // MODERATION
  // ==========================================================================

  /**
   * Flag a review for moderation
   */
  async flagReview(input: FlagReviewInput): Promise<Review> {
    const { reviewId, reason, flaggedBy } = input;

    this.logger.info("Flagging review", { reviewId, flaggedBy });

    const review = await database.review.update({
      where: { id: reviewId },
      data: {
        status: "FLAGGED",
        flaggedReason: reason,
        flaggedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Invalidate cache
    await this.invalidateReviewCache(
      review.farmId,
      review.productId ?? undefined,
    );

    this.logger.info("Review flagged successfully", { reviewId });

    return review;
  }

  /**
   * Moderate a review (admin only)
   */
  async moderateReview(input: ModerateReviewInput): Promise<Review> {
    const { reviewId, moderatorId, status, moderationNotes } = input;

    this.logger.info("Moderating review", { reviewId, moderatorId, status });

    const review = await database.review.update({
      where: { id: reviewId },
      data: {
        status,
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
        flaggedReason: moderationNotes || undefined,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Invalidate cache
    await this.invalidateReviewCache(
      review.farmId,
      review.productId ?? undefined,
    );

    // Update average ratings if status changed to/from APPROVED
    if (status === "APPROVED" || review.status === "APPROVED") {
      this.updateAverageRatings(
        review.farmId,
        review.productId ?? undefined,
      ).catch((error) => {
        this.logger.error("Failed to update average ratings", { error });
      });
    }

    this.logger.info("Review moderated successfully", { reviewId, status });

    return review;
  }

  /**
   * Get pending reviews for moderation
   */
  async getPendingReviews(
    page = 1,
    pageSize = 50,
  ): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const where = { status: "PENDING" as ReviewStatus };

    const [reviews, total] = await Promise.all([
      database.review.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      database.review.count({ where }),
    ]);

    return {
      reviews,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get flagged reviews for moderation
   */
  async getFlaggedReviews(
    page = 1,
    pageSize = 50,
  ): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const where = { status: "FLAGGED" as ReviewStatus };

    const [reviews, total] = await Promise.all([
      database.review.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { flaggedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      database.review.count({ where }),
    ]);

    return {
      reviews,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ==========================================================================
  // HELPFUL VOTING
  // ==========================================================================

  /**
   * Mark a review as helpful
   */
  async markHelpful(reviewId: string): Promise<Review> {
    const review = await database.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: { increment: 1 },
      },
    });

    // Invalidate cache
    const reviewData = await database.review.findUnique({
      where: { id: reviewId },
      select: { farmId: true, productId: true },
    });

    if (reviewData) {
      await this.invalidateReviewCache(
        reviewData.farmId,
        reviewData.productId ?? undefined,
      );
    }

    return review;
  }

  /**
   * Mark a review as unhelpful
   */
  async markUnhelpful(reviewId: string): Promise<Review> {
    const review = await database.review.update({
      where: { id: reviewId },
      data: {
        unhelpfulCount: { increment: 1 },
      },
    });

    // Invalidate cache
    const reviewData = await database.review.findUnique({
      where: { id: reviewId },
      select: { farmId: true, productId: true },
    });

    if (reviewData) {
      await this.invalidateReviewCache(
        reviewData.farmId,
        reviewData.productId ?? undefined,
      );
    }

    return review;
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  /**
   * Check if customer already reviewed this farm/product
   */
  private async findExistingReview(
    customerId: string,
    farmId: string,
    productId?: string,
  ): Promise<Review | null> {
    const where: any = {
      customerId,
      farmId,
      status: { in: ["PENDING", "APPROVED"] },
    };

    if (productId) {
      where.productId = productId;
    }

    return await database.review.findFirst({ where });
  }

  /**
   * Verify that the customer purchased from this farm/product
   */
  private async verifyPurchase(
    orderId: string,
    customerId: string,
    farmId: string,
    productId?: string,
  ): Promise<boolean> {
    const completedStatus: OrderStatus = "COMPLETED";

    const order = await database.order.findFirst({
      where: {
        id: orderId,
        customerId,
        farmId,
        status: completedStatus, // Only completed orders can be reviewed
      },
      include: {
        items: productId
          ? {
              where: { productId },
            }
          : true,
      },
    });

    if (!order) return false;

    // If productId specified, verify it was in the order
    if (productId && order.items) {
      const orderItems = Array.isArray(order.items) ? order.items : [];
      if (orderItems.length === 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Update average ratings for farm and product
   */
  private async updateAverageRatings(
    farmId: string,
    productId?: string,
  ): Promise<void> {
    // Update farm rating
    const farmStats = await this.getReviewStats(farmId);
    await database.farm.update({
      where: { id: farmId },
      data: {
        averageRating: farmStats.averageRating,
        reviewCount: farmStats.totalReviews,
      },
    });

    // Update product rating if applicable
    if (productId) {
      const productStats = await this.getReviewStats(undefined, productId);
      await database.product.update({
        where: { id: productId },
        data: {
          averageRating: productStats.averageRating,
          reviewCount: productStats.totalReviews,
        },
      });
    }
  }

  /**
   * Invalidate review-related cache
   */
  private async invalidateReviewCache(
    farmId: string,
    productId?: string,
  ): Promise<void> {
    const patterns = [`reviews:*${farmId}*`, `review-stats:${farmId}:*`];

    if (productId) {
      patterns.push(`reviews:*${productId}*`);
      patterns.push(`review-stats:*:${productId}`);
    }

    await Promise.all(
      patterns.map((pattern) => cache.invalidatePattern(pattern)),
    );
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const reviewService = new ReviewService();
