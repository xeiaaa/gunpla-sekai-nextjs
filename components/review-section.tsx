"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewForm } from "./review-form";
import { ReviewDisplay, ReviewStatsDisplay, ReviewList } from "./review-display";
import {
  getKitReviews,
  getUserKitReview,
  getKitReviewStats,
  deleteReview
} from "@/lib/actions/reviews";
import {
  ReviewWithDetails,
  ReviewStats
} from "@/lib/types/reviews";

interface ReviewSectionProps {
  kitId: string;
  kitName: string;
  kitSlug: string;
}

export function ReviewSection({ kitId, kitName, kitSlug }: ReviewSectionProps) {
  const { userId } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [userReview, setUserReview] = useState<ReviewWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Load reviews and stats
  const loadData = async () => {
    try {
      setIsLoading(true);

      const [reviewsData, statsData, userReviewData] = await Promise.all([
        getKitReviews(kitId, 10, 0),
        getKitReviewStats(kitId),
        userId ? getUserKitReview(kitId) : Promise.resolve(null),
      ]);

      setReviews(reviewsData);
      setStats(statsData);
      setUserReview(userReviewData);
    } catch (error) {
      console.error("Error loading review data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [kitId, userId]);

  // Handle review form success
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setEditingReviewId(null);
    loadData(); // Reload all data
  };

  // Handle edit review
  const handleEditReview = (reviewId: string) => {
    setEditingReviewId(reviewId);
    setShowReviewForm(true);
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteReview(reviewId);
      loadData(); // Reload all data
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
                <h3 className="text-lg font-semibold">Write a Review</h3>
                <p className="text-muted-foreground">
                  Share your experience building this kit with the community
                </p>
                <Button onClick={() => setShowReviewForm(true)}>
                  Write Review
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          kitId={kitId}
          kitName={kitName}
          existingReview={editingReviewId ? userReview : undefined}
          onSuccess={handleReviewSuccess}
          onCancel={handleCancelReview}
        />
      )}

      {/* Community Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Community Reviews</CardTitle>
          <p className="text-sm text-muted-foreground">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} from the community
          </p>
        </CardHeader>
        <CardContent>
          <ReviewList
            reviews={reviews}
            showUserActions={!!userId}
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
            currentUserId={userId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
