/**
 * CONSUMER REVIEWS PAGE - WIREFRAME IMPLEMENTATION
 *
 * Complete reviews management with:
 * - Review history with ratings
 * - Edit and delete actions
 * - Review submission form
 * - Filter by farm/product
 * - Empty states
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface Review {
  id: string;
  rating: number;
  comment: string;
  farmId?: string;
  farmName?: string;
  farmSlug?: string;
  productId?: string;
  productName?: string;
  productSlug?: string;
  orderId?: string;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
  helpful: number;
  notHelpful: number;
}

interface PendingReview {
  orderId: string;
  orderNumber: string;
  farmId: string;
  farmName: string;
  farmSlug: string;
  completedAt: string;
  items: Array<{
    productId: string;
    productName: string;
    productSlug: string;
  }>;
}

export default function ReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"pending" | "submitted">("pending");
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/dashboard/reviews");
      return;
    }

    if (status === "authenticated") {
      fetchReviews();
    }
  }, [status, router]);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews || []);
        setPendingReviews(data.pending || []);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(5);
    setEditComment("");
  };

  const handleUpdateReview = async (reviewId: string) => {
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Review updated successfully!" });
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, rating: editRating, comment: editComment, updatedAt: new Date().toISOString() }
              : r
          )
        );
        cancelEdit();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update review" });
      }
    } catch (error) {
      console.error("Review update error:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Review deleted successfully!" });
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete review" });
      }
    } catch (error) {
      console.error("Review delete error:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <ReviewsSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  const renderStars = (rating: number, interactive = false, onSelect?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onSelect?.(star)}
            className={`text-2xl transition-all ${
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            } ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
            disabled={!interactive}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-green-600 hover:text-green-700 font-medium mb-4 inline-flex items-center gap-2"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            My Reviews ⭐
          </h1>
          <p className="text-gray-600 mt-2">
            Share your experience and help other shoppers
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border-2 border-green-200"
                : "bg-red-50 text-red-800 border-2 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {message.type === "success" ? "✅" : "❌"}
              </span>
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl font-bold text-yellow-600">
              {pendingReviews.length}
            </div>
            <div className="text-sm text-gray-600">Pending Reviews</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl font-bold text-green-600">
              {reviews.length}
            </div>
            <div className="text-sm text-gray-600">Submitted Reviews</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 hidden sm:block">
            <div className="text-3xl font-bold text-blue-600">
              {reviews.length > 0
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : "0.0"}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === "pending"
                    ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                ✍️ Pending ({pendingReviews.length})
              </button>
              <button
                onClick={() => setActiveTab("submitted")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === "submitted"
                    ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                ✅ Submitted ({reviews.length})
              </button>
            </nav>
          </div>

          {/* Pending Reviews Tab */}
          {activeTab === "pending" && (
            <div className="p-6">
              {pendingReviews.length === 0 ? (
                <EmptyState
                  icon="✅"
                  title="All caught up!"
                  description="You've reviewed all your completed orders. Keep shopping to share more feedback!"
                  action={
                    <Link href="/farms" className="inline-block btn-green">
                      Browse Farms
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map((pending) => (
                    <div
                      key={pending.orderId}
                      className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {pending.farmName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Order #{pending.orderNumber} • Completed{" "}
                            {new Date(pending.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          href={`/dashboard/orders/${pending.orderId}/review`}
                          className="btn-green"
                        >
                          Write Review
                        </Link>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {pending.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                          >
                            {item.productName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submitted Reviews Tab */}
          {activeTab === "submitted" && (
            <div className="p-6">
              {reviews.length === 0 ? (
                <EmptyState
                  icon="⭐"
                  title="No reviews yet"
                  description="Complete an order and share your experience to help the community"
                  action={
                    <Link href="/farms" className="inline-block btn-green">
                      Start Shopping
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-2 border-gray-200 rounded-lg p-6"
                    >
                      {editingId === review.id ? (
                        // Edit Mode
                        <div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Rating
                            </label>
                            {renderStars(editRating, true, setEditRating)}
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your Review
                            </label>
                            <textarea
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              className="input-field min-h-[120px]"
                              placeholder="Share your experience..."
                              required
                            />
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleUpdateReview(review.id)}
                              disabled={submitting}
                              className="btn-green disabled:opacity-50"
                            >
                              {submitting ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="btn-outline"
                              disabled={submitting}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-600">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>

                              {review.farmName && (
                                <Link
                                  href={`/farms/${review.farmSlug}`}
                                  className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors"
                                >
                                  {review.farmName}
                                </Link>
                              )}

                              {review.productName && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Product: {review.productName}
                                </p>
                              )}

                              {review.orderNumber && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Order #{review.orderNumber}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(review)}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                disabled={submitting}
                                className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors disabled:opacity-50"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                            {review.comment}
                          </p>

                          {review.updatedAt !== review.createdAt && (
                            <p className="text-xs text-gray-500">
                              Updated {new Date(review.updatedAt).toLocaleDateString()}
                            </p>
                          )}

                          {(review.helpful > 0 || review.notHelpful > 0) && (
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                              <span className="text-sm text-gray-600">
                                👍 {review.helpful} found helpful
                              </span>
                              {review.notHelpful > 0 && (
                                <span className="text-sm text-gray-600">
                                  👎 {review.notHelpful}
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">💡</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Write Helpful Reviews
              </h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Share specific details about product quality and freshness</li>
                <li>• Mention the farm's customer service and packaging</li>
                <li>• Be honest but constructive in your feedback</li>
                <li>• Help other shoppers make informed decisions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
