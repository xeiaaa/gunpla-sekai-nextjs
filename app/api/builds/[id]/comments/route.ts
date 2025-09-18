import { NextRequest, NextResponse } from "next/server";
import { createBuildComment, getBuildComments } from "@/lib/actions/builds";

// GET /api/builds/[id]/comments - Get all comments for a build
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await getBuildComments(id);
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/builds/[id]/comments - Create a new comment
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const comment = await createBuildComment(id, content);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json(
          { error: "You must be logged in to comment" },
          { status: 401 }
        );
      }
      if (error.message === "Comment content cannot be empty") {
        return NextResponse.json(
          { error: "Comment content cannot be empty" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
