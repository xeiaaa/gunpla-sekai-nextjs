"use client";

import React, { useCallback, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import { useCardBuilder } from "@/gunpla-card/context";
import { Button } from "@/components/ui/button";

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

export const BaseCardPanel: React.FC = () => {
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

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixelsArg) => {
    setCroppedAreaPixels(croppedAreaPixelsArg);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!baseUrl || !croppedAreaPixels) return;
    const aspect = 63 / 88; // width/height ratio for Pokemon card
    const result = await getCroppedImg(baseUrl, crop, zoom, aspect, croppedAreaPixels);
    if (result) setBaseCrop(result);
  }, [baseUrl, croppedAreaPixels, crop, zoom, setBaseCrop]);

  if (!baseUrl) return <div>Please choose a base image in Upload tab.</div>;

  const aspect = 63 / 88;

  return (
    <div className="space-y-4">
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
      <div className="flex gap-2">
        <Button onClick={handleConfirm}>Confirm Crop</Button>
        <Button variant="secondary" onClick={replaceBase}>Replace Base</Button>
      </div>
    </div>
  );
};


