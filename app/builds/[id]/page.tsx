import { notFound } from "next/navigation";
import { getBuild } from "@/lib/actions/builds";
import { BuildDetailPublicView } from "@/components/build-detail-public-view";
import { auth } from "@clerk/nextjs/server";

interface BuildPageProps {
  params: {
    id: string;
  };
}

export default async function BuildPage({ params }: BuildPageProps) {
  const { userId } = await auth();
  const build = await getBuild(params.id, userId || undefined);

  if (!build) {
    notFound();
  }

  return <BuildDetailPublicView build={build} />;
}
