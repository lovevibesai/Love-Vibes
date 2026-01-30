"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/app-context"
import {
  Settings,
  Edit3,
  Heart,
  Users,
  MapPin,
  Video,
  Shield,
  Bell,
  Eye,
  LogOut,
  ChevronRight,
  CheckCircle,
  Coins,
  ShieldCheck,
  X,
  Zap,
  Sparkles,
} from "lucide-react"
import { TrustScore } from "../trust-score"
import { cn } from "@/lib/utils"
import { VerificationModal } from "../verification/verification-modal"

export function ProfileScreen() {
  const { user, mode, setMode, matches, setCurrentScreen, setIsOnboarded, setUser } = useApp()
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleLogout = () => {
    setIsOnboarded(false)
    localStorage.removeItem("is_onboarded")
    localStorage.removeItem("auth_token")
    setCurrentScreen("welcome")
  }

  const profileUser = user || {
    name: "Your Profile",
    age: 0,
    photoUrl: "",
    bio: "Complete your profile to get started",
    trustScore: 0,
    isVerified: false,
    credits: 0,
    videoUrl: null,
    userLocation: "",
    mode: "dating" as const,
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto antialiased">
      {/* Premium Mesh Header */}
      <div
        className={cn(
          "relative h-48 flex flex-col justify-end px-6 pb-6 transition-all duration-700",
          mode === "dating" ? "mesh-gradient-dating" : "mesh-gradient-friendship"
        )}
      >
        <div className="flex items-center justify-between w-full">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 rounded-2xl glass-elevated flex items-center gap-2 transition-all"
            aria-label="View as member"
          >
            <Eye className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white tracking-tight">PREVIEW</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentScreen("profile-setup")}
            className="w-10 h-10 rounded-2xl glass-elevated flex items-center justify-center"
            aria-label="Edit profile"
          >
            <Edit3 className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Profile Photo - Overlapping */}
      <div className="px-6 -mt-16 relative z-20 pointer-events-none">
        <div className="relative inline-block pointer-events-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-[40px] border-4 border-background overflow-hidden shadow-2xl bg-muted"
          >
            <img
              src={user.photoUrl || "/placeholder.svg"}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          {user.isVerified && (
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-background flex items-center justify-center shadow-xl">
              <div className="w-8 h-8 rounded-xl bg-[#E6C38A] flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#2A0D1F]" fill="currentColor" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Name & Bio Area */}
      <div className="px-6 mt-4">
        <h1 className="text-3xl font-black text-foreground tracking-tight leading-none">
          {user.name}, {user.age}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm font-medium leading-relaxed">
          {user.bio}
        </p>
      </div>

      {/* Stats - Premium Cards */}
      <div className="px-6 mt-8">
        <div className="flex gap-4">
          <div className="flex-1 bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center">
            <Heart className="w-6 h-6 text-primary mb-1.5" fill="currentColor" />
            <span className="text-xl font-black text-foreground">{matches.length}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Matches</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentScreen("credits")}
            className="flex-1 bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center group"
          >
            <Coins className="w-6 h-6 text-[#E6C38A] mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-black text-foreground">{user.credits}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Credits</span>
          </motion.button>
          <div className="flex-1 bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center">
            <div className="scale-110">
              <TrustScore score={user.trustScore} size="md" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">Trust</span>
          </div>
        </div>

        {/* Boost - High Intensity Interaction */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen("boost")}
          className="w-full mt-4 p-5 rounded-[32px] shadow-lg shadow-primary/20 flex items-center justify-center gap-3 group relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1A0814 0%, #2A0D1F 50%, #7A1F3D 100%)",
          }}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Zap className="w-5 h-5 text-[#E6C38A] animate-pulse" fill="currentColor" />
          <span className="font-black text-white uppercase tracking-wider text-sm">Boost Profile (30 min)</span>
          {/* Subtle gold border glow */}
          <div className="absolute inset-0 border border-[#E6C38A]/30 rounded-[32px] pointer-events-none" />
        </motion.button>
      </div>

      {/* Mode Switcher - Custom Design */}
      <div className="px-6 mt-10">
        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">
          EXPERIENCE MODE
        </h2>
        <div className="bg-muted/30 p-1.5 rounded-[24px] flex shadow-inner border border-border/50">
          <button
            onClick={() => setMode("dating")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-all duration-500",
              mode === "dating"
                ? "bg-white text-black shadow-xl"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className="w-5 h-5" fill={mode === "dating" ? "currentColor" : "none"} />
            <span className="font-bold text-sm">DATING</span>
          </button>
          <button
            onClick={() => setMode("friendship")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-all duration-500",
              mode === "friendship"
                ? "bg-white text-black shadow-xl"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-5 h-5" />
            <span className="font-bold text-sm">FRIENDSHIP</span>
          </button>
        </div>
      </div>

      {/* Verification Card - Glassmorphic Rose */}
      {!user.isVerified && (
        <div className="px-6 mt-10">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsVerificationModalOpen(true)}
            className="w-full bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-[32px] p-6 flex items-center gap-5 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-all text-left group"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
              <ShieldCheck className="w-7 h-7 text-rose-500" />
            </div>
            <div className="flex-1">
              <p className="font-black text-foreground tracking-tight">GET VERIFIED</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Increase trust and priority reach</p>
            </div>
            <ChevronRight className="w-5 h-5 text-rose-500/50" />
          </motion.button>
        </div>
      )}

      {/* Elite Features Grid */}
      <div className="px-6 mt-10">
        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">
          ELITE CAPABILITIES
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentScreen("innovative-features")}
            className="bg-card/40 backdrop-blur-md border border-border/30 rounded-[32px] p-5 flex flex-col items-center gap-3 hover:bg-card transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Innovative</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentScreen("referral-dashboard")}
            className="bg-card/40 backdrop-blur-md border border-border/30 rounded-[32px] p-5 flex flex-col items-center gap-3 hover:bg-card transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
              <Users className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">The Circle</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentScreen("identity-signature")}
            className="bg-card/40 backdrop-blur-md border border-border/30 rounded-[32px] p-5 flex flex-col items-center gap-3 hover:bg-card transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#7A1F3D]/10 flex items-center justify-center group-hover:bg-[#7A1F3D]/20 transition-colors">
              <Zap className="w-6 h-6 text-[#7A1F3D]" />
            </div>
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Signature</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentScreen("chemistry-test")}
            className="bg-card/40 backdrop-blur-md border border-border/30 rounded-[32px] p-5 flex flex-col items-center gap-3 hover:bg-card transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Chemistry</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentScreen("vibe-windows")}
            className="bg-card/40 backdrop-blur-md border border-border/30 rounded-[32px] p-5 flex flex-col items-center gap-3 hover:bg-card transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Eye className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Vibe Windows</span>
          </motion.button>
        </div>
      </div>

      {/* Video Intro - Large Format */}
      <div className="px-6 mt-10">
        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">
          PERSONALITY SNAPSHOT
        </h2>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen("video")}
          className="w-full bg-card/60 backdrop-blur-xl border border-border/50 rounded-[32px] p-6 shadow-sm flex items-center gap-5 hover:bg-card transition-colors group"
        >
          <div className="w-20 h-20 rounded-2xl bg-muted/50 overflow-hidden relative flex items-center justify-center">
            {user.photoUrl && <img src={user.photoUrl} alt="Profile" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" />}
            <Video className="w-8 h-8 text-primary relative z-10" />
            <div className="absolute inset-0 bg-primary/10 animate-pulse" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-black text-foreground tracking-tight uppercase text-sm">
              {user.videoUrl ? "REFINE VIDEO" : "ADD VIDEO INTRO"}
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Stand out with a high-vibe snapshot
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.button>
      </div>

      {/* Settings List */}
      <div className="px-6 mt-10 pb-32">
        <div className="bg-card/40 backdrop-blur-md rounded-[32px] border border-border/30 overflow-hidden shadow-sm">
          <SettingsItem icon={MapPin} label="Location" value={user.userLocation || "Location Not Set"} onClick={() => setCurrentScreen("settings")} />
          <SettingsItem icon={Eye} label="Visibility" value="All Members" onClick={() => setCurrentScreen("settings")} />
          <SettingsItem icon={LogOut} label="Log Out" color="destructive" onClick={handleLogout} />
        </div>
      </div>

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSuccess={() => {
          if (profileUser) {
            setUser({ ...user, isVerified: true, trustScore: Math.min(100, (user.trustScore || 0) + 20) })
          }
        }}
      />
    </div>
  )
}

function SettingsItem({
  icon: Icon,
  label,
  value,
  color,
  onClick
}: {
  icon: any
  label: string
  value?: string
  color?: "default" | "destructive"
  onClick?: () => void
}) {
  return (
    <motion.button
      whileTap={{ backgroundColor: "rgba(0,0,0,0.05)" }}
      onClick={onClick}
      className="w-full flex items-center gap-5 px-6 py-5 border-b border-border/30 last:border-0 transition-colors"
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
        color === "destructive" ? "bg-rose-500/10" : "bg-muted/50"
      )}>
        <Icon className={cn("w-5 h-5", color === "destructive" ? "text-rose-500" : "text-foreground/70")} />
      </div>
      <div className="flex-1 text-left">
        <span className={cn("font-bold text-sm tracking-tight", color === "destructive" ? "text-rose-500" : "text-foreground")}>
          {label}
        </span>
        {value && <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{value}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
    </motion.button>
  )
}
