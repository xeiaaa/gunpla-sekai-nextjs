"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Plus,
  X,
  GripVertical,
  Trash2,
  Check,
} from "lucide-react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { getBuildMediaItems } from "@/lib/actions/uploads";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MediaItem {
  id: string;
  uploadId: string;
  url: string;
  eagerUrl?: string | null;
  caption: string;
  order: number;
  createdAt: Date;
  originalFilename: string;
  size: number;
  format: string;
  buildUploadId?: string;
}

interface MilestoneImage {
  id: string;
  uploadId: string;
  url: string;
  eagerUrl?: string | null;
  caption: string;
  order: number;
  milestoneImageId?: string; // ID of the milestone image relationship
}

interface MilestoneImageSelectorProps {
  buildId: string;
  milestoneId: string;
  selectedImages: MilestoneImage[];
  onImagesChange: (images: MilestoneImage[]) => void;
  maxImages?: number;
  onLoadingChange?: (loading: boolean) => void;
}

// Sortable selected image component
function SortableSelectedImage({
  image,
  onRemove,
  isRemoving,
}: {
  image: MilestoneImage;
  onRemove: (imageId: string) => void;
  isRemoving?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group overflow-hidden rounded-lg aspect-square",
        isDragging && "shadow-lg"
      )}
    >
      {/* Loading Overlay for this specific image */}
      {isRemoving && (
        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
          <div className="flex items-center gap-2 text-white">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-xs">Removing...</span>
          </div>
        </div>
      )}

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 z-10 cursor-grab active:cursor-grabbing p-1 bg-black/50 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-3 w-3" />
      </div>

      {/* Remove Button */}
      <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onRemove(image.id)}
          className="h-5 w-5 p-0"
          disabled={isRemoving}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Image */}
      {image.eagerUrl || image.url ? (
        <NextImage
          src={image.eagerUrl || image.url}
          alt={image.caption || "Milestone image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      )}

      {/* Caption overlay */}
      {image.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
          {image.caption}
        </div>
      )}
    </div>
  );
}

