import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserCollection } from "@/lib/actions/collections";
import { CollectionStatus } from "@/generated/prisma";
import { KitCard } from "@/components/kit-card";

export default async function MeCollectionsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [wishlist, preorder, backlog, inProgress, built] = await Promise.all([
    getUserCollection(CollectionStatus.WISHLIST),
    getUserCollection(CollectionStatus.PREORDER),
    getUserCollection(CollectionStatus.BACKLOG),
    getUserCollection(CollectionStatus.IN_PROGRESS),
    getUserCollection(CollectionStatus.BUILT),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Collection</h1>
        <p className="text-gray-600">
          Manage your Gunpla collection across wishlist, preorder, backlog, in progress, and built kits.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Wishlist Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Wishlist ({wishlist.length})
            </h2>
            <p className="text-sm text-gray-500">
              Kits you want to get
            </p>
          </div>

          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {wishlist.map((collection: any) => (
                <KitCard
                  key={collection.id}
                  kit={{
                    id: collection.kit.id,
                    name: collection.kit.name,
                    slug: collection.kit.slug,
                    number: collection.kit.number,
                    variant: collection.kit.variant,
                    releaseDate: collection.kit.releaseDate,
                    priceYen: collection.kit.priceYen,
                    boxArt: collection.kit.boxArt,
                    grade: collection.kit.productLine?.grade?.name || null,
                    productLine: collection.kit.productLine?.name || null,
                    series: collection.kit.mobileSuits[0]?.mobileSuit?.series?.name || null,
                    releaseType: collection.kit.releaseType?.name || null,
                    mobileSuits: collection.kit.mobileSuits.map((ms: any) => ms.mobileSuit.name),
                  }}
                  collectionStatus={collection.status}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No kits in your wishlist yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Browse kits and add them to your wishlist to see them here.
              </p>
            </div>
          )}
        </section>

        {/* Preorder Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Preorder ({preorder.length})
            </h2>
            <p className="text-sm text-gray-500">
              Kits you have preordered
            </p>
          </div>

          {preorder.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {preorder.map((collection: any) => (
                <KitCard
                  key={collection.id}
                  kit={{
                    id: collection.kit.id,
                    name: collection.kit.name,
                    slug: collection.kit.slug,
                    number: collection.kit.number,
                    variant: collection.kit.variant,
                    releaseDate: collection.kit.releaseDate,
                    priceYen: collection.kit.priceYen,
                    boxArt: collection.kit.boxArt,
                    grade: collection.kit.productLine?.grade?.name || null,
                    productLine: collection.kit.productLine?.name || null,
                    series: collection.kit.mobileSuits[0]?.mobileSuit?.series?.name || null,
                    releaseType: collection.kit.releaseType?.name || null,
                    mobileSuits: collection.kit.mobileSuits.map((ms: any) => ms.mobileSuit.name),
                  }}
                  collectionStatus={collection.status}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No preordered kits yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Preorder kits to see them here.
              </p>
            </div>
          )}
        </section>

        {/* Backlog Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Backlog ({backlog.length})
            </h2>
            <p className="text-sm text-gray-500">
              Kits you have but haven&apos;t built yet
            </p>
          </div>

          {backlog.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {backlog.map((collection: any) => (
                <KitCard
                  key={collection.id}
                  kit={{
                    id: collection.kit.id,
                    name: collection.kit.name,
                    slug: collection.kit.slug,
                    number: collection.kit.number,
                    variant: collection.kit.variant,
                    releaseDate: collection.kit.releaseDate,
                    priceYen: collection.kit.priceYen,
                    boxArt: collection.kit.boxArt,
                    grade: collection.kit.productLine?.grade?.name || null,
                    productLine: collection.kit.productLine?.name || null,
                    series: collection.kit.mobileSuits[0]?.mobileSuit?.series?.name || null,
                    releaseType: collection.kit.releaseType?.name || null,
                    mobileSuits: collection.kit.mobileSuits.map((ms: any) => ms.mobileSuit.name),
                  }}
                  collectionStatus={collection.status}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No kits in your backlog yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Move kits from your wishlist to backlog when you purchase them.
              </p>
            </div>
          )}
        </section>

        {/* In Progress Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              In Progress ({inProgress.length})
            </h2>
            <p className="text-sm text-gray-500">
              Kits you are currently building
            </p>
          </div>

          {inProgress.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {inProgress.map((collection: any) => (
                <KitCard
                  key={collection.id}
                  kit={{
                    id: collection.kit.id,
                    name: collection.kit.name,
                    slug: collection.kit.slug,
                    number: collection.kit.number,
                    variant: collection.kit.variant,
                    releaseDate: collection.kit.releaseDate,
                    priceYen: collection.kit.priceYen,
                    boxArt: collection.kit.boxArt,
                    grade: collection.kit.productLine?.grade?.name || null,
                    productLine: collection.kit.productLine?.name || null,
                    series: collection.kit.mobileSuits[0]?.mobileSuit?.series?.name || null,
                    releaseType: collection.kit.releaseType?.name || null,
                    mobileSuits: collection.kit.mobileSuits.map((ms: any) => ms.mobileSuit.name),
                  }}
                  collectionStatus={collection.status}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No kits in progress yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Mark kits as in progress when you start building them.
              </p>
            </div>
          )}
        </section>

        {/* Built Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Built ({built.length})
            </h2>
            <p className="text-sm text-gray-500">
              Kits you have completed
            </p>
          </div>

          {built.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {built.map((collection: any) => (
                <KitCard
                  key={collection.id}
                  kit={{
                    id: collection.kit.id,
                    name: collection.kit.name,
                    slug: collection.kit.slug,
                    number: collection.kit.number,
                    variant: collection.kit.variant,
                    releaseDate: collection.kit.releaseDate,
                    priceYen: collection.kit.priceYen,
                    boxArt: collection.kit.boxArt,
                    grade: collection.kit.productLine?.grade?.name || null,
                    productLine: collection.kit.productLine?.name || null,
                    series: collection.kit.mobileSuits[0]?.mobileSuit?.series?.name || null,
                    releaseType: collection.kit.releaseType?.name || null,
                    mobileSuits: collection.kit.mobileSuits.map((ms: any) => ms.mobileSuit.name),
                  }}
                  collectionStatus={collection.status}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No completed builds yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Mark kits as built when you finish assembling them.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
