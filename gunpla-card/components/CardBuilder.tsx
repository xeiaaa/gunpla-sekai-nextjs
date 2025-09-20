"use client";

import React from "react";
import { CutoutPropertiesPanel } from "@/gunpla-card/components/CutoutPropertiesPanel";
import { UploadPanel } from "@/gunpla-card/components/upload/UploadPanel";
import { CutoutsSidebar } from "@/gunpla-card/components/CutoutsSidebar";
import { BaseCardPanel } from "@/gunpla-card/components/basecard/BaseCardPanel";
import { useCardBuilder } from "@/gunpla-card/context";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconArrowLeft,
  IconDownload,
  IconEye,
  IconX,
  IconRefresh,
  IconCheck,
  IconCrop
} from "@tabler/icons-react";
import dynamic from "next/dynamic";

const StageCanvas = dynamic(() => import("@/gunpla-card/components/cutouts/StageCanvas"), { ssr: false });
const PreviewPanel = dynamic(() => import("@/gunpla-card/components/preview/PreviewPanel").then(mod => ({ default: mod.PreviewPanel })), { ssr: false });

export const CardBuilder: React.FC = () => {
  const { baseCard } = useCardBuilder();
  const [isCropping, setIsCropping] = React.useState(false);
  const [isPreviewMode, setIsPreviewMode] = React.useState(false);
  const [confirmCropFunction, setConfirmCropFunction] = React.useState<(() => void) | null>(null);
  const [resetCropFunction, setResetCropFunction] = React.useState<(() => void) | null>(null);
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = React.useState<{ width: number; height: number } | null>(null);

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
          <h3 className="font-semibold text-sm mb-3">Upload Images</h3>
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
              {isCropping ? "Re-cropping Base Image" : isPreviewMode ? "Previewing Final Image" : "Editing Gunpla Card"}
            </h2>
            <p className="text-sm text-muted-foreground drop-shadow-lg">
              {isCropping
                ? "Adjust the crop area for your base image"
                : isPreviewMode
                  ? "Review your final gunpla card design"
                  : "Drag and position cutouts on your base card"
              }
            </p>
          </div>
        </div>

        {/* Main Content Area - Reserve space for floating dock */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 pb-24">
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


