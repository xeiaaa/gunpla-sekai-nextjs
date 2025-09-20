"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useCardBuilder } from "@/gunpla-card/context";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
import dynamic from "next/dynamic";

const AddCutoutDialog = dynamic(() => import("@/gunpla-card/components/cutouts/add-cutout/AddCutoutDialog"), { ssr: false });

export const UploadPanel: React.FC<{ onSetBase?: () => void }> = ({ onSetBase }) => {
  const { addUploadedImages, uploadedImages, setBase } = useCardBuilder();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const urls: string[] = await Promise.all(
      acceptedFiles.slice(0, 30).map(file => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      }))
    );
    addUploadedImages(urls);
  }, [addUploadedImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] }, multiple: true });

  const handleSetBase = useCallback((id: string) => {
    setBase(id);
    onSetBase?.();
  }, [setBase, onSetBase]);

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area - Always at top */}
      <div {...getRootProps()} className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-sm">Drop images here...</p>
        ) : (
          <p className="text-sm">Drag & drop images here, or click to select (max 30)</p>
        )}
      </div>

      {/* Image List - Vertical layout */}
      <div className="space-y-2">
        {uploadedImages.map(img => (
          <div key={img.id} className="border rounded overflow-hidden">
            <div className="relative w-full h-20">
              <Image src={img.url} alt="upload" fill className="object-cover" sizes="(max-width: 768px) 40vw, 20vw" />
            </div>
            <div className="p-2 grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant={img.isBase ? "default" : "secondary"}
                onClick={() => handleSetBase(img.id)}
                className="text-xs"
              >
                {img.isBase ? "Base" : "Set as Base"}
              </Button>
              <AddCutoutDialog sourceUrl={img.url} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


