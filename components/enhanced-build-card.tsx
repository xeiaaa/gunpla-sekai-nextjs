"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdaptiveImage } from "@/components/ui/adaptive-image";
import {
  User,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Camera,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BuildData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  createdAt: Date;
  completedAt?: Date | null;
  featuredImage?: {
    url: string;
  } | null;
  kit: {
    id: string;
    name: string;
    slug?: string | null;
    boxArt?: string | null;
    productLine?: {
      name: string;
      grade: {
        name: string;
      };
    } | null;
    series?: {
      name: string;
    } | null;
  };
  user?: {
    id: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
    avatarUrl?: string | null;
  };
  likes?: {
    count: number;
  };
  comments?: {
    count: number;
  };
  milestones?: Array<{
    id: string;
    type: string;
    title: string;
    imageUrls: string[];
    uploads: Array<{
      upload: {
        url: string;
      };
    }>;
  }>;
  _count?: {
    milestones: number;
  };
}

interface EnhancedBuildCardProps {
  build: BuildData;
  showUserInfo?: boolean;
  variant?: "feed" | "grid";
  className?: string;
}

const GRADE_COLORS = {
  HG: "bg-blue-100 text-blue-800 border-blue-200",
  RG: "bg-purple-100 text-purple-800 border-purple-200",
  MG: "bg-green-100 text-green-800 border-green-200",
  PG: "bg-yellow-100 text-yellow-800 border-yellow-200",
  SD: "bg-pink-100 text-pink-800 border-pink-200",
  EG: "bg-orange-100 text-orange-800 border-orange-200",
  FM: "bg-indigo-100 text-indigo-800 border-indigo-200",
  RE: "bg-red-100 text-red-800 border-red-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
};

const STATUS_CONFIG = {
  PLANNING: {
    icon: AlertCircle,
    color: "text-gray-600",
    bg: "bg-gray-100",
    label: "Planning",
  },
  IN_PROGRESS: {
    icon: Play,
    color: "text-blue-600",
    bg: "bg-blue-100",
    label: "In Progress",
  },
  ON_HOLD: {
    icon: Pause,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    label: "On Hold",
  },
  COMPLETED: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
    label: "Completed",
  },
};

export function EnhancedBuildCard({
  build,
  showUserInfo = false,
  variant = "feed",
  className,
}: EnhancedBuildCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all images from featured image and milestones
  const allImages = [
    ...(build.featuredImage ? [build.featuredImage.url] : []),
    ...(build.milestones?.flatMap((m) => [
      ...m.imageUrls,
      ...m.uploads.map((u) => u.upload.url),
    ]) || []),
  ].filter(Boolean);

  const hasMultipleImages = allImages.length > 1;
  const currentImage = allImages[currentImageIndex] || build.kit.boxArt;

  const displayName = build.user
    ? build.user.firstName && build.user.lastName
      ? `${build.user.firstName} ${build.user.lastName}`
      : build.user.username || "User"
    : "User";

  const statusConfig =
    STATUS_CONFIG[build.status as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.PLANNING;
  const StatusIcon = statusConfig.icon;

  const gradeName = build.kit.productLine?.grade?.name || "Unknown";
  const gradeColorClass =
    GRADE_COLORS[gradeName as keyof typeof GRADE_COLORS] ||
    GRADE_COLORS.default;

  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + allImages.length) % allImages.length
      );
    }
  };

  if (variant === "grid") {
    return (
      <Card
        className={cn(
          "overflow-hidden hover:shadow-lg transition-all duration-300 group",
          className
        )}
      >
        <div className="relative overflow-hidden">
          {currentImage ? (
            <AdaptiveImage
              src={currentImage}
              alt={build.title}
              className="group-hover:scale-105 transition-transform duration-300"
              maxHeight={250}
              minHeight={150}
              fallbackAspectRatio="video"
            />
          ) : (
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Image Navigation */}
          {hasMultipleImages && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              {/* Image Indicator */}
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Camera className="w-3 h-3" />
                {allImages.length}
              </div>
            </>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <Badge
              className={cn("text-xs", statusConfig.bg, statusConfig.color)}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Kit Header */}
          <div className="flex items-start gap-3 mb-3">
            {build.kit.boxArt && (
              <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={build.kit.boxArt}
                  alt={build.kit.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Link
                href={`/builds/${build.id}`}
                className="font-semibold text-lg line-clamp-2 mb-1 hover:text-blue-600 transition-colors block"
              >
                {build.title}
              </Link>
              <Link
                href={`/kits/${build.kit.slug || build.kit.id}`}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors line-clamp-1"
              >
                {build.kit.name}
              </Link>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className={cn("text-xs", gradeColorClass)}>
              {gradeName}
            </Badge>
            {build.kit.series && (
              <Badge variant="outline" className="text-xs">
                {build.kit.series.name}
              </Badge>
            )}
          </div>

          {/* Build Info */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {build.completedAt
                    ? `Completed ${format(
                        new Date(build.completedAt),
                        "MMM d, yyyy"
                      )}`
                    : `Started ${format(
                        new Date(build.createdAt),
                        "MMM d, yyyy"
                      )}`}
                </span>
              </div>
            </div>

            {build._count?.milestones && build._count.milestones > 0 && (
              <div className="text-xs text-gray-500">
                {build._count.milestones} milestone
                {build._count.milestones !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Engagement Actions */}
          <div className="flex items-center gap-4 pt-3 border-t">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
              <Heart className="w-4 h-4" />
              {build.likes?.count || 0}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
              <MessageCircle className="w-4 h-4" />
              {build.comments?.count || 0}
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Feed variant (default)
  return (
    <Card className={cn("overflow-hidden py-0", className)}>
      {/* Header with User Info */}
      {showUserInfo && build.user && (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={build.user.imageUrl || build.user.avatarUrl || ""}
                />
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/users/${build.user.username}`}
                  className="font-semibold hover:text-blue-600 transition-colors"
                >
                  {displayName}
                </Link>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(build.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Build Header */}
      <div className="p-4 border-b flex flex-row justify-between">
        <div>
          <Link
            href={`/builds/${build.id}`}
            className="font-semibold text-lg mb-1 hover:text-blue-600 transition-colors block"
          >
            {build.title}
          </Link>
          <Link
            href={`/kits/${build.kit.slug || build.kit.id}`}
            className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            {build.kit.name}
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", gradeColorClass)}>
              {gradeName}
            </Badge>
            <Badge
              className={cn("text-xs", statusConfig.bg, statusConfig.color)}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative">
        {currentImage ? (
          <AdaptiveImage
            src={currentImage}
            alt={build.title}
            maxHeight={500}
            minHeight={300}
            fallbackAspectRatio="video"
          />
        ) : (
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            <Camera className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Image Navigation */}
        {hasMultipleImages && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={prevImage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={nextImage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Image Indicator */}
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {allImages.length}
            </div>
          </>
        )}
      </div>

      {/* Engagement Actions */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <Heart className="w-4 h-4" />
            {build.likes?.count || 0}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            {build.comments?.count || 0}
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
