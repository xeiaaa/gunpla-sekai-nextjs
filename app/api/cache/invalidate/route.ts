import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    // Optional: Add authentication/authorization check
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Get optional path parameter from request body
    const body = await req.json().catch(() => ({}));
    const { path } = body;

    if (path) {
      // Revalidate specific path
      revalidatePath(path);
      return NextResponse.json({
        success: true,
        message: `Cache invalidated for path: ${path}`,
      });
    }

    // Revalidate all major paths
    const pathsToRevalidate = [
      "/", // Homepage
      "/kits", // Kits listing
      "/builds", // Builds listing
      "/me/collections", // User collections
      "/search", // Search page
      "/timelines", // Timelines
      "/grades", // Grades
      "/series", // Series
      "/product-lines", // Product lines
      "/release-types", // Release types
      "/mobile-suits", // Mobile suits
    ];

    // Revalidate each path
    pathsToRevalidate.forEach((path) => {
      revalidatePath(path);
    });

    // Also revalidate dynamic routes by revalidating the base paths
    // This will invalidate ISR cache for dynamic pages
    revalidatePath("/kits/[slug]");
    revalidatePath("/builds/[id]");
    revalidatePath("/users/[username]");
    revalidatePath("/timelines/[slug]");

    return NextResponse.json({
      success: true,
      message: "All cache pages invalidated successfully",
      invalidatedPaths: pathsToRevalidate.length + 4, // +4 for dynamic routes
    });
  } catch (error) {
    console.error("Error invalidating cache:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to invalidate cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also support GET for simple cache invalidation
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  try {
    if (path) {
      revalidatePath(path);
      return NextResponse.json({
        success: true,
        message: `Cache invalidated for path: ${path}`,
      });
    }

    // Default: invalidate all major paths
    const pathsToRevalidate = [
      "/",
      "/kits",
      "/builds",
      "/me/collections",
      "/search",
      "/timelines",
      "/grades",
      "/series",
      "/product-lines",
      "/release-types",
      "/mobile-suits",
    ];

    pathsToRevalidate.forEach((path) => {
      revalidatePath(path);
    });

    revalidatePath("/kits/[slug]");
    revalidatePath("/builds/[id]");
    revalidatePath("/users/[username]");
    revalidatePath("/timelines/[slug]");

    return NextResponse.json({
      success: true,
      message: "All cache pages invalidated successfully",
      invalidatedPaths: pathsToRevalidate.length + 4,
    });
  } catch (error) {
    console.error("Error invalidating cache:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to invalidate cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
