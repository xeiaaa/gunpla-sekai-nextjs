"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function Model({ url, materialId, color, finish, allMaterialStates, isEverythingClear, clearArmorMaterials, clearAlpha, paintType }: { url: string; materialId?: string; color?: string; finish?: string; allMaterialStates?: Record<string, { color: string; finish: string }>; isEverythingClear?: boolean; clearArmorMaterials?: string[]; clearAlpha?: number; paintType?: "solid" | "clear" }) {
  const { scene, materials } = useGLTF(url);
  // Update all materials if allMaterialStates is provided (for randomize colors)
  if (allMaterialStates) {
    Object.entries(allMaterialStates).forEach(([id, state]) => {
      if (materials[id]) {
        const material = materials[id] as any;

        // Update color
        if (material && 'color' in material && material.color) {
          const colorProperty = material.color as THREE.Color;
          if (colorProperty && typeof colorProperty.setHex === 'function') {
            colorProperty.setHex(parseInt(state.color.replace('#', ''), 16));
          }
        }

        // Update finish
        if (material && 'roughness' in material) {
          switch (state.finish) {
            case 'matte':
              material.roughness = 1.0;
              material.metalness = 0.0;
              break;
            case 'gloss':
              material.roughness = 0.0;
              material.metalness = 0.0;
              break;
            case 'semigloss':
              material.roughness = 0.3;
              material.metalness = 0.0;
              break;
            case 'metallic':
              material.roughness = 0.1;
              material.metalness = 1.0;
              break;
            case 'pearl':
              material.roughness = 0.2;
              material.metalness = 0.5;
              break;
            case 'candy':
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
  if (clearArmorMaterials && clearArmorMaterials.length > 0 && clearAlpha !== undefined) {
    // Apply clear/transparent effect only to armor materials (highest priority)
    Object.entries(materials).forEach(([id, material]) => {
      const mat = material as any;

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
    Object.entries(materials).forEach(([id, material]) => {
      const mat = material as any;

      // Set opacity and transparent properties
      mat.opacity = clearAlpha;
      mat.transparent = true;
    });
  } else if (paintType === "solid") {
    // If paint type is solid, ensure all materials are not transparent
    Object.entries(materials).forEach(([id, material]) => {
      const mat = material as any;
      mat.transparent = false;
      mat.opacity = 1;
    });
  } else if (allMaterialStates) {
    // When finishes are applied, ensure all materials are opaque
    Object.entries(materials).forEach(([id, material]) => {
      const mat = material as any;
      mat.transparent = false;
      mat.opacity = 1;
    });
    // Update single material when materialId and color are provided
    if (materialId && color && materials[materialId]) {
      const material = materials[materialId] as THREE.Material;
      if (material && 'color' in material && material.color) {
        const colorProperty = material.color as THREE.Color;
        if (colorProperty && typeof colorProperty.setHex === 'function') {
          colorProperty.setHex(parseInt(color.replace('#', ''), 16));
        }
      }
    }

    // Update material finish when materialId and finish are provided
    if (materialId && finish && materials[materialId]) {
      const material = materials[materialId] as any;
      if (material && 'roughness' in material) {
        // Map finish types to material properties
        switch (finish) {
          case 'matte':
            material.roughness = 1.0;
            material.metalness = 0.0;
            break;
          case 'gloss':
            material.roughness = 0.0;
            material.metalness = 0.0;
            break;
          case 'semigloss':
            material.roughness = 0.3;
            material.metalness = 0.0;
            break;
          case 'metallic':
            material.roughness = 0.1;
            material.metalness = 1.0;
            break;
          case 'pearl':
            material.roughness = 0.2;
            material.metalness = 0.5;
            break;
          case 'candy':
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
}

export function ModelViewer({ modelUrl, className = "", materialId, color, finish, allMaterialStates, isEverythingClear, clearArmorMaterials, clearAlpha, paintType }: ModelViewerProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Environment and shadows */}
          <Environment preset="studio" />
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4.5}
          />

          {/* Model */}
          <Model url={modelUrl} materialId={materialId} color={color} finish={finish} allMaterialStates={allMaterialStates} isEverythingClear={isEverythingClear} clearArmorMaterials={clearArmorMaterials} clearAlpha={clearAlpha} paintType={paintType} />

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload the model
useGLTF.preload("/models/sazabi.glb");
