"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadMemeForm } from "@/components/upload-meme-form"
import { EditMemeForm } from "@/components/edit-meme-form"
import { fetchMemes, deleteMeme, checkAdminSession } from "@/lib/actions"
import type { Meme } from "@/components/meme-grid"
import { formatDate } from "@/lib/utils"
import { Pencil, Trash2, Plus, AlertCircle, ShieldAlert, Database } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InitializeStorage } from "@/components/initialize-storage"
import { ReliableImage } from "@/components/reliable-image"
import Link from "next/link"

export default function AdminDashboard() {
  const [memes, setMemes] = useState<Meme[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [editingMeme, setEditingMeme] = useState<Meme | null>(null)
  const [deletingMeme, setDeletingMeme] = useState<Meme | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
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

        // Only load memes if authenticated
        const { memes } = await fetchMemes()
        setMemes(memes)
      } catch (error) {
        console.error("Authentication or data loading error:", error)
        // Redirect to login on error
        router.replace("/admin")
      } finally {
        setAuthChecking(false)
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleMemeUploaded = (newMeme: Meme) => {
    setMemes((prev) => [newMeme, ...prev])
    setShowUploadForm(false)
  }

  const handleMemeUpdated = (updatedMeme: Meme) => {
    setMemes((prev) => prev.map((meme) => (meme.id === updatedMeme.id ? { ...meme, ...updatedMeme } : meme)))
    setEditingMeme(null)
  }

  const handleDeleteMeme = async () => {
    if (!deletingMeme) return

    try {
      setDeleteLoading(true)
      const result = await deleteMeme(deletingMeme.id)
      if (result.success) {
        setMemes((prev) => prev.filter((meme) => meme.id !== deletingMeme.id))
      }
    } catch (error) {
      console.error("Error deleting meme:", error)
    } finally {
      setDeleteLoading(false)
      setDeletingMeme(null)
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

  // Show a simplified loading state
  if (loading) {
    return (
      <div className="flex-1 bg-[#001A19]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-teal-300">Admin Dashboard</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-teal-300">Loading meme collection...</p>
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
              Admin Dashboard
            </h1>
            <ShieldAlert className="text-teal-500 h-6 w-6" />
          </div>
          <div className="flex gap-2">
            <Link href="/admin/database">
              <Button
                variant="outline"
                className="border-teal-800 text-teal-300 hover:bg-teal-900/50 hover:text-teal-200"
              >
                <Database className="mr-2 h-4 w-4" />
                Database
              </Button>
            </Link>
            <Button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              {showUploadForm ? (
                "Cancel"
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Upload New Meme
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Add the storage initialization component */}
        <InitializeStorage />

        {showUploadForm && (
          <div className="animate-fadeIn">
            <Card className="mb-8 border-teal-800 shadow-md bg-[#002A29] text-gray-200">
              <CardHeader className="bg-gradient-to-r from-teal-900/50 to-cyan-900/30 rounded-t-lg">
                <CardTitle className="text-teal-300">Upload New Meme</CardTitle>
                <CardDescription className="text-gray-400">
                  Add a new meme to the collection with caption and author information.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <UploadMemeForm onSuccess={handleMemeUploaded} />
              </CardContent>
            </Card>
          </div>
        )}

        {editingMeme && (
          <div className="animate-fadeIn">
            <Card className="mb-8 border-cyan-800 shadow-md bg-[#002A29] text-gray-200">
              <CardHeader className="bg-gradient-to-r from-cyan-900/30 to-teal-900/50 rounded-t-lg">
                <CardTitle className="text-cyan-300">Edit Meme</CardTitle>
                <CardDescription className="text-gray-400">
                  Update the caption and author information for this meme.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <EditMemeForm meme={editingMeme} onSuccess={handleMemeUpdated} onCancel={() => setEditingMeme(null)} />
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="mb-6 bg-teal-900/30">
            <TabsTrigger value="grid" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
              Grid View
            </TabsTrigger>
            <TabsTrigger value="table" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
              Table View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {memes.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-[#002A29] rounded-xl shadow-sm border border-teal-900/50">
                  <p className="text-gray-400">
                    No memes uploaded yet. Click "Upload New Meme" to add your first meme.
                  </p>
                </div>
              ) : (
                memes.map((meme, index) => (
                  <div
                    key={meme.id}
                    className="bg-[#002A29] rounded-xl overflow-hidden shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 animate-fadeIn border border-teal-900/50"
                    style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                  >
                    <div className="relative aspect-square">
                      <ReliableImage
                        src={meme.imageUrl}
                        alt={meme.caption}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={index < 4}
                      />
                    </div>
                    <div className="p-4 border-t border-teal-900/50">
                      <p className="font-medium text-sm line-clamp-2 mb-1 text-gray-300">{meme.caption}</p>
                      <p className="text-xs text-gray-500">
                        by <span className="text-teal-400">{meme.author}</span>
                      </p>
                      <div className="flex justify-between mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingMeme(meme)}
                          className="flex-1 mr-2 border-teal-800 text-teal-300 hover:bg-teal-900/50 hover:text-teal-200"
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingMeme(meme)}
                          className="flex-1 bg-red-900/50 hover:bg-red-900 text-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="table">
            <Card className="bg-[#002A29] border-teal-900/50 text-gray-200">
              <CardHeader className="bg-gradient-to-r from-teal-900/50 to-teal-900/30 rounded-t-lg">
                <CardTitle className="text-teal-300">Meme Collection</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your uploaded memes. Total: {memes.length} memes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {memes.length === 0 ? (
                  <p className="text-center py-8 text-gray-400">
                    No memes uploaded yet. Click "Upload New Meme" to add your first meme.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-teal-900/50">
                          <th className="text-left py-3 px-4 text-teal-300">Preview</th>
                          <th className="text-left py-3 px-4 text-teal-300">Caption</th>
                          <th className="text-left py-3 px-4 text-teal-300">Author</th>
                          <th className="text-left py-3 px-4 text-teal-300">Date</th>
                          <th className="text-left py-3 px-4 text-teal-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memes.map((meme, index) => (
                          <tr key={meme.id} className="border-b border-teal-900/50 hover:bg-teal-900/20">
                            <td className="py-3 px-4">
                              <div className="relative w-16 h-16 overflow-hidden rounded border border-teal-900/50">
                                <ReliableImage
                                  src={meme.imageUrl}
                                  alt={meme.caption}
                                  fill
                                  sizes="64px"
                                  priority={index < 10}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4 max-w-xs truncate text-gray-300">{meme.caption}</td>
                            <td className="py-3 px-4 text-teal-400">{meme.author}</td>
                            <td className="py-3 px-4 text-gray-400">{formatDate(meme.createdAt)}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingMeme(meme)}
                                  className="border-teal-800 text-teal-300 hover:bg-teal-900/50 hover:text-teal-200"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeletingMeme(meme)}
                                  className="bg-red-900/50 hover:bg-red-900 text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!deletingMeme} onOpenChange={(open) => !open && setDeletingMeme(null)}>
        <AlertDialogContent className="bg-[#002A29] border-red-900 text-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-400">
              <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this meme? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteLoading}
              className="bg-transparent border-teal-900 text-gray-300 hover:bg-teal-900/50 hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMeme}
              disabled={deleteLoading}
              className="bg-red-900/70 hover:bg-red-900 text-red-200"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
