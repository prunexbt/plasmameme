import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-teal-900/50 bg-[#001A19]/95">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <p className="text-gray-400 text-sm flex items-center gap-1">
            created with <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" aria-hidden="true" /> by{" "}
            <a
              href="https://twitter.com/prunexbt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              prunexbt
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
