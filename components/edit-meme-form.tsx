"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { updateMeme } from "@/lib/actions"
import type { Meme } from "@/components/meme-grid"
import Image from "next/image"

interface EditMemeFormProps {
  meme: Meme
  onSuccess: (meme: Meme) => void
  onCancel: () => void
}

export function EditMemeForm({ meme, onSuccess, onCancel }: EditMemeFormProps) {
  const [caption, setCaption] = useState(meme.caption)
  const [author, setAuthor] = useState(meme.author)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await updateMeme(meme.id, caption, author)
      if (result.success) {
        onSuccess({ ...meme, caption, author })
      } else {
        setError(result.error || "Failed to update meme")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
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

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex space-x-3">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Meme"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 border-teal-800 text-gray-300 hover:bg-teal-900/50 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border border-teal-900/50 rounded-lg p-4 bg-teal-900/20">
          <div className="relative w-full max-h-[300px] overflow-hidden rounded">
            <Image
              src={meme.imageUrl || "/placeholder.svg"}
              alt="Preview"
              width={400}
              height={400}
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      </div>
    </form>
  )
}
