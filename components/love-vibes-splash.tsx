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
  const [particles] = useState(() => generateParticles(80))
  const [canSkip, setCanSkip] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const heartControls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleComplete = useCallback(() => {
    if (!isExiting) {
      setIsExiting(true)
      setTimeout(() => {
        onComplete?.()
      }, 1200)
    }
  }, [isExiting, onComplete])

  // Dramatic heartbeat animation - double pulse
  useEffect(() => {
    if (phase === 3) {
      heartControls.start({
        scale: [1, 1.15, 0.97, 1.08, 1],
        transition: { 
          duration: 0.8, 
          times: [0, 0.25, 0.45, 0.7, 1],
          ease: [0.34, 1.56, 0.64, 1] 
        }
      })
    }
  }, [phase, heartControls])

  useEffect(() => {
    // Full 10-second calm cinematic timeline - slow and meditative
    const timers = [
      setTimeout(() => setShowContent(true), 100),
      setTimeout(() => setPhase(1), 500),       // 0.5s - Gentle darkness with anticipation
      setTimeout(() => setPhase(2), 1800),      // 1.8s - Slow background emergence
      setTimeout(() => setPhase(3), 3500),      // 3.5s - Heart draws gracefully
      setTimeout(() => setPhase(4), 5200),      // 5.2s - Text reveal cascade
      setTimeout(() => setPhase(5), 6800),      // 6.8s - Gentle elevation begins
      setTimeout(() => setPhase(6), 8000),      // 8.0s - Soft peak luminosity
      setTimeout(() => setPhase(7), 9000),      // 9.0s - Peaceful finale preparation
      setTimeout(() => setCanSkip(true), 2500),
      setTimeout(() => handleComplete(), 10000), // 10.0s - Graceful transition
    ]

    return () => timers.forEach(clearTimeout)
  }, [handleComplete])

  const handleSkip = () => {
    if (canSkip) {
      handleComplete()
    }
  }

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])

  if (prefersReducedMotion) {
    return (
      <AnimatePresence>
        {!isExiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "#0A0506" }}
            onClick={handleSkip}
            role="button"
            aria-label="Love Vibes. Finding meaningful connections. Tap to skip."
            tabIndex={0}
          >
            <div className="flex flex-col items-center gap-8">
              <img
                src="/images/love-20vibes-20the-20logo.png"
                alt="Love Vibes"
                className="w-48 h-48 object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      filter: "blur(12px)",
      scale: 0.7,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        duration: 0.5,
        delay: i * 0.08,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  }

  const title = "LOVE VIBES"

  return (
    <AnimatePresence mode="wait">
      {!isExiting ? (
        <motion.div
          ref={containerRef}
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.3,
            filter: "blur(20px) brightness(1.5)",
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 overflow-hidden cursor-pointer"
          onClick={handleSkip}
          role="button"
          aria-label="Love Vibes splash screen. Tap to skip."
          tabIndex={0}
        >
          {/* Layer 0: Pure Black Base */}
          <div className="absolute inset-0 bg-black" />

          {/* Layer 1: Deep Cinematic Background with Dramatic Reveal */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase >= 2 ? 1 : 0,
            }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <motion.div 
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 120% 100% at 50% 60%, #3D1A25 0%, #1A0A10 25%, #0D0506 50%, #000000 100%)",
              }}
              animate={{
                opacity: phase >= 5 ? 0.8 : 1,
              }}
              transition={{ duration: 1.5 }}
            />
          </motion.div>

          {/* Layer 2: Dramatic Central Light Source */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(139, 58, 58, 0.6) 0%, rgba(90, 31, 42, 0.3) 30%, transparent 70%)",
            }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{
              opacity: phase >= 3 ? 1 : phase >= 2 ? 0.3 : 0,
              scale: phase >= 6 ? 1.8 : phase >= 5 ? 1.4 : phase >= 3 ? 1 : 0.3,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Layer 3: Pulsing Ambient Glow */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: phase >= 4 ? [0.2, 0.5, 0.2] : 0,
              scale: phase >= 5 ? [1.2, 1.5, 1.2] : 1,
            }}
            transition={{
              opacity: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
              scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
          />

          {/* Layer 4: Anamorphic Lens Flare - Horizontal */}
          <motion.div
            className="absolute left-0 right-0 h-px top-[42%]"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.4) 30%, rgba(255, 255, 255, 0.8) 50%, rgba(212, 175, 55, 0.4) 70%, transparent 100%)",
              boxShadow: "0 0 80px 20px rgba(212, 175, 55, 0.3)",
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{
              opacity: phase >= 3 ? [0, 1, 0.6, 0.8] : 0,
              scaleX: phase >= 6 ? 2 : phase >= 3 ? 1 : 0,
            }}
            transition={{ 
              duration: 1.2, 
              ease: [0.22, 1, 0.36, 1],
              opacity: { duration: 0.6 }
            }}
          />

          {/* Layer 5: Secondary Lens Flare Streaks */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 5 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Diagonal Flare 1 */}
            <motion.div
              className="absolute w-full h-0.5 top-[38%] left-0 origin-center"
              style={{
                background: "linear-gradient(90deg, transparent 20%, rgba(232, 134, 124, 0.3) 50%, transparent 80%)",
                transform: "rotate(-15deg)",
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
            {/* Diagonal Flare 2 */}
            <motion.div
              className="absolute w-full h-0.5 top-[46%] left-0 origin-center"
              style={{
                background: "linear-gradient(90deg, transparent 20%, rgba(199, 91, 92, 0.3) 50%, transparent 80%)",
                transform: "rotate(12deg)",
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
            />
          </motion.div>

          {/* Layer 6: Light Rays Emanating from Center */}
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 5 ? 0.7 : phase >= 3 ? 0.3 : 0 }}
            transition={{ duration: 1 }}
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-[42%] origin-bottom"
                style={{
                  width: "2px",
                  height: "60vh",
                  background: `linear-gradient(to top, rgba(212, 175, 55, ${0.3 - i * 0.02}) 0%, transparent 100%)`,
                  transform: `translateX(-50%) rotate(${i * 30}deg)`,
                }}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scaleY: [0.8, 1.1, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>

          {/* Layer 7: Floating Particles with 3 Types */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: `${particle.x}%`,
                  bottom: "-5%",
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.type === "orb" 
                    ? "#F8E5D8" 
                    : particle.type === "spark" 
                      ? "#D4AF37" 
                      : "#C75B5C",
                  boxShadow: particle.type === "orb"
                    ? `0 0 ${particle.size * 4}px rgba(248, 229, 216, 0.8), 0 0 ${particle.size * 8}px rgba(212, 175, 55, 0.4)`
                    : particle.type === "spark"
                      ? `0 0 ${particle.size * 3}px rgba(212, 175, 55, 0.6)`
                      : `0 0 ${particle.size * 2}px rgba(199, 91, 92, 0.4)`,
                }}
                initial={{ y: 0, x: 0, opacity: 0, scale: 0 }}
                animate={{
                  y: [0, "-130vh"],
                  x: [0, particle.drift, -particle.drift * 0.5, particle.drift * 0.3, 0],
                  opacity: phase >= 2 ? [0, particle.opacity, particle.opacity, particle.opacity * 0.5, 0] : 0,
                  scale: phase >= 2 ? [0, 1, 1.2, 1, 0.5] : 0,
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                  delay: particle.delay,
                  x: {
                    duration: particle.duration * 0.8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  scale: {
                    duration: particle.duration,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }
                }}
              />
            ))}
          </div>

          {/* Layer 8: Film Grain Overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              opacity: 0.04,
            }}
            animate={{
              opacity: [0.03, 0.05, 0.03],
            }}
            transition={{ duration: 0.1, repeat: Number.POSITIVE_INFINITY }}
          />

          {/* Layer 9: Heavy Cinematic Vignette */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 65% 55% at 50% 45%, transparent 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.85) 100%)",
            }}
          />

          {/* Main Content Container */}
          {showContent && (
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              {/* Logo Container with Dramatic Build-up */}
              <motion.div
                className="relative"
                animate={heartControls}
                initial={{ scale: 1, rotate: 0 }}
              >
                <motion.div
                  className="relative"
                  animate={{
                    scale: phase >= 7 ? 1.25 : phase >= 6 ? 1.18 : phase >= 5 ? 1.1 : phase >= 4 ? 1.05 : 1,
                    rotate: phase >= 5 ? [0, 1.5, -1, 0.5, 0] : 0,
                    y: phase >= 5 ? -10 : 0,
                  }}
                  transition={{ 
                    scale: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                    rotate: { duration: 2, ease: "easeInOut" },
                    y: { duration: 1.5, ease: "easeOut" }
                  }}
                >
                  {/* Mega Outer Glow - Atmosphere */}
                  <motion.div
                    className="absolute -inset-40 rounded-full"
                    style={{ 
                      background: "radial-gradient(circle, rgba(139, 58, 58, 0.4) 0%, rgba(90, 31, 42, 0.2) 40%, transparent 70%)",
                    }}
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{
                      opacity: phase >= 6 ? 1 : phase >= 4 ? 0.6 : 0,
                      scale: phase >= 6 ? 1.5 : phase >= 4 ? 1 : 0.3,
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />

                  {/* Large Outer Glow */}
                  <motion.div
                    className="absolute -inset-24 rounded-full"
                    style={{ 
                      background: "radial-gradient(circle, rgba(212, 175, 55, 0.35) 0%, rgba(212, 175, 55, 0.1) 50%, transparent 70%)",
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: phase >= 5 ? [0.6, 1, 0.6] : phase >= 3 ? 0.4 : 0,
                      scale: phase >= 6 ? 1.6 : phase >= 5 ? 1.3 : phase >= 3 ? 1 : 0.5,
                    }}
                    transition={{ 
                      duration: 1, 
                      opacity: phase >= 5 ? { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" } : { duration: 1 }
                    }}
                  />

                  {/* Middle Glow */}
                  <motion.div
                    className="absolute -inset-16 rounded-full blur-3xl"
                    style={{ backgroundColor: "rgba(212, 175, 55, 0.4)" }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: phase >= 5 ? 0.5 : phase >= 3 ? 0.25 : 0,
                      scale: phase >= 6 ? 1.4 : 1,
                    }}
                    transition={{ duration: 1 }}
                  />

                  {/* Inner Glow - Tight */}
                  <motion.div
                    className="absolute -inset-6 rounded-full blur-2xl"
                    style={{ backgroundColor: "rgba(232, 134, 124, 0.5)" }}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: phase >= 3 ? 0.6 : 0,
                    }}
                    transition={{ duration: 0.8 }}
                  />

                  {/* Core Glow */}
                  <motion.div
                    className="absolute -inset-2 rounded-full blur-xl"
                    style={{ backgroundColor: "rgba(248, 229, 216, 0.4)" }}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: phase >= 6 ? [0.4, 0.7, 0.4] : 0,
                    }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  />

                  {/* Heart SVG Animation */}
                  <motion.div 
                    className="relative"
                    style={{ 
                      filter: phase >= 6 
                        ? "drop-shadow(0 0 40px rgba(212, 175, 55, 0.9)) drop-shadow(0 0 80px rgba(139, 58, 58, 0.6)) drop-shadow(0 0 120px rgba(90, 31, 42, 0.4))" 
                        : phase >= 4 
                          ? "drop-shadow(0 0 25px rgba(212, 175, 55, 0.6)) drop-shadow(0 0 50px rgba(139, 58, 58, 0.4))" 
                          : phase >= 3
                            ? "drop-shadow(0 0 15px rgba(212, 175, 55, 0.4))"
                            : "none",
                      transition: "filter 1s ease-out"
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: phase >= 2 ? 1 : 0,
                      scale: phase >= 2 ? 1 : 0.8,
                    }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <svg
                      viewBox="0 0 200 200"
                      className="w-40 h-40 md:w-52 md:h-52"
                    >
                      <defs>
                        {/* Heart Gradient Fill - Rich warm tones */}
                        <linearGradient id="heartGradientFill" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#F0A090" />
                          <stop offset="30%" stopColor="#E8867C" />
                          <stop offset="60%" stopColor="#C75B5C" />
                          <stop offset="100%" stopColor="#8B3A3A" />
                        </linearGradient>

                        {/* Premium Gold Stroke Gradient */}
                        <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFF5E6" />
                          <stop offset="25%" stopColor="#D4AF37" />
                          <stop offset="50%" stopColor="#F8E5D8" />
                          <stop offset="75%" stopColor="#D4AF37" />
                          <stop offset="100%" stopColor="#FFF5E6" />
                        </linearGradient>

                        {/* Cinematic Shine Gradient */}
                        <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                          <stop offset="40%" stopColor="rgba(255,255,255,0)" />
                          <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
                          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
                          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>

                        {/* Clip Path for Fill Animation */}
                        <clipPath id="heartClipPath">
                          <path d="M100 170 C60 130 20 100 20 70 C20 40 45 20 75 20 C90 20 100 35 100 35 C100 35 110 20 125 20 C155 20 180 40 180 70 C180 100 140 130 100 170Z" />
                        </clipPath>

                        {/* Enhanced Glow Filter */}
                        <filter id="glowFilter" x="-100%" y="-100%" width="300%" height="300%">
                          <feGaussianBlur stdDeviation="4" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>

                        {/* Intense Glow Filter */}
                        <filter id="intenseGlow" x="-100%" y="-100%" width="300%" height="300%">
                          <feGaussianBlur stdDeviation="8" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="blur" />
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Background Mega Glow Path */}
                      <motion.path
                        d="M100 170 C60 130 20 100 20 70 C20 40 45 20 75 20 C90 20 100 35 100 35 C100 35 110 20 125 20 C155 20 180 40 180 70 C180 100 140 130 100 170Z"
                        fill="none"
                        stroke="rgba(212, 175, 55, 0.2)"
                        strokeWidth="20"
                        filter="url(#intenseGlow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                          pathLength: phase >= 2 ? 1 : 0,
                          opacity: phase >= 5 ? 0.8 : phase >= 2 ? 0.4 : 0,
                        }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                      />

                      {/* Secondary Glow Path */}
                      <motion.path
                        d="M100 170 C60 130 20 100 20 70 C20 40 45 20 75 20 C90 20 100 35 100 35 C100 35 110 20 125 20 C155 20 180 40 180 70 C180 100 140 130 100 170Z"
                        fill="none"
                        stroke="rgba(232, 134, 124, 0.3)"
                        strokeWidth="12"
                        filter="url(#glowFilter)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                          pathLength: phase >= 2 ? 1 : 0,
                          opacity: phase >= 3 ? 1 : 0,
                        }}
                        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
                      />

                      {/* Heart Outline - Animated Stroke */}
                      <motion.path
                        d="M100 170 C60 130 20 100 20 70 C20 40 45 20 75 20 C90 20 100 35 100 35 C100 35 110 20 125 20 C155 20 180 40 180 70 C180 100 140 130 100 170Z"
                        fill="none"
                        stroke="url(#strokeGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                          pathLength: phase >= 2 ? 1 : 0,
                          opacity: phase >= 2 ? 1 : 0,
                        }}
                        transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
                      />

                      {/* Heart Fill with Liquid Pour Effect */}
                      <g clipPath="url(#heartClipPath)">
                        <motion.rect
                          x="0"
                          y="200"
                          width="200"
                          height="200"
                          fill="url(#heartGradientFill)"
                          initial={{ y: 200 }}
                          animate={{ y: phase >= 3 ? 0 : 200 }}
                          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                        />

                        {/* Primary Shine Sweep - Dramatic */}
                        <motion.rect
                          x="-200"
                          y="0"
                          width="100"
                          height="200"
                          fill="url(#shineGradient)"
                          initial={{ x: -200 }}
                          animate={{ x: phase >= 3 ? [null, 400] : -200 }}
                          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 1.2 }}
                        />

                        {/* Secondary Shine (Finale) */}
                        <motion.rect
                          x="-200"
                          y="0"
                          width="80"
                          height="200"
                          fill="url(#shineGradient)"
                          initial={{ x: -200 }}
                          animate={{ x: phase >= 6 ? 500 : -200 }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />

                        {/* Third Shine Pass */}
                        <motion.rect
                          x="-200"
                          y="0"
                          width="60"
                          height="200"
                          fill="url(#shineGradient)"
                          style={{ transform: "skewX(-20deg)" }}
                          initial={{ x: -200 }}
                          animate={{ x: phase >= 6 ? 500 : -200 }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                        />
                      </g>

                      {/* Outer Stroke Glow on Finale */}
                      <motion.path
                        d="M100 170 C60 130 20 100 20 70 C20 40 45 20 75 20 C90 20 100 35 100 35 C100 35 110 20 125 20 C155 20 180 40 180 70 C180 100 140 130 100 170Z"
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth="5"
                        filter="url(#intenseGlow)"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: phase >= 6 ? [0, 1, 0.6] : 0,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>

                  {/* Radial Light Burst on Heartbeat */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={phase === 3 ? {
                      opacity: [0, 0.9, 0],
                      scale: [0.5, 2, 2.5],
                    } : { opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <div 
                      className="w-80 h-80 rounded-full"
                      style={{
                        background: "radial-gradient(circle, rgba(212, 175, 55, 0.5) 0%, rgba(232, 134, 124, 0.3) 30%, transparent 70%)",
                      }}
                    />
                  </motion.div>

                  {/* Secondary Burst Ring */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={phase === 3 ? {
                      opacity: [0, 0.6, 0],
                      scale: [0.8, 2.5, 3],
                    } : { opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                  >
                    <div 
                      className="w-64 h-64 rounded-full border-2"
                      style={{
                        borderColor: "rgba(212, 175, 55, 0.5)",
                        boxShadow: "0 0 40px rgba(212, 175, 55, 0.3)",
                      }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Typography Section - Cinematic Reveal */}
              <motion.div
                className="mt-12 relative overflow-visible"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: phase >= 4 ? 1 : 0,
                  scale: phase >= 5 ? 1.05 : 1,
                  y: phase >= 5 ? -5 : 0,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Text Glow Background - Multiple Layers */}
                <motion.div
                  className="absolute -inset-12 blur-3xl -z-10"
                  style={{ backgroundColor: "rgba(139, 58, 58, 0.5)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase >= 4 ? 0.6 : 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />

                <motion.div
                  className="absolute -inset-8 blur-2xl -z-10"
                  style={{ backgroundColor: "rgba(212, 175, 55, 0.3)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase >= 5 ? 0.5 : 0 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Gold Underline Glow */}
                <motion.div
                  className="absolute -bottom-3 left-0 right-0 h-0.5"
                  style={{ 
                    background: "linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)",
                    boxShadow: "0 0 20px rgba(212, 175, 55, 0.6)",
                  }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ 
                    opacity: phase >= 5 ? 0.8 : 0,
                    scaleX: phase >= 5 ? 1 : 0,
                  }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Individual Letter Animation */}
                <h1
                  className="text-4xl md:text-6xl font-extralight tracking-[0.2em] flex justify-center"
                  style={{ 
                    color: "#F8E5D8",
                    textShadow: phase >= 6 
                      ? "0 0 40px rgba(212, 175, 55, 0.7), 0 0 80px rgba(139, 58, 58, 0.4), 0 4px 20px rgba(0,0,0,0.5)" 
                      : phase >= 5
                        ? "0 0 20px rgba(212, 175, 55, 0.5), 0 2px 10px rgba(0,0,0,0.3)"
                        : "none",
                  }}
                >
                  {title.split("").map((letter, i) => (
                    <motion.span
                      key={i}
                      custom={i}
                      variants={letterVariants}
                      initial="hidden"
                      animate={phase >= 4 ? "visible" : "hidden"}
                      className={letter === " " ? "w-3" : ""}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </h1>


              </motion.div>

              {/* Skip Hint */}
              <motion.div
                className="absolute bottom-12 left-0 right-0 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: canSkip && phase < 7 ? 0.5 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <p 
                  className="text-xs tracking-[0.2em] uppercase"
                  style={{ color: "rgba(248, 229, 216, 0.4)" }}
                >
                  Tap to skip
                </p>
              </motion.div>
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
