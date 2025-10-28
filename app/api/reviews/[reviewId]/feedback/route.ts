import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getReviewFeedback, removeReviewFeedback, submitReviewFeedback } from "@/lib/actions/review-feedback";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await params;
    const { isHelpful } = await request.json();

    if (typeof isHelpful !== "boolean") {
      return NextResponse.json({ error: "isHelpful must be a boolean" }, { status: 400 });
    }

    // Check if review exists
    const feedback = await submitReviewFeedback(reviewId, isHelpful)
    const countReviewFeedback = await getReviewFeedback(reviewId)

    return NextResponse.json({
      feedback,
      counts: countReviewFeedback.counts,
    });
  } catch (error) {
    console.error("Error submitting review feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await params;

    // Delete user's feedback for this review
    await removeReviewFeedback(reviewId)
    const countReviewFeedback = await getReviewFeedback(reviewId)

    return NextResponse.json({
      counts: countReviewFeedback.counts,
    });
  } catch (error) {
    console.error("Error deleting review feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;
    const countReviewFeedback = await getReviewFeedback(reviewId)
    return NextResponse.json({
      ...countReviewFeedback
    });
  } catch (error) {
    console.error("Error fetching review feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
