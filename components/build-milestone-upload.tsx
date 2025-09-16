"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { getUploadSignature, uploadToCloudinary } from "@/lib/upload-client";
import { createUpload } from "@/lib/actions/uploads";
import { addImageToMilestone, removeImageFromMilestone } from "@/lib/actions/milestones";
import MilestoneImageItem from "./milestone-image-item";

interface UploadedImage {
  id: string;
  url: string;
  caption: string;
  order: number;
  uploadId?: string; // Store the actual upload ID for linking later
  buildMilestoneUploadId?: string; // Store the BuildMilestoneUpload ID for database operations
}

interface BuildMilestoneUploadProps {
  milestoneId: string;
  onImageAdded?: (image: UploadedImage) => void;
  onImageRemoved?: (imageId: string) => void;
  onCaptionChange?: (imageId: string, caption: string) => void;
  existingImages?: UploadedImage[];
  maxImages?: number;
  isTemporary?: boolean; // For build creation flow
}

export default function BuildMilestoneUpload({
  milestoneId,
  onImageAdded,
  onImageRemoved,
  onCaptionChange,
  existingImages = [],
  maxImages = 10,
  isTemporary = false,
}: BuildMilestoneUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [images, setImages] = useState<UploadedImage[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local images state when existingImages prop changes
  useEffect(() => {
    setImages(existingImages);
  }, [existingImages]);


  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const remainingSlots = maxImages - existingImages.length;
    const filesToUpload = filesArray.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);

    try {
      // Get upload signature for builds folder
      const signature = await getUploadSignature("builds");

      // Upload files in parallel
      const uploadPromises = filesToUpload.map(async (file, index) => {
        try {
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

          // Upload to Cloudinary
          const cloudinaryResult = await uploadToCloudinary(file, signature, "builds");

          setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));

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
          });

          setUploadProgress(prev => ({ ...prev, [file.name]: 75 }));

          if (isTemporary) {
            // For temporary milestones (build creation), just store the upload info
            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

            const uploadedImage: UploadedImage = {
              id: `temp-${Date.now()}-${index}`, // Temporary ID
              url: upload.url,
              caption: "",
              order: images.length + index,
              uploadId: upload.id, // Store the actual upload ID
            };

            onImageAdded?.(uploadedImage);
            return uploadedImage;
          } else {
            // For existing milestones, link to database
            const buildMilestoneUpload = await addImageToMilestone(
              milestoneId,
              upload.id,
              "",
              images.length + index
            );

            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

            const uploadedImage: UploadedImage = {
              id: buildMilestoneUpload.id,
              url: upload.url,
              caption: buildMilestoneUpload.caption || "",
              order: buildMilestoneUpload.order || 0,
              uploadId: upload.id,
              buildMilestoneUploadId: buildMilestoneUpload.id,
            };

            // Update local state immediately for responsive UI
            setImages(prevImages => [...prevImages, uploadedImage]);
            onImageAdded?.(uploadedImage);
            return uploadedImage;
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          throw error;
        }
      });

      await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    try {
      // Update local state immediately for responsive UI
      setImages(prevImages => prevImages.filter(img => img.id !== imageId));

      await removeImageFromMilestone(milestoneId, imageId);
      onImageRemoved?.(imageId);
    } catch (error) {
      console.error("Error removing image:", error);
      alert("Failed to remove image. Please try again.");
      // Revert local state on error
      setImages(existingImages);
    }
  };


  const canUploadMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUploadMore && (
        <Card className="p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Label htmlFor="milestone-images" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload milestone images
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </span>
              </Label>
              <Input
                ref={fileInputRef}
                id="milestone-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-4"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Images
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="truncate">{filename}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <MilestoneImageItem
              key={image.id}
              image={image}
              milestoneId={milestoneId}
              buildMilestoneUploadId={image.buildMilestoneUploadId || image.id}
              onRemove={handleRemoveImage}
              onCaptionChange={isTemporary ? onCaptionChange : undefined}
            />
          ))}
        </div>
      )}

      {/* Upload Limit Info */}
      {!canUploadMore && (
        <p className="text-sm text-gray-500 text-center">
          Maximum {maxImages} images reached
        </p>
      )}
    </div>
  );
}
