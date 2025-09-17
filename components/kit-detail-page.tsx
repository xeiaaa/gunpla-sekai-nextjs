"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KitImage } from "@/components/kit-image";
import { CollectionControls } from "@/components/collection-controls";
import { ReviewSection } from "@/components/review-section";
import StartBuildButton from "@/components/start-build-button";
import CommunityBuilds from "@/components/community-builds";
import {
  Calendar,
  DollarSign,
  Tag,
  ExternalLink,
  ArrowLeft,
  Package,
  Users,
  Info,
  MessageSquare,
  Hammer
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CollectionStatus } from "@/generated/prisma";

interface KitDetailPageProps {
  kit: {
    id: string;
    name: string;
    slug: string | null;
    number: string;
    variant?: string | null;
    releaseDate?: Date | null;
    priceYen?: number | null;
    region?: string | null;
    boxArt?: string | null;
    notes?: string | null;
    manualLinks: string[];
    scrapedImages: string[];
    grade: string | null;
    productLine?: {
      name: string;
      logo?: string | null;
    } | null;
    series?: string | null;
    seriesSlug?: string | null;
    releaseType?: string | null;
    releaseTypeSlug?: string | null;
    baseKit?: {
      id: string;
      name: string;
      slug: string | null;
      number: string;
      boxArt?: string | null;
      grade: string | null;
    } | null;
    variants: Array<{
      id: string;
      name: string;
      slug: string | null;
      number: string;
      variant?: string | null;
      boxArt?: string | null;
      releaseDate?: Date | null;
      priceYen?: number | null;
      grade: string | null;
    }>;
    mobileSuits: Array<{
      id: string;
      name: string;
      slug: string;
      description?: string | null;
      scrapedImages: string[];
      series?: string | null;
    }>;
    uploads: Array<{
      id: string;
      url: string;
      type: string;
      title?: string | null;
      description?: string | null;
      createdAt: Date;
    }>;
    otherVariants: Array<{
      id: string;
      name: string;
      slug: string | null;
      number: string;
      variant?: string | null;
      boxArt?: string | null;
      releaseDate?: Date | null;
      priceYen?: number | null;
      grade: string | null;
    }>;
  };
  collectionStatus?: CollectionStatus | null;
}

