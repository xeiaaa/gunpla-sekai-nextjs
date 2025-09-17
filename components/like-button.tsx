"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

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
  className
}: LikeButtonProps) {
  const { userId } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!userId) {
      // Redirect to login or show login modal
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    // Optimistic update
    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : likes - 1;

    setLiked(newLiked);
    setLikes(newLikes);

    try {
      const response = await fetch(`/api/builds/${buildId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ liked: newLiked }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setLiked(!newLiked);
        setLikes(!newLiked ? likes + 1 : likes - 1);
        throw new Error("Failed to update like");
      }
    } catch (error) {
      console.error("Error updating like:", error);
      // Error handling could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 hover:bg-red-50 transition-colors",
        liked && "text-red-500 hover:text-red-600",
        !liked && "text-gray-500 hover:text-red-500",
        className
      )}
      title={userId ? "Like this build" : "Login to like this build"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all duration-200",
          liked && "fill-current scale-110",
          !liked && "hover:scale-110"
        )}
      />
      <span className="text-sm font-medium">
        {likes} {likes === 1 ? "like" : "likes"}
      </span>
    </Button>
  );
}
