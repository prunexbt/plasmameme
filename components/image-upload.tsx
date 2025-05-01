"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface ImageUploadProps {
  onImageSelected: (file: File | null) => void
}

export function ImageUpload({ onImageSelected }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    // Check if it's an image file
    if (file.type.startsWith("image/")) {
      setFileName(file.name)
      onImageSelected(file)
    } else {
      // Reset if not an image
      setFileName(null)
      onImageSelected(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      alert("Please select a valid image file (JPEG, PNG, GIF, etc.)")
    }
  }

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFileName(null)
    onImageSelected(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? "border-teal-500 bg-teal-900/20" : "border-teal-800 hover:border-teal-600"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
        />
        <Upload className="mx-auto h-10 w-10 text-teal-500" />
        <p className="mt-2 text-sm text-gray-400">Drag and drop an image, or click to browse</p>
        <p className="text-xs text-gray-500 mt-1">Supports: JPG, PNG, GIF, WebP (max 5MB)</p>
      </div>

      {fileName && (
        <div className="flex items-center justify-between bg-teal-900/30 rounded px-3 py-2 border border-teal-800">
          <span className="text-sm truncate max-w-[80%] text-gray-300">{fileName}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearFile}
            className="h-6 w-6 text-gray-400 hover:text-white hover:bg-teal-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
