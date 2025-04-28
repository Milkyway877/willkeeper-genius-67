
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import React from 'react';
import * as THREE from 'three';

function Head() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={new THREE.Color("#e2b6a1")} />
      {/* Eyes */}
      <mesh position={[-0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={new THREE.Color("black")} />
      </mesh>
      <mesh position={[0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={new THREE.Color("black")} />
      </mesh>
      {/* Smile */}
      <mesh position={[0, -0.1, 0.8]}>
        <torusGeometry args={[0.3, 0.05, 16, 32, Math.PI]} />
        <meshStandardMaterial color={new THREE.Color("black")} />
      </mesh>
      {/* Beard */}
      <mesh position={[0, -0.5, 0.6]}>
        <sphereGeometry args={[0.4, 32, 16]} />
        <meshStandardMaterial color={new THREE.Color("#4a4a4a")} />
      </mesh>
    </mesh>
  );
}

export const MaleAvatar = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Head />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
};
