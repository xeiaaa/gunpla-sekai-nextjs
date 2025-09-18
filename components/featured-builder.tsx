"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Trophy, Award, Calendar } from "lucide-react";
import Link from "next/link";

export default function FeaturedBuilder() {
  // Mock data for featured builder
  const featuredBuilder = {
    id: "1",
    username: "gunpla_master",
    firstName: "Alex",
    lastName: "Chen",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    bio: "Master builder with 5+ years of experience. Specializes in custom paint jobs and weathering techniques.",
    stats: {
      totalBuilds: 47,
      completedBuilds: 42,
      likes: 1250,
      joinDate: "2020-03-15"
    },
    achievements: ["Master Builder", "Weathering Expert", "Community Leader"],
    recentBuild: {
      id: "build-123",
      title: "Custom RX-78-2 Gundam with Battle Damage",
      imageUrl: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      kitName: "RX-78-2 Gundam Ver. 3.0",
      status: "COMPLETED"
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Builder</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet our community&apos;s most talented builders and get inspired by their incredible work
          </p>
        </div>

        <Card className="max-w-4xl mx-auto overflow-hidden p-0">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Builder Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                    <AvatarImage src={featuredBuilder.imageUrl} alt={featuredBuilder.username} />
                    <AvatarFallback className="text-lg font-semibold">
                      {featuredBuilder.firstName[0]}{featuredBuilder.lastName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {featuredBuilder.firstName} {featuredBuilder.lastName}
                      </h3>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">@{featuredBuilder.username}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {featuredBuilder.bio}
                    </p>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Trophy className="w-4 h-4 mr-2" />
                    Achievements
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {featuredBuilder.achievements.map((achievement, index) => (
                      <Badge key={index} variant="outline" className="bg-white/50">
                        <Award className="w-3 h-3 mr-1" />
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center bg-white/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">{featuredBuilder.stats.totalBuilds}</div>
                    <div className="text-xs text-gray-600">Total Builds</div>
                  </div>
                  <div className="text-center bg-white/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">{featuredBuilder.stats.completedBuilds}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="text-center bg-white/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600">{featuredBuilder.stats.likes}</div>
                    <div className="text-xs text-gray-600">Likes</div>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/users/${featuredBuilder.username}`}>
                    View Profile
                  </Link>
                </Button>
              </div>

              {/* Recent Build */}
              <div className="p-8">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Latest Build</h4>
                  <p className="text-sm text-gray-600">Most recent creation</p>
                </div>

                <div className="relative rounded-lg overflow-hidden mb-4">
                  <img
                    src={featuredBuilder.recentBuild.imageUrl}
                    alt={featuredBuilder.recentBuild.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-100 text-green-800">
                      {featuredBuilder.recentBuild.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-900 line-clamp-2">
                    {featuredBuilder.recentBuild.title}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {featuredBuilder.recentBuild.kitName}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Completed 2 days ago</span>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/builds/${featuredBuilder.recentBuild.id}`}>
                        View Build
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
