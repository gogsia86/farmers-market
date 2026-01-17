/**
 * REVIEW LIST COMPONENT
 * =====================
 *
 * Displays a list of product/farm reviews with filtering and sorting
 *
 * Features:
 * - Display reviews with ratings and user info
 * - Verified purchase badges
 * - Helpful/unhelpful voting
 * - Farmer responses
 * - Filtering by rating
 * - Sorting options
 * - Pagination
 *
 * @component ReviewList
 * @version 1.0.0
 */

"use client";

import { CheckCircle2, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  reviewText: string;
  photoUrl?: string | null;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
  farmerResponse?: string | null;
  farmerRespondedAt?: Date | null;
  createdAt: Date;
  customer: {
    id: string;
    name: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
}

export interface ReviewListProps {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  productId?: string;
  farmId?: string;
  showFilters?: boolean;
}

type SortOption = "recent" | "helpful" | "rating-high" | "rating-low";
type FilterOption = "all" | "5" | "4" | "3" | "2" | "1" | "verified";

export function ReviewList({
  reviews: initialReviews,
  totalReviews,
  averageRating,
  ratingDistribution,
  productId,
  farmId,
  showFilters = true,
}: ReviewListProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [votedReviews, setVotedReviews] = useState<Set<string>>(new Set());

  // Handle helpful vote
  const handleHelpful = async (reviewId: string) => {
    if (votedReviews.has(reviewId)) {
      toast.info("You already voted on this review");
      return;
    }

    try {
      const response = await fetch(`/api/v1/reviews/${reviewId}/helpful`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to mark as helpful");
      }

      // Update local state
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? { ...review, helpfulCount: review.helpfulCount + 1 }
            : review,
        ),
      );

      setVotedReviews((prev) => new Set(prev).add(reviewId));
      toast.success("Thank you for your feedback!");
    } catch (error) {
      console.error("Failed to mark as helpful:", error);
      toast.error("Failed to submit vote");
    }
  };

  // Handle unhelpful vote
  const handleUnhelpful = async (reviewId: string) => {
    if (votedReviews.has(reviewId)) {
      toast.info("You already voted on this review");
      return;
    }

    try {
      const response = await fetch(`/api/v1/reviews/${reviewId}/unhelpful`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to mark as unhelpful");
      }

      // Update local state
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? { ...review, unhelpfulCount: review.unhelpfulCount + 1 }
            : review,
        ),
      );

      setVotedReviews((prev) => new Set(prev).add(reviewId));
      toast.success("Thank you for your feedback!");
    } catch (error) {
      console.error("Failed to mark as unhelpful:", error);
      toast.error("Failed to submit vote");
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  // Get customer display name
  const getCustomerName = (customer: Review["customer"]) => {
    if (customer.name) return customer.name;
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    }
    if (customer.firstName) return customer.firstName;
    return "Anonymous";
  };

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter((review) => {
      if (filterBy === "all") return true;
      if (filterBy === "verified") return review.isVerifiedPurchase;
      return review.rating === parseInt(filterBy);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "helpful":
          return b.helpfulCount - a.helpfulCount;
        case "rating-high":
          return b.rating - a.rating;
        case "rating-low":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start gap-8">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage =
                totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm text-gray-700">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter */}
          <div className="flex-1">
            <label
              htmlFor="filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by
            </label>
            <select
              id="filter"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All reviews</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
              <option value="verified">Verified purchases only</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex-1">
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="recent">Most recent</option>
              <option value="helpful">Most helpful</option>
              <option value="rating-high">Highest rating</option>
              <option value="rating-low">Lowest rating</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredAndSortedReviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No reviews found.</p>
            <p className="text-sm text-gray-500 mt-1">
              Be the first to review this product!
            </p>
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                    {getCustomerName(review.customer).charAt(0).toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {getCustomerName(review.customer)}
                      </h4>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {review.reviewText}
                </p>
              </div>

              {/* Review Photo */}
              {review.photoUrl && (
                <div className="mb-4">
                  <img
                    src={review.photoUrl}
                    alt="Review photo"
                    className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Farmer Response */}
              {review.farmerResponse && (
                <div className="mt-4 ml-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-green-900">
                      Response from Farmer
                    </span>
                    {review.farmerRespondedAt && (
                      <span className="text-xs text-green-700">
                        {formatDate(review.farmerRespondedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-green-800">
                    {review.farmerResponse}
                  </p>
                </div>
              )}

              {/* Helpful Votes */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Was this helpful?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleHelpful(review.id)}
                    disabled={votedReviews.has(review.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Yes ({review.helpfulCount})</span>
                  </button>
                  <button
                    onClick={() => handleUnhelpful(review.id)}
                    disabled={votedReviews.has(review.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>No ({review.unhelpfulCount})</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More (if needed) */}
      {filteredAndSortedReviews.length < totalReviews && (
        <div className="text-center">
          <button className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}
