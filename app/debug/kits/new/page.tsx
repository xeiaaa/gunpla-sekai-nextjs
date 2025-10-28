export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/actions/users";
import { KitAddForm } from "@/components/kit-add-form";

export default async function KitNewPage() {
  // Check if user is admin
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Add Kit</h1>
        </div>
        <KitAddForm />
      </div>
    </div>
  );
}
