"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, ExternalLink } from "lucide-react";
import { createBuild } from "@/lib/actions/builds";

interface StartBuildDialogProps {
  kit: {
    id: string;
    name: string;
    slug: string | null;
    productLine?: {
      name: string;
      grade?: {
        name: string;
      } | null;
    } | null;
  };
  children: React.ReactNode;
}

export function StartBuildDialog({ kit, children }: StartBuildDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Build form state
  const [buildTitle, setBuildTitle] = useState("");
  const [buildDescription, setBuildDescription] = useState("");
  const [buildStatus, setBuildStatus] = useState<
    "PLANNING" | "IN_PROGRESS" | "COMPLETED"
  >("PLANNING");

  const handleCreateBuild = async () => {
    if (!buildTitle.trim()) {
      alert("Please enter a build title");
      return;
    }

    setLoading(true);
    try {
      const build = await createBuild({
        kitId: kit.id,
        title: buildTitle,
        description: buildDescription || undefined,
        status: buildStatus,
      });

      console.log("Build created successfully:", build);

      // Close dialog and redirect to build page
      setOpen(false);
      router.push(`/builds/${build.id}/edit`);
    } catch (error) {
      console.error("Error creating build:", error);
      alert("Failed to create build. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Reset form when dialog closes
    if (!newOpen) {
      setBuildTitle("");
      setBuildDescription("");
      setBuildStatus("PLANNING");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Start a New Build</DialogTitle>
          <DialogDescription>
            Create a new build for the {kit.name} kit and start tracking your
            progress.
          </DialogDescription>
        </DialogHeader>

        <div className="">
          {/* Build Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Build Information</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="build-title">Build Title *</Label>
                <Input
                  id="build-title"
                  value={buildTitle}
                  onChange={(e) => setBuildTitle(e.target.value)}
                  placeholder="e.g., My First RG Build"
                  required
                />
              </div>

              <div>
                <Label htmlFor="build-description">Description</Label>
                <MarkdownEditor
                  value={buildDescription}
                  onChange={setBuildDescription}
                  placeholder="Tell us about your build plans... (Markdown supported)"
                  height={150}
                />
              </div>

              <div>
                <Label htmlFor="build-status">Initial Status</Label>
                <Select
                  value={buildStatus}
                  onValueChange={(
                    value: "PLANNING" | "IN_PROGRESS" | "COMPLETED"
                  ) => setBuildStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreateBuild}
                disabled={loading || !buildTitle.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Build...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Build
                  </>
                )}
              </Button>

              {/* Link to standalone page */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    const params = new URLSearchParams({
                      kitId: kit.id,
                      kitName: kit.name,
                      kitSlug: kit.slug || "",
                      kitNumber: kit.productLine?.name || "",
                      kitBoxArt: "",
                      kitGrade: kit.productLine?.grade?.name || "",
                      kitProductLine: kit.productLine?.name || "",
                      kitSeries: "",
                    });
                    router.push(`/builds/new?${params.toString()}`);
                  }}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Full Build Creator
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
