import { MemeGrid } from "@/components/meme-grid"
import { Header } from "@/components/header"
import { Suspense } from "react"

function MemeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-[#002A29]/50 rounded-xl overflow-hidden shadow-lg animate-pulse h-64"></div>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <main className="flex-1 bg-[#001A19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#002A29] via-[#001A19] to-[#001A19]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-300 rounded-full"></div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
            Discover Plasma Memes by Community
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A curated collection of the best memes from the Plasma community. Enjoy, share, and be trillions 🕊️
          </p>
        </div>

        <Suspense fallback={<MemeGridSkeleton />}>
          <MemeGrid />
        </Suspense>
      </div>
    </main>
  )
}
