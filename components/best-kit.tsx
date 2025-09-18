"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, ShoppingCart, Heart, MessageSquare, Award, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function BestKit() {
  // Mock data for best kit based on reviews
  const bestKit = {
    id: "kit-best-001",
    name: "RX-78-2 Gundam Ver. 3.0",
    slug: "rx-78-2-gundam-ver-3-0",
    boxArt: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    grade: {
      name: "Master Grade",
      abbreviation: "MG"
    },
    series: {
      name: "Mobile Suit Gundam"
    },
    productLine: {
      name: "Gundam The Origin"
    },
    price: 4500,
    currency: "JPY",
    rating: {
      average: 4.8,
      count: 127
    },
    stats: {
      totalReviews: 127,
      totalBuilds: 89,
      totalLikes: 2340,
      completionRate: 94
    },
    features: [
      "Detailed inner frame",
      "Multiple weapon options",
      "Excellent articulation",
      "High-quality decals",
      "LED-compatible"
    ],
    tags: ["Beginner Friendly", "Highly Detailed", "Great Articulation", "Classic Design"],
    releaseDate: "2023-08-15",
    inStock: true
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
            ? "text-yellow-400 fill-current opacity-50"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-yellow-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Best Kit of the Month</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Based on community reviews and ratings, this is our most highly recommended kit
          </p>
        </div>

        <Card className="max-w-4xl mx-auto overflow-hidden shadow-xl p-0">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Kit Image */}
            <div className="relative">
              <div className="relative h-96 lg:h-full min-h-[500px]">
                <img
                  src={bestKit.boxArt}
                  alt={bestKit.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                {/* Best Kit Badge */}
                <div className="absolute top-6 left-6">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Best Kit
                  </Badge>
                </div>

                {/* Stock Status */}
                <div className="absolute top-6 right-6">
                  <Badge className={`${bestKit.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {bestKit.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-6 left-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
                    <div className="text-2xl font-bold text-gray-900">
                      ¥{bestKit.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">MSRP</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kit Details */}
            <div className="p-8 lg:p-12">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {bestKit.grade.abbreviation}
                    </Badge>
                    <Badge variant="outline">
                      {bestKit.series.name}
                    </Badge>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {bestKit.name}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {bestKit.productLine.name} • Released {new Date(bestKit.releaseDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(bestKit.rating.average)}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {bestKit.rating.average}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({bestKit.rating.count} reviews)
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-600">{bestKit.stats.totalReviews}</div>
                    <div className="text-xs text-gray-600">Reviews</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Heart className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-green-600">{bestKit.stats.totalBuilds}</div>
                    <div className="text-xs text-gray-600">Builds</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-purple-600">{bestKit.stats.completionRate}%</div>
                    <div className="text-xs text-gray-600">Complete</div>
                  </div>
                </div>

                {/* Features */}
                {/* <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {bestKit.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div> */}

                {/* Tags */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {bestKit.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Completion Rate */}
                {/* <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Community Completion Rate</span>
                    <span className="text-sm font-bold text-green-600">{bestKit.stats.completionRate}%</span>
                  </div>
                  <Progress value={bestKit.stats.completionRate} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {bestKit.stats.totalBuilds} out of {Math.round(bestKit.stats.totalBuilds / (bestKit.stats.completionRate / 100))} builders completed this kit
                  </p>
                </div> */}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button asChild className="flex-1" size="lg">
                    <Link href={`/kits/${bestKit.slug}`}>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      View Kit Details
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="flex-1" size="lg">
                    <Link href={`/kits/${bestKit.slug}/reviews`}>
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Read Reviews
                    </Link>
                  </Button>
                </div>

                {/* Community Stats */}
                <div className="pt-4 border-t bg-gray-50 -mx-8 -mb-8 px-8 pb-8">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Community Consensus</p>
                    <div className="flex items-center justify-center space-x-6 text-sm">
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-red-500 mr-1" />
                        <span className="font-medium">{bestKit.stats.totalLikes} likes</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="font-medium">{bestKit.stats.totalReviews} reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
