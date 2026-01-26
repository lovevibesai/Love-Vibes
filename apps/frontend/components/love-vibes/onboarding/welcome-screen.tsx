"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Moon, Sun, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { auth, googleProvider } from "@/lib/firebase"
import { signInWithPopup } from "firebase/auth"

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
  const { setCurrentScreen, loginWithPasskey, loginWithGoogle, isLoggingIn } = useApp()
  const [particles, setParticles] = useState<Particle[]>([])
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setParticles(generateParticles(15))
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
        <div className="absolute inset-0 bg-black dark:bg-black pointer-events-none" />

        {/* Deep Cinematic Background */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 120% 100% at 50% 60%, #3D132D 0%, #2A0D1F 35%, #1A0814 65%, #000000 100%)",
            }}
          />
        </motion.div>

        {/* Central Light Source */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(139, 58, 58, 0.6) 0%, rgba(90, 31, 42, 0.3) 30%, transparent 70%)",
          }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 0.5, scale: 1.2 }}
          transition={{ duration: 1.5 }}
        />

        {/* Pulsing Ambient Glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
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
            {/* Primary CTA - Passkey (Secure Login) */}
            <button
              onClick={async () => {
                if (isLoggingIn) return;
                try {
                  // Direct Passkey Flow
                  await loginWithPasskey().catch(() => setCurrentScreen("phone")); // Fallback
                } catch (e) {
                  setCurrentScreen("phone");
                }
              }}
              disabled={isLoggingIn}
              className="w-full h-16 text-base font-semibold rounded-[20px] relative overflow-hidden group border-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-white disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #2A0D1F 0%, #7A1F3D 50%, #C84A4A 100%)",
                boxShadow: "0 8px 20px rgba(200, 74, 74, 0.35)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="absolute top-0 right-0 p-2">
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em]">ULTRA-SECURE</span>
              </div>
              <div className="relative flex items-center justify-center gap-2">
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-semibold tracking-wide">Secure Login</span>
                  </>
                )}
              </div>
            </button>

            {/* Google Sign In - Third Option */}
            <button
              onClick={async () => {
                try {
                  const result = await signInWithPopup(auth, googleProvider);
                  const idToken = await result.user.getIdToken();
                  await loginWithGoogle(idToken);
                } catch (error: any) {
                  console.error("Google Sign-In failed:", error);
                  if (error.code !== 'auth/popup-closed-by-user') {
                    setCurrentScreen("phone");
                  }
                }
              }}
              className="w-full h-16 text-base font-medium rounded-[20px] relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-white text-black"
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
            >
              <div className="relative flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-semibold tracking-wide">Continue with Google</span>
              </div>
            </button>

            {/* Secondary CTA - Email */}
            <button
              onClick={() => {
                localStorage.setItem('current_screen', 'phone');
                setCurrentScreen("phone");
              }}
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
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "radial-gradient(circle at center, rgba(212, 175, 55, 0.2) 0%, transparent 70%)",
                }}
              />
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
            <span
              onClick={() => setCurrentScreen("terms-of-service")}
              className="underline cursor-pointer hover:text-[#F6EDEE]/60 transition-colors"
            >
              Terms
            </span>
            {" & "}
            <span
              onClick={() => setCurrentScreen("privacy-policy")}
              className="underline cursor-pointer hover:text-[#F6EDEE]/60 transition-colors"
            >
              Privacy Policy
            </span>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
