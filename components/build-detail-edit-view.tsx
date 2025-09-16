"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, Edit, Trash2, Clock, CheckCircle, Plus, Save, Eye, GripVertical, ArrowUpDown, Star } from "lucide-react";
import { format } from "date-fns";
import { deleteBuild, updateBuild } from "@/lib/actions/builds";
import { createMilestone, updateMilestone, deleteMilestone, reorderMilestones } from "@/lib/actions/milestones";
import { MilestoneType } from "@/generated/prisma";
import BuildMilestoneUpload from "./build-milestone-upload";
import { FeaturedImageSelector } from "./featured-image-selector";

// Sortable Milestone Item Component
function SortableMilestoneItem({
  milestone,
  editingMilestone,
  setEditingMilestone,
  handleUpdateMilestone,
  handleDeleteMilestone,
  handleEditMilestone,
  onImageAdded,
  onImageRemoved,
  onCaptionChange,
  reorderMode
}: {
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
  };
  editingMilestone: string | null;
  setEditingMilestone: (id: string | null) => void;
  handleUpdateMilestone: (id: string, updates: { title?: string; description?: string; type?: MilestoneType }) => void;
  handleDeleteMilestone: (id: string) => void;
  handleEditMilestone: (id: string) => void;
  onImageAdded: (milestoneId: string, newImage: { id: string; caption: string; order: number; uploadId?: string; url: string }) => void;
  onImageRemoved: (milestoneId: string, imageId: string) => void;
  onCaptionChange: (milestoneId: string, imageId: string, caption: string) => void;
  reorderMode: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Compact reorder mode
  if (reorderMode) {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        className={`p-4 ${isDragging ? 'shadow-lg' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex-1">
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
      </Card>
    );
  }

  // Full mode
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-6 ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {reorderMode && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            {editingMilestone === milestone.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`edit-type-${milestone.id}`}>Type</Label>
                    <Select
                      value={milestone.type}
                      onValueChange={(value: MilestoneType) =>
                        handleUpdateMilestone(milestone.id, { type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACQUISITION">Acquisition</SelectItem>
                        <SelectItem value="PLANNING">Planning</SelectItem>
                        <SelectItem value="BUILD">Build</SelectItem>
                        <SelectItem value="PAINTING">Painting</SelectItem>
                        <SelectItem value="PANEL_LINING">Panel Lining</SelectItem>
                        <SelectItem value="DECALS">Decals</SelectItem>
                        <SelectItem value="TOPCOAT">Topcoat</SelectItem>
                        <SelectItem value="PHOTOGRAPHY">Photography</SelectItem>
                        <SelectItem value="COMPLETION">Completion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`edit-title-${milestone.id}`}>Title</Label>
                    <Input
                      id={`edit-title-${milestone.id}`}
                      value={milestone.title}
                      onChange={(e) =>
                        handleUpdateMilestone(milestone.id, { title: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`edit-description-${milestone.id}`}>Description</Label>
                  <Textarea
                    id={`edit-description-${milestone.id}`}
                    value={milestone.description || ""}
                    onChange={(e) =>
                      handleUpdateMilestone(milestone.id, { description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setEditingMilestone(null)}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingMilestone(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
        {editingMilestone !== milestone.id && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditMilestone(milestone.id)}
              className="flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteMilestone(milestone.id)}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {milestone.description && (
        <p className="text-gray-700 mb-4">{milestone.description}</p>
      )}

      {/* Image Upload Component */}
      <div className="mb-4">
        <BuildMilestoneUpload
          milestoneId={milestone.id}
          existingImages={milestone.uploads.map((upload) => ({
            id: upload.id,
            url: upload.upload.eagerUrl || upload.upload.url,
            caption: upload.caption || "",
            order: upload.order || 0,
            uploadId: upload.upload.id,
            buildMilestoneUploadId: upload.id,
          }))}
          isTemporary={false}
          onImageAdded={(newImage) => {
            onImageAdded(milestone.id, newImage);
          }}
          onImageRemoved={(imageId) => {
            onImageRemoved(milestone.id, imageId);
          }}
          onCaptionChange={(imageId, caption) => {
            onCaptionChange(milestone.id, imageId, caption);
          }}
        />
      </div>
    </Card>
  );
}

interface BuildDetailEditViewProps {
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

export function BuildDetailEditView({ build }: BuildDetailEditViewProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const [milestones, setMilestones] = useState(build.milestones);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingBuild, setEditingBuild] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [buildData, setBuildData] = useState({
    title: build.title,
    description: build.description || "",
    status: build.status,
    startedAt: build.startedAt ? format(build.startedAt, "yyyy-MM-dd") : "",
    completedAt: build.completedAt ? format(build.completedAt, "yyyy-MM-dd") : "",
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // New milestone form state
  const [newMilestone, setNewMilestone] = useState<{
    type: MilestoneType;
    title: string;
    description: string;
  }>({
    type: MilestoneType.BUILD,
    title: "",
    description: "",
  });

  // Check ownership and redirect if not owner
  useEffect(() => {
    if (userId && userId !== build.user.id) {
      router.push(`/builds/${build.id}`);
    }
  }, [userId, build.user.id, build.id, router]);

  // Show loading if user is not authenticated yet
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not owner (this will be handled by useEffect, but show loading while redirecting)
  if (userId !== build.user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this build? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteBuild(build.id);
      router.push("/");
    } catch (error) {
      console.error("Error deleting build:", error);
      alert("Failed to delete build. Please try again.");
    }
  };

  const handleUpdateBuild = async () => {
    try {
      setLoading(true);
      const updateData = {
        title: buildData.title,
        description: buildData.description || undefined,
        status: buildData.status as "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD",
        startedAt: buildData.startedAt ? new Date(buildData.startedAt) : null,
        completedAt: buildData.completedAt ? new Date(buildData.completedAt) : null,
      };

      await updateBuild(build.id, updateData);
      setEditingBuild(false);
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Error updating build:", error);
      alert("Failed to update build. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeaturedImage = async (uploadId: string | null) => {
    try {
      setLoading(true);
      await updateBuild(build.id, { featuredImageId: uploadId });
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Error updating featured image:", error);
      alert("Failed to update featured image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.title.trim()) {
      alert("Please enter a milestone title");
      return;
    }

    try {
      setLoading(true);
      const createdMilestone = await createMilestone({
        buildId: build.id,
        type: newMilestone.type,
        title: newMilestone.title.trim(),
        description: newMilestone.description.trim() || undefined,
        order: milestones.length + 1,
      });

      setMilestones([...milestones, createdMilestone]);
      setNewMilestone({ type: MilestoneType.BUILD, title: "", description: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error creating milestone:", error);
      alert("Failed to create milestone. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) {
      return;
    }

    try {
      await deleteMilestone(milestoneId);
      setMilestones(milestones.filter(m => m.id !== milestoneId));
    } catch (error) {
      console.error("Error deleting milestone:", error);
      alert("Failed to delete milestone. Please try again.");
    }
  };

  const handleUpdateMilestone = async (milestoneId: string, updates: { title?: string; description?: string; type?: MilestoneType }) => {
    try {
      const updatedMilestone = await updateMilestone(milestoneId, updates);
      setMilestones(milestones.map(m => m.id === milestoneId ? updatedMilestone : m));
      setEditingMilestone(null);
    } catch (error) {
      console.error("Error updating milestone:", error);
      alert("Failed to update milestone. Please try again.");
    }
  };

  const handleEditMilestone = (milestoneId: string) => {
    setEditingMilestone(milestoneId);
    setReorderMode(false); // Exit reorder mode when editing
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = milestones.findIndex((milestone) => milestone.id === active.id);
      const newIndex = milestones.findIndex((milestone) => milestone.id === over.id);

      // Update local state immediately for responsive UI
      const newMilestones = arrayMove(milestones, oldIndex, newIndex);
      setMilestones(newMilestones);

      // Update order in database
      try {
        const milestoneIds = newMilestones.map(milestone => milestone.id);
        await reorderMilestones(build.id, milestoneIds);
      } catch (error) {
        console.error("Error reordering milestones:", error);
        // Revert local state on error
        setMilestones(milestones);
        alert("Failed to reorder milestones. Please try again.");
      }
    }
  };

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
            <div className="flex-1">
              {editingBuild ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="build-title">Title</Label>
                    <Input
                      id="build-title"
                      value={buildData.title}
                      onChange={(e) => setBuildData({ ...buildData, title: e.target.value })}
                      className="text-2xl font-bold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="build-description">Description</Label>
                    <Textarea
                      id="build-description"
                      value={buildData.description}
                      onChange={(e) => setBuildData({ ...buildData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="build-status">Status</Label>
                      <Select
                        value={buildData.status}
                        onValueChange={(value) => setBuildData({ ...buildData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLANNING">Planning</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="ON_HOLD">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="build-started">Started Date</Label>
                      <Input
                        id="build-started"
                        type="date"
                        value={buildData.startedAt}
                        onChange={(e) => setBuildData({ ...buildData, startedAt: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="build-completed">Completed Date</Label>
                      <Input
                        id="build-completed"
                        type="date"
                        value={buildData.completedAt}
                        onChange={(e) => setBuildData({ ...buildData, completedAt: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateBuild}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingBuild(false);
                        setBuildData({
                          title: build.title,
                          description: build.description || "",
                          status: build.status,
                          startedAt: build.startedAt ? format(build.startedAt, "yyyy-MM-dd") : "",
                          completedAt: build.completedAt ? format(build.completedAt, "yyyy-MM-dd") : "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{buildData.title}</h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{build.user.firstName} {build.user.lastName}</span>
                      {build.user.username && (
                        <span className="text-gray-400">(@{build.user.username})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Started {format(build.createdAt, "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  {buildData.description && (
                    <p className="mt-4 text-gray-700">{buildData.description}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Badge className={`${getStatusColor(buildData.status)} flex items-center gap-1`}>
                {getStatusIcon(buildData.status)}
                {buildData.status.replace("_", " ")}
              </Badge>

              <Button
                onClick={() => router.push(`/builds/${build.id}`)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Public
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Kit Information */}


            {/* Milestones */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Build Milestones</h2>
                <div className="flex gap-2">
                  {milestones.length > 1 && (
                    <Button
                      onClick={() => setReorderMode(!reorderMode)}
                      variant={reorderMode ? "destructive" : "outline"}
                      className="flex items-center gap-2"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      {reorderMode ? "Exit Reordering" : "Reorder"}
                    </Button>
                  )}
                  {!reorderMode && (
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Milestone
                    </Button>
                  )}
                </div>
              </div>

              {/* Add Milestone Form */}
              {showAddForm && !reorderMode && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Add New Milestone</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="milestone-type">Type</Label>
                        <Select
                          value={newMilestone.type}
                          onValueChange={(value: MilestoneType) => setNewMilestone({ ...newMilestone, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={MilestoneType.ACQUISITION}>Acquisition</SelectItem>
                            <SelectItem value={MilestoneType.PLANNING}>Planning</SelectItem>
                            <SelectItem value={MilestoneType.BUILD}>Build</SelectItem>
                            <SelectItem value={MilestoneType.PAINTING}>Painting</SelectItem>
                            <SelectItem value={MilestoneType.PANEL_LINING}>Panel Lining</SelectItem>
                            <SelectItem value={MilestoneType.DECALS}>Decals</SelectItem>
                            <SelectItem value={MilestoneType.TOPCOAT}>Topcoat</SelectItem>
                            <SelectItem value={MilestoneType.PHOTOGRAPHY}>Photography</SelectItem>
                            <SelectItem value={MilestoneType.COMPLETION}>Completion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="milestone-title">Title</Label>
                        <Input
                          id="milestone-title"
                          value={newMilestone.title}
                          onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                          placeholder="Enter milestone title"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="milestone-description">Description</Label>
                      <Textarea
                        id="milestone-description"
                        value={newMilestone.description}
                        onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                        placeholder="Enter milestone description (optional)"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddMilestone}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Add Milestone
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false);
                          setNewMilestone({ type: MilestoneType.BUILD, title: "", description: "" });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Milestones List */}
              {milestones.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">No milestones yet. Add your first milestone to get started!</p>
                </Card>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={milestones.map(m => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-6">
                      {milestones.map((milestone) => (
                        <SortableMilestoneItem
                          key={milestone.id}
                          milestone={milestone}
                          editingMilestone={editingMilestone}
                          setEditingMilestone={setEditingMilestone}
                          handleUpdateMilestone={handleUpdateMilestone}
                          handleDeleteMilestone={handleDeleteMilestone}
                          handleEditMilestone={handleEditMilestone}
                          reorderMode={reorderMode}
                          onImageAdded={(milestoneId, newImage) => {
                            setMilestones(prevMilestones =>
                              prevMilestones.map(m =>
                                m.id === milestoneId
                                  ? {
                                      ...m,
                                      uploads: [...m.uploads, {
                                        id: newImage.id,
                                        caption: newImage.caption,
                                        order: newImage.order,
                                        upload: {
                                          id: newImage.uploadId || "",
                                          url: newImage.url,
                                          eagerUrl: newImage.url,
                                        }
                                      }]
                                    }
                                  : m
                              )
                            );
                          }}
                          onImageRemoved={(milestoneId, imageId) => {
                            setMilestones(prevMilestones =>
                              prevMilestones.map(m =>
                                m.id === milestoneId
                                  ? {
                                      ...m,
                                      uploads: m.uploads.filter(upload => upload.id !== imageId)
                                    }
                                  : m
                              )
                            );
                          }}
                          onCaptionChange={(milestoneId, imageId, caption) => {
                            setMilestones(prevMilestones =>
                              prevMilestones.map(m =>
                                m.id === milestoneId
                                  ? {
                                      ...m,
                                      uploads: m.uploads.map(upload =>
                                        upload.id === imageId
                                          ? { ...upload, caption }
                                          : upload
                                      )
                                    }
                                  : m
                              )
                            );
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
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
                    <span className="text-sm text-gray-600">Images</span>
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

              {/* Build Actions Card */}
              <Card className="p-5">
                <h3 className="text-lg font-semibold mb-3">Build Actions</h3>
                <div className="space-y-2">
                  {!editingBuild && (
                    <>
                      <FeaturedImageSelector
                        milestones={milestones}
                        currentFeaturedImageId={build.featuredImageId}
                        onSelect={handleUpdateFeaturedImage}
                      >
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2 h-9"
                        >
                          <Star className="h-4 w-4" />
                          Select Featured Image
                        </Button>
                      </FeaturedImageSelector>

                      <Button
                        onClick={() => setEditingBuild(true)}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 h-9"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Build Info
                      </Button>
                    </>
                  )}

                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    className="w-full flex items-center justify-center gap-2 h-9"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Build
                  </Button>
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
