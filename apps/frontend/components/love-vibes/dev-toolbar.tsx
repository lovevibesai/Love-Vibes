"use client"

import React, { useState } from "react"
import { useApp, type AppScreen } from "@/lib/app-context"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings,
  X,
  Smartphone,
  Heart,
  MessageCircle,
  User,
  Users,
  MapPin,
  Video,
  UserCircle,
  Phone,
  Sparkles,
  SlidersHorizontal,
  Coins,
  Shield,
  Zap,
  Terminal,
  Layers,
  UserCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

const screens: { id: AppScreen; label: string; icon: React.ReactNode; isOnboarding: boolean }[] = [
  // Onboarding
  { id: "welcome", label: "Start", icon: <Sparkles className="h-4 w-4" />, isOnboarding: true },
  { id: "phone", label: "Vault", icon: <Phone className="h-4 w-4" />, isOnboarding: true },
  { id: "mode", label: "Choice", icon: <Heart className="h-4 w-4" />, isOnboarding: true },
  { id: "profile-setup", label: "Profile", icon: <UserCircle className="h-4 w-4" />, isOnboarding: true },
  { id: "prompts", label: "Persona", icon: <MessageCircle className="h-4 w-4" />, isOnboarding: true },
  { id: "video", label: "Verify", icon: <Video className="h-4 w-4" />, isOnboarding: true },
  { id: "location", label: "Proximity", icon: <MapPin className="h-4 w-4" />, isOnboarding: true },
  // Production
  { id: "feed", label: "Feed", icon: <Layers className="h-4 w-4" />, isOnboarding: false },
  { id: "identity-signature", label: "Signature", icon: <Zap className="h-4 w-4 text-[#D4AF37]" />, isOnboarding: false },

  { id: "chemistry-test", label: "Chemistry", icon: <Heart className="h-4 w-4" />, isOnboarding: false },
  { id: "profile", label: "My Profile", icon: <User className="h-4 w-4" />, isOnboarding: false },
  { id: "innovative-features", label: "Innovative", icon: <Sparkles className="h-4 w-4" />, isOnboarding: false },
  { id: "referral-dashboard", label: "Circle", icon: <Users className="h-4 w-4" />, isOnboarding: false },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" />, isOnboarding: false },
]

