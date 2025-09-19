"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { KitImage } from "@/components/kit-image";
import { CollectionControlsCompact } from "@/components/collection-controls";
import { Calendar, DollarSign, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollectionStatus } from "@/generated/prisma";
import Link from "next/link";

interface KitCardProps {
  kit: {
    id: string;
    name: string;
    slug?: string | null;
    number: string;
    variant?: string | null;
    releaseDate?: Date | null;
    priceYen?: number | null;
    boxArt?: string | null;
    grade?: string | null;
    productLine?: string | null;
    series?: string | null;
    releaseType?: string | null;
    mobileSuits: string[];
  };
  collectionStatus?: CollectionStatus | null;
  className?: string;
}

export function KitCard({
  kit,
  collectionStatus,
  className
}: KitCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (priceYen: number | null | undefined) => {
    if (!priceYen) return null;
    return `¥${priceYen.toLocaleString()}`;
  };

  const formatReleaseDate = (date: Date | null | undefined) => {
    if (!date) return "TBA";
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };


  const cardContent = (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer py-0 h-full flex flex-col",
        "hover:shadow-xl hover:scale-[1.02] hover:border-primary/20",
        "bg-card border-border",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* Kit Image */}
      <div className="relative">
        <KitImage
          src={kit.boxArt || ''}
          alt={kit.name}
          className="aspect-[4/3] w-full"
        />

        <div className="absolute bottom-2 px-2 flex gap-2 justify-between w-full flex-wrap">
          {/* Grade Badge */}
          {kit.grade && (
            <div className="">
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                {kit.grade}
              </div>
            </div>
          )}

          {/* Product Line Badge */}
          {kit.productLine && (
            <div className="">
              <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium shadow-sm border">
                {kit.productLine}
              </div>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Kit Name */}
        <div>
          <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {kit.name}
          </h3>
          {kit.variant && (
            <p className="text-sm text-muted-foreground mt-1">
              {kit.variant}
            </p>
          )}
        </div>

        {/* Kit Number */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Tag className="h-3 w-3" />
          <span>#{kit.number}</span>
        </div>

        {/* Release Date and Price */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatReleaseDate(kit.releaseDate)}</span>
          </div>

          {/* {kit.priceYen && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span className="font-medium">{formatPrice(kit.priceYen)}</span>
            </div>
          )} */}
        </div>

        {/* Series and Release Type */}
        {(kit.series || kit.releaseType) && (
          <div className="flex flex-wrap gap-1 text-xs">
            {kit.series && (
              <span className="bg-muted text-muted-foreground px-2 py-1 rounded">
                {kit.series}
              </span>
            )}
            {kit.releaseType && (
              <span className="bg-muted text-muted-foreground px-2 py-1 rounded">
                {kit.releaseType}
              </span>
            )}
          </div>
        )}

        {/* Mobile Suits (if any) */}
        {kit.mobileSuits.length > 0 && (
          <div className="pt-1 mt-auto">
            <div className="text-xs text-muted-foreground line-clamp-1">
              {kit.mobileSuits.slice(0, 2).join(", ")}
              {kit.mobileSuits.length > 2 && ` +${kit.mobileSuits.length - 2} more`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // If kit has a slug, wrap in Link, otherwise return card directly
  if (kit.slug) {
    return (
      <Link href={`/kits/${kit.slug}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
