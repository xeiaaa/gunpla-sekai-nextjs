"use client";

import React from "react";
import Image from "next/image";
import { useCardBuilder } from "@/gunpla-card/context";

export const CutoutsSidebar: React.FC = () => {
  const { cutouts, selectedCutoutId, setSelectedCutout } = useCardBuilder();

  return (
    <div className="space-y-4">
      {/* Existing Cutouts Section */}
      {cutouts.length > 0 ? (
        <div>
          <div className="font-medium text-sm mb-2">Created Cutouts ({cutouts.length})</div>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {cutouts.map(cutout => (
              <div
                key={cutout.id}
                className={`border rounded p-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedCutoutId === cutout.id ? 'ring-2 ring-primary bg-primary/10' : ''
                }`}
                onClick={() => setSelectedCutout(cutout.id)}
              >
                <div className="relative w-full h-20">
                  <Image src={cutout.url} alt="cutout" fill className="object-cover rounded" sizes="(max-width: 768px) 40vw, 20vw" />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Scale: {Math.round(cutout.scale * 100)}% | Rot: {Math.round(cutout.rotation)}°
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No cutouts created yet</p>
          <p className="text-xs mt-1">Create cutouts from uploaded images</p>
        </div>
      )}
    </div>
  );
};

export default CutoutsSidebar;
