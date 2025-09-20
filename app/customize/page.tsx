"use client";

import { ModelViewer } from "@/components/model-viewer";
import { parts, sazabiMaterialsMap } from "./parts";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CustomizeProvider, useCustomize } from "./context";
import { CustomizationPanel } from "./components/customization-panel";
import { useState, useRef, useEffect } from "react";
import { FINISH_TYPE } from "./types";
import { Download } from "lucide-react";
import * as THREE from "three";

function CustomizePageContent() {
  const { expandedCategory, selectedItem, handleCategoryToggle, setSelectedItem, getSelectedItemName } = useCustomize();
  const [materialStates, setMaterialStates] = useState<Record<string, { color: string; finish: FINISH_TYPE; paintType?: "solid" | "clear" }>>({});
  const [isEverythingClear, setIsEverythingClear] = useState(false);
  const [clearArmorMaterials, setClearArmorMaterials] = useState<string[]>([]);
  const [clearAlpha, setClearAlpha] = useState(0.2);
  const [paintType, setPaintType] = useState<"solid" | "clear">("clear");
  const modelViewerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768; // Tailwind's md breakpoint
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleColorChange = (materialId: string, color: string) => {
    setMaterialStates(prev => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        color: color,
        finish: prev[materialId]?.finish || FINISH_TYPE.DEFAULT
      }
    }));
    console.log("Color change requested:", materialId, color);
  };

  const handleFinishChange = (materialId: string, finish: FINISH_TYPE) => {
    if (materialId === "all") {
      // Apply finish to all materials
      const newMaterialStates: Record<string, { color: string; finish: FINISH_TYPE; paintType?: "solid" | "clear" }> = {};

      parts.forEach(part => {
        part.materials.forEach(([id]) => {
          // Use existing color from materialStates, or fallback to sazabiMaterialsMap, or default to white
          const existingColor = materialStates[id]?.color;
          const defaultColor = sazabiMaterialsMap[id]?.color || "#ffffff";

          newMaterialStates[id] = {
            color: existingColor || defaultColor,
            finish: finish,
            paintType: materialStates[id]?.paintType || (sazabiMaterialsMap[id]?.isClear ? "clear" : "solid")
          };
        });
      });

      setMaterialStates(newMaterialStates);
      setIsEverythingClear(false); // Reset clear state when applying finishes
      setClearArmorMaterials([]); // Reset armor clear state when applying finishes
      console.log("Finish applied to all materials:", finish);
    } else {
      // Apply finish to single material
      setMaterialStates(prev => ({
        ...prev,
        [materialId]: {
          ...prev[materialId],
          color: prev[materialId]?.color || sazabiMaterialsMap[materialId]?.color || "#ffffff",
          finish: finish,
          paintType: prev[materialId]?.paintType || (sazabiMaterialsMap[materialId]?.isClear ? "clear" : "solid")
        }
      }));
      console.log("Finish change requested:", materialId, finish);
    }
  };

  const handleRandomizeColors = () => {
    // Generate random colors for all materials
    const newMaterialStates: Record<string, { color: string; finish: FINISH_TYPE; paintType?: "solid" | "clear" }> = {};

    // Get all material IDs from parts
    parts.forEach(part => {
      part.materials.forEach(([materialId]) => {
        // Generate random hex color
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

        newMaterialStates[materialId] = {
          color: randomColor,
          finish: materialStates[materialId]?.finish || FINISH_TYPE.DEFAULT,
          paintType: materialStates[materialId]?.paintType || "clear"
        };
      });
    });

    setMaterialStates(newMaterialStates);
    setIsEverythingClear(false); // Reset clear state
    setClearArmorMaterials([]); // Reset armor clear state
    console.log("Randomized colors for all materials:", newMaterialStates);
  };

  const handleRandomizeWithColorBlocking = () => {
    // Group materials by their original colors from sazabiMaterialsMap
    const colorGroups: Record<string, string[]> = {};

    // Get all material IDs from parts and group by original color
    parts.forEach(part => {
      part.materials.forEach(([materialId]) => {
        const originalColor = sazabiMaterialsMap[materialId]?.color || "#ffffff";

        if (!colorGroups[originalColor]) {
          colorGroups[originalColor] = [];
        }
        colorGroups[originalColor].push(materialId);
      });
    });

    // Generate a random color for each color group
    const newMaterialStates: Record<string, { color: string; finish: FINISH_TYPE; paintType?: "solid" | "clear" }> = {};
    const groupColors: Record<string, string> = {};

    Object.entries(colorGroups).forEach(([originalColor, materialIds]) => {
      // Generate one random color for this group
      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      groupColors[originalColor] = randomColor;

      // Apply the same random color to all materials in this group
      materialIds.forEach(materialId => {
        newMaterialStates[materialId] = {
          color: randomColor,
          finish: materialStates[materialId]?.finish || FINISH_TYPE.DEFAULT,
          paintType: materialStates[materialId]?.paintType || "clear"
        };
      });
    });

    setMaterialStates(newMaterialStates);
    setIsEverythingClear(false); // Reset clear state
    setClearArmorMaterials([]); // Reset armor clear state
    console.log("Randomized colors with color blocking:", newMaterialStates);
    console.log("Color groups:", colorGroups);
    console.log("Group colors:", groupColors);
  };

  const handleRandomizeArmorWithColorBlocking = () => {
    // Group armor and funnel materials by their original colors from sazabiMaterialsMap
    const colorGroups: Record<string, string[]> = {};

    // Get all material IDs from parts and group by original color (only armor and funnel materials)
    parts.forEach(part => {
      part.materials.forEach(([materialId]) => {
        // Only process materials with 'armor' or 'funnels' in their ID
        if (materialId.toLowerCase().includes('armor') || materialId.toLowerCase().includes('funnels')) {
          const originalColor = sazabiMaterialsMap[materialId]?.color || "#ffffff";

          if (!colorGroups[originalColor]) {
            colorGroups[originalColor] = [];
          }
          colorGroups[originalColor].push(materialId);
        }
      });
    });

    // Generate a random color for each color group
    const newMaterialStates: Record<string, { color: string; finish: FINISH_TYPE; paintType?: "solid" | "clear" }> = {};
    const groupColors: Record<string, string> = {};

    Object.entries(colorGroups).forEach(([originalColor, materialIds]) => {
      // Generate one random color for this group
      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      groupColors[originalColor] = randomColor;

      // Apply the same random color to all armor materials in this group
      materialIds.forEach(materialId => {
        newMaterialStates[materialId] = {
          color: randomColor,
          finish: materialStates[materialId]?.finish || FINISH_TYPE.DEFAULT,
          paintType: materialStates[materialId]?.paintType || "clear"
        };
      });
    });

    // Merge with existing material states to preserve non-armor materials
    const finalMaterialStates = { ...materialStates, ...newMaterialStates };

    setMaterialStates(finalMaterialStates);
    setIsEverythingClear(false); // Reset clear state
    setClearArmorMaterials([]); // Reset armor clear state
    console.log("Randomized armor colors with color blocking:", newMaterialStates);
    console.log("Armor color groups:", colorGroups);
    console.log("Armor group colors:", groupColors);
  };

  // Helper function to convert HSL to hex
  const hslToHex = (h: number, s: number, l: number): string => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const handleRandomizeHSL = () => {
    // Generate random hue (0-360) and saturation (50-100) for all armor and funnel materials
    const randomHue = Math.floor(Math.random() * 360);
    const randomSaturation = Math.floor(Math.random() * 51) + 50; // 50-100%
    const lightness = 50; // Fixed lightness for consistency

    const newMaterialStates: Record<string, { color: string; finish: FINISH_TYPE; paintType?: "solid" | "clear" }> = {};

    // Apply the same random hue and saturation to all armor and funnel materials
    parts.forEach(part => {
      part.materials.forEach(([materialId]) => {
        // Only process materials with 'armor' or 'funnels' in their ID
        if (materialId.toLowerCase().includes('armor') || materialId.toLowerCase().includes('funnels')) {
          const newColor = hslToHex(randomHue, randomSaturation, lightness);

          newMaterialStates[materialId] = {
            color: newColor,
            finish: materialStates[materialId]?.finish || FINISH_TYPE.DEFAULT,
            paintType: materialStates[materialId]?.paintType || "clear"
          };
        }
      });
    });

    // Merge with existing material states to preserve non-armor materials
    const finalMaterialStates = { ...materialStates, ...newMaterialStates };

    setMaterialStates(finalMaterialStates);
    setIsEverythingClear(false); // Reset clear state
    setClearArmorMaterials([]); // Reset armor clear state
    console.log("Randomized HSL for armor materials:", newMaterialStates);
    console.log("Random HSL values - Hue:", randomHue, "Saturation:", randomSaturation, "Lightness:", lightness);
  };

  const handleResetAll = () => {
    // Reset all materials to their default values from sazabiMaterialsMap
    const newMaterialStates: Record<string, { color: string; finish: FINISH_TYPE; paintType?: "solid" | "clear" }> = {};

    Object.entries(sazabiMaterialsMap).forEach(([materialId, materialData]) => {
      newMaterialStates[materialId] = {
        color: materialData.color,
        finish: materialData.finish,
        paintType: materialData.isClear ? "clear" : "solid" // Use correct default from sazabiMaterialsMap
      };
    });

    setMaterialStates(newMaterialStates);
    setIsEverythingClear(false); // Reset clear state
    setClearArmorMaterials([]); // Reset armor clear state
    console.log("Reset all materials to default values:", newMaterialStates);
  };

  const handleEverythingClear = (alpha: number) => {
    // Apply clear/transparent effect to all materials while preserving current colors
    const newMaterialStates: Record<string, { color: string; finish: FINISH_TYPE; paintType?: "solid" | "clear" }> = {};

    Object.entries(sazabiMaterialsMap).forEach(([materialId, materialData]) => {
      // Preserve existing color from materialStates, or use default from sazabiMaterialsMap
      const existingColor = materialStates[materialId]?.color;
      const defaultColor = materialData.color;

      newMaterialStates[materialId] = {
        color: existingColor || defaultColor,
        finish: FINISH_TYPE.DEFAULT, // Keep original finish but mark as clear
        paintType: materialStates[materialId]?.paintType || (materialData.isClear ? "clear" : "solid")
      };
    });

    setMaterialStates(newMaterialStates);
    setIsEverythingClear(true);
    setClearArmorMaterials([]); // Reset armor clear state
    setClearAlpha(alpha);
    console.log("Applied clear effect to all materials with alpha:", alpha);
  };

  const handleClearOuterArmors = (alpha: number) => {
    // Find all materials with 'armor' in their ID
    const armorMaterialIds: string[] = [];

    Object.keys(sazabiMaterialsMap).forEach((materialId) => {
      if (materialId.toLowerCase().includes('armor')) {
        armorMaterialIds.push(materialId);
      }
    });

    setClearArmorMaterials(armorMaterialIds);
    setIsEverythingClear(false); // Reset the global clear state
    setClearAlpha(alpha);
    console.log("Applied clear effect to armor materials:", armorMaterialIds, "with alpha:", alpha);
  };

  const handlePaintTypeChange = (materialId: string, paintType: "solid" | "clear") => {
    // Update the specific material's paint type
    setMaterialStates(prev => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        color: prev[materialId]?.color || sazabiMaterialsMap[materialId]?.color || "#ffffff",
        finish: prev[materialId]?.finish || sazabiMaterialsMap[materialId]?.finish || FINISH_TYPE.DEFAULT,
        paintType: paintType
      }
    }));

    // Update clear armor materials list based on paint type
    setClearArmorMaterials(prev => {
      if (paintType === "clear") {
        // Add material to clear list if not already present
        return prev.includes(materialId) ? prev : [...prev, materialId];
      } else {
        // Remove material from clear list if switching to solid
        return prev.filter(id => id !== materialId);
      }
    });

    setIsEverythingClear(false); // Disable global clear effect when individual paint types change
    console.log("Paint type changed for material", materialId, "to:", paintType);
  };

  const handleDownloadImage = async () => {
    if (!rendererRef.current) {
      console.error('Renderer not ready');
      return;
    }

    try {
      // Force a re-render
      window.dispatchEvent(new Event('resize'));
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use Three.js renderer to capture the scene
      const canvas = rendererRef.current.domElement;
      const dataURL = canvas.toDataURL('image/png', 1.0);

      // Create download link
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `sazabi-customization-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // Show mobile empty state
  if (isMobile) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">3D Customization Not Available</h2>
            <p className="text-muted-foreground">
              This feature is not yet available on mobile devices. Please access this page on a desktop to view the 3D customization feature.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>For the best experience, please use:</p>
            <ul className="mt-2 space-y-1">
              <li>• Desktop computer</li>
              <li>• Laptop</li>
              <li>• Tablet in landscape mode</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Sidebar A - Parts (150px) */}
      <div className="w-[180px] border-r bg-muted/30 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-3">Parts</h3>
          <div className="space-y-0">
            {parts.map((part) => (
              <div key={part.slug} className="border-b border-border pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                <button
                  onClick={() => handleCategoryToggle(part.slug)}
                  className="flex items-center justify-between w-full text-left font-medium hover:text-primary transition-colors"
                >
                  <span>{part.label}</span>
                  {expandedCategory === part.slug ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {expandedCategory === part.slug && (
                  <div className="mt-3">
                    <div className="space-y-2">
                      {part.materials.map(([materialId, materialName]) => (
              <button
                          key={materialId}
                          onClick={() => setSelectedItem(materialId)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            selectedItem === materialId
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                          {materialName}
              </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar B - Customization Panel (300px) */}
      <div className="w-[300px] border-r bg-muted/20 overflow-y-auto">
        {selectedItem ? (
          <CustomizationPanel
            selectedItemName={getSelectedItemName()}
            selectedItemId={selectedItem}
            onColorChange={handleColorChange}
            onFinishChange={handleFinishChange}
            onRandomizeColors={handleRandomizeColors}
            onRandomizeWithColorBlocking={handleRandomizeWithColorBlocking}
            onRandomizeArmorWithColorBlocking={handleRandomizeArmorWithColorBlocking}
            onRandomizeHSL={handleRandomizeHSL}
            onResetAll={handleResetAll}
            onEverythingClear={handleEverythingClear}
            onClearOuterArmors={handleClearOuterArmors}
            onPaintTypeChange={handlePaintTypeChange}
            materialStates={materialStates}
          />
        ) : (
        <div className="p-4">
            <h3 className="font-semibold text-sm mb-3">Customization Panel</h3>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Select a material from the left sidebar to customize it.
              </p>
            </div>
            </div>
          )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full">
          <div className="h-full flex flex-col">

            <div className="flex-1 relative">
              {/* Floating Header Section */}
              <div className="absolute top-4 left-4 right-4 z-10">
                {selectedItem ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-1 text-muted-foreground drop-shadow-lg">
                      Customizing: {getSelectedItemName()}
                    </h2>

                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold mb-1 text-muted-foreground drop-shadow-lg">
                      MSN-04 Sazabi
                    </h2>
                    <p className="text-sm text-muted-foreground drop-shadow-lg">
                      Choose a part from the left sidebar to get started
                    </p>
                  </div>
                )}
              </div>

              {/* 3D Model Viewer - Full Space */}
              <div ref={modelViewerRef} className="w-full h-full rounded-lg overflow-hidden">
                <ModelViewer
                  modelUrl="/models/sazabi.glb"
                  materialId={selectedItem}
                  color={selectedItem && materialStates[selectedItem]?.color}
                  finish={selectedItem && materialStates[selectedItem]?.finish}
                  allMaterialStates={materialStates}
                  isEverythingClear={isEverythingClear}
                  clearArmorMaterials={clearArmorMaterials}
                  clearAlpha={clearAlpha}
                  paintType={paintType}
                  onRendererReady={(renderer) => {
                    rendererRef.current = renderer;
                  }}
                  onModelLoaded={() => {
                    // Reset all materials to default state when model loads
                    handleResetAll();
                  }}
                />
              </div>

              {/* Floating Download Button */}
              <button
                onClick={handleDownloadImage}
                className="absolute top-4 right-4 z-20 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg hover:bg-background transition-colors"
                title="Download current model as image"
              >
                <Download className="w-5 h-5 text-foreground" />
              </button>

              {/* Floating Customization Panel (when item is selected) */}
              {/* {selectedItem && (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg">
                    <h3 className="font-semibold mb-2">Customization Options</h3>
                    <p className="text-sm text-muted-foreground">
                      Customization interface for {getSelectedItemName()} coming soon...
                    </p>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomizePage() {
  return (
    <CustomizeProvider>
      <CustomizePageContent />
    </CustomizeProvider>
  );
}
