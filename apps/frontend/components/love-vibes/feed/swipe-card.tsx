"use client"

import React from "react"
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion"
import { MapPin, Play, CheckCircle, Heart, X } from "lucide-react"
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
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])
  const scale = useTransform(x, [-200, 0, 200], [0.8, 1, 0.8])

  const likeOpacity = useTransform(x, [50, 150], [0, 1])
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0])

  const controls = useAnimation()

  const handleDragEnd = async (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      const direction = info.offset.x > 0 ? "right" : "left"
      await controls.start({ x: info.offset.x > 0 ? 1000 : -1000, opacity: 0, transition: { duration: 0.3 } })
      onSwipe(direction)
    } else {
      controls.start({ x: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } })
      if (Math.abs(info.offset.x) < 5 && onTap) {
        onTap()
      }
    }
  }

  return (
    <motion.div
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{
        x,
        rotate,
        opacity: isTop ? opacity : 0.6,
        scale: isTop ? 1 : 0.95,
        zIndex: isTop ? 10 : 1,
        touchAction: "none",
      }}
      className={cn(
        "absolute inset-x-2 top-0 h-[calc(100%-120px)] rounded-[32px] overflow-hidden shadow-2xl bg-card border border-white/10",
        !isTop && "translate-y-4"
      )}
    >
      {/* Swipe Indicators */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-10 left-10 z-30 px-6 py-2 rounded-2xl border-4 border-emerald-400 bg-emerald-400/20 backdrop-blur-md -rotate-12"
      >
        <span className="text-3xl font-black text-emerald-400 uppercase tracking-widest italic">LIKE</span>
      </motion.div>

      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-10 right-10 z-30 px-6 py-2 rounded-2xl border-4 border-rose-500 bg-rose-500/20 backdrop-blur-md rotate-12"
      >
        <span className="text-3xl font-black text-rose-500 uppercase tracking-widest italic">NOPE</span>
      </motion.div>

      {/* Photo & Mesh Gradient Base */}
      <div className="relative h-full w-full">
        <div className={cn(
          "absolute inset-0 opacity-20",
          user.mode === "dating" ? "mesh-gradient-dating" : "mesh-gradient-friendship"
        )} />

        <img
          src={user.photoUrl || "/placeholder.svg"}
          alt={user.name}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Premium Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
          <div className="flex flex-col gap-2">
            <div className="glass-dark rounded-2xl p-1">
              <TrustScore score={user.trustScore} size="md" />
            </div>
            {user.compatibilityScore && (
              <div className="glass-elevated rounded-xl px-2 py-1 flex items-center gap-1.5 border-rose-500/30">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">{user.compatibilityScore}% Chemistry</span>
              </div>
            )}
          </div>
          <div className="glass-dark rounded-2xl px-3 py-1.5 flex items-center gap-2">
            <ModeBadge mode={user.mode} size="md" />
          </div>
        </div>

        {/* Video Pulse Intro */}
        {(user.videoUrl || user.hasVideoIntro) && (
          <button
            className="absolute bottom-32 right-6 w-14 h-14 rounded-full glass-elevated flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <Play className="w-6 h-6 text-white ml-1 relative z-10" fill="currentColor" />
          </button>
        )}

        {/* Content Box */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent">
          {user.matchReason && (
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20">
                AI Insight
              </span>
              <span className="text-xs font-bold text-white/90 italic">
                &quot;{user.matchReason}&quot;
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-black text-white tracking-tight leading-none">
              {user.name}, {user.age}
            </h2>
            {user.isVerified && (
              <CheckCircle className="w-6 h-6 text-amber-400" fill="currentColor" />
            )}
          </div>

          <div className="flex items-center gap-2 text-white/60 mb-4 font-medium">
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs uppercase tracking-wider">{user.distance} AWAY</span>
            </div>
            {user.interests && JSON.parse(user.interests as any).slice(0, 1).map((interest: string) => (
              <div key={interest} className="bg-primary/20 px-2 py-1 rounded-lg backdrop-blur-sm text-primary text-xs uppercase tracking-wider">
                {interest}
              </div>
            ))}
          </div>

          <p className="text-white/80 text-sm leading-relaxed line-clamp-2 font-medium">
            {user.bio}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
