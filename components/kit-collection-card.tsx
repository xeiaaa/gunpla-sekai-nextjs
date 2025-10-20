import {
  Heart,
  Package,
  CheckCircle,
  ShoppingCart,
  Wrench,
  Calendar,
} from "lucide-react";
import { KitCollectionDialog } from "./kit-collection-dialog-form";
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
      className={`bg-white rounded-xl border border-l-4 ${styles.border} shadow-sm hover:shadow-lg transition-all duration-200 mr-4`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">
                  {config.label}
                </h3>
                {collection.price && (
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(collection.price)}
                  </span>
                )}
              </div>
            </div>

            {notes && (
              <p className="text-sm text-gray-700 mb-3 leading-relaxed line-clamp-2">
                {notes}
              </p>
            )}

            {date && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 w-fit">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">
                  {config.dateLabel} {formatDate(date)}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <KitCollectionDialog
              mode="edit"
              kitId={collection.kitId}
              initialData={collection}
              key={collection.id}
            />
            <DeleteKitCollectionDialog
              collectionId={collection.id}
              kitId={collection.kitId}
            />
          </div>
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
