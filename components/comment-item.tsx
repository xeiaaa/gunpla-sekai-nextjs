"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { MarkdownRenderer } from "./ui/markdown-renderer";
import Link from "next/link";
import Image from "next/image";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    };
  };
  buildId: string;
  onCommentDeleted: () => void;
  onCommentUpdated: () => void;
}

export function CommentItem({ comment, buildId, onCommentDeleted, onCommentUpdated }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  const isOwner = userId === comment.user.id;
  const displayName = comment.user.firstName && comment.user.lastName
    ? `${comment.user.firstName} ${comment.user.lastName}`
    : comment.user.username || "Anonymous";

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/builds/${buildId}/comments/${comment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update comment");
      }

      setIsEditing(false);
      onCommentUpdated();
    } catch (err) {
      console.error("Error updating comment:", err);
      setError(err instanceof Error ? err.message : "Failed to update comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/builds/${buildId}/comments/${comment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete comment");
      }

      onCommentDeleted();
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError(err instanceof Error ? err.message : "Failed to delete comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-b border-gray-200 pb-4 last:border-b-0">
      <div className="flex gap-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {comment.user.imageUrl ? (
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={comment.user.imageUrl}
                alt={displayName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* User Info and Timestamp */}
          <div className="flex items-center gap-2 mb-2">
            {comment.user.username ? (
              <Link
                href={`/users/${comment.user.username}`}
                className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
              >
                {displayName}
              </Link>
            ) : (
              <span className="font-medium text-gray-900">{displayName}</span>
            )}
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.updatedAt > comment.createdAt && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>

          {/* Comment Text */}
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isSubmitting}
              />
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isSubmitting || !editContent.trim()}
                  className="flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <MarkdownRenderer content={comment.content} />
            </div>
          )}

          {/* Action Buttons */}
          {isOwner && !isEditing && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                disabled={isSubmitting}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
