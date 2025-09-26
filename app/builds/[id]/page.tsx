import { notFound } from "next/navigation";
import {
  getBuildForStaticGeneration,
  getBuildMilestones,
} from "@/lib/actions/builds";
import { BuildDetailPublicView } from "@/components/build-detail-public-view";

interface BuildPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate static params for ISG
export async function generateStaticParams() {
  // This would typically fetch a list of build IDs to pre-generate
  // For now, we'll rely on on-demand generation
  return [];
}

// Enable ISG with revalidation
export const revalidate = 3600; // Revalidate every hour

export default async function BuildPage({ params }: BuildPageProps) {
  const { id } = await params;

  // Fetch minimal data for initial render
  const build = await getBuildForStaticGeneration(id);

  if (!build) {
    notFound();
  }

  // Get initial milestones (first 5)
  const initialMilestones = await getBuildMilestones(id, 5, 0);

  return (
    <BuildDetailPublicView
      build={{
        ...build,
        milestones: initialMilestones,
      }}
    />
  );
}
