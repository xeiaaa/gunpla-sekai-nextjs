"use client";

import { useState } from "react";
import Image from "next/image";

interface KitImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export function KitImage({ src, alt, className = "" }: KitImageProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error('Image failed to load:', src);
    setImageError(true);
  };

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

  return (
    <div className={`relative ${className} bg-muted`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        onError={handleImageError}
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
    </div>
  );
}
