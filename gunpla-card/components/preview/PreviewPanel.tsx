"use client";

import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const StageCanvas = dynamic(
  () => import("@/gunpla-card/components/cutouts/StageCanvas"),
  { ssr: false }
);

export const PreviewPanel: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

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
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div className="space-y-4">
      <div
        ref={canvasContainerRef}
        className="w-full h-full flex items-center justify-center"
      >
        {canvasDimensions && (
          <StageCanvas
            maxWidth={canvasDimensions.width}
            maxHeight={canvasDimensions.height}
            isPreviewMode={true}
          />
        )}
      </div>
    </div>
  );
};
