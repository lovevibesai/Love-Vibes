"use client"

import React from "react"

import { useState, useRef } from "react"
import { MapPin, Play, CheckCircle } from "lucide-react"
import { TrustScore } from "../trust-score"
import { ModeBadge } from "../mode-badge"
import type { User } from "@/lib/app-context"
import { cn } from "@/lib/utils"

interface SwipeCardProps {
  user: User
  onSwipe: (direction: "left" | "right") => void
  isTop: boolean
  onTap?: () => void
}

export function SwipeCard({ user, onSwipe, isTop, onTap }: SwipeCardProps) {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [hasMoved, setHasMoved] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const dragOffset = currentX - startX
  const threshold = 100
  const rotation = dragOffset * 0.1
  const opacity = Math.max(0, 1 - Math.abs(dragOffset) / 300)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
    setHasMoved(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isTop) return
    const x = e.touches[0].clientX
    setCurrentX(x)
    
    if (Math.abs(x - startX) > 10) {
      setHasMoved(true)
    }
    
    if (x - startX > threshold) {
      setSwipeDirection("right")
    } else if (x - startX < -threshold) {
      setSwipeDirection("left")
    } else {
      setSwipeDirection(null)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging || !isTop) return
    
    if (Math.abs(dragOffset) > threshold) {
      onSwipe(dragOffset > 0 ? "right" : "left")
    } else if (!hasMoved && onTap) {
      onTap()
    }
    
    setIsDragging(false)
    setCurrentX(0)
    setStartX(0)
    setSwipeDirection(null)
    setHasMoved(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return
    setStartX(e.clientX)
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isTop) return
    const x = e.clientX
    setCurrentX(x)
    
    if (x - startX > threshold) {
      setSwipeDirection("right")
    } else if (x - startX < -threshold) {
      setSwipeDirection("left")
    } else {
      setSwipeDirection(null)
    }
  }

  const handleMouseUp = () => {
    handleTouchEnd()
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleTouchEnd()
    }
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "absolute inset-x-4 top-0 bg-card rounded-3xl overflow-hidden shadow-card transition-transform",
        !isDragging && "transition-all duration-300",
        !isTop && "scale-[0.95] translate-y-4 opacity-70"
      )}
      style={{
        height: "calc(100% - 100px)",
        transform: isTop && isDragging
          ? `translateX(${dragOffset}px) rotate(${rotation}deg)`
          : undefined,
        opacity: isTop && isDragging ? opacity : undefined,
        zIndex: isTop ? 10 : 1,
        touchAction: "none",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Swipe Indicators */}
      {isTop && swipeDirection && (
        <div className={cn(
          "absolute top-8 z-20 px-6 py-2 rounded-lg border-4 font-bold text-xl uppercase",
          "transform -rotate-12",
          swipeDirection === "right"
            ? "left-4 border-trust-high text-trust-high bg-trust-high/10"
            : "right-4 border-destructive text-destructive bg-destructive/10 rotate-12"
        )}>
          {swipeDirection === "right" ? "Like" : "Pass"}
        </div>
      )}

      {/* Photo */}
      <div className="relative h-[60%]">
        <img
          src={user.photoUrl || "/placeholder.svg"}
          alt={user.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
        
        {/* Trust Score - Top Left */}
        <div className="absolute top-4 left-4">
          <TrustScore score={user.trustScore} size="md" />
        </div>
        
        {/* Mode Badge - Top Right */}
        <div className="absolute top-4 right-4">
          <ModeBadge mode={user.mode} size="md" />
        </div>
        
        {/* Video Button */}
        {(user.videoUrl || user.hasVideoIntro) && (
          <button 
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Play video intro"
            onClick={(e) => {
              e.stopPropagation()
              // Video would play here in production
            }}
          >
            <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
          </button>
        )}
        
        {/* Profile Info */}
        <div className="absolute bottom-4 left-4 right-16">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white">
              {user.name}, {user.age}
            </h2>
            {user.isVerified && (
              <CheckCircle className="w-5 h-5 text-gold" fill="currentColor" />
            )}
          </div>
          <div className="flex items-center gap-1 text-white/80 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{user.distance}</span>
          </div>
        </div>
      </div>
      
      {/* Bio Section */}
      <div className="p-5 bg-card">
        <p className="text-foreground/80 text-sm leading-relaxed line-clamp-3">
          {user.bio}
        </p>
      </div>
    </div>
  )
}
