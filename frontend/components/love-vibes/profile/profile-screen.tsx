import { useState } from "react"
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
} from "lucide-react"
import { TrustScore } from "../trust-score"
import { cn } from "@/lib/utils"
import { VerificationModal } from "../verification/verification-modal"

export function ProfileScreen() {
  const { currentUser, mode, setMode, matches, setCurrentScreen, setIsOnboarded, setCurrentUser } = useApp()
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleLogout = () => {
    setIsOnboarded(false)
    setCurrentScreen("welcome")
  }

  const user = currentUser || {
    name: "Alex",
    age: 28,
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    bio: "Coffee enthusiast and adventure seeker. Love hiking on weekends!",
    trustScore: 72,
    isVerified: false,
    credits: 100,
    videoUrl: null,
    mode: "dating" as const,
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Header with Gradient */}
      <div
        className="relative h-32"
        style={{
          background: mode === "dating"
            ? "linear-gradient(160deg, #D4635E 0%, #6B3358 50%, #3D1F3D 100%)"
            : "linear-gradient(160deg, #D4AF37 0%, #D4635E 50%, #6B3358 100%)"
        }}
      >
        <button
          onClick={() => setShowPreview(true)}
          className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-2 hover:bg-white/30 transition-colors"
          aria-label="View as member"
        >
          <Eye className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">View as Member</span>
        </button>
        <button
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          aria-label="Edit profile"
        >
          <Edit3 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Profile Photo */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden shadow-modal">
            <img
              src={user.photoUrl || "/placeholder.svg"}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          {user.isVerified && (
            <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-card flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6 text-gold" fill="currentColor" />
            </div>
          )}
        </div>
      </div>

      {/* Name & Info */}
      <div className="px-6 mt-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">{user.name}, {user.age}</h1>
        </div>
        <p className="text-muted-foreground mt-1">{user.bio}</p>
      </div>

      {/* Stats */}
      <div className="px-6 mt-6">
        <div className="flex gap-3">
          <div className="flex-1 bg-card rounded-xl p-4 shadow-card flex flex-col items-center">
            <Heart className="w-6 h-6 text-[#5A2A4A] mb-1" fill="currentColor" />
            <span className="text-2xl font-bold text-foreground">{matches.length}</span>
            <span className="text-xs text-muted-foreground">Matches</span>
          </div>
          <button
            onClick={() => setCurrentScreen("credits")}
            className="flex-1 bg-card rounded-xl p-4 shadow-card flex flex-col items-center hover:bg-card-elevated transition-colors"
          >
            <Coins className="w-6 h-6 text-gold mb-1" />
            <span className="text-2xl font-bold text-foreground">{user.credits}</span>
            <span className="text-xs text-muted-foreground">Credits</span>
          </button>
          <div className="flex-1 bg-card rounded-xl p-4 shadow-card flex flex-col items-center">
            <TrustScore score={user.trustScore} size="md" />
            <span className="text-xs text-muted-foreground mt-1">Trust</span>
          </div>
        </div>

        {/* Boost Button */}
        <button
          onClick={() => setCurrentScreen("boost")}
          className="w-full mt-3 p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
        >
          <Zap className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" />
          <span className="font-semibold text-white">Boost Profile (30 min)</span>
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="px-6 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Your Mode
        </h2>
        <div className="bg-card rounded-xl p-1 flex shadow-card">
          <button
            onClick={() => setMode("dating")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all",
              mode === "dating"
                ? "text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={mode === "dating" ? {
              background: "linear-gradient(160deg, #D4635E 0%, #6B3358 50%, #3D1F3D 100%)"
            } : undefined}
          >
            <Heart className="w-5 h-5" fill={mode === "dating" ? "currentColor" : "none"} />
            <span className="font-medium">Dating</span>
          </button>
          <button
            onClick={() => setMode("friendship")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all",
              mode === "friendship"
                ? "text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={mode === "friendship" ? {
              background: "linear-gradient(160deg, #D4AF37 0%, #D4635E 50%, #6B3358 100%)"
            } : undefined}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Friendship</span>
          </button>
        </div>
      </div>

      {/* Verification Prompt */}
      {!user.isVerified && (
        <div className="px-6 mt-6">
          <button
            onClick={() => setIsVerificationModalOpen(true)}
            className="w-full bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-4 hover:from-rose-500/20 hover:to-purple-500/20 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-rose-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">Get Verified</p>
              <p className="text-xs text-muted-foreground">Boost your trust score and get more matches</p>
            </div>
            <ChevronRight className="w-5 h-5 text-rose-500" />
          </button>
        </div>
      )}

      {/* Video Intro */}
      <div className="px-6 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Video Intro
        </h2>
        <button className="w-full bg-card rounded-xl p-4 shadow-card flex items-center gap-4 hover:bg-card-elevated transition-colors">
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
            <Video className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">
              {user.videoUrl ? "Update your video" : "Add a video intro"}
            </p>
            <p className="text-sm text-muted-foreground">
              Show your personality in 15 seconds
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Settings */}
      <div className="px-6 mt-6 pb-24">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Settings
        </h2>
        <div className="bg-card rounded-xl shadow-card overflow-hidden divide-y divide-border">
          <SettingsItem icon={MapPin} label="Location" value="San Francisco, CA" onClick={() => setCurrentScreen("settings")} />
          <SettingsItem icon={Eye} label="Visibility" value="Visible to all" onClick={() => setCurrentScreen("settings")} />
          <SettingsItem icon={Bell} label="Notifications" value="Enabled" onClick={() => setCurrentScreen("settings")} />
          <SettingsItem icon={Shield} label="Privacy & Safety" onClick={() => setCurrentScreen("settings")} />
          <SettingsItem icon={Settings} label="Account Settings" onClick={() => setCurrentScreen("settings")} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-destructive/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <span className="font-medium text-destructive">Log Out</span>
          </button>
        </div>
      </div>

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSuccess={() => {
          if (currentUser) {
            setCurrentUser({ ...currentUser, isVerified: true, trustScore: Math.min(100, (currentUser.trustScore || 0) + 20) })
          }
        }}
      />

      {/* Profile Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Preview Header */}
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-semibold text-foreground">Profile Preview</h2>
                <p className="text-xs text-muted-foreground">How others see you</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Preview Content - Simulates ExpandedProfile */}
            <div className="p-6">
              {/* Photo */}
              <div className="relative h-96 bg-muted rounded-2xl overflow-hidden mb-6">
                <img
                  src={user.photoUrl || "/placeholder.svg"}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
                {user.isVerified && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Name & Age */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                  <span className="text-2xl text-muted-foreground">{user.age}</span>
                </div>
                <TrustScore score={user.trustScore} size="lg" />
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-foreground mb-6 leading-relaxed">{user.bio}</p>
              )}

              {/* Video Intro Badge */}
              {user.videoUrl && (
                <div className="mb-6 p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-3">
                  <Video className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Has video intro</span>
                </div>
              )}

              {/* Info Note */}
              <div className="p-4 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground text-center">
                  This is how your profile appears to other members in the feed and when they view your full profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsItem({
  icon: Icon,
  label,
  value,
  onClick
}: {
  icon: typeof Settings
  label: string
  value?: string
  onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1 text-left">
        <span className="font-medium text-foreground">{label}</span>
        {value && (
          <p className="text-sm text-muted-foreground">{value}</p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  )
}
