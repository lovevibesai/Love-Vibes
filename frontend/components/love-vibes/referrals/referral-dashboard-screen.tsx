"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { motion, AnimatePresence } from "framer-motion"
import {
    ChevronLeft,
    Sparkles,
    Zap,
    Trophy,
    UserPlus,
    Key,
    Heart,
    Moon,
    Copy,
    ShieldCheck,
    MessageSquareQuote,
    Star,
    Check,
    Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { api } from "@/lib/api-client"
import { EliteGuidance } from "@/components/love-vibes/ui/elite-guidance"

interface ReferralStats {
    referral_code: string
    total_referrals: number
    successful_signups: number
    available_keys: number
    referrals: Array<{
        name: string
        joined_at: number
        status: 'signed_up' | 'active' | 'premium'
    }>
}

const RECENT_ENDORSEMENTS: any[] = []

export function ReferralDashboardScreen() {
    const { setCurrentScreen, user } = useApp()
    const [stats, setStats] = useState<ReferralStats | null>(null)
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<'ambassador' | 'endorsements'>('ambassador')

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        if (!user?.id) return

        try {
            const data = await api.referrals.getStats(user.id)
            setStats(data)
        } catch (error) {
            console.error("Failed to load referral stats:", error)
            toast.error("Failed to load your Circle. Please try again.")
            setStats(null)
        }
    }

    const handleCopyCode = () => {
        if (stats) {
            navigator.clipboard.writeText(stats.referral_code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleCopyLink = () => {
        const link = `lovevibes.ai/vouch/${user?.name?.toLowerCase().replace(/\s+/g, '_') || 'elite'}_${stats?.referral_code || '88'}`
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = () => {
        const message = `Join me in The Resonance Circle on Love Vibes. Use my signature code ${stats?.referral_code} to unlock exclusive access. https://lovevibes.app/join/${stats?.referral_code}`
        if (navigator.share) {
            navigator.share({ text: message })
        } else {
            navigator.clipboard.writeText(message)
            toast.success("Invitation link copied to clipboard")
        }
    }

    const handleUnlock = async (type: 'intimate' | 'mystical') => {
        if (!stats || stats.available_keys < 1) {
            toast.error("Insufficient Scenario Keys. Invite more guests to replenish.")
            return
        }

        if (!user?.id) return

        try {
            const result = await api.referrals.unlock(user.id, type)
            if (result.success) {
                setStats(prev => prev ? ({ ...prev, available_keys: result.keysRemaining }) : null)
                toast.success(`Unlocking ${type === 'intimate' ? 'Intimate Match' : 'Mystical Connection'} Scenario...`)
                // In real app, navigate to scenario screen here
            }
        } catch (error) {
            toast.error("Failed to unlock scenario")
        }
    }

    if (!stats) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#1A0814] text-white">
                <div className="relative w-16 h-16 mb-6">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-t-2 border-r-2 border-[#D4AF37] rounded-full"
                    />
                    <div className="absolute inset-2 border-b-2 border-l-2 border-[#7A1F3D] rounded-full opacity-50" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] animate-pulse">Accessing The Circle...</p>
            </div>
        )
    }

    return (
        <div className="h-screen bg-[#1A0814] text-white flex flex-col overflow-hidden font-sans">
            {/* Elite Header */}
            <div className="relative py-8 px-6 border-b border-white/5 bg-gradient-to-b from-[#2A0D1F] to-transparent">
                <button
                    onClick={() => setCurrentScreen("settings")}
                    className="absolute left-6 top-8 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all z-20"
                >
                    <ChevronLeft className="w-6 h-6 text-[#D4AF37]" />
                </button>

                <div className="text-center mt-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-3"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Elite Collective</span>
                    </motion.div>
                    <h1 className="text-3xl font-black tracking-tighter mb-1">THE RESONANCE CIRCLE</h1>
                    <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.3em]">Enrich the field. Unlock the Unseen.</p>
                </div>
                <div className="absolute right-6 top-8 z-20">
                    <EliteGuidance
                        feature="Scenario Keys"
                        how="Every guest you invite grants you 3 Scenario Keys. These keys are tokens of intent that can be channeled to manifest specific connection types."
                        why="By consciously choosing the nature of your interaction—Intimate or Mystical—you align the field's energy with your immediate desires, bypassing the noise of random matching."
                        value="You receive curated, high-vibration scenarios that would otherwise be inaccessible, ensuring every interaction feels profound and destined."
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5">
                <button
                    onClick={() => setActiveTab('ambassador')}
                    className={cn(
                        "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors relative",
                        activeTab === 'ambassador' ? "text-[#D4AF37]" : "text-white/40 hover:text-white"
                    )}
                >
                    Ambassador
                    {activeTab === 'ambassador' && (
                        <motion.div layoutId="tab-highlight" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('endorsements')}
                    className={cn(
                        "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors relative",
                        activeTab === 'endorsements' ? "text-[#D4AF37]" : "text-white/40 hover:text-white"
                    )}
                >
                    Endorsements
                    {activeTab === 'endorsements' && (
                        <motion.div layoutId="tab-highlight" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-12">

                {activeTab === 'ambassador' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Stats Hologram - Ambassador View */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/20 via-[#7A1F3D]/20 to-[#D4AF37]/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                            <div className="relative bg-[#2A0D1F]/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 overflow-hidden">
                                {/* Shimmer Effect */}
                                <motion.div
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent skew-x-12 pointer-events-none"
                                />

                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Available Keys</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                                                {stats.available_keys}
                                            </span>
                                            <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Unlocks</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                        <Key className="w-6 h-6 text-[#D4AF37]" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Total Network</p>
                                        <p className="text-xl font-bold text-white">{stats.total_referrals}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Active</p>
                                        <p className="text-xl font-bold text-white">{stats.successful_signups}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scenario Unlocks */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Manifest Connection</h3>

                            <div className="grid gap-4">
                                {/* Intimate Match */}
                                <button
                                    onClick={() => handleUnlock('intimate')}
                                    className="group relative flex items-center gap-4 p-5 rounded-[24px] bg-gradient-to-r from-pink-900/40 to-black/40 border border-white/10 hover:border-pink-500/30 transition-all text-left overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 group-hover:scale-110 transition-transform">
                                        <Heart className="w-6 h-6 text-pink-400" />
                                    </div>
                                    <div className="flex-1 relative z-10">
                                        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1 group-hover:text-pink-200 transition-colors">Intimate Match</h4>
                                        <p className="text-[10px] text-white/50 leading-relaxed font-medium">Unlock deep emotional & physical compatibility.</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                                            <Key className="w-3 h-3 text-[#D4AF37]" />
                                            <span className="text-[10px] font-bold text-[#D4AF37]">-1</span>
                                        </div>
                                    </div>
                                </button>

                                {/* Mystical Match */}
                                <button
                                    onClick={() => handleUnlock('mystical')}
                                    className="group relative flex items-center gap-4 p-5 rounded-[24px] bg-gradient-to-r from-purple-900/40 to-black/40 border border-white/10 hover:border-purple-500/30 transition-all text-left overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                                        <Moon className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div className="flex-1 relative z-10">
                                        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1 group-hover:text-purple-200 transition-colors">Mystical Match</h4>
                                        <p className="text-[10px] text-white/50 leading-relaxed font-medium">Unlock karmic, spiritual, or soul-tied connections.</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                                            <Key className="w-3 h-3 text-[#D4AF37]" />
                                            <span className="text-[10px] font-bold text-[#D4AF37]">-1</span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Invite Code */}
                        <div className="p-6 rounded-[24px] bg-[#D4AF37]/5 border border-[#D4AF37]/20 flex flex-col items-center text-center space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-1">Your Signature Code</h3>
                                <p className="text-[10px] text-white/40">Share this code to grant 3 keys per guest.</p>
                            </div>

                            <button
                                onClick={handleCopyCode}
                                className="relative px-6 py-3 rounded-full bg-[#D4AF37] text-[#1A0814] font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 transition-all active:scale-95 overflow-hidden group"
                            >
                                <span className="relative z-10">{stats?.referral_code}</span>
                                <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#FFE082] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
                                <span className="absolute inset-0 rounded-full border border-[#D4AF37]/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>

                        {/* Growth Mechanics - Updated Copy */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-2">Growth Mechanics</h3>
                            <div className="grid gap-3">
                                {[
                                    { step: "01", label: "Transmit", desc: "Share your unique signature code with curated matches." },
                                    { step: "02", label: "Materialize", desc: "Your guests manifest their profile using your elite link." },
                                    { step: "03", label: "Keys", desc: "Receive 3 Scenario Keys instantly upon their activation." }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex gap-4 items-start">
                                        <span className="text-[10px] font-black text-[#D4AF37] mt-1">{item.step}</span>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{item.label}</p>
                                            <p className="text-[11px] text-white/50 leading-relaxed font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Circle History */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Circle History</h3>
                                <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest px-2 py-1 bg-[#D4AF37]/10 rounded-full">Archive</span>
                            </div>
                            <div className="space-y-3">
                                {stats.referrals.map((referral, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-[#2A0D1F]/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#7A1F3D] flex items-center justify-center font-black text-[#1A0814] text-sm">
                                                {referral.name.split(' ')[1]?.[0] || 'V'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white tracking-tight">{referral.name}</p>
                                                <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-0.5">Manifested {new Date(referral.joined_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1.5",
                                            referral.status === 'premium'
                                                ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]"
                                                : "bg-white/5 border-white/10 text-white/40"
                                        )}>
                                            <Key className="w-3 h-3" />
                                            <span>+3 Keys</span>
                                        </div>
                                    </motion.div>
                                ))}
                                {stats.referrals.length === 0 && (
                                    <div className="text-center py-8 text-white/20 text-xs italic">
                                        No active resonance yet. Initiate the flow.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Endorsements Content */}
                        {/* Endorsements Content - Ported from SocialEndorsementsScreen */}
                        <section className="text-center space-y-3 pt-4">
                            <div className="inline-flex p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-2">
                                <Users className="w-8 h-8 text-[#D4AF37]" />
                            </div>
                            <h2 className="text-xl font-black tracking-tighter">Your Inner Circle</h2>
                            <p className="text-xs text-white/40 font-medium px-4 leading-relaxed">
                                Invite friends to endorse your profile. Verified social proof increases your visibility by <span className="text-[#D4AF37]">Up to 400%</span>.
                            </p>
                        </section>

                        {/* Share Section (Vouch Link) */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/60">Vouch Link</span>
                                <div className="h-[1px] flex-1 bg-white/5" />
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37] to-[#7A1F3D] rounded-2xl blur opacity-20 group-hover:opacity-40 transition" />
                                <div className="relative flex items-center justify-between p-4 bg-[#111111] border border-white/10 rounded-2xl gap-4">
                                    <span className="text-[10px] font-mono text-white/60 truncate">
                                        lovevibes.ai/vouch/{user?.name?.toLowerCase().replace(/\s+/g, '_') || 'elite'}_{stats?.referral_code || '88'}
                                    </span>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleCopyLink}
                                        className="flex-shrink-0 p-2.5 rounded-xl bg-white text-black hover:bg-[#D4AF37] transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </motion.button>
                                </div>
                            </div>
                        </section>

                        {/* Perks Section */}
                        <section className="grid gap-3">
                            {[
                                { icon: <ShieldCheck className="w-4 h-4" />, title: "Social Verification Seal", desc: "Unlock a permanent verification badge on your profile." },
                                { icon: <MessageSquareQuote className="w-4 h-4" />, title: "Trusted Commends", desc: "Let friends vouch for your character and vibe." },
                                { icon: <Star className="w-4 h-4" />, title: "Precision Visibility", desc: "Endorsed profiles are 3x more likely to be seen by elite matches." }
                            ].map((perk, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
                                    <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                                        {perk.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-black uppercase tracking-wider">{perk.title}</h4>
                                        <p className="text-[10px] text-white/40 leading-relaxed font-medium">{perk.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Recent Endorsements (Mock) */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/60">Recent Endorsements</span>
                                <div className="h-[1px] flex-1 bg-white/5" />
                            </div>
                            <div className="space-y-2">
                                {RECENT_ENDORSEMENTS.length > 0 ? RECENT_ENDORSEMENTS.map((en: any) => (
                                    <div key={en.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase">
                                                {en.name[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold">{en.name}</span>
                                                <span className="text-[10px] text-white/40 uppercase tracking-widest">{en.type}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                                            <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                                            <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-6 text-white/20 text-xs italic">
                                        No endorsements yet. Share your vouch link!
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* Ambient Background Element */}
            <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-[#7A1F3D]/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-40 -right-20 w-60 h-60 bg-[#D4AF37]/10 rounded-full blur-[80px] pointer-events-none" />
        </div>
    )
}
