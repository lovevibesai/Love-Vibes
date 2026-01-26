"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
  drift: number
  type: "dust" | "spark" | "orb"
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: 100 + Math.random() * 20,
    size: i < count * 0.3 ? 2 + Math.random() * 4 : 1 + Math.random() * 2,
    opacity: 0.15 + Math.random() * 0.35,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 4,
    drift: (Math.random() - 0.5) * 50,
    type: i < count * 0.15 ? "orb" : i < count * 0.4 ? "spark" : "dust",
  }))
}

interface LoveVibesSplashProps {
  onComplete?: () => void
}

export function LoveVibesSplash({ onComplete }: LoveVibesSplashProps) {
  const [phase, setPhase] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  const handleComplete = useCallback(() => {
    if (!isExiting) {
      setIsExiting(true)
      setTimeout(() => {
        onComplete?.()
      }, 500)
    }
  }, [isExiting, onComplete])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase(1)
      setTimeout(handleComplete, 2500)
    }, 500)
    return () => clearTimeout(timer)
  }, [handleComplete])

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          onClick={handleComplete}
        >
          {/* Subtle Background Glow */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: "radial-gradient(circle at center, #7A1F3D 0%, transparent 70%)"
            }}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center gap-8"
          >
            {/* Simple Heart Logo */}
            <div className="relative w-32 h-32">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-[#D4AF37] opacity-20 blur-2xl rounded-full"
              />
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                <path
                  d="M100 170 C60 130 20 100 20 70 C20 40 45 20 75 20 C90 20 100 35 100 35 C100 35 110 20 125 20 C155 20 180 40 180 70 C180 100 140 130 100 170Z"
                  fill="#D4AF37"
                />
              </svg>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-2xl font-light tracking-[0.4em] text-[#F8E5D8]"
            >
              LOVE VIBES
            </motion.h1>
          </motion.div>

          <div className="absolute bottom-12 text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">
            Finding High-Resonance Connections
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
