"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Package, ArrowLeft, Clock, CheckCircle, Edit } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

interface BuildDetailPublicViewProps {
  build: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
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

export function BuildDetailPublicView({ build }: BuildDetailPublicViewProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const [milestones] = useState(build.milestones);

  const isOwner = userId === build.user.id;

  const getStatusColor = (status: string) => {
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
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button> */}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{build.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
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

          {build.description && (
            <p className="mt-4 text-gray-700">{build.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Kit Information */}

            {/* Milestones */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Build Milestones</h2>

              {milestones.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">No milestones yet. Check back later!</p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {milestones.map((milestone) => (
                    <Card key={milestone.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {milestone.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {milestone.type.replace("_", " ")}
                            </Badge>
                            {milestone.completedAt && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {milestone.description && (
                        <p className="text-gray-700 mb-4">{milestone.description}</p>
                      )}

                      {/* Images */}
                      {milestone.uploads.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Images</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {milestone.uploads.map((upload) => (
                              <div key={upload.id} className="space-y-2">
                                <div className="relative aspect-square overflow-hidden rounded-lg">
                                  <img
                                    src={upload.upload.eagerUrl || upload.upload.url}
                                    alt={upload.caption || "Milestone image"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {upload.caption && (
                                  <p className="text-sm text-gray-600">{upload.caption}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
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
                        sizes="(max-width: 1024px) 100vw, 25vw"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      <a
                        href={`/kits/${build.kit.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {build.kit.name}
                      </a>
                    </h4>
                    {build.kit.productLine && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Product Line:</span>
                          <span className="font-medium text-sm text-gray-700">
                            {build.kit.productLine.name}
                          </span>
                        </div>
                        {build.kit.productLine.grade && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Grade:</span>
                            <span className="font-medium text-sm text-gray-700">
                              {build.kit.productLine.grade.name}
                            </span>
                          </div>
                        )}
                      </div>
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
