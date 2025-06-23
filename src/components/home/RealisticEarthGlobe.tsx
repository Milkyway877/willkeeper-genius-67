
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, useTexture, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function EarthSphere() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  // Load Earth textures - using NASA's Blue Marble imagery
  const earthTexture = useTexture('https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2000&auto=format&fit=crop');
  const nightTexture = useTexture('https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=2000&auto=format&fit=crop');
  const cloudsTexture = useTexture('https://images.unsplash.com/photo-1446776850543-85804ec2dd13?q=80&w=2000&auto=format&fit=crop');

  // Animate the Earth rotation
  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002; // Slow, realistic rotation
      earthRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05; // Subtle wobble
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.003; // Clouds move slightly faster
    }
  });

  return (
    <>
      {/* Earth sphere */}
      <Sphere ref={earthRef} args={[2, 64, 64]} position={[0, 0, 0]}>
        <meshPhongMaterial
          map={earthTexture}
          emissiveMap={nightTexture}
          emissive={new THREE.Color(0x112244)}
          emissiveIntensity={0.1}
          shininess={100}
        />
      </Sphere>
      
      {/* Cloud layer */}
      <Sphere ref={cloudsRef} args={[2.01, 64, 64]} position={[0, 0, 0]}>
        <meshPhongMaterial
          map={cloudsTexture}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </Sphere>
      
      {/* Atmosphere glow */}
      <Sphere args={[2.1, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color={new THREE.Color(0x4488ff)}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </>
  );
}

function Lighting() {
  return (
    <>
      {/* Main sun light */}
      <directionalLight
        position={[5, 3, 5]}
        intensity={1}
        color={0xffffff}
        castShadow
      />
      {/* Ambient light for subtle illumination */}
      <ambientLight intensity={0.2} color={0x404040} />
      {/* Rim lighting for atmosphere effect */}
      <pointLight position={[-5, 0, 0]} intensity={0.5} color={0x4488ff} />
    </>
  );
}

export function RealisticEarthGlobe() {
  return (
    <div className="relative w-full aspect-square max-w-xl flex items-center justify-center">
      {/* Earth animation glow effect */}
      <motion.div
        className="absolute w-4/5 h-4/5 rounded-full bg-blue-500/10 blur-xl"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 8,
          ease: "easeInOut" 
        }}
      />
      
      {/* Three.js Canvas */}
      <div className="w-4/5 h-4/5 relative">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          style={{ background: 'transparent' }}
        >
          <Lighting />
          <EarthSphere />
          <Stars
            radius={50}
            depth={50}
            count={1000}
            factor={4}
            saturation={0}
            fade
            speed={0.5}
          />
        </Canvas>
      </div>
      
      {/* Outer decorative rings */}
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-white/10"
        animate={{ 
          rotate: -360,
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 60,
          ease: "linear" 
        }}
      />
      
      <motion.div 
        className="absolute w-[85%] h-[85%] rounded-full border border-blue-500/20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ 
          rotate: 360,
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 50,
          ease: "linear" 
        }}
      />
      
      {/* Floating text indicators */}
      <motion.div 
        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs text-white border border-white/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        Global Coverage
      </motion.div>
      
      <motion.div 
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs text-white border border-white/20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      >
        24/7 Access
      </motion.div>
      
      <motion.div 
        className="absolute top-1/2 -right-8 -translate-y-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs text-white border border-white/20"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.1, duration: 0.5 }}
      >
        Worldwide Security
      </motion.div>
    </div>
  );
}
