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
  Settings
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { UserProfileData } from "@/lib/actions/users";

interface UserProfilePageProps {
  user: UserProfileData;
  isOwnProfile?: boolean;
}

export function UserProfilePage({ user, isOwnProfile = false }: UserProfilePageProps) {
  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.username || "User";

  const joinDate = format(new Date(user.createdAt), "MMMM yyyy");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
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
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
                {user.username && (
                  <p className="text-lg text-gray-600 mb-2">@{user.username}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {joinDate}</span>
                  </div>
                </div>
              </div>
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
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Collection Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              <div className="text-sm text-gray-600">Preorder</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{user.collectionStats.backlog}</div>
              <div className="text-sm text-gray-600">Backlog</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{user.collectionStats.inProgress}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
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
          <div className="mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{user.collectionStats.total}</div>
              <div className="text-sm text-gray-600">Total Kits</div>
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
                <Link href={`/users/${user.username}/builds`}>
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
                  <div key={build.id} className="flex gap-4 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      {build.featuredImage ? (
                        <Image
                          src={build.featuredImage.url}
                          alt={build.title}
                          width={60}
                          height={60}
                          className="rounded object-cover"
                        />
                      ) : build.kit.boxArt ? (
                        <Image
                          src={build.kit.boxArt}
                          alt={build.kit.name}
                          width={60}
                          height={60}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-15 h-15 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{build.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{build.kit.name}</p>
                      <div className="flex items-center gap-2 mt-1">
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
                    <div className="flex-shrink-0">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/builds/${build.id}`}>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
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
                <Link href={`/users/${user.username}/reviews`}>
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
                  <div key={review.id} className="p-3 border rounded-lg hover:bg-gray-50">
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
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
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
                        {review.feedback && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Heart className="w-3 h-3" />
                            <span>{review.feedback.helpful} helpful</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(review.createdAt), "MMM d, yyyy")}
                      </span>
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
