"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Moon, Sun, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

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

export function WelcomeScreen() {
  const { setCurrentScreen } = useApp()
  const [particles, setParticles] = useState<Particle[]>([])
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setParticles(generateParticles(60))
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative min-h-screen overflow-hidden flex flex-col bg-black dark:bg-black"
      >
        {/* Animated Background - Pure Black Base */}
        <div className="absolute inset-0 bg-black dark:bg-black" />

        {/* Deep Cinematic Background */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 120% 100% at 50% 60%, #3D132D 0%, #2A0D1F 35%, #1A0814 65%, #000000 100%)",
            }}
          />
        </motion.div>

        {/* Central Light Source */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(139, 58, 58, 0.6) 0%, rgba(90, 31, 42, 0.3) 30%, transparent 70%)",
          }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 0.5, scale: 1.2 }}
          transition={{ duration: 1.5 }}
        />

        {/* Pulsing Ambient Glow */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)",
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1.2, 1.4, 1.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating Particles */}
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
                  ? "#F6EDEE"
                  : particle.type === "spark"
                    ? "#D4AF37"
                    : "#C84A4A",
                boxShadow: particle.type === "orb"
                  ? `0 0 ${particle.size * 4}px rgba(246, 237, 238, 0.8)`
                  : particle.type === "spark"
                    ? `0 0 ${particle.size * 3}px rgba(228, 195, 138, 0.6)`
                    : `0 0 ${particle.size * 2}px rgba(200, 74, 74, 0.4)`,
              }}
              initial={{ y: 0, x: 0, opacity: 0 }}
              animate={{
                y: [0, "-130vh"],
                x: [0, particle.drift, -particle.drift * 0.5, particle.drift * 0.3, 0],
                opacity: [0, particle.opacity, particle.opacity, particle.opacity * 0.5, 0],
                scale: [0, 1, 1.2, 1, 0.5],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "linear",
                delay: particle.delay,
              }}
            />
          ))}
        </div>

        {/* Film Grain Overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: 0.04,
          }}
          animate={{ opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 0.1, repeat: Infinity }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 65% 55% at 50% 45%, transparent 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        {/* Theme Toggle - Top Right */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute top-6 right-6 z-20"
        >
          {mounted && (
            <button
              onClick={toggleTheme}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
              aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5 text-[#F8E5D8]" />
              ) : (
                <Moon className="w-5 h-5 text-[#F8E5D8]" />
              )}
            </button>
          )}
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto px-6 text-center">
          {/* Larger Logo with Better Blending */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <div className="relative">
              {/* Multiple layered glows for better blending */}
              <div
                className="absolute inset-0 blur-[80px] opacity-70"
                style={{
                  background: "radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, rgba(139, 58, 58, 0.3) 40%, transparent 70%)",
                  transform: "scale(2)",
                }}
              />
              <div
                className="absolute inset-0 blur-[50px] opacity-50"
                style={{
                  background: "radial-gradient(circle, rgba(139, 58, 58, 0.5) 0%, transparent 60%)",
                  transform: "scale(1.8)",
                }}
              />

              {/* Logo - Sized for Mobile */}
              <img
                src="/logo.png"
                alt="Love Vibes"
                className="w-64 h-64 mx-auto object-contain relative"
                style={{
                  filter: "drop-shadow(0 0 40px rgba(212, 175, 55, 0.6))",
                }}
              />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="text-lg text-[#F6EDEE]/90 mb-12 max-w-md font-serif italic tracking-wide"
          >
            Elite connections. Simple vibes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="w-full max-w-sm space-y-4"
          >
            {/* Primary CTA - Passkey */}
            <button
              onClick={() => setCurrentScreen("phone")}
              className="w-full h-16 text-base font-semibold rounded-[20px] relative overflow-hidden group border-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-white"
              style={{
                background: "linear-gradient(135deg, #2A0D1F 0%, #7A1F3D 50%, #C84A4A 100%)",
                boxShadow: "0 8px 20px rgba(200, 74, 74, 0.35)",
              }}
            >
              {/* Shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

              {/* Secure Badge */}
              <div className="absolute top-0 right-0 p-2">
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em]">ULTRA-SECURE</span>
              </div>

              {/* Content */}
              <div className="relative flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-semibold tracking-wide">Secure Login</span>
              </div>
            </button>

            {/* Secondary CTA - Email */}
            <button
              onClick={() => setCurrentScreen("phone")}
              className="w-full h-16 text-base font-medium rounded-[20px] relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)",
                border: "2px solid transparent",
                backgroundClip: "padding-box",
                boxShadow: "0 8px 24px rgba(212, 175, 55, 0.15), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 0 0 2px rgba(212, 175, 55, 0.3)",
                color: "#F8E5D8",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "radial-gradient(circle at center, rgba(212, 175, 55, 0.2) 0%, transparent 70%)",
                }}
              />

              {/* Secure Badge */}
              <div className="absolute top-0 right-0 p-2">
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em]">ULTRA-SECURE</span>
              </div>

              {/* Content */}
              <div className="relative flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" />
                <span className="font-semibold tracking-wide">Email Login</span>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="relative z-10 pb-8 text-center px-6"
        >
          <p className="text-xs text-[#F6EDEE]/40 leading-relaxed font-light">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer hover:text-[#F6EDEE]/60 transition-colors">Terms</span>
            {" & "}
            <span className="underline cursor-pointer hover:text-[#F6EDEE]/60 transition-colors">Privacy Policy</span>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
