"use client";

import { KitDetailPageClient } from "@/components/kit-detail-page-client";
import { useParams } from "next/navigation";

export default function KitDetail() {
  const params = useParams();
  const slug = params.slug as string;

  return <KitDetailPageClient slug={slug} />;
}
