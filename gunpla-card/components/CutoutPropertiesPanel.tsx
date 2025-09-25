"use client";

import React, { useState } from "react";
import { useCardBuilder } from "@/gunpla-card/context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CutoutPropertiesPanel: React.FC = () => {
  const {
    cutouts,
    selectedCutoutId,
    updateCutout,
    removeCutout,
    setSelectedCutout,
  } = useCardBuilder();
  const [expandedSections, setExpandedSections] = useState({
    shadow: false,
    glow: false,
    border: false,
  });

  const selectedCutout = cutouts.find((c) => c.id === selectedCutoutId);

  if (!selectedCutout) {
    return (
      <div className="text-center text-muted-foreground">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="font-medium text-sm mb-1">No Cutout Selected</h3>
          <p className="text-xs">
            Select a cutout from the sidebar to edit its properties
          </p>
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

  const handleRotationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
    const maxZIndex = Math.max(...cutouts.map((c) => c.zIndex), 0);

    // Set the selected cutout's zIndex to be higher than the current max
    updateCutout(selectedCutout.id, { zIndex: maxZIndex + 1 });
  };

  const handleSendBackward = () => {
    if (!selectedCutout) return;

    // Find the lowest zIndex among all cutouts
    const minZIndex = Math.min(...cutouts.map((c) => c.zIndex), 1);

    // Set the selected cutout's zIndex to be lower than the current min
    updateCutout(selectedCutout.id, { zIndex: Math.max(minZIndex - 1, 1) });
  };

  // Visual Effects Handlers
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateShadow = (
    updates: Partial<NonNullable<typeof selectedCutout.shadow>>
  ) => {
    if (!selectedCutout) return;
    const currentShadow = selectedCutout.shadow || {
      enabled: false,
      color: "#000000",
      blur: 10,
      offsetX: 2,
      offsetY: 2,
      opacity: 0.5,
    };
    updateCutout(selectedCutout.id, {
      shadow: { ...currentShadow, ...updates },
    });
  };

  const updateGlow = (
    updates: Partial<NonNullable<typeof selectedCutout.glow>>
  ) => {
    if (!selectedCutout) return;
    const currentGlow = selectedCutout.glow || {
      enabled: false,
      color: "#ffffff",
      blur: 20,
      opacity: 0.8,
    };
    updateCutout(selectedCutout.id, { glow: { ...currentGlow, ...updates } });
  };

  const updateBorder = (
    updates: Partial<NonNullable<typeof selectedCutout.border>>
  ) => {
    if (!selectedCutout) return;
    const currentBorder = selectedCutout.border || {
      enabled: false,
      color: "#000000",
      width: 2,
      style: "solid" as const,
    };
    updateCutout(selectedCutout.id, {
      border: { ...currentBorder, ...updates },
    });
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

      {/* Visual Effects */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Visual Effects
        </h3>

        {/* Shadow Effects */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection("shadow")}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium">Shadow</span>
            {expandedSections.shadow ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {expandedSections.shadow && (
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              <div className="flex items-center justify-between">
                <label className="text-sm">Enable Shadow</label>
                <Switch
                  checked={selectedCutout.shadow?.enabled || false}
                  onCheckedChange={(checked) =>
                    updateShadow({ enabled: checked })
                  }
                />
              </div>

              {selectedCutout.shadow?.enabled && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedCutout.shadow?.color || "#000000"}
                        onChange={(e) =>
                          updateShadow({ color: e.target.value })
                        }
                        className="w-8 h-8 rounded border"
                      />
                      <Input
                        value={selectedCutout.shadow?.color || "#000000"}
                        onChange={(e) =>
                          updateShadow({ color: e.target.value })
                        }
                        className="flex-1 h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Blur</label>
                      <Input
                        type="number"
                        value={selectedCutout.shadow?.blur || 10}
                        onChange={(e) =>
                          updateShadow({
                            blur: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-16 h-8 text-xs"
                        min={0}
                        max={50}
                      />
                    </div>
                    <Slider
                      value={[selectedCutout.shadow?.blur || 10]}
                      onValueChange={([value]) => updateShadow({ blur: value })}
                      min={0}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Offset X</label>
                      <Input
                        type="number"
                        value={selectedCutout.shadow?.offsetX || 2}
                        onChange={(e) =>
                          updateShadow({
                            offsetX: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-16 h-8 text-xs"
                        min={-20}
                        max={20}
                      />
                    </div>
                    <Slider
                      value={[selectedCutout.shadow?.offsetX || 2]}
                      onValueChange={([value]) =>
                        updateShadow({ offsetX: value })
                      }
                      min={-20}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Offset Y</label>
                      <Input
                        type="number"
                        value={selectedCutout.shadow?.offsetY || 2}
                        onChange={(e) =>
                          updateShadow({
                            offsetY: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-16 h-8 text-xs"
                        min={-20}
                        max={20}
                      />
                    </div>
                    <Slider
                      value={[selectedCutout.shadow?.offsetY || 2]}
                      onValueChange={([value]) =>
                        updateShadow({ offsetY: value })
                      }
                      min={-20}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Opacity</label>
                      <Input
                        type="number"
                        value={Math.round(
                          (selectedCutout.shadow?.opacity || 0.5) * 100
                        )}
                        onChange={(e) =>
                          updateShadow({
                            opacity: (parseFloat(e.target.value) || 0) / 100,
                          })
                        }
                        className="w-16 h-8 text-xs"
                        min={0}
                        max={100}
                      />
                    </div>
                    <Slider
                      value={[selectedCutout.shadow?.opacity || 0.5]}
                      onValueChange={([value]) =>
                        updateShadow({ opacity: value })
                      }
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Glow Effects */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection("glow")}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium">Glow</span>
            {expandedSections.glow ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {expandedSections.glow && (
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              <div className="flex items-center justify-between">
                <label className="text-sm">Enable Glow</label>
                <Switch
                  checked={selectedCutout.glow?.enabled || false}
                  onCheckedChange={(checked) =>
                    updateGlow({ enabled: checked })
                  }
                />
              </div>

              {selectedCutout.glow?.enabled && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedCutout.glow?.color || "#ffffff"}
                        onChange={(e) => updateGlow({ color: e.target.value })}
                        className="w-8 h-8 rounded border"
                      />
                      <Input
                        value={selectedCutout.glow?.color || "#ffffff"}
                        onChange={(e) => updateGlow({ color: e.target.value })}
                        className="flex-1 h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Blur</label>
                      <Input
                        type="number"
                        value={selectedCutout.glow?.blur || 20}
                        onChange={(e) =>
                          updateGlow({ blur: parseFloat(e.target.value) || 0 })
                        }
                        className="w-16 h-8 text-xs"
                        min={0}
                        max={100}
                      />
                    </div>
                    <Slider
                      value={[selectedCutout.glow?.blur || 20]}
                      onValueChange={([value]) => updateGlow({ blur: value })}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Opacity</label>
                      <Input
                        type="number"
                        value={Math.round(
                          (selectedCutout.glow?.opacity || 0.8) * 100
                        )}
                        onChange={(e) =>
                          updateGlow({
                            opacity: (parseFloat(e.target.value) || 0) / 100,
                          })
                        }
                        className="w-16 h-8 text-xs"
                        min={0}
                        max={100}
                      />
                    </div>
                    <Slider
                      value={[selectedCutout.glow?.opacity || 0.8]}
                      onValueChange={([value]) =>
                        updateGlow({ opacity: value })
                      }
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Border Effects */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection("border")}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium">Border</span>
            {expandedSections.border ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {expandedSections.border && (
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              <div className="flex items-center justify-between">
                <label className="text-sm">Enable Border</label>
                <Switch
                  checked={selectedCutout.border?.enabled || false}
                  onCheckedChange={(checked) =>
                    updateBorder({ enabled: checked })
                  }
                />
              </div>

              {selectedCutout.border?.enabled && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedCutout.border?.color || "#000000"}
                        onChange={(e) =>
                          updateBorder({ color: e.target.value })
                        }
                        className="w-8 h-8 rounded border"
                      />
                      <Input
                        value={selectedCutout.border?.color || "#000000"}
                        onChange={(e) =>
                          updateBorder({ color: e.target.value })
                        }
                        className="flex-1 h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Width</label>
                      <Input
                        type="number"
                        value={selectedCutout.border?.width || 2}
                        onChange={(e) =>
                          updateBorder({
                            width: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-16 h-8 text-xs"
                        min={0}
                        max={20}
                      />
                    </div>
                    <Slider
                      value={[selectedCutout.border?.width || 2]}
                      onValueChange={([value]) =>
                        updateBorder({ width: value })
                      }
                      min={0}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm">Style</label>
                    <Select
                      value={selectedCutout.border?.style || "solid"}
                      onValueChange={(value: "solid" | "dashed" | "dotted") =>
                        updateBorder({ style: value })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          )}
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
