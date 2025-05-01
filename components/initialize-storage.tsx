"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { ensureMemeBucket } from "@/lib/ensure-bucket"

export function InitializeStorage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const checkAndInitialize = async () => {
    try {
      setStatus("loading")
      setErrorMessage(null)

      const result = await ensureMemeBucket()

      if (result.success) {
        setStatus("success")
      } else {
        setStatus("error")
        setErrorMessage(result.error || "Unknown error")
      }
    } catch (error: any) {
      setStatus("error")
      setErrorMessage(error.message || "Failed to initialize storage")
    }
  }

  useEffect(() => {
    checkAndInitialize()
  }, [])

  return (
    <div className="mb-4">
      {status === "loading" && (
        <Alert className="bg-teal-900/20 border-teal-800">
          <RefreshCw className="h-4 w-4 text-teal-400 animate-spin" />
          <AlertTitle className="text-teal-400">Initializing Storage</AlertTitle>
          <AlertDescription className="text-gray-300">
            Please wait while we set up the storage bucket...
          </AlertDescription>
        </Alert>
      )}

      {status === "success" && (
        <Alert className="bg-teal-900/20 border-teal-800">
          <CheckCircle className="h-4 w-4 text-teal-400" />
          <AlertTitle className="text-teal-400">Storage Ready</AlertTitle>
          <AlertDescription className="text-gray-300">Storage bucket is set up and ready to use.</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-400">Storage Error</AlertTitle>
          <AlertDescription className="text-gray-300">
            {errorMessage || "Failed to initialize storage."}
            <div className="mt-2">
              <Button size="sm" onClick={checkAndInitialize} className="bg-red-800 hover:bg-red-700 text-white">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
