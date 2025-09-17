"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export interface ReviewFeedbackCounts {
  helpful: number;
  notHelpful: number;
}

export interface ReviewFeedbackData {
  counts: ReviewFeedbackCounts;
  userFeedback: {
    isHelpful: boolean;
  } | null;
}

export async function getReviewFeedback(reviewId: string): Promise<ReviewFeedbackData> {
  try {
    const { userId } = await auth();

    // Get feedback counts
    const feedbackCounts = await prisma.reviewFeedback.groupBy({
      by: ["isHelpful"],
      where: { reviewId },
      _count: {
        isHelpful: true,
      },
    });

    const helpfulCount = feedbackCounts.find(f => f.isHelpful)?._count.isHelpful || 0;
    const notHelpfulCount = feedbackCounts.find(f => !f.isHelpful)?._count.isHelpful || 0;

    // Get user's feedback if authenticated
    let userFeedback = null;
    if (userId) {
      const feedback = await prisma.reviewFeedback.findUnique({
        where: {
          reviewId_userId: {
            reviewId,
            userId,
          },
        },
      });
      userFeedback = feedback ? { isHelpful: feedback.isHelpful } : null;
    }

    return {
      counts: {
        helpful: helpfulCount,
        notHelpful: notHelpfulCount,
      },
      userFeedback,
    };
  } catch (error) {
    console.error("Error fetching review feedback:", error);
    throw new Error("Failed to fetch review feedback");
  }
}

export async function submitReviewFeedback(
  reviewId: string,
  isHelpful: boolean
): Promise<ReviewFeedbackData> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error("Review not found");
    }

    // Upsert feedback (create or update)
    await prisma.reviewFeedback.upsert({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
      update: {
        isHelpful,
      },
      create: {
        reviewId,
        userId,
        isHelpful,
      },
    });

    // Return updated feedback data
    return await getReviewFeedback(reviewId);
  } catch (error) {
    console.error("Error submitting review feedback:", error);
    throw new Error("Failed to submit review feedback");
  }
}

export async function removeReviewFeedback(reviewId: string): Promise<ReviewFeedbackData> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Delete user's feedback for this review
    await prisma.reviewFeedback.deleteMany({
      where: {
        reviewId,
        userId,
      },
    });

    // Return updated feedback data
    return await getReviewFeedback(reviewId);
  } catch (error) {
    console.error("Error removing review feedback:", error);
    throw new Error("Failed to remove review feedback");
  }
}

export async function getReviewsWithFeedbackCounts(reviewIds: string[]) {
  try {
    const feedbackCounts = await prisma.reviewFeedback.groupBy({
      by: ["reviewId", "isHelpful"],
      where: {
        reviewId: { in: reviewIds }
      },
      _count: {
        isHelpful: true,
      },
    });

    // Group by reviewId
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
    }, {} as Record<string, ReviewFeedbackCounts>);

    return countsByReview;
  } catch (error) {
    console.error("Error fetching reviews with feedback counts:", error);
    throw new Error("Failed to fetch feedback counts");
  }
}
