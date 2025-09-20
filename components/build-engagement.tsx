"use client";

import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Eye, Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BuildEngagementProps {
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  buildId: string;
  variant?: "default" | "compact";
  className?: string;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onComment?: () => void;
}

export function BuildEngagement({
  likesCount = 0,
  commentsCount = 0,
  isLiked = false,
  isBookmarked = false,
  buildId,
  variant = "default",
  className,
  onLike,
  onBookmark,
  onShare,
  onComment
}: BuildEngagementProps) {
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likes, setLikes] = useState(likesCount);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
    onLike?.();
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark?.();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this Gunpla build!',
        url: `${window.location.origin}/builds/${buildId}`
      });
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/builds/${buildId}`);
    }
    onShare?.();
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn(
            "gap-1 text-gray-600 hover:text-red-600",
            liked && "text-red-600"
          )}
        >
          <Heart className={cn("w-4 h-4", liked && "fill-current")} />
          {likes}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onComment}
          className="gap-1 text-gray-600 hover:text-blue-600"
        >
          <MessageCircle className="w-4 h-4" />
          {commentsCount}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="text-gray-600 hover:text-green-600"
        >
          <Share2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className={cn(
            "text-gray-400 hover:text-blue-600",
            bookmarked && "text-blue-600"
          )}
        >
          {bookmarked ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn(
            "gap-2 text-gray-600 hover:text-red-600",
            liked && "text-red-600"
          )}
        >
          <Heart className={cn("w-4 h-4", liked && "fill-current")} />
          {likes}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onComment}
          className="gap-2 text-gray-600 hover:text-blue-600"
        >
          <MessageCircle className="w-4 h-4" />
          {commentsCount}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="text-gray-600 hover:text-green-600"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className={cn(
            "text-gray-400 hover:text-blue-600",
            bookmarked && "text-blue-600"
          )}
        >
          {bookmarked ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </Button>

        <Button variant="ghost" size="sm" asChild>
          <a href={`/builds/${buildId}`} className="text-gray-600 hover:text-blue-600">
            <Eye className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
