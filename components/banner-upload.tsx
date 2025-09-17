"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getUploadSignature } from "@/lib/upload-client";
import { createUpload } from "@/lib/actions/uploads";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface BannerUploadProps {
  currentBannerUrl?: string | null;
  onBannerUploaded: (url: string) => void;
  onBannerRemoved: () => void;
  userId: string;
}

export function BannerUpload({
  currentBannerUrl,
  onBannerUploaded,
  onBannerRemoved,
  userId
}: BannerUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Get upload signature
      const signature = await getUploadSignature("user-banners");

      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature.signature);
      formData.append("timestamp", signature.timestamp.toString());
      formData.append("api_key", signature.apiKey);
      formData.append("folder", "user-banners");
      formData.append("eager", "q_auto,f_auto");
      formData.append("use_filename", "true");
      formData.append("unique_filename", "true");

      // Upload to Cloudinary
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const result = await uploadResponse.json();

      // Save to database
      const upload = await createUpload({
        cloudinaryAssetId: result.asset_id,
        publicId: result.public_id,
        url: result.secure_url,
        eagerUrl: result.eager?.[0]?.secure_url,
        format: result.format,
        resourceType: result.resource_type,
        size: result.bytes,
        originalFilename: result.original_filename,
        uploadedAt: new Date(result.created_at),
        uploadedById: userId,
      });

      if (upload) {
        onBannerUploaded(result.secure_url);
      }
    } catch (error) {
      console.error("Banner upload error:", error);
      setUploadError("Failed to upload banner image");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveBanner = () => {
    onBannerRemoved();
  };

  return (
    <div className="space-y-4">
      <Label>Banner Image</Label>

      {currentBannerUrl ? (
        <div className="relative">
          <div className="relative w-full h-32 rounded-lg overflow-hidden border">
            <Image
              src={currentBannerUrl}
              alt="Profile banner"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemoveBanner}
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">No banner image uploaded</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? "Uploading..." : "Upload Banner"}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}

      <p className="text-sm text-gray-500">
        Upload a banner image to personalize your profile. Recommended size: 1200x300px
      </p>
    </div>
  );
}
