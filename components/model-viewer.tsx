"use client";

import React, { Suspense, useRef, useImperativeHandle } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

function Model({
  url,
  materialId,
  color,
  finish,
  allMaterialStates,
  isEverythingClear,
  clearArmorMaterials,
  clearAlpha,
  paintType,
  onModelLoaded,
}: {
  url: string;
  materialId?: string;
  color?: string;
  finish?: string;
  allMaterialStates?: Record<string, { color: string; finish: string }>;
  isEverythingClear?: boolean;
  clearArmorMaterials?: string[];
  clearAlpha?: number;
  paintType?: "solid" | "clear";
  onModelLoaded?: () => void;
}) {
  const { scene, materials } = useGLTF(url);
  const hasCalledOnModelLoaded = React.useRef(false);

  // Call onModelLoaded when the model is first loaded (only once)
  React.useEffect(() => {
    if (
      onModelLoaded &&
      materials &&
      Object.keys(materials).length > 0 &&
      !hasCalledOnModelLoaded.current
    ) {
      hasCalledOnModelLoaded.current = true;
      onModelLoaded();
    }
  }, [materials, onModelLoaded]);
  // Update all materials if allMaterialStates is provided (for randomize colors)
  if (allMaterialStates) {
    Object.entries(allMaterialStates).forEach(([id, state]) => {
      if (materials[id]) {
        const material = materials[id] as THREE.Material & {
          color?: THREE.Color;
          roughness?: number;
          metalness?: number;
          opacity?: number;
          transparent?: boolean;
        };

        // Update color
        if (material && "color" in material && material.color) {
          const colorProperty = material.color as THREE.Color;
          if (colorProperty && typeof colorProperty.setHex === "function") {
            colorProperty.setHex(parseInt(state.color.replace("#", ""), 16));
          }
        }

        // Update finish
        if (material && "roughness" in material) {
          switch (state.finish) {
            case "matte":
              material.roughness = 1.0;
              material.metalness = 0.0;
              break;
            case "gloss":
              material.roughness = 0.0;
              material.metalness = 0.0;
              break;
            case "semigloss":
              material.roughness = 0.3;
              material.metalness = 0.0;
              break;
            case "metallic":
              material.roughness = 0.1;
              material.metalness = 1.0;
              break;
            case "pearl":
              material.roughness = 0.2;
              material.metalness = 0.5;
              break;
            case "candy":
              material.roughness = 0.0;
              material.metalness = 0.8;
              break;
            default:
              material.roughness = 0.5;
              material.metalness = 0.0;
          }
        }
      }
    });
  }

  // Apply clear/transparent effect based on priority: armor materials > everything clear > solid paint type
  if (
    clearArmorMaterials &&
    clearArmorMaterials.length > 0 &&
    clearAlpha !== undefined
  ) {
    // Apply clear/transparent effect only to armor materials (highest priority)
    Object.entries(materials).forEach(([id, material]) => {
      const mat = material as THREE.Material & {
        opacity?: number;
        transparent?: boolean;
      };

      if (clearArmorMaterials.includes(id)) {
        // This is an armor material, make it transparent
        mat.opacity = clearAlpha;
        mat.transparent = true;
      } else {
        // This is not an armor material, ensure it's not transparent
        mat.transparent = false;
        mat.opacity = 1;
      }
    });
  } else if (isEverythingClear && clearAlpha !== undefined) {
    // Apply clear/transparent effect to all materials
    Object.entries(materials).forEach(([, material]) => {
      const mat = material as THREE.Material & {
        opacity?: number;
        transparent?: boolean;
      };

      // Set opacity and transparent properties
      mat.opacity = clearAlpha;
      mat.transparent = true;
    });
  } else if (paintType === "solid") {
    // If paint type is solid, ensure all materials are not transparent
    Object.entries(materials).forEach(([, material]) => {
      const mat = material as THREE.Material & {
        opacity?: number;
        transparent?: boolean;
      };
      mat.transparent = false;
      mat.opacity = 1;
    });
  } else if (allMaterialStates) {
    // When finishes are applied, ensure all materials are opaque
    Object.entries(materials).forEach(([, material]) => {
      const mat = material as THREE.Material & {
        opacity?: number;
        transparent?: boolean;
      };
      mat.transparent = false;
      mat.opacity = 1;
    });
    // Update single material when materialId and color are provided
    if (materialId && color && materials[materialId]) {
      const material = materials[materialId] as THREE.Material;
      if (material && "color" in material && material.color) {
        const colorProperty = material.color as THREE.Color;
        if (colorProperty && typeof colorProperty.setHex === "function") {
          colorProperty.setHex(parseInt(color.replace("#", ""), 16));
        }
      }
    }

    // Update material finish when materialId and finish are provided
    if (materialId && finish && materials[materialId]) {
      const material = materials[materialId] as THREE.Material & {
        roughness?: number;
        metalness?: number;
      };
      if (material && "roughness" in material) {
        // Map finish types to material properties
        switch (finish) {
          case "matte":
            material.roughness = 1.0;
            material.metalness = 0.0;
            break;
          case "gloss":
            material.roughness = 0.0;
            material.metalness = 0.0;
            break;
          case "semigloss":
            material.roughness = 0.3;
            material.metalness = 0.0;
            break;
          case "metallic":
            material.roughness = 0.1;
            material.metalness = 1.0;
            break;
          case "pearl":
            material.roughness = 0.2;
            material.metalness = 0.5;
            break;
          case "candy":
            material.roughness = 0.0;
            material.metalness = 0.8;
            break;
          default:
            material.roughness = 0.5;
            material.metalness = 0.0;
        }
      }
    }
  }

  return (
    <group>
      <primitive object={scene} scale={1} position={[0, -1, 0]} />
    </group>
  );
}

// Component to expose renderer functionality
function RendererExposer({
  onRendererReady,
}: {
  onRendererReady: (renderer: THREE.WebGLRenderer) => void;
}) {
  const { gl } = useThree();

  useImperativeHandle(useRef(null), () => {
    onRendererReady(gl);
    return gl;
  });

  return null;
}

interface ModelViewerProps {
  modelUrl: string;
  className?: string;
  materialId?: string;
  color?: string;
  finish?: string;
  allMaterialStates?: Record<string, { color: string; finish: string }>;
  isEverythingClear?: boolean;
  clearArmorMaterials?: string[];
  clearAlpha?: number;
  paintType?: "solid" | "clear";
  background?: string;
  onRendererReady?: (renderer: THREE.WebGLRenderer) => void;
  onModelLoaded?: () => void;
}

export function ModelViewer({
  modelUrl,
  className = "",
  materialId,
  color,
  finish,
  allMaterialStates,
  isEverythingClear,
  clearArmorMaterials,
  clearAlpha,
  paintType,
  background = "transparent",
  onRendererReady,
  onModelLoaded,
}: ModelViewerProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={1} />

          {/* Environment and shadows */}
          <Environment preset="city" />
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4.5}
          />

          {/* Model */}
          <Model
            url={modelUrl}
            materialId={materialId}
            color={color}
            finish={finish}
            allMaterialStates={allMaterialStates}
            isEverythingClear={isEverythingClear}
            clearArmorMaterials={clearArmorMaterials}
            clearAlpha={clearAlpha}
            paintType={paintType}
            onModelLoaded={onModelLoaded}
          />

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={10}
            autoRotate={false}
          />

          {/* Renderer Exposer */}
          {onRendererReady && (
            <RendererExposer onRendererReady={onRendererReady} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload the model
useGLTF.preload("/models/sazabi.glb");
