"use client";

import React from "react";
import { useCardBuilder } from "@/gunpla-card/context";
import { Button } from "@/components/ui/button";

export const SidebarPrimary: React.FC = () => {
  const { activeTab, setActiveTab } = useCardBuilder();

  const TabButton: React.FC<{ tab: Parameters<typeof setActiveTab>[0]; label: string }> = ({ tab, label }) => (
    <Button variant={activeTab === tab ? "default" : "secondary"} className="w-full mb-2" onClick={() => setActiveTab(tab)}>
      {label}
    </Button>
  );

  return (
    <div className="space-y-2">
      <TabButton tab="upload" label="Upload" />
      <TabButton tab="base" label="Base Card" />
      <TabButton tab="cutouts" label="Cutouts" />
      <TabButton tab="preview" label="Preview & Save" />
    </div>
  );
};