// Media library selection item
function MediaLibraryItem({
  mediaItem,
  isSelected,
  onSelect,
  onDeselect,
}: {
  mediaItem: MediaItem;
  isSelected: boolean;
  onSelect: (item: MediaItem) => void;
  onDeselect: (item: MediaItem) => void;
}) {
  return (
    <div
      className={cn(
        "relative group overflow-hidden rounded-lg aspect-square cursor-pointer",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={() => (isSelected ? onDeselect(mediaItem) : onSelect(mediaItem))}
    >
      {/* Selection indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
            isSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-white/80 border-white hover:bg-white"
          )}
        >
          {isSelected && <Check className="w-3 h-3" />}
        </div>
      </div>

      {/* Image */}
      <NextImage
        src={mediaItem.eagerUrl || mediaItem.url}
        alt={mediaItem.caption || mediaItem.originalFilename}
        fill
        className="object-cover transition-transform group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      />

      {/* Caption overlay */}
      {mediaItem.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
          {mediaItem.caption}
        </div>
      )}
    </div>
  );
}

export default function MilestoneImageSelector({
  buildId,
  milestoneId,
  selectedImages,
  onImagesChange,
  maxImages = 10,
  onLoadingChange,
}: MilestoneImageSelectorProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingImages, setRemovingImages] = useState<Set<string>>(new Set());
  const [addingImages, setAddingImages] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load media items from build
  useEffect(() => {
    const loadMediaItems = async () => {
      try {
        const uploads = await getBuildMediaItems(buildId);
        const mediaItems: MediaItem[] = uploads.map((upload) => ({
          id: upload.id,
          uploadId: upload.id,
          url: upload.url,
          eagerUrl: upload.eagerUrl,
          caption: upload.caption || "",
          order: upload.order || 0,
          createdAt: upload.uploadedAt,
          originalFilename: upload.originalFilename,
          size: upload.size,
          format: upload.format,
          buildUploadId: upload.buildUploadId,
        }));
        setMediaItems(mediaItems);
      } catch (error) {
        console.error("Error loading media items:", error);
      }
    };

    loadMediaItems();
  }, [buildId]);

  // Initialize temp selection with currently selected images
  useEffect(() => {
    setTempSelectedIds(selectedImages.map((img) => img.uploadId));
  }, [selectedImages]);

  const handleOpenSelector = () => {
    setTempSelectedIds(selectedImages.map((img) => img.uploadId));
    setShowSelector(true);
  };

  const handleSelectImage = (mediaItem: MediaItem) => {
    if (tempSelectedIds.includes(mediaItem.id)) {
      setTempSelectedIds((prev) => prev.filter((id) => id !== mediaItem.id));
    } else if (tempSelectedIds.length < maxImages) {
      setTempSelectedIds((prev) => [...prev, mediaItem.id]);
    }
  };

  const handleApplySelection = async () => {
    setAddingImages(true);
    onLoadingChange?.(true);

    try {
      const selectedMediaItems = mediaItems.filter((item) =>
        tempSelectedIds.includes(item.id)
      );

      const newSelectedImages: MilestoneImage[] = selectedMediaItems.map(
        (item, index) => {
          // Find existing image to preserve milestoneImageId if it exists
          const existingImage = selectedImages.find(
            (img) => img.uploadId === item.id
          );

          return {
            id: existingImage?.id || `temp-${item.id}`,
            uploadId: item.id,
            url: item.url,
            eagerUrl: item.eagerUrl,
            caption: item.caption,
            order: index,
            milestoneImageId: existingImage?.milestoneImageId,
          };
        }
      );

      await onImagesChange(newSelectedImages);
      setShowSelector(false);
    } finally {
      setAddingImages(false);
      onLoadingChange?.(false);
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    setRemovingImages((prev) => new Set(prev).add(imageId));
    onLoadingChange?.(true);

    try {
      await onImagesChange(selectedImages.filter((img) => img.id !== imageId));
    } finally {
      setRemovingImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
      onLoadingChange?.(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = selectedImages.findIndex(
        (image) => image.id === active.id
      );
      const newIndex = selectedImages.findIndex(
        (image) => image.id === over.id
      );

      const newImages = arrayMove(selectedImages, oldIndex, newIndex);
      // Update order
      const reorderedImages = newImages.map((img, index) => ({
        ...img,
        order: index,
      }));

      onImagesChange(reorderedImages);
    }
  };

  const canAddMore = selectedImages.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Selected Images */}
      {selectedImages.length > 0 || addingImages ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Milestone Images ({selectedImages.length}/{maxImages})
            </h4>
            {canAddMore && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenSelector}
                className="h-8 px-3"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Images
              </Button>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedImages.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {selectedImages.map((image) => (
                  <SortableSelectedImage
                    key={image.id}
                    image={image}
                    onRemove={handleRemoveImage}
                    isRemoving={removingImages.has(image.id)}
                  />
                ))}
                {/* Placeholder images when adding */}
                {addingImages && (
                  <>
                    <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        <span className="text-xs">Adding...</span>
                      </div>
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        <span className="text-xs">Adding...</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <Card className="p-6 border-2 border-dashed border-gray-300 text-center">
          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-3">
            No images selected for this milestone
          </p>
          <Button size="sm" onClick={handleOpenSelector} className="h-8 px-3">
            <Plus className="h-4 w-4 mr-1" />
            Select Images
          </Button>
        </Card>
      )}

      {/* Media Library Selector Dialog */}
      <Dialog open={showSelector} onOpenChange={setShowSelector}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Images for Milestone</DialogTitle>
            <DialogDescription>
              Choose up to {maxImages} images from your build gallery to
              associate with this milestone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 flex flex-col">
            {/* Selection Summary */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {tempSelectedIds.length} selected
                </Badge>
                <span className="text-sm text-gray-600">
                  Maximum {maxImages} images
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSelector(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplySelection}
                  disabled={tempSelectedIds.length === 0}
                >
                  Apply Selection
                </Button>
              </div>
            </div>

            {/* Media Grid */}
            <div className="flex-1 min-h-0 overflow-auto">
              {mediaItems.length > 0 ? (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {mediaItems.map((item) => (
                    <MediaLibraryItem
                      key={item.id}
                      mediaItem={item}
                      isSelected={tempSelectedIds.includes(item.id)}
                      onSelect={handleSelectImage}
                      onDeselect={handleSelectImage}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No images in build gallery
                    </h3>
                    <p className="text-gray-600">
                      Upload images to the build gallery first, then select them
                      for milestones.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
