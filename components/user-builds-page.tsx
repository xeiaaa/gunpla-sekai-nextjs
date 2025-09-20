"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnhancedBuildCard } from "@/components/enhanced-build-card";
import {
  User,
  Package,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Filter,
  SortAsc,
  SortDesc,
  Image as ImageIcon,
  Clock,
  CheckCircle,
  PlayCircle,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { UserProfileData } from "@/lib/actions/users";

interface Build {
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
  };
}

interface UserBuildsPageProps {
  user: UserProfileData;
  builds: Build[];
  isOwnProfile: boolean;
  currentStatus?: string;
  currentSort: string;
  currentPage: number;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "PLANNING", label: "Planning" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "completed", label: "Recently Completed" },
  { value: "status", label: "By Status" },
];

export function UserBuildsPage({
  user,
  builds,
  isOwnProfile,
  currentStatus,
  currentSort,
  currentPage,
}: UserBuildsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState(currentStatus || "all");
  const [sortBy, setSortBy] = useState(currentSort);

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username || "User";

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (newStatus && newStatus !== "all") {
        params.set("status", newStatus);
      } else {
        params.delete("status");
      }
      params.delete("page"); // Reset to first page
      router.push(`/users/${user.username}/builds?${params.toString()}`);
    });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("sort", newSort);
      params.delete("page"); // Reset to first page
      router.push(`/users/${user.username}/builds?${params.toString()}`);
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "IN_PROGRESS":
        return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case "ON_HOLD":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      case "ON_HOLD":
        return "outline";
      default:
        return "outline";
    }
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
                  style={{ borderRadius: "50%" }}
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {displayName}&apos;s Builds
            </h1>
            {user.username && (
              <p className="text-lg text-gray-600">@{user.username}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {builds.length} build{builds.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {sortBy === "newest" || sortBy === "completed" ? (
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

      {/* Builds Grid */}
      {builds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {builds.map((build) => (
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
              variant="grid"
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No builds found
            </h3>
            <p className="text-gray-500 mb-4">
              {statusFilter && statusFilter !== "all"
                ? `No builds found with status "${
                    STATUS_OPTIONS.find((opt) => opt.value === statusFilter)
                      ?.label
                  }"`
                : "This user hasn't created any builds yet."}
            </p>
            {statusFilter && statusFilter !== "all" && (
              <Button
                variant="outline"
                onClick={() => handleFilterChange("all")}
              >
                Clear Filter
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination would go here when implemented */}
      {builds.length >= 20 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Showing first 20 builds. Pagination coming soon!
          </p>
        </div>
      )}
    </div>
  );
}
