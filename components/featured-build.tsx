"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star, Heart, MessageSquare, Eye, Calendar, User } from "lucide-react";
import Link from "next/link";

export default function FeaturedBuild() {
  // Mock data for featured build
  const featuredBuild = {
    id: "featured-build-001",
    title: "Custom PG RX-0 Unicorn Gundam - Perfect Destroy Mode",
    description: "A stunning custom build featuring extensive LED modifications, custom decals, and advanced weathering techniques. This Perfect Grade Unicorn showcases the builder's mastery of electronics integration and detailed painting.",
    status: "COMPLETED",
    progress: 100,
    kit: {
      name: "RX-0 Unicorn Gundam Perfect Grade",
      grade: "PG",
      series: "Mobile Suit Gundam Unicorn"
    },
    builder: {
      username: "led_master_gunpla",
      firstName: "Sarah",
      lastName: "Kim",
      imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    stats: {
      likes: 342,
      comments: 89,
      views: 2150,
      milestones: 12
    },
    images: [
      "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["LED Modifications", "Custom Decals", "Weathering", "Perfect Grade", "Electronics"],
    createdAt: "2024-01-15T10:30:00Z",
    completedAt: "2024-01-20T16:45:00Z"
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Build</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover exceptional builds that showcase the incredible talent and creativity of our community
          </p>
        </div>

        <Card className="max-w-6xl mx-auto overflow-hidden shadow-xl p-0">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Image Gallery */}
            <div className="relative">
              <div className="relative h-96 lg:h-full min-h-[500px]">
                <img
                  src={featuredBuild.images[0]}
                  alt={featuredBuild.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Featured Badge */}
                <div className="absolute top-6 left-6">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Featured Build
                  </Badge>
                </div>

                {/* Progress Indicator */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Build Progress</span>
                      <span className="text-sm font-bold text-green-600">{featuredBuild.progress}%</span>
                    </div>
                    <Progress value={featuredBuild.progress} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Build Details */}
            <div className="p-8 lg:p-12">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {featuredBuild.kit.grade}
                    </Badge>
                    <Badge variant="outline">
                      {featuredBuild.kit.series}
                    </Badge>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                    {featuredBuild.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {featuredBuild.description}
                  </p>
                </div>

                {/* Builder Info */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={featuredBuild.builder.imageUrl} alt={featuredBuild.builder.username} />
                    <AvatarFallback>
                      {featuredBuild.builder.firstName[0]}{featuredBuild.builder.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {featuredBuild.builder.firstName} {featuredBuild.builder.lastName}
                    </p>
                    <p className="text-sm text-gray-600">@{featuredBuild.builder.username}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/users/${featuredBuild.builder.username}`}>
                      <User className="w-4 h-4 mr-1" />
                      View Profile
                    </Link>
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-red-600">{featuredBuild.stats.likes}</div>
                    <div className="text-xs text-gray-600">Likes</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-600">{featuredBuild.stats.comments}</div>
                    <div className="text-xs text-gray-600">Comments</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Eye className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-green-600">{featuredBuild.stats.views}</div>
                    <div className="text-xs text-gray-600">Views</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-purple-600">{featuredBuild.stats.milestones}</div>
                    <div className="text-xs text-gray-600">Milestones</div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Techniques Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {featuredBuild.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Started: Jan 15, 2024</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Completed: Jan 20, 2024</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button asChild className="w-full" size="lg">
                  <Link href={`/builds/${featuredBuild.id}`}>
                    View Full Build
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
