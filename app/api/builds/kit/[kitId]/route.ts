import { NextRequest, NextResponse } from "next/server";
import { getBuildsByKit } from "@/lib/actions/builds";

export async function GET(
  request: NextRequest,
  { params }: { params: { kitId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const builds = await getBuildsByKit(params.kitId, limit);
    return NextResponse.json(builds);
  } catch (error) {
    console.error("Error fetching builds by kit:", error);
    return NextResponse.json(
      { error: "Failed to fetch builds" },
      { status: 500 }
    );
  }
}
