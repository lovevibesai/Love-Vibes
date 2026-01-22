"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  Coins,
  Gift,
  Sparkles,
  Crown,
  Check,
  Shield,
  Zap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PremiumModal } from "@/components/love-vibes/premium-modal"

interface CreditPackage {
  id: string
  credits: number
  price: number
  popular?: boolean
  bonus?: number
}

const creditPackages: CreditPackage[] = [
  { id: "starter", credits: 50, price: 4.99 },
  { id: "popular", credits: 150, price: 9.99, popular: true, bonus: 25 },
  { id: "value", credits: 350, price: 19.99, bonus: 75 },
  { id: "premium", credits: 800, price: 39.99, bonus: 200 },
]

export function CreditsStore() {
  const { setCurrentScreen, user, updateUser } = useApp()
  const [selectedPackage, setSelectedPackage] = useState<string | null>("popular")
  const [isPurchasing, setIsPurchasing] = useState(false)

  const handlePurchase = () => {
    if (!selectedPackage) return

    setIsPurchasing(true)
    const pkg = creditPackages.find(p => p.id === selectedPackage)

    // Simulate purchase
    setTimeout(() => {
      if (pkg) {
        const totalCredits = pkg.credits + (pkg.bonus || 0)
        updateUser({ credits: (user.credits || 0) + totalCredits })
      }
      setIsPurchasing(false)
      setCurrentScreen("profile")
    }, 1500)
  }

  return (
    <div className="h-full flex flex-col bg-[#1A0814] overflow-hidden relative font-sans">
      {/* Deep Space Background with Organic Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] right-[-10%] w-[100%] h-[70%] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, #7A1F3D, transparent)' }}
        />
        <div className="absolute bottom-[-10%] left-[-20%] w-[90%] h-[60%] rounded-full blur-[130px]" style={{ background: 'radial-gradient(circle, #2A0D1F, transparent)' }} />
      </div>

      {/* Ultra-Modern Header */}
      <header className="relative z-20 flex items-center justify-between px-8 py-6 backdrop-blur-xl bg-black/20 border-b border-white/5">
        <motion.button
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentScreen("profile")}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          <ChevronLeft className="w-7 h-7" />
        </motion.button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#D4AF37] mb-1">Vault</span>
          <span className="text-sm font-bold tracking-widest uppercase text-white/90">Elite Credits</span>
        </div>
        <div className="w-12" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10 px-8 pt-8 pb-32 space-y-12 no-scrollbar">

        {/* Holographic 24K Gold Card - Balance */}
        <motion.section
          initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="relative group perspective-1000"
        >
          <div className="relative overflow-hidden rounded-[40px] p-10 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border border-white/10 min-h-[220px] flex flex-col justify-center select-none"
            style={{
              background: "linear-gradient(135deg, #1A0814 0%, #2A0D1F 40%, #7A1F3D 100%)",
            }}
          >
            {/* Dynamic Reflection (Holographic Layer) */}
            <motion.div
              animate={{
                x: ['-100%', '200%'],
                opacity: [0, 0.5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
            />

            {/* Texture/Grain */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-6 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#FFD700] to-[#B8860B] p-[2px] shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                >
                  <div className="w-full h-full rounded-[22px] bg-[#1A0814] flex items-center justify-center">
                    <Coins className="w-8 h-8 text-[#FFD700]" strokeWidth={2.5} />
                  </div>
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/60 mb-1">Available Assets</span>
                  <span className="text-7xl font-black tracking-tighter leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                    {user.credits || 0}
                  </span>
                </div>
              </div>
              <div className="w-full h-[1px] bg-white/10 mb-6" />
              <div className="flex justify-between items-center w-full">
                <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase">Private Encryption Active</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/40 shadow-[0_0_5px_#D4AF37]" />)}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Elite Floating Tokens Grid */}
        <section>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Gift className="w-6 h-6" />, label: "Gifts", bg: "bg-pink-500/10", border: "border-pink-500/30", glow: "shadow-pink-500/20" },
              { icon: <Sparkles className="w-6 h-6" />, label: "Super", bg: "bg-[#D4AF37]/10", border: "border-[#D4AF37]/30", glow: "shadow-[#D4AF37]/20" },
              { icon: <Crown className="w-6 h-6" />, label: "Boost", bg: "bg-purple-500/10", border: "border-purple-500/30", glow: "shadow-purple-500/20" },
            ].map((token, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, type: "spring" }}
                whileHover={{ y: -8, scale: 1.05 }}
                className={`flex flex-col items-center p-5 rounded-[28px] ${token.bg} border ${token.border} backdrop-blur-md shadow-xl ${token.glow} relative overflow-hidden group`}
              >
                {/* Dynamic Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mb-3 text-white transition-transform duration-500 group-hover:scale-110">{token.icon}</div>
                <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">{token.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Next-Gen Package Listing */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 group">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-[#D4AF37] transition-colors">Digital Acquisitions</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="grid grid-cols-1 gap-5">
            {creditPackages.map((pkg, idx) => (
              <motion.button
                key={pkg.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx, type: "spring" }}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`relative flex items-center justify-between p-7 rounded-[32px] transition-all duration-500 isolate group overflow-hidden ${selectedPackage === pkg.id
                  ? "bg-white/5 shadow-[0_20px_40px_-10px_rgba(212,175,55,0.15)] scale-[1.02]"
                  : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]"
                  }`}
              >
                {/* Liquid Selection Highlight */}
                {selectedPackage === pkg.id && (
                  <motion.div
                    layoutId="liquid-bg"
                    className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 via-[#2A0D1F]/5 to-transparent z-[-1]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}

                {/* Left Side: Credits & Visual */}
                <div className="flex items-center gap-6">
                  <div className={`relative w-16 h-16 rounded-[22px] flex items-center justify-center transition-all duration-500 shadow-inner ${selectedPackage === pkg.id ? "bg-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.5)]" : "bg-white/5"
                    }`}>
                    {selectedPackage === pkg.id ? (
                      <Check className="w-8 h-8 text-[#1A0814]" strokeWidth={3} />
                    ) : (
                      <Coins className="w-8 h-8 text-white/20 group-hover:text-white/50 transition-colors" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-3">
                      <p className="text-2xl font-black text-white tracking-tight leading-none">{pkg.credits}</p>
                      {pkg.bonus && (
                        <div className="px-2 py-1 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                          <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest leading-none">+{pkg.bonus} Extra</p>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-2">{pkg.id === "popular" ? "High Yield" : "Standard Tier"}</p>
                  </div>
                </div>

                {/* Right Side: Price */}
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[14px] font-black text-[#D4AF37] tracking-tighter">$</span>
                    <span className="text-3xl font-black text-white tracking-tighter leading-none">{pkg.price}</span>
                  </div>
                  <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em] mt-1">USD Order</p>
                </div>

                {/* 24K Badge for Popular */}
                {pkg.popular && (
                  <div className="absolute top-0 right-10 rotate-12 translate-y-[-50%] p-1 bg-[#D4AF37] text-[#1A0814] text-[8px] font-black uppercase tracking-widest rounded-md shadow-2xl">
                    Royal Selection
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Elite Security Note */}
        <div className="flex items-center justify-center gap-4 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
          <Shield className="w-4 h-4 text-[#D4AF37]" strokeWidth={2.5} />
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Encrypted Terminal Environment</p>
        </div>
      </div>

      {/* Futuristic Fixed Purchase Bar */}
      <AnimatePresence>
        {selectedPackage && (
          <motion.div
            initial={{ y: 150 }}
            animate={{ y: 0 }}
            exit={{ y: 150 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-0 left-0 right-0 p-8 pt-12 pb-10 bg-gradient-to-t from-black via-black/90 to-transparent z-30"
          >
            <div className="max-w-md mx-auto relative">
              {/* Button Inner Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-[#7A1F3D] rounded-[24px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="w-full h-18 rounded-[22px] bg-white text-[#1A0814] font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 relative overflow-hidden"
              >
                {isPurchasing ? (
                  <div className="w-6 h-6 border-4 border-[#1A0814] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    Initialize Transfer
                  </>
                )}

                {/* Micro-Shine */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent skew-x-[30deg]"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </motion.button>

              <div className="text-center mt-6">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Transaction Non-Reversible • 256-bit AES</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
