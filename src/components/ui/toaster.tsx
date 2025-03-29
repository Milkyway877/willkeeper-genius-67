
import { Toaster as SonnerToaster } from "sonner"

interface ToasterProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
  closeButton?: boolean
  richColors?: boolean
}

export function Toaster({ 
  position = "bottom-right", 
  closeButton = true, 
  richColors = true 
}: ToasterProps = {}) {
  return (
    <SonnerToaster 
      position={position} 
      closeButton={closeButton}
      richColors={richColors}
      theme="light"
      className="toaster-class"
    />
  )
}
