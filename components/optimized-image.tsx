"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallbackSrc?: string
  onLoadingComplete?: () => void
  containerClassName?: string
  showLoadingIndicator?: boolean
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/placeholder.svg?height=500&width=500&text=Image+Error",
  onLoadingComplete,
  containerClassName,
  showLoadingIndicator = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    if (onLoadingComplete) onLoadingComplete()
  }

  const handleError = () => {
    setIsLoading(false)
    setError(true)
  }

  return (
    <div className={cn("relative", containerClassName)}>
      {isLoading && showLoadingIndicator && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      )}
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        className={cn("transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100", className)}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  )
}
