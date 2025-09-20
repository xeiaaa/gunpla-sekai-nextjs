"use client";

import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ImageInfoProps {
  src: string;
  className?: string;
}

export function ImageInfo({ src, className }: ImageInfoProps) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number; ratio: number } | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (src) {
      const img = new window.Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        setDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
          ratio: Math.round(ratio * 100) / 100
        });
      };
      img.src = src;
    }
  }, [src]);

  if (!dimensions) return null;

  const getAspectRatioLabel = (ratio: number) => {
    if (ratio > 1.5) return "Landscape";
    if (ratio > 1.2) return "Video (16:9)";
    if (ratio > 0.8) return "Square";
    return "Portrait";
  };

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowInfo(!showInfo)}
        className="text-gray-400 hover:text-gray-600"
      >
        <Info className="w-3 h-3" />
      </Button>

      {showInfo && (
        <div className="absolute top-8 right-2 bg-black/80 text-white text-xs p-2 rounded z-10 min-w-[120px]">
          <div className="space-y-1">
            <div>{dimensions.width} × {dimensions.height}</div>
            <div>Ratio: {dimensions.ratio}:1</div>
            <Badge variant="secondary" className="text-xs">
              {getAspectRatioLabel(dimensions.ratio)}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
