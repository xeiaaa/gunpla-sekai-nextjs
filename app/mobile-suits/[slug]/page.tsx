import { notFound } from "next/navigation";
import { getMobileSuitBySlug } from "@/lib/actions/mobile-suits";
import { MobileSuitDetailPage } from "@/components/mobile-suit-detail-page";

interface MobileSuitDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: MobileSuitDetailPageProps) {
  const { slug } = await params;
  const mobileSuit = await getMobileSuitBySlug(slug);

  if (!mobileSuit) {
    return {
      title: "Mobile Suit Not Found - Gunpla Sekai",
    };
  }

  return {
    title: `${mobileSuit.name} - Gunpla Sekai`,
    description:
      mobileSuit.description ||
      `Explore ${mobileSuit.name} mobile suit and its kits`,
  };
}

export default async function MobileSuitDetail({
  params,
}: MobileSuitDetailPageProps) {
  const { slug } = await params;
  const mobileSuit = await getMobileSuitBySlug(slug);

  if (!mobileSuit) {
    notFound();
  }

  return <MobileSuitDetailPage mobileSuit={mobileSuit} />;
}
