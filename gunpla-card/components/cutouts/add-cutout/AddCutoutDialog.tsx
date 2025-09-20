"use client";

import React, { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { nanoid } from "nanoid";
import { useCardBuilder } from "@/gunpla-card/context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { CirclePolygonCropperHandle } from "./CirclePolygonCropper";
import type { RectangleCropperHandle } from "./RectangleCropper";

const CirclePolygonCropper = dynamic(() => import("./CirclePolygonCropper"), { ssr: false });
const RectangleCropper = dynamic(() => import("./RectangleCropper"), { ssr: false });

type Mode = "rectangle" | "circle" | "polygon";

// legacy rectangle extractor not used now (replaced by RectangleCropper for direct manipulation)

const AddCutoutDialog: React.FC<{ sourceUrl: string }> = ({ sourceUrl }) => {
  const { addCutout } = useCardBuilder();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("rectangle");
  const [polygonClosed, setPolygonClosed] = useState(false);

  // rectangle / circle / polygon
  const rectRef = useRef<RectangleCropperHandle | null>(null);
  const cpRef = useRef<CirclePolygonCropperHandle | null>(null);

  const handleSave = useCallback(async () => {
    let url: string | undefined;
    if (mode === "rectangle") {
      url = await rectRef.current?.getDataUrl();
    } else if (mode === "circle" || mode === "polygon") {
      url = await cpRef.current?.getDataUrl();
    }
    if (!url) return;
    addCutout({ id: nanoid(), url, x: 0.2, y: 0.2, scale: 0.3, rotation: 0, opacity: 1, zIndex: 1 });
    setOpen(false);
  }, [mode, addCutout]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">Add Cutout</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl gap-6">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle>Select piece to cut</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === "rectangle" ? "Drag to move. Use handles to resize." :
                 mode === "circle" ? "Drag to move. Scroll to resize radius." :
                 mode === "polygon" ? (polygonClosed ? "Polygon closed." : "Click to add points. Close when done.") :
                 ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={mode === "rectangle" ? "default" : "secondary"} onClick={() => { setMode("rectangle"); setPolygonClosed(false); }}>Rectangle</Button>
              <Button size="sm" variant={mode === "circle" ? "default" : "secondary"} onClick={() => { setMode("circle"); setPolygonClosed(false); }}>Circle</Button>
              <Button size="sm" variant={mode === "polygon" ? "default" : "secondary"} onClick={() => { setMode("polygon"); setPolygonClosed(false); }}>Polygon</Button>
            </div>
          </div>
        </DialogHeader>
        {mode === "rectangle" ? (
          <RectangleCropper ref={rectRef as any} sourceUrl={sourceUrl} />
        ) : (
          <CirclePolygonCropper ref={cpRef as any} sourceUrl={sourceUrl} mode={mode === "circle" ? "circle" : "polygon"} onPolygonClosedChange={setPolygonClosed} />
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Cutout</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCutoutDialog;


