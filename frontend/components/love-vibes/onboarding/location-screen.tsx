"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Search,
  Zap,
  Globe,
  Satellite,
  Radar
} from "lucide-react"
import { cn } from "@/lib/utils"
import { EliteGuidance } from "../ui/elite-guidance"

export function LocationScreen() {
  const { setCurrentScreen, setIsOnboarded } = useApp()
  const [showManual, setShowManual] = useState(false)
  const [city, setCity] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEnableLocation = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsOnboarded(true)
      setCurrentScreen("feed")
    }, 1800)
  }

  const handleManualSubmit = () => {
    if (city.length > 0) {
      setIsOnboarded(true)
      setCurrentScreen("feed")
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#1A0814] overflow-hidden relative font-sans select-none">
      {/* Deep Space Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute inset-0 w-full h-full rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, #7A1F3D, transparent)' }}
        />
      </div>

      {/* Elite Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 border-b border-white/5 bg-black/5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentScreen("video")}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all shadow-xl"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black tracking-[0.4em] uppercase text-[#D4AF37] mb-1">Proximity Protocol</span>
          <span className="text-xs font-bold tracking-widest uppercase text-white/40">Step 05 / 05</span>
        </div>
        <EliteGuidance
          feature="Proximity Protocol"
          how="Scans nearby S2 cells for active vibrational signatures within your sovereign radius."
          why="Physical presence is the ultimate truth-anchor in a world of digital noise."
          value="Secure, real-time connections without compromising your exact coordinates."
        />
      </header>

      {/* Progress Line */}
      <div className="relative h-[2px] w-full bg-white/5">
        <motion.div
          initial={{ width: "85%" }}
          animate={{ width: "100%" }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#D4AF37] to-[#7A1F3D] shadow-[0_0_10px_#D4AF37]"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10 px-8 pt-12 pb-32 space-y-12 no-scrollbar flex flex-col items-center">

        <div className="space-y-3 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-2"
          >
            <Globe className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Proximity Sync</span>
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Find Vibes Nearby</h1>
          <p className="text-sm text-white/40 font-medium tracking-wide">Establish your presence in the sovereign field.</p>
        </div>

        {/* Holographic Radar Animation */}
        <div className="relative w-64 h-64 mb-20">
          {/* Pulsing Rings */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border border-[#D4AF37]/20"
            />
          ))}

          {/* Radar Sweep */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t-2 border-[#D4AF37]/40 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7A1F3D] to-[#1A0814] border border-[#D4AF37]/40 flex items-center justify-center shadow-[0_0_40px_rgba(122,31,61,0.5)] z-10"
            >
              <Satellite className="w-10 h-10 text-[#D4AF37]" />
            </motion.div>
          </div>

          {/* Signal Points */}
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute top-10 right-10 w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]"
          />
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            className="absolute bottom-20 left-10 w-1.5 h-1.5 rounded-full bg-[#7A1F3D] shadow-[0_0_10px_#7A1F3D]"
          />
        </div>

        {showManual ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-6"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
              </div>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search for your city..."
                className="w-full h-18 bg-white/[0.03] border border-white/10 rounded-[24px] pl-14 pr-6 text-xl text-white font-bold placeholder:text-white/10 focus:border-[#D4AF37]/50 focus:bg-[#D4AF37]/5 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setShowManual(false)}
              className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] block mx-auto opacity-40 hover:opacity-100 transition-opacity"
            >
              Use my location
            </button>
          </motion.div>
        ) : (
          <div className="w-full space-y-6 flex flex-col items-center">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEnableLocation}
              disabled={isLoading}
              className="w-full max-w-sm h-18 rounded-[24px] bg-[#D4AF37] text-[#1A0814] font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(212,175,55,0.2)] flex items-center justify-center gap-4 relative overflow-hidden group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-[#1A0814] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Navigation className="w-5 h-5" />
                  Turn on GPS
                </>
              )}
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[30deg]"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </motion.button>

            <button
              onClick={() => setShowManual(true)}
              className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] hover:text-[#D4AF37] transition-colors"
            >
              Enter Coordinates Manually
            </button>
          </div>
        )}
      </div>

      {/* Final Sync Summary */}
      <AnimatePresence>
        {showManual && city.length > 0 && (
          <motion.div
            initial={{ y: 150 }}
            animate={{ y: 0 }}
            exit={{ y: 150 }}
            className="fixed bottom-0 left-0 right-0 p-8 pb-10 bg-gradient-to-t from-[#1A0814] via-[#1A0814]/95 to-transparent z-40"
          >
            <div className="max-w-md mx-auto">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleManualSubmit}
                className="w-full h-18 rounded-[22px] bg-white text-[#1A0814] font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 relative overflow-hidden"
              >
                <Zap className="w-5 h-5 fill-current" />
                Find Vibes
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
