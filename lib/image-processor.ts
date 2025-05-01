"use server"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Create a browser-compatible image processor
async function processBrowserImage(file: File): Promise<{
  buffer: Buffer
  format: string
  width: number
  height: number
}> {
  console.log("Using browser image processor (no compression)")

  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Create an image element to get dimensions
  const img = new Image()
  const imageLoaded = new Promise<void>((resolve) => {
    img.onload = () => resolve()
  })

  img.src = URL.createObjectURL(file)
  await imageLoaded

  // Get format from file type
  const format = file.type.split("/")[1] || "jpeg"

  return {
    buffer,
    format,
    width: img.width,
    height: img.height,
  }
}

// Only import sharp if we're in a Node.js environment
let sharp: any
if (!isBrowser) {
  try {
    // Dynamic import to avoid loading in browser
    import("sharp").then((module) => {
      sharp = module.default
    })
  } catch (error) {
    console.error("Failed to load Sharp module:", error)
  }
}

export async function compressImage(file: File): Promise<Buffer> {
  // In browser environment, return the file as is
  if (isBrowser || !sharp) {
    console.log("Sharp not available, skipping compression")
    const arrayBuffer = await file.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get image info to determine best compression approach
    const metadata = await sharp(buffer).metadata()

    // Determine if we should preserve transparency
    const hasAlpha = metadata.hasAlpha || metadata.channels === 4

    // Compress the image
    let processedImage: Buffer

    if (file.type === "image/gif") {
      // For GIFs, just optimize but keep format to preserve animation
      processedImage = buffer
    } else if (hasAlpha) {
      // For images with transparency, use PNG with reduced quality
      processedImage = await sharp(buffer).png({ quality: 80, compressionLevel: 9 }).toBuffer()
    } else {
      // For regular images, convert to JPEG with good quality
      processedImage = await sharp(buffer).jpeg({ quality: 85, mozjpeg: true }).toBuffer()
    }

    console.log(`Original size: ${buffer.length} bytes, Compressed size: ${processedImage.length} bytes`)
    console.log(`Compression ratio: ${((processedImage.length / buffer.length) * 100).toFixed(2)}%`)

    return processedImage
  } catch (error) {
    console.error("Error compressing image:", error)
    // Fallback to original image if compression fails
    const arrayBuffer = await file.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }
}

export async function resizeImage(file: File, maxWidth = 1200): Promise<Buffer> {
  // In browser environment, return the file as is
  if (isBrowser || !sharp) {
    console.log("Sharp not available, skipping resize")
    const arrayBuffer = await file.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get image info
    const metadata = await sharp(buffer).metadata()

    // Only resize if the image is larger than maxWidth
    if (metadata.width && metadata.width > maxWidth) {
      return await sharp(buffer).resize(maxWidth, null, { withoutEnlargement: true }).toBuffer()
    }

    // Return original if no resize needed
    return buffer
  } catch (error) {
    console.error("Error resizing image:", error)
    // Fallback to original image if resize fails
    const arrayBuffer = await file.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }
}

export async function processImage(file: File): Promise<{
  buffer: Buffer
  format: string
  width: number
  height: number
}> {
  // In browser environment, use the browser-compatible processor
  if (isBrowser || !sharp) {
    return processBrowserImage(file)
  }

  try {
    // Step 1: Resize large images
    const resizedBuffer = await resizeImage(file, 1200)

    // Step 2: Compress the image
    const compressedBuffer = await compressImage(file)

    // Get final metadata
    const metadata = await sharp(compressedBuffer).metadata()

    return {
      buffer: compressedBuffer,
      format: metadata.format || "jpeg",
      width: metadata.width || 0,
      height: metadata.height || 0,
    }
  } catch (error) {
    console.error("Error processing image:", error)
    // Fallback to browser processor if Sharp processing fails
    return processBrowserImage(file)
  }
}
