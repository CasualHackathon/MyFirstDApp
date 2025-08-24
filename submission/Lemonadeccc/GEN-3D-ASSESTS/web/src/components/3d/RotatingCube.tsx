'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export function RotatingCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.7;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#888" wireframe />
    </mesh>
  );
}

export function SimpleCubeScene() {
  return (
    <div className="w-full h-[549px] bg-neutral-100 rounded-lg flex items-center justify-center">
      <div className="w-40 h-40 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center">
        <div className="text-neutral-500 text-sm text-center">
          <div className="w-8 h-8 border border-neutral-400 mx-auto mb-2 animate-pulse"></div>
          Waiting for model...
        </div>
      </div>
    </div>
  );
}
