"use client";

import { useState, useEffect, useCallback } from "react";
import { CommentItem } from "./comment-item";
import { MessageSquare, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Comment {
  id: string;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
}

interface CommentListProps {
  buildId: string;
  onRefresh?: () => void;
}

export function CommentList({ buildId, onRefresh }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchComments = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      console.log("Fetching comments for buildId:", buildId);
      const response = await fetch(`/api/builds/${buildId}/comments`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch comments:", response.status, errorData);
        throw new Error(errorData.error || "Failed to fetch comments");
      }

      const data = await response.json();
      console.log("Comments fetched:", data);
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load comments";
      setError(errorMessage);

      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [buildId, showToast]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentAdded = useCallback(() => {
    fetchComments(true);
    onRefresh?.();
  }, [fetchComments, onRefresh]);

  const handleCommentDeleted = useCallback(() => {
    fetchComments(true);
    onRefresh?.();
  }, [fetchComments, onRefresh]);

  const handleCommentUpdated = useCallback(() => {
    fetchComments(true);
    onRefresh?.();
  }, [fetchComments, onRefresh]);

  const handleRetry = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-600">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Comments</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/6 animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-600">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Comments</h3>
        </div>
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <div className="text-red-600 font-medium">Failed to load comments</div>
            <p className="text-sm text-gray-500 max-w-md">{error}</p>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            Comments {comments.length > 0 && `(${comments.length})`}
          </h3>
        </div>
        {isRefreshing && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Refreshing...</span>
          </div>
        )}
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No comments yet</p>
          <p className="text-sm">Be the first to comment on this build!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              className={cn(
                "animate-in slide-in-from-bottom-2 duration-300",
                "opacity-0"
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "forwards"
              }}
            >
              <CommentItem
                comment={comment}
                buildId={buildId}
                onCommentDeleted={handleCommentDeleted}
                onCommentUpdated={handleCommentUpdated}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
