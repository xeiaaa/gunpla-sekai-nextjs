"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ArrowUpDown } from "lucide-react";
import { MarkdownEditor } from "../ui/markdown-editor";
import { SortableMilestoneItem } from "./sortable-milestone-item";
import { useBuildEdit, MilestoneFormData } from "@/contexts/build-edit";
import { MilestoneType } from "@/generated/prisma";

export function MilestonesTab() {
  const {
    buildData,
    reorderMode,
    setReorderMode,
    showAddForm,
    setShowAddForm,
    milestoneForm,
    addMilestone,
    reorderMilestones,
  } = useBuildEdit();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!buildData) return null;

  const milestones = buildData.milestones;

  const onSubmitMilestone = async (data: MilestoneFormData) => {
    await addMilestone(data);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = milestones.findIndex(
        (milestone) => milestone.id === active.id
      );
      const newIndex = milestones.findIndex(
        (milestone) => milestone.id === over.id
      );

      // Update order optimistically via context
      const newMilestones = arrayMove(milestones, oldIndex, newIndex);
      const milestoneIds = newMilestones.map((milestone) => milestone.id);

      // The context will handle the optimistic update and server call
      await reorderMilestones(milestoneIds);
    }
  };

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
          <form
            onSubmit={milestoneForm.handleSubmit(onSubmitMilestone)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="milestone-type">Type</Label>
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
                    <SelectItem value={MilestoneType.ACQUISITION}>
                      Acquisition
                    </SelectItem>
                    <SelectItem value={MilestoneType.PLANNING}>
                      Planning
                    </SelectItem>
                    <SelectItem value={MilestoneType.BUILD}>Build</SelectItem>
                    <SelectItem value={MilestoneType.PAINTING}>
                      Painting
                    </SelectItem>
                    <SelectItem value={MilestoneType.PANEL_LINING}>
                      Panel Lining
                    </SelectItem>
                    <SelectItem value={MilestoneType.DECALS}>Decals</SelectItem>
                    <SelectItem value={MilestoneType.TOPCOAT}>
                      Topcoat
                    </SelectItem>
                    <SelectItem value={MilestoneType.PHOTOGRAPHY}>
                      Photography
                    </SelectItem>
                    <SelectItem value={MilestoneType.COMPLETION}>
                      Completion
                    </SelectItem>
                  </SelectContent>
                </Select>
                {milestoneForm.formState.errors.type && (
                  <p className="text-sm text-red-600 mt-1">
                    {milestoneForm.formState.errors.type.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="milestone-title">Title</Label>
                <Input
                  id="milestone-title"
                  {...milestoneForm.register("title")}
                  placeholder="Enter milestone title"
                  className={
                    milestoneForm.formState.errors.title ? "border-red-500" : ""
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
              <Label htmlFor="milestone-description">Description</Label>
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
                type="submit"
                disabled={milestoneForm.formState.isSubmitting}
                className="flex items-center gap-2"
              >
                {milestoneForm.formState.isSubmitting ? (
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
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  milestoneForm.reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">
            No milestones yet. Add your first milestone to get started!
          </p>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={milestones.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {milestones.map((milestone) => (
                <SortableMilestoneItem
                  key={milestone.id}
                  milestone={milestone}
                  reorderMode={reorderMode}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
