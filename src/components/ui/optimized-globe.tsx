
"use client"

import { useRef, useEffect, useState } from "react"
import createGlobe, { COBEOptions } from "cobe"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

const DEFAULT_GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
}

export function OptimizedGlobe({
  className,
  config = DEFAULT_GLOBE_CONFIG,
}: {
  className?: string
  config?: COBEOptions
}) {
  const [isError, setIsError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const { theme } = useTheme()
  
  // Use refs to prevent unnecessary re-renders
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)

  // Track width for responsive scaling
  const width = useRef(0)
  let phi = 0

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setR(delta / 200)
    }
  }

  const onRender = (state: any) => {
    if (!pointerInteracting.current) phi += 0.005
    state.phi = phi + r
    state.width = width.current * 2
    state.height = width.current * 2
    state.dark = theme === "dark" ? 1 : 0
  }

  const onResize = () => {
    if (canvasRef.current) {
      width.current = canvasRef.current.offsetWidth
    }
  }

  useEffect(() => {
    try {
      window.addEventListener("resize", onResize)
      onResize()

      // Load the globe with a slight delay to ensure DOM is ready
      const loadTimeout = setTimeout(() => {
        if (!canvasRef.current) return;
        
        const globeConfig = {
          ...config,
          width: width.current * 2,
          height: width.current * 2,
          onRender,
          dark: theme === "dark" ? 1 : 0,
        };
        
        const globe = createGlobe(canvasRef.current, globeConfig);

        // Fade in the globe once it's created
        setTimeout(() => {
          if (canvasRef.current) {
            canvasRef.current.style.opacity = "1";
            setIsLoaded(true);
          }
        }, 200);

        // Clean up function
        return () => {
          clearTimeout(loadTimeout);
          globe.destroy();
          window.removeEventListener("resize", onResize);
        };
      }, 100);

    } catch (error) {
      console.error("Error creating globe:", error);
      setIsError(true);
    }
  }, [theme]);

  // Fallback component in case of error
  if (isError) {
    return (
      <div className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px] flex items-center justify-center",
        className
      )}>
        <div className="text-center p-4">
          <div className="w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-800 mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-500 dark:text-gray-400">Globe visualization could not be loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
          !isLoaded && "animate-pulse"
        )}
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current,
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
        </div>
      )}
    </div>
  )
}
