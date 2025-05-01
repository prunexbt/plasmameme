"use server"

import type { Meme } from "@/components/meme-grid"
import { v4 as uuidv4 } from "uuid"
import { createServerComponentClient } from "./supabase"
import { ensureMemeBucket } from "./ensure-bucket"
import { processImage } from "./image-processor"
import { addNewMeme } from "./database"

// Upload gambar meme ke Supabase Storage
export async function uploadMemeImage(file: File, caption: string, author: string): Promise<Meme> {
  try {
    console.log(`Processing upload for file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)

    // Ensure the memes bucket exists before uploading
    const bucketResult = await ensureMemeBucket()
    if (!bucketResult.success) {
      throw new Error(`Failed to ensure bucket exists: ${bucketResult.error}`)
    }

    // Process the image (resize and compress)
    console.log("Processing image...")
    let processedImage

    try {
      processedImage = await processImage(file)
      console.log(`Image processed: ${processedImage.width}x${processedImage.height}, format: ${processedImage.format}`)
    } catch (processError) {
      console.error("Image processing failed, using original image:", processError)
      // Fallback to original image if processing fails
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      processedImage = {
        buffer,
        format: file.type.split("/")[1] || "jpeg",
        width: 0,
        height: 0,
      }
    }

    // Generate a unique filename for the image
    const uniqueId = uuidv4()
    const filename = `${uniqueId}-${Date.now()}.${processedImage.format}`

    console.log(`Generated filename: ${filename}`)

    const supabase = createServerComponentClient()

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("memes")
      .upload(filename, processedImage.buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: `image/${processedImage.format}`,
      })

    if (uploadError) {
      console.error("Error uploading to Supabase Storage:", uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    console.log("Upload successful:", uploadData)

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from("memes").getPublicUrl(filename)

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error("Failed to get public URL for uploaded image")
    }

    const imageUrl = publicUrlData.publicUrl
    console.log("Public URL:", imageUrl)

    // Create a new meme with the image URL
    const newMeme: Meme = {
      id: uniqueId,
      imageUrl,
      caption,
      author,
      createdAt: new Date().toISOString(),
    }

    // Add the meme to Supabase
    console.log(`Adding meme to Supabase database`)
    await addNewMeme(newMeme)
    console.log(`Meme added to database successfully`)

    return newMeme
  } catch (error: any) {
    console.error("Error uploading meme image:", error)
    // Add more detailed error information
    const errorDetails = {
      message: error.message || "Unknown error",
      name: error.name,
      stack: error.stack,
      cause: error.cause,
    }
    console.error("Error details:", errorDetails)

    throw new Error(`Failed to upload image: ${error.message || "Unknown error"}`)
  }
}

/**
 * Delete a meme by ID from Supabase Storage and the database
 */
export async function deleteMemeById(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerComponentClient()

    // Get the meme to get the image URL
    const { data: memeData, error: memeError } = await supabase.from("memes").select("image_url").eq("id", id).single()

    if (memeError) {
      console.error("Error getting meme:", memeError)
      return { success: false, error: `Failed to get meme: ${memeError.message}` }
    }

    if (!memeData || !memeData.image_url) {
      return { success: false, error: "Meme not found or image URL missing" }
    }

    // Extract filename from URL
    const imageUrl = memeData.image_url
    const filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1)

    // Delete the image from Supabase Storage
    const { error: storageError } = await supabase.storage.from("memes").remove([filename])

    if (storageError) {
      console.error("Error deleting from Supabase Storage:", storageError)
      return { success: false, error: `Failed to delete from storage: ${storageError.message}` }
    }

    // Delete the meme from the database
    const { error: dbError } = await supabase.from("memes").delete().eq("id", id)

    if (dbError) {
      console.error("Error deleting meme from database:", dbError)
      return { success: false, error: `Failed to delete meme from database: ${dbError.message}` }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting meme:", error)
    return { success: false, error: error.message || "Unknown error" }
  }
}

/**
 * Update a meme by ID in the Supabase database
 */
export async function updateMemeById(
  id: string,
  updates: Partial<Pick<Meme, "caption" | "author">>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerComponentClient()

    // Update the meme in the database
    const { error } = await supabase
      .from("memes")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("Error updating meme in database:", error)
      return { success: false, error: `Failed to update meme in database: ${error.message}` }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error updating meme:", error)
    return { success: false, error: error.message || "Unknown error" }
  }
}

/**
 * Check the current meme count in the database
 */
export async function checkMemeCount(): Promise<{ count: number }> {
  try {
    const supabase = createServerComponentClient()

    // Get total count of memes
    const { count, error } = await supabase.from("memes").select("id", { count: "exact", head: true })

    if (error) {
      console.error("Error checking meme count:", error)
      return { count: 0 }
    }

    return { count: count || 0 }
  } catch (error) {
    console.error("Error checking meme count:", error)
    return { count: 0 }
  }
}
