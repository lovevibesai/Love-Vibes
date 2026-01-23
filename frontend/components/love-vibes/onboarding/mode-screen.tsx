"use client"

import { useApp, type AppMode } from "@/lib/app-context"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Heart, Users, Zap, Sparkles, Target } from "lucide-react"

export function ModeScreen() {
  const { setCurrentScreen, mode, setMode } = useApp()

  const handleModeSelect = (selectedMode: AppMode) => {
    setMode(selectedMode)
    localStorage.setItem('current_screen', 'profile-setup');
    setCurrentScreen("profile-setup")
  }

  return (
    <div className="h-full flex flex-col bg-[#1A0814] overflow-hidden relative font-sans select-none">
      {/* Dynamic Aura Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[20%] right-[-20%] w-[120%] h-[80%] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, #7A1F3D, transparent)' }}
        />
      </div>

      {/* Elite Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 border-b border-white/5 bg-black/5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentScreen("phone")}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all shadow-xl"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black tracking-[0.4em] uppercase text-[#D4AF37] mb-1">Intent Engine</span>
          <span className="text-xs font-bold tracking-widest uppercase text-white/40">Step 02 / 05</span>
        </div>
        <div className="w-12" />
      </header>

      {/* Progress Line */}
      <div className="relative h-[2px] w-full bg-white/5">
        <motion.div
          initial={{ width: "35%" }}
          animate={{ width: "45%" }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#D4AF37] to-[#7A1F3D] shadow-[0_0_10px_#D4AF37]"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10 px-8 pt-12 pb-32 space-y-12 no-scrollbar">

        <div className="space-y-3 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-2"
          >
            <Target className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Select Mode</span>
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Choose Your Vibe</h1>
          <p className="text-sm text-white/40 font-medium tracking-wide">Select how you want to connect.</p>
        </div>

        <div className="space-y-6">
          {/* Dating Mode Card */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => handleModeSelect("dating")}
            className={cn(
              "w-full p-8 rounded-[40px] text-left transition-all relative overflow-hidden group perspective-1000",
              mode === "dating"
                ? "bg-white/[0.05] border border-[#D4AF37]/50 shadow-[0_20px_40px_-10px_rgba(212,175,55,0.15)]"
                : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10"
            )}
          >
            {/* Liquid Selection Highlight */}
            {mode === "dating" && (
              <motion.div
                layoutId="liquid-intent"
                className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 via-[#7A1F3D]/5 to-transparent z-[-1]"
              />
            )}

            <div className="relative z-10 flex items-center gap-6">
              <motion.div
                animate={mode === "dating" ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-inner",
                  mode === "dating" ? "bg-[#7A1F3D] shadow-[0_0_30px_rgba(122,31,61,0.5)]" : "bg-white/5"
                )}
              >
                <Heart className={cn("w-10 h-10 transition-colors", mode === "dating" ? "text-white" : "text-white/20")} fill={mode === "dating" ? "currentColor" : "none"} />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-white tracking-tight">Dating</h3>
                <p className="text-xs text-white/40 font-medium leading-relaxed mt-1">Seek romantic connections.</p>
              </div>
            </div>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none" />
          </motion.button>

          {/* Friendship Mode Card */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => handleModeSelect("friendship")}
            className={cn(
              "w-full p-8 rounded-[40px] text-left transition-all relative overflow-hidden group perspective-1000",
              mode === "friendship"
                ? "bg-white/[0.05] border border-[#D4AF37]/50 shadow-[0_20px_40px_-10px_rgba(212,175,55,0.15)]"
                : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10"
            )}
          >
            {/* Liquid Selection Highlight */}
            {mode === "friendship" && (
              <motion.div
                layoutId="liquid-intent"
                className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 via-[#7A1F3D]/5 to-transparent z-[-1]"
              />
            )}

            <div className="relative z-10 flex items-center gap-6">
              <motion.div
                animate={mode === "friendship" ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-inner",
                  mode === "friendship" ? "bg-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.5)]" : "bg-white/5"
                )}
              >
                <Users className={cn("w-10 h-10 transition-colors", mode === "friendship" ? "text-[#1A0814]" : "text-white/20")} />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-white tracking-tight">Friends</h3>
                <p className="text-xs text-white/40 font-medium leading-relaxed mt-1">Expand your social circle.</p>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none" />
          </motion.button>
        </div>

        {/* Security / Info Note */}
        <div className="flex items-center justify-center gap-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default pt-8">
          <Zap className="w-4 h-4 text-[#D4AF37]" strokeWidth={2.5} />
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Your choice is saved securely</p>
        </div>

      </div>
    </div>
  )
}
