"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, Image as ImageIcon, ArrowRight, Hammer, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
// Removed server action import - using API route instead
import { format } from "date-fns";

interface RecentBuildsProps {
  limit?: number;
}

interface Build {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  kit: {
    id: string;
    name: string;
    slug: string | null;
    boxArt: string | null;
    productLine: {
      grade: {
        name: string;
      };
    } | null;
    series: {
      name: string;
    } | null;
  };
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

export default function RecentBuilds({ limit = 6 }: RecentBuildsProps) {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const response = await fetch(`/api/builds/recent?limit=${limit}`);
        if (!response.ok) {
          throw new Error("Failed to fetch recent builds");
        }
        const buildsData = await response.json();
        setBuilds(buildsData);
      } catch (error) {
        console.error("Error fetching recent builds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, [limit]);

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
      return firstMilestone.uploads[0].upload.eagerUrl || firstMilestone.uploads[0].upload.url;
    }

    // Final fallback to kit box art
    return build.kit.boxArt;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Hammer className="mr-2 h-5 w-5" />
            Recent Builds
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
            <Hammer className="mr-2 h-5 w-5" />
            Recent Builds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Hammer className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No builds yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start documenting your builds to see them here!
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
            <Hammer className="mr-2 h-5 w-5" />
            Recent Builds
          </div>
          <Link href="/builds">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {builds.map((build) => {
            const previewImage = getPreviewImage(build);

            return (
              <Link key={build.id} href={`/builds/${build.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={build.title}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <Badge
                      className={`absolute top-2 right-2 ${STATUS_COLORS[build.status as keyof typeof STATUS_COLORS]}`}
                    >
                      {build.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {build.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {build.kit.name}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Avatar className="w-4 h-4 mr-2">
                          <AvatarImage src={build.user.imageUrl || ""} alt={getUserDisplayName(build.user)} />
                          <AvatarFallback className="text-xs">
                            <User className="w-3 h-3" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                          {getUserDisplayName(build.user)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{format(new Date(build.createdAt), "MMM d")}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {build._count.milestones} milestone{build._count.milestones !== 1 ? 's' : ''}
                      </span>
                      <div className="flex items-center gap-3">
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
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
