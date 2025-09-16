import { notFound } from "next/navigation";
import { getBuild } from "@/lib/actions/builds";
import { BuildDetailEditView } from "@/components/build-detail-edit-view";

interface BuildEditPageProps {
  params: {
    id: string;
  };
}

export default async function BuildEditPage({ params }: BuildEditPageProps) {
  const build = await getBuild(params.id);

  if (!build) {
    notFound();
  }

  return <BuildDetailEditView build={build} />;
}