export function KitDetailPage({ kit, collectionStatus }: KitDetailPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'builds'>('overview');

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

  const allImages = [
    kit.boxArt,
    ...kit.scrapedImages
  ].filter(Boolean);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Info },
    { id: 'reviews' as const, label: 'Reviews', icon: MessageSquare },
    { id: 'builds' as const, label: 'Builds', icon: Hammer },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Kit Info */}
            <Card>
              <CardHeader>
                <CardTitle>Kit Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Release Date:</span>
                    <span className="font-medium">{formatReleaseDate(kit.releaseDate)}</span>
                  </div>

                  {kit.priceYen && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-medium">{formatPrice(kit.priceYen)}</span>
                    </div>
                  )}

                  {kit.region && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Region:</span>
                      <span className="font-medium">{kit.region}</span>
                    </div>
                  )}

                  {kit.series && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Series:</span>
                      {kit.seriesSlug ? (
                        <Link href={`/series/${kit.seriesSlug}`} className="font-medium text-primary hover:underline">
                          {kit.series}
                        </Link>
                      ) : (
                        <span className="font-medium">{kit.series}</span>
                      )}
                    </div>
                  )}

                  {kit.releaseType && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Release Type:</span>
                      {kit.releaseTypeSlug ? (
                        <Link href={`/release-types/${kit.releaseTypeSlug}`} className="font-medium text-primary hover:underline">
                          {kit.releaseType}
                        </Link>
                      ) : (
                        <span className="font-medium">{kit.releaseType}</span>
                      )}
                    </div>
                  )}
                </div>

                {kit.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{kit.notes}</p>
                  </div>
                )}

                {kit.manualLinks.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Manual Links</h4>
                    <div className="space-y-1">
                      {kit.manualLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Manual {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mobile Suits */}
            {kit.mobileSuits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{kit.mobileSuits.length === 1 ? "Mobile Suit" : "Mobile Suits"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kit.mobileSuits.map((mobileSuit) => (
                      <Link key={mobileSuit.id} href={`/mobile-suits/${mobileSuit.slug}`}>
                        <div className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="w-16 h-16 flex-shrink-0">
                            <KitImage
                              src={mobileSuit.scrapedImages[0] || ''}
                              alt={mobileSuit.name}
                              className="w-full h-full rounded-md"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{mobileSuit.name}</h4>
                            {mobileSuit.series && (
                              <p className="text-sm text-muted-foreground">{mobileSuit.series}</p>
                            )}
                            {mobileSuit.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {mobileSuit.description}
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

            {/* Base Kit */}
            {kit.baseKit && (
              <Card>
                <CardHeader>
                  <CardTitle>Base Kit</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/kits/${kit.baseKit.slug}`}>
                    <div className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-20 h-20 flex-shrink-0">
                        <KitImage
                          src={kit.baseKit.boxArt || ''}
                          alt={kit.baseKit.name}
                          className="w-full h-full rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{kit.baseKit.name}</h4>
                        <p className="text-sm text-muted-foreground">#{kit.baseKit.number}</p>
                        <p className="text-sm text-muted-foreground">{kit.baseKit.grade}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Variants */}
            {kit.variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Variants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kit.variants.map((variant) => (
                      <Link key={variant.id} href={`/kits/${variant.slug}`}>
                        <div className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="w-16 h-16 flex-shrink-0">
                            <KitImage
                              src={variant.boxArt || ''}
                              alt={variant.name}
                              className="w-full h-full rounded-md"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{variant.name}</h4>
                            {variant.variant && (
                              <p className="text-sm text-muted-foreground">{variant.variant}</p>
                            )}
                            <p className="text-sm text-muted-foreground">#{variant.number}</p>
                            <p className="text-sm text-muted-foreground">{variant.grade}</p>
                            {variant.releaseDate && (
                              <p className="text-sm text-muted-foreground">
                                {formatReleaseDate(variant.releaseDate)}
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

            {/* Other Variants */}
            {kit.otherVariants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Other Variants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kit.otherVariants.map((otherVariant) => (
                      <Link key={otherVariant.id} href={`/kits/${otherVariant.slug}`}>
                        <div className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="w-16 h-16 flex-shrink-0">
                            <KitImage
                              src={otherVariant.boxArt || ''}
                              alt={otherVariant.name}
                              className="w-full h-full rounded-md"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{otherVariant.name}</h4>
                            {otherVariant.variant && (
                              <p className="text-sm text-muted-foreground">{otherVariant.variant}</p>
                            )}
                            <p className="text-sm text-muted-foreground">#{otherVariant.number}</p>
                            <p className="text-sm text-muted-foreground">{otherVariant.grade}</p>
                            {otherVariant.releaseDate && (
                              <p className="text-sm text-muted-foreground">
                                {formatReleaseDate(otherVariant.releaseDate)}
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

            {/* Uploads */}
            {kit.uploads.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Community Uploads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kit.uploads.map((upload) => (
                      <div key={upload.id} className="space-y-2">
                        <div className="aspect-square relative rounded-lg overflow-hidden">
                          <KitImage
                            src={upload.url}
                            alt={upload.title || `Upload ${upload.type}`}
                            className="w-full h-full"
                          />
                        </div>
                        <div>
                          {upload.title && (
                            <h4 className="font-medium text-sm truncate">{upload.title}</h4>
                          )}
                          <p className="text-xs text-muted-foreground capitalize">{upload.type}</p>
                          {upload.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {upload.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'reviews':
        return (
          <ReviewSection
            kitId={kit.id}
            kitName={kit.name}
            kitSlug={kit.slug || kit.id}
          />
        );

      case 'builds':
        return (
          <CommunityBuilds
            kitId={kit.id}
            kitSlug={kit.slug}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/kits">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Kits
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Actions */}
        <div className="lg:col-span-1 space-y-4">
          {/* Main Image */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-[4/3] relative">
                <KitImage
                  src={allImages[selectedImageIndex] || ''}
                  alt={kit.name}
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
                    alt={`${kit.name} - Image ${index + 1}`}
                    className="w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Collection Controls */}
          <CollectionControls
            kitId={kit.id}
            currentStatus={collectionStatus}
          />

          {/* Start Build Button */}
          <StartBuildButton
            kit={kit}
          />
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2">
          {/* Kit Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-medium">
                {kit.grade}
              </span>
              {kit.productLine && (
                <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm font-medium border">
                  {kit.productLine.name}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{kit.name}</h1>
            {kit.variant && (
              <p className="text-lg text-muted-foreground mb-2">{kit.variant}</p>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span className="text-lg font-medium">#{kit.number}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
