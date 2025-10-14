import { notFound } from "next/navigation";
import { getKitBySlug } from "@/lib/actions/kits";
import { EditKitContent } from "../../components/edit-kit-content";

// ISR Configuration
export const revalidate = 604800; // 1 week

// Pre-generate popular kit slugs for better performance
export async function generateStaticParams() {
  // For now, return empty array to enable ISR without pre-generation
  // In the future, you could fetch popular kit slugs here
  return [];
}

interface KitDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function KitDetailPage({ params }: KitDetailPageProps) {
  // Fetch kit data on the server (ISR cached)
  const { slug } = await params;
  const kit = await getKitBySlug(slug);

  if (!kit) {
    notFound();
  }

  // Pass the kit data to client component to avoid duplicate fetching
  return (
    <EditKitContent
      kit={
        {
          ...kit,
          variant: kit.variant || "",
          region: kit.region || "",
          series: {
            slug: kit.seriesSlug || "",
            name: kit.series || "",
          },
        } as any
      } // TODO fix type
    />
  );
}
