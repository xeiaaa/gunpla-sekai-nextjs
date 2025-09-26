"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { pipeThroughCloudinary } from "@/lib/cloudinary-client";

interface KitImageProps {
  src?: string;
  alt: string;
  className?: string;
  isContain?: boolean;
  width?: number; // Width for Cloudinary optimization
}

export function KitImage({
  src,
  alt,
  className = "",
  isContain = false,
  width = 600,
}: KitImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);

  // Handle Cloudinary URL processing
  const getProcessedSrc = (src: string) => {
    if (!src) return src;

    // If it's already a Cloudinary URL, add width parameter before q_auto
    if (src.startsWith("https://res.cloudinary.com/")) {
      return src.replace("q_auto", `w_${width},q_auto`);
    }

    // Otherwise, use pipeThroughCloudinary with the specified width
    return pipeThroughCloudinary(src, `w_${width},q_auto,f_auto`);
  };

  const processedSrc = getProcessedSrc(src || "");

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
    if (processedSrc) {
      setIsPortrait(null); // Reset when src changes
    }
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
  const objectPosition =
    isPortrait === null
      ? "center" // Default while loading
      : isPortrait
      ? "center 10%" // Portrait: 10% from top
      : "center"; // Landscape: center

  return (
    <div className={`relative ${className} bg-muted`}>
      <Image
        src={processedSrc}
        alt={alt}
        fill
        className={isContain ? "object-contain" : "object-cover"}
        style={isContain ? undefined : { objectPosition }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
    </div>
  );
}
