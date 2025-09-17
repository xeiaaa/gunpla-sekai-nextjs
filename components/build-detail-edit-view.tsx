"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import NextImage from "next/image";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Clock, CheckCircle, Plus, Save, Eye, GripVertical, ArrowUpDown, Star, Info, Image, List, Heart, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { deleteBuild, updateBuild } from "@/lib/actions/builds";
import { createMilestone, updateMilestone, deleteMilestone, reorderMilestones, setMilestoneImages } from "@/lib/actions/milestones";
import { MilestoneType } from "@/generated/prisma";
import { FeaturedImageSelector } from "./featured-image-selector";
import BuildMediaLibrary from "./build-media-library";
import MilestoneImageSelector from "./milestone-image-selector";
import { MarkdownEditor } from "./ui/markdown-editor";
import { MarkdownRenderer } from "./ui/markdown-renderer";
import { cn } from "@/lib/utils";
import { LikeButton } from "./like-button";
import { ShareButton } from "./share-button";
import { CommentsSection } from "./comments-section";

// Sortable Milestone Item Component
function SortableMilestoneItem({
  milestone,
  editingMilestone,
  handleDeleteMilestone,
  handleEditMilestone,
  handleSaveMilestone,
  handleCancelEditMilestone,
  editingMilestoneData,
  setEditingMilestoneData,
  reorderMode,
  onImagesChange,
  onLoadingChange
}: {
  milestone: {
    id: string;
    type: string;
    title: string;
    description: string | null;
    completedAt: Date | null;
    order: number;
    buildId?: string;
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
  handleDeleteMilestone: (id: string) => void;
  handleEditMilestone: (id: string) => void;
  handleSaveMilestone: (id: string) => void;
  handleCancelEditMilestone: () => void;
  editingMilestoneData: {
    title: string;
    description: string;
    type: MilestoneType;
  } | null;
  setEditingMilestoneData: (data: {
    title: string;
    description: string;
    type: MilestoneType;
  } | null) => void;
  reorderMode: boolean;
  onImagesChange: (images: Array<{
    id: string;
    uploadId: string;
    url: string;
    eagerUrl?: string | null;
    caption: string;
    order: number;
    milestoneImageId?: string;
  }>) => Promise<void>;
  onLoadingChange: (loading: boolean) => void;
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
                      value={editingMilestoneData?.type || milestone.type}
                      onValueChange={(value: MilestoneType) =>
                        setEditingMilestoneData(editingMilestoneData ? { ...editingMilestoneData, type: value } : null)
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
                      value={editingMilestoneData?.title || milestone.title}
                      onChange={(e) =>
                        setEditingMilestoneData(editingMilestoneData ? { ...editingMilestoneData, title: e.target.value } : null)
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`edit-description-${milestone.id}`}>Description</Label>
                  <MarkdownEditor
                    value={editingMilestoneData?.description || milestone.description || ""}
                    onChange={(value) =>
                      setEditingMilestoneData(editingMilestoneData ? { ...editingMilestoneData, description: value } : null)
                    }
                    placeholder="Enter milestone description (optional)... (Markdown supported)"
                    height={150}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSaveMilestone(milestone.id)}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEditMilestone}
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
        <div className="mb-4">
          <MarkdownRenderer content={milestone.description} />
        </div>
      )}

      {/* Milestone Image Selector */}
      <div className="mb-4">
        <MilestoneImageSelector
          buildId={milestone.buildId || ""}
          milestoneId={milestone.id}
          selectedImages={milestone.uploads.map((upload) => ({
            id: upload.id,
            uploadId: upload.upload.id,
            url: upload.upload.eagerUrl || upload.upload.url,
            eagerUrl: upload.upload.eagerUrl,
            caption: upload.caption || "",
            order: upload.order || 0,
            milestoneImageId: upload.id,
          }))}
          onImagesChange={onImagesChange}
          onLoadingChange={onLoadingChange}
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
    likes: number;
    liked: boolean;
    comments: number;
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
      buildId?: string;
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
  const [milestones, setMilestones] = useState(build.milestones.map(m => ({ ...m, buildId: build.id })));
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [editingMilestoneData, setEditingMilestoneData] = useState<{
    title: string;
    description: string;
    type: MilestoneType;
  } | null>(null);
  const [mediaLibraryCount, setMediaLibraryCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'info' | 'gallery' | 'milestones' | 'social'>('info');

  // Initialize tab from URL parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['info', 'gallery', 'milestones', 'social'].includes(tabParam)) {
      setActiveTab(tabParam as 'info' | 'gallery' | 'milestones' | 'social');
    }
  }, [searchParams]);

  // Handle tab change and update URL
  const handleTabChange = (tabId: 'info' | 'gallery' | 'milestones' | 'social') => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.replaceState({}, '', url.toString());
  };

  const [buildData, setBuildData] = useState({
    title: build.title,
    description: build.description || "",
    status: build.status,
    startedAt: build.startedAt ? format(build.startedAt, "yyyy-MM-dd") : "",
    completedAt: build.completedAt ? format(build.completedAt, "yyyy-MM-dd") : "",
  });

  const [formErrors, setFormErrors] = useState<{
    title?: string;
    startedAt?: string;
    completedAt?: string;
  }>({});

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

  const validateForm = () => {
    const errors: typeof formErrors = {};

    if (!buildData.title.trim()) {
      errors.title = "Title is required";
    }

    if (buildData.startedAt && buildData.completedAt) {
      const startedDate = new Date(buildData.startedAt);
      const completedDate = new Date(buildData.completedAt);
      if (completedDate < startedDate) {
        errors.completedAt = "Completed date cannot be before started date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateBuild = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        title: buildData.title.trim(),
        description: buildData.description.trim() || undefined,
        status: buildData.status as "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD",
        startedAt: buildData.startedAt ? new Date(buildData.startedAt) : null,
        completedAt: buildData.completedAt ? new Date(buildData.completedAt) : null,
      };

      await updateBuild(build.id, updateData);
      setFormErrors({}); // Clear errors on success
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

      setMilestones([...milestones, { ...createdMilestone, buildId: build.id }]);
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


  const handleEditMilestone = (milestoneId: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone) {
      setEditingMilestone(milestoneId);
      setEditingMilestoneData({
        title: milestone.title,
        description: milestone.description || "",
        type: milestone.type as MilestoneType,
      });
      setReorderMode(false); // Exit reorder mode when editing
    }
  };

  const handleSaveMilestone = async (milestoneId: string) => {
    if (!editingMilestoneData) return;

    try {
      const updatedMilestone = await updateMilestone(milestoneId, editingMilestoneData);
      setMilestones(milestones.map(m => m.id === milestoneId ? updatedMilestone : m));
      setEditingMilestone(null);
      setEditingMilestoneData(null);
    } catch (error) {
      console.error("Error updating milestone:", error);
      alert("Failed to update milestone. Please try again.");
    }
  };

  const handleCancelEditMilestone = () => {
    setEditingMilestone(null);
    setEditingMilestoneData(null);
  };


  const handleMilestoneImagesChange = async (milestoneId: string, images: Array<{
    id: string;
    uploadId: string;
    url: string;
    eagerUrl?: string | null;
    caption: string;
    order: number;
    milestoneImageId?: string;
  }>) => {
    try {
      const uploadIds = images.map(img => img.uploadId);
      await setMilestoneImages(milestoneId, uploadIds);

      // Update local state to reflect the changes
      setMilestones(prevMilestones =>
        prevMilestones.map(m =>
          m.id === milestoneId
            ? {
                ...m,
                        uploads: images.map((img, index) => ({
                          id: img.milestoneImageId || img.id,
                          caption: img.caption,
                          order: index,
                          upload: {
                            id: img.uploadId,
                            url: img.url,
                            eagerUrl: img.eagerUrl || null,
                          }
                        }))
              }
            : m
        )
      );
    } catch (error) {
      console.error("Error updating milestone images:", error);
      alert("Failed to update milestone images. Please try again.");
    }
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

  // Tab configuration
  const tabs = [
    { id: 'info' as const, label: 'Build Info', icon: Info },
    { id: 'gallery' as const, label: 'Build Gallery', icon: Image },
    { id: 'milestones' as const, label: 'Build Milestones', icon: List },
    { id: 'social' as const, label: 'Social Engagement', icon: Heart },
  ];

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-6">
            {/* Build Info Form - Always Visible */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Build Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="build-title">Title</Label>
                  <Input
                    id="build-title"
                    value={buildData.title}
                    onChange={(e) => {
                      setBuildData({ ...buildData, title: e.target.value });
                      if (formErrors.title) {
                        setFormErrors({ ...formErrors, title: undefined });
                      }
                    }}
                    className={`text-lg font-semibold ${formErrors.title ? 'border-red-500' : ''}`}
                  />
                  {formErrors.title && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="build-description">Description</Label>
                  <MarkdownEditor
                    value={buildData.description}
                    onChange={(value) => setBuildData({ ...buildData, description: value })}
                    placeholder="Describe your build process, techniques used, or any notes... (Markdown supported)"
                    height={200}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="build-status">Status</Label>
                    <Select
                      value={buildData.status}
                      onValueChange={(value) => {
                        const newBuildData = { ...buildData, status: value };
                        // Clear completed date if status is not COMPLETED
                        if (value !== "COMPLETED") {
                          newBuildData.completedAt = "";
                        }
                        setBuildData(newBuildData);
                        // Clear any completed date errors when status changes
                        if (formErrors.completedAt) {
                          setFormErrors({ ...formErrors, completedAt: undefined });
                        }
                      }}
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
                      onChange={(e) => {
                        setBuildData({ ...buildData, completedAt: e.target.value });
                        if (formErrors.completedAt) {
                          setFormErrors({ ...formErrors, completedAt: undefined });
                        }
                      }}
                      disabled={buildData.status !== "COMPLETED"}
                      className={formErrors.completedAt ? 'border-red-500' : ''}
                    />
                    {formErrors.completedAt && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.completedAt}</p>
                    )}
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
                </div>
              </div>
            </Card>
          </div>
        );
      case 'gallery':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Build Gallery</h2>
              <p className="text-gray-600 mb-6">
                Manage all your build images in one place. Upload, organize, and add captions to your photos.
              </p>
            </div>
            <BuildMediaLibrary
              buildId={build.id}
              showSelection={false}
              featuredImageId={build.featuredImageId}
              onMediaCountChange={setMediaLibraryCount}
            />
          </div>
        );
      case 'milestones':
        return (
          <div className="space-y-6">
            {/* Milestones Section */}
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
                    <MarkdownEditor
                      value={newMilestone.description}
                      onChange={(value) => setNewMilestone({ ...newMilestone, description: value })}
                      placeholder="Enter milestone description (optional)... (Markdown supported)"
                      height={150}
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
                        handleDeleteMilestone={handleDeleteMilestone}
                        handleEditMilestone={handleEditMilestone}
                        handleSaveMilestone={handleSaveMilestone}
                        handleCancelEditMilestone={handleCancelEditMilestone}
                        editingMilestoneData={editingMilestoneData}
                        setEditingMilestoneData={setEditingMilestoneData}
                        reorderMode={reorderMode}
                        onImagesChange={(images) => handleMilestoneImagesChange(milestone.id, images)}
                        onLoadingChange={() => {}} // No-op since we're not using card-level loading
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        );
      case 'social':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Engagement</h2>
              <p className="text-gray-600 mb-6">
                Preview how your build appears to the community and manage social interactions.
              </p>
            </div>

            {/* Social Engagement Preview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Community Preview</h3>
              <div className="space-y-4">
                {/* Build Header with Social Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{build.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span>by {build.user.username || `${build.user.firstName} ${build.user.lastName}`}</span>
                      <span>•</span>
                      <span>{format(build.createdAt, "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <LikeButton 
                      buildId={build.id} 
                      initialLikes={build.likes} 
                      initialLiked={build.liked}
                    />
                    <ShareButton buildId={build.id} buildTitle={build.title} />
                  </div>
                </div>

                {/* Social Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                      <Heart className="h-6 w-6 text-red-500" />
                      {build.likes}
                    </div>
                    <p className="text-sm text-gray-600">Likes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                      <MessageSquare className="h-6 w-6 text-blue-500" />
                      {build.comments}
                    </div>
                    <p className="text-sm text-gray-600">Comments</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Comments Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Comments</h3>
              <CommentsSection buildId={build.id} />
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Tabs */}
            <div className="border-b border-border mb-6">
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Build Stats Card */}
              <Card className="p-5">
                <h3 className="text-lg font-semibold mb-3">Build Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={`${getStatusColor(buildData.status)} flex items-center gap-1`}>
                      {getStatusIcon(buildData.status)}
                      {buildData.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Milestones</span>
                    <span className="font-semibold text-gray-900">{milestones.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Images</span>
                    <span className="font-semibold text-gray-900">
                      {mediaLibraryCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Likes</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      {build.likes}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Comments</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      {build.comments}
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
                  <Button
                    onClick={() => router.push(`/builds/${build.id}`)}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 h-9"
                  >
                    <Eye className="h-4 w-4" />
                    View Public
                  </Button>

                  <FeaturedImageSelector
                    buildId={build.id}
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
                      <NextImage
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
