"use client";

import React, { Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

function HomepageModel({
  url,
  onModelLoaded,
}: {
  url: string;
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

  return (
    <group>
      <primitive object={scene} scale={1.2} position={[0, -1, 0]} />
    </group>
  );
}

interface HomepageModelViewerProps {
  modelUrl: string;
  className?: string;
  background?: string;
  onModelLoaded?: () => void;
}

export function HomepageModelViewer({
  modelUrl,
  className = "",
  background = "transparent",
  onModelLoaded,
}: HomepageModelViewerProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [8, 0, 6], fov: 45 }}
        style={{ background }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          {/* Enhanced Lighting for Homepage */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <pointLight position={[-10, -10, -5]} intensity={0.8} />
          <spotLight
            position={[0, 10, 0]}
            angle={0.3}
            penumbra={1}
            intensity={0.5}
            castShadow
          />

          {/* Environment and shadows */}
          <Environment preset="city" />
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.3}
            scale={12}
            blur={1.5}
            far={4.5}
          />

          {/* Model */}
          <HomepageModel url={modelUrl} onModelLoaded={onModelLoaded} />

          {/* Controls with auto-rotation */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={8}
            autoRotate={true}
            autoRotateSpeed={0.8}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload the model
useGLTF.preload("/models/sazabi.glb");
