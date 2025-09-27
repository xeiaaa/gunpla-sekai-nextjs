import { NextRequest, NextResponse } from "next/server";
import { getUserBuildsOptimized } from "@/lib/actions/builds";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || undefined;
    const sort = searchParams.get("sort") || "newest";

    // Validate parameters
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 50" },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: "Offset must be non-negative" },
        { status: 400 }
      );
    }

    const { userId } = await params;
    const builds = await getUserBuildsOptimized(
      userId,
      limit,
      offset,
      status,
      sort
    );

    // Determine if there are more builds to load
    const totalBuilds = await prisma.build.count({
      where: {
        userId: userId,
        ...(status && { status: status as any }),
      },
    });
    const hasMore = offset + builds.length < totalBuilds;

    return NextResponse.json({
      builds,
      hasMore,
      total: totalBuilds,
    });
  } catch (error) {
    console.error("Error fetching user builds:", error);
    return NextResponse.json(
      { error: "Failed to fetch user builds" },
      { status: 500 }
    );
  }
}
