"use client";

import { useState, useRef, useCallback } from "react";
import {
  UploadIcon,
  ImageIcon,
  Loader2,
  GripVertical,
  Trash2,
  Maximize2,
  Edit3,
  Save,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils";
import { getUploadSignature, uploadToCloudinary } from "@/lib/upload-client";
import { createUpload } from "@/lib/actions/uploads";
import { KitImageType } from "@/generated/prisma";

export interface ImageItem {
  id: string;
  url: string;
  eagerUrl?: string | null;
  caption: string;
  type: KitImageType;
  order: number;
  originalFilename: string;
  size: number;
  format: string;
  uploadedAt: Date;
}

interface KitImageUploadFormProps {
  initialFiles?: ImageItem[];
  maxFiles?: number;
  maxSizeMB?: number;
  onChange?: (images: ImageItem[]) => void;
}

// Sortable Image Item
function SortableImageItem({
  imageItem,
  onDelete,
  onClick,
}: {
  imageItem: ImageItem;
  onDelete: (id: string) => void;
  onClick: (item: ImageItem) => void;
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
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab p-1 bg-black/50 rounded text-white opacity-0 group-hover:opacity-100"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div
        className="aspect-square relative cursor-pointer group"
        onClick={() => onClick(imageItem)}
      >
        <NextImage
          src={imageItem.eagerUrl || imageItem.url}
          alt={imageItem.caption || imageItem.originalFilename || imageItem.url}
          fill
          className="transition-transform group-hover:scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center">
          <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
        </div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
        <Button
          size="sm"
          variant="destructive"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(imageItem.id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function KitImageUploadForm({
  initialFiles = [],
  maxFiles = 6,
  maxSizeMB = 5,
  onChange,
}: KitImageUploadFormProps) {
  const [imageItems, setImageItems] = useState<ImageItem[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (!files.length) return;
      setUploading(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const signature = await getUploadSignature("kit-images");
        const cloudinary = await uploadToCloudinary(
          file,
          signature,
          "kit-images"
        );
        const upload = await createUpload({
          cloudinaryAssetId: cloudinary.asset_id,
          publicId: cloudinary.public_id,
          url: cloudinary.secure_url,
          eagerUrl: cloudinary.eager?.[0]?.secure_url,
          format: cloudinary.format,
          resourceType: cloudinary.resource_type,
          size: cloudinary.bytes,
          originalFilename: cloudinary.original_filename,
          uploadedAt: new Date(cloudinary.created_at),
          uploadedById: "",
        });

        return {
          id: upload.id,
          url: upload.url,
          eagerUrl: upload.eagerUrl,
          caption: "",
          type: "PRODUCT_SHOTS" as KitImageType,
          order: 0,
          originalFilename: upload.originalFilename,
          size: upload.size,
          format: upload.format,
          uploadedAt: upload.uploadedAt,
        };
      });

      const results = await Promise.all(uploadPromises);
      setUploading(false);
      const newItems = [...imageItems, ...results];
      setImageItems(newItems);
      onChange?.(newItems);
    },
    [imageItems, onChange]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFileSelect(e.target.files);
  };

  const handleDelete = (id: string) => {
    const newItems = imageItems.filter((i) => i.id !== id);
    setImageItems(newItems);
    onChange?.(newItems);
  };

  const handleImageClick = (item: ImageItem) => {
    setSelectedImage(item);
    setCaptionText(item.caption);
    setEditingCaption(false);
  };

  const handleSaveCaption = () => {
    if (!selectedImage) return;
    const updated = imageItems.map((i) =>
      i.id === selectedImage.id ? { ...i, caption: captionText } : i
    );
    setImageItems(updated);
    onChange?.(updated);
    setSelectedImage({ ...selectedImage, caption: captionText });
    setEditingCaption(false);
  };

  const handleTypeChange = (newType: KitImageType) => {
    if (!selectedImage) return;
    const updated = imageItems.map((i) =>
      i.id === selectedImage.id ? { ...i, type: newType } : i
    );
    setImageItems(updated);
    onChange?.(updated);
    setSelectedImage({ ...selectedImage, type: newType });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = imageItems.findIndex((i) => i.id === active.id);
      const newIndex = imageItems.findIndex((i) => i.id === over.id);
      const newOrder = arrayMove(imageItems, oldIndex, newIndex);
      setImageItems(newOrder);
      onChange?.(newOrder);
    }
  };

  const sortedItems = [...imageItems];

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed border-gray-300 p-8 text-center transition-colors",
          uploading && "border-primary bg-primary/5"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          {uploading ? (
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          ) : (
            <UploadIcon className="h-12 w-12 text-gray-400 mx-auto" />
          )}
          <h3 className="text-lg font-semibold">
            {uploading ? "Uploading..." : "Upload Images"}
          </h3>
          <p className="text-gray-600">Click or drag files to upload</p>
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

      {/* Grid */}
      {sortedItems.length > 0 ? (
        <Card className="p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedItems.map((i) => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {sortedItems.map((item) => (
                  <SortableImageItem
                    key={item.id}
                    imageItem={item}
                    onDelete={handleDelete}
                    onClick={handleImageClick}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No images yet</h3>
          <p className="text-gray-600">
            Upload your first image to start your kit gallery.
          </p>
        </Card>
      )}

      {/* Lightbox */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl h-[85vh] p-0 flex flex-col overflow-hidden [&>button]:hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>{selectedImage?.originalFilename}</DialogTitle>
            <DialogDescription>Edit image details</DialogDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 h-8 w-8 p-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {selectedImage && (
            <div className="flex flex-col lg:flex-row flex-1">
              <div className="flex-1 bg-gray-50 flex items-center justify-center p-4">
                <div className="relative w-full h-full">
                  <NextImage
                    src={selectedImage.eagerUrl || selectedImage.url}
                    alt={
                      selectedImage.caption ||
                      selectedImage.originalFilename ||
                      selectedImage.type
                    }
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    sizes="(max-width: 1024px) 100vw, 800px"
                  />
                </div>
              </div>
              <div className="w-full lg:w-80 p-4 border-l flex flex-col">
                {/* Caption */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Caption</Label>
                    {!editingCaption && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCaption(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    )}
                  </div>
                  {editingCaption ? (
                    <div className="space-y-3">
                      <Textarea
                        value={captionText}
                        onChange={(e) => setCaptionText(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveCaption}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-1" /> Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCaption(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {selectedImage.caption || "No caption yet"}
                    </p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <Label>Image Type</Label>
                  <Select
                    value={selectedImage.type}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOX_ART">Box Art</SelectItem>
                      <SelectItem value="PRODUCT_SHOTS">
                        Product Shots
                      </SelectItem>
                      <SelectItem value="RUNNERS">Runners</SelectItem>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="PROTOTYPE">Prototype</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
