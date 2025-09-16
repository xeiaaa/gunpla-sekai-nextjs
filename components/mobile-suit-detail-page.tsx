"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KitImage } from "@/components/kit-image";
import {
  ArrowLeft,
  Users,
  Package,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MobileSuitDetailPageProps {
  mobileSuit: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    series?: {
      id: string;
      name: string;
      slug: string;
      timeline?: {
        id: string;
        name: string;
        slug: string;
      } | null;
    } | null;
    kitsCount: number;
    scrapedImages: string[];
    kits: Array<{
      id: string;
      name: string;
      slug: string;
      number: string;
      variant?: string | null;
      releaseDate?: Date | null;
      priceYen?: number | null;
      boxArt?: string | null;
      grade: string;
      productLine?: string | null;
      releaseType?: string | null;
    }>;
  };
}

export function MobileSuitDetailPage({ mobileSuit }: MobileSuitDetailPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const formatPrice = (priceYen: number | null | undefined) => {
    if (!priceYen) return null;
    return `¥${priceYen.toLocaleString()}`;
  };

  const formatReleaseDate = (date: Date | null | undefined) => {
    if (!date) return "TBA";
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const allImages = mobileSuit.scrapedImages.filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href={mobileSuit.series ? `/series/${mobileSuit.series.slug}` : "/timelines"}>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to {mobileSuit.series ? mobileSuit.series.name : "Series"}
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images */}
        <div className="lg:col-span-1 space-y-4">
          {/* Main Image */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-[4/3] relative">
                <KitImage
                  src={allImages[selectedImageIndex] || ''}
                  alt={mobileSuit.name}
                  className="w-full h-full rounded-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Thumbnails */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "aspect-square relative rounded-md overflow-hidden border-2 transition-colors",
                    selectedImageIndex === index
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <KitImage
                    src={image || ''}
                    alt={`${mobileSuit.name} - Image ${index + 1}`}
                    className="w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mobile Suit Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{mobileSuit.name}</h1>
            {mobileSuit.series && (
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">From </span>
                <Link
                  href={`/series/${mobileSuit.series.slug}`}
                  className="text-primary hover:underline"
                >
                  {mobileSuit.series.name}
                </Link>
                {mobileSuit.series.timeline && (
                  <>
                    <span className="text-muted-foreground"> • </span>
                    <Link
                      href={`/timelines/${mobileSuit.series.timeline.slug}`}
                      className="text-primary hover:underline"
                    >
                      {mobileSuit.series.timeline.name} timeline
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Suit Info */}
          <Card>
            <CardHeader>
              <CardTitle>Mobile Suit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Available Kits:</span>
                <span className="font-medium">{mobileSuit.kitsCount}</span>
              </div>

              {mobileSuit.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{mobileSuit.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Kits */}
          {mobileSuit.kits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Kits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mobileSuit.kits.map((kit) => (
                    <Link key={kit.id} href={`/kits/${kit.slug}`}>
                      <div className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="w-16 h-16 flex-shrink-0">
                          <KitImage
                            src={kit.boxArt || ''}
                            alt={kit.name}
                            className="w-full h-full rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{kit.name}</h4>
                          {kit.variant && (
                            <p className="text-sm text-muted-foreground">{kit.variant}</p>
                          )}
                          <p className="text-sm text-muted-foreground">#{kit.number}</p>
                          <p className="text-sm text-muted-foreground">{kit.grade}</p>
                          {kit.releaseDate && (
                            <p className="text-sm text-muted-foreground">
                              {formatReleaseDate(kit.releaseDate)}
                            </p>
                          )}
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
