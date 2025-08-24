'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useLogoAnimation } from '@/store/logoAnimationStore';
import { LogoCubeShader } from './LogoCubeShader';

export function AnimatedLogoCube() {
  const groupRef = useRef<THREE.Group>(null);
  const leftMeshRef = useRef<THREE.Mesh>(null);
  const rightMeshRef = useRef<THREE.Mesh>(null);
  
  // 使用Zustand状态
  const { getCurrentSpeed, isHovering } = useLogoAnimation();

  // 创建分割的几何体 - 放大2倍
  const { leftGeometry, rightGeometry } = useMemo(() => {
    // 左半部分几何体 (wireframe) - 原来0.5x1x1，现在1x2x2
    const leftGeo = new THREE.BoxGeometry(1, 2, 2);
    leftGeo.translate(-0.5, 0, 0);
    
    // 右半部分几何体 (shader) - 原来0.5x1x1，现在1x2x2
    const rightGeo = new THREE.BoxGeometry(1, 2, 2);
    rightGeo.translate(0.5, 0, 0);
    
    return { leftGeometry: leftGeo, rightGeometry: rightGeo };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      const speed = getCurrentSpeed();

      // 连贯的旋转（基于delta的恒定角速度）
      groupRef.current.rotation.x += 0.6 * speed * delta;
      groupRef.current.rotation.y += 0.9 * speed * delta;
      groupRef.current.rotation.z += 0.4 * speed * delta;
      
      // Hover时的缩放效果 - 使用较小幅度避免裁剪
      const targetScale = isHovering ? 1.1 : 1.0;
      const currentScale = groupRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
      groupRef.current.scale.setScalar(newScale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 左半部分 - Wireframe */}
      <mesh ref={leftMeshRef} geometry={leftGeometry}>
        <meshBasicMaterial 
          color="#FFFFFF" 
          wireframe 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* 右半部分 - 流动Shader材质 */}
      <mesh ref={rightMeshRef} geometry={rightGeometry}>
        <LogoCubeShader flowSpeed={getCurrentSpeed()} deformAmplitude={0} />
      </mesh>
    </group>
  );
}
