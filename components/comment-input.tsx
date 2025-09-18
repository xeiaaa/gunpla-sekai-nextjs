"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@clerk/nextjs";
import { MessageSquare, Send, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface CommentInputProps {
  buildId: string;
  onCommentAdded: () => void;
  placeholder?: string;
}

const MAX_COMMENT_LENGTH = 1000;

export function CommentInput({ buildId, onCommentAdded, placeholder = "Add a comment…" }: CommentInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { isSignedIn } = useAuth();
  const { showToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      showToast("Please log in to leave comments", "info");
      return;
    }

    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      setError(`Comment is too long (${content.length}/${MAX_COMMENT_LENGTH} characters)`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/builds/${buildId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          showToast("Please wait a moment before commenting again", "warning");
        } else {
          setError(errorData.error || "Failed to create comment");
        }
        throw new Error(errorData.error || "Failed to create comment");
      }

      setContent("");
      onCommentAdded();
      
      showToast("Your comment has been added successfully", "success");
    } catch (err) {
      console.error("Error creating comment:", err);
      // Error handling is done above
    } finally {
      setIsSubmitting(false);
    }
  }, [isSignedIn, content, buildId, onCommentAdded, showToast]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_COMMENT_LENGTH) {
      setContent(newContent);
      setError(null); // Clear error when user starts typing
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  if (!isSignedIn) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 transition-all duration-200 hover:bg-gray-100">
        <div className="flex items-center gap-2 text-gray-600">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm">Please sign in to leave a comment</span>
        </div>
      </div>
    );
  }

  const isNearLimit = content.length > MAX_COMMENT_LENGTH * 0.8;
  const isAtLimit = content.length >= MAX_COMMENT_LENGTH;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "min-h-[100px] resize-none transition-all duration-200",
            isFocused && "ring-2 ring-blue-500 ring-opacity-50",
            error && "border-red-500 focus:border-red-500",
            isSubmitting && "opacity-70"
          )}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Press Cmd+Enter to submit
          </p>
          <div className={cn(
            "text-xs transition-colors duration-200",
            isAtLimit ? "text-red-500 font-medium" : 
            isNearLimit ? "text-yellow-600" : 
            "text-gray-500"
          )}>
            {content.length}/{MAX_COMMENT_LENGTH}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3 animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim() || isAtLimit}
          className={cn(
            "flex items-center gap-2 transition-all duration-200",
            "hover:scale-105 active:scale-95",
            isSubmitting && "opacity-70 cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <Send className={cn(
                "h-4 w-4 transition-transform duration-200",
                content.trim() && "group-hover:translate-x-0.5"
              )} />
              <span>Post Comment</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
