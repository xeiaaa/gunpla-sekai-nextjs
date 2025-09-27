"use client";

import { useAuth } from "@clerk/nextjs";
import NextImage from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Trash2,
  Star,
  Info,
  Image,
  List,
  Heart,
  MessageSquare,
  CheckCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { FeaturedImageSelector } from "./featured-image-selector";
import { cn } from "@/lib/utils";
import { BuildEditContextProvider, useBuildEdit } from "@/contexts/build-edit";
import { InfoTab } from "./build-edit/info-tab";
import { GalleryTab } from "./build-edit/gallery-tab";
import { MilestonesTab } from "./build-edit/milestones-tab";
import { SocialTab } from "./build-edit/social-tab";

// Main component that wraps everything with the context provider
function BuildDetailEditViewContent() {
  const { userId } = useAuth();
  const {
    buildData,
    isLoading,
    isError,
    error,
    activeTab,
    setActiveTab,
    mediaLibraryCount,
    updateFeaturedImage,
    deleteBuild,
  } = useBuildEdit();

  // Show loading if user is not authenticated yet
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading build data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError || !buildData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load build data</p>
          <p className="text-gray-600 text-sm">
            {error?.message || "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  // Redirect if not owner (this will be handled by context, but show loading while redirecting)
  if (userId !== buildData.user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNING":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "ON_HOLD":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Tab configuration
  const tabs = [
    { id: "info" as const, label: "Build Info", icon: Info },
    { id: "gallery" as const, label: "Build Gallery", icon: Image },
    { id: "milestones" as const, label: "Build Milestones", icon: List },
    { id: "social" as const, label: "Social Engagement", icon: Heart },
  ];

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return <InfoTab />;
      case "gallery":
        return <GalleryTab />;
      case "milestones":
        return <MilestonesTab />;
      case "social":
        return <SocialTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Tabs */}
            <div className="border-b border-border mb-6">
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Build Stats Card */}
              <Card className="p-5">
                <h3 className="text-lg font-semibold mb-3">Build Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge
                      className={`${getStatusColor(
                        buildData.status
                      )} flex items-center gap-1`}
                    >
                      {getStatusIcon(buildData.status)}
                      {buildData.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total Milestones
                    </span>
                    <span className="font-semibold text-gray-900">
                      {buildData.milestones.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Images</span>
                    <span className="font-semibold text-gray-900">
                      {mediaLibraryCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Likes</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      {buildData.likes}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Comments</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      {buildData.comments}
                    </span>
                  </div>
                  {buildData.startedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Started</span>
                      <span className="font-medium text-sm text-gray-700">
                        {format(buildData.startedAt, "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  {buildData.completedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="font-medium text-sm text-gray-700">
                        {format(buildData.completedAt, "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Build Actions Card */}
              <Card className="p-5">
                <h3 className="text-lg font-semibold mb-3">Build Actions</h3>
                <div className="space-y-2">
                  <Link href={`/builds/${buildData.id}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 h-9"
                    >
                      <Eye className="h-4 w-4" />
                      View Public
                    </Button>
                  </Link>

                  <FeaturedImageSelector
                    buildId={buildData.id}
                    currentFeaturedImageId={buildData.featuredImageId}
                    onSelect={updateFeaturedImage}
                  >
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 h-9"
                    >
                      <Star className="h-4 w-4" />
                      Select Featured Image
                    </Button>
                  </FeaturedImageSelector>

                  <Button
                    onClick={deleteBuild}
                    variant="destructive"
                    className="w-full flex items-center justify-center gap-2 h-9"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Build
                  </Button>
                </div>
              </Card>

              {/* Kit Information Card */}
              <Card className="p-5">
                <h3 className="text-lg font-semibold mb-3">Kit Information</h3>
                <div className="space-y-3">
                  {buildData.kit.boxArt && (
                    <div className="relative aspect-square w-full">
                      <NextImage
                        src={buildData.kit.boxArt}
                        alt={`${buildData.kit.name} box art`}
                        fill
                        className="object-cover rounded-lg border"
                        sizes="(max-width: 1024px) 100vw, 25vw"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      <a
                        href={`/kits/${buildData.kit.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {buildData.kit.name}
                      </a>
                    </h4>
                    {buildData.kit.productLine && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Product Line:
                          </span>
                          <span className="font-medium text-sm text-gray-700">
                            {buildData.kit.productLine.name}
                          </span>
                        </div>
                        {buildData.kit.productLine.grade && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Grade:
                            </span>
                            <span className="font-medium text-sm text-gray-700">
                              {buildData.kit.productLine.grade.name}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BuildDetailEditViewProps {
  buildId: string;
}

export function BuildDetailEditView({ buildId }: BuildDetailEditViewProps) {
  return (
    <BuildEditContextProvider buildId={buildId}>
      <BuildDetailEditViewContent />
    </BuildEditContextProvider>
  );
}
