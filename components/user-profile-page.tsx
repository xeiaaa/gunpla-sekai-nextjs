"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Calendar,
  Package,
  Star,
  Heart,
  Clock,
  CheckCircle,
  ArrowRight,
  Image as ImageIcon,
  Settings,
  Instagram,
  Youtube,
  ExternalLink,
  Hammer,
  ShoppingCart,
  ThumbsUp,
  MessageCircle,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { UserProfileData } from "@/lib/actions/users";

interface UserProfilePageProps {
  user: UserProfileData;
  isOwnProfile?: boolean;
  routeContext?: 'me' | 'user';
}

export function UserProfilePage({ user, isOwnProfile = false, routeContext = 'user' }: UserProfilePageProps) {
  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.username || "User";

  const joinDate = format(new Date(user.createdAt), "MMMM yyyy");

  // Generate URLs based on route context
  const buildsUrl = routeContext === 'me' ? '/me/builds' : `/users/${user.username}/builds`;
  const reviewsUrl = routeContext === 'me' ? '/me/reviews' : `/users/${user.username}/reviews`;
  const collectionsUrl = routeContext === 'me' ? '/me/collections' : `/users/${user.username}/collections`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        {/* Banner Image */}
        {user.bannerImageUrl && (
          <div className="relative h-48 w-full rounded-lg overflow-hidden mb-6">
            <Image
              src={user.bannerImageUrl}
              alt={`${displayName}'s banner`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        <div className="flex items-start gap-6">
          {/* Profile Picture */}
          <div className="relative -mt-16 z-10">
            {user.imageUrl || user.avatarUrl ? (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden relative">
                <Image
                  src={user.imageUrl || user.avatarUrl || ""}
                  alt={displayName}
                  fill
                  className="object-cover rounded-full"
                  style={{ borderRadius: '50%' }}
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{displayName}</h1>
                {user.username && (
                  <p className="text-lg text-gray-600 mb-3">@{user.username}</p>
                )}

                {/* Bio */}
                {user.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>
                )}

                {/* Social Links */}
                <div className="flex items-center gap-4 mb-3">
                  {user.instagramUrl && (
                    <a
                      href={user.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                      <span className="text-sm">Instagram</span>
                    </a>
                  )}
                  {user.youtubeUrl && (
                    <a
                      href={user.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                      <span className="text-sm">YouTube</span>
                    </a>
                  )}
                  {user.portfolioUrl && (
                    <a
                      href={user.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span className="text-sm">Portfolio</span>
                    </a>
                  )}
                </div>

                {/* Joined Date - Smaller and Secondary */}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {joinDate}</span>
                </div>
              </div>

              {/* Settings Button */}
              {isOwnProfile && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings/profile">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Collection Stats */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Collection Statistics
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={collectionsUrl}>
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Total Kits - Prominent Display */}
          <div className="text-center mb-6 pb-6 border-b">
            <div className="text-5xl font-bold text-gray-900 mb-2">{user.collectionStats.total}</div>
            <div className="text-lg font-semibold text-gray-700">Total Kits</div>
          </div>

          {/* Collection Status Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{user.collectionStats.wishlist}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Heart className="w-4 h-4" />
                Wishlist
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{user.collectionStats.preorder}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <ShoppingCart className="w-4 h-4" />
                Preorder
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{user.collectionStats.backlog}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                Backlog
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{user.collectionStats.inProgress}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Hammer className="w-4 h-4" />
                In Progress
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{user.collectionStats.built}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Built
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Builds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Recent Builds
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={buildsUrl}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.recentBuilds.length > 0 ? (
              <div className="space-y-4">
                {user.recentBuilds.map((build) => (
                  <div key={build.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex gap-4">
                      {/* Main Image - Bigger Thumbnail */}
                      <div className="flex-shrink-0">
                        {build.featuredImage ? (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                            <Image
                              src={build.featuredImage.url}
                              alt={build.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : build.kit.boxArt ? (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                            <Image
                              src={build.kit.boxArt}
                              alt={build.kit.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Build Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate mb-1">{build.title}</h3>
                        <p className="text-sm text-gray-600 truncate mb-2">{build.kit.name}</p>

                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {build.kit.productLine?.grade?.name || "Unknown Grade"}
                          </Badge>
                          <Badge
                            variant={build.status === "COMPLETED" ? "default" : "outline"}
                            className="text-xs"
                          >
                            {build.status.replace("_", " ")}
                          </Badge>
                        </div>

                        {/* Milestone Preview Images */}
                        {build.milestones && build.milestones.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {build.milestones.slice(0, 2).map((milestone, index) => {
                              const imageUrl = milestone.imageUrls[0] || milestone.uploads[0]?.upload?.url;
                              return imageUrl ? (
                                <div key={milestone.id} className="relative w-12 h-12 rounded overflow-hidden">
                                  <Image
                                    src={imageUrl}
                                    alt={milestone.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}

                        {/* Engagement Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {build.likes && (
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{build.likes.count}</span>
                            </div>
                          )}
                          {build.comments && (
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{build.comments.count}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* View Button */}
                      <div className="flex-shrink-0">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/builds/${build.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No builds yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Recent Reviews
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={reviewsUrl}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.recentReviews.length > 0 ? (
              <div className="space-y-4">
                {user.recentReviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex gap-4">
                      {/* Kit Image Thumbnail */}
                      <div className="flex-shrink-0">
                        {review.kit.boxArt ? (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                            <Image
                              src={review.kit.boxArt}
                              alt={review.kit.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {review.title || "Untitled Review"}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">{review.kit.name}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{review.overallScore.toFixed(1)}</span>
                          </div>
                        </div>

                        {review.content && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {review.content}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/kits/${review.kit.slug}`}>
                                View Kit
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Link>
                            </Button>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(review.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No reviews yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
