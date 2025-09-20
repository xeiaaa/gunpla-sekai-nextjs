"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Camera } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  showIndicators?: boolean;
  showNavigation?: boolean;
  aspectRatio?: "video" | "square" | "auto";
}

export function ImageCarousel({
  images,
  alt,
  className,
  showIndicators = true,
  showNavigation = true,
  aspectRatio = "video"
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images.length) {
    return (
      <div className={cn(
        "bg-gray-200 flex items-center justify-center",
        aspectRatio === "video" && "aspect-video",
        aspectRatio === "square" && "aspect-square",
        className
      )}>
        <Camera className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={cn("relative group overflow-hidden", className)}>
      <div className={cn(
        "relative bg-gray-50",
        aspectRatio === "video" && "aspect-video",
        aspectRatio === "square" && "aspect-square",
        aspectRatio === "auto" && "w-full"
      )}>
        {aspectRatio === "auto" ? (
          <Image
            src={images[currentIndex]}
            alt={alt}
            width={800}
            height={600}
            className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
            style={{ maxHeight: '500px' }}
          />
        ) : (
          <Image
            src={images[currentIndex]}
            alt={alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        {/* Navigation Arrows */}
        {showNavigation && images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {showIndicators && images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {images.length}
          </div>
        )}

        {/* Dot Indicators */}
        {showIndicators && images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/75"
                )}
                onClick={() => goToImage(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
