"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MobileSuitCardProps {
  mobileSuit: {
    id: string;
    name: string;
    slug: string | null;
    description: string | null;
    kitsCount: number;
    scrapedImages: string[];
  };
}

export function MobileSuitCard({ mobileSuit }: MobileSuitCardProps) {
  const hasImage = mobileSuit.scrapedImages.length > 0;
  const imageUrl = hasImage ? mobileSuit.scrapedImages[0] : null;

  return (
    <Link href={`/mobile-suits/${mobileSuit.slug}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
        {imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
            <Image
              src={imageUrl}
              alt={mobileSuit.name}
              fill
              className="object-contain transition-transform duration-200 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-xl">{mobileSuit.name}</CardTitle>
          {mobileSuit.description && (
            <CardDescription className="line-clamp-3">
              {mobileSuit.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{mobileSuit.kitsCount} kits</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
