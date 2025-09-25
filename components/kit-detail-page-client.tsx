"use client";

import { KitDetailPage } from "@/components/kit-detail-page";
import { useKitCollectionStatus, useIsAdmin } from "@/hooks/use-kit-detail";

interface KitDetailPageClientProps {
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
    expansions: Array<{
      id: string;
      name: string;
      slug: string | null;
      number: string;
      variant: string | null;
      boxArt: string | null;
      grade: string | null;
      productLine: string | null;
      series: string | null;
    }>;
    expandedBy: Array<{
      id: string;
      name: string;
      slug: string | null;
      number: string;
      variant: string | null;
      boxArt: string | null;
      grade: string | null;
      productLine: string | null;
      series: string | null;
    }>;
  };
}

export function KitDetailPageClient({ kit }: KitDetailPageClientProps) {
  // Only fetch user-specific data on the client
  const { data: collectionStatus } = useKitCollectionStatus(kit.id);
  const { data: isAdmin } = useIsAdmin();

  return (
    <KitDetailPage
      kit={kit}
      collectionStatus={collectionStatus}
      isAdmin={isAdmin}
    />
  );
}
