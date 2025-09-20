"use client";

import { CardBuilderProvider } from "@/gunpla-card/context";
import { CardBuilder } from "@/gunpla-card/components/CardBuilder";

export default function NewGunplaCardPage() {
  return (
    <CardBuilderProvider>
      <div className="container mx-auto p-4">
        <CardBuilder />
      </div>
    </CardBuilderProvider>
  );
}


