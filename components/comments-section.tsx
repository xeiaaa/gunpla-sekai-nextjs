"use client";

import { useRef } from "react";
import { CommentInput } from "./comment-input";
import { CommentList, CommentListRef } from "./comment-list";

interface CommentsSectionProps {
  buildId: string;
}

export function CommentsSection({ buildId }: CommentsSectionProps) {
  const commentListRef = useRef<CommentListRef>(null);

  const handleCommentAdded = () => {
    // Trigger a refresh in the CommentList
    commentListRef.current?.refresh();
  };

  return (
    <div className="space-y-6">
      <CommentInput buildId={buildId} onCommentAdded={handleCommentAdded} />
      <CommentList ref={commentListRef} buildId={buildId} onRefresh={handleCommentAdded} />
    </div>
  );
}
