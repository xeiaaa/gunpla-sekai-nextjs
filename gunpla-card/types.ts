export interface UploadedImage {
  id: string;
  url: string;
  isBase: boolean;
}

export interface BaseCard {
  id: string;
  croppedUrl: string;
}

export interface Cutout {
  id: string;
  url: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  // Visual Effects
  shadow?: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
    opacity: number;
  };
  glow?: {
    enabled: boolean;
    color: string;
    blur: number;
    opacity: number;
  };
  border?: {
    enabled: boolean;
    color: string;
    width: number;
    style: "solid" | "dashed" | "dotted";
  };
}

export type BuilderTab = "upload" | "base" | "cutouts" | "preview";

export interface CardBuilderState {
  uploadedImages: UploadedImage[];
  baseCard?: BaseCard;
  cutouts: Cutout[];
  selectedCutoutId?: string;
  activeTab: BuilderTab;
  kitSlug?: string | null;
  setActiveTab: (tab: BuilderTab) => void;
  addUploadedImages: (urls: string[]) => void;
  setBase: (id: string) => void;
  setBaseCrop: (croppedUrl: string) => void;
  addCutout: (cutout: Cutout) => void;
  updateCutout: (id: string, updates: Partial<Cutout>) => void;
  removeCutout: (id: string) => void;
  replaceBase: () => void;
  setSelectedCutout: (id?: string) => void;
}
