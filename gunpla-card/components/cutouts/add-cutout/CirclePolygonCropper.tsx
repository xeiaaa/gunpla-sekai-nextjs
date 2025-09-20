"use client";

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Circle as KonvaCircle, Line, Group } from "react-konva";
import useImage from "use-image";

export type ShapeMode = "circle" | "polygon";

export interface CirclePolygonCropperHandle {
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

const CirclePolygonCropper = forwardRef<CirclePolygonCropperHandle, { sourceUrl: string; mode: ShapeMode }>(
  ({ sourceUrl, mode }, ref) => {
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

    // Circle state
    const [circle, setCircle] = useState<{ cx: number; cy: number; r: number } | null>(null);
    useEffect(() => {
      if (mode !== "circle" || !display) return;
      setCircle({ cx: display.width / 2, cy: display.height / 2, r: Math.min(display.width, display.height) / 5 });
    }, [mode, display]);

    const onWheel = useCallback((e: any) => {
      if (mode !== "circle" || !circle) return;
      e.evt.preventDefault();
      const delta = e.evt.deltaY;
      const next = Math.max(10, circle.r + (delta > 0 ? -10 : 10));
      setCircle({ ...circle, r: next });
    }, [mode, circle]);

    // Polygon state
    const [points, setPoints] = useState<number[]>([]);
    const [closed, setClosed] = useState(false);
    useEffect(() => {
      if (mode !== "polygon") {
        setPoints([]);
        setClosed(false);
      }
    }, [mode]);

    const handleStageClick = useCallback((e: any) => {
      if (mode !== "polygon" || closed || !display) return;
      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      setPoints(prev => [...prev, pointer.x, pointer.y]);
    }, [mode, closed, display]);

    const resetPolygon = useCallback(() => { setPoints([]); setClosed(false); }, []);

    useImperativeHandle(ref, () => ({
      async getDataUrl() {
        if (!image || !display) return undefined;
        const imgEl = await loadImageEl(sourceUrl);
        const canvas = document.createElement("canvas");
        canvas.width = imgEl.naturalWidth;
        canvas.height = imgEl.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return undefined;
        const scale = imgEl.naturalWidth / display.width; // uniform scale

        ctx.save();
        ctx.beginPath();
        if (mode === "circle" && circle) {
          ctx.arc(circle.cx * scale, circle.cy * scale, circle.r * scale, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
        } else if (mode === "polygon" && points.length >= 6) {
          ctx.moveTo(points[0] * scale, points[1] * scale);
          for (let i = 2; i < points.length; i += 2) {
            ctx.lineTo(points[i] * scale, points[i + 1] * scale);
          }
          ctx.closePath();
          ctx.clip();
        } else {
          ctx.restore();
          return undefined;
        }
        ctx.drawImage(imgEl, 0, 0);
        ctx.restore();
        return canvas.toDataURL("image/png");
      }
    }) , [image, display, sourceUrl, mode, circle, points]);

    if (!display) {
      return <div ref={containerRef} className="relative w-full h-[60vh] bg-black/5" />;
    }

    return (
      <div ref={containerRef} className="relative w-full h-[60vh] bg-black/5">
        <div className="absolute left-1 top-1 z-10 text-xs bg-white/80 rounded px-2 py-1">
          {mode === "circle" ? "Tip: Drag to move. Scroll to resize radius." : (!closed ? "Click to add points. Close when done." : "Polygon closed.")}
        </div>
        <Stage width={display.width} height={display.height} onWheel={onWheel} onClick={handleStageClick}>
          <Layer>
            <KonvaImage image={image as any} x={0} y={0} width={display.width} height={display.height} />
            {mode === "circle" && circle ? (
              <KonvaCircle
                x={circle.cx}
                y={circle.cy}
                radius={circle.r}
                stroke="cyan"
                strokeWidth={2}
                draggable
                onDragMove={e => setCircle({ ...circle, cx: e.target.x(), cy: e.target.y() })}
              />
            ) : null}
            {mode === "polygon" && points.length > 0 ? (
              <Group>
                <Line points={points} stroke="cyan" strokeWidth={2} closed={closed} fill={closed ? "rgba(0,255,255,0.2)" : undefined} />
                {points.reduce<{ x: number; y: number; i: number }[]>((acc, _v, idx) => {
                  if (idx % 2 === 0) acc.push({ x: points[idx], y: points[idx + 1], i: idx });
                  return acc;
                }, []).map(({ x, y, i }) => (
                  <KonvaCircle key={i} x={x} y={y} radius={5} fill="white" stroke="cyan" draggable onDragMove={e => {
                    const nx = e.target.x();
                    const ny = e.target.y();
                    setPoints(prev => {
                      const next = prev.slice();
                      next[i] = nx; next[i + 1] = ny;
                      return next;
                    });
                  }} />
                ))}
              </Group>
            ) : null}
          </Layer>
        </Stage>
        {mode === "polygon" && !closed && points.length >= 6 ? (
          <div className="absolute right-2 bottom-2 z-10 flex gap-2">
            <button className="px-2 py-1 text-xs bg-white rounded border" onClick={() => setClosed(true)}>Close Polygon</button>
            <button className="px-2 py-1 text-xs bg-white rounded border" onClick={resetPolygon}>Reset</button>
          </div>
        ) : null}
        {mode === "polygon" && closed ? (
          <div className="absolute right-2 bottom-2 z-10 flex gap-2">
            <button className="px-2 py-1 text-xs bg-white rounded border" onClick={() => setClosed(false)}>Reopen</button>
            <button className="px-2 py-1 text-xs bg-white rounded border" onClick={resetPolygon}>Reset</button>
          </div>
        ) : null}
      </div>
    );
  }
);

CirclePolygonCropper.displayName = "CirclePolygonCropper";

export default CirclePolygonCropper;


