import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Upsert feedback (create or update)
    const feedback = await prisma.reviewFeedback.upsert({
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

    // Get updated feedback counts
    const feedbackCounts = await prisma.reviewFeedback.groupBy({
      by: ["isHelpful"],
      where: { reviewId },
      _count: {
        isHelpful: true,
      },
    });

    const helpfulCount = feedbackCounts.find(f => f.isHelpful)?._count.isHelpful || 0;
    const notHelpfulCount = feedbackCounts.find(f => !f.isHelpful)?._count.isHelpful || 0;

    return NextResponse.json({
      feedback,
      counts: {
        helpful: helpfulCount,
        notHelpful: notHelpfulCount,
      },
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
    await prisma.reviewFeedback.deleteMany({
      where: {
        reviewId,
        userId,
      },
    });

    // Get updated feedback counts
    const feedbackCounts = await prisma.reviewFeedback.groupBy({
      by: ["isHelpful"],
      where: { reviewId },
      _count: {
        isHelpful: true,
      },
    });

    const helpfulCount = feedbackCounts.find(f => f.isHelpful)?._count.isHelpful || 0;
    const notHelpfulCount = feedbackCounts.find(f => !f.isHelpful)?._count.isHelpful || 0;

    return NextResponse.json({
      counts: {
        helpful: helpfulCount,
        notHelpful: notHelpfulCount,
      },
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
    const { userId } = await auth();
    const { reviewId } = await params;

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
      userFeedback = await prisma.reviewFeedback.findUnique({
        where: {
          reviewId_userId: {
            reviewId,
            userId,
          },
        },
      });
    }

    return NextResponse.json({
      counts: {
        helpful: helpfulCount,
        notHelpful: notHelpfulCount,
      },
      userFeedback,
    });
  } catch (error) {
    console.error("Error fetching review feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
