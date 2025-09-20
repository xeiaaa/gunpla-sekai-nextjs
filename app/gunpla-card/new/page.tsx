"use client";

import { CardBuilderProvider } from "@/gunpla-card/context";
import { CardBuilder } from "@/gunpla-card/components/CardBuilder";

export default function NewGunplaCardPage() {
  return (
    <CardBuilderProvider>
      <div className="mx-auto h-[calc(100vh-64px)]">
        <CardBuilder />
      </div>
    </CardBuilderProvider>
  );
}


