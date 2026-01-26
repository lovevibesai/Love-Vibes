"use client"

import { AppProvider } from "@/lib/app-context"
import { LoveVibesApp } from "@/components/love-vibes/love-vibes-app"

export default function Home() {
  return (
    <AppProvider>
      <LoveVibesApp />
    </AppProvider>
  )
}
