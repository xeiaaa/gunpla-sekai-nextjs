import { notFound } from "next/navigation";
import { getKitBySlug } from "@/lib/actions/kits";
import { KitDetailPage } from "@/components/kit-detail-page";

interface KitDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: KitDetailPageProps) {
  const kit = await getKitBySlug(params.slug);

  if (!kit) {
    return {
      title: "Kit Not Found",
    };
  }

  return {
    title: `${kit.name} - Gunpla Sekai`,
    description: `View details for ${kit.name} (${kit.number}) - ${kit.grade} grade Gunpla kit`,
  };
}

export default async function KitDetail({ params }: KitDetailPageProps) {
  const kit = await getKitBySlug(params.slug);

  if (!kit) {
    notFound();
  }

  return <KitDetailPage kit={kit} />;
}
