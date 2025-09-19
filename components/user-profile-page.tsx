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
  ArrowRight,
  Settings,
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
  CheckCircle
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
  const reviewsUrl = routeContext === 'me' ? '/me/reviews' : `/users/${user.username}/reviews`;
  const collectionsUrl = routeContext === 'me' ? '/me/collections' : `/users/${user.username}/collections`;

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
                    <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
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
                  {(user.instagramUrl || user.youtubeUrl || user.portfolioUrl) && (
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
                    <Card key={build.id} className="overflow-hidden">
                      {/* Build Header */}
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
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
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                        <h3 className="font-semibold text-lg mt-2">{build.title}</h3>
                        <p className="text-gray-600">{build.kit.name}</p>
                      </div>

                      {/* Featured Image */}
                      {build.featuredImage && (
                        <div className="relative aspect-video">
                          <Image
                            src={build.featuredImage.url}
                            alt={build.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Milestone Gallery */}
                      {build.milestones && build.milestones.length > 0 && (
                        <div className="p-4">
                          <div className="grid grid-cols-4 gap-2">
                            {build.milestones.slice(0, 4).map((milestone) => {
                              const imageUrl = milestone.imageUrls[0] || milestone.uploads[0]?.upload?.url;
                              return imageUrl ? (
                                <div key={milestone.id} className="relative aspect-square rounded overflow-hidden">
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
                        </div>
                      )}

                      {/* Engagement Actions */}
                      <div className="p-4 border-t">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <ThumbsUp className="w-4 h-4" />
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
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/builds/${build.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No builds yet</h3>
                    <p className="text-gray-600 mb-4">Start building to share your progress with the community!</p>
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
                  Collection{user.collectionStats.total > 0 ? ` (${user.collectionStats.total} Kits)` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.collectionStats.total === 0 ? (
                  /* Empty State */
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <div className="text-gray-500 text-sm mb-2">No kits in collection yet</div>
                  </div>
                ) : (
                  <>
                    {/* Horizontal Collection Stats */}
                    <div className="flex justify-between items-center text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Heart className="w-5 h-5 text-red-500" />
                        <div className="text-lg font-semibold">{user.collectionStats.wishlist}</div>
                        <div className="text-xs text-gray-500">Wishlist</div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <ShoppingCart className="w-5 h-5 text-purple-500" />
                        <div className="text-lg font-semibold">{user.collectionStats.preorder}</div>
                        <div className="text-xs text-gray-500">Preorder</div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Package className="w-5 h-5 text-blue-500" />
                        <div className="text-lg font-semibold">{user.collectionStats.backlog}</div>
                        <div className="text-xs text-gray-500">Backlog</div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Wrench className="w-5 h-5 text-orange-500" />
                        <div className="text-lg font-semibold">{user.collectionStats.inProgress}</div>
                        <div className="text-xs text-gray-500">In Progress</div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div className="text-lg font-semibold">{user.collectionStats.built}</div>
                        <div className="text-xs text-gray-500">Built</div>
                      </div>
                    </div>

                    {/* Completion Rate */}
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        Built {user.collectionStats.built} / {user.collectionStats.total} ({Math.round((user.collectionStats.built / user.collectionStats.total) * 100)}%)
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(user.collectionStats.built / user.collectionStats.total) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Completion Rate</div>
                    </div>


                    <Button variant="ghost" size="sm" asChild className="w-full">
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
                      <div key={review.id} className="flex gap-3">
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
                          <p className="text-sm font-medium truncate">{review.kit.name}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">{review.overallScore.toFixed(1)}</span>
                          </div>
                          {review.content && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                              {review.content}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" asChild className="w-full mt-3">
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
    </div>
  );
}
