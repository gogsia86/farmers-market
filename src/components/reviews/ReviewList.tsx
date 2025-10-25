/**
 * REVIEW LIST COMPONENT
 * Divine agricultural product reviews display
 */

'use client';

import { useState } from 'react';
import { StarRatingDisplay } from './StarRating';
import { QuantumButton } from '@/components/ui/QuantumButton';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { Review } from '@/types/review.types';

interface ReviewListProps {
  productId: string;
  reviews: Review[];
  canRespond?: boolean;
  onReviewUpdate?: () => void;
}

export function ReviewList({
  productId,
  reviews,
  canRespond = false,
  onReviewUpdate,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No reviews yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Be the first to review this product!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          canRespond={canRespond}
          onUpdate={onReviewUpdate}
        />
      ))}
    </div>
  );
}

interface ReviewItemProps {
  review: Review;
  canRespond: boolean;
  onUpdate?: () => void;
}

function ReviewItem({ review, canRespond, onUpdate }: ReviewItemProps) {
  const [isMarkingHelpful, setIsMarkingHelpful] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [response, setResponse] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const handleMarkHelpful = async () => {
    setIsMarkingHelpful(true);

    try {
      const res = await fetch(`/api/reviews/${review.id}/helpful`, {
        method: 'PATCH',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to mark as helpful');
      }

      toast.success('Marked as helpful!');
      onUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to mark helpful');
    } finally {
      setIsMarkingHelpful(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      toast.error('Please write a response');
      return;
    }

    setIsSubmittingResponse(true);

    try {
      const res = await fetch(`/api/reviews/${review.id}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: response.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit response');
      }

      toast.success('Response submitted!');
      setShowResponse(false);
      setResponse('');
      onUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit response');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-agricultural-100 flex items-center justify-center">
              <span className="text-agricultural-600 font-semibold">
                {review.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {review.user?.name || 'Anonymous'}
              </p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
        <StarRatingDisplay rating={review.rating} size="sm" />
      </div>

      {/* Review Content */}
      <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

      {/* Helpful Button */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <QuantumButton
          variant="secondary"
          size="sm"
          onClick={handleMarkHelpful}
          loading={isMarkingHelpful}
          icon={<ThumbsUp className="w-4 h-4" />}
        >
          Helpful ({review.helpfulCount || 0})
        </QuantumButton>

        {canRespond && !review.response && (
          <QuantumButton
            variant="secondary"
            size="sm"
            onClick={() => setShowResponse(!showResponse)}
          >
            Respond
          </QuantumButton>
        )}
      </div>

      {/* Farmer Response */}
      {review.response && (
        <div className="mt-4 ml-6 p-4 bg-agricultural-50 rounded-lg border-l-4 border-agricultural-500">
          <p className="text-sm font-medium text-agricultural-900 mb-2">
            Response from Farmer
          </p>
          <p className="text-gray-700">{review.response}</p>
        </div>
      )}

      {/* Response Form */}
      {showResponse && canRespond && (
        <div className="mt-4 ml-6 space-y-3">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your response..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agricultural-500 focus:border-transparent"
          />
          <div className="flex gap-2 justify-end">
            <QuantumButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowResponse(false);
                setResponse('');
              }}
            >
              Cancel
            </QuantumButton>
            <QuantumButton
              variant="agricultural"
              size="sm"
              onClick={handleSubmitResponse}
              loading={isSubmittingResponse}
            >
              Submit Response
            </QuantumButton>
          </div>
        </div>
      )}
    </div>
  );
}
