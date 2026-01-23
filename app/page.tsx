"use client"

import { useState } from "react"
import { LoveVibesSplash } from "@/components/love-vibes-splash"
import { motion } from "framer-motion"
import { Phone } from "lucide-react"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <main className="min-h-screen relative overflow-hidden">
      {showSplash && (
        <LoveVibesSplash onComplete={() => setShowSplash(false)} />
      )}

      {/* Base gradient matching logo colors - deep plum to coral */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, #2D1B2E 0%, #5A1F2A 25%, #8B3A3A 50%, #C17767 80%, #E8867C 100%)",
        }}
      />

      {/* Animated gradient orbs for depth and movement */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(139, 58, 58, 0.6) 0%, transparent 60%)",
            "radial-gradient(ellipse 80% 60% at 30% 40%, rgba(139, 58, 58, 0.6) 0%, transparent 60%)",
            "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(139, 58, 58, 0.6) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(ellipse 70% 50% at 80% 70%, rgba(193, 119, 103, 0.5) 0%, transparent 50%)",
            "radial-gradient(ellipse 70% 50% at 70% 60%, rgba(193, 119, 103, 0.5) 0%, transparent 50%)",
            "radial-gradient(ellipse 70% 50% at 80% 70%, rgba(193, 119, 103, 0.5) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Gold accent glow - subtle animated */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(ellipse 40% 30% at 50% 45%, rgba(212, 175, 55, 0.08) 0%, transparent 60%)",
            "radial-gradient(ellipse 50% 40% at 50% 45%, rgba(212, 175, 55, 0.12) 0%, transparent 60%)",
            "radial-gradient(ellipse 40% 30% at 50% 45%, rgba(212, 175, 55, 0.08) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Soft vignette for cinematic depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(45, 27, 46, 0.5) 100%)",
        }}
      />

      {/* Floating particles - gold and cream */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: i < 8 ? 4 + Math.random() * 4 : 2 + Math.random() * 2,
              height: i < 8 ? 4 + Math.random() * 4 : 2 + Math.random() * 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 3 === 0
                ? "rgba(212, 175, 55, 0.4)"
                : i % 3 === 1
                  ? "rgba(248, 229, 216, 0.3)"
                  : "rgba(232, 134, 124, 0.25)",
              boxShadow: i < 8 ? "0 0 8px rgba(212, 175, 55, 0.3)" : "none",
            }}
            animate={{
              y: [0, -60 - Math.random() * 40, 0],
              x: [0, (Math.random() - 0.5) * 30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Subtle light rays from top */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 0.4 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute origin-top"
            style={{
              width: "1px",
              height: "40vh",
              left: `${25 + i * 12}%`,
              top: 0,
              background: `linear-gradient(to bottom, rgba(212, 175, 55, ${0.15 - i * 0.02}) 0%, transparent 100%)`,
              transform: `rotate(${-10 + i * 5}deg)`,
            }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12"
      >
        {/* Logo with premium multi-layer glow */}
        <motion.div
          className="relative mb-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: showSplash ? 0.8 : 1, opacity: showSplash ? 0 : 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Outer glow */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "rgba(212, 175, 55, 0.2)",
              filter: "blur(30px)",
              transform: "scale(1.8)",
            }}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1.7, 1.9, 1.7],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Inner glow */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "rgba(232, 134, 124, 0.3)",
              filter: "blur(15px)",
              transform: "scale(1.3)",
            }}
          />
          <img
            src="/images/love-vibes-the-logo.png"
            alt="Love Vibes"
            className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl"
            style={{
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          />
        </motion.div>

        {/* Welcome Text Section */}
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: showSplash ? 0 : 1, y: showSplash ? 30 : 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Main Headline - Crimson Pro serif */}
          <h1
            className="font-serif text-5xl md:text-6xl font-normal tracking-tight mb-4"
            style={{
              color: "#FFF8F5",
              textShadow: "0 2px 30px rgba(0, 0, 0, 0.4), 0 0 60px rgba(212, 175, 55, 0.15)",
            }}
          >
            Find Your Vibe
          </h1>

          {/* Decorative divider */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-5"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: showSplash ? 0 : 1, opacity: showSplash ? 0 : 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400/50" />
          </motion.div>

          {/* Subheadline */}
          <p
            className="text-lg md:text-xl font-light mb-10"
            style={{ color: "rgba(255, 248, 245, 0.8)" }}
          >
            Meaningful connections, your way
          </p>

          {/* CTA Button - Premium with gradient border */}
          <motion.button
            className="relative group w-full max-w-xs mx-auto overflow-hidden"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showSplash ? 0 : 1, y: showSplash ? 20 : 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Gradient border effect */}
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.5), rgba(248, 229, 216, 0.3), rgba(212, 175, 55, 0.5))",
                padding: "1px",
              }}
            />
            <div
              className="relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-semibold"
              style={{
                background: "linear-gradient(135deg, #FFF8F5 0%, #F8EDE8 100%)",
                color: "#8B3A3A",
              }}
            >
              {/* Hover shine effect */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent)",
                }}
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              />

              <Phone className="w-5 h-5" />
              <span className="relative z-10">Continue with Phone Number</span>
            </div>
          </motion.button>

          {/* Terms text */}
          <motion.p
            className="mt-8 text-xs leading-relaxed"
            style={{ color: "rgba(255, 248, 245, 0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: showSplash ? 0 : 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-amber-200/80 transition-colors">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="underline hover:text-amber-200/80 transition-colors">Privacy Policy</a>
          </motion.p>
        </motion.div>

        {/* Bottom decorative element */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: showSplash ? 0 : 0.4 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div
            className="w-12 h-1 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent)" }}
          />
        </motion.div>
      </motion.div>
    </main>
  )
}
