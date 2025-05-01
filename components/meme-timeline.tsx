"use client"

import { useState, useEffect } from "react"
import { fetchMemes } from "@/lib/actions"
import type { Meme } from "@/components/meme-grid"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, Eye, Calendar, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

// Sample categories for demonstration
const CATEGORIES = [
  { id: "funny", name: "Funny", color: "bg-amber-500" },
  { id: "educational", name: "Educational", color: "bg-blue-500" },
  { id: "community", name: "Community", color: "bg-purple-500" },
  { id: "tech", name: "Tech", color: "bg-green-500" },
  { id: "events", name: "Events", color: "bg-red-500" },
]

// Helper function to group memes by month and year
function groupMemesByDate(memes: Meme[]): Record<string, Meme[]> {
  const grouped: Record<string, Meme[]> = {}

  memes.forEach((meme) => {
    const date = new Date(meme.createdAt)
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!grouped[monthYear]) {
      grouped[monthYear] = []
    }

    grouped[monthYear].push(meme)
  })

  // Sort keys in reverse chronological order
  return Object.fromEntries(Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)))
}

// Helper function to format month-year for display
function formatMonthYear(dateKey: string): string {
  const [year, month] = dateKey.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

export function MemeTimeline() {
  const [memes, setMemes] = useState<Meme[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, boolean>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadMemes = async () => {
      try {
        setLoading(true)
        const { memes } = await fetchMemes()

        // Add random categories for demonstration
        const memesWithCategories = memes.map((meme) => ({
          ...meme,
          categories: [
            CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].id,
            CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].id,
          ].filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
        }))

        setMemes(memesWithCategories)

        // Initialize all sections as expanded
        const grouped = groupMemesByDate(memesWithCategories)
        const initialExpandedState: Record<string, boolean> = {}
        Object.keys(grouped).forEach((key) => {
          initialExpandedState[key] = true
        })
        setExpandedSections(initialExpandedState)

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

  const handleImageLoad = (memeId: string) => {
    setImageLoadStatus((prev) => ({
      ...prev,
      [memeId]: true,
    }))
  }

  const handleDownload = async (meme: Meme) => {
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
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setDownloading(null)
    }
  }

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }))
  }

  const filteredMemes =
    selectedCategory === "all" ? memes : memes.filter((meme) => meme.categories?.includes(selectedCategory))

  const groupedMemes = groupMemesByDate(filteredMemes)

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="mb-8">
            <Skeleton className="w-48 h-8 mb-4 rounded-xl bg-teal-900/30" />
            <div className="border-l-2 border-teal-700 pl-6 ml-4 space-y-6">
              {[1, 2].map((_, j) => (
                <Skeleton key={j} className="w-full h-[200px] rounded-xl bg-teal-900/30" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-900/20 rounded-lg border border-red-800">
        <p className="text-red-400 text-center">{error}</p>
        <Button className="mt-4 bg-red-700 hover:bg-red-800 text-white" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (filteredMemes.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-teal-900/20 rounded-lg border border-teal-800">
        <p className="text-teal-400">
          {memes.length === 0 ? "No memes available yet." : "No memes match the selected category."}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-teal-400" />
          <h2 className="text-lg font-medium text-teal-300">Timeline View</h2>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-teal-400" />
          <span className="text-gray-400">Filter by category:</span>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] bg-teal-900/30 border-teal-800 text-gray-200">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-[#002A29] border-teal-800 text-gray-200">
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${category.color}`}></div>
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 to-teal-900/30"></div>

        {/* Timeline content */}
        <div className="space-y-12">
          {Object.entries(groupedMemes).map(([dateKey, memesInGroup]) => (
            <div key={dateKey} className="relative animate-fadeIn">
              {/* Time marker */}
              <div className="flex items-center mb-4 cursor-pointer" onClick={() => toggleSection(dateKey)}>
                <div className="absolute left-4 w-4 h-4 bg-teal-500 rounded-full transform -translate-x-1/2 shadow-lg shadow-teal-500/50"></div>
                <h3 className="text-xl font-bold ml-10 bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent flex items-center gap-2">
                  {formatMonthYear(dateKey)}
                  {expandedSections[dateKey] ? (
                    <ChevronUp className="h-5 w-5 text-teal-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-teal-500" />
                  )}
                  <span className="text-sm font-normal text-gray-400">({memesInGroup.length} memes)</span>
                </h3>
              </div>

              {/* Memes in this time period */}
              {expandedSections[dateKey] && (
                <div className="ml-10 pl-6 border-l border-teal-900/50 space-y-6">
                  {memesInGroup.map((meme) => (
                    <div
                      key={meme.id}
                      className="bg-[#002A29] rounded-xl overflow-hidden shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 border border-teal-900/50"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div
                          className="relative md:w-1/3 aspect-square cursor-pointer"
                          onClick={() => setSelectedMeme(meme)}
                        >
                          <div className="w-full h-full flex items-center justify-center bg-black/20">
                            {/* Loading indicator */}
                            {!imageLoadStatus[meme.id] && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                              </div>
                            )}

                            <img
                              src={meme.imageUrl || "/placeholder.svg"}
                              alt={meme.caption}
                              className={`w-full h-full object-cover transition-opacity duration-300 ${
                                imageLoadStatus[meme.id] ? "opacity-100" : "opacity-0"
                              }`}
                              onLoad={() => handleImageLoad(meme.id)}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = `/placeholder.svg?height=500&width=500&text=Image+Error`
                                handleImageLoad(meme.id)
                              }}
                            />
                          </div>
                        </div>

                        <div className="p-4 md:w-2/3 flex flex-col">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {meme.categories?.map((categoryId) => {
                              const category = CATEGORIES.find((c) => c.id === categoryId)
                              return category ? (
                                <Badge key={categoryId} className={`${category.color} text-white`}>
                                  {category.name}
                                </Badge>
                              ) : null
                            })}
                          </div>

                          <p className="text-sm font-medium text-gray-300 mb-2">{meme.caption}</p>

                          <div className="mt-auto flex flex-wrap justify-between items-center gap-2">
                            <p className="text-sm text-gray-400">
                              by <span className="text-teal-400">{meme.author}</span>
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(meme.createdAt)}</p>

                            <div className="flex gap-2 mt-2 w-full md:w-auto md:mt-0">
                              <Button
                                size="sm"
                                className="flex-1 md:flex-none bg-teal-600 hover:bg-teal-700 text-white"
                                onClick={() => handleDownload(meme)}
                                disabled={downloading === meme.id}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                {downloading === meme.id ? "..." : "Download"}
                              </Button>

                              <Button
                                size="sm"
                                className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => setSelectedMeme(meme)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedMeme && <MemeDetailModal meme={selectedMeme} onClose={() => setSelectedMeme(null)} />}
    </>
  )
}
