import { NextRequest, NextResponse } from "next/server";
import { getAllBuildsOptimized } from "@/lib/actions/builds";
import { prisma } from "@/lib/prisma";
import { BuildStatus } from "../../../../generated/prisma";

export async function GET(request: NextRequest) {
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

    const builds = await getAllBuildsOptimized(limit, offset, status, sort);

    // Determine if there are more builds to load
    const whereCondition = status ? { status: status as BuildStatus } : {};
    const totalBuilds = await prisma.build.count({
      where: whereCondition,
    });
    const hasMore = offset + builds.length < totalBuilds;

    return NextResponse.json({
      builds,
      hasMore,
      total: totalBuilds,
    });
  } catch (error) {
    console.error("Error fetching all builds:", error);
    return NextResponse.json(
      { error: "Failed to fetch builds" },
      { status: 500 }
    );
  }
}
