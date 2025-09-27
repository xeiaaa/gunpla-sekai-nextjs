"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnhancedBuildCard } from "@/components/enhanced-build-card";
import {
  User,
  Calendar,
  Package,
  Star,
  Heart,
  ArrowRight,
  Instagram,
  Youtube,
  ExternalLink,
  Wrench,
  Trophy,
  Award,
  ShoppingCart,
  CheckCircle,
  Settings,
  Grid3X3,
  FileText,
  Camera,
  MessageSquare,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { UserProfileData } from "@/lib/actions/users";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserBuildsInfinite } from "@/hooks/use-builds";

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

interface UserProfilePageProps {
  user: UserProfileData;
  isOwnProfile?: boolean;
  routeContext?: "me" | "user";
}

export function UserProfilePage({
  user,
  isOwnProfile = false,
  routeContext = "user",
}: UserProfilePageProps) {
  const searchParams = useSearchParams();
  const [selectedReview, setSelectedReview] = useState<
    (typeof user.recentReviews)[0] | null
  >(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // React Query for user builds with infinite scroll
  const {
    data: buildsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    error,
    isFetched,
  } = useUserBuildsInfinite(user.id, {
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

  const getUserDisplayName = (userData: UserProfileData) => {
    if (userData.username) return userData.username;
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    if (userData.firstName) return userData.firstName;
    return "Anonymous User";
  };

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username || "User";

  const joinDate = format(new Date(user.createdAt), "MMMM yyyy");

  // Generate URLs based on route context
  const reviewsUrl =
    routeContext === "me" ? "/me/reviews" : `/users/${user.username}/reviews`;
  const collectionsUrl =
    routeContext === "me"
      ? "/me/collections"
      : `/users/${user.username}/collections`;

  // Handle opening review dialog
  const handleReviewClick = (review: (typeof user.recentReviews)[0]) => {
    setSelectedReview(review);
    setIsReviewDialogOpen(true);
  };

  // Color functions for review scores (matching review-display.tsx)
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-green-100";
    if (score >= 6) return "bg-yellow-100";
    if (score >= 4) return "bg-orange-100";
    return "bg-red-100";
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
                          {user.imageUrl || user.avatarUrl ? (
                            <div className="w-3 h-3 rounded-full mr-1 overflow-hidden">
                              <Image
                                src={user.imageUrl || user.avatarUrl || ""}
                                alt={getUserDisplayName(user)}
                                width={12}
                                height={12}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <User className="w-3 h-3 mr-1" />
                          )}
                          <span className="truncate">
                            {getUserDisplayName(user)}
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
            Start building to share your progress with the community!
          </p>
          {isOwnProfile && (
            <Button asChild>
              <Link href="/builds/new">Start Your First Build</Link>
            </Button>
          )}
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
    isOwnProfile,
    galleryLoadMoreRef,
    isFetched,
    user,
  ]);

  const postsContent = useMemo(() => {
    if (isLoading && !allBuilds.length) {
      return (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32" />
                      <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="h-48 bg-gray-200 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load builds
            </h3>
            <p className="text-gray-600 mb-4">
              There was an error loading the builds. Please try again.
            </p>
          </CardContent>
        </Card>
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
                  id: user.id,
                  username: user.username,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  imageUrl: user.imageUrl,
                  avatarUrl: user.avatarUrl,
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
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No builds yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start building to share your progress with the community!
            </p>
            {isOwnProfile && (
              <Button asChild>
                <Link href="/builds/new">Start Your First Build</Link>
              </Button>
            )}
          </CardContent>
        </Card>
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
    user.id,
    user.username,
    user.firstName,
    user.lastName,
    user.imageUrl,
    user.avatarUrl,
    isOwnProfile,
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar (25%) */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Profile Card */}
            <Card className="py-0">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {/* Avatar */}
                  <div className="flex justify-center">
                    {user.imageUrl || user.avatarUrl ? (
                      <div className="relative w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden">
                        <Image
                          src={user.imageUrl || user.avatarUrl || ""}
                          alt={displayName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Name & Username */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {displayName}
                    </h3>
                    {user.username && (
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    )}
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-sm text-gray-700">{user.bio}</p>
                  )}

                  {/* Joined Date */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {joinDate}</span>
                  </div>

                  {/* Social Links */}
                  {(user.instagramUrl ||
                    user.youtubeUrl ||
                    user.portfolioUrl) && (
                    <div className="flex items-center justify-center gap-3">
                      {user.instagramUrl && (
                        <a
                          href={user.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-pink-600 transition-colors"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {user.youtubeUrl && (
                        <a
                          href={user.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Youtube className="w-5 h-5" />
                        </a>
                      )}
                      {user.portfolioUrl && (
                        <a
                          href={user.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Settings Link (only for own profile) */}
                  {isOwnProfile && (
                    <div className="pt-6 border-t border-gray-200 space-y-2">
                      <Button asChild size="sm" className="w-full">
                        <Link href="/builds/new">
                          <Plus className="w-4 h-4 mr-2" />
                          Start Build
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full"
                      >
                        <Link href="/settings/profile">
                          <Settings className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Badges/Achievements Placeholder */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-gray-500">
                  <Award className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content (50%) */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Tabs */}
              <div className="border-b border-border">
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

          {/* Right Sidebar (25%) */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Collection Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Collection
                  {user.collectionStats.total > 0
                    ? ` (${user.collectionStats.total} Kits)`
                    : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.collectionStats.total === 0 ? (
                  /* Empty State */
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <div className="text-gray-500 text-sm mb-2">
                      No kits in collection yet
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Horizontal Collection Stats */}
                    <div className="flex justify-between items-center text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Heart className="w-5 h-5 text-red-500" />
                        <div className="text-lg font-semibold">
                          {user.collectionStats.wishlist}
                        </div>
                        <div className="text-xs text-gray-500">Wishlist</div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <ShoppingCart className="w-5 h-5 text-purple-500" />
                        <div className="text-lg font-semibold">
                          {user.collectionStats.preorder}
                        </div>
                        <div className="text-xs text-gray-500">Preorder</div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Package className="w-5 h-5 text-blue-500" />
                        <div className="text-lg font-semibold">
                          {user.collectionStats.backlog}
                        </div>
                        <div className="text-xs text-gray-500">Backlog</div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Wrench className="w-5 h-5 text-orange-500" />
                        <div className="text-lg font-semibold">
                          {user.collectionStats.inProgress}
                        </div>
                        <div className="text-xs text-gray-500">In Progress</div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div className="text-lg font-semibold">
                          {user.collectionStats.built}
                        </div>
                        <div className="text-xs text-gray-500">Built</div>
                      </div>
                    </div>

                    {/* Completion Rate */}
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        Built {user.collectionStats.built} /{" "}
                        {user.collectionStats.total} (
                        {Math.round(
                          (user.collectionStats.built /
                            user.collectionStats.total) *
                            100
                        )}
                        %)
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (user.collectionStats.built /
                                user.collectionStats.total) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Completion Rate
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full"
                    >
                      <Link href={collectionsUrl}>
                        View All Collections
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {user.recentReviews.length > 0 ? (
                  <div className="space-y-3">
                    {user.recentReviews.slice(0, 3).map((review) => (
                      <div
                        key={review.id}
                        className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        onClick={() => handleReviewClick(review)}
                      >
                        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          {review.kit.boxArt ? (
                            <Image
                              src={review.kit.boxArt}
                              alt={review.kit.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {review.kit.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">
                              {review.overallScore.toFixed(1)}
                            </span>
                          </div>
                          {review.content && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                              {review.content}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full mt-3"
                    >
                      <Link href={reviewsUrl}>
                        View All Reviews
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No reviews yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              View detailed information about this build review.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-6">
              {/* Review Header */}
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                  {selectedReview.kit.boxArt ? (
                    <Image
                      src={selectedReview.kit.boxArt}
                      alt={selectedReview.kit.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {selectedReview.kit.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full ${getScoreBgColor(
                        selectedReview.overallScore
                      )}`}
                    >
                      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                      <span
                        className={`text-lg font-bold ${getScoreColor(
                          selectedReview.overallScore
                        )}`}
                      >
                        {selectedReview.overallScore.toFixed(1)}/10
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(
                        new Date(selectedReview.createdAt),
                        "MMMM d, yyyy"
                      )}
                    </span>
                  </div>
                  {selectedReview.title && (
                    <h4 className="text-lg font-medium mt-2">
                      {selectedReview.title}
                    </h4>
                  )}
                </div>
              </div>

              {/* Category Scores */}
              {selectedReview.categoryScores &&
                selectedReview.categoryScores.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
                      Category Breakdown
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedReview.categoryScores.map(
                        (score, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-2"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm capitalize">
                                {score.category.replace(/_/g, " ")}
                              </p>
                              {score.notes && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {score.notes}
                                </p>
                              )}
                            </div>
                            <div
                              className={`px-2 py-1 rounded ${getScoreBgColor(
                                score.score
                              )}`}
                            >
                              <span
                                className={`text-sm font-medium ${getScoreColor(
                                  score.score
                                )}`}
                              >
                                {score.score}/10
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Review Content */}
              {selectedReview.content && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
                    Review
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {selectedReview.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {selectedReview.feedback && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Helpful:</span>
                      <span className="font-medium">
                        {selectedReview.feedback.helpful}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Not Helpful:
                      </span>
                      <span className="font-medium">
                        {selectedReview.feedback.notHelpful}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
