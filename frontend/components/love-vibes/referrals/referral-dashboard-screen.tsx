"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Gift, Users, TrendingUp, Copy, Check, Share2 } from "lucide-react"

interface ReferralStats {
    referral_code: string
    total_referrals: number
    successful_signups: number
    credits_earned: number
    referrals: Array<{
        name: string
        joined_at: number
        status: string
    }>
}

export function ReferralDashboardScreen() {
    const { setCurrentScreen, user } = useApp()
    const [stats, setStats] = useState<ReferralStats | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        // TODO: Load from API
        // Mock data
        setStats({
            referral_code: "SARAH2K4F",
            total_referrals: 12,
            successful_signups: 8,
            credits_earned: 400,
            referrals: [
                { name: "Emma J.", joined_at: Date.now() - 86400000, status: "active" },
                { name: "Mike R.", joined_at: Date.now() - 172800000, status: "premium" },
                { name: "Lisa K.", joined_at: Date.now() - 259200000, status: "active" },
            ],
        })
    }

    const handleCopyCode = () => {
        if (stats) {
            navigator.clipboard.writeText(stats.referral_code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleShare = () => {
        const message = `Join me on Love Vibes! Use my code ${stats?.referral_code} to get started. https://lovevibes.app/join/${stats?.referral_code}`
        if (navigator.share) {
            navigator.share({ text: message })
        } else {
            navigator.clipboard.writeText(message)
            alert("Link copied to clipboard!")
        }
    }

    if (!stats) {
        return <div className="h-full flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                <button
                    onClick={() => setCurrentScreen("settings")}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Referral Dashboard</h1>
                    <p className="text-xs text-muted-foreground">Earn 50 credits per referral</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                {/* Stats Cards */}
                <div className="p-4 grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-primary" />
                            <span className="text-sm text-muted-foreground">Total Referrals</span>
                        </div>
                        <div className="text-3xl font-bold text-foreground">{stats.total_referrals}</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-muted-foreground">Active</span>
                        </div>
                        <div className="text-3xl font-bold text-foreground">{stats.successful_signups}</div>
                    </div>

                    <div className="col-span-2 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-2xl p-4 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-5 h-5 text-amber-600" />
                            <span className="text-sm text-muted-foreground">Credits Earned</span>
                        </div>
                        <div className="text-4xl font-bold text-foreground">{stats.credits_earned}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            = {stats.successful_signups} successful referrals × 50 credits
                        </p>
                    </div>
                </div>

                {/* Referral Code */}
                <div className="p-4">
                    <div className="bg-card rounded-2xl shadow-card border border-border p-6">
                        <h3 className="font-semibold text-foreground mb-3">Your Referral Code</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 bg-muted rounded-xl p-4 font-mono text-2xl font-bold text-center text-foreground">
                                {stats.referral_code}
                            </div>
                            <Button
                                onClick={handleCopyCode}
                                variant="outline"
                                className="h-14 px-6"
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </Button>
                        </div>
                        <Button
                            onClick={handleShare}
                            className="w-full h-12 gradient-love text-white font-semibold"
                        >
                            <Share2 className="w-5 h-5 mr-2" />
                            Share with Friends
                        </Button>
                    </div>
                </div>

                {/* How It Works */}
                <div className="p-4">
                    <div className="bg-card rounded-2xl shadow-card border border-border p-6">
                        <h3 className="font-semibold text-foreground mb-4">How It Works</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-primary text-sm font-bold">1</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Share your unique referral code with friends</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-primary text-sm font-bold">2</span>
                                </div>
                                <p className="text-sm text-muted-foreground">They sign up using your code</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-primary text-sm font-bold">3</span>
                                </div>
                                <p className="text-sm text-muted-foreground">You both get 50 credits when they become active!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Referral History */}
                <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-3">Recent Referrals</h3>
                    <div className="space-y-2">
                        {stats.referrals.map((referral, idx) => (
                            <div
                                key={idx}
                                className="bg-card rounded-xl shadow-card border border-border p-4 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-medium text-foreground">{referral.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(referral.joined_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${referral.status === 'premium'
                                        ? 'bg-amber-500/20 text-amber-700'
                                        : 'bg-green-500/20 text-green-700'
                                    }`}>
                                    {referral.status === 'premium' ? '⭐ Premium' : '✓ Active'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
