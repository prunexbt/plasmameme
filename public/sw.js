// Service Worker for caching and offline support
const CACHE_NAME = "plasma-memes-cache-v1"
const IMAGE_CACHE_NAME = "plasma-memes-images-v1"
const urlsToCache = ["/", "/plasma-logo.png", "/favicon.ico"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Special handling for images
  if (event.request.destination === "image" || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    event.respondWith(handleImageRequest(event.request))
    return
  }

  // Standard handling for other requests
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }
      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        // Don't cache API requests or large files
        if (
          !event.request.url.includes("/api/") &&
          !event.request.url.includes(".mp4") &&
          !event.request.url.includes(".webm")
        ) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }

        return response
      })
    }),
  )
})

// Special handling for image requests with a dedicated cache
async function handleImageRequest(request) {
  // Try to get from cache first
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  // If not in cache, fetch it
  try {
    const response = await fetch(request)

    // Cache the image if the response is valid
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE_NAME)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.error("Error fetching image:", error)
    // Return a fallback image if available
    return caches.match("/placeholder.svg")
  }
}

// Clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME, IMAGE_CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
