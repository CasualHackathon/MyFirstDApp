'use client';

import React from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { SmartModelWithSuspense } from './SmartModel';
import { TaskStatusResponse } from '@/shared/meshy/types';

interface DirectModelViewerProps {
  taskResult: TaskStatusResponse;
  textureModelUrl?: string | null;
  className?: string;
}

export function DirectModelViewer({ taskResult, textureModelUrl, className }: DirectModelViewerProps) {
  const rawUrl = textureModelUrl || taskResult.model_urls?.glb || taskResult.model_urls?.fbx || taskResult.model_urls?.obj || '';
  // Use same-origin proxy to avoid CORS issues and auth headers
  const url = rawUrl ? `/api/download-model?url=${encodeURIComponent(rawUrl)}` : '';
  if (!url) {
    if (typeof window !== 'undefined') {
      console.warn('DirectModelViewer: missing model URL for task', taskResult.id, taskResult.model_urls);
    }
    return null;
  }
  if (typeof window !== 'undefined') {
    console.log('DirectModelViewer: loading url', { rawUrl, proxied: url, taskId: taskResult.id });
  }

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          // High-fidelity renderer settings
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          // three r152+ 默认物理正确灯光，旧标志位已移除；如存在 useLegacyLights 则显式关闭
          if ((gl as any).useLegacyLights !== undefined) {
            (gl as any).useLegacyLights = false;
          }
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[8, 12, 6]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Environment preset="city" resolution={256 as any} />
        <SmartModelWithSuspense url={url} />
        <OrbitControls enablePan enableZoom enableRotate dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}
