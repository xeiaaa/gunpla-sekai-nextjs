"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useCardBuilder } from "@/gunpla-card/context";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";

export const UploadPanel: React.FC = () => {
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

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop images here...</p> : <p>Drag & drop images here, or click to select (max 30)</p>}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {uploadedImages.map(img => (
          <div key={img.id} className="relative border rounded overflow-hidden">
            <div className="relative w-full h-24">
              <Image src={img.url} alt="upload" fill className="object-cover" sizes="(max-width: 768px) 33vw, (max-width: 1024px) 20vw, 10vw" />
            </div>
            <div className="p-2 flex gap-2">
              <Button size="sm" variant={img.isBase ? "default" : "secondary"} onClick={() => setBase(img.id)}>
                {img.isBase ? "Base" : "Set as Base"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


