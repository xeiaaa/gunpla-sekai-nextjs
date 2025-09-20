"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from "react-konva";
import useImage from "use-image";

export interface RectangleCropperHandle {
  getDataUrl: () => Promise<string | undefined>;
}

const fitContain = (imgW: number, imgH: number, maxW: number, maxH: number) => {
  const scale = Math.min(maxW / imgW, maxH / imgH);
  const width = Math.floor(imgW * scale);
  const height = Math.floor(imgH * scale);
  return { width, height, scale };
};

const loadImageEl = (src: string): Promise<HTMLImageElement> => new Promise(resolve => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => resolve(img);
  img.src = src.startsWith("http") ? `/api/gunpla-card/proxy-image?url=${encodeURIComponent(src)}` : src;
});

const RectangleCropper = forwardRef<RectangleCropperHandle, { sourceUrl: string }>(({
  sourceUrl
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const proxied = useMemo(() => sourceUrl.startsWith("http") ? `/api/gunpla-card/proxy-image?url=${encodeURIComponent(sourceUrl)}` : sourceUrl, [sourceUrl]);
  const [image] = useImage(proxied, "anonymous");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = () => setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const display = useMemo(() => {
    if (!image || !containerSize.w || !containerSize.h) return null;
    return fitContain(image.width, image.height, containerSize.w, containerSize.h);
  }, [image, containerSize]);

  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const [rect, setRect] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 200, height: 200 });

  useEffect(() => {
    if (!display) return;
    const w = Math.min( Math.floor(display.width * 0.4), 300 );
    const h = Math.min( Math.floor(display.height * 0.4), 300 );
    setRect({ x: Math.floor((display.width - w) / 2), y: Math.floor((display.height - h) / 2), width: w, height: h });
  }, [display]);

  useEffect(() => {
    if (trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [rect]);

  useImperativeHandle(ref, () => ({
    async getDataUrl() {
      if (!display) return undefined;
      const imgEl = await loadImageEl(sourceUrl);
      const scale = imgEl.naturalWidth / display.width; // uniform
      const sx = Math.max(0, Math.floor(rect.x * scale));
      const sy = Math.max(0, Math.floor(rect.y * scale));
      const sw = Math.min(imgEl.naturalWidth - sx, Math.floor(rect.width * scale));
      const sh = Math.min(imgEl.naturalHeight - sy, Math.floor(rect.height * scale));
      if (sw <= 0 || sh <= 0) return undefined;

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) return undefined;
      ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, sw, sh);
      return canvas.toDataURL("image/png");
    }
  }), [display, rect, sourceUrl]);

  if (!display) {
    return <div ref={containerRef} className="relative w-full h-[60vh] bg-black/5" />;
  }

  return (
    <div ref={containerRef} className="relative w-full h-[60vh] bg-black/5">
      <Stage width={display.width} height={display.height}>
        <Layer>
          <KonvaImage image={image as any} x={0} y={0} width={display.width} height={display.height} />
          <Rect
            ref={shapeRef}
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            stroke="cyan"
            strokeWidth={2}
            draggable
            onDragEnd={e => setRect(r => ({ ...r, x: e.target.x(), y: e.target.y() }))}
            onTransformEnd={() => {
              const node = shapeRef.current;
              const newWidth = Math.max(10, node.width() * node.scaleX());
              const newHeight = Math.max(10, node.height() * node.scaleY());
              // reset scale to 1 after applying
              node.scaleX(1);
              node.scaleY(1);
              setRect(r => ({ ...r, x: node.x(), y: node.y(), width: newWidth, height: newHeight }));
            }}
          />
          <Transformer ref={trRef} rotateEnabled={false} keepRatio={false} boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) return oldBox;
            return newBox;
          }} />
        </Layer>
      </Stage>
    </div>
  );
});

RectangleCropper.displayName = "RectangleCropper";

export default RectangleCropper;


