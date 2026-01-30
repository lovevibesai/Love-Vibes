"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Star, Zap, Crown, ShieldCheck, Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { api } from "@/lib/api-client"

interface PremiumModalProps {
    isOpen: boolean
    onClose: () => void
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const { user, updateUser } = useApp()
    const [selectedTier, setSelectedTier] = useState<'plus' | 'platinum'>('plus')
    const [isLoading, setIsLoading] = useState(false)

    const tiers = {
        plus: {
            name: 'Love Plus',
            price: '$14.99/mo',
            color: 'from-rose-500 to-pink-500',
            icon: <Star className="w-5 h-5" />,
            features: [
                'Unlimited Likes',
                '5 Super Likes / Day',
                '1 Free Boost / Month',
                'Rewind Last Swipe',
                'Passport to Anywhere',
                'Hide Distance'
            ]
        },
        platinum: {
            name: 'Love Platinum',
            price: '$29.99/mo',
            color: 'from-zinc-900 to-black',
            icon: <Crown className="w-5 h-5 text-amber-400" />,
            border: 'border-amber-400/50',
            features: [
                'Everything in Plus',
                'Prioritized Likes',
                'See Who Likes You',
                'Message Before Matching',
                'Advanced AI Insights',
                'Incognito Mode'
            ]
        }
    }

    const handleSubscribe = async () => {
        setIsLoading(true)
        try {
            const res = await api.billing.subscribe(selectedTier, 'monthly')
            if (res.status === "success") {
                if (user) {
                    updateUser({
                        subscriptionTier: selectedTier,
                        subscriptionExpiresAt: res.expires_at
                    })
                }
                onClose()
            }
        } catch (err) {
            console.error("Subscription error:", err)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="relative w-full max-w-md bg-zinc-950 rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl border-t border-white/10"
                >
                    {/* Header Image/Gradient */}
                    <div className={`h-40 bg-gradient-to-br transition-all duration-500 ${tiers[selectedTier].color} relative`}>
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-black/20 text-white/70 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <motion.div
                                key={selectedTier}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3"
                            >
                                {tiers[selectedTier].icon}
                            </motion.div>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase">{tiers[selectedTier].name}</h2>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Tier Selector */}
                        <div className="flex gap-2 p-1.5 bg-zinc-900 rounded-2xl mb-8">
                            <button
                                onClick={() => setSelectedTier('plus')}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${selectedTier === 'plus' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'
                                    }`}
                            >
                                PLUS
                            </button>
                            <button
                                onClick={() => setSelectedTier('platinum')}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${selectedTier === 'platinum' ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'text-zinc-500'
                                    }`}
                            >
                                PLATINUM
                            </button>
                        </div>

                        {/* Features List */}
                        <div className="space-y-4 mb-10 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
                            {tiers[selectedTier].features.map((feature, i) => (
                                <motion.div
                                    key={feature}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-4"
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${selectedTier === 'platinum' ? 'bg-amber-400/20 text-amber-400' : 'bg-rose-500/20 text-rose-500'
                                        }`}>
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-zinc-300 font-medium">{feature}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA Section */}
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <p className="text-4xl font-black mb-1">{tiers[selectedTier].price}</p>
                                <p className="text-zinc-500 text-sm font-medium">Billed monthly. Cancel anytime.</p>
                            </div>

                            <Button
                                onClick={handleSubscribe}
                                disabled={isLoading}
                                className={`w-full h-16 rounded-2xl text-lg font-black italic uppercase tracking-wider transition-all ${selectedTier === 'platinum'
                                    ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-xl shadow-amber-400/10'
                                    : 'bg-rose-500 text-white hover:bg-rose-400 shadow-xl shadow-rose-500/10'
                                    }`}
                            >
                                {isLoading ? <Sparkles className="w-6 h-6 animate-pulse" /> : `GET ${tiers[selectedTier].name}`}
                            </Button>

                            <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                                By tapping &quot;GET&quot;, your payment will be charged to your account. Your subscription will automatically renew for the same price and duration until you cancel in settings.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
