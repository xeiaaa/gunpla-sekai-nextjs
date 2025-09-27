"use client";

import { Card } from "@/components/ui/card";
import { Heart, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { LikeButton } from "../like-button";
import { ShareButton } from "../share-button";
import { CommentsSection } from "../comments-section";
import { useBuildEdit } from "@/contexts/build-edit";

export function SocialTab() {
  const { buildData } = useBuildEdit();

  if (!buildData) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Social Engagement
        </h2>
        <p className="text-gray-600 mb-6">
          Preview how your build appears to the community and manage social
          interactions.
        </p>
      </div>

      {/* Social Engagement Preview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Community Preview</h3>
        <div className="space-y-4">
          {/* Build Header with Social Actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {buildData.title}
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>
                  by{" "}
                  {buildData.user.username ||
                    `${buildData.user.firstName} ${buildData.user.lastName}`}
                </span>
                <span>•</span>
                <span>{format(buildData.createdAt, "MMM d, yyyy")}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LikeButton
                buildId={buildData.id}
                initialLikes={buildData.likes}
                initialLiked={buildData.liked}
              />
              <ShareButton
                buildId={buildData.id}
                buildTitle={buildData.title}
              />
            </div>
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                <Heart className="h-6 w-6 text-red-500" />
                {buildData.likes}
              </div>
              <p className="text-sm text-gray-600">Likes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                <MessageSquare className="h-6 w-6 text-blue-500" />
                {buildData.comments}
              </div>
              <p className="text-sm text-gray-600">Comments</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Comments Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <CommentsSection buildId={buildData.id} />
      </Card>
    </div>
  );
}
