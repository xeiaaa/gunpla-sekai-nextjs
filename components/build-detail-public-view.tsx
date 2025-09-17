"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Package, Clock, CheckCircle, Edit } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { MarkdownRenderer } from "./ui/markdown-renderer";

interface BuildDetailPublicViewProps {
  build: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    featuredImageId: string | null;
    featuredImage: {
      id: string;
      url: string;
      eagerUrl: string | null;
    } | null;
    kit: {
      id: string;
      name: string;
      number: string;
      slug: string | null;
      boxArt: string | null;
      productLine: {
        name: string;
        grade: {
          name: string;
        } | null;
      } | null;
      series: {
        name: string;
      } | null;
    };
    user: {
      id: string;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    };
    milestones: Array<{
      id: string;
      type: string;
      title: string;
      description: string | null;
      completedAt: Date | null;
      order: number;
      uploads: Array<{
        id: string;
        caption: string | null;
        order: number | null;
        upload: {
          id: string;
          url: string;
          eagerUrl: string | null;
        };
      }>;
    }>;
  };
}

function getStatusColor(status: string) {
  switch (status) {
    case "PLANNING":
      return "bg-blue-100 text-blue-800";
    case "IN_PROGRESS":
      return "bg-yellow-100 text-yellow-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "ON_HOLD":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "PLANNING":
      return <Package className="h-3 w-3" />;
    case "IN_PROGRESS":
      return <Clock className="h-3 w-3" />;
    case "COMPLETED":
      return <CheckCircle className="h-3 w-3" />;
    case "ON_HOLD":
      return <Clock className="h-3 w-3" />;
    default:
      return <Package className="h-3 w-3" />;
  }
}

export function BuildDetailPublicView({ build }: BuildDetailPublicViewProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const isOwner = userId === build.user.id;
  const milestones = build.milestones.sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Single Blog Card */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              {/* Blog Header */}
              <div className="p-8 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{build.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {build.user.username ? (
                          <Link
                            href={`/users/${build.user.username}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {build.user.firstName} {build.user.lastName}
                            <span className="text-gray-400"> (@{build.user.username})</span>
                          </Link>
                        ) : (
                          <span>{build.user.firstName} {build.user.lastName}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created {format(build.createdAt, "MMM d, yyyy")}</span>
                      </div>
                      {build.startedAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Started {format(build.startedAt, "MMM d, yyyy")}</span>
                        </div>
                      )}
                      {build.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Completed {format(build.completedAt, "MMM d, yyyy")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(build.status)} flex items-center gap-1`}>
                      {getStatusIcon(build.status)}
                      {build.status.replace("_", " ")}
                    </Badge>

                    {isOwner && (
                      <Button
                        onClick={() => router.push(`/builds/${build.id}/edit`)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Build
                      </Button>
                    )}
                  </div>
                </div>

                {/* Build Description */}
                {build.description && (
                  <div className="prose prose-lg max-w-none">
                    <MarkdownRenderer content={build.description} />
                  </div>
                )}

                {/* Featured Image */}
                {build.featuredImage && (
                  <div className="mt-6">
                    <div className="relative w-full max-h-96 rounded-lg overflow-hidden flex justify-center">
                      <Image
                        src={build.featuredImage.eagerUrl || build.featuredImage.url}
                        alt={`Featured image for ${build.title}`}
                        width={800}
                        height={600}
                        className="max-h-96 w-auto object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Blog Content - Milestones as Sections */}
              <div className="p-8">
                {milestones.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No milestones yet. Check back later!</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {milestones.map((milestone) => (
                      <MilestoneSection key={milestone.id} milestone={milestone} />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Build Stats Card */}
              <Card className="p-5">
                <h3 className="text-lg font-semibold mb-3">Build Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Milestones</span>
                    <span className="font-semibold text-gray-900">{milestones.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-semibold text-gray-900">
                      {milestones.filter(m => m.completedAt).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Images</span>
                    <span className="font-semibold text-gray-900">
                      {milestones.reduce((total, milestone) => total + milestone.uploads.length, 0)}
                    </span>
                  </div>
                  {build.startedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Started</span>
                      <span className="font-medium text-sm text-gray-700">
                        {format(build.startedAt, "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  {build.completedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="font-medium text-sm text-gray-700">
                        {format(build.completedAt, "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Kit Information Card */}
              <Card className="p-5">
                <h3 className="text-lg font-semibold mb-3">Kit Information</h3>
                <div className="space-y-3">
                  {build.kit.boxArt && (
                    <div className="relative aspect-square w-full">
                      <Image
                        src={build.kit.boxArt}
                        alt={`${build.kit.name} box art`}
                        fill
                        className="object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{build.kit.name}</h4>
                    <p className="text-sm text-gray-600">#{build.kit.number}</p>
                    {build.kit.productLine && (
                      <p className="text-sm text-gray-600">
                        {build.kit.productLine.name}
                        {build.kit.productLine.grade && ` - ${build.kit.productLine.grade.name}`}
                      </p>
                    )}
                    {build.kit.series && (
                      <p className="text-sm text-gray-600">{build.kit.series.name}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Milestone Section Component with Image Gallery
function MilestoneSection({ milestone }: {
  milestone: {
    id: string;
    type: string;
    title: string;
    description: string | null;
    completedAt: Date | null;
    order: number;
    uploads: Array<{
      id: string;
      caption: string | null;
      order: number | null;
      upload: {
        id: string;
        url: string;
        eagerUrl: string | null;
      };
    }>;
  }
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div className="border-b border-gray-200 pb-12 last:border-b-0 last:pb-0">
      {/* Milestone Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{milestone.title}</h2>
          <Badge variant="outline" className="text-xs">
            {milestone.type.replace("_", " ")}
          </Badge>
        </div>
        {milestone.completedAt && (
          <p className="text-sm text-gray-500">
            Completed at {format(milestone.completedAt, "MMM d, yyyy")}
          </p>
        )}
      </div>

      {/* Milestone Description */}
      {milestone.description && (
        <div className="mb-6">
          <MarkdownRenderer content={milestone.description} />
        </div>
      )}

      {/* Image Gallery */}
      {milestone.uploads.length > 0 && (
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative w-full max-h-96 rounded-lg overflow-hidden flex justify-center">
            <Image
              src={milestone.uploads[selectedImageIndex].upload.eagerUrl || milestone.uploads[selectedImageIndex].upload.url}
              alt={milestone.uploads[selectedImageIndex].caption || "Milestone image"}
              width={800}
              height={600}
              className="max-h-96 w-auto object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
          </div>

          {/* Thumbnail Carousel */}
          {milestone.uploads.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {milestone.uploads.map((upload, index: number) => (
                <button
                  key={upload.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 relative w-24 h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index
                      ? 'border-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={upload.upload.eagerUrl || upload.upload.url}
                    alt={upload.caption || "Milestone image"}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Image Captions */}
          {milestone.uploads[selectedImageIndex].caption && (
            <p className="text-sm text-gray-600">
              {milestone.uploads[selectedImageIndex].caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}