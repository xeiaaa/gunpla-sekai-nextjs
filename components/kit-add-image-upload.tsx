"use client";

import { useState, useCallback, useRef } from "react";
import {
  ImageIcon,
  UploadIcon,
  XIcon,
  Loader2,
  GripVertical,
  Trash2,
  Maximize2,
  Edit3,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KitImageType } from "@/generated/prisma";
import { getUploadSignature, uploadToCloudinary } from "@/lib/upload-client";
import { createUpload } from "@/lib/actions/uploads";
import { cn } from "@/lib/utils";
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
import NextImage from "next/image";

interface PendingImageItem {
  id: string;
  uploadId: string;
  url: string;
  eagerUrl?: string | null;
  caption: string;
  type: KitImageType;
  order: number;
  originalFilename: string;
  size: number;
  format: string;
  file?: File;
}

interface KitAddImageUploadProps {
  onImagesChange?: (images: PendingImageItem[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

// Sortable Image Item Component
function SortableImageItem({
  imageItem,
  onDelete,
  onImageClick,
}: {
  imageItem: PendingImageItem;
  onDelete: (item: PendingImageItem) => void;
  onImageClick: (item: PendingImageItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: imageItem.id });

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
        isDragging && "shadow-lg"
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

      {/* Image */}
      <div
        className="aspect-square relative cursor-pointer group"
        onClick={() => onImageClick(imageItem)}
      >
        <NextImage
          src={imageItem.eagerUrl || imageItem.url}
          alt={imageItem.caption || imageItem.originalFilename}
          fill
          className="transition-transform group-hover:scale-105 object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Click overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="h-6 w-6 text-white drop-shadow-lg" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(imageItem);
          }}
          className="h-6 w-6 p-0"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function KitAddImageUpload({
  onImagesChange,
  maxFiles = 20,
  maxSizeMB = 5,
}: KitAddImageUploadProps) {
  const maxSize = maxSizeMB * 1024 * 1024;
  const [imageItems, setImageItems] = useState<PendingImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PendingImageItem | null>(
    null
  );
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Notify parent when images change
  const notifyChange = useCallback(
    (items: PendingImageItem[]) => {
      if (onImagesChange) {
        onImagesChange(items);
      }
    },
    [onImagesChange]
  );

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (!files.length) return;

      const fileArray = Array.from(files);

      // Check file count limit
      if (imageItems.length + fileArray.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Check file sizes
      const oversizedFiles = fileArray.filter((file) => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        alert(
          `Some files exceed ${maxSizeMB}MB limit: ${oversizedFiles
            .map((f) => f.name)
            .join(", ")}`
        );
        return;
      }

      setUploading(true);
      const uploadPromises = fileArray.map(async (file, index) => {
        try {
          // Get upload signature
          const signature = await getUploadSignature("kit-images");

          // Upload to Cloudinary
          const cloudinaryResult = await uploadToCloudinary(
            file,
            signature,
            "kit-images"
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
            uploadedAt: new Date(cloudinaryResult.created_at),
            uploadedById: "", // Will be set by the server action
          });

          // Create pending image item
          const imageItem: PendingImageItem = {
            id: upload.id,
            uploadId: upload.id,
            url: upload.url,
            eagerUrl: upload.eagerUrl,
            caption: "",
            type: "PRODUCT_SHOTS",
            order: imageItems.length + index,
            originalFilename: upload.originalFilename,
            size: upload.size,
            format: upload.format,
            file,
          };

          return imageItem;
        } catch (error) {
          console.error("Error uploading file:", error);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(
        (item): item is PendingImageItem => item !== null
      );

      const newItems = [...imageItems, ...successfulUploads];
      setImageItems(newItems);
      notifyChange(newItems);
      setUploading(false);
    },
    [imageItems, maxFiles, maxSize, maxSizeMB, notifyChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files);
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        handleFileSelect(files);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFileSelect]
  );

  const handleDeleteItem = (item: PendingImageItem) => {
    const newItems = imageItems.filter((i) => i.id !== item.id);
    setImageItems(newItems);
    notifyChange(newItems);

    // Close dialog if the deleted image was selected
    if (selectedImage?.id === item.id) {
      setSelectedImage(null);
      setEditingCaption(false);
    }
  };

  const handleImageClick = (item: PendingImageItem) => {
    setSelectedImage(item);
    setCaptionText(item.caption || "");
    setEditingCaption(false);
  };

  const handleSaveCaption = () => {
    if (!selectedImage) return;

    const newItems = imageItems.map((i) =>
      i.id === selectedImage.id ? { ...i, caption: captionText } : i
    );
    setImageItems(newItems);
    setSelectedImage({ ...selectedImage, caption: captionText });
    notifyChange(newItems);
    setEditingCaption(false);
  };

  const handleTypeChange = (newType: KitImageType) => {
    if (!selectedImage) return;

    const newItems = imageItems.map((i) =>
      i.id === selectedImage.id ? { ...i, type: newType } : i
    );
    setImageItems(newItems);
    setSelectedImage({ ...selectedImage, type: newType });
    notifyChange(newItems);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
    setEditingCaption(false);
    setCaptionText("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = imageItems.findIndex((item) => item.id === active.id);
      const newIndex = imageItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(imageItems, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          order: index,
        })
      );
      setImageItems(newItems);
      notifyChange(newItems);
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
              <UploadIcon className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {uploading ? "Uploading..." : "Upload Images"}
            </h3>
            <p className="text-gray-600">
              Drag and drop images here, or click to select files
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Max {maxFiles} files, {maxSizeMB}MB each
            </p>
          </div>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4"
          >
            <UploadIcon className="h-4 w-4 mr-2" />
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

      {/* Image Grid */}
      {imageItems.length > 0 ? (
        <Card className="p-4">
          <div className="mb-3 text-sm text-gray-600">
            {imageItems.length} image{imageItems.length !== 1 ? "s" : ""}{" "}
            uploaded
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={imageItems.map((item) => item.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {imageItems.map((item) => (
                  <SortableImageItem
                    key={item.id}
                    imageItem={item}
                    onDelete={handleDeleteItem}
                    onImageClick={handleImageClick}
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
            Upload images for your new kit.They will be saved when you create
            the kit.
          </p>
        </Card>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={handleCloseLightbox}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 flex flex-col overflow-hidden [&>button]:hidden">
          <DialogHeader className="p-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold truncate">
                  {selectedImage?.originalFilename}
                </DialogTitle>
                <DialogDescription>
                  Edit image details and caption before creating kit.
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseLightbox}
                className="h-8 w-8 p-0"
              >
                <XIcon className="h-4 w-4" />
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
                    alt={
                      selectedImage.caption || selectedImage.originalFilename
                    }
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    sizes="(max-width: 1024px) 100vw, 800px"
                  />
                </div>
              </div>

              {/* Caption and Type Section */}
              <div className="w-full lg:w-80 p-4 border-l border-gray-200 flex flex-col min-h-0">
                <div className="flex-1 min-h-0 flex flex-col space-y-4">
                  {/* Caption Section */}
                  <div>
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

                    <div className="min-h-0">
                      {editingCaption ? (
                        <div className="space-y-3">
                          <Textarea
                            id="caption"
                            value={captionText}
                            onChange={(e) => setCaptionText(e.target.value)}
                            placeholder="Add a caption for this image..."
                            rows={4}
                            className="resize-none"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveCaption}
                              className="flex-1"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
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
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            {selectedImage.caption ||
                              "No caption added yet. Click Edit to add one."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Type Section */}
                  <div>
                    <Label
                      htmlFor="image-type"
                      className="text-sm font-medium mb-3 block"
                    >
                      Image Type
                    </Label>
                    <Select
                      value={selectedImage.type}
                      onValueChange={handleTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BOX_ART"> Box Art </SelectItem>
                        <SelectItem value="PRODUCT_SHOTS">
                          Product Shots
                        </SelectItem>
                        <SelectItem value="RUNNERS"> Runners </SelectItem>
                        <SelectItem value="MANUAL"> Manual </SelectItem>
                        <SelectItem value="PROTOTYPE"> Prototype </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Image Info - Fixed at bottom */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex justify-between">
                      <span>Size: </span>
                      <span>
                        {(selectedImage.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Format: </span>
                      <span> {selectedImage.format.toUpperCase()} </span>
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
                    Remove Image
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
