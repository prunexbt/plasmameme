"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { loginAdmin } from "@/lib/actions"
import { Header } from "@/components/header"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await loginAdmin(username, password)
      if (result.success) {
        router.push("/admin/dashboard")
      } else {
        setError(result.error || "Invalid credentials")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 bg-[#001A19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#002A29] via-[#001A19] to-[#001A19]">
      <Header />
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md bg-[#002A29] border-teal-900 text-gray-200">
          <CardHeader className="bg-gradient-to-r from-teal-900/50 to-teal-900/30 rounded-t-lg">
            <CardTitle className="text-teal-300">Admin Login</CardTitle>
            <CardDescription className="text-gray-400">
              Login to access the admin dashboard for uploading memes.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-300">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-teal-900/30 border-teal-800 text-gray-200 placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-teal-900/30 border-teal-800 text-gray-200 placeholder:text-gray-500"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="pt-2">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-teal-400 hover:text-teal-300 p-0"
                  onClick={() => setShowHint(!showHint)}
                >
                  {showHint ? "Hide hint" : "Need a hint?"}
                </Button>

                {showHint && (
                  <Alert className="mt-2 bg-teal-900/20 border-teal-800">
                    <Info className="h-4 w-4 text-teal-400" />
                    <AlertTitle className="text-teal-400">Hint</AlertTitle>
                    <AlertDescription className="text-gray-300">
                      Username: <span className="text-teal-400">admin</span>
                      <br />
                      Password: <span className="text-teal-400">[Contact administrator for password]</span>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
