"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ReviewCategory } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma } from "../../generated/prisma";
import { apiClient } from "../api-client";
import { KitResponse, UserResponse } from "../types/actions";
import { CategoryScore, ReviewStats, ReviewWithDetails } from "../types/reviews";
import { getReviewFeedback } from "./review-feedback";

// Types for review operations
export interface ReviewScoreInput {
  category: ReviewCategory;
  score: number;
  notes?: string;
}

export interface CreateReviewInput {
  kitId: string;
  title?: string;
  content?: string;
  scores: ReviewScoreInput[];
}

export interface UpdateReviewInput {
  reviewId: string;
  title?: string;
  content?: string;
  scores?: ReviewScoreInput[];
}

export interface ReviewResponse {
  id: string;
  kitId: string;
  userId: string;
  title: string | null;
  content: string | null;
  overallScore: number;
  createdAt: Date;
  updatedAt: Date;
  categoryScores: CategoryScore;
  kit?: KitResponse

  user?: UserResponse
}

// Validation constants
const MIN_SCORE = 1;
const MAX_SCORE = 10;
const REQUIRED_CATEGORIES: ReviewCategory[] = [
  ReviewCategory.BUILD_QUALITY_ENGINEERING,
  ReviewCategory.ARTICULATION_POSEABILITY,
  ReviewCategory.DETAIL_ACCURACY,
  ReviewCategory.AESTHETICS_PROPORTIONS,
  ReviewCategory.ACCESSORIES_GIMMICKS,
  ReviewCategory.VALUE_EXPERIENCE,
];

// Validation functions
function validateScore(score: number): boolean {
  return score >= MIN_SCORE && score <= MAX_SCORE && Number.isInteger(score);
}

