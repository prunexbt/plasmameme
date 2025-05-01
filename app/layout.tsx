import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Footer } from "@/components/footer"
import { initializeApp } from "@/lib/actions"
import Script from "next/script"

// Initialize the app
initializeApp().catch((error) => {
  console.error("Failed to initialize app:", error)
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Plasma Memes",
  description: "A curated collection of the best memes from the Plasma community",
  icons: {
    icon: [{ url: "/plasma-logo.png" }],
    apple: [{ url: "/plasma-logo.png" }],
  },
  manifest: "/manifest.json",
  themeColor: "#002A29",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="/plasma-logo.png" as="image" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {children}
        <Footer />

        {/* Register service worker */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                  registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  },
                  err => {
                    console.log('ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
