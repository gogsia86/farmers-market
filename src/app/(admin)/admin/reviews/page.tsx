/**
 * Admin Reviews Moderation Page
 * Moderate and manage customer reviews
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  RefreshCw,
  Star,
  ThumbsUp
} from "lucide-react";
import { useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  status: "PENDING" | "APPROVED" | "FLAGGED" | "REMOVED";
  createdAt: string;
  customer: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
  };
  product: {
    id: string;
    name: string;
  } | null;
  farm: {
    id: string;
    name: string;
  };
}

interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: {
      totalReviews: number;
      pendingCount: number;
      approvedCount: number;
      flaggedCount: number;
    };
  };
  error?: {
    message: string;
  };
}

// ============================================================================
// Component
// ============================================================================

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Pagination & Stats
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    totalReviews: 0,
    pendingCount: 0,
    approvedCount: 0,
    flaggedCount: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter,
      });

      const response = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data: ReviewsResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to fetch reviews");
      }

      setReviews(data.data.reviews);
      setPagination(data.data.pagination);
      setStats(data.data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId);

    try {
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          action: "APPROVE",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to approve review");
      }

      await fetchReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve review");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFlag = async (reviewId: string) => {
    const reason = prompt("Please provide a reason for flagging this review:");
    if (!reason) return;

    setActionLoading(reviewId);

    try {
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          action: "FLAG",
          reason,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to flag review");
      }

      await fetchReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to flag review");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FLAGGED":
        return "bg-red-100 text-red-800";
      case "REMOVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating
              ? "text-yellow-500 fill-yellow-500"
              : "text-gray-300"
              }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Moderation</h1>
          <p className="text-gray-600 mt-1">Approve or flag customer reviews</p>
        </div>
        <Button onClick={fetchReviews} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Reviews
              </CardTitle>
              <Star className="h-5 w-5 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending
              </CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Approved
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approvedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Flagged
              </CardTitle>
              <Flag className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.flaggedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="PENDING">
                Pending ({stats.pendingCount})
              </TabsTrigger>
              <TabsTrigger value="APPROVED">
                Approved ({stats.approvedCount})
              </TabsTrigger>
              <TabsTrigger value="FLAGGED">
                Flagged ({stats.flaggedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({pagination.total})</CardTitle>
          <CardDescription>
            Showing {reviews.length} of {pagination.total} reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No reviews found
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-6 border border-gray-200 rounded-lg space-y-4"
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {renderStars(review.rating)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            review.status
                          )}`}
                        >
                          {review.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">
                          {review.customer.name ||
                            `${review.customer.firstName} ${review.customer.lastName}` ||
                            "Anonymous"}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{review.customer.email}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Farm/Product Info */}
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Farm:</span>{" "}
                      <span className="font-medium">{review.farm.name}</span>
                    </div>
                    {review.product && (
                      <>
                        <span className="text-gray-400">•</span>
                        <div>
                          <span className="text-gray-600">Product:</span>{" "}
                          <span className="font-medium">{review.product.name}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Review Comment */}
                  {review.comment && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    {review.status === "PENDING" && (
                      <>
                        <Button
                          onClick={() => handleApprove(review.id)}
                          disabled={actionLoading === review.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleFlag(review.id)}
                          disabled={actionLoading === review.id}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 border-red-300"
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Flag
                        </Button>
                      </>
                    )}

                    {review.status === "FLAGGED" && (
                      <Button
                        onClick={() => handleApprove(review.id)}
                        disabled={actionLoading === review.id}
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Anyway
                      </Button>
                    )}

                    {review.status === "APPROVED" && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>This review is approved and visible</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agricultural Consciousness */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-green-800 text-sm">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              Moderating reviews with divine agricultural wisdom and fairness
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
