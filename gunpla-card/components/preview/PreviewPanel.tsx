"use client";

import React, { useCallback, useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const StageCanvas = dynamic(() => import("@/gunpla-card/components/cutouts/StageCanvas"), { ssr: false });

export const PreviewPanel: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number } | null>(null);

  // Calculate available space for canvas (same logic as CardBuilder)
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasContainerRef.current) {
        const container = canvasContainerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        setCanvasDimensions({ width: containerWidth, height: containerHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleSave = useCallback(async (type: "png" | "jpeg") => {
    const { toPng, toJpeg } = await import("html-to-image");
    const node = document.getElementById("card-canvas-container");
    if (!node) return;
    const dataUrl = type === "png" ? await toPng(node) : await toJpeg(node, { quality: 0.92 });
    const link = document.createElement("a");
    link.download = `gunpla-card.${type}`;
    link.href = dataUrl;
    link.click();
  }, []);

  return (
    <div className="space-y-4">
      <div ref={canvasContainerRef} className="w-full h-full flex items-center justify-center">
        {canvasDimensions && (
          <StageCanvas
            maxWidth={canvasDimensions.width}
            maxHeight={canvasDimensions.height}
          />
        )}
      </div>
    </div>
  );
};


