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
}

export type BuilderTab = "kit" | "upload" | "base" | "cutouts" | "preview";

export interface CardBuilderState {
  uploadedImages: UploadedImage[];
  baseCard?: BaseCard;
  cutouts: Cutout[];
  selectedKit?: { id: string; name: string };
  activeTab: BuilderTab;
  setActiveTab: (tab: BuilderTab) => void;
  addUploadedImages: (urls: string[]) => void;
  setSelectedKit: (kit: { id: string; name: string } | undefined) => void;
  setBase: (id: string) => void;
  setBaseCrop: (croppedUrl: string) => void;
  addCutout: (cutout: Cutout) => void;
  updateCutout: (id: string, updates: Partial<Cutout>) => void;
  removeCutout: (id: string) => void;
  replaceBase: () => void;
}


