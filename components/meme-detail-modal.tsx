"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Meme } from "@/components/meme-grid"
import { Download, Twitter } from "lucide-react"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface MemeDetailModalProps {
  meme: Meme
  onClose: () => void
}

// Export as default component to work with dynamic imports
export default function MemeDetailModal({ meme, onClose }: MemeDetailModalProps) {
  const [downloading, setDownloading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Function to handle meme download
  const handleDownload = async () => {
    try {
      setDownloading(true)

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
      setDownloading(false)
    }
  }

  // Function to share on Twitter
  const handleTwitterShare = () => {
    const text = `I got this amazing meme from Plasma Memes! Check out more at https://plasmamemes.xyz/ 🔥`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-[#002A29] border-teal-900 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-xl text-teal-300">{meme.caption}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="relative w-full flex justify-center items-center bg-black/20 rounded-md border border-teal-900/50 p-2">
              <div className="max-h-[70vh] max-w-full overflow-hidden flex items-center justify-center">
                <img
                  src={meme.imageUrl || "/placeholder.svg"}
                  alt={meme.caption}
                  className="max-w-full max-h-[65vh] object-contain"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
              <p className="text-gray-400">
                by <span className="text-teal-400">{meme.author}</span>
              </p>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  className="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? "Downloading..." : "Download"}
                </Button>

                <Button
                  size="sm"
                  className="flex-1 sm:flex-none bg-cyan-600 hover:bg-cyan-700 text-white"
                  onClick={handleTwitterShare}
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
