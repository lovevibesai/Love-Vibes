"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Check,
  Mail,
  Fingerprint,
  ShieldCheck,
  Zap,
  Lock,
  Shield
} from "lucide-react"
import { toast } from "sonner"

export function PhoneScreen() {
  const { setCurrentScreen, loginWithEmail, verifyEmailOTP, registerPasskey, loginWithPasskey } = useApp()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"email" | "method" | "otp">("email")
  const [loading, setLoading] = useState(false)

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isOtpValid = otp.length === 6

  const [resendTimer, setResendTimer] = useState(0)

  // Manage resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendTimer])

  const handleEmailSubmit = async () => {
    if (isEmailValid) {
      setLoading(true)
      try {
        await loginWithEmail(email)
        setStep("method")
      } catch (e: any) {
        console.error("DIAGNOSTIC: OTP Error", e)
        toast.error(`[Build 101] Fault: ${e.message || "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleResendOtp = async () => {
    if (isEmailValid && resendTimer === 0) {
      setLoading(true)
      try {
        await loginWithEmail(email)
        toast.success("New decryption code transmitted.")
        setResendTimer(60)
      } catch (e: any) {
        toast.error(e.message || "Failed to resend code")
      } finally {
        setLoading(false)
      }
    }
  }

  const handlePasskeyLogin = async () => {
    setLoading(true)
    try {
      // Robust attempt: Try to login with existing passkey first
      await loginWithPasskey(email)
    } catch (e: any) {
      console.warn("Passkey login failed, trying registration or fallback:", e)

      // If it's a 'NotAllowedError' (user cancelled), don't show scary error
      if (e.name === 'NotAllowedError' || e.name === 'AbortError') {
        toast.info("Secure login cancelled.")
        return
      }

      // Reverting to OTP is the most robust fallback
      toast.error("Biometric link not found. Using secure code instead.")
      setStep("otp")
      // Trigger first OTP automatically when falling back
      loginWithEmail(email).catch(console.error)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async () => {
    if (isOtpValid) {
      setLoading(true)
      try {
        await verifyEmailOTP(email, otp)
      } catch (e: any) {
        toast.error(e.message || "Invalid decryption code")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#1A0814] overflow-hidden relative font-sans select-none">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-full h-full rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, #7A1F3D, transparent)' }}
        />
      </div>

      {/* Modern Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 border-b border-white/5 bg-black/5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (step === "email") setCurrentScreen("welcome")
            else if (step === "method") setStep("email")
            else setStep("method")
          }}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all shadow-xl"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black tracking-[0.4em] uppercase text-[#D4AF37] mb-1">Your Vault</span>
          <span className="text-xs font-bold tracking-widest uppercase text-white/40">Step 01 / 05</span>
        </div>
        <div className="w-12" />
      </header>

      {/* Progress Line */}
      <div className="relative h-[2px] w-full bg-white/5">
        <motion.div
          initial={{ width: "20%" }}
          animate={{ width: step === "otp" ? "35%" : step === "method" ? "25%" : "20%" }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#D4AF37] to-[#7A1F3D] shadow-[0_0_10px_#D4AF37]"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10 px-8 pt-12 pb-32 space-y-12 no-scrollbar">

        <AnimatePresence mode="wait">
          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="space-y-3">
                <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Your Vault</h1>
                <p className="text-sm text-white/40 font-medium tracking-wide">Enter your email to begin.</p>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full h-18 bg-white/[0.03] border border-white/10 rounded-[24px] pl-14 pr-6 text-xl text-white font-bold placeholder:text-white/10 focus:border-[#D4AF37]/50 focus:bg-[#D4AF37]/5 focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all"
                  />
                  {isEmailValid && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                    >
                      <Check className="w-4 h-4 text-[#1A0814]" strokeWidth={4} />
                    </motion.div>
                  )}
                </div>

                {/* Cyber Security Note */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-[28px] bg-gradient-to-br from-[#7A1F3D]/10 to-transparent border border-[#7A1F3D]/20 flex gap-5 items-start relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-[#D4AF37]/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                  <div className="w-12 h-12 rounded-2xl bg-[#7A1F3D]/20 flex items-center justify-center shrink-0 border border-[#7A1F3D]/30">
                    <ShieldCheck className="w-7 h-7 text-[#D4AF37] animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#7A1F3D] uppercase tracking-widest">Total Privacy</p>
                    <p className="text-sm text-white/60 leading-relaxed font-medium">Safe. Secure. Private. Your data is protected by <span className="text-white font-black">ULTRA-SECURE</span> technology.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {step === "method" && (
            <motion.div
              key="method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="space-y-3">
                <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Choose Way</h1>
                <p className="text-sm text-white/40 font-medium tracking-wide">Select your primary login method.</p>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePasskeyLogin}
                  className="w-full p-6 bg-white/[0.03] border border-[#D4AF37]/30 rounded-[32px] flex items-center gap-6 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-18 h-18 rounded-3xl bg-[#D4AF37] flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
                    <Fingerprint className="w-10 h-10 text-[#1A0814]" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black text-white tracking-tight">Biometric Login</h3>
                    <p className="text-xs text-white/40 font-medium mt-1">FaceID or TouchID</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("otp")}
                  className="w-full p-6 bg-white/[0.02] border border-white/5 rounded-[32px] flex items-center gap-6 group"
                >
                  <div className="w-18 h-18 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:text-white group-hover:bg-white/10 transition-all">
                    <Mail className="w-10 h-10 text-white/20" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black text-white tracking-tight">Email Code</h3>
                    <p className="text-xs text-white/40 font-medium mt-1">Send a 6-digit key</p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 text-center"
            >
              <div className="space-y-3">
                <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Enter Code</h1>
                <p className="text-sm text-white/40 font-medium tracking-wide">Sent to <span className="text-white font-bold">{email}</span></p>
              </div>

              <div className="space-y-8">
                <div className="relative group">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000 000"
                    className="w-full h-24 bg-white/[0.03] border border-white/10 rounded-[32px] text-5xl text-center font-black tracking-[0.3em] text-[#D4AF37] focus:border-[#D4AF37]/50 focus:bg-[#D4AF37]/5 outline-none transition-all shadow-inner"
                    maxLength={6}
                  />
                  <div className="absolute inset-0 rounded-[32px] border border-[#D4AF37]/20 pointer-events-none group-focus-within:animate-pulse" />
                </div>

                <button
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || loading}
                  className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity disabled:opacity-20"
                >
                  {resendTimer > 0 ? `Wait ${resendTimer}s` : "Send code again"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Futuristic Fixed Footer CTA */}
      <motion.div
        layout
        className="fixed bottom-0 left-0 right-0 p-8 pb-10 bg-gradient-to-t from-[#1A0814] via-[#1A0814]/90 to-transparent z-30"
      >
        <div className="max-w-md mx-auto relative group">
          {/* Button Outer Glow */}
          {(step === "email" || step === "otp") && (
            <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-[#7A1F3D] rounded-[24px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
          )}

          {step === "email" && (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEmailSubmit}
              disabled={!isEmailValid || loading}
              className="w-full h-18 rounded-[22px] bg-white text-[#1A0814] font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 relative overflow-hidden disabled:opacity-30"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-[#1A0814] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {/* Secure Badge */}
                  <div className="absolute top-0 right-0 p-2">
                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em]">MILITARY-GRADE</span>
                  </div>

                  <Zap className="w-5 h-5 fill-current" />
                  Start Entry
                </>
              )}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent skew-x-[30deg]"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </motion.button>
          )}

          {step === "otp" && (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOtpSubmit}
              disabled={!isOtpValid || loading}
              className="w-full h-18 rounded-[22px] bg-[#D4AF37] text-[#1A0814] font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(212,175,55,0.2)] flex items-center justify-center gap-4 relative overflow-hidden disabled:opacity-30"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-[#1A0814] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {/* Secure Badge */}
                  <div className="absolute top-0 right-0 p-2">
                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em]">ULTRA-SECURE</span>
                  </div>

                  <Lock className="w-5 h-5" />
                  Verify Key
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div >
    </div >
  )
}
