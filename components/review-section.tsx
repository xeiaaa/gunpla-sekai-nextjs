"use client";

import { useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewForm } from "./review-form";
import {
  ReviewDisplay,
  ReviewStatsDisplay,
  ReviewList,
} from "./review-display";
import {
  useKitReviews,
  useUserKitReview,
  useKitReviewStats,
  useDeleteReview,
  useInvalidateReviewQueries,
} from "@/hooks/use-reviews";
import { ReviewWithDetails, ReviewStats } from "@/lib/types/reviews";

type ReviewSortOption =
  | "newest"
  | "oldest"
  | "highest-score"
  | "lowest-score"
  | "most-helpful";

interface ReviewSectionProps {
  kitId: string;
  kitName: string;
  kitSlug: string;
}

export function ReviewSection({ kitId, kitName, kitSlug }: ReviewSectionProps) {
  const { userId } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [sortOption, setSortOption] =
    useState<ReviewSortOption>("most-helpful");
  const reviewFormRef = useRef<HTMLDivElement>(null);

  // React Query hooks
  const { data: allReviews = [], isLoading: reviewsLoading } =
    useKitReviews(kitId);
  const { data: stats, isLoading: statsLoading } = useKitReviewStats(kitId);
  const { data: userReview, isLoading: userReviewLoading } = useUserKitReview(
    kitId,
    userId
  );
  const deleteReviewMutation = useDeleteReview();
  const { invalidateReviewQueries } = useInvalidateReviewQueries();

  const isLoading = reviewsLoading || statsLoading || userReviewLoading;

  // Sort reviews based on selected option
  const sortReviews = (
    reviews: ReviewWithDetails[],
    sortBy: ReviewSortOption
  ): ReviewWithDetails[] => {
    const sorted = [...reviews];

    switch (sortBy) {
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "highest-score":
        return sorted.sort((a, b) => b.overallScore - a.overallScore);
      case "lowest-score":
        return sorted.sort((a, b) => a.overallScore - b.overallScore);
      case "most-helpful":
        return sorted.sort((a, b) => {
          const aHelpful = a.feedback?.helpful || 0;
          const bHelpful = b.feedback?.helpful || 0;
          if (aHelpful !== bHelpful) {
            return bHelpful - aHelpful;
          }
          // Secondary sort by overall score if helpful counts are equal
          return b.overallScore - a.overallScore;
        });
      default:
        return sorted;
    }
  };

  // Get sorted reviews (filter out user's review from community reviews)
  const communityReviews = userReview
    ? allReviews.filter((review) => review.id !== userReview.id)
    : allReviews;
  const reviews = sortReviews(communityReviews, sortOption);

  // Handle review form success
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setEditingReviewId(null);
    invalidateReviewQueries(kitId); // Invalidate React Query cache
  };

  // Handle edit review
  const handleEditReview = (reviewId: string) => {
    setEditingReviewId(reviewId);
    setShowReviewForm(true);

    // Scroll to the review form after a brief delay to ensure it's rendered
    setTimeout(() => {
      reviewFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this review? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteReviewMutation.mutateAsync(reviewId);
      // React Query will automatically invalidate and refetch the data
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  // Handle cancel review form
  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReviewId(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      {stats && <ReviewStatsDisplay stats={stats} />}

      {/* User Actions */}
      {userId && (
        <Card>
          <CardContent className="p-6">
            {userReview ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Your Review</h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEditReview(userReview.id)}
                    >
                      Edit Review
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteReview(userReview.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete Review
                    </Button>
                  </div>
                </div>
                <ReviewDisplay review={userReview} showFullContent />
              </div>
            ) : (
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">
                  {reviews.length === 0
                    ? "Be the First to Review"
                    : "Write a Review"}
                </h3>
                <p className="text-muted-foreground">
                  {reviews.length === 0
                    ? "Share your experience building this kit and help others decide"
                    : "Share your experience building this kit with the community"}
                </p>
                <Button onClick={() => setShowReviewForm(true)}>
                  {reviews.length === 0 ? "Write First Review" : "Write Review"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div ref={reviewFormRef}>
          <ReviewForm
            kitId={kitId}
            kitName={kitName}
            existingReview={
              editingReviewId ? userReview || undefined : undefined
            }
            onSuccess={handleReviewSuccess}
            onCancel={handleCancelReview}
          />
        </div>
      )}

      {/* Community Reviews */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Community Reviews</CardTitle>
              <p className="text-sm text-muted-foreground">
                {reviews.length} review{reviews.length !== 1 ? "s" : ""} from
                the community
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="sort-select" className="text-sm font-medium">
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) =>
                  setSortOption(e.target.value as ReviewSortOption)
                }
                className="px-3 py-1 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest-score">Highest Score</option>
                <option value="lowest-score">Lowest Score</option>
                <option value="most-helpful">Most Helpful</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ReviewList
            reviews={reviews}
            showUserActions={!!userId}
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
            currentUserId={userId || undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
