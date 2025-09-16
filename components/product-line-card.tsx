"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductLineCardProps {
  productLine: {
    id: string;
    name: string;
    slug: string | null;
    description: string | null;
    gradeName: string;
    kitsCount: number;
    scrapedImage: string | null;
  };
}

export function ProductLineCard({ productLine }: ProductLineCardProps) {
  const hasImage = productLine.scrapedImage;
  const imageUrl = hasImage ? productLine.scrapedImage : null;

  return (
    <Link href={`/product-lines/${productLine.slug}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
        {imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
            <Image
              src={imageUrl}
              alt={productLine.name}
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
          <CardTitle className="text-xl">{productLine.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {productLine.gradeName} Product Line
          </CardDescription>
          {productLine.description && (
            <CardDescription className="line-clamp-3">
              {productLine.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {productLine.kitsCount} kits
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
