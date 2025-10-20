import {
  Heart,
  Package,
  CheckCircle,
  ShoppingCart,
  Wrench,
  Calendar,
} from "lucide-react";
import KitCollectionDialog from "./kit-collection-dialog-form";
import { DeleteKitCollectionDialog } from "./delete-kit-collection-dialog";

enum CollectionStatus {
  WISHLIST = "WISHLIST",
  PREORDER = "PREORDER",
  BACKLOG = "BACKLOG",
  IN_PROGRESS = "IN_PROGRESS",
  BUILT = "BUILT",
}

interface Collection {
  id: string;
  userId: string;
  kitId: string;
  status: CollectionStatus;
  wishlistNotes?: string | null;
  preorderNotes?: string | null;
  backlogNotes?: string | null;
  inProgressNotes?: string | null;
  builtNotes?: string | null;
  price?: number | null;
  wishlistedAt?: string | null;
  preorderedAt?: string | null;
  acquiredAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  addedAt: string;
  updatedAt: string;
}

const statusConfig = {
  [CollectionStatus.WISHLIST]: {
    label: "Wishlist",
    icon: Heart,
    color: "blue" as const,
    getDate: (c: Collection) => c.wishlistedAt,
    getNotes: (c: Collection) => c.wishlistNotes,
    dateLabel: "Added at",
  },
  [CollectionStatus.PREORDER]: {
    label: "Preorder",
    icon: ShoppingCart,
    color: "purple" as const,
    getDate: (c: Collection) => c.preorderedAt,
    getNotes: (c: Collection) => c.preorderNotes,
    dateLabel: "Preordered at",
  },
  [CollectionStatus.BACKLOG]: {
    label: "Backlog",
    icon: Package,
    color: "blue" as const,
    getDate: (c: Collection) => c.acquiredAt,
    getNotes: (c: Collection) => c.backlogNotes,
    dateLabel: "Acquired at",
  },
  [CollectionStatus.IN_PROGRESS]: {
    label: "In Progress",
    icon: Wrench,
    color: "orange" as const,
    getDate: (c: Collection) => c.startedAt,
    getNotes: (c: Collection) => c.inProgressNotes,
    dateLabel: "Started at",
  },
  [CollectionStatus.BUILT]: {
    label: "Built",
    icon: CheckCircle,
    color: "green" as const,
    getDate: (c: Collection) => c.completedAt,
    getNotes: (c: Collection) => c.builtNotes,
    dateLabel: "Completed at",
  },
};

const colorStyles = {
  blue: {
    border: "border-l-blue-500",
    iconBg: "bg-blue-500",
  },
  green: {
    border: "border-l-green-500",
    iconBg: "bg-green-500",
  },
  orange: {
    border: "border-l-orange-500",
    iconBg: "bg-orange-500",
  },
  purple: {
    border: "border-l-purple-500",
    iconBg: "bg-purple-500",
  },
  red: {
    border: "border-l-red-500",
    iconBg: "bg-red-500",
  },
};

interface KitCollectionCardProps {
  collection: Collection;
}

export function KitCollectionCard({ collection }: KitCollectionCardProps) {
  const config = statusConfig[collection.status];
  const Icon = config.icon;
  const styles = colorStyles[config.color];
  const date = config.getDate(collection);
  const notes = config.getNotes(collection);

  const formatDate = (date: string | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return null;
    return `¥${price.toFixed(2)}`;
  };

  return (
    <div
      className={`bg-white rounded-lg border-l-4 ${styles.border} shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                {config.label}
              </h3>
              {collection.price && (
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(collection.price)}
                </span>
              )}
            </div>

            {notes && (
              <p className="text-xs text-gray-600 my-2 line-clamp-2">{notes}</p>
            )}

            {date && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>
                  {config.dateLabel} {formatDate(date)}
                </span>
              </div>
            )}
          </div>

          <KitCollectionDialog
            mode="edit"
            kitId={collection.kitId}
            initialData={collection}
          />
          <DeleteKitCollectionDialog
            collectionId={collection.id}
            kitId={collection.kitId}
          />
        </div>
      </div>
    </div>
  );
}

// Example usage component
export default function KitCollectionList({
  collections,
}: {
  collections: Collection[];
}) {
  return (
    <div className="w-full space-y-4">
      {collections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No collections yet</p>
        </div>
      ) : (
        collections.map((collection) => (
          <KitCollectionCard key={collection.id} collection={collection} />
        ))
      )}
    </div>
  );
}
