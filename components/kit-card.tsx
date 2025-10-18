"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { KitImage } from "@/components/kit-image";
import {
  Calendar,
  Tag,
  Heart,
  ShoppingCart,
  Clock,
  Wrench,
  CheckCircle,
} from "lucide-react";
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
    userCollection?: {
      status: CollectionStatus;
      notes?: string | null;
      price?: number | null;
      acquiredAt?: Date | null;
    } | null;
  };
  collectionStatus?: CollectionStatus | null;
  className?: string;
}

const KitCard = memo(function KitCard({
  kit,
  collectionStatus,
  className,
}: KitCardProps) {
  const formatPrice = (priceYen: number | null | undefined) => {
    if (!priceYen) return null;
    return `¥${priceYen.toLocaleString()}`;
  };

  const formatReleaseDate = (date: Date | null | undefined) => {
    if (!date) return "TBA";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getCollectionStatusIcon = (status: CollectionStatus) => {
    switch (status) {
      case "WISHLIST":
        return <Heart className="h-4 w-4" />;
      case "PREORDER":
        return <ShoppingCart className="h-4 w-4" />;
      case "BACKLOG":
        return <Clock className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <Wrench className="h-4 w-4" />;
      case "BUILT":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getCollectionStatusColor = (status: CollectionStatus) => {
    switch (status) {
      case "WISHLIST":
        return "text-pink-500 bg-pink-50 border-pink-200";
      case "PREORDER":
        return "text-blue-500 bg-blue-50 border-blue-200";
      case "BACKLOG":
        return "text-orange-500 bg-orange-50 border-orange-200";
      case "IN_PROGRESS":
        return "text-yellow-500 bg-yellow-50 border-yellow-200";
      case "BUILT":
        return "text-green-500 bg-green-50 border-green-200";
      default:
        return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  const cardContent = (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer py-0 h-full flex flex-col",
        "hover:shadow-xl hover:border-primary/20",
        "bg-card border-border",
        className
      )}
      style={{
        contain: "layout style paint",
        contentVisibility: "auto",
      }}
    >
      {/* Kit Image */}
      <div className="relative overflow-hidden">
        <KitImage
          src={kit.boxArt?.split("/revision")[0] || ""}
          alt={kit.name}
          className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-105"
        />

        {/* Collection Status Icon */}
        {kit.userCollection?.status && (
          <div className="absolute bottom-2 right-2">
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full border shadow-sm",
                getCollectionStatusColor(kit.userCollection.status)
              )}
            >
              {getCollectionStatusIcon(kit.userCollection.status)}
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Kit Name */}
        <div>
          <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {kit.name}
          </h3>
          {kit.variant && (
            <p className="text-sm text-muted-foreground mt-1">{kit.variant}</p>
          )}
          {kit.productLine && (
            <p className="text-sm text-muted-foreground mt-1">
              {kit.productLine}
            </p>
          )}
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
              {kit.mobileSuits.slice(0, 2).map((mobileSuit, index) => (
                <span key={mobileSuit}>
                  <Link
                    href={`/mobile-suits/${mobileSuit
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="hover:text-primary hover:underline transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {mobileSuit}
                  </Link>
                  {index < Math.min(kit.mobileSuits.length, 2) - 1 && ", "}
                </span>
              ))}
              {kit.mobileSuits.length > 2 &&
                ` +${kit.mobileSuits.length - 2} more`}
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
});

export { KitCard };
