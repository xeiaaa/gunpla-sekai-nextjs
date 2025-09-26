import { notFound } from "next/navigation";
import { getKitBySlug } from "@/lib/actions/kits";
import { KitDetailPageClient } from "@/components/kit-detail-page-client";

// ISR Configuration
export const revalidate = 604800; // 1 week

// Pre-generate popular kit slugs for better performance
export async function generateStaticParams() {
  // For now, return empty array to enable ISR without pre-generation
  // In the future, you could fetch popular kit slugs here
  return [];
}

interface KitDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: KitDetailPageProps) {
  const { slug } = await params;
  const kit = await getKitBySlug(slug);

  if (!kit) {
    return {
      title: "Kit Not Found - Gunpla Sekai",
    };
  }

  return {
    title: `${kit.name} (${kit.number}) - Gunpla Sekai`,
    description: `View details for ${kit.name} ${
      kit.variant ? `(${kit.variant})` : ""
    } - ${kit.grade} grade kit from ${
      kit.productLine?.name || "Unknown"
    } product line.`,
    openGraph: {
      title: `${kit.name} (${kit.number})`,
      description: `View details for ${kit.name} ${
        kit.variant ? `(${kit.variant})` : ""
      } - ${kit.grade} grade kit.`,
      images: kit.boxArt ? [kit.boxArt] : [],
    },
  };
}

export default async function KitDetailPage({ params }: KitDetailPageProps) {
  // Fetch kit data on the server (ISR cached)
  const { slug } = await params;
  const kit = await getKitBySlug(slug);

  if (!kit) {
    notFound();
  }

  // Pass the kit data to client component to avoid duplicate fetching
  return <KitDetailPageClient kit={kit} />;
}
