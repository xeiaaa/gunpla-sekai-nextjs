"use client";

import { Card } from "@/components/ui/card";
import BuildMediaLibrary from "../build-media-library";
import { useBuildEdit } from "@/contexts/build-edit";

export function GalleryTab() {
  const { buildData, setMediaLibraryCount } = useBuildEdit();

  if (!buildData) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Build Gallery</h2>
        <p className="text-gray-600 mb-6">
          Manage all your build images in one place. Upload, organize, and add
          captions to your photos.
        </p>
      </div>

      <BuildMediaLibrary
        buildId={buildData.id}
        showSelection={false}
        featuredImageId={buildData.featuredImageId}
        onMediaCountChange={setMediaLibraryCount}
      />
    </div>
  );
}
