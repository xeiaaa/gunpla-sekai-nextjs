import { BuildDetailEditView } from "@/components/build-detail-edit-view";

interface BuildEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BuildEditPage({ params }: BuildEditPageProps) {
  const { id } = await params;

  return <BuildDetailEditView buildId={id} />;
}
