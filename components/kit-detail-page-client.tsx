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
  initialKit: any; // Type this properly based on your kit interface
}

export function KitDetailPageClient({
  slug,
  initialKit,
}: KitDetailPageClientProps) {
  const {
    data: kit,
    isLoading: kitLoading,
    error: kitError,
  } = useKitDetail(slug);
  const { data: collectionStatus, isLoading: collectionLoading } =
    useKitCollectionStatus(initialKit.id);
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  // Use initial data for SSR, then React Query takes over
  const currentKit = kit || initialKit;
  const currentCollectionStatus = collectionStatus;
  const currentIsAdmin = isAdmin;

  // Handle loading states
  if (kitLoading && !initialKit) {
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
  if (kitError && !initialKit) {
    return notFound();
  }

  // Handle not found
  if (!currentKit) {
    return notFound();
  }

  return (
    <KitDetailPage
      kit={currentKit}
      collectionStatus={currentCollectionStatus}
      isAdmin={currentIsAdmin}
    />
  );
}
