"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewVotingButtonsProps {
  reviewId: string;
  initialCounts: {
    helpful: number;
    notHelpful: number;
  };
  initialUserFeedback?: {
    isHelpful: boolean;
  } | null;
  onFeedbackUpdate?: (counts: { helpful: number; notHelpful: number }) => void;
}

export function ReviewVotingButtons({
  reviewId,
  initialCounts,
  initialUserFeedback,
  onFeedbackUpdate,
}: ReviewVotingButtonsProps) {
  const [counts, setCounts] = useState(initialCounts);
  const [userFeedback, setUserFeedback] = useState(initialUserFeedback);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (isHelpful: boolean) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isHelpful }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      const data = await response.json();
      setCounts(data.counts);
      setUserFeedback({ isHelpful });
      onFeedbackUpdate?.(data.counts);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveVote = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/feedback`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove feedback");
      }

      const data = await response.json();
      setCounts(data.counts);
      setUserFeedback(null);
      onFeedbackUpdate?.(data.counts);
    } catch (error) {
      console.error("Error removing feedback:", error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const isHelpfulActive = userFeedback?.isHelpful === true;
  const isNotHelpfulActive = userFeedback?.isHelpful === false;

  return (
    <div className="flex items-center space-x-4">
      {/* Helpful Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (isHelpfulActive) {
            handleRemoveVote();
          } else {
            handleVote(true);
          }
        }}
        disabled={isLoading}
        className={cn(
          "flex items-center space-x-1 text-sm",
          isHelpfulActive
            ? "text-green-600 hover:text-green-700"
            : "text-muted-foreground hover:text-green-600"
        )}
      >
        <ThumbsUp className={cn("h-4 w-4", isHelpfulActive && "fill-current")} />
        <span>Helpful</span>
        {counts.helpful > 0 && (
          <span className="text-xs text-muted-foreground">({counts.helpful})</span>
        )}
      </Button>

      {/* Not Helpful Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (isNotHelpfulActive) {
            handleRemoveVote();
          } else {
            handleVote(false);
          }
        }}
        disabled={isLoading}
        className={cn(
          "flex items-center space-x-1 text-sm",
          isNotHelpfulActive
            ? "text-red-600 hover:text-red-700"
            : "text-muted-foreground hover:text-red-600"
        )}
      >
        <ThumbsDown className={cn("h-4 w-4", isNotHelpfulActive && "fill-current")} />
        <span>Not Helpful</span>
        {counts.notHelpful > 0 && (
          <span className="text-xs text-muted-foreground">({counts.notHelpful})</span>
        )}
      </Button>

      {/* Feedback Summary */}
      {counts.helpful > 0 && (
        <span className="text-sm text-muted-foreground">
          {counts.helpful} found this helpful
        </span>
      )}
    </div>
  );
}
