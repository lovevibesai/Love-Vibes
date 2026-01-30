"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Zap, TrendingUp, Clock, Sparkles } from "lucide-react"
import { loveVibesAPI } from "@/lib/love-vibes-api"

export function BoostScreen() {
    const { setCurrentScreen, user, updateUser } = useApp()
    const [isActive, setIsActive] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(30)
    const [loading, setLoading] = useState(false)

    const handleActivateBoost = async () => {
        if (!user || user.credits < 50) return

        setLoading(true)
        try {
            // Call API to activate boost
            await loveVibesAPI.boost.activate(user.id)

            // Deduct credits
            updateUser({ credits: user.credits - 50 })

            setIsActive(true)

            // Simulate countdown
            const interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        setIsActive(false)
                        return 30
                    }
                    return prev - 1
                })
            }, 60000) // Every minute
        } catch (error) {
            console.error('Failed to activate boost:', error)
            alert('Failed to activate boost. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                <button
                    onClick={() => setCurrentScreen("profile")}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Profile Boost</h1>
                    <p className="text-xs text-muted-foreground">30-minute visibility boost</p>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-md mx-auto">
                    {!isActive ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <Zap className="w-12 h-12 text-white" fill="currentColor" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">Boost Your Profile</h2>
                                <p className="text-muted-foreground">
                                    Get 10x more profile views in the next 30 minutes
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">10x Visibility</h3>
                                            <p className="text-sm text-muted-foreground">Top of the feed for 30 minutes</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div className="p-3 bg-card rounded-xl">
                                            <div className="text-2xl font-bold text-foreground">10x</div>
                                            <div className="text-xs text-muted-foreground">More Views</div>
                                        </div>
                                        <div className="p-3 bg-card rounded-xl">
                                            <div className="text-2xl font-bold text-foreground">30</div>
                                            <div className="text-xs text-muted-foreground">Minutes</div>
                                        </div>
                                        <div className="p-3 bg-card rounded-xl">
                                            <div className="text-2xl font-bold text-foreground">50</div>
                                            <div className="text-xs text-muted-foreground">Credits</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-card rounded-xl border border-border">
                                    <h3 className="font-semibold text-foreground mb-3">How it works:</h3>
                                    <ol className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex gap-2">
                                            <span className="font-bold text-primary">1.</span>
                                            <span>Your profile moves to the top of everyone&apos;s feed</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold text-primary">2.</span>
                                            <span>Get priority visibility for 30 minutes</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold text-primary">3.</span>
                                            <span>Track real-time views and likes</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold text-primary">4.</span>
                                            <span>See analytics after boost ends</span>
                                        </li>
                                    </ol>
                                </div>

                                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-foreground">
                                            <p className="font-semibold mb-1">Best time to boost:</p>
                                            <p className="text-muted-foreground">Evenings (7-10pm) and weekends get the most activity!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleActivateBoost}
                                disabled={!user || user.credits < 50 || loading}
                                className="w-full h-12 gradient-love text-white font-semibold"
                            >
                                <Zap className="w-5 h-5 mr-2" fill="currentColor" />
                                {loading ? 'Activating...' : 'Activate Boost (50 Credits)'}
                            </Button>

                            {user && user.credits < 50 && (
                                <p className="text-sm text-center text-destructive mt-3">
                                    Not enough credits. You have {user.credits} credits.
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 relative">
                                    <Zap className="w-12 h-12 text-white animate-pulse" fill="currentColor" />
                                    <div className="absolute inset-0 rounded-full border-4 border-amber-500 animate-ping opacity-75" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">Boost Active! 🔥</h2>
                                <p className="text-muted-foreground">
                                    Your profile is at the top of the feed
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
                                    <div className="text-center mb-4">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <Clock className="w-5 h-5 text-amber-600" />
                                            <span className="text-sm font-medium text-muted-foreground">Time Remaining</span>
                                        </div>
                                        <div className="text-5xl font-bold text-foreground mb-2">{timeRemaining}</div>
                                        <div className="text-sm text-muted-foreground">minutes</div>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
                                            style={{ width: `${(timeRemaining / 30) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-card rounded-2xl border border-border">
                                    <h3 className="font-semibold text-foreground mb-4 text-center">Live Stats</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-foreground mb-1">127</div>
                                            <div className="text-sm text-muted-foreground">Profile Views</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-foreground mb-1">23</div>
                                            <div className="text-sm text-muted-foreground">New Likes</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                    <p className="text-sm text-center text-green-700 dark:text-green-400">
                                        <strong>Great timing!</strong> Peak activity hours. Keep your notifications on for instant matches.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setCurrentScreen("feed")}
                                className="w-full h-12 gradient-love text-white font-semibold"
                            >
                                View Feed
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
