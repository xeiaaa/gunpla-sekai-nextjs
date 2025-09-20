"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { nanoid } from "nanoid";
import type { BaseCard, BuilderTab, CardBuilderState, Cutout, UploadedImage } from "./types";

const CardBuilderContext = createContext<CardBuilderState | null>(null);

export const CardBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [baseCard, setBaseCard] = useState<BaseCard | undefined>(undefined);
  const [cutouts, setCutouts] = useState<Cutout[]>([]);
  const [selectedCutoutId, setSelectedCutoutId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<BuilderTab>("upload");

  const addUploadedImages = useCallback((urls: string[]) => {
    setUploadedImages(prev => {
      const remaining = Math.max(0, 30 - prev.length);
      const next = urls.slice(0, remaining).map(url => ({ id: nanoid(), url, isBase: false }));
      return [...prev, ...next];
    });
  }, []);

  const setBase = useCallback((id: string) => {
    setUploadedImages(prev => prev.map(img => ({ ...img, isBase: img.id === id })));
    const base = uploadedImages.find(i => i.id === id) ?? undefined;
    if (base) setBaseCard({ id: base.id, croppedUrl: base.url });
    setActiveTab("base");
  }, [uploadedImages]);

  const setBaseCrop = useCallback((croppedUrl: string) => {
    setBaseCard(prev => (prev ? { ...prev, croppedUrl } : undefined));
  }, []);

  const addCutout = useCallback((cutout: Cutout) => {
    setCutouts(prev => [...prev, cutout]);
  }, []);

  const updateCutout = useCallback((id: string, updates: Partial<Cutout>) => {
    setCutouts(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const removeCutout = useCallback((id: string) => {
    setCutouts(prev => prev.filter(c => c.id !== id));
  }, []);

  const replaceBase = useCallback(() => {
    setBaseCard(undefined);
    setUploadedImages(prev => prev.map(i => ({ ...i, isBase: false })));
    setActiveTab("upload");
  }, []);

  const setSelectedCutout = useCallback((id?: string) => {
    setSelectedCutoutId(id);
  }, []);

  const value = useMemo<CardBuilderState>(() => ({
    uploadedImages,
    baseCard,
    cutouts,
    selectedCutoutId,
    activeTab,
    setActiveTab,
    addUploadedImages,
    setBase,
    setBaseCrop,
    addCutout,
    updateCutout,
    removeCutout,
    replaceBase,
    setSelectedCutout,
  }), [uploadedImages, baseCard, cutouts, selectedCutoutId, activeTab, addUploadedImages, setBase, setBaseCrop, addCutout, updateCutout, removeCutout, replaceBase, setSelectedCutout]);

  return (
    <CardBuilderContext.Provider value={value}>{children}</CardBuilderContext.Provider>
  );
};

export const useCardBuilder = (): CardBuilderState => {
  const ctx = useContext(CardBuilderContext);
  if (!ctx) throw new Error("useCardBuilder must be used within CardBuilderProvider");
  return ctx;
};


