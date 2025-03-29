
import * as React from "react"
import { toast as sonnerToast, ToastOptions } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
} & Omit<ToastOptions, "duration">

// Create a wrapper around sonner's toast that supports our expected interface
function toast(props: ToastProps) {
  if (typeof props === "string") {
    return sonnerToast(props)
  }

  const { title, description, variant, ...restProps } = props

  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      ...restProps,
    })
  }

  return sonnerToast(title, {
    description,
    ...restProps,
  })
}

toast.dismiss = sonnerToast.dismiss
toast.error = sonnerToast.error
toast.success = sonnerToast.success
toast.info = sonnerToast.info
toast.warning = sonnerToast.warning
toast.loading = sonnerToast.loading
toast.custom = sonnerToast.custom

// For backward compatibility with older code
function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  }
}

export { useToast, toast }
