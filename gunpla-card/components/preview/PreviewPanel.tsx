"use client";

import React, { useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const StageCanvas = dynamic(() => import("@/gunpla-card/components/cutouts/StageCanvas"), { ssr: false });

export const PreviewPanel: React.FC = () => {
  const handleSave = useCallback(async (type: "png" | "jpeg") => {
    const { toPng, toJpeg } = await import("html-to-image");
    const node = document.getElementById("card-canvas-container");
    if (!node) return;
    const dataUrl = type === "png" ? await toPng(node) : await toJpeg(node, { quality: 0.92 });
    const link = document.createElement("a");
    link.download = `gunpla-card.${type}`;
    link.href = dataUrl;
    link.click();
  }, []);

  return (
    <div className="space-y-4">
      <StageCanvas />
      <div className="flex gap-2">
        <Button onClick={() => handleSave("png")}>Save PNG</Button>
        <Button variant="secondary" onClick={() => handleSave("jpeg")}>Save JPEG</Button>
      </div>
    </div>
  );
};


