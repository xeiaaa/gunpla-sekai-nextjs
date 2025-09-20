"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import { useCardBuilder } from "@/gunpla-card/context";

function getCroppedImg(imageSrc: string, crop: { x: number; y: number }, zoom: number, aspect: number, areaPixels: { width: number; height: number; x: number; y: number }): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = areaPixels.width;
      canvas.height = areaPixels.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve("");

      ctx.drawImage(
        image,
        areaPixels.x,
        areaPixels.y,
        areaPixels.width,
        areaPixels.height,
        0,
        0,
        areaPixels.width,
        areaPixels.height
      );
      resolve(canvas.toDataURL("image/png"));
    };
    image.src = imageSrc;
  });
}

export const BaseCardPanel: React.FC<{ onConfirmCrop?: () => void; onConfirmRef?: (confirmFn: () => void) => void; onResetRef?: (resetFn: () => void) => void }> = ({ onConfirmCrop, onConfirmRef, onResetRef }) => {
  const { uploadedImages, baseCard, setBaseCrop, replaceBase } = useCardBuilder();
  const rawUrl = useMemo(() => baseCard?.croppedUrl ?? uploadedImages.find(i => i.isBase)?.url, [baseCard, uploadedImages]);
  const baseUrl = useMemo(() => {
    if (!rawUrl) return undefined;
    // Proxy remote images to avoid CORS tainting when drawing to canvas
    if (rawUrl.startsWith("http")) return `/api/gunpla-card/proxy-image?url=${encodeURIComponent(rawUrl)}`;
    return rawUrl;
  }, [rawUrl]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ width: number; height: number; x: number; y: number } | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixelsArg) => {
    setCroppedAreaPixels(croppedAreaPixelsArg);
    setHasUserInteracted(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!baseUrl || !croppedAreaPixels) {
      return;
    }
    const aspect = 63 / 88; // width/height ratio for Pokemon card
    const result = await getCroppedImg(baseUrl, crop, zoom, aspect, croppedAreaPixels);
    if (result) {
      setBaseCrop(result);
      onConfirmCrop?.();
    }
  }, [baseUrl, croppedAreaPixels, crop, zoom, setBaseCrop, onConfirmCrop]);

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setHasUserInteracted(false);
  }, []);

  // Expose the confirm function to parent component only when user has interacted
  useEffect(() => {
    if (hasUserInteracted && croppedAreaPixels) {
      onConfirmRef?.(handleConfirm);
    } else {
      // Clear the confirm function when conditions aren't met
      onConfirmRef?.(() => {});
    }
  }, [onConfirmRef, handleConfirm, croppedAreaPixels, hasUserInteracted]);

  // Expose the reset function to parent component
  useEffect(() => {
    onResetRef?.(handleReset);
    return () => {
      onResetRef?.(() => {});
    };
  }, [onResetRef, handleReset]);

  // Cleanup when component unmounts or when we want to clear the confirm function
  useEffect(() => {
    return () => {
      onConfirmRef?.(() => {});
    };
  }, [onConfirmRef]);

  if (!baseUrl) return <div>Please choose a base image in Upload tab.</div>;

  const aspect = 63 / 88;

  return (
    <div className="space-y-4 w-full max-w-4xl">
      <div className="relative w-full h-[60vh] bg-black/5">
        <Cropper
          image={baseUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid
        />
      </div>
    </div>
  );
};


