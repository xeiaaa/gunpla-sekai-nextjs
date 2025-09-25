"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
  ThumbsUp,
  MessageCircle,
  Eye,
  Share2,
  MoreHorizontal,
  Trophy,
  Award,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { UserProfileData } from "@/lib/actions/users";
import { useState } from "react";

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
  const [selectedReview, setSelectedReview] = useState<
    (typeof user.recentReviews)[0] | null
  >(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar (25%) */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Profile Card */}
            <Card>
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

                  {/* Stats */}
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>{user.collectionStats.total} Kits</span>
                    </div>
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
              {/* Builds Feed */}
              {user.recentBuilds.length > 0 ? (
                <div className="space-y-6">
                  {user.recentBuilds.map((build) => (
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
                      showUserInfo={false}
                      variant="feed"
                    />
                  ))}
                </div>
              ) : (
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
              )}
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
