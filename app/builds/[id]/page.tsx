import { notFound } from "next/navigation";
import { getBuild } from "@/lib/actions/builds";
import { BuildDetailPublicView } from "@/components/build-detail-public-view";

interface BuildPageProps {
  params: {
    id: string;
  };
}

export default async function BuildPage({ params }: BuildPageProps) {
  const build = await getBuild(params.id);

  if (!build) {
    notFound();
  }

  return <BuildDetailPublicView build={build} />;
}
