"use client";

import { KitDetailPage } from "@/components/kit-detail-page";
import {
  useKitDetail,
  useKitCollectionStatus,
  useIsAdmin,
} from "@/hooks/use-kit-detail";
import { notFound } from "next/navigation";

interface KitDetailPageClientProps {
  slug: string;
  initialKit?: unknown; // Type this properly based on your kit interface
}

export function KitDetailPageClient({
  slug,
  initialKit,
}: KitDetailPageClientProps) {
  const {
    data: kit,
    isLoading: kitLoading,
    error: kitError,
  } = useKitDetail(slug, initialKit);
  const { data: collectionStatus } = useKitCollectionStatus(kit?.id || "");
  const { data: isAdmin } = useIsAdmin();

  // Handle loading states
  if (kitLoading && !kit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading kit details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error states
  if (kitError) {
    return notFound();
  }

  // Handle not found
  if (!kit) {
    return notFound();
  }

  return (
    <KitDetailPage
      kit={kit}
      collectionStatus={collectionStatus}
      isAdmin={isAdmin}
    />
  );
}
