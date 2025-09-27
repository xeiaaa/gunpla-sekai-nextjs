"use client";

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
import { Save } from "lucide-react";
import { MarkdownEditor } from "../ui/markdown-editor";
import { useBuildEdit, BuildFormDataLenient } from "@/contexts/build-edit";

export function InfoTab() {
  const { buildForm, updateBuild, buildData, isFormInitialized } =
    useBuildEdit();

  const onSubmit = async (data: BuildFormDataLenient) => {
    await updateBuild(data);
  };

  const status = buildForm.watch("status");

  // Don't render until we have build data and form is properly initialized
  if (!buildData || !isFormInitialized) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading build data...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Build Information</h3>
        <form onSubmit={buildForm.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="build-title">Title</Label>
            <Input
              id="build-title"
              {...buildForm.register("title")}
              className={`text-lg font-semibold ${
                buildForm.formState.errors.title ? "border-red-500" : ""
              }`}
            />
            {buildForm.formState.errors.title && (
              <p className="text-sm text-red-600 mt-1">
                {buildForm.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="build-description">Description</Label>
            <MarkdownEditor
              value={buildForm.watch("description") || ""}
              onChange={(value) => {
                buildForm.setValue("description", value, {
                  shouldValidate: true,
                });
              }}
              placeholder="Describe your build process, techniques used, or any notes... (Markdown supported)"
              height={200}
            />
            {buildForm.formState.errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {buildForm.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="build-status">Status</Label>
              <Select
                value={status || "PLANNING"}
                onValueChange={(value) => {
                  const statusValue = value as
                    | "PLANNING"
                    | "IN_PROGRESS"
                    | "COMPLETED"
                    | "ON_HOLD";

                  buildForm.setValue("status", statusValue, {
                    shouldValidate: true,
                  });

                  // Clear completed date if status is not COMPLETED
                  if (value !== "COMPLETED") {
                    buildForm.setValue("completedAt", "", {
                      shouldValidate: true,
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                </SelectContent>
              </Select>
              {buildForm.formState.errors.status && (
                <p className="text-sm text-red-600 mt-1">
                  {buildForm.formState.errors.status.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="build-started">Started Date</Label>
              <Input
                id="build-started"
                type="date"
                {...buildForm.register("startedAt")}
              />
              {buildForm.formState.errors.startedAt && (
                <p className="text-sm text-red-600 mt-1">
                  {buildForm.formState.errors.startedAt.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="build-completed">Completed Date</Label>
              <Input
                id="build-completed"
                type="date"
                {...buildForm.register("completedAt")}
                disabled={status !== "COMPLETED"}
                className={
                  buildForm.formState.errors.completedAt ? "border-red-500" : ""
                }
              />
              {buildForm.formState.errors.completedAt && (
                <p className="text-sm text-red-600 mt-1">
                  {buildForm.formState.errors.completedAt.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={buildForm.formState.isSubmitting}
              className="flex items-center gap-2"
            >
              {buildForm.formState.isSubmitting ? (
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
        </form>
      </Card>
    </div>
  );
}