function validateScores(scores: ReviewScoreInput[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if all required categories are present
  const providedCategories = scores.map((s) => s.category);
  const missingCategories = REQUIRED_CATEGORIES.filter(
    (category) => !providedCategories.includes(category)
  );

  if (missingCategories.length > 0) {
    errors.push(`Missing required categories: ${missingCategories.join(", ")}`);
  }

  // Check for duplicate categories
  const categoryCounts = providedCategories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<ReviewCategory, number>);

  const duplicates = Object.entries(categoryCounts)
    .filter(([, count]) => count > 1)
    .map(([category]) => category);

  if (duplicates.length > 0) {
    errors.push(`Duplicate categories found: ${duplicates.join(", ")}`);
  }

  // Validate individual scores
  for (const scoreInput of scores) {
    if (!validateScore(scoreInput.score)) {
      errors.push(
        `Invalid score for ${scoreInput.category}: ${scoreInput.score}. Must be integer between ${MIN_SCORE}-${MAX_SCORE}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Check if user has access to review (removed collection requirement)

async function checkReviewAccess(
  userId: string,
  kitId: string
): Promise<boolean> {
  // Allow all authenticated users to review any kit
  return true;
}

// Calculate overall score from category scores
function calculateOverallScore(scores: ReviewScoreInput[]): number {
  const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
  return Math.round((totalScore / scores.length) * 10) / 10; // Round to 1 decimal place
}

// Create a new review
export async function createReview(input: CreateReviewInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User must be authenticated to create a review");
  }
  try {
    const review = await apiClient.post<ReviewResponse>(
      `/reviews`,
      {
        userId,
        kitId: input.kitId,
        title: input.title,
        content: input.content,
        categoryScores: input.scores.map((score) => ({
          category: score.category,
          score: score.score,
          notes: score.notes,
        })),
      }
    );
    // Revalidate relevant paths
    revalidatePath("/kits");
    if (review?.kit) {
      revalidatePath(`/kits/${review?.kit.slug}`);
    }

    revalidatePath("/collections");
    revalidatePath(`/users/${userId}`);

    return review;
  } catch (error) {
    console.error("Error creating review:", error);
    throw new Error("Failed to create review");
  }
}

// Update an existing review
export async function updateReview(input: UpdateReviewInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User must be authenticated to update a review");
  }


  try {
    const updatedReview = await apiClient.put<ReviewResponse>(
      `/reviews/${input.reviewId}`,
      {
        title: input.title,
        content: input.content,
        categoryScores: input.scores.map((score) => ({
          category: score.category,
          score: score.score,
          notes: score.notes,
        }))
      }
    );

    // Revalidate relevant paths
    revalidatePath("/kits");
    if (updatedReview?.kit?.slug) {
      revalidatePath(`/kits/${updatedReview?.kit?.slug}`);
    }
    revalidatePath("/collections");
    revalidatePath(`/users/${userId}`);

    return updatedReview;
  } catch (error) {
    console.error("Error updating review:", error);
    throw new Error("Failed to update review");
  }
}

// Delete a review
export async function deleteReview(reviewId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User must be authenticated to delete a review");
  }

  try {
    // Delete the review (cascade will handle scores)
    const deletedReview = await apiClient.delete<ReviewResponse>(
      `/reviews/${reviewId}`,
    );
    // Revalidate relevant paths
    revalidatePath("/kits");
    if (deletedReview?.kit) {
      revalidatePath(`/kits/${deletedReview?.kit.slug}`);
    }
    revalidatePath("/collections");
    revalidatePath(`/users/${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    throw new Error("Failed to delete review");
  }
}

// Get reviews for a specific kit
export async function getKitReviews(
  kitId: string,
  limit: number = 10,
  offset: number = 0
) {
  const { userId } = await auth();

  const reviews = await prisma.review.findMany({
    where: { kitId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          username: true,
        },
      },
      categoryScores: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  // Get feedback data for all reviews
  const reviewIds = reviews.map((r) => r.id);
  const feedbackCounts = await prisma.reviewFeedback.groupBy({
    by: ["reviewId", "isHelpful"],
    where: {
      reviewId: { in: reviewIds },
    },
    _count: {
      isHelpful: true,
    },
  });


  // Get user's feedback for all reviews if authenticated
  let userFeedback: Array<{
    reviewId: string;
    userId: string;
    isHelpful: boolean;
  }> = [];
  if (userId) {
    userFeedback = await prisma.reviewFeedback.findMany({
      where: {
        reviewId: { in: reviewIds },
        userId,
      },
    });
  }

  // Group feedback counts by reviewId
  const countsByReview = feedbackCounts.reduce((acc, item) => {
    if (!acc[item.reviewId]) {
      acc[item.reviewId] = { helpful: 0, notHelpful: 0 };
    }
    if (item.isHelpful) {
      acc[item.reviewId].helpful = item._count.isHelpful;
    } else {
      acc[item.reviewId].notHelpful = item._count.isHelpful;
    }
    return acc;
  }, {} as Record<string, { helpful: number; notHelpful: number }>);

  // Group user feedback by reviewId
  const userFeedbackByReview = userFeedback.reduce((acc, item) => {
    acc[item.reviewId] = { isHelpful: item.isHelpful };
    return acc;
  }, {} as Record<string, { isHelpful: boolean }>);

  // Add feedback data to reviews
  const reviewsWithFeedback = reviews.map((review) => ({
    ...review,
    feedback: {
      helpful: countsByReview[review.id]?.helpful || 0,
      notHelpful: countsByReview[review.id]?.notHelpful || 0,
      userFeedback: userFeedbackByReview[review.id] || null,
    },
  }));

  return reviewsWithFeedback;
}

// Get user's review for a specific kit
export async function getUserKitReview(kitId: string) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const review = await apiClient.get<ReviewWithDetails>(
    `/reviews/kit/${kitId}`,
  );

  if (!review) {
    return null;
  }

  const feedback = await getReviewFeedback(review.id)
  return {
    ...review,
    feedback: feedback ? {
      helpful: feedback.counts.helpful,
      notHelpful: feedback.counts.notHelpful,
      userFeedback: feedback.userFeedback
    } : null,
  };
}

// Get review statistics for a kit
export async function getKitReviewStats(kitId: string): Promise<ReviewStats> {
  const stats = await apiClient.get<{
    totalReviews: number;
    overallAverage: number;
    categoryAverages: Record<ReviewCategory, number>;
  }>(
    `/kits/${kitId}/reviews/stats`,
  );

  return {
    ...stats,
    averageScore: stats.overallAverage,
    categoryAverages: Object.entries(stats.categoryAverages).map(([category, averageScore]) => ({
      category: category as ReviewCategory,
      averageScore,
      reviewCount: stats.totalReviews,
    }))
  };
}

// Get all reviews by a user
export async function getUserReviews(
  userId: string,
  limit: number = 10,
  offset: number = 0,
  sort: string = "newest"
) {
  let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: "desc" };

  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "highest":
      orderBy = { overallScore: "desc" };
      break;
    case "lowest":
      orderBy = { overallScore: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const reviews = await prisma.review.findMany({
    where: { userId },
    include: {
      kit: {
        select: {
          id: true,
          name: true,
          slug: true,
          boxArt: true,
        },
      },
      categoryScores: true,
    },
    orderBy,
    take: limit,
    skip: offset,
  });

  // Get feedback data for all reviews
  const reviewIds = reviews.map((r) => r.id);
  const feedbackCounts = await prisma.reviewFeedback.groupBy({
    by: ["reviewId", "isHelpful"],
    where: {
      reviewId: { in: reviewIds },
    },
    _count: {
      isHelpful: true,
    },
  });

  // Group feedback counts by reviewId
  const countsByReview = feedbackCounts.reduce((acc, item) => {
    if (!acc[item.reviewId]) {
      acc[item.reviewId] = { helpful: 0, notHelpful: 0 };
    }
    if (item.isHelpful) {
      acc[item.reviewId].helpful = item._count.isHelpful;
    } else {
      acc[item.reviewId].notHelpful = item._count.isHelpful;
    }
    return acc;
  }, {} as Record<string, { helpful: number; notHelpful: number }>);

  // Add feedback data to reviews
  const reviewsWithFeedback = reviews.map((review) => ({
    ...review,
    feedback: {
      helpful: countsByReview[review.id]?.helpful || 0,
      notHelpful: countsByReview[review.id]?.notHelpful || 0,
    },
  }));

  return reviewsWithFeedback;
}
