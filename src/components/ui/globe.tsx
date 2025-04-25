
"use client"

import createGlobe, { COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const GLOBE_CONFIG: COBEOptions = {
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

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string
  config?: COBEOptions
}) {
  let phi = 0
  let width = 0
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)
  
  // Track whether component is mounted
  const isMounted = useRef(false)
  const globeCreated = useRef(false)

  const updatePointerInteraction = (value: any) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: any) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setR(delta / 200)
    }
  }

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += 0.005
      state.phi = phi + r
      state.width = width * 2
      state.height = width * 2
    },
    [r],
  )

  // Initialize the globe with proper timing
  useEffect(() => {
    // Set mounted flag
    isMounted.current = true
    
    // Handle resizing
    const handleResize = () => {
      if (canvasRef.current && isMounted.current) {
        width = canvasRef.current.offsetWidth || 600
      }
    }
    
    window.addEventListener("resize", handleResize)
    
    // Initial sizing after DOM is fully loaded
    const initializeGlobe = () => {
      if (!canvasRef.current || !isMounted.current || globeCreated.current) return
      
      handleResize()
      
      // Only proceed if we have valid dimensions
      if (width <= 0) return
      
      try {
        // Mark as created to prevent duplicate creation
        globeCreated.current = true
        
        const globe = createGlobe(canvasRef.current, {
          ...config,
          width: width * 2,
          height: width * 2,
          onRender,
        })
        
        // Fade in with slight delay to ensure rendering is complete
        setTimeout(() => {
          if (canvasRef.current && isMounted.current) {
            canvasRef.current.style.opacity = "1"
          }
        }, 300)
        
        return () => {
          if (globe) {
            globe.destroy()
          }
        }
      } catch (error) {
        console.error("Failed to create globe:", error)
      }
    }
    
    // Try immediate initialization
    initializeGlobe()
    
    // Fallback initialization with timeout to ensure DOM is ready
    const timeoutId = setTimeout(initializeGlobe, 500)
    
    // Clean up
    return () => {
      isMounted.current = false
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId)
    }
  }, [config, onRender])

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
    </div>
  )
}
