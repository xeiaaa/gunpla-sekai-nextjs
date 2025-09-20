"use client";

import React, { useMemo, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import useImage from "use-image";
import { useCardBuilder } from "@/gunpla-card/context";

const DraggableImage: React.FC<{ src: string; id: string; x: number; y: number; scale: number; rotation: number; onChange: (updates: Partial<{ x: number; y: number; scale: number; rotation: number }>) => void; }>
  = ({ src, id, x, y, scale, rotation, onChange }) => {
  const [image] = useImage(src, "anonymous");
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image as any}
        x={x}
        y={y}
        scaleX={scale}
        scaleY={scale}
        rotation={rotation}
        draggable
        onDragEnd={e => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const newScale = node.scaleX();
          onChange({ scale: newScale, rotation: node.rotation() });
        }}
        onClick={() => {
          trRef.current?.nodes([shapeRef.current]);
          trRef.current?.getLayer()?.batchDraw();
        }}
        onTap={() => {
          trRef.current?.nodes([shapeRef.current]);
          trRef.current?.getLayer()?.batchDraw();
        }}
      />
      <Transformer ref={trRef} rotateEnabled resizeEnabled />
    </>
  );
};

const BaseCardImage: React.FC<{ src: string; width: number; height: number }> = ({ src, width, height }) => {
  const [image] = useImage(src, "anonymous");
  return <KonvaImage image={image as any} x={0} y={0} width={width} height={height} />;
};

const StageCanvas: React.FC = () => {
  const { baseCard, cutouts, updateCutout } = useCardBuilder();
  // 60% of 630x880 to keep 63:88 ratio smaller
  const width = 378 * .7;
  const height = 528 * .7;

  const baseSrc = baseCard?.croppedUrl ?? "";

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
              onChange={(updates) => updateCutout(c.id, updates as any)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default StageCanvas;


