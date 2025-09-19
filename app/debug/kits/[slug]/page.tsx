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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Kit</h1>
          <p className="text-muted-foreground mt-2">
            Edit details for {kit.name} ({kit.number})
          </p>
        </div>

        <KitEditForm kit={kit} />
      </div>
    </div>
  );
}
