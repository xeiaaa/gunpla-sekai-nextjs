"use client";

import React, { useCallback } from "react";
import { CutoutPropertiesPanel } from "@/gunpla-card/components/CutoutPropertiesPanel";
import { UploadPanel } from "@/gunpla-card/components/upload/UploadPanel";
import { CutoutsSidebar } from "@/gunpla-card/components/CutoutsSidebar";
import { BaseCardPanel } from "@/gunpla-card/components/basecard/BaseCardPanel";
import { useCardBuilder } from "@/gunpla-card/context";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  IconArrowLeft,
  IconDownload,
  IconEye,
  IconX,
  IconRefresh,
  IconCheck,
  IconCrop,
  IconDeviceFloppy
} from "@tabler/icons-react";
import dynamic from "next/dynamic";

const StageCanvas = dynamic(() => import("@/gunpla-card/components/cutouts/StageCanvas"), { ssr: false });
const PreviewPanel = dynamic(() => import("@/gunpla-card/components/preview/PreviewPanel").then(mod => ({ default: mod.PreviewPanel })), { ssr: false });

export const CardBuilder: React.FC = () => {
  const { baseCard, kitSlug } = useCardBuilder();
  const [isCropping, setIsCropping] = React.useState(false);
  const [isPreviewMode, setIsPreviewMode] = React.useState(false);
  const [confirmCropFunction, setConfirmCropFunction] = React.useState<(() => void) | null>(null);
  const [resetCropFunction, setResetCropFunction] = React.useState<(() => void) | null>(null);
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = React.useState<{ width: number; height: number } | null>(null);

  // Dialog states
  const [showOverwriteDialog, setShowOverwriteDialog] = React.useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);

  const handleConfirmCrop = () => {
    if (confirmCropFunction) {
      confirmCropFunction();
    }
  };

  const handleSetConfirmFunction = React.useCallback((fn: (() => void) | null) => {
    setConfirmCropFunction(() => fn);
  }, []);

  const handleSetResetFunction = React.useCallback((fn: (() => void) | null) => {
    setResetCropFunction(() => fn);
  }, []);

  const handleStartCrop = () => {
    setConfirmCropFunction(null); // Clear any existing confirm function
    setIsCropping(true);
  };

  const handleExitCrop = React.useCallback(() => {
    setIsCropping(false);
  }, []);

  const handleCancelCrop = () => {
    setIsCropping(false);
    setConfirmCropFunction(null); // Clear the confirm function when canceling
  };

  const handleSave = async (type: "png" | "jpeg") => {
    const { toPng, toJpeg } = await import("html-to-image");
    const node = document.getElementById("card-canvas-container");
    if (!node) return;
    const dataUrl = type === "png" ? await toPng(node) : await toJpeg(node, { quality: 0.92 });
    const link = document.createElement("a");
    link.download = `gunpla-card.${type}`;
    link.href = dataUrl;
    link.click();
  };

  const handleSaveGunplaCard = useCallback(async () => {
    if (!kitSlug) {
      console.error("No kit slug available");
      return;
    }

    const saveGunplaCard = async () => {
      try {
        // Get the canvas element from StageCanvas
        const canvasContainer = document.getElementById("card-canvas-container");
        if (!canvasContainer) {
          console.error("Canvas container not found");
          return;
        }

        // Find the Konva stage canvas
        const canvas = canvasContainer.querySelector("canvas");
        if (!canvas) {
          console.error("Canvas not found");
          return;
        }

        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, "image/png", 0.9);
        });

        // Upload to Cloudinary
        const uploadResponse = await fetch("/api/upload/signature", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ folder: "gunpla-cards" }),
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to get upload signature");
        }

        const signature = await uploadResponse.json();

        // Upload to Cloudinary
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append("file", blob);
        cloudinaryFormData.append("signature", signature.signature);
        cloudinaryFormData.append("timestamp", signature.timestamp.toString());
        cloudinaryFormData.append("api_key", signature.apiKey);
        cloudinaryFormData.append("folder", "gunpla-cards");
        cloudinaryFormData.append("eager", "q_auto,f_auto");
        cloudinaryFormData.append("use_filename", "true");
        cloudinaryFormData.append("unique_filename", "true");

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`,
          {
            method: "POST",
            body: cloudinaryFormData,
          }
        );

        if (!cloudinaryResponse.ok) {
          throw new Error("Failed to upload to Cloudinary");
        }

        const cloudinaryResult = await cloudinaryResponse.json();

        // Save to database
        const saveResponse = await fetch("/api/gunpla-card/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            kitSlug: kitSlug,
            uploadData: {
              cloudinaryAssetId: cloudinaryResult.asset_id,
              publicId: cloudinaryResult.public_id,
              url: cloudinaryResult.secure_url,
              eagerUrl: cloudinaryResult.eager?.[0]?.secure_url,
              format: cloudinaryResult.format,
              resourceType: cloudinaryResult.resource_type,
              size: cloudinaryResult.bytes,
              originalFilename: cloudinaryResult.original_filename,
              uploadedAt: new Date(cloudinaryResult.created_at),
            }
          }),
        });

        if (!saveResponse.ok) {
          throw new Error("Failed to save gunpla card");
        }

        const result = await saveResponse.json();
        console.log("Gunpla card saved successfully:", result);

        // Show success dialog
        setShowSuccessDialog(true);

      } catch (error) {
        console.error("Error saving gunpla card:", error);
        alert("Failed to save gunpla card. Please try again.");
      }
    };

    try {
      // First, check if user already has a gunpla card for this kit
      const checkResponse = await fetch(`/api/gunpla-card/check?kitSlug=${encodeURIComponent(kitSlug)}`);

      if (!checkResponse.ok) {
        throw new Error("Failed to check for existing gunpla card");
      }

      const checkResult = await checkResponse.json();

      if (checkResult.exists) {
        // User already has a card, show overwrite dialog
        setShowOverwriteDialog(true);
        return;
      }

      // No existing card, proceed with saving
      await saveGunplaCard();

    } catch (error) {
      console.error("Error checking/saving gunpla card:", error);
      alert("Failed to save gunpla card. Please try again.");
    }
  }, [kitSlug]);

  const handleOverwriteConfirm = useCallback(async () => {
    setShowOverwriteDialog(false);

    // Re-run the save process (which will now overwrite the existing card)
    try {
      // Get the canvas element from StageCanvas
      const canvasContainer = document.getElementById("card-canvas-container");
      if (!canvasContainer) {
        console.error("Canvas container not found");
        return;
      }

      // Find the Konva stage canvas
      const canvas = canvasContainer.querySelector("canvas");
      if (!canvas) {
        console.error("Canvas not found");
        return;
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/png", 0.9);
      });

      // Upload to Cloudinary
      const uploadResponse = await fetch("/api/upload/signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folder: "gunpla-cards" }),
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to get upload signature");
      }

      const signature = await uploadResponse.json();

      // Upload to Cloudinary
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", blob);
      cloudinaryFormData.append("signature", signature.signature);
      cloudinaryFormData.append("timestamp", signature.timestamp.toString());
      cloudinaryFormData.append("api_key", signature.apiKey);
      cloudinaryFormData.append("folder", "gunpla-cards");
      cloudinaryFormData.append("eager", "q_auto,f_auto");
      cloudinaryFormData.append("use_filename", "true");
      cloudinaryFormData.append("unique_filename", "true");

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error("Failed to upload to Cloudinary");
      }

      const cloudinaryResult = await cloudinaryResponse.json();

      // Save to database (this will overwrite the existing card)
      const saveResponse = await fetch("/api/gunpla-card/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kitSlug: kitSlug,
          uploadData: {
            cloudinaryAssetId: cloudinaryResult.asset_id,
            publicId: cloudinaryResult.public_id,
            url: cloudinaryResult.secure_url,
            eagerUrl: cloudinaryResult.eager?.[0]?.secure_url,
            format: cloudinaryResult.format,
            resourceType: cloudinaryResult.resource_type,
            size: cloudinaryResult.bytes,
            originalFilename: cloudinaryResult.original_filename,
            uploadedAt: new Date(cloudinaryResult.created_at),
          }
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save gunpla card");
      }

      const result = await saveResponse.json();
      console.log("Gunpla card saved successfully:", result);

      // Show success dialog
      setShowSuccessDialog(true);

    } catch (error) {
      console.error("Error saving gunpla card:", error);
      alert("Failed to save gunpla card. Please try again.");
    }
  }, [kitSlug]);

  const handleResetCrop = () => {
    // Reset crop to original image using the reset function from BaseCardPanel
    if (resetCropFunction) {
      resetCropFunction();
    }
  };

  // Calculate available canvas dimensions
  React.useEffect(() => {
    const updateDimensions = () => {
      if (canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        // Subtract padding (p-4 = 1rem = 16px on each side, so 32px total)
        const availableWidth = rect.width - 32;
        const availableHeight = rect.height - 32;
        setCanvasDimensions({ width: availableWidth, height: availableHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isCropping, isPreviewMode]);

  // Floating dock items for different modes
  const editModeItems = [
    {
      title: "Preview Mode",
      icon: <IconEye className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
      onClick: () => setIsPreviewMode(true)
    },
    ...(baseCard ? [{
      title: "Re-crop Base Image",
      icon: <IconCrop className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
      onClick: handleStartCrop
    }] : [])
  ];

  const previewModeItems = [
    {
      title: "Back to Edit",
      icon: <IconArrowLeft className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
      onClick: () => setIsPreviewMode(false)
    },
    {
      title: "Save Gunpla Card",
      icon: <IconDeviceFloppy className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
      onClick: handleSaveGunplaCard
    },
    {
      title: "Save as PNG",
      icon: <IconDownload className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
      onClick: () => handleSave("png")
    },
    {
      title: "Save as JPG",
      icon: <IconDownload className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
      onClick: () => handleSave("jpeg")
    }
  ];

  const cropModeItems = [
    {
      title: "Cancel",
      icon: <IconX className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
      onClick: handleCancelCrop
    },
    {
      title: "Reset Crop",
      icon: <IconRefresh className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
      onClick: handleResetCrop
    },
    {
      title: "Confirm Crop",
      icon: <IconCheck className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
      onClick: handleConfirmCrop
    }
  ];

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Upload Images */}
      <div className="w-48 border-r bg-muted/30 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-3">Images</h3>
          <UploadPanel onSetBase={() => setIsCropping(true)} />
        </div>
      </div>

      {/* Cutouts Section */}
      <div className="w-48 border-r bg-muted/20 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-3">Cutouts</h3>
          <CutoutsSidebar />
        </div>
      </div>

      {/* Main Section - Fill Available Space */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {/* Floating Header Section */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div>
            <h2 className="text-xl font-semibold mb-1 text-muted-foreground drop-shadow-lg">
              {isCropping ? "Re-cropping Base Image" : isPreviewMode ? "Previewing Final Image" : !baseCard ? "Getting Started" : "Editing Gunpla Card"}
            </h2>
            <p className="text-sm text-muted-foreground drop-shadow-lg">
              {isCropping
                ? "Adjust the crop area for your base image"
                : isPreviewMode
                  ? "Review your final gunpla card design"
                  : !baseCard
                    ? "Select a base image to begin creating your gunpla card"
                    : "Drag and position cutouts on your base card"
              }
            </p>
          </div>
        </div>

        {/* Main Content Area - Reserve space for floating dock when base card exists */}
        <div className={`flex-1 flex flex-col items-center justify-center p-4 ${baseCard ? 'pb-24' : ''}`}>
          {isCropping ? (
            <BaseCardPanel
              onConfirmCrop={handleExitCrop}
              onConfirmRef={handleSetConfirmFunction}
              onResetRef={handleSetResetFunction}
            />
          ) : (
            <>
              {isPreviewMode ? (
                <PreviewPanel />
              ) : !baseCard ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto mb-6 bg-muted/50 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Base Image Selected</h3>
                    <p className="text-muted-foreground mb-4">
                      Select a base image from the images sidebar to start building your gunpla card.
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Upload images using the drag & drop area</p>
                      <p>• Click &quot;Set as Base&quot; on any uploaded image</p>
                      <p>• List of images related to the kit are also available for you to select as base kit</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div ref={canvasContainerRef} className="w-full h-full flex items-center justify-center">
                  {canvasDimensions && (
                    <StageCanvas
                      maxWidth={canvasDimensions.width}
                      maxHeight={canvasDimensions.height}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Dock - Fixed at bottom with proper spacing */}
        {baseCard && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <FloatingDock
              items={
                isCropping
                  ? cropModeItems
                  : isPreviewMode
                    ? previewModeItems
                    : editModeItems
              }
              desktopClassName="translate-y-0"
            />
          </div>
        )}

        {/* Overwrite Confirmation Dialog */}
        <Dialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Overwrite Existing Gunpla Card</DialogTitle>
              <DialogDescription>
                You already have a gunpla card for this kit. You can only have 1 gunpla card per kit.
                If you want to save this new card, it will delete your previous gunpla card for this kit.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowOverwriteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleOverwriteConfirm}
              >
                Overwrite Previous Card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gunpla Card Saved Successfully!</DialogTitle>
              <DialogDescription>
                Your gunpla card has been saved successfully. You can find it in your profile or create another one for a different kit.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowSuccessDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Right Sidebar - Selected Cutout Options */}
      <div className="w-80 border-l bg-muted/30 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-3">Options</h3>
          <CutoutPropertiesPanel />
        </div>
      </div>
    </div>
  );
};


