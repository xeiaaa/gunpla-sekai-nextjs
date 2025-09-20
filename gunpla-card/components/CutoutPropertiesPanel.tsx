"use client";

import React from "react";
import { useCardBuilder } from "@/gunpla-card/context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";

export const CutoutPropertiesPanel: React.FC = () => {
  const { cutouts, selectedCutoutId, updateCutout, removeCutout, setSelectedCutout } = useCardBuilder();

  const selectedCutout = cutouts.find(c => c.id === selectedCutoutId);

  if (!selectedCutout) {
    return (
      <div className="text-center text-muted-foreground">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-medium text-sm mb-1">No Cutout Selected</h3>
          <p className="text-xs">Select a cutout from the sidebar to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleSizeChange = (value: number[]) => {
    updateCutout(selectedCutout.id, { scale: value[0] });
  };

  const handleRotationChange = (value: number[]) => {
    updateCutout(selectedCutout.id, { rotation: value[0] });
  };

  const handleOpacityChange = (value: number[]) => {
    updateCutout(selectedCutout.id, { opacity: value[0] });
  };

  const handleSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) / 100;
    if (!isNaN(value) && value >= 0.1 && value <= 3) {
      updateCutout(selectedCutout.id, { scale: value });
    }
  };

  const handleRotationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      updateCutout(selectedCutout.id, { rotation: value });
    }
  };

  const handleOpacityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      updateCutout(selectedCutout.id, { opacity: value });
    }
  };

  const handleDelete = () => {
    removeCutout(selectedCutout.id);
    setSelectedCutout(undefined);
  };

  const handleBringForward = () => {
    if (!selectedCutout) return;

    // Find the highest zIndex among all cutouts
    const maxZIndex = Math.max(...cutouts.map(c => c.zIndex), 0);

    // Set the selected cutout's zIndex to be higher than the current max
    updateCutout(selectedCutout.id, { zIndex: maxZIndex + 1 });
  };

  const handleSendBackward = () => {
    if (!selectedCutout) return;

    // Find the lowest zIndex among all cutouts
    const minZIndex = Math.min(...cutouts.map(c => c.zIndex), 1);

    // Set the selected cutout's zIndex to be lower than the current min
    updateCutout(selectedCutout.id, { zIndex: Math.max(minZIndex - 1, 1) });
  };

  return (
    <div className="space-y-6">
      {/* Cutout Preview */}
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-2 border rounded overflow-hidden bg-white">
          <img
            src={selectedCutout.url}
            alt="cutout preview"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-xs text-muted-foreground">Selected Cutout</p>
      </div>

      {/* Size Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Size</label>
          <Input
            type="number"
            value={Math.round(selectedCutout.scale * 100)}
            onChange={handleSizeInputChange}
            className="w-16 h-8 text-xs"
            min={10}
            max={300}
            step={5}
          />
        </div>
        <Slider
          value={[selectedCutout.scale]}
          onValueChange={handleSizeChange}
          min={0.1}
          max={3}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>10%</span>
          <span>300%</span>
        </div>
      </div>

      {/* Rotation Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Rotation</label>
          <Input
            type="number"
            value={Math.round(selectedCutout.rotation)}
            onChange={handleRotationInputChange}
            className="w-16 h-8 text-xs"
            min={-180}
            max={180}
            step={1}
          />
        </div>
        <Slider
          value={[selectedCutout.rotation]}
          onValueChange={handleRotationChange}
          min={-180}
          max={180}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>-180°</span>
          <span>180°</span>
        </div>
      </div>

      {/* Opacity Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Opacity</label>
          <Input
            type="number"
            value={Math.round(selectedCutout.opacity * 100)}
            onChange={handleOpacityInputChange}
            className="w-16 h-8 text-xs"
            min={0}
            max={100}
            step={5}
          />
        </div>
        <Slider
          value={[selectedCutout.opacity]}
          onValueChange={handleOpacityChange}
          min={0}
          max={1}
          step={0.05}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Layer</label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendBackward}
            className="flex-1"
          >
            <ArrowDown className="w-4 h-4 mr-1" />
            Backward
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBringForward}
            className="flex-1"
          >
            <ArrowUp className="w-4 h-4 mr-1" />
            Forward
          </Button>
        </div>
      </div>

      {/* Delete Button */}
      <div className="pt-2 border-t">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Cutout
        </Button>
      </div>
    </div>
  );
};

export default CutoutPropertiesPanel;
