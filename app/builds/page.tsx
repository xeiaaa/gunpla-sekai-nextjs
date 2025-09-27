import { Metadata } from "next";
import { Suspense } from "react";
import { AllBuildsPage } from "@/components/all-builds-page";

export const metadata: Metadata = {
  title: "Community Builds - Gunpla Sekai",
  description:
    "Browse and discover amazing Gunpla builds from builders around the world",
};

export default function BuildsPage() {
  return (
    <Suspense fallback={<div></div>}>
      <AllBuildsPage />
    </Suspense>
  );
}
