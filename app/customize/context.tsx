"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { parts } from "./parts";

interface CustomizeContextType {
  expandedCategory: string | null;
  selectedItem: string | null;
  handleCategoryToggle: (categorySlug: string) => void;
  setSelectedItem: (itemId: string) => void;
  getSelectedItemName: () => string | undefined;
}

const CustomizeContext = createContext<CustomizeContextType | undefined>(undefined);

export function CustomizeProvider({ children }: { children: ReactNode }) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleCategoryToggle = (categorySlug: string) => {
    setExpandedCategory(expandedCategory === categorySlug ? null : categorySlug);
  };

  const getSelectedItemName = () => {
    if (!selectedItem) return undefined;
    return parts.find(p => p.materials.some(([id]) => id === selectedItem))?.materials.find(([id]) => id === selectedItem)?.[1];
  };

  return (
    <CustomizeContext.Provider
      value={{
        expandedCategory,
        selectedItem,
        handleCategoryToggle,
        setSelectedItem,
        getSelectedItemName,
      }}
    >
      {children}
    </CustomizeContext.Provider>
  );
}

export function useCustomize() {
  const context = useContext(CustomizeContext);
  if (context === undefined) {
    throw new Error("useCustomize must be used within a CustomizeProvider");
  }
  return context;
}
