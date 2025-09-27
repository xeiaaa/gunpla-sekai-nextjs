"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Save, GripVertical } from "lucide-react";
import { MarkdownEditor } from "../ui/markdown-editor";
import { MarkdownRenderer } from "../ui/markdown-renderer";
import MilestoneImageSelector from "../milestone-image-selector";
import { useBuildEdit } from "@/contexts/build-edit";
import { MilestoneType } from "@/generated/prisma";

interface SortableMilestoneItemProps {
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
  reorderMode: boolean;
}

export function SortableMilestoneItem({
  milestone,
  reorderMode,
}: SortableMilestoneItemProps) {
  const {
    editingMilestone,
    setEditingMilestone,
    milestoneForm,
    updateMilestone,
    deleteMilestone,
    updateMilestoneImages,
  } = useBuildEdit();

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
        className={`p-4 ${isDragging ? "shadow-lg" : ""}`}
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

  const handleEditMilestone = () => {
    setEditingMilestone(milestone.id);
    // Set the form values for editing
    milestoneForm.setValue("title", milestone.title);
    milestoneForm.setValue("description", milestone.description || "");
    milestoneForm.setValue("type", milestone.type as MilestoneType);
  };

  const handleSaveMilestone = async () => {
    const formData = milestoneForm.getValues();
    await updateMilestone(milestone.id, formData);
  };

  const handleCancelEditMilestone = () => {
    setEditingMilestone(null);
    milestoneForm.reset(); // Reset the form to default values
  };

  const handleDeleteMilestone = async () => {
    await deleteMilestone(milestone.id);
  };

  const handleImagesChange = async (
    images: Array<{
      id: string;
      uploadId: string;
      url: string;
      eagerUrl?: string | null;
      caption: string;
      order: number;
      milestoneImageId?: string;
    }>
  ) => {
    await updateMilestoneImages(milestone.id, images);
  };

  // Full mode
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-6 ${isDragging ? "shadow-lg" : ""}`}
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
                      value={milestoneForm.watch("type")}
                      onValueChange={(value: MilestoneType) =>
                        milestoneForm.setValue("type", value, {
                          shouldValidate: true,
                        })
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
                        <SelectItem value="PANEL_LINING">
                          Panel Lining
                        </SelectItem>
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
                      {...milestoneForm.register("title")}
                      className={
                        milestoneForm.formState.errors.title
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {milestoneForm.formState.errors.title && (
                      <p className="text-sm text-red-600 mt-1">
                        {milestoneForm.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor={`edit-description-${milestone.id}`}>
                    Description
                  </Label>
                  <MarkdownEditor
                    value={milestoneForm.watch("description") || ""}
                    onChange={(value) =>
                      milestoneForm.setValue("description", value, {
                        shouldValidate: true,
                      })
                    }
                    placeholder="Enter milestone description (optional)... (Markdown supported)"
                    height={150}
                  />
                  {milestoneForm.formState.errors.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {milestoneForm.formState.errors.description.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveMilestone}
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
              onClick={handleEditMilestone}
              className="flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteMilestone}
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
          onImagesChange={handleImagesChange}
          onLoadingChange={() => {}} // No-op since we're not using card-level loading
        />
      </div>
    </Card>
  );
}
