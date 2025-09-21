"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface KitImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export function KitImage({ src, alt, className = "" }: KitImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);

  const handleImageError = () => {
    console.error("Image failed to load:", src);
    setImageError(true);
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    setIsPortrait(aspectRatio < 1);
  };

  useEffect(() => {
    if (src) {
      setIsPortrait(null); // Reset when src changes
    }
  }, [src]);

  if (!src || imageError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 bg-muted-foreground/20 rounded mb-2 mx-auto"></div>
          <p className="text-xs">Kit Image</p>
        </div>
      </div>
    );
  }

  // Determine object position based on orientation
  const objectPosition =
    isPortrait === null
      ? "center" // Default while loading
      : isPortrait
      ? "center 10%" // Portrait: 5% from top
      : "center"; // Landscape: center

  return (
    <div className={`relative ${className} bg-muted`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        style={{ objectPosition }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
    </div>
  );
}
