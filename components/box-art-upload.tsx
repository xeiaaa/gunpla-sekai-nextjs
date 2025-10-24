import { useState, useRef } from "react";
import { Upload, Link2, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getUploadSignature, uploadToCloudinary } from "@/lib/upload-client";
import { createUpload } from "@/lib/actions/uploads";
import NextImage from "next/image";
import { cn } from "@/lib/utils";

interface BoxArtUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  id?: string;
}

export function BoxArtUpload({
  value,
  onChange,
  label = "Box Art",
  id = "boxArt",
}: BoxArtUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      // Get upload signature
      const signature = await getUploadSignature("box-art");

      // Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(
        file,
        signature,
        "box-art"
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

      // Use eager URL if available, otherwise use regular URL
      onChange(upload.eagerUrl || upload.url);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={id}>{label}</Label>

      <div className="space-y-4">
        {/* Tab Buttons */}
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1",
              activeTab === "url"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50"
            )}
          >
            <Link2 className="h-4 w-4 mr-2" />
            URL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1",
              activeTab === "upload"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50"
            )}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </button>
        </div>

        {/* URL Content */}
        {activeTab === "url" && (
          <div className="space-y-3">
            <Input
              id={id}
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/box-art.jpg"
              disabled={uploading}
            />
          </div>
        )}

        {/* Upload Content */}
        {activeTab === "upload" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500">
              Max file size: 5MB. Supported formats: JPG, PNG, WebP
            </p>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {value && (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-gray-50">
            <NextImage
              src={value}
              alt="Box art preview"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleClearImage}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
