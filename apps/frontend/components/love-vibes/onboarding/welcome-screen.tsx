"use client"

import { useState, useEffect, useCallback } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Moon, Sun, ShieldCheck, Loader2 } from "lucide-react"
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
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    setParticles(generateParticles(15))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  const handleGoogleSignIn = async () => {
    setAuthError(null)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      await loginWithGoogle(idToken)
    } catch (error: any) {
      console.error("Google Sign-In failed:", error)
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError("Google Sign-In failed. Please try again.")
        // Optional: Fallback to phone login after delay
        // setTimeout(() => setCurrentScreen("phone"), 2000)
      }
    }
  }

  const handlePasskeyLogin = async () => {
    if (isLoggingIn) return
    setAuthError(null)
    try {
      await loginWithPasskey()
    } catch (e) {
      console.error("Passkey login failed, falling back to phone:", e)
      setCurrentScreen("phone")
    }
  }

  const handleEmailLogin = () => {
    localStorage.setItem('current_screen', 'phone')
    setCurrentScreen("phone")
  }

  if (!mounted) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative min-h-screen overflow-hidden flex flex-col bg-black"
      >
        {/* Cinematic Background Layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Deep Base Gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 120% 100% at 50% 60%, #3D132D 0%, #2A0D1F 35%, #1A0814 65%, #000000 100%)",
            }}
          />

          {/* Central Atmospheric Glow */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(139, 58, 58, 0.4) 0%, rgba(90, 31, 42, 0.2) 30%, transparent 70%)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          {/* Pulsing Ambient Light */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)",
            }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Floating Particles */}
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
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: "-110vh",
                x: [0, particle.drift, -particle.drift * 0.5, 0],
                opacity: [0, particle.opacity, particle.opacity, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "linear",
                delay: particle.delay,
              }}
            />
          ))}

          {/* Film Grain & Vignette */}
          <div className="absolute inset-0 mix-blend-overlay opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_60%,rgba(0,0,0,0.8)_100%)]" />
        </div>

        {/* Theme Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 right-6 z-20"
        >
          <button
            onClick={toggleTheme}
            className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5 text-[#F8E5D8]" />
            ) : (
              <Moon className="w-5 h-5 text-[#F8E5D8]" />
            )}
          </button>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-12 relative"
          >
            {/* Logo Glows */}
            <div className="absolute inset-0 blur-[100px] opacity-30 bg-[#D4AF37] scale-150" />
            <div className="absolute inset-0 blur-[60px] opacity-40 bg-[#8B3A3A] scale-125" />

            <img
              src="/logo.png"
              alt="Love Vibes"
              className="w-56 h-56 mx-auto object-contain relative drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]"
              onError={(e) => {
                // Fallback if logo is missing
                e.currentTarget.style.display = 'none';
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2 mb-12"
          >
            <h1 className="text-4xl font-serif italic text-[#F6EDEE] tracking-tight">Love Vibes</h1>
            <p className="text-lg text-[#F6EDEE]/70 font-serif italic">Elite connections. Simple vibes.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full space-y-4"
          >
            {authError && (
              <p className="text-red-400 text-sm mb-2">{authError}</p>
            )}

            {/* Secure Login Button */}
            <button
              onClick={handlePasskeyLogin}
              disabled={isLoggingIn}
              className="w-full h-16 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #2A0D1F 0%, #7A1F3D 50%, #C84A4A 100%)",
                boxShadow: "0 10px 30px -10px rgba(200, 74, 74, 0.5)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[8px] font-bold text-white tracking-widest uppercase">
                Secure
              </div>
              <div className="flex items-center justify-center gap-3 text-white">
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-bold tracking-wide">Secure Login</span>
                  </>
                )}
              </div>
            </button>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full h-16 rounded-2xl bg-white flex items-center justify-center gap-3 transition-all hover:bg-gray-50 active:scale-[0.98] shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="font-bold text-gray-900 tracking-wide">Continue with Google</span>
            </button>

            {/* Email Login Button */}
            <button
              onClick={handleEmailLogin}
              className="w-full h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center gap-3 text-[#F8E5D8] transition-all hover:bg-white/10 active:scale-[0.98]"
            >
              <Mail className="w-5 h-5" />
              <span className="font-bold tracking-wide">Email Login</span>
            </button>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="relative z-10 pb-8 text-center px-6"
        >
          <p className="text-[10px] text-[#F6EDEE]/30 leading-relaxed uppercase tracking-widest">
            By continuing, you agree to our{" "}
            <button onClick={() => setCurrentScreen("terms-of-service")} className="underline hover:text-[#F6EDEE]/60">Terms</button>
            {" & "}
            <button onClick={() => setCurrentScreen("privacy-policy")} className="underline hover:text-[#F6EDEE]/60">Privacy Policy</button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
