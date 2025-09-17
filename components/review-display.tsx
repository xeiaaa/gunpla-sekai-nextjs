"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ReviewWithDetails,
  ReviewStats,
  REVIEW_CATEGORIES,
  getCategoryInfo,
  getScoreLabel
} from "@/lib/types/reviews";
import { ReviewCategory } from "@/generated/prisma";
import Link from "next/link";

interface ReviewDisplayProps {
  review: ReviewWithDetails;
  showFullContent?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function ReviewDisplay({
  review,
  showFullContent = false,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false
}: ReviewDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(showFullContent);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-green-100";
    if (score >= 6) return "bg-yellow-100";
    if (score >= 4) return "bg-orange-100";
    return "bg-red-100";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {review.user?.imageUrl && (
                <img
                  src={review.user?.imageUrl}
                  alt={`${review.user.firstName || ''} ${review.user.lastName || ''}`}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                {review.user?.username ? (
                  <Link
                    href={`/users/${review.user.username}`}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {review.user?.firstName} {review.user?.lastName}
                  </Link>
                ) : (
                  <p className="font-medium">
                    {review.user?.firstName} {review.user?.lastName}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formatDate(review.createdAt)}
                  {review.updatedAt.getTime() !== review.createdAt.getTime() && (
                    <span className="ml-1">(edited)</span>
                  )}
                </p>
              </div>
            </div>

            {review.title && (
              <h3 className="text-lg font-semibold mb-2">{review.title}</h3>
            )}

            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full ${getScoreBgColor(review.overallScore)}`}>
                <span className={`font-bold ${getScoreColor(review.overallScore)}`}>
                  {review.overallScore}/10
                </span>
                <span className="ml-1 text-sm text-muted-foreground">
                  ({getScoreLabel(Math.round(review.overallScore))})
                </span>
              </div>
            </div>
          </div>

          {(canEdit || canDelete) && (
            <div className="flex space-x-2">
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                >
                  Edit
                </Button>
              )}
              {canDelete && onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category Scores */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Category Breakdown
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {review.categoryScores.map((score) => {
              const categoryInfo = getCategoryInfo(score.category);
              return (
                <div key={score.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{categoryInfo.label}</p>
                    {score.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{score.notes}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded ${getScoreBgColor(score.score)}`}>
                    <span className={`text-sm font-medium ${getScoreColor(score.score)}`}>
                      {score.score}/10
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Content */}
        {review.content && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Review
            </h4>
            <div className="prose prose-sm max-w-none">
              {isExpanded ? (
                <p className="whitespace-pre-wrap">{review.content}</p>
              ) : (
                <p className="whitespace-pre-wrap">
                  {review.content.length > 200
                    ? `${review.content.substring(0, 200)}...`
                    : review.content
                  }
                </p>
              )}
            </div>
            {review.content.length > 200 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0 h-auto text-blue-600 hover:text-blue-700"
              >
                {isExpanded ? "Show less" : "Read more"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ReviewStatsDisplayProps {
  stats: ReviewStats;
}

export function ReviewStatsDisplay({ stats }: ReviewStatsDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-green-100";
    if (score >= 6) return "bg-yellow-100";
    if (score >= 4) return "bg-orange-100";
    return "bg-red-100";
  };

  if (stats.totalReviews === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No reviews yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Review Statistics</h3>
        <p className="text-sm text-muted-foreground">
          Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Average */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${getScoreBgColor(stats.averageScore)}`}>
            <span className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
              {stats.averageScore}/10
            </span>
            <span className="ml-2 text-sm text-muted-foreground">
              Overall Average
            </span>
          </div>
        </div>

        {/* Category Averages */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Category Averages
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.categoryAverages.map((categoryAvg) => {
              const categoryInfo = getCategoryInfo(categoryAvg.category);
              return (
                <div key={categoryAvg.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{categoryInfo.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {categoryAvg.reviewCount} review{categoryAvg.reviewCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded ${getScoreBgColor(categoryAvg.averageScore)}`}>
                    <span className={`text-sm font-medium ${getScoreColor(categoryAvg.averageScore)}`}>
                      {categoryAvg.averageScore}/10
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ReviewListProps {
  reviews: ReviewWithDetails[];
  showUserActions?: boolean;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  currentUserId?: string;
}

export function ReviewList({
  reviews,
  showUserActions = false,
  onEdit,
  onDelete,
  currentUserId
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first to review this kit!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewDisplay
          key={review.id}
          review={review}
          canEdit={showUserActions && review.user?.id === currentUserId}
          canDelete={showUserActions && review.user?.id === currentUserId}
          onEdit={onEdit ? () => onEdit(review.id) : undefined}
          onDelete={onDelete ? () => onDelete(review.id) : undefined}
        />
      ))}
    </div>
  );
}
