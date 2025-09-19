"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon, Loader2, GripVertical, Trash2, Maximize2, Edit3, Save } from "lucide-react"
import { useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KitImageType } from "@/generated/prisma"
import { getUploadSignature, uploadToCloudinary } from "@/lib/upload-client"
import { createUpload, createKitUpload, deleteKitUpload, updateKitUploadCaption, updateKitUploadType, reorderKitUploads, getKitUploads } from "@/lib/actions/uploads"
import { cn } from "@/lib/utils"
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
import NextImage from "next/image"

interface KitImageItem {
  id: string;
  kitUploadId: string;
  uploadId: string;
  url: string;
  eagerUrl?: string | null;
  caption: string;
  type: KitImageType;
  order: number;
  createdAt: Date;
  originalFilename: string;
  size: number;
  format: string;
}

interface KitImageUploadProps {
  kitId: string;
  initialFiles?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  maxFiles?: number;
  maxSizeMB?: number;
  onUploadComplete?: () => void;
  onFilesChange?: (files: Array<{ id: string; isUploaded: boolean; isUploading: boolean }>) => void;
  onRemovedFilesChange?: (removedFileIds: string[]) => void;
}

// Sortable Kit Image Item Component
function SortableKitImageItem({
  imageItem,
  onDelete,
  onImageClick,
}: {
  imageItem: KitImageItem;
  onDelete: (item: KitImageItem) => void;
  onImageClick: (item: KitImageItem) => void;
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

      {/* Action Buttons - Only show on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
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
    </div>
  );
}

export function KitImageUpload({
  kitId,
  initialFiles = [],
  maxFiles = 6,
  maxSizeMB = 5,
  onUploadComplete,
  onFilesChange,
  onRemovedFilesChange
}: KitImageUploadProps) {
  const maxSize = maxSizeMB * 1024 * 1024
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set(initialFiles.map(f => f.id)))
  const [removedFiles, setRemovedFiles] = useState<Set<string>>(new Set())
  const [imageItems, setImageItems] = useState<KitImageItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<KitImageItem | null>(null)
  const [editingCaption, setEditingCaption] = useState(false)
  const [captionText, setCaptionText] = useState("")
  const [savingCaption, setSavingCaption] = useState(false)
  const [savingType, setSavingType] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Use ref to avoid dependency issues
  const onRemovedFilesChangeRef = useRef(onRemovedFilesChange)
  onRemovedFilesChangeRef.current = onRemovedFilesChange

  // Notify parent when removed files change
  useEffect(() => {
    if (onRemovedFilesChangeRef.current) {
      console.log('Notifying parent of removed files:', Array.from(removedFiles));
      onRemovedFilesChangeRef.current(Array.from(removedFiles))
    }
  }, [removedFiles])

  // Load existing kit images
  useEffect(() => {
    const loadKitImages = async () => {
      try {
        const kitUploads = await getKitUploads(kitId)
        const items: KitImageItem[] = kitUploads.map((kitUpload) => ({
          id: kitUpload.upload.id,
          kitUploadId: kitUpload.id,
          uploadId: kitUpload.upload.id,
          url: kitUpload.upload.url,
          eagerUrl: kitUpload.upload.eagerUrl,
          caption: kitUpload.caption || "",
          type: kitUpload.type,
          order: kitUpload.order || 0,
          createdAt: kitUpload.upload.uploadedAt,
          originalFilename: kitUpload.upload.originalFilename,
          size: kitUpload.upload.size,
          format: kitUpload.upload.format,
        }))
        setImageItems(items)
      } catch (error) {
        console.error("Error loading kit images:", error)
      }
    }

    loadKitImages()
  }, [kitId])

  // Sort items by order
  const sortedItems = [...imageItems].sort((a, b) => a.order - b.order)

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (!files.length) return

    setUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        // Get upload signature
        const signature = await getUploadSignature("kit-images")

        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(file, signature, "kit-images")

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
        })

        // Create kit upload relationship
        const kitUpload = await createKitUpload({
          kitId,
          uploadId: upload.id,
          type: 'PRODUCT_SHOTS',
          caption: undefined,
          order: imageItems.length,
        })

        // Create image item
        const imageItem: KitImageItem = {
          id: upload.id,
          kitUploadId: kitUpload.id,
          uploadId: upload.id,
          url: upload.url,
          eagerUrl: upload.eagerUrl,
          caption: kitUpload.caption || "",
          type: kitUpload.type,
          order: kitUpload.order || 0,
          createdAt: upload.uploadedAt,
          originalFilename: upload.originalFilename,
          size: upload.size,
          format: upload.format,
        }

        return imageItem
      } catch (error) {
        console.error("Error uploading file:", error)
        return null
      }
    })

    const results = await Promise.all(uploadPromises)
    const successfulUploads = results.filter((item): item is KitImageItem => item !== null)

    setImageItems(prev => [...prev, ...successfulUploads])
    setUploading(false)
  }, [kitId, imageItems.length])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const handleDeleteItem = async (item: KitImageItem) => {
    try {
      // Mark for removal from database
      setRemovedFiles(prev => {
        const newSet = new Set([...prev, item.kitUploadId])
        return newSet
      })

      // Remove from UI
      setImageItems(prev => prev.filter(i => i.id !== item.id))

      // Close dialog if the deleted image was selected
      if (selectedImage?.id === item.id) {
        setSelectedImage(null)
        setEditingCaption(false)
      }
    } catch (error) {
      console.error("Error deleting image item:", error)
    }
  }

  const handleImageClick = (item: KitImageItem) => {
    setSelectedImage(item)
    setCaptionText(item.caption || "")
    setEditingCaption(false)
  }

  const handleSaveCaption = async () => {
    if (!selectedImage) return

    setSavingCaption(true)
    try {
      await updateKitUploadCaption(kitId, selectedImage.kitUploadId, captionText)
      setImageItems(prev =>
        prev.map(i => i.id === selectedImage.id ? { ...i, caption: captionText } : i)
      )
      setSelectedImage(prev => prev ? { ...prev, caption: captionText } : null)
      setEditingCaption(false)
    } catch (error) {
      console.error("Error updating caption:", error)
    } finally {
      setSavingCaption(false)
    }
  }

  const handleTypeChange = async (newType: KitImageType) => {
    if (!selectedImage) return

    setSavingType(true)
    try {
      await updateKitUploadType(kitId, selectedImage.kitUploadId, newType)
      setImageItems(prev =>
        prev.map(i => i.id === selectedImage.id ? { ...i, type: newType } : i)
      )
      setSelectedImage(prev => prev ? { ...prev, type: newType } : null)
    } catch (error) {
      console.error("Error updating type:", error)
    } finally {
      setSavingType(false)
    }
  }

  const handleCloseLightbox = () => {
    setSelectedImage(null)
    setEditingCaption(false)
    setCaptionText("")
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortedItems.findIndex((item) => item.id === active.id)
      const newIndex = sortedItems.findIndex((item) => item.id === over.id)

      // Update local state immediately for responsive UI
      const newItems = arrayMove(sortedItems, oldIndex, newIndex)
      setImageItems(newItems)

      // Update order in database
      try {
        const kitUploadIds = newItems.map(item => item.kitUploadId)
        await reorderKitUploads(kitId, kitUploadIds)
      } catch (error) {
        console.error("Error reordering image items:", error)
        // Revert local state on error
        setImageItems(imageItems)
      }
    }
  }

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
          </div>
          <Button
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
                  <SortableKitImageItem
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
            Upload your first image to get started with your kit gallery.
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
                    alt={selectedImage.caption || selectedImage.originalFilename}
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
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            {selectedImage.caption || "No caption added yet. Click Edit to add one."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Type Section */}
                  <div>
                    <Label htmlFor="image-type" className="text-sm font-medium mb-3 block">
                      Image Type
                    </Label>
                    <Select
                      value={selectedImage.type}
                      onValueChange={handleTypeChange}
                      disabled={savingType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BOX_ART">Box Art</SelectItem>
                        <SelectItem value="PRODUCT_SHOTS">Product Shots</SelectItem>
                        <SelectItem value="RUNNERS">Runners</SelectItem>
                        <SelectItem value="MANUAL">Manual</SelectItem>
                        <SelectItem value="PROTOTYPE">Prototype</SelectItem>
                      </SelectContent>
                    </Select>
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
  )
}
