"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

type DisplayMode = "contain" | "cover" | "fit";

interface AdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
  maxHeight?: number;
  minHeight?: number;
  fallbackAspectRatio?: "video" | "square" | "auto";
  displayMode?: DisplayMode;
  priority?: boolean;
}

export function AdaptiveImage({
  src,
  alt,
  className,
  maxHeight = 500,
  minHeight = 200,
  fallbackAspectRatio = "video",
  displayMode = "fit",
  priority = false
}: AdaptiveImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (src) {
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoaded(true);
      };
      img.src = src;
    }
  }, [src]);

  const getAspectRatio = () => {
    if (!imageDimensions) return fallbackAspectRatio;

    const { width, height } = imageDimensions;
    const ratio = width / height;

    // Determine aspect ratio based on image dimensions
    if (ratio > 1.5) return "landscape"; // Very wide images
    if (ratio > 1.2) return "video"; // Standard video ratio
    if (ratio > 0.8) return "square"; // Square-ish images
    return "portrait"; // Tall images
  };

  const aspectRatio = getAspectRatio();

  if (imageError) {
    return (
      <div className={cn(
        "bg-gray-200 flex items-center justify-center",
        fallbackAspectRatio === "video" && "aspect-video",
        fallbackAspectRatio === "square" && "aspect-square",
        fallbackAspectRatio === "auto" && "min-h-[200px]",
        className
      )}>
        <Camera className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  if (!imageLoaded || !imageDimensions) {
    return (
      <div className={cn(
        "bg-gray-100 animate-pulse flex items-center justify-center",
        fallbackAspectRatio === "video" && "aspect-video",
        fallbackAspectRatio === "square" && "aspect-square",
        fallbackAspectRatio === "auto" && "min-h-[200px]",
        className
      )}>
        <Camera className="w-8 h-8 text-gray-300" />
      </div>
    );
  }

  // Handle different display modes
  if (displayMode === "contain") {
    // Always show full image with object-contain
    return (
      <div className={cn("relative bg-gray-50 flex items-center justify-center", className)}>
        <Image
          src={src}
          alt={alt}
          width={imageDimensions.width}
          height={imageDimensions.height}
          className="max-w-full h-auto object-contain"
          style={{
            maxHeight: `${maxHeight}px`,
            minHeight: `${minHeight}px`
          }}
          priority={priority}
        />
      </div>
    );
  }

  if (displayMode === "cover") {
    // Always fill container with object-cover
    return (
      <div className={cn("relative overflow-hidden bg-gray-50", className)}>
        <div className="aspect-video relative">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            priority={priority}
          />
        </div>
      </div>
    );
  }

  // Smart fit mode (default) - adapts based on image ratio
  // For very wide images (like panoramas), use object-cover to prevent excessive height
  if (aspectRatio === "landscape") {
    return (
      <div className={cn("relative overflow-hidden bg-gray-50", className)}>
        <div className="aspect-video relative">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            priority={priority}
          />
        </div>
      </div>
    );
  }

  // For portrait images, use object-contain to show the full image
  if (aspectRatio === "portrait") {
    return (
      <div className={cn("relative bg-gray-50 flex items-center justify-center", className)}>
        <Image
          src={src}
          alt={alt}
          width={imageDimensions.width}
          height={imageDimensions.height}
          className="max-w-full h-auto object-contain"
          style={{
            maxHeight: `${maxHeight}px`,
            minHeight: `${minHeight}px`
          }}
          priority={priority}
        />
      </div>
    );
  }

  // For square and video ratio images, use object-contain with appropriate container
  return (
    <div className={cn("relative bg-gray-50", className)}>
      <div className={cn(
        "relative w-full",
        aspectRatio === "video" && "aspect-video",
        aspectRatio === "square" && "aspect-square"
      )}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          priority={priority}
        />
      </div>
    </div>
  );
}
