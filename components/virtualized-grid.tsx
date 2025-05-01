"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"

interface VirtualizedGridProps<T> {
  items: T[]
  renderItem: (item: T, index: number, isVisible: boolean) => React.ReactNode
  className?: string
  itemClassName?: string
  initialRenderCount?: number
  batchSize?: number
  threshold?: number
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  className = "",
  itemClassName = "",
  initialRenderCount = 12,
  batchSize = 8,
  threshold = 0.1,
}: VirtualizedGridProps<T>) {
  const [renderedItemsCount, setRenderedItemsCount] = useState(initialRenderCount)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { isIntersecting } = useIntersectionObserver({
    threshold,
    root: null,
    rootMargin: "200px",
  })
  const observerTarget = useRef<HTMLDivElement>(null)

  // Load more items when the observer target comes into view
  useEffect(() => {
    if (isIntersecting && renderedItemsCount < items.length) {
      setRenderedItemsCount(Math.min(renderedItemsCount + batchSize, items.length))
    }
  }, [isIntersecting, renderedItemsCount, items.length, batchSize])

  // Reset rendered count when items change
  useEffect(() => {
    setRenderedItemsCount(initialRenderCount)
  }, [items.length, initialRenderCount])

  const visibleItems = items.slice(0, renderedItemsCount)

  return (
    <div className={className}>
      {visibleItems.map((item, index) => (
        <div key={index} className={itemClassName}>
          {renderItem(item, index, true)}
        </div>
      ))}

      {renderedItemsCount < items.length && (
        <div ref={observerTarget} className="w-full h-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      )}
    </div>
  )
}
