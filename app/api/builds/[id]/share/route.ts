import { NextRequest, NextResponse } from "next/server";
import { getBuild } from "@/lib/actions/builds";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/builds/[id]/share - Get share data for a build
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const build = await getBuild(params.id);

    if (!build) {
      return NextResponse.json(
        { error: "Build not found" },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/builds/${build.id}`;

    const shareData = {
      url: shareUrl,
      title: build.title,
      description: build.description || `A Gunpla build by ${build.user.firstName} ${build.user.lastName}`,
      image: build.featuredImage?.eagerUrl || build.featuredImage?.url || build.kit.boxArt,
      author: `${build.user.firstName} ${build.user.lastName}`,
      kit: build.kit.name,
      status: build.status,
      likes: build.likes,
      comments: build.comments,
    };

    return NextResponse.json(shareData);
  } catch (error) {
    console.error("Error fetching build share data:", error);
    return NextResponse.json(
      { error: "Failed to fetch share data" },
      { status: 500 }
    );
  }
}
