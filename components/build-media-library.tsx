"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  Trash2,
  GripVertical,
  Plus,
  Maximize2,
  Minimize2,
  X,
  Save,
  Edit3,
  Star
} from "lucide-react";
import { getUploadSignature, uploadToCloudinary } from "@/lib/upload-client";
import {
  createUpload,
  deleteUpload,
  getBuildMediaItems,
  addUploadToBuild,
  removeUploadFromBuild,
  updateBuildUploadCaption,
  reorderBuildUploads
} from "@/lib/actions/uploads";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import NextImage from "next/image";

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
  buildUploadId?: string; // ID of the BuildUpload junction table entry
}

interface BuildMediaLibraryProps {
  buildId: string;
  onImageClick?: (image: MediaItem) => void;
  selectedImages?: string[]; // Array of image IDs that are selected
  showSelection?: boolean;
  featuredImageId?: string | null; // ID of the currently featured image
  onMediaCountChange?: (count: number) => void; // Callback when media count changes
}

// Sortable Media Item Component
function SortableMediaItem({
  mediaItem,
  isSelected,
  onSelect,
  onDelete,
  showSelection = false,
  onImageClick,
  imageFit = "cover",
  isFeatured = false,
}: {
  mediaItem: MediaItem;
  isSelected: boolean;
  onSelect: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
  showSelection?: boolean;
  onImageClick?: (item: MediaItem) => void;
  imageFit?: "cover" | "contain";
  isFeatured?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mediaItem.id });

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
        "relative group overflow-hidden rounded-lg",
        isDragging && "shadow-lg",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing p-1 bg-black/50 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Selection Checkbox */}
      {showSelection && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={() => onSelect(mediaItem)}
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
              isSelected
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-white/80 border-white hover:bg-white"
            )}
          >
            {isSelected && <div className="w-2 h-2 bg-current rounded-sm" />}
          </button>
        </div>
      )}

      {/* Image */}
      <div
        className="aspect-square relative cursor-pointer group"
        onClick={() => onImageClick?.(mediaItem)}
      >
        <NextImage
          src={mediaItem.eagerUrl || mediaItem.url}
          alt={mediaItem.caption || mediaItem.originalFilename}
          fill
          className={cn(
            "transition-transform group-hover:scale-105",
            imageFit === 'cover' ? 'object-cover' : 'object-contain'
          )}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {/* Featured image indicator */}
        {isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white rounded-full p-1 shadow-lg">
            <Star className="h-3 w-3 fill-current" />
          </div>
        )}

        {/* Click overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="h-6 w-6 text-white drop-shadow-lg" />
          </div>
        </div>
      </div>

      {/* Action Buttons - Only show on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(mediaItem);
            }}
            className="h-6 w-6 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BuildMediaLibrary({
  buildId,
  onImageClick,
  selectedImages = [],
  showSelection = false,
  featuredImageId = null,
  onMediaCountChange,
}: BuildMediaLibraryProps) {
  const { userId } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('cover');
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [savingCaption, setSavingCaption] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort items by order (from database)
  const sortedItems = [...mediaItems].sort((a, b) => a.order - b.order);

  // Notify parent component when media count changes
  useEffect(() => {
    onMediaCountChange?.(mediaItems.length);
  }, [mediaItems.length, onMediaCountChange]);

  // Load existing media items
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

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        // Check if user is authenticated
        if (!userId) {
          throw new Error("User must be authenticated to upload images");
        }

        // Get upload signature
        const signature = await getUploadSignature(`builds/${buildId}`);

        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(
          file,
          signature,
          `builds/${buildId}`
        );

        // Create upload record in database
        const upload = await createUpload({
          cloudinaryAssetId: cloudinaryResult.asset_id,
          publicId: cloudinaryResult.public_id,
          url: cloudinaryResult.secure_url,
          eagerUrl: cloudinaryResult.eager?.[0]?.secure_url,
          format: cloudinaryResult.format,
          resourceType: cloudinaryResult.resource_type,
          size: cloudinaryResult.bytes,
          originalFilename: cloudinaryResult.original_filename,
          uploadedAt: new Date(),
          uploadedById: userId,
        });

        // Add upload to build via junction table
        const buildUpload = await addUploadToBuild(
          buildId,
          upload.id,
          "",
          mediaItems.length
        );

        // Create media item
        const mediaItem: MediaItem = {
          id: upload.id,
          uploadId: upload.id,
          url: upload.url,
          eagerUrl: upload.eagerUrl,
          caption: buildUpload.caption || "",
          order: buildUpload.order || 0,
          createdAt: upload.uploadedAt,
          originalFilename: upload.originalFilename,
          size: upload.size,
          format: upload.format,
          buildUploadId: buildUpload.id,
        };

        return mediaItem;
      } catch (error) {
        console.error("Error uploading file:", error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((item): item is MediaItem => item !== null);

    setMediaItems(prev => [...prev, ...successfulUploads]);
    setUploading(false);
  }, [buildId, mediaItems.length, userId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDeleteItem = async (item: MediaItem) => {
    try {
      // Remove from build first
      await removeUploadFromBuild(buildId, item.uploadId);
      // Then delete the upload (this will cascade delete the junction table entry)
      await deleteUpload(item.uploadId);
      setMediaItems(prev => prev.filter(i => i.id !== item.id));

      // Close lightbox if the deleted image was selected
      if (selectedImage?.id === item.id) {
        setSelectedImage(null);
        setEditingCaption(false);
      }
    } catch (error) {
      console.error("Error deleting media item:", error);
    }
  };

  const handleImageClick = (item: MediaItem) => {
    setSelectedImage(item);
    setCaptionText(item.caption || "");
    setEditingCaption(false);
    onImageClick?.(item);
  };

  const handleSaveCaption = async () => {
    if (!selectedImage) return;

    setSavingCaption(true);
    try {
      await updateBuildUploadCaption(buildId, selectedImage.uploadId, captionText);
      setMediaItems(prev =>
        prev.map(i => i.id === selectedImage.id ? { ...i, caption: captionText } : i)
      );
      setSelectedImage(prev => prev ? { ...prev, caption: captionText } : null);
      setEditingCaption(false);
    } catch (error) {
      console.error("Error updating caption:", error);
    } finally {
      setSavingCaption(false);
    }
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
    setEditingCaption(false);
    setCaptionText("");
  };


  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedItems.findIndex((item) => item.id === active.id);
      const newIndex = sortedItems.findIndex((item) => item.id === over.id);

      // Update local state immediately for responsive UI
      const newItems = arrayMove(sortedItems, oldIndex, newIndex);
      setMediaItems(newItems);

      // Update order in database
      try {
        const uploadIds = newItems.map(item => item.uploadId);
        await reorderBuildUploads(buildId, uploadIds);
      } catch (error) {
        console.error("Error reordering media items:", error);
        // Revert local state on error
        setMediaItems(mediaItems);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed border-gray-300 p-8 text-center transition-colors",
          uploading && "border-primary bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            {uploading ? (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {uploading ? "Uploading..." : "Upload Images"}
            </h3>
            <p className="text-gray-600">
              Drag and drop images here, or click to select files
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </Card>

      {/* Image Fit Toggle */}
      {mediaItems.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImageFit(imageFit === 'cover' ? 'contain' : 'cover')}
            className="h-8 px-3"
          >
            {imageFit === 'cover' ? (
              <>
                <Maximize2 className="h-4 w-4 mr-1" />
                Cover
              </>
            ) : (
              <>
                <Minimize2 className="h-4 w-4 mr-1" />
                Contain
              </>
            )}
          </Button>
        </div>
      )}

      {/* Media Grid */}
      {sortedItems.length > 0 ? (
        <Card className="p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedItems.map(item => item.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {sortedItems.map((item) => (
                <SortableMediaItem
                  key={item.id}
                  mediaItem={item}
                  isSelected={selectedImages.includes(item.id)}
                  onSelect={onImageClick || (() => {})}
                  onDelete={handleDeleteItem}
                  showSelection={showSelection}
                  onImageClick={handleImageClick}
                  imageFit={imageFit}
                  isFeatured={featuredImageId === item.id}
                />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No images yet
          </h3>
          <p className="text-gray-600">
            Upload your first image to get started with your build gallery.
          </p>
        </Card>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={handleCloseLightbox}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 flex flex-col overflow-hidden [&>button]:hidden">
          <DialogHeader className="p-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold truncate">
                {selectedImage?.originalFilename}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseLightbox}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedImage && (
            <div className="flex flex-col lg:flex-row flex-1 min-h-0">
              {/* Image Display */}
              <div className="flex-1 p-4 flex items-center justify-center bg-gray-50 min-h-0">
                <div className="relative w-full h-full">
                  <NextImage
                    src={selectedImage.eagerUrl || selectedImage.url}
                    alt={selectedImage.caption || selectedImage.originalFilename}
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    sizes="(max-width: 1024px) 100vw, 800px"
                  />
                </div>
              </div>

              {/* Caption Section */}
              <div className="w-full lg:w-80 p-4 border-l border-gray-200 flex flex-col min-h-0">
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <Label htmlFor="caption" className="text-sm font-medium">
                      Caption
                    </Label>
                    {!editingCaption && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCaption(true)}
                        className="h-8 px-2"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 min-h-0">
                    {editingCaption ? (
                      <div className="space-y-3 h-full flex flex-col">
                        <Textarea
                          id="caption"
                          value={captionText}
                          onChange={(e) => setCaptionText(e.target.value)}
                          placeholder="Add a caption for this image..."
                          rows={4}
                          className="resize-none flex-1"
                        />
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={handleSaveCaption}
                            disabled={savingCaption}
                            className="flex-1"
                          >
                            {savingCaption ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCaption(false);
                              setCaptionText(selectedImage.caption || "");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full p-3 bg-gray-50 rounded-lg overflow-y-auto">
                        <p className="text-sm text-gray-600">
                          {selectedImage.caption || "No caption added yet. Click Edit to add one."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Info - Fixed at bottom */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{(selectedImage.size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span>{selectedImage.format.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span>{new Date(selectedImage.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      handleDeleteItem(selectedImage);
                      handleCloseLightbox();
                    }}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Image
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
