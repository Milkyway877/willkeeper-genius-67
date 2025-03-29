
import * as React from "react"
import { toast as sonnerToast } from "sonner"

type ToastProps = React.ComponentPropsWithoutRef<typeof sonnerToast>

// This is now a wrapper around sonner's toast for backward compatibility
function toast(props: ToastProps) {
  return sonnerToast(props)
}

// For backward compatibility with older code
function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  }
}

export { useToast, toast }
