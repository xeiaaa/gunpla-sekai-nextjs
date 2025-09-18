"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User,
  Star,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Filter,
  SortAsc,
  SortDesc,
  Image as ImageIcon,
  ExternalLink,
  MessageSquare,
  Heart
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { UserProfileData } from "@/lib/actions/users";

interface ReviewWithKit {
  id: string;
  title: string | null;
  content: string | null;
  overallScore: number;
  createdAt: Date;
  updatedAt: Date;
  kit: {
    id: string;
    name: string;
    slug: string | null;
    boxArt: string | null;
  };
  categoryScores: Array<{
    id: string;
    category: string;
    score: number;
    notes: string | null;
    reviewId: string;
  }>;
  feedback?: {
    helpful: number;
    notHelpful: number;
  };
}

interface UserReviewsPageProps {
  user: UserProfileData;
  reviews: ReviewWithKit[];
  isOwnProfile: boolean;
  currentSort: string;
  currentPage: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
];

export function UserReviewsPage({
  user,
  reviews,
  isOwnProfile,
  currentSort,
  currentPage
}: UserReviewsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [sortBy, setSortBy] = useState(currentSort);

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.username || "User";

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("sort", newSort);
      params.delete("page"); // Reset to first page
      router.push(`/users/${user.username}/reviews?${params.toString()}`);
    });
  };

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

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 7) return "Good";
    if (score >= 5) return "Average";
    if (score >= 3) return "Below Average";
    return "Poor";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
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
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{displayName}'s Reviews</h1>
            {user.username && (
              <p className="text-lg text-gray-600">@{user.username}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              {sortBy === "newest" || sortBy === "highest" ? (
                <SortDesc className="w-4 h-4 text-gray-500" />
              ) : (
                <SortAsc className="w-4 h-4 text-gray-500" />
              )}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Kit Image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-gray-100">
                      {review.kit?.boxArt ? (
                        <Image
                          src={review.kit.boxArt}
                          alt={review.kit.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {review.kit?.name || "Unknown Kit"}
                        </h3>
                        {review.title && (
                          <p className="text-sm text-gray-600 mb-2">{review.title}</p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full ${getScoreBgColor(review.overallScore)}`}>
                        <span className={`font-bold ${getScoreColor(review.overallScore)}`}>
                          {review.overallScore}/10
                        </span>
                        <span className="ml-1 text-xs text-gray-600">
                          ({getScoreLabel(Math.round(review.overallScore))})
                        </span>
                      </div>
                    </div>

                    {/* Category Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {review.categoryScores.slice(0, 6).map((score) => (
                        <div key={score.category} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 truncate">
                            {score.category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className={`font-medium ${getScoreColor(score.score)}`}>
                            {score.score}/10
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Review Text */}
                    {review.content && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {review.content}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {format(new Date(review.createdAt), "MMM d, yyyy")}
                            {review.updatedAt.getTime() !== review.createdAt.getTime() && (
                              <span className="ml-1">(edited)</span>
                            )}
                          </span>
                        </div>
                        {review.feedback && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{review.feedback.helpful} helpful</span>
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/kits/${review.kit?.slug || review.kit?.id}`}>
                          View Kit
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-500 mb-4">
              This user hasn't written any reviews yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination would go here when implemented */}
      {reviews.length >= 20 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Showing first 20 reviews. Pagination coming soon!
          </p>
        </div>
      )}
    </div>
  );
}
