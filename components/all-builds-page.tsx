"use client";

import { Button } from "@/components/ui/button";
import { EnhancedBuildCard } from "@/components/enhanced-build-card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Grid3X3,
  FileText,
  Camera,
  Heart,
  MessageSquare,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAllBuildsInfinite } from "@/hooks/use-builds";

interface BuildData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  featuredImage: {
    url: string;
  } | null;
  kit: {
    id: string;
    name: string;
    slug: string | null;
    boxArt: string | null;
    productLine: {
      name: string;
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
    avatarUrl: string | null;
  };
  milestones: Array<{
    id: string;
    type: string;
    title: string;
    order: number;
    imageUrls: string[];
    uploads: Array<{
      upload: {
        url: string;
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

export function AllBuildsPage() {
  // React Query for all builds with infinite scroll
  const {
    data: buildsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    error,
    isFetched,
  } = useAllBuildsInfinite({
    sort: "newest",
    limit: 10,
  });

  // Flatten all builds from all pages and deduplicate by ID
  const allBuilds = useMemo(() => {
    if (!buildsData?.pages) return [];
    const builds = buildsData.pages.flatMap(
      (page) => (page as { builds: BuildData[] }).builds
    );

    // Deduplicate by ID to prevent duplicate keys
    const seen = new Set<string>();
    return builds.filter((build) => {
      if (seen.has(build.id)) {
        return false;
      }
      seen.add(build.id);
      return true;
    });
  }, [buildsData]);

  // Intersection observer for infinite scroll
  const galleryLoadMoreRef = useRef<HTMLDivElement>(null);
  const postsLoadMoreRef = useRef<HTMLDivElement>(null);

  // Initialize tab from URL params, default to "gallery"
  const searchParams = useSearchParams();
  const initialTab =
    (searchParams.get("tab") as "gallery" | "posts") || "gallery";
  const [activeTab, setActiveTab] = useState<"gallery" | "posts">(initialTab);
  const [isTabChanging, setIsTabChanging] = useState(false);

  // Trigger fetch when intersection is observed
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    // Observe the appropriate ref based on active tab
    const currentRef =
      activeTab === "gallery"
        ? galleryLoadMoreRef.current
        : postsLoadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, activeTab]);

  // Optimized tab change handler - use replaceState instead of push
  const handleTabChange = useCallback(
    (tab: "gallery" | "posts") => {
      if (tab === activeTab) return; // Prevent unnecessary updates

      setIsTabChanging(true);

      // Update state immediately for responsive UI
      setActiveTab(tab);

      // Update URL without triggering navigation
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());

      // Reset loading state after a brief delay to allow for smooth transition
      setTimeout(() => setIsTabChanging(false), 50);
    },
    [activeTab]
  );

  // Sync with external URL changes (browser back/forward)
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as "gallery" | "posts" | null;
    const newTab = tabFromUrl || "gallery";
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [searchParams, activeTab]);

  const getUserDisplayName = (user: BuildData["user"]) => {
    if (user.username) return user.username;
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    return "Anonymous User";
  };

  const tabs = [
    { id: "gallery" as const, label: "Gallery", icon: Grid3X3 },
    { id: "posts" as const, label: "Posts", icon: FileText },
  ];

  // Memoize tab content to prevent unnecessary re-renders
  const galleryContent = useMemo(() => {
    if (isLoading && !allBuilds.length) {
      return (
        <div className="columns-2 gap-2 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 rounded-lg animate-pulse break-inside-avoid"
            />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load builds
          </h3>
          <p className="text-gray-600 mb-4">
            There was an error loading the builds. Please try again.
          </p>
        </div>
      );
    }

    if (allBuilds.length > 0) {
      return (
        <div className="space-y-4">
          <div className="columns-2 gap-2 space-y-2">
            {allBuilds.map((build) => {
              // Get first image from featured image or kit box art
              const firstImage = build.featuredImage?.url || build.kit?.boxArt;

              // Get upload count for photo badge
              const uploadCount =
                build.milestones?.reduce(
                  (total, milestone) =>
                    total + (milestone.uploads?.length || 0),
                  0
                ) || 0;

              return (
                <Link
                  key={build.id}
                  href={`/builds/${build.id}`}
                  className="relative group rounded-lg overflow-hidden bg-gray-100 break-inside-avoid block hover:shadow-md transition-shadow"
                >
                  {firstImage ? (
                    <Image
                      src={firstImage}
                      alt={build.title}
                      width={400}
                      height={300}
                      className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {/* Status badge */}
                  {/* <Badge
                    className={`absolute top-2 left-2 text-xs ${
                      STATUS_COLORS[build.status as keyof typeof STATUS_COLORS]
                    }`}
                  >
                    {build.status.replace("_", " ")}
                  </Badge> */}

                  {/* Photo count badge */}
                  {uploadCount > 0 && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {uploadCount}
                    </div>
                  )}

                  {/* Hover overlay with build info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-3 w-full">
                      <h3 className="font-semibold text-sm text-white mb-1 line-clamp-2">
                        {build.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-200">
                        <div className="flex items-center">
                          {build.user.imageUrl || build.user.avatarUrl ? (
                            <div className="w-3 h-3 rounded-full mr-1 overflow-hidden">
                              <Image
                                src={
                                  build.user.imageUrl ||
                                  build.user.avatarUrl ||
                                  ""
                                }
                                alt={getUserDisplayName(build.user)}
                                width={12}
                                height={12}
                                className="w-full h-full object-cover"
                              />
                            </div>
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
                </Link>
              );
            })}
          </div>
          {/* Load more trigger */}
          {hasNextPage && (
            <div ref={galleryLoadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Loading more builds...
                </div>
              ) : (
                <div className="text-gray-400 text-sm">Scroll to load more</div>
              )}
            </div>
          )}
          {/* Refreshing indicator */}
          {isFetching && (
            <div className="flex justify-center py-2">
              <span className="text-xs text-gray-400">Refreshing…</span>
            </div>
          )}
        </div>
      );
    }

    if (isFetched && allBuilds.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No builds yet
          </h3>
          <p className="text-gray-600 mb-4">
            Be the first to share your build with the community!
          </p>
          <Button asChild>
            <Link href="/builds/new">Start Your First Build</Link>
          </Button>
        </div>
      );
    }

    return null;
  }, [
    allBuilds,
    isLoading,
    isFetching,
    error,
    hasNextPage,
    isFetchingNextPage,
    galleryLoadMoreRef,
    isFetched,
  ]);

  const postsContent = useMemo(() => {
    if (isLoading && !allBuilds.length) {
      return (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load builds
          </h3>
          <p className="text-gray-600 mb-4">
            There was an error loading the builds. Please try again.
          </p>
        </div>
      );
    }

    if (allBuilds.length > 0) {
      return (
        <div className="space-y-6">
          {allBuilds.map((build) => (
            <EnhancedBuildCard
              key={build.id}
              build={{
                ...build,
                user: {
                  id: build.user.id,
                  username: build.user.username,
                  firstName: build.user.firstName,
                  lastName: build.user.lastName,
                  imageUrl: build.user.imageUrl,
                  avatarUrl: build.user.avatarUrl,
                },
              }}
              showUserInfo={true}
              variant="feed"
            />
          ))}
          {/* Load more trigger */}
          {hasNextPage && (
            <div ref={postsLoadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Loading more builds...
                </div>
              ) : (
                <div className="text-gray-400 text-sm">Scroll to load more</div>
              )}
            </div>
          )}
          {/* Refreshing indicator */}
          {isFetching && (
            <div className="flex justify-center py-2">
              <span className="text-xs text-gray-400">Refreshing…</span>
            </div>
          )}
        </div>
      );
    }

    if (isFetched && allBuilds.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No builds yet
          </h3>
          <p className="text-gray-600 mb-4">
            Be the first to share your build with the community!
          </p>
          <Button asChild>
            <Link href="/builds/new">Start Your First Build</Link>
          </Button>
        </div>
      );
    }

    return null;
  }, [
    allBuilds,
    isLoading,
    isFetching,
    error,
    hasNextPage,
    isFetchingNextPage,
    postsLoadMoreRef,
    isFetched,
  ]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "gallery":
        return galleryContent;
      case "posts":
        return postsContent;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Layout */}
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Community Builds
            </h1>
            <p className="text-gray-600">
              Discover amazing Gunpla builds from builders around the world
            </p>
          </div>

          {/* Tabs */}
          <div className="z-10 bg-gray-50 border-b border-border mb-6 backdrop-blur-md supports-[backdrop-filter]:bg-gray-50/60">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
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
          <div
            className={`transition-opacity duration-150 ${
              isTabChanging ? "opacity-75" : "opacity-100"
            }`}
          >
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
