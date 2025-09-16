"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { updateMilestoneImage } from "@/lib/actions/milestones";

interface UploadedImage {
  id: string;
  url: string;
  caption?: string;
  order?: number;
  uploadId?: string;
  buildMilestoneUploadId?: string;
}

interface MilestoneImageItemProps {
  image: UploadedImage;
  milestoneId: string;
  buildMilestoneUploadId: string;
  onRemove: (imageId: string) => void;
  onCaptionChange?: (imageId: string, caption: string) => void;
}

export default function MilestoneImageItem({
  image,
  milestoneId,
  buildMilestoneUploadId,
  onRemove,
  onCaptionChange,
}: MilestoneImageItemProps) {
  const [caption, setCaption] = useState(image.caption || "");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local caption when image prop changes
  useEffect(() => {
    setCaption(image.caption || "");
  }, [image.caption]);

  const handleCaptionChange = (newCaption: string) => {
    // Update local state immediately for responsive UI
    setCaption(newCaption);

    // Call parent callback if provided (for temporary images during build creation)
    if (onCaptionChange) {
      onCaptionChange(image.id, newCaption);
      return;
    }

    // For existing milestones, debounce the server call
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        await updateMilestoneImage(milestoneId, buildMilestoneUploadId, newCaption);
      } catch (error) {
        console.error("Failed to update caption:", error);
        // Optionally revert the caption on error
        setCaption(image.caption || "");
      }
    }, 500);
  };

  const handleRemove = () => {
    onRemove(image.id);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square">
        <img
          src={image.url}
          alt={caption || "Milestone image"}
          className="w-full h-full object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={handleRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="p-3">
        <Textarea
          placeholder="Add caption..."
          value={caption}
          onChange={(e) => handleCaptionChange(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>
    </Card>
  );
}
