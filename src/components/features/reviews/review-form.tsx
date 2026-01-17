/**
 * REVIEW FORM COMPONENT
 * =====================
 *
 * Allows customers to submit product/farm reviews with ratings
 *
 * Features:
 * - Star rating (1-5)
 * - Review text with validation
 * - Photo upload support
 * - Real-time validation
 * - Success/error handling
 *
 * @component ReviewForm
 * @version 1.0.0
 */

"use client";

import { Loader2, Star, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export interface ReviewFormProps {
  productId?: string;
  farmId: string;
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  productId,
  farmId,
  orderId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const router = useRouter();

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }

    if (!reviewText.trim()) {
      newErrors.reviewText = "Please write a review";
    } else if (reviewText.trim().length < 10) {
      newErrors.reviewText = "Review must be at least 10 characters";
    } else if (reviewText.trim().length > 2000) {
      newErrors.reviewText = "Review must not exceed 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Upload photo if present
      let photoUrl: string | undefined;

      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("type", "review");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload photo");
        }

        const uploadData = await uploadResponse.json();
        photoUrl = uploadData.url;
      }

      // Submit review
      const response = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          farmId,
          orderId,
          rating,
          reviewText: reviewText.trim(),
          photoUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to submit review");
      }

      // Success!
      toast.success("Review submitted successfully!");

      // Reset form
      setRating(0);
      setReviewText("");
      setPhotoFile(null);
      setPhotoPreview(null);
      setErrors({});

      // Refresh page data
      router.refresh();

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit review",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating Section */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Your Rating *
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              {rating} star{rating > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      {/* Review Text Section */}
      <div>
        <label
          htmlFor="reviewText"
          className="block text-sm font-medium text-gray-900 mb-2"
        >
          Your Review *
        </label>
        <textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => {
            setReviewText(e.target.value);
            // Clear error when user starts typing
            if (errors.reviewText) {
              setErrors((prev) => ({ ...prev, reviewText: "" }));
            }
          }}
          rows={5}
          maxLength={2000}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
            errors.reviewText ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Share your experience with this product. What did you like? How was the quality?"
        />
        <div className="flex justify-between mt-1">
          <div>
            {errors.reviewText && (
              <p className="text-sm text-red-600">{errors.reviewText}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {reviewText.length}/2000 characters
          </p>
        </div>
      </div>

      {/* Photo Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Add Photo (Optional)
        </label>

        {photoPreview ? (
          <div className="relative inline-block">
            <img
              src={photoPreview}
              alt="Review photo preview"
              className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              aria-label="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full max-w-xs h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="mb-2 text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Review Guidelines
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Be honest and constructive</li>
          <li>Focus on your personal experience</li>
          <li>Include details about quality, freshness, and taste</li>
          <li>Avoid inappropriate language or personal information</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Verification Notice */}
      <p className="text-xs text-gray-500">
        Your review will be verified before being published. Reviews from
        verified purchases are marked with a badge.
      </p>
    </form>
  );
}
