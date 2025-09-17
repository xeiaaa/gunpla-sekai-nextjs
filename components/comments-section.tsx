"use client";

import { useState } from "react";
import { CommentInput } from "./comment-input";
import { CommentList } from "./comment-list";

interface CommentsSectionProps {
  buildId: string;
}

export function CommentsSection({ buildId }: CommentsSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCommentAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <CommentInput buildId={buildId} onCommentAdded={handleCommentAdded} />
      <CommentList key={refreshKey} buildId={buildId} onRefresh={handleCommentAdded} />
    </div>
  );
}
