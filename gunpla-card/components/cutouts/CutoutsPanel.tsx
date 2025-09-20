"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useCardBuilder } from "@/gunpla-card/context";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const StageCanvas = dynamic(() => import("@/gunpla-card/components/cutouts/StageCanvas"), { ssr: false });
const AddCutoutDialog = dynamic(() => import("@/gunpla-card/components/cutouts/add-cutout/AddCutoutDialog"), { ssr: false });

export const CutoutsPanel: React.FC = () => {
  const { uploadedImages, addCutout } = useCardBuilder();

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-3 space-y-2">
        <div className="font-medium">Create Cutout</div>
        <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
          {uploadedImages.map(img => (
            <div key={img.id} className="border rounded p-2">
              <div className="relative w-full h-24">
                <Image src={img.url} alt="uploaded" fill className="object-cover rounded" sizes="(max-width: 768px) 40vw, 20vw" />
              </div>
              <div className="mt-2">
                <AddCutoutDialog sourceUrl={img.url} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-9">
        <StageCanvas />
      </div>
    </div>
  );
};

export default CutoutsPanel;


