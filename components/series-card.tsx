"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SeriesCardProps {
  series: {
    id: string;
    name: string;
    slug: string | null;
    description: string | null;
    mobileSuitsCount: number;
    kitsCount: number;
    scrapedImages: string[];
  };
}

export function SeriesCard({ series }: SeriesCardProps) {
  const hasImage = series.scrapedImages.length > 0;
  const imageUrl = hasImage ? series.scrapedImages[0] : null;

  return (
    <Link href={`/series/${series.slug}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
        {imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
            <Image
              src={imageUrl}
              alt={series.name}
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
          <CardTitle className="text-xl">{series.name}</CardTitle>
          {series.description && (
            <CardDescription className="line-clamp-3">
              {series.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{series.mobileSuitsCount} mobile suits</span>
            <span>{series.kitsCount} kits</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
