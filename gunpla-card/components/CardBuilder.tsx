"use client";

import React from "react";
import { useCardBuilder } from "@/gunpla-card/context";
import { SidebarPrimary } from "@/gunpla-card/components/SidebarPrimary";
import { SidebarSecondary } from "@/gunpla-card/components/SidebarSecondary";
import { UploadPanel } from "@/gunpla-card/components/upload/UploadPanel";
import { KitSelectPanel } from "@/gunpla-card/components/kit/KitSelectPanel";
import { BaseCardPanel } from "@/gunpla-card/components/basecard/BaseCardPanel";
import { CutoutsPanel } from "@/gunpla-card/components/cutouts/CutoutsPanel";
import { PreviewPanel } from "@/gunpla-card/components/preview/PreviewPanel";

export const CardBuilder: React.FC = () => {
  const { activeTab } = useCardBuilder();

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-2">
        <SidebarPrimary />
      </div>
      <div className="col-span-8 min-h-[70vh]">
        {activeTab === "kit" && <KitSelectPanel />}
        {activeTab === "upload" && <UploadPanel />}
        {activeTab === "base" && <BaseCardPanel />}
        {activeTab === "cutouts" && <CutoutsPanel />}
        {activeTab === "preview" && <PreviewPanel />}
      </div>
      <div className="col-span-2">
        <SidebarSecondary />
      </div>
    </div>
  );
};


