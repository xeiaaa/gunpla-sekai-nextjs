"use client";

import { useState, useEffect, useMemo } from "react";
import { pipeThroughCloudinary } from "@/lib/cloudinary-client";

interface KitImageProps {
  src?: string;
  alt: string;
  className?: string;
  isContain?: boolean;
  width?: number; // Width for Cloudinary optimization
  priority?: boolean; // Allow overriding priority
}

export function KitImage({
  src,
  alt,
  className = "",
  isContain = false,
  width = 600,
  priority = false,
}: KitImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);

  // Handle Cloudinary URL processing - memoized to prevent unnecessary recalculation
  const processedSrc = useMemo(() => {
    if (!src) return "";

    // // TODO: bring back the cloudinary logic
    // return src;

    // If it's already a Cloudinary URL, add width parameter before q_auto
    if (src.startsWith("https://res.cloudinary.com/")) {
      return src.replace("q_auto", `w_${width},q_auto`);
    }

    // Otherwise, use pipeThroughCloudinary with the specified width
    return pipeThroughCloudinary(src, `w_${width},q_auto,f_auto`);
  }, [src, width]);

  const handleImageError = () => {
    console.error("Image failed to load:", processedSrc);
    setImageError(true);
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    setIsPortrait(aspectRatio < 1);
  };

  useEffect(() => {
    // Reset error state when src changes
    setImageError(false);
    // Don't reset isPortrait to prevent flickering
  }, [processedSrc]);

  if (!processedSrc || imageError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 bg-muted-foreground/20 rounded mb-2 mx-auto"></div>
          <p className="text-xs">Kit Image</p>
        </div>
      </div>
    );
  }

  // Determine object position based on orientation (only for cover mode)
  // Use a stable default to prevent layout shifts during loading
  const objectPosition = isPortrait ? "center 10%" : "center";

  return (
    <div className={`relative ${className} bg-muted`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={processedSrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full ${
          isContain ? "object-contain" : "object-cover"
        }`}
        style={isContain ? undefined : { objectPosition }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
}