export function DevToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentScreen, setCurrentScreen, setIsOnboarded, isOnboarded } = useApp()

  const forceUnlock = () => {
    setIsOnboarded(true)
    localStorage.setItem('is_onboarded', 'true')
    localStorage.setItem('current_screen', 'feed')
    setCurrentScreen('feed')
    setIsOpen(false)
  }

  const handleScreenChange = (screen: AppScreen, isOnboarding: boolean) => {
    setIsOnboarded(!isOnboarding)
    localStorage.setItem('is_onboarded', (!isOnboarding).toString());
    localStorage.setItem('current_screen', screen);
    setCurrentScreen(screen)
    setIsOpen(false)
  }

  if (process.env.NODE_ENV === "production") return null;

  console.log("DevToolbar Rendered", { currentScreen, isOnboarded })
  return (
    <div className="fixed z-[9999]">
      {/* Debug Fallback */}
      <button
        className="fixed bottom-10 right-4 bg-red-500 text-white p-2 z-[9999]"
        onClick={() => setIsOpen(true)}
      >
        DEBUG TOOLBAR
      </button>

      {/* Floating Elite Trigger */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-[#2A0D1F] to-[#7A1F3D] text-[#D4AF37] shadow-[0_10px_30px_rgba(42,13,31,0.4)] border border-[#D4AF37]/30 flex items-center justify-center transition-all group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Terminal className="h-6 w-6 relative z-10" />
        {/* Pulse effect */}
        <div className="absolute inset-0 rounded-2xl border border-[#D4AF37]/50 animate-ping opacity-20" />
      </motion.button>

      {/* Elite Control Center Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-[#1A0814]/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A0814] rounded-t-[48px] border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh] select-none overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Holographic Header */}
              <div className="relative overflow-hidden p-8 border-b border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent">
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent skew-x-12 pointer-events-none"
                />

                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[18px] bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                      <Layers className="h-6 w-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight">Elite Tools</h2>
                      <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Platform Control Center</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={forceUnlock}
                      className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-black uppercase tracking-widest text-[9px] hover:bg-[#D4AF37]/90 transition-all shadow-lg"
                    >
                      Force Unlock Features
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsOpen(false)}
                      className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </motion.button>
                  </div>
                </div>

                {/* Status Card - Holographic */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                    <span className="text-xs font-bold text-white/60">Active Session:</span>
                    <span className="text-xs font-black text-[#D4AF37] uppercase tracking-wider">{screens.find(s => s.id === currentScreen)?.label || currentScreen}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{isOnboarded ? "Main App" : "Setup Stream"}</span>
                  </div>
                </div>
              </div>

              {/* Grid Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar pb-12">

                {/* Onboarding Flow */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Phase I: Onboarding</span>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {screens.filter(s => s.isOnboarding).map((screen) => (
                      <motion.button
                        key={screen.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleScreenChange(screen.id, true)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group relative overflow-hidden",
                          currentScreen === screen.id && !isOnboarded
                            ? "bg-[#D4AF37]/10 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          currentScreen === screen.id && !isOnboarded ? "bg-[#D4AF37] text-[#1A0814]" : "bg-white/5 text-white/30 group-hover:text-white/60"
                        )}>
                          {screen.icon}
                        </div>
                        <span className={cn(
                          "text-xs font-bold transition-colors",
                          currentScreen === screen.id && !isOnboarded ? "text-white" : "text-white/40 group-hover:text-white/70"
                        )}>{screen.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </section>

                {/* Main App */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Phase II: Production</span>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {screens.filter(s => !s.isOnboarding).map((screen) => (
                      <motion.button
                        key={screen.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleScreenChange(screen.id, false)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                          currentScreen === screen.id && isOnboarded
                            ? "bg-[#7A1F3D]/10 border-[#7A1F3D] shadow-[0_0_20px_rgba(122,31,61,0.2)]"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          currentScreen === screen.id && isOnboarded ? "bg-[#7A1F3D] text-white" : "bg-white/5 text-white/30 group-hover:text-white/60"
                        )}>
                          {screen.icon}
                        </div>
                        <span className={cn(
                          "text-xs font-bold transition-colors",
                          currentScreen === screen.id && isOnboarded ? "text-white" : "text-white/40 group-hover:text-white/70"
                        )}>{screen.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </section>

                {/* Elite Actions */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Deep System Overrides</span>
                    <div className="h-[1px] flex-1 bg-[#D4AF37]/20" />
                  </div>
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        localStorage.setItem('auth_token', 'dev-token-bypass');
                        localStorage.setItem('user_id', 'tester-overlord');
                        localStorage.setItem('skip_splash', 'true');
                        window.location.reload();
                      }}
                      className="w-full p-6 bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 rounded-[28px] flex items-center gap-5 group relative overflow-hidden"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#D4AF37] flex items-center justify-center shadow-[0_0_30_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
                        <Zap className="h-7 w-7 text-[#1A0814]" fill="currentColor" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-white tracking-tight">Fast Onboard</p>
                        <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mt-1 opacity-60">Bypass Phase I - Auto Sync</p>
                      </div>
                      {/* Secure Badge */}
                      <div className="absolute top-4 right-4 p-1">
                        <span className="bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full text-[6px] font-black uppercase tracking-[0.1em] text-white/40">ULTRA-SECURE BYPASS</span>
                      </div>
                    </motion.button>


                  </div>
                </section>

                <p className="text-[9px] text-[#D4AF37]/30 text-center font-black uppercase tracking-[0.4em] pt-4">
                  End-to-End Encryption Terminal v1.0
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  )
}
