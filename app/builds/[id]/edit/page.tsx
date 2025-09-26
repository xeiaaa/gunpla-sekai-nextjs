import { notFound } from "next/navigation";
import { getBuildForEdit } from "@/lib/actions/builds";
import { BuildDetailEditView } from "@/components/build-detail-edit-view";
import { auth } from "@clerk/nextjs/server";

interface BuildEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BuildEditPage({ params }: BuildEditPageProps) {
  const { userId } = await auth();
  const { id } = await params;
  const build = await getBuildForEdit(id, userId || undefined);

  if (!build) {
    notFound();
  }

  return <BuildDetailEditView build={build} />;
}
