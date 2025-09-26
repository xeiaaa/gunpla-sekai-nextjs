"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useBuildLikes, useToggleBuildLike } from "@/hooks/use-build-likes";

interface LikeButtonProps {
  buildId: string;
  initialLikes: number;
  initialLiked: boolean;
  className?: string;
}

export function LikeButton({
  buildId,
  initialLikes,
  initialLiked,
  className,
}: LikeButtonProps) {
  const { userId } = useAuth();
  const { showToast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use React Query for likes data
  const { data: likesData, isLoading: isLoadingLikes } = useBuildLikes(buildId);
  const toggleLikeMutation = useToggleBuildLike(buildId);

  // Fallback to initial values if React Query hasn't loaded yet
  const likes = likesData?.likes ?? initialLikes;
  const liked = likesData?.liked ?? initialLiked;
  const isLoading = toggleLikeMutation.isPending || isLoadingLikes;

  const handleLike = useCallback(async () => {
    if (!userId) {
      showToast("Please log in to like builds", "info");
      return;
    }

    if (isLoading) return;

    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce rapid clicks
    debounceTimeoutRef.current = setTimeout(async () => {
      setIsAnimating(true);

      try {
        const newLiked = !liked;
        await toggleLikeMutation.mutateAsync(newLiked);

        // Success feedback
        if (newLiked) {
          showToast("You liked this build!", "success");
        }
      } catch (error) {
        console.error("Error updating like:", error);
        if (error instanceof Error) {
          if (error.message.includes("429")) {
            showToast("Please wait a moment before liking again", "warning");
          } else {
            showToast("Failed to update like. Please try again.", "error");
          }
        }
      } finally {
        // Reset animation state after a short delay
        setTimeout(() => setIsAnimating(false), 300);
      }
    }, 150); // 150ms debounce
  }, [userId, liked, buildId, isLoading, showToast, toggleLikeMutation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        "hover:bg-red-50 hover:scale-105 active:scale-95",
        liked && "text-red-500 hover:text-red-600",
        !liked && "text-gray-500 hover:text-red-500",
        isLoading && "opacity-70 cursor-not-allowed",
        className
      )}
      title={userId ? "Like this build" : "Login to like this build"}
    >
      <div className="relative">
        <Heart
          className={cn(
            "h-4 w-4 transition-all duration-300 ease-out",
            liked && "fill-current",
            isAnimating && "animate-pulse scale-125",
            !liked && "hover:scale-110"
          )}
        />
        {/* Heart pop animation overlay */}
        {isAnimating && liked && (
          <Heart
            className={cn(
              "absolute inset-0 h-4 w-4 fill-current text-red-500",
              "animate-ping opacity-75"
            )}
          />
        )}
      </div>
      <span
        className={cn(
          "text-sm font-medium transition-all duration-200",
          isAnimating && "scale-105"
        )}
      >
        {likes} {likes === 1 ? "like" : "likes"}
      </span>
      {isLoading && (
        <div className="ml-1 h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
      )}
    </Button>
  );
}
