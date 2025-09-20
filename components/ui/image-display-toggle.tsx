"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Crop, Square } from "lucide-react";
import { cn } from "@/lib/utils";

type DisplayMode = "contain" | "cover" | "fit";

interface ImageDisplayToggleProps {
  currentMode: DisplayMode;
  onModeChange: (mode: DisplayMode) => void;
  className?: string;
}

export function ImageDisplayToggle({
  currentMode,
  onModeChange,
  className
}: ImageDisplayToggleProps) {
  const modes = [
    {
      key: "contain" as DisplayMode,
      icon: Square,
      label: "Show Full Image",
      description: "Fits entire image, may have empty space"
    },
    {
      key: "cover" as DisplayMode,
      icon: Crop,
      label: "Fill Container",
      description: "Fills container, may crop image"
    },
    {
      key: "fit" as DisplayMode,
      icon: Maximize2,
      label: "Smart Fit",
      description: "Adapts based on image ratio"
    }
  ];

  return (
    <div className={cn("flex items-center gap-1 bg-gray-100 rounded-lg p-1", className)}>
      {modes.map((mode) => {
        const Icon = mode.icon;
        return (
          <Button
            key={mode.key}
            variant={currentMode === mode.key ? "default" : "ghost"}
            size="sm"
            onClick={() => onModeChange(mode.key)}
            className="h-8 px-2"
            title={`${mode.label}: ${mode.description}`}
          >
            <Icon className="w-3 h-3" />
          </Button>
        );
      })}
    </div>
  );
}
