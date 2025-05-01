"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LogOut } from "lucide-react"
import { logoutAdmin } from "@/lib/actions"
import { DatabaseStatus } from "@/components/database-status"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const isAdminPage = pathname.startsWith("/admin")

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    if (isAdminPage) {
      await logoutAdmin()
      router.push("/admin")
    }
  }

  return (
    <header
      className={`border-b border-teal-900 backdrop-blur-md sticky top-0 z-10 transition-all duration-300 ${
        scrolled ? "bg-[#001A19]/95 shadow-lg shadow-black/20 py-2" : "bg-[#001A19]/80 py-3"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-teal-500/50 shadow-lg shadow-teal-500/20 transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/plasma-logo.png"
              alt="Plasma Memes Logo"
              fill
              className="object-cover transition-transform duration-500 group-hover:rotate-12"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              Plasma Memes
            </span>
            <span className="text-xs text-teal-500/80">Community Collection</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <DatabaseStatus />

          {isAdminPage && pathname !== "/admin" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-300 border-red-900/50 hover:bg-red-900/20 hover:text-red-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}

          {isAdminPage && (
            <Link href="/">
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-teal-900/50 transition-all duration-300"
              >
                Back to Home
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
