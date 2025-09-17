import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const buildId = params.id;
    const { liked } = await request.json();

    // Verify the build exists
    const build = await prisma.build.findUnique({
      where: { id: buildId },
    });

    if (!build) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    if (liked) {
      // Add like (upsert to handle race conditions)
      await prisma.buildLike.upsert({
        where: {
          buildId_userId: {
            buildId,
            userId,
          },
        },
        update: {},
        create: {
          buildId,
          userId,
        },
      });
    } else {
      // Remove like
      await prisma.buildLike.deleteMany({
        where: {
          buildId,
          userId,
        },
      });
    }

    // Get updated like count
    const likeCount = await prisma.buildLike.count({
      where: { buildId },
    });

    return NextResponse.json({
      success: true,
      likes: likeCount,
      liked
    });
  } catch (error) {
    console.error("Error updating like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const buildId = params.id;

    // Get like count and user's like status
    const [likeCount, userLike] = await Promise.all([
      prisma.buildLike.count({
        where: { buildId },
      }),
      userId ? prisma.buildLike.findUnique({
        where: {
          buildId_userId: {
            buildId,
            userId,
          },
        },
      }) : null,
    ]);

    return NextResponse.json({
      likes: likeCount,
      liked: !!userLike,
    });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
