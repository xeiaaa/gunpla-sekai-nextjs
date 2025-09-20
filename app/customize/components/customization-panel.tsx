"use client";

import { useState } from "react";
import { Plus, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FINISH_TYPE } from "../types";
import { sazabiMaterialsMap } from "../parts";

interface CustomizationPanelProps {
  selectedItemName?: string;
  selectedItemId?: string;
  onColorChange?: (materialId: string, color: string) => void;
  onFinishChange?: (materialId: string, finish: FINISH_TYPE) => void;
  onRandomizeColors?: () => void;
  onRandomizeWithColorBlocking?: () => void;
  onRandomizeArmorWithColorBlocking?: () => void;
  onRandomizeHSL?: () => void;
  onResetAll?: () => void;
  onEverythingClear?: (alpha: number) => void;
  onClearOuterArmors?: (alpha: number) => void;
  onPaintTypeChange?: (materialId: string, paintType: "solid" | "clear") => void;
  materialStates?: Record<string, { color: string; finish: FINISH_TYPE; paintType?: "solid" | "clear" }>;
}

export function CustomizationPanel({ selectedItemName, selectedItemId, onColorChange, onFinishChange, onRandomizeColors, onRandomizeWithColorBlocking, onRandomizeArmorWithColorBlocking, onRandomizeHSL, onResetAll, onEverythingClear, onClearOuterArmors, onPaintTypeChange, materialStates }: CustomizationPanelProps) {
  // TODO: Use selectedItemName for customization context
  console.log("Customizing:", selectedItemName, "ID:", selectedItemId);
  const [activeTab, setActiveTab] = useState<"palette" | "decals" | "paints" | "fun">("palette");
  const [paintType, setPaintType] = useState<"solid" | "clear">("clear");
  const [customColor, setCustomColor] = useState("#ffffff");
  const [selectedBrand, setSelectedBrand] = useState("Tamiya Spray");
  const [clearAlpha, setClearAlpha] = useState(0.2);

  // Get unique colors from sazabiMaterialsMap
  const getUniqueColors = () => {
    const colors = Object.values(sazabiMaterialsMap).map(material => material.color);
    return [...new Set(colors)]; // Remove duplicates
  };

  const [paletteColors, setPaletteColors] = useState<string[]>(getUniqueColors());

  // Get current material state or default values
  const getCurrentMaterialState = () => {
    if (selectedItemId && materialStates?.[selectedItemId]) {
      return materialStates[selectedItemId];
    }
    // Fallback to sazabiMaterialsMap or defaults
    if (selectedItemId && sazabiMaterialsMap[selectedItemId]) {
      return {
        color: sazabiMaterialsMap[selectedItemId].color,
        finish: sazabiMaterialsMap[selectedItemId].finish,
        paintType: sazabiMaterialsMap[selectedItemId].isClear ? "clear" : "solid"
      };
    }
    return {
      color: "#ffffff",
      finish: FINISH_TYPE.DEFAULT,
      paintType: "solid" as "solid" | "clear"
    };
  };

  const currentMaterialState = getCurrentMaterialState();

  const finishes = [
    {
      value: FINISH_TYPE.MATTE,
      label: "M",
      name: "Matte",
      description: "Flat, non-reflective surface with a smooth subdued look."
    },
    {
      value: FINISH_TYPE.GLOSS,
      label: "G",
      name: "Gloss",
      description: "Shiny reflective surface, makes colors pop and appear vibrant."
    },
    {
      value: FINISH_TYPE.SEMIGLOSS,
      label: "SG",
      name: "Semi-Gloss",
      description: "Balanced sheen between matte and gloss, subtle shine."
    },
    {
      value: FINISH_TYPE.PEARL,
      label: "P",
      name: "Pearl",
      description: "Soft shimmering finish with iridescent highlights."
    },
    {
      value: FINISH_TYPE.CANDY,
      label: "C",
      name: "Candy",
      description: "Transparent glossy layer over metallic base, deep rich color."
    },
    {
      value: FINISH_TYPE.METALLIC,
      label: "F",
      name: "Metallic",
      description: "Shiny reflective finish with metallic flakes for a realistic metal effect."
    },
    {
      value: FINISH_TYPE.DEFAULT,
      label: "X",
      name: "Default",
      description: "Standard plastic look, unpainted or straight out of box."
    },
  ];


  const randomizeOptions = [
    "Randomize Color", "Randomize with Color Blocking", "Randomize Armor with Color Blocking", "Randomize HSL"
  ];

  const finishOptions = [
    "Matte", "Gloss", "Semi Gloss", "Metallic", "Candy", "Pearl"
  ];

  const clearOptions = [
    "Clear Outer Armors", "Everything Clear"
  ];

  // TODO: Implement brand selection with paintBrands array
  // const paintBrands = ["Tamiya Spray", "Mr. Color", "Vallejo", "Citadel", "Testors"];

  const paintColors = [
    "#8B4513", "#2F4F2F", "#556B2F", "#696969", "#2F4F4F", "#8B0000", "#006400", "#4B0082",
    "#000080", "#008B8B", "#B8860B", "#A9A9A9", "#006400", "#8B4513", "#2F4F2F", "#696969",
    "#FF0000", "#FF8C00", "#FFD700", "#008000", "#00FFFF", "#0000FF", "#8A2BE2", "#FF1493",
    "#000000", "#FFFFFF", "#808080", "#800080", "#00FF00", "#FFFF00", "#FF00FF", "#00FFFF",
    "#8B4513", "#2F4F2F", "#556B2F", "#696969", "#2F4F4F", "#8B0000", "#006400", "#4B0082",
    "#000080", "#008B8B", "#B8860B", "#A9A9A9", "#006400", "#8B4513", "#2F4F2F", "#696969",
    "#FF0000", "#FF8C00", "#FFD700", "#008000", "#00FFFF", "#0000FF", "#8A2BE2", "#FF1493",
    "#000000", "#FFFFFF", "#808080", "#800080", "#00FF00", "#FFFF00", "#FF00FF", "#00FFFF",
    "#8B4513", "#2F4F2F", "#556B2F", "#696969", "#2F4F4F", "#8B0000", "#006400", "#4B0082",
    "#000080", "#008B8B", "#B8860B", "#A9A9A9", "#006400", "#8B4513", "#2F4F2F", "#696969",
    "#FF0000", "#FF8C00", "#FFD700"
  ];

  const handleAddColor = () => {
    if (!paletteColors.includes(customColor)) {
      setPaletteColors(prev => [...prev, customColor]);
    }
  };

  const handleColorSelect = (color: string) => {
    // Update the material color in the 3D model
    if (selectedItemId && onColorChange) {
      onColorChange(selectedItemId, color);
    }
    console.log("Selected color:", color, "for material:", selectedItemId);
  };

  const handleFinishSelect = (finish: FINISH_TYPE) => {
    // Update the material finish
    if (selectedItemId && onFinishChange) {
      onFinishChange(selectedItemId, finish);
    }
    console.log("Selected finish:", finish, "for material:", selectedItemId);
  };

  const handleReset = () => {
    setPaintType("clear");
    setCustomColor("#ffffff");
    setPaletteColors(getUniqueColors()); // Reset to original unique colors
    // Reset all materials to default values from sazabiMaterialsMap
    if (onResetAll) {
      onResetAll();
    }
  };

  const handleFunOption = (option: string) => {
    if (option === "Randomize Color" && onRandomizeColors) {
      onRandomizeColors();
    } else if (option === "Randomize with Color Blocking" && onRandomizeWithColorBlocking) {
      onRandomizeWithColorBlocking();
    } else if (option === "Randomize Armor with Color Blocking" && onRandomizeArmorWithColorBlocking) {
      onRandomizeArmorWithColorBlocking();
    } else if (option === "Randomize HSL" && onRandomizeHSL) {
      onRandomizeHSL();
    }
    // Handle clear options
    else if (option === "Everything Clear" && onEverythingClear) {
      onEverythingClear(clearAlpha);
    } else if (option === "Clear Outer Armors" && onClearOuterArmors) {
      onClearOuterArmors(clearAlpha);
    }
    // Handle finish options
    else if (onFinishChange) {
      // Map fun option names to finish types
      let finishType: FINISH_TYPE;
      switch (option) {
        case "Semi Gloss":
          finishType = FINISH_TYPE.SEMIGLOSS;
          break;
        case "Matte":
          finishType = FINISH_TYPE.MATTE;
          break;
        case "Metallic":
          finishType = FINISH_TYPE.METALLIC;
          break;
        case "Gloss":
          finishType = FINISH_TYPE.GLOSS;
          break;
        case "Candy":
          finishType = FINISH_TYPE.CANDY;
          break;
        case "Pearl":
          finishType = FINISH_TYPE.PEARL;
          break;
        default:
          return; // Unknown option
      }

      // Apply finish to all materials
      onFinishChange("all", finishType);
    }
    console.log("Fun option clicked:", option);
  };

  return (
    <TooltipProvider>
      <div className="p-4 space-y-6">
        <h3 className="font-semibold text-sm mb-4">Customization Panel</h3>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("palette")}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "palette"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            My Palette
          </button>
          <button
            onClick={() => setActiveTab("decals")}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "decals"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            Decals
          </button>
          {/* <button
            onClick={() => setActiveTab("paints")}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "paints"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            Paints
          </button> */}
          <button
            onClick={() => setActiveTab("fun")}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "fun"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            Fun
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "palette" && (
        <>
          {/* Type Section */}
          <div>
            <h4 className="font-medium text-sm mb-3">Opacity</h4>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (selectedItemId && onPaintTypeChange) {
                    onPaintTypeChange(selectedItemId, "solid");
                  }
                }}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 text-xs rounded-md border transition-all ${
                  currentMaterialState.paintType === "solid"
                    ? "bg-background border-border shadow-sm"
                    : "border-transparent hover:bg-muted/50"
                }`}
              >
                <span>Solid</span>
              </button>
              <button
                onClick={() => {
                  if (selectedItemId && onPaintTypeChange) {
                    onPaintTypeChange(selectedItemId, "clear");
                  }
                }}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 text-xs rounded-md border transition-all ${
                  currentMaterialState.paintType === "clear"
                    ? "bg-background border-border shadow-sm"
                    : "border-transparent hover:bg-muted/50"
                }`}
              >
                <span>Clear</span>
              </button>
            </div>
          </div>

      {/* Finish Section */}
      <div>
        <h4 className="font-medium text-sm mb-3">Finish</h4>
        <div className="grid grid-cols-2 gap-2">
          {finishes.map((finish) => (
            <Tooltip key={finish.value}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleFinishSelect(finish.value)}
                  className={`flex flex-col items-center gap-1 py-2 px-3 text-xs rounded-md border transition-all ${
                    currentMaterialState.finish === finish.value
                      ? "bg-background border-border shadow-sm"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <span>{finish.name}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-black border border-gray-300">
                <div className="text-center">
                  <div className="font-medium text-black">{finish.name}</div>
                  <div className="text-xs text-gray-600 mt-1 max-w-xs">
                    {finish.description}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Add Color to Palette */}
      <div>
        <h4 className="font-medium text-sm mb-3">Add Color to Palette</h4>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <div
              className="w-12 h-12 rounded-full border-2 border-border cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              style={{ backgroundColor: customColor }}
            />
            <Input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-12 h-12 rounded-full"
            />
          </div>
          <div className="flex-1">
            <div className="text-sm font-mono text-muted-foreground mb-1">{customColor}</div>
            <Button
              onClick={handleAddColor}
              size="sm"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Palette
            </Button>
          </div>
        </div>
      </div>

      {/* Palette */}
      <div>
        <h4 className="font-medium text-sm mb-3">Palette</h4>
        <div className="grid grid-cols-8 gap-2">
          {paletteColors.map((color, index) => (
            <button
              key={index}
              onClick={() => handleColorSelect(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                currentMaterialState.color === color
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              }`}
              style={{ backgroundColor: color }}
            >
              {currentMaterialState.color === color && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
        </>
      )}

      {activeTab === "decals" && (
        <>
          <div>
            <h4 className="font-medium text-sm mb-3">Decals</h4>
            <div className="text-sm text-muted-foreground">
              Decal functionality coming soon...
            </div>
          </div>
        </>
      )}

      {/* {activeTab === "paints" && (
        <>
          <div>
            <h4 className="font-medium text-sm mb-3">Paint Colors</h4>
            <div className="grid grid-cols-8 gap-2">
              {paintColors.map((color, index) => (
                <button
                  key={index}
                  className="w-8 h-8 rounded-full border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </>
      )} */}

      {activeTab === "fun" && (
        <>
          {/* Fun Section */}
          <div>
            {/* Randomize Colors Group */}
            <div className="mb-4">
              <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Randomize Colors</h5>
              <div className="grid grid-cols-1 gap-1">
                {randomizeOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFunOption(option)}
                    className="text-left text-sm text-primary hover:text-primary/80 transition-colors py-1"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Finish Group */}
            <div className="mb-4">
              <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Finish</h5>
              <div className="grid grid-cols-2 gap-1">
                {finishOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFunOption(option)}
                    className="text-left text-sm text-primary hover:text-primary/80 transition-colors py-1"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Group */}
            <div className="mb-4">
              <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Clear</h5>
              <div className="grid grid-cols-1 gap-1">
                {clearOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFunOption(option)}
                    className="text-left text-sm text-primary hover:text-primary/80 transition-colors py-1"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-border my-4"></div>

            {/* Reset Button */}
            <div className="mb-4">
              <button
                onClick={() => onResetAll && onResetAll()}
                className="text-left text-sm text-red-500 hover:text-red-600 transition-colors py-1"
              >
                Reset All
              </button>
            </div>
          </div>
        </>
      )}

      </div>
    </TooltipProvider>
  );
}
