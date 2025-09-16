import { NextRequest, NextResponse } from "next/server";
import { getRecentBuilds } from "@/lib/actions/builds";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const builds = await getRecentBuilds(limit);
    return NextResponse.json(builds);
  } catch (error) {
    console.error("Error fetching recent builds:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent builds" },
      { status: 500 }
    );
  }
}
