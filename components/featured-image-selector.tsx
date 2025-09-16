"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, Check } from "lucide-react";

interface FeaturedImageSelectorProps {
  milestones: Array<{
    id: string;
    title: string;
    uploads: Array<{
      id: string;
      caption: string | null;
      upload: {
        id: string;
        url: string;
        eagerUrl: string | null;
      };
    }>;
  }>;
  currentFeaturedImageId?: string | null;
  onSelect: (uploadId: string | null) => void;
  children: React.ReactNode;
}

export function FeaturedImageSelector({
  milestones,
  currentFeaturedImageId,
  onSelect,
  children,
}: FeaturedImageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(currentFeaturedImageId || null);

  // Collect all images from all milestones
  const allImages = milestones.flatMap(milestone =>
    milestone.uploads.map(upload => ({
      ...upload,
      milestoneTitle: milestone.title,
    }))
  );

  const handleConfirm = () => {
    onSelect(selectedImageId);
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedImageId(currentFeaturedImageId || null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Featured Image</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {allImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No images available. Add images to your milestones first.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {allImages.map((image) => (
                <div
                  key={image.upload.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageId === image.upload.id
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedImageId(image.upload.id)}
                >
                  <div className="aspect-square relative">
                    <Image
                      src={image.upload.eagerUrl || image.upload.url}
                      alt={image.caption || "Build milestone image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />

                    {/* Selection indicator */}
                    {selectedImageId === image.upload.id && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      {selectedImageId === image.upload.id && (
                        <div className="bg-blue-500 text-white rounded-full p-2">
                          <Star className="h-4 w-4 fill-current" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image info */}
                  <div className="p-2 bg-white">
                    <p className="text-xs text-gray-600 truncate">
                      {image.milestoneTitle}
                    </p>
                    {image.caption && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {image.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-4 border-t">
          <Button
            variant="outline"
            onClick={() => setSelectedImageId(null)}
            disabled={selectedImageId === null}
          >
            Clear Selection
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
