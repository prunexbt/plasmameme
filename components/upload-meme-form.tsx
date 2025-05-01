"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { uploadMeme } from "@/lib/actions"
import type { Meme } from "@/components/meme-grid"
import { ImageUpload } from "@/components/image-upload"
import { AlertCircle, HardDrive } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { checkMemeCount } from "@/lib/storage"

interface UploadMemeFormProps {
  onSuccess: (meme: Meme) => void
}

export function UploadMemeForm({ onSuccess }: UploadMemeFormProps) {
  const [caption, setCaption] = useState("")
  const [author, setAuthor] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [memeCount, setMemeCount] = useState<{ count: number } | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Check meme count when component mounts
    const checkCount = async () => {
      try {
        const countInfo = await checkMemeCount()
        setMemeCount(countInfo)
      } catch (error) {
        console.error("Failed to check meme count:", error)
      }
    }

    checkCount()
  }, [])

  const handleImageChange = (file: File | null) => {
    setImageFile(file)
    setError("") // Clear any previous errors
    setUploadProgress(0)
    setRetryCount(0)

    if (file) {
      console.log(`Selected file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file (JPEG, PNG, GIF, etc.)")
        setImageFile(null)
        return
      }

      // Validate file size (10MB max for better reliability)
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size should be less than 10MB for better reliability")
        setImageFile(null)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.onerror = () => {
        setError("Failed to read the image file")
        setImageFile(null)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile) {
      setError("Please select an image")
      return
    }

    setLoading(true)
    setError("")
    setUploadProgress(10) // Start progress

    try {
      console.log(`Starting upload for: ${imageFile.name}`)

      // Show toast for upload start
      toast({
        title: "Uploading meme",
        description: "Please wait while your meme is being uploaded...",
        duration: 5000,
      })

      setUploadProgress(30) // Update progress

      // Upload the meme
      const result = await uploadMeme(imageFile, caption, author)

      setUploadProgress(100) // Complete progress

      if (result.success && result.meme) {
        toast({
          title: "Upload successful",
          description: "Your meme has been uploaded successfully!",
          duration: 3000,
        })

        // Update meme count after successful upload
        const newCountInfo = await checkMemeCount()
        setMemeCount(newCountInfo)

        onSuccess(result.meme)
        // Reset form
        setCaption("")
        setAuthor("")
        setImageFile(null)
        setPreviewUrl(null)
        setRetryCount(0)
      } else {
        console.error("Upload failed with error:", result.error)
        setError(result.error || "Failed to upload meme")

        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload meme",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Upload error:", err)
      const errorMessage = err?.message || "An error occurred during upload. Please try again."
      setError(errorMessage)

      toast({
        title: "Upload error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1)
      setError("")
      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    } else {
      setError("Maximum retry attempts reached. Please try again later or use a different image.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {memeCount && (
            <Alert className="bg-teal-900/20 border-teal-800">
              <HardDrive className="h-4 w-4 text-teal-400" />
              <AlertTitle className="text-teal-400">Meme Collection Status</AlertTitle>
              <AlertDescription className="text-gray-300">
                Currently there are {memeCount.count} memes in the collection
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="caption" className="text-sm font-medium text-gray-300">
              Caption
            </label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter a caption for this meme"
              required
              className="resize-none h-24 bg-teal-900/30 border-teal-800 text-gray-200 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="author" className="text-sm font-medium text-gray-300">
              Author
            </label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Who created this meme?"
              required
              className="bg-teal-900/30 border-teal-800 text-gray-200 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Meme Image</label>
            <ImageUpload onImageSelected={handleImageChange} />
            <p className="text-xs text-gray-500">Supported formats: JPEG, PNG, GIF, WebP (max 10MB)</p>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                {retryCount < 3 && (
                  <Button
                    variant="link"
                    onClick={handleRetry}
                    className="p-0 h-auto text-red-400 hover:text-red-300 mt-2"
                  >
                    Try again
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {loading && uploadProgress > 0 && (
            <div className="w-full bg-teal-900/30 rounded-full h-2.5 mb-4">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Meme"}
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center border border-teal-900/50 rounded-lg p-4 bg-teal-900/20">
          {previewUrl ? (
            <div className="relative w-full max-h-[300px] overflow-hidden rounded">
              <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="object-contain w-full h-full" />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Image preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
