"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  Image as ImageIcon,
  ArrowRight,
  Heart,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useKitBuilds } from "@/hooks/use-builds";

interface CommunityBuildsProps {
  kitId: string;
  kitSlug: string | null;
}

interface Build {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  user: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  featuredImage: {
    id: string;
    url: string;
    eagerUrl: string | null;
  } | null;
  milestones: Array<{
    uploads: Array<{
      upload: {
        url: string;
        eagerUrl: string | null;
      };
    }>;
  }>;
  _count: {
    milestones: number;
    likes: number;
    comments: number;
  };
}

const STATUS_COLORS = {
  PLANNING: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
};

export default function CommunityBuilds({
  kitId,
  kitSlug,
}: CommunityBuildsProps) {
  const [showAll, setShowAll] = useState(false);

  // React Query hook
  const { data: builds = [], isLoading: loading, error } = useKitBuilds(kitId);

  const getUserDisplayName = (user: Build["user"]) => {
    if (user.username) return user.username;
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    return "Anonymous User";
  };

  const getPreviewImage = (build: Build) => {
    // Use featured image first
    if (build.featuredImage) {
      return build.featuredImage.eagerUrl || build.featuredImage.url;
    }

    // Fallback to first image of first milestone
    const firstMilestone = build.milestones[0];
    if (firstMilestone?.uploads[0]) {
      return (
        firstMilestone.uploads[0].upload.eagerUrl ||
        firstMilestone.uploads[0].upload.url
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Community Builds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading builds...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (builds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Community Builds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No builds yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to share your build progress!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Community Builds
          </div>
          <Link href={`/kits/${kitSlug}/builds`}>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {builds.map((build) => {
            const previewImage = getPreviewImage(build);

            return (
              <Link key={build.id} href={`/builds/${build.id}`}>
                <div className="relative group overflow-hidden rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-square relative">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={build.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <Badge
                      className={`absolute top-2 right-2 text-xs ${
                        STATUS_COLORS[
                          build.status as keyof typeof STATUS_COLORS
                        ]
                      }`}
                    >
                      {build.status.replace("_", " ")}
                    </Badge>

                    {/* Hover overlay with build info */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-end">
                      <div className="p-3 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="font-semibold text-sm text-white mb-1 line-clamp-2">
                          {build.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-200">
                          <div className="flex items-center">
                            {build.user.imageUrl ? (
                              <img
                                src={build.user.imageUrl}
                                alt={getUserDisplayName(build.user)}
                                className="w-3 h-3 rounded-full mr-1"
                              />
                            ) : (
                              <User className="w-3 h-3 mr-1" />
                            )}
                            <span className="truncate">
                              {getUserDisplayName(build.user)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Heart className="w-3 h-3 mr-1" />
                              <span>{build._count.likes}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              <span>{build._count.comments}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
