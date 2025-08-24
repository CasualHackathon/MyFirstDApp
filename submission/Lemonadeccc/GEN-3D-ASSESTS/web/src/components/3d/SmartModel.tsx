'use client';

import React, { Suspense } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

function LoaderUI() {
  return (
    <Html center>
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 flex items-center">
        <span className="text-sm text-white whitespace-nowrap">Loading model...</span>
      </div>
    </Html>
  );
}

export function SmartModel({ url }: { url: string }) {
  const { gl } = useThree();
  const maxAniso = gl.capabilities.getMaxAnisotropy?.() || 8;
  // Detect the true extension from the original URL (handle proxied /api/download-model?url=...)
  let detectedExt = '';
  try {
    if (url.startsWith('/api/download-model')) {
      const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      const raw = u.searchParams.get('url') || '';
      detectedExt = (raw.split('?')[0].split('.').pop() || '').toLowerCase();
    } else {
      detectedExt = (url.split('?')[0].split('.').pop() || '').toLowerCase();
    }
  } catch {}
  const ext = detectedExt;

  if (!ext) {
    // Default to GLTF/GLB if we can't detect (common case for proxied URLs)
    try {
      const gltf = useLoader(GLTFLoader, url, (loader) => {
        try { (loader as any).setCrossOrigin?.('anonymous'); } catch {}
        try {
          const draco = new DRACOLoader();
          (loader as GLTFLoader).setDRACOLoader?.(draco);
        } catch {}
        try {
          const ktx2 = new KTX2Loader();
          // @ts-ignore
          ktx2.detectSupport(gl);
          (loader as GLTFLoader).setKTX2Loader?.(ktx2);
        } catch {}
      });
      try {
        gltf.scene.traverse((obj: any) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m: any) => {
              ['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap'].forEach((k) => {
                const tex = m?.[k];
                if (tex && tex.anisotropy !== undefined) tex.anisotropy = Math.max(tex.anisotropy || 1, maxAniso);
              });
            });
          }
        });
      } catch {}
      return <primitive object={gltf.scene} />;
    } catch {
      return null;
    }
  }

  if (ext === 'glb' || ext === 'gltf') {
    // Configure GLTFLoader with DRACO/KTX2 if available
    const gltf = useLoader(GLTFLoader, url, (loader) => {
      try {
        (loader as any).setCrossOrigin?.('anonymous');
      } catch {}
      try {
        const draco = new DRACOLoader();
        // NOTE: You can host decoders under public/draco/ and set path here
        // draco.setDecoderPath('/draco/');
        (loader as GLTFLoader).setDRACOLoader?.(draco);
      } catch {}
      try {
        const ktx2 = new KTX2Loader();
        // NOTE: You can host transcoder under public/ktx2/ and set path here
        // ktx2.setTranscoderPath('/ktx2/');
        // @ts-ignore detectSupport requires WebGLRenderer
        ktx2.detectSupport(gl);
        (loader as GLTFLoader).setKTX2Loader?.(ktx2);
      } catch {}
    });
    try {
      gltf.scene.traverse((obj: any) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m: any) => {
            ['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap'].forEach((k) => {
              const tex = m?.[k];
              if (tex && tex.anisotropy !== undefined) tex.anisotropy = Math.max(tex.anisotropy || 1, maxAniso);
            });
          });
        }
      });
    } catch {}
    return <primitive object={gltf.scene} />;
  }

  if (ext === 'fbx') {
    const fbx = useLoader(FBXLoader, url, (loader) => {
      try { (loader as any).setCrossOrigin?.('anonymous'); } catch {}
    });
    try { (fbx as any).traverse?.((o: any) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); } catch {}
    return <primitive object={fbx} />;
  }

  if (ext === 'obj') {
    const obj = useLoader(OBJLoader, url, (loader) => {
      try { (loader as any).setCrossOrigin?.('anonymous'); } catch {}
    });
    try { (obj as any).traverse?.((o: any) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); } catch {}
    return <primitive object={obj} />;
  }

  return null;
}

export function SmartModelWithSuspense({ url }: { url: string }) {
  return (
    <Suspense fallback={<LoaderUI />}> 
      <SmartModel url={url} />
    </Suspense>
  );
}
