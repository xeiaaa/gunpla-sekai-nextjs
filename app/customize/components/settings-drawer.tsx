"use client";

import { Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EnvironmentPreset =
  | "apartment"
  | "city"
  | "dawn"
  | "forest"
  | "lobby"
  | "night"
  | "park"
  | "studio"
  | "sunset"
  | "warehouse";

interface SettingsDrawerProps {
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  environmentPreset: EnvironmentPreset;
  onEnvironmentPresetChange: (preset: EnvironmentPreset) => void;
  showFinishTooltips: boolean;
  onShowFinishTooltipsChange: (show: boolean) => void;
}

const environmentPresets: { value: EnvironmentPreset; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "city", label: "City" },
  { value: "dawn", label: "Dawn" },
  { value: "forest", label: "Forest" },
  { value: "lobby", label: "Lobby" },
  { value: "night", label: "Night" },
  { value: "park", label: "Park" },
  { value: "studio", label: "Studio" },
  { value: "sunset", label: "Sunset" },
  { value: "warehouse", label: "Warehouse" },
];

const backgroundColorOptions = [
  { value: "transparent", label: "Transparent" },
  { value: "#ffffff", label: "White" },
  { value: "#000000", label: "Black" },
  { value: "#f3f4f6", label: "Light Gray" },
  { value: "#374151", label: "Dark Gray" },
  { value: "#1f2937", label: "Charcoal" },
  { value: "#fef3c7", label: "Warm White" },
  { value: "#e0e7ff", label: "Cool White" },
];

export function SettingsDrawer({
  backgroundColor,
  onBackgroundColorChange,
  environmentPreset,
  onEnvironmentPresetChange,
  showFinishTooltips,
  onShowFinishTooltipsChange,
}: SettingsDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-background/95 backdrop-blur-sm border border-border shadow-lg transition-colors"
          title="3D Model Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] px-6">
        <SheetHeader className="px-0">
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            3D Model Settings
          </SheetTitle>
          <SheetDescription>
            Customize the 3D model environment and display options
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6 px-0 overflow-y-auto flex-1">
          {/* Background Color */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Background</h3>
            <div className="space-y-3">
              <Label htmlFor="background-color">Background Color</Label>
              <Select
                value={backgroundColor}
                onValueChange={onBackgroundColorChange}
              >
                <SelectTrigger className="focus:ring-0 focus:ring-offset-0 focus:outline-none">
                  <SelectValue placeholder="Select background color" />
                </SelectTrigger>
                <SelectContent>
                  {backgroundColorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{
                            backgroundColor:
                              option.value === "transparent"
                                ? "transparent"
                                : option.value,
                            backgroundImage:
                              option.value === "transparent"
                                ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                                : undefined,
                            backgroundSize:
                              option.value === "transparent"
                                ? "8px 8px"
                                : undefined,
                            backgroundPosition:
                              option.value === "transparent"
                                ? "0 0, 0 4px, 4px -4px, -4px 0px"
                                : undefined,
                          }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Environment Preset */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Environment</h3>
            <div className="space-y-3">
              <Label htmlFor="environment-preset">Environment Preset</Label>
              <Select
                value={environmentPreset}
                onValueChange={onEnvironmentPresetChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select environment preset" />
                </SelectTrigger>
                <SelectContent>
                  {environmentPresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Changes the lighting and reflections of the 3D model
              </p>
            </div>
          </div>

          {/* UI Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Interface</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="finish-tooltips">Show Finish Tooltips</Label>
                  <p className="text-xs text-muted-foreground">
                    Display tooltips when hovering over finish options
                  </p>
                </div>
                <Switch
                  id="finish-tooltips"
                  checked={showFinishTooltips}
                  onCheckedChange={onShowFinishTooltipsChange}
                />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
