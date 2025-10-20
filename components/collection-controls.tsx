"use client";

import { useState, useTransition, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { CollectionStatus } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Heart,
  Package,
  CheckCircle,
  Loader2,
  ShoppingCart,
  Wrench,
  Plus,
} from "lucide-react";
import {
  addToCollection,
  removeFromCollection,
  updateCollectionStatus,
} from "@/lib/actions/collections";
import KitCollectionDialog from "./kit-collection-dialog-form";
import { useQuery } from "@tanstack/react-query";
import { KitCollectionCard } from "./kit-collection-card";

interface CollectionControlsProps {
  kitId: string;
  currentStatus?: CollectionStatus | null;
  className?: string;
}

const statusConfig = {
  [CollectionStatus.WISHLIST]: {
    label: "Wishlist",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50 hover:bg-red-100",
    borderColor: "border-red-200",
  },
  [CollectionStatus.PREORDER]: {
    label: "Preorder",
    icon: ShoppingCart,
    color: "text-purple-500",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200",
  },
  [CollectionStatus.BACKLOG]: {
    label: "Backlog",
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200",
  },
  [CollectionStatus.IN_PROGRESS]: {
    label: "In Progress",
    icon: Wrench,
    color: "text-orange-500",
    bgColor: "bg-orange-50 hover:bg-orange-100",
    borderColor: "border-orange-200",
  },
  [CollectionStatus.BUILT]: {
    label: "Built",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-200",
  },
};

function KitCollectionSkeleton() {
  return (
    <div className="animate-pulse bg-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}

async function fetchKitCollection(
  kitId: string,
  getToken: () => Promise<string | null>
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
  const token = await getToken();
  const endpoint = `${apiUrl}/user-collections/kit/${kitId}`;

  const res = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch kit collection");
  return res.json();
}

export function CollectionControls({
  kitId,
  className = "",
}: CollectionControlsProps) {
  const { isSignedIn, getToken } = useAuth();

  const { data: kitCollection, isLoading } = useQuery({
    queryKey: ["kit-collections", kitId],
    queryFn: () => fetchKitCollection(kitId, getToken),
    enabled: isSignedIn, // only fetch when authenticated
  });

  // Don't render if user is not signed in
  if (!isSignedIn) {
    return null;
  }

  return (
    <Card className={`p-6 border-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Collections</h3>
            <p className="text-sm text-gray-500">Manage your kit collection</p>
          </div>
        </div>
        <KitCollectionDialog kitId={kitId} />
      </div>
      {/* ✅ Loading State */}
      {isLoading && (
        <>
          <KitCollectionSkeleton />
          <KitCollectionSkeleton />
          <KitCollectionSkeleton />
        </>
      )}

      {/* Status badges or empty state */}
      {Array.isArray(kitCollection?.collections) &&
      kitCollection.collections.length > 0 ? (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-col gap-3 overflow-y-auto max-h-96 pt-3 pb-5">
            {kitCollection.collections.map((collection) => {
              return (
                <KitCollectionCard
                  key={collection.id}
                  collection={collection}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-center py-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                Add this kit to your collection
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
// Compact version for kit cards
export function CollectionControlsCompact({
  kitId,
  currentStatus,
  className = "",
}: CollectionControlsProps) {
  const { isSignedIn } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  // Sync local state with prop changes
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  // Don't render if user is not signed in
  if (!isSignedIn) {
    return null;
  }

  const handleStatusChange = (newStatus: CollectionStatus) => {
    startTransition(async () => {
      try {
        if (status === newStatus) {
          await removeFromCollection(kitId);
          setStatus(null);
        } else {
          if (status) {
            await updateCollectionStatus(kitId, newStatus);
          } else {
            await addToCollection(kitId, newStatus);
          }
          setStatus(newStatus);
        }
      } catch (error) {
        console.error("Error updating collection:", error);
      }
    });
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {Object.entries(statusConfig).map(([statusKey, config]) => {
        const Icon = config.icon;
        const isActive = status === statusKey;

        return (
          <Button
            key={statusKey}
            variant="ghost"
            size="sm"
            onClick={() => handleStatusChange(statusKey as CollectionStatus)}
            disabled={isPending}
            className={`
              h-8 w-8 p-0
              ${isActive ? config.color : "text-gray-400 hover:text-gray-600"}
              ${isPending ? "opacity-50" : ""}
            `}
            title={`${isActive ? "Remove from" : "Add to"} ${config.label}`}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
          </Button>
        );
      })}
    </div>
  );
}
