/**
 * REVIEW STATS COMPONENT
 * ======================
 *
 * Displays aggregate review statistics and insights
 *
 * Features:
 * - Average rating display
 * - Total review count
 * - Rating breakdown by stars
 * - Verified purchase percentage
 * - Visual progress bars
 * - Responsive design
 *
 * @component ReviewStats
 * @version 1.0.0
 */

"use client";

import { CheckCircle2, Star, TrendingUp } from "lucide-react";

export interface ReviewStatsProps {
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
  showTrend?: boolean;
  trendDirection?: "up" | "down" | "stable";
  trendValue?: number;
}

export function ReviewStats({
  totalReviews,
  averageRating,
  ratingDistribution,
  verifiedPurchasePercentage,
  showTrend = false,
  trendDirection = "stable",
  trendValue = 0,
}: ReviewStatsProps) {
  // Calculate percentages for each rating
  const getRatingPercentage = (rating: number): number => {
    if (totalReviews === 0) return 0;
    const count =
      ratingDistribution[rating as keyof typeof ratingDistribution] || 0;
    return (count / totalReviews) * 100;
  };

  // Get rating color
  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    if (rating >= 2.5) return "text-orange-600";
    return "text-red-600";
  };

  // Get rating description
  const getRatingDescription = (rating: number): string => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 3.5) return "Good";
    if (rating >= 2.5) return "Average";
    if (rating >= 1.5) return "Below Average";
    return "Poor";
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Overall Rating */}
        <div className="flex flex-col items-center justify-center text-center border-r border-gray-200 pr-8">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-4">
            Customer Reviews
          </h3>

          {/* Average Rating */}
          <div className="mb-4">
            <div
              className={`text-6xl font-bold ${getRatingColor(averageRating)}`}
            >
              {averageRating.toFixed(1)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {getRatingDescription(averageRating)}
            </p>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Total Reviews */}
          <p className="text-gray-700 font-medium">
            Based on {formatNumber(totalReviews)} review
            {totalReviews !== 1 ? "s" : ""}
          </p>

          {/* Trend Indicator */}
          {showTrend && trendValue !== 0 && (
            <div
              className={`mt-4 flex items-center gap-1 text-sm ${
                trendDirection === "up"
                  ? "text-green-600"
                  : trendDirection === "down"
                    ? "text-red-600"
                    : "text-gray-600"
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 ${
                  trendDirection === "down" ? "rotate-180" : ""
                }`}
              />
              <span>
                {trendDirection === "up" ? "+" : "-"}
                {Math.abs(trendValue).toFixed(1)}% from last month
              </span>
            </div>
          )}

          {/* Verified Purchase Badge */}
          {verifiedPurchasePercentage > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 font-medium">
                {verifiedPurchasePercentage.toFixed(0)}% verified purchases
              </span>
            </div>
          )}
        </div>

        {/* Right Column - Rating Distribution */}
        <div className="flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Rating Breakdown
          </h3>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                ratingDistribution[rating as keyof typeof ratingDistribution] ||
                0;
              const percentage = getRatingPercentage(rating);

              return (
                <div key={rating} className="flex items-center gap-3">
                  {/* Star Label */}
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium text-gray-700 w-4">
                      {rating}
                    </span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>

                  {/* Progress Bar */}
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        rating >= 4
                          ? "bg-green-500"
                          : rating >= 3
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Count and Percentage */}
                  <div className="flex items-center gap-2 w-24 text-sm text-gray-600">
                    <span className="font-medium">{count}</span>
                    <span className="text-gray-500">
                      ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              {/* Positive Reviews */}
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(
                    ((ratingDistribution[5] + ratingDistribution[4]) /
                      totalReviews) *
                    100
                  ).toFixed(0)}
                  %
                </div>
                <p className="text-xs text-gray-600 mt-1">Positive (4-5★)</p>
              </div>

              {/* Neutral Reviews */}
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {totalReviews > 0
                    ? ((ratingDistribution[3] / totalReviews) * 100).toFixed(0)
                    : 0}
                  %
                </div>
                <p className="text-xs text-gray-600 mt-1">Neutral (3★)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* No Reviews State */}
      {totalReviews === 0 && (
        <div className="text-center py-8">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-600">
            Be the first to share your experience!
          </p>
        </div>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function ReviewStatsCompact({
  totalReviews,
  averageRating,
  verifiedPurchasePercentage,
}: Pick<
  ReviewStatsProps,
  "totalReviews" | "averageRating" | "verifiedPurchasePercentage"
>) {
  return (
    <div className="flex items-center gap-4">
      {/* Rating */}
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        <span className="text-lg font-bold text-gray-900">
          {averageRating.toFixed(1)}
        </span>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-300" />

      {/* Review Count */}
      <span className="text-sm text-gray-600">
        {totalReviews} review{totalReviews !== 1 ? "s" : ""}
      </span>

      {/* Verified Badge */}
      {verifiedPurchasePercentage > 0 && (
        <>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-1 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            <span>{verifiedPurchasePercentage.toFixed(0)}% verified</span>
          </div>
        </>
      )}
    </div>
  );
}
