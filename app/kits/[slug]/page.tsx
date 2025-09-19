import { notFound } from "next/navigation";
import { getKitBySlug } from "@/lib/actions/kits";
import { getKitCollectionStatus } from "@/lib/actions/collections";
import { isCurrentUserAdmin } from "@/lib/actions/users";
import { KitDetailPage } from "@/components/kit-detail-page";

interface KitDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: KitDetailPageProps) {
  const { slug } = await params;
  const kit = await getKitBySlug(slug);

  if (!kit) {
    return {
      title: "Kit Not Found",
    };
  }

  return {
    title: `${kit.name} - Gunpla Sekai`,
    description: `View details for ${kit.name} (${kit.number}) - ${kit.grade || 'Unknown'} grade Gunpla kit`,
  };
}

export default async function KitDetail({ params }: KitDetailPageProps) {
  const { slug } = await params;
  const kit = await getKitBySlug(slug);

  if (!kit) {
    notFound();
  }

  const collectionStatus = await getKitCollectionStatus(kit.id);
  const isAdmin = await isCurrentUserAdmin();

  return <KitDetailPage kit={kit} collectionStatus={collectionStatus} isAdmin={isAdmin} />;
}
