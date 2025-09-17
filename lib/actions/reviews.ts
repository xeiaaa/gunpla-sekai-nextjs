"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/test-utils/prisma";
import { ReviewCategory } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

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

function validateScores(scores: ReviewScoreInput[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if all required categories are present
  const providedCategories = scores.map(s => s.category);
  const missingCategories = REQUIRED_CATEGORIES.filter(
    category => !providedCategories.includes(category)
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
    .filter(([_, count]) => count > 1)
    .map(([category]) => category);

  if (duplicates.length > 0) {
    errors.push(`Duplicate categories found: ${duplicates.join(", ")}`);
  }

  // Validate individual scores
  for (const scoreInput of scores) {
    if (!validateScore(scoreInput.score)) {
      errors.push(`Invalid score for ${scoreInput.category}: ${scoreInput.score}. Must be integer between ${MIN_SCORE}-${MAX_SCORE}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Check if user has access to review (removed collection requirement)
async function checkReviewAccess(userId: string, kitId: string): Promise<boolean> {
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

  // Validate scores
  const validation = validateScores(input.scores);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
  }

  // Check if kit exists
  const kit = await prisma.kit.findUnique({
    where: { id: input.kitId },
  });

  if (!kit) {
    throw new Error("Kit not found");
  }

  // Check if user has access to review this kit (now allows all authenticated users)
  const hasAccess = await checkReviewAccess(userId, input.kitId);
  if (!hasAccess) {
    throw new Error("You must be authenticated to review kits");
  }

  // Check if user already has a review for this kit
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_kitId: {
        userId,
        kitId: input.kitId,
      },
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this kit");
  }

  // Calculate overall score
  const overallScore = calculateOverallScore(input.scores);

  try {
    // Create review with scores in a transaction
    const review = await prisma.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          userId,
          kitId: input.kitId,
          title: input.title,
          content: input.content,
          overallScore,
        },
      });

      // Create category scores
      await tx.reviewScore.createMany({
        data: input.scores.map(score => ({
          reviewId: newReview.id,
          category: score.category,
          score: score.score,
          notes: score.notes,
        })),
      });

      return newReview;
    });

    // Revalidate relevant paths
    revalidatePath("/kits");
    revalidatePath(`/kits/${kit.slug}`);
    revalidatePath("/collections");

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

  // Find the existing review
  const existingReview = await prisma.review.findUnique({
    where: { id: input.reviewId },
    include: { categoryScores: true },
  });

  if (!existingReview) {
    throw new Error("Review not found");
  }

  // Check if user owns this review
  if (existingReview.userId !== userId) {
    throw new Error("You can only update your own reviews");
  }

  // Validate scores if provided
  if (input.scores) {
    const validation = validateScores(input.scores);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }
  }

  try {
    // Update review in a transaction
    const updatedReview = await prisma.$transaction(async (tx) => {
      // Calculate new overall score if scores are being updated
      let overallScore = existingReview.overallScore;
      if (input.scores) {
        overallScore = calculateOverallScore(input.scores);
      }

      // Update the review
      const review = await tx.review.update({
        where: { id: input.reviewId },
        data: {
          title: input.title,
          content: input.content,
          overallScore,
          updatedAt: new Date(),
        },
      });

      // Update scores if provided
      if (input.scores) {
        // Delete existing scores
        await tx.reviewScore.deleteMany({
          where: { reviewId: input.reviewId },
        });

        // Create new scores
        await tx.reviewScore.createMany({
          data: input.scores.map(score => ({
            reviewId: input.reviewId,
            category: score.category,
            score: score.score,
            notes: score.notes,
          })),
        });
      }

      return review;
    });

    // Get kit for revalidation
    const kit = await prisma.kit.findUnique({
      where: { id: existingReview.kitId },
    });

    // Revalidate relevant paths
    revalidatePath("/kits");
    if (kit) {
      revalidatePath(`/kits/${kit.slug}`);
    }
    revalidatePath("/collections");

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

  // Find the existing review
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!existingReview) {
    throw new Error("Review not found");
  }

  // Check if user owns this review
  if (existingReview.userId !== userId) {
    throw new Error("You can only delete your own reviews");
  }

  try {
    // Get kit for revalidation before deletion
    const kit = await prisma.kit.findUnique({
      where: { id: existingReview.kitId },
    });

    // Delete the review (cascade will handle scores)
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Revalidate relevant paths
    revalidatePath("/kits");
    if (kit) {
      revalidatePath(`/kits/${kit.slug}`);
    }
    revalidatePath("/collections");

    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    throw new Error("Failed to delete review");
  }
}

// Get reviews for a specific kit
export async function getKitReviews(kitId: string, limit: number = 10, offset: number = 0) {
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

  return reviews;
}

// Get user's review for a specific kit
export async function getUserKitReview(kitId: string) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const review = await prisma.review.findUnique({
    where: {
      userId_kitId: {
        userId,
        kitId,
      },
    },
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
  });

  return review;
}

// Get review statistics for a kit
export async function getKitReviewStats(kitId: string) {
  const stats = await prisma.review.aggregate({
    where: { kitId },
    _count: { id: true },
    _avg: { overallScore: true },
  });

  // Get category averages
  const categoryStats = await prisma.reviewScore.groupBy({
    by: ["category"],
    where: {
      review: { kitId },
    },
    _avg: { score: true },
    _count: { score: true },
  });

  return {
    totalReviews: stats._count.id,
    averageScore: stats._avg.overallScore ? Math.round(stats._avg.overallScore * 10) / 10 : 0,
    categoryAverages: categoryStats.map(stat => ({
      category: stat.category,
      averageScore: stat._avg.score ? Math.round(stat._avg.score * 10) / 10 : 0,
      reviewCount: stat._count.score,
    })),
  };
}

// Get all reviews by a user
export async function getUserReviews(userId: string, limit: number = 10, offset: number = 0) {
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
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  return reviews;
}
