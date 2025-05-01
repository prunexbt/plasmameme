"use server"

import { cookies } from "next/headers"
import type { Meme } from "@/components/meme-grid"
import { createServerComponentClient } from "./supabase"

// Mengambil semua meme dari database Supabase
export async function getMemes(): Promise<Meme[]> {
  try {
    const supabase = createServerComponentClient()

    const { data, error } = await supabase.from("memes").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching memes:", error)
      return []
    }

    // Transform data to match our Meme type
    return data.map((item) => ({
      id: item.id,
      imageUrl: item.image_url,
      caption: item.caption,
      author: item.author,
      createdAt: item.created_at,
    }))
  } catch (error) {
    console.error("Error getting memes:", error)
    return []
  }
}

// Memeriksa session admin
export async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = cookies()
    const adminSession = cookieStore.get("admin_session")

    // Simulate session check
    return adminSession?.value === "authenticated"
  } catch (error) {
    console.error("Error checking admin session:", error)
    return false
  }
}
