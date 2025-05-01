"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchMemes } from "@/lib/actions"
import { Download, Eye, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ReliableImage } from "@/components/reliable-image"
import dynamic from "next/dynamic"

// Import the MemeDetailModal component dynamically
const MemeDetailModal = dynamic(() => import("@/components/meme-detail-modal"), {
  loading: () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  ),
  ssr: false,
})

export type Meme = {
  id: string
  imageUrl: string
  caption: string
  author: string
  createdAt: string
}

export function MemeGrid() {
  const [memes, setMemes] = useState<Meme[]>([])
  const [visibleMemes, setVisibleMemes] = useState<Meme[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  // Load initial memes
  useEffect(() => {
    const loadMemes = async () => {
      try {
        setLoading(true)
        const { memes } = await fetchMemes()
        setMemes(memes)
        setVisibleMemes(memes.slice(0, ITEMS_PER_PAGE))
        setError(null)
      } catch (err) {
        console.error("Failed to load memes:", err)
        setError("Failed to load memes. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadMemes()
  }, [])

  // Load more memes when scrolling
  const loadMoreMemes = useCallback(() => {
    if (visibleMemes.length < memes.length) {
      const nextPage = page + 1
      const nextMemes = memes.slice(0, nextPage * ITEMS_PER_PAGE)
      setVisibleMemes(nextMemes)
      setPage(nextPage)
    }
  }, [memes, page, visibleMemes.length])

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleMemes.length < memes.length) {
          loadMoreMemes()
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    )

    const loadMoreElement = document.getElementById("load-more")
    if (loadMoreElement) {
      observer.observe(loadMoreElement)
    }

    return () => {
      if (loadMoreElement) {
        observer.unobserve(loadMoreElement)
      }
    }
  }, [loading, loadMoreMemes, memes.length, visibleMemes.length])

  const handleDownload = useCallback(async (meme: Meme) => {
    try {
      setDownloading(meme.id)

      // Fetch the image
      const response = await fetch(meme.imageUrl)
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url

      // Create a filename from the caption or use a default name
      const filename = meme.caption
        ? `plasma-meme-${meme.caption
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .slice(0, 30)}.jpg`
        : `plasma-meme-${Date.now()}.jpg`

      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download successful",
        description: "Meme has been downloaded to your device",
      })
    } catch (error) {
      console.error("Download failed:", error)
      toast({
        title: "Download failed",
        description: "There was an error downloading the meme",
        variant: "destructive",
      })
    } finally {
      setDownloading(null)
    }
  }, [])

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-[#002A29]/50 rounded-xl overflow-hidden shadow-lg animate-pulse h-64"></div>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-900/20 rounded-lg border border-red-800">
        <AlertTriangle className="h-10 w-10 text-red-400 mb-4" />
        <p className="text-red-400 text-center">{error}</p>
        <Button className="mt-4 bg-red-700 hover:bg-red-800 text-white" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  // Empty state
  if (memes.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-teal-900/20 rounded-lg border border-teal-800">
        <p className="text-teal-400">No memes available yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleMemes.map((meme, index) => (
          <div
            key={meme.id}
            className="group animate-fadeIn bg-[#002A29] rounded-xl overflow-hidden shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 h-full border border-teal-900/50 relative"
            style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
          >
            <div
              className="relative aspect-square cursor-pointer overflow-hidden"
              onClick={() => setSelectedMeme(meme)}
            >
              <ReliableImage
                src={meme.imageUrl}
                alt={meme.caption}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={index < 4} // Only prioritize the first 4 images
                className="w-full h-full"
              />

              {/* Overlay with action buttons that appear on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center gap-2">
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(meme)
                    }}
                    disabled={downloading === meme.id}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {downloading === meme.id ? "..." : "Download"}
                  </Button>

                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                    onClick={() => setSelectedMeme(meme)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-teal-900/50">
              <p className="text-sm font-medium text-gray-400">
                by <span className="text-teal-400">{meme.author}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator for infinite scroll */}
      {visibleMemes.length < memes.length && (
        <div id="load-more" className="flex justify-center items-center py-8 mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      )}

      {selectedMeme && <MemeDetailModal meme={selectedMeme} onClose={() => setSelectedMeme(null)} />}
      <Toaster />
    </>
  )
}
