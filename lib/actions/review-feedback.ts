"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { apiClient } from "../api-client";

export interface ReviewFeedbackCounts {
  helpful: number;
  notHelpful: number;
}

export interface ReviewFeedbackCountsResponse {
  helpfulCount: number;
  notHelpfulCount: number;
}

export interface UserFeedback { isHelpful: boolean }

export interface ReviewFeedbackData {
  counts: ReviewFeedbackCounts;
  userFeedback: {
    isHelpful: boolean;
  } | null;
}

export async function getReviewFeedback(reviewId: string): Promise<ReviewFeedbackData> {
  try {
    const reviewFeedbackCountResponse = await apiClient.get<ReviewFeedbackCountsResponse>(
      `/reviews/${reviewId}/feedback-summary`,
    );

    const userFeedbackResponse = await apiClient.get<UserFeedback>(
      `/reviews/${reviewId}/user-feedback`,
    );

    return {
      counts: {
        helpful: reviewFeedbackCountResponse.helpfulCount,
        notHelpful: reviewFeedbackCountResponse.notHelpfulCount
      },
      userFeedback: userFeedbackResponse
    }
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
    await apiClient.post(
      `/reviews/${reviewId}/feedbacks`,
      { isHelpful },
    );
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
    await apiClient.delete(
      `/reviews/${reviewId}/feedback`,
    );

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
