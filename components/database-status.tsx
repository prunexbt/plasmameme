"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@/lib/supabase"
import { CheckCircle, AlertCircle } from "lucide-react"

export function DatabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true)
        const supabase = createClientComponentClient()

        // Simple query to check if we can connect to the database
        const { data, error } = await supabase.from("memes").select("id").limit(1)

        if (error) {
          console.error("Database connection error:", error)
          setIsConnected(false)
        } else {
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Error checking database connection:", error)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center text-xs text-gray-400">
        <div className="animate-spin h-3 w-3 border-t-2 border-teal-500 rounded-full mr-2"></div>
        Checking database...
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center text-xs text-teal-400">
        <CheckCircle className="h-3 w-3 mr-1" />
        Database connected
      </div>
    )
  }

  return (
    <div className="flex items-center text-xs text-red-400">
      <AlertCircle className="h-3 w-3 mr-1" />
      Database disconnected
    </div>
  )
}
