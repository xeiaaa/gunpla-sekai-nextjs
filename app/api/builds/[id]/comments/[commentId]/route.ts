import { NextRequest, NextResponse } from "next/server";
import { deleteBuildComment, updateBuildComment } from "@/lib/actions/builds";

// PUT /api/builds/[id]/comments/[commentId] - Update a comment
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; commentId: string }> }) {
  try {
    const { commentId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const comment = await updateBuildComment(commentId, content);
    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json(
          { error: "You can only edit your own comments" },
          { status: 403 }
        );
      }
      if (error.message === "Comment not found") {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 }
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
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// DELETE /api/builds/[id]/comments/[commentId] - Delete a comment
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; commentId: string }> }) {
  try {
    const { commentId } = await params;
    await deleteBuildComment(commentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json(
          { error: "You can only delete your own comments" },
          { status: 403 }
        );
      }
      if (error.message === "Comment not found") {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
