"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { seedDatabase } from "@/lib/seed"
import { useRouter } from "next/navigation"
import { checkAdminSession } from "@/lib/actions"
import { AlertCircle, Database, RefreshCw, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClientComponentClient } from "@/lib/supabase"

export default function AdminDatabase() {
  const [loading, setLoading] = useState(true)
  const [seedLoading, setSeedLoading] = useState(false)
  const [seedResult, setSeedResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)
  const [dbStats, setDbStats] = useState<{ count: number } | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthChecking(true)
        const isAuth = await checkAdminSession()

        if (!isAuth) {
          // Redirect to login page if not authenticated
          router.replace("/admin")
          return
        }

        setIsAuthenticated(true)
        await loadDatabaseStats()
      } catch (error) {
        console.error("Authentication error:", error)
        router.replace("/admin")
      } finally {
        setAuthChecking(false)
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const loadDatabaseStats = async () => {
    try {
      setLoading(true)
      const supabase = createClientComponentClient()

      const { count, error } = await supabase.from("memes").select("*", { count: "exact", head: true })

      if (error) {
        console.error("Error fetching database stats:", error)
        return
      }

      setDbStats({ count: count || 0 })
    } catch (error) {
      console.error("Error loading database stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeedDatabase = async () => {
    try {
      setSeedLoading(true)
      setSeedResult(null)

      const result = await seedDatabase()
      setSeedResult(result)

      if (result.success) {
        await loadDatabaseStats()
      }
    } catch (error) {
      console.error("Error seeding database:", error)
      setSeedResult({ success: false, error: "An unexpected error occurred" })
    } finally {
      setSeedLoading(false)
    }
  }

  // Show authentication checking state
  if (authChecking) {
    return (
      <div className="flex-1 bg-[#001A19]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-teal-300">Verifying Access...</h1>
          </div>
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            <p className="text-lg text-teal-300">Checking authentication...</p>
          </div>
        </div>
      </div>
    )
  }

  // If we get here, the user is authenticated
  return (
    <div className="flex-1 bg-[#001A19]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              Database Management
            </h1>
            <Database className="text-teal-500 h-6 w-6" />
          </div>
          <Button
            onClick={loadDatabaseStats}
            variant="outline"
            className="border-teal-800 text-teal-300 hover:bg-teal-900/50 hover:text-teal-200"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#002A29] border-teal-800 shadow-md text-gray-200">
            <CardHeader className="bg-gradient-to-r from-teal-900/50 to-cyan-900/30 rounded-t-lg">
              <CardTitle className="text-teal-300">Database Statistics</CardTitle>
              <CardDescription className="text-gray-400">Current status of your Supabase database</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center h-24">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-teal-900/20 rounded-lg border border-teal-900/50">
                    <span className="text-gray-300">Total Memes</span>
                    <span className="text-xl font-bold text-teal-300">{dbStats?.count || 0}</span>
                  </div>

                  <p className="text-sm text-gray-400">
                    Your database is now permanently storing your meme collection. All uploads and changes will be
                    saved.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#002A29] border-teal-800 shadow-md text-gray-200">
            <CardHeader className="bg-gradient-to-r from-cyan-900/30 to-teal-900/50 rounded-t-lg">
              <CardTitle className="text-cyan-300">Database Actions</CardTitle>
              <CardDescription className="text-gray-400">Manage your database content</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="p-4 bg-teal-900/20 rounded-lg border border-teal-900/50">
                  <h3 className="text-teal-300 font-medium mb-2">Seed Database</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Add example memes to your database. This will only add memes if your database is empty.
                  </p>
                  <Button
                    onClick={handleSeedDatabase}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                    disabled={seedLoading}
                  >
                    {seedLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Seeding Database...
                      </>
                    ) : (
                      "Seed Database with Examples"
                    )}
                  </Button>
                </div>

                {seedResult && (
                  <Alert
                    variant={seedResult.success ? "default" : "destructive"}
                    className={seedResult.success ? "bg-teal-900/20 border-teal-800" : "bg-red-900/20 border-red-800"}
                  >
                    {seedResult.success ? (
                      <CheckCircle className="h-4 w-4 text-teal-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                    <AlertTitle className={seedResult.success ? "text-teal-400" : "text-red-400"}>
                      {seedResult.success ? "Success" : "Error"}
                    </AlertTitle>
                    <AlertDescription className="text-gray-300">
                      {seedResult.message || seedResult.error || "Operation completed"}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
