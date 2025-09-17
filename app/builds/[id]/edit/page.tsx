import { notFound } from "next/navigation";
import { getBuild } from "@/lib/actions/builds";
import { BuildDetailEditView } from "@/components/build-detail-edit-view";
import { auth } from "@clerk/nextjs/server";

interface BuildEditPageProps {
  params: {
    id: string;
  };
}

export default async function BuildEditPage({ params }: BuildEditPageProps) {
  const { userId } = await auth();
  const build = await getBuild(params.id, userId || undefined);

  if (!build) {
    notFound();
  }

  return <BuildDetailEditView build={build} />;
}
