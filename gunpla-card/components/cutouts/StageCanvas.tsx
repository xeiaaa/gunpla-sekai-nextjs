"use client";

import React, { useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import useImage from "use-image";
import { useCardBuilder } from "@/gunpla-card/context";

const DraggableImage: React.FC<{ src: string; id: string; x: number; y: number; scale: number; rotation: number; opacity: number; zIndex: number; canvasWidth: number; canvasHeight: number; isSelected: boolean; onChange: (updates: Partial<{ x: number; y: number; scale: number; rotation: number; opacity: number; zIndex: number }>) => void; onSelect: (shapeRef: any) => void; }>
  = ({ src, x, y, scale, rotation, opacity, zIndex, canvasWidth, canvasHeight, isSelected, onChange, onSelect }) => {
  const [image] = useImage(src, "anonymous");
  const shapeRef = useRef<any>(null);

  // Convert relative coordinates (0-1) to absolute coordinates
  const absoluteX = x * canvasWidth;
  const absoluteY = y * canvasHeight;

  // Convert relative scale to absolute scale based on canvas size
  // Use a reference canvas size (e.g., 500px) to normalize the scale
  const referenceCanvasSize = 500;
  const absoluteScale = scale * (Math.min(canvasWidth, canvasHeight) / referenceCanvasSize);

  return (
    <KonvaImage
      ref={shapeRef}
      image={image as any}
      x={absoluteX}
      y={absoluteY}
      scaleX={absoluteScale}
      scaleY={absoluteScale}
      rotation={rotation}
      opacity={opacity}
      zIndex={zIndex}
      draggable
      stroke={isSelected ? "#3b82f6" : undefined}
      strokeWidth={isSelected ? 3 : 0}
      onDragEnd={e => {
        // Convert absolute coordinates back to relative coordinates
        const relativeX = e.target.x() / canvasWidth;
        const relativeY = e.target.y() / canvasHeight;
        onChange({ x: relativeX, y: relativeY });
      }}
      onTransformEnd={() => {
        const node = shapeRef.current;
        // Convert absolute scale back to relative scale
        const absoluteScaleFromNode = node.scaleX();
        const relativeScale = absoluteScaleFromNode * (referenceCanvasSize / Math.min(canvasWidth, canvasHeight));
        onChange({ scale: relativeScale, rotation: node.rotation() });
      }}
      onClick={() => {
        onSelect(shapeRef.current);
      }}
      onTap={() => {
        onSelect(shapeRef.current);
      }}
    />
  );
};

const BaseCardImage: React.FC<{ src: string; width: number; height: number }> = ({ src, width, height }) => {
  const [image] = useImage(src, "anonymous");
  return <KonvaImage image={image as any} x={0} y={0} width={width} height={height} />;
};

const StageCanvas: React.FC<{ maxWidth?: number; maxHeight?: number }> = ({ maxWidth, maxHeight }) => {
  const { baseCard, cutouts, updateCutout, selectedCutoutId, setSelectedCutout } = useCardBuilder();
  const transformerRef = useRef<any>(null);
  const selectedShapeRef = useRef<any>(null);

  // Calculate size based on available space while maintaining 63:88 aspect ratio
  const aspectRatio = 63 / 88;
  let width, height;

  if (maxWidth && maxHeight) {
    // Use available space but maintain aspect ratio
    const widthBasedOnHeight = maxHeight * aspectRatio;
    const heightBasedOnWidth = maxWidth / aspectRatio;

    if (widthBasedOnHeight <= maxWidth) {
      // Height is the limiting factor
      width = widthBasedOnHeight;
      height = maxHeight;
    } else {
      // Width is the limiting factor
      width = maxWidth;
      height = heightBasedOnWidth;
    }

    // Add some padding to ensure it fits comfortably
    width *= 0.9;
    height *= 0.9;
  } else {
    // Fallback to original size
    width = 378 * .7;
    height = 528 * .7;
  }

  const baseSrc = baseCard?.croppedUrl ?? "";

  const handleSelect = (cutoutId: string, shapeRef: any) => {
    setSelectedCutout(cutoutId);
    selectedShapeRef.current = shapeRef;

    // Attach transformer to the selected shape
    if (transformerRef.current && shapeRef) {
      transformerRef.current.nodes([shapeRef]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  };

  // Detach transformer when selected cutout changes or is deleted
  useEffect(() => {
    if (!selectedCutoutId) {
      // No cutout selected, detach transformer
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
      selectedShapeRef.current = null;
    }
  }, [selectedCutoutId]);

  return (
    <div id="card-canvas-container" className="border rounded overflow-hidden bg-white inline-block">
      <Stage width={width} height={height}>
        <Layer>
          {baseSrc ? <BaseCardImage src={baseSrc} width={width} height={height} /> : null}
          {cutouts.map(c => (
            <DraggableImage
              key={c.id}
              id={c.id}
              src={c.url}
              x={c.x}
              y={c.y}
              scale={c.scale}
              rotation={c.rotation}
              opacity={c.opacity}
              zIndex={c.zIndex}
              canvasWidth={width}
              canvasHeight={height}
              isSelected={selectedCutoutId === c.id}
              onChange={(updates) => updateCutout(c.id, updates as any)}
              onSelect={(shapeRef) => handleSelect(c.id, shapeRef)}
            />
          ))}
          <Transformer
            ref={transformerRef}
            rotateEnabled
            resizeEnabled
            borderStroke="#3b82f6"
            borderStrokeWidth={2}
            anchorStroke="#3b82f6"
            anchorStrokeWidth={2}
            anchorFill="#ffffff"
            anchorSize={8}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default StageCanvas;


