"use client";

import React from "react";
import { useCardBuilder } from "@/gunpla-card/context";

export const SidebarSecondary: React.FC = () => {
  const { activeTab, uploadedImages, baseCard, cutouts } = useCardBuilder();

  return (
    <div className="text-sm space-y-2">
      <div className="font-medium">Context</div>
      <div>Tab: {activeTab}</div>
      <div>Uploads: {uploadedImages.length}</div>
      <div>Base: {baseCard ? "Yes" : "No"}</div>
      <div>Cutouts: {cutouts.length}</div>
    </div>
  );
};


