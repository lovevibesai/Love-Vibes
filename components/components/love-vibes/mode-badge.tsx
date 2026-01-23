"use client"

import { Heart, Users } from "lucide-react"
import type { AppMode } from "@/lib/app-context"
import { cn } from "@/lib/utils"

interface ModeBadgeProps {
  mode: AppMode
  size?: "sm" | "md"
}

export function ModeBadge({ mode, size = "md" }: ModeBadgeProps) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
  }

  const Icon = mode === "dating" ? Heart : Users

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center",
        sizes[size]
      )}
      style={{
        background: mode === "dating" 
          ? "linear-gradient(160deg, #D4635E 0%, #5A2A4A 100%)"
          : "linear-gradient(160deg, #D4AF37 0%, #D4635E 100%)"
      }}
      aria-label={mode === "dating" ? "Looking for love" : "Seeking friendship"}
    >
      <Icon className={cn("text-white", iconSizes[size])} fill="currentColor" />
    </div>
  )
}
