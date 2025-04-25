
import React, { useRef, useEffect } from 'react';
import createGlobe from 'cobe';
import { useTheme } from 'next-themes';

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  
  useEffect(() => {
    let phi = 0;
    let width = 0;
    
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    
    window.addEventListener('resize', onResize);
    onResize();
    
    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width,
      height: width,
      phi: 0,
      theta: 0.3,
      dark: isDarkTheme ? 1 : 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: isDarkTheme ? [0.3, 0.3, 0.3] : [1, 1, 1],
      markerColor: [0.1, 0.8, 1],
      glowColor: isDarkTheme ? [1, 1, 1] : [0.1, 0.1, 0.1],
      markers: [],
      opacity: 0.9,
      scale: 1.5,
      onRender: (state) => {
        // This prevents rotation when not interacting
        if (!pointerInteracting.current) {
          // Slowly rotate
          phi += 0.005;
        }
        state.phi = phi + pointerInteractionMovement.current;
      },
    });
    
    setTimeout(() => {
      // Fix for rare cases where globe doesn't render correctly on first load
      if (canvasRef.current) {
        const currentWidth = canvasRef.current.offsetWidth;
        if (width !== currentWidth) {
          width = currentWidth;
          globe.updateWidth(width);
        }
      }
    }, 200);
    
    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [isDarkTheme]);
  
  return (
    <div className="aspect-square w-full max-w-[600px] h-auto relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
          canvasRef.current!.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          canvasRef.current!.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          canvasRef.current!.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.01;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.01;
          }
        }}
        style={{ cursor: 'grab' }}
      />
    </div>
  );
}
