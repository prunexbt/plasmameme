"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ReliableImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  sizes?: string
  onLoad?: () => void
  fallbackSrc?: string
}

export function ReliableImage({
  src,
  alt,
  className,
  width,
  height,
  fill = false,
  priority = false,
  sizes,
  onLoad,
  fallbackSrc = "/placeholder.svg?height=400&width=400&text=Image+Error",
}: ReliableImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Reset state when src changes
  useEffect(() => {
    setImgSrc(src)
    setIsLoading(true)
    setError(false)
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
    if (onLoad) onLoad()
  }

  const handleError = () => {
    setError(true)
    setIsLoading(false)
    setImgSrc(fallbackSrc)
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      )}

      {fill ? (
        <Image
          src={imgSrc || "/placeholder.svg"}
          alt={alt}
          fill
          sizes={sizes || "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"}
          className={cn("object-cover transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100")}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          unoptimized={false}
        />
      ) : (
        <Image
          src={imgSrc || "/placeholder.svg"}
          alt={alt}
          width={width || 400}
          height={height || 400}
          className={cn("object-cover transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100")}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          unoptimized={false}
        />
      )}
    </div>
  )
}
