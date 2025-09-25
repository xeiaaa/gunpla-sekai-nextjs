import { notFound, redirect } from "next/navigation";
import { getKitBySlug } from "@/lib/actions/kits";
import { isCurrentUserAdmin } from "@/lib/actions/users";
import { KitEditForm } from "@/components/kit-edit-form";

interface KitEditPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: KitEditPageProps) {
  const kit = await getKitBySlug(params.slug);

  if (!kit) {
    return {
      title: "Kit Not Found",
    };
  }

  return {
    title: `Edit ${kit.name} - Gunpla Sekai`,
    description: `Edit details for ${kit.name} (${kit.number})`,
  };
}

export default async function KitEditPage({ params }: KitEditPageProps) {
  // Check if user is admin
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  const kit = await getKitBySlug(params.slug);

  if (!kit) {
    notFound();
  }

  // Transform the kit data to match the expected form structure
  const transformedKit = {
    ...kit,
    baseKit: kit.baseKit
      ? {
          id: kit.baseKit.id,
          name: kit.baseKit.name,
          slug: kit.baseKit.slug,
          number: kit.baseKit.number,
          variant: kit.baseKit.variant,
          releaseDate: null, // Not available in the returned data
          priceYen: null, // Not available in the returned data
          boxArt: kit.baseKit.boxArt,
          baseKitId: null, // Not available in the returned data
          grade: kit.baseKit.grade,
          productLine: null, // Not available in the returned data
          series: null, // Not available in the returned data
          releaseType: null, // Not available in the returned data
          mobileSuits: [], // Not available in the returned data
        }
      : null,
    // Transform other arrays to match expected structure
    mobileSuits: kit.mobileSuits.map((ms) => ({
      ...ms,
      series: ms.series,
      timeline: null, // Not available in the returned data
      kitsCount: 0, // Not available in the returned data
    })),
    expansions: kit.expansions.map((exp) => ({
      ...exp,
      releaseDate: null, // Not available in the returned data
      priceYen: null, // Not available in the returned data
      baseKitId: null, // Not available in the returned data
      grade: exp.grade,
      productLine: exp.productLine,
      series: exp.series,
      releaseType: null, // Not available in the returned data
      mobileSuits: [], // Not available in the returned data
    })),
    expandedBy: kit.expandedBy.map((exp) => ({
      ...exp,
      releaseDate: null, // Not available in the returned data
      priceYen: null, // Not available in the returned data
      baseKitId: null, // Not available in the returned data
      grade: exp.grade,
      productLine: exp.productLine,
      series: exp.series,
      releaseType: null, // Not available in the returned data
      mobileSuits: [], // Not available in the returned data
    })),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Kit</h1>
          <p className="text-muted-foreground mt-2">
            Edit details for {kit.name} ({kit.number})
          </p>
        </div>

        <KitEditForm kit={transformedKit} />
      </div>
    </div>
  );
}
