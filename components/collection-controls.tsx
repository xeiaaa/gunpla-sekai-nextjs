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
  Trash2,
  Loader2,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import {
  addToCollection,
  removeFromCollection,
  updateCollectionStatus,
} from "@/lib/actions/collections";

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

export function CollectionControls({
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
          // Remove from collection if clicking the same status
          await removeFromCollection(kitId);
          setStatus(null);
        } else {
          // Add or update status
          if (status) {
            await updateCollectionStatus(kitId, newStatus);
          } else {
            await addToCollection(kitId, newStatus);
          }
          setStatus(newStatus);
        }
      } catch (error) {
        console.error("Error updating collection:", error);
        // You might want to show a toast notification here
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      try {
        await removeFromCollection(kitId);
        setStatus(null);
      } catch (error) {
        console.error("Error removing from collection:", error);
      }
    });
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Add to Collection</h3>

        <div className="grid grid-cols-5 gap-2">
          {Object.entries(statusConfig).map(([statusKey, config]) => {
            const Icon = config.icon;
            const isActive = status === statusKey;

            return (
              <Button
                key={statusKey}
                variant="outline"
                size="sm"
                onClick={() =>
                  handleStatusChange(statusKey as CollectionStatus)
                }
                disabled={isPending}
                className={`
                  flex flex-col items-center gap-1 h-auto py-3 px-2
                  ${
                    isActive
                      ? `${config.bgColor} ${config.borderColor} border-2`
                      : "hover:bg-gray-50"
                  }
                  ${isPending ? "opacity-50" : ""}
                `}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? config.color : "text-gray-400"
                    }`}
                  />
                )}
                <span
                  className={`text-xs ${
                    isActive ? config.color : "text-gray-600"
                  }`}
                >
                  {config.label}
                </span>
              </Button>
            );
          })}
        </div>

        {status && (
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isPending}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove from Collection
            </Button>
          </div>
        )}
      </div>
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
