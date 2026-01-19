"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Sparkles, CreditCard, ShieldCheck, Zap, Heart, Star, Gift, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { api } from "@/lib/api-client"

interface CreditPackage {
    id: string
    name: string
    amount: number
    price: string
    discount?: string
    icon: React.ReactNode
    color: string
    popular?: boolean
}

export function CreditsScreen() {
    const { setCurrentScreen, currentUser, setCurrentUser } = useApp()
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const [successPackage, setSuccessPackage] = useState<CreditPackage | null>(null)

    const packages: CreditPackage[] = [
        {
            id: 'starter',
            name: 'Starter',
            amount: 50,
            price: '$9.99',
            icon: <Zap className="w-6 h-6" />,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'popular',
            name: 'Most Popular',
            amount: 120,
            price: '$19.99',
            discount: 'Save 20%',
            icon: <Heart className="w-6 h-6" />,
            color: 'from-rose-500 to-pink-500',
            popular: true
        },
        {
            id: 'premium',
            name: 'Premium',
            amount: 300,
            price: '$39.99',
            discount: 'Save 35%',
            icon: <Star className="w-6 h-6" />,
            color: 'from-purple-500 to-indigo-500'
        },
        {
            id: 'ultimate',
            name: 'Ultimate',
            amount: 1000,
            price: '$99.99',
            discount: 'Best Value',
            icon: <Sparkles className="w-6 h-6" />,
            color: 'from-amber-400 to-orange-600'
        }
    ]

    const handlePurchase = async (pkg: CreditPackage) => {
        setIsLoading(pkg.id)
        try {
            const res = await api.billing.purchaseCredits(pkg.id)
            if (res.status === "success") {
                // Update local state
                if (currentUser) {
                    setCurrentUser({
                        ...currentUser,
                        credits: (currentUser.credits || 0) + res.credits_added
                    })
                }
                setSuccessPackage(pkg)
            }
        } catch (err) {
            console.error("Purchase error:", err)
        } finally {
            setIsLoading(null)
        }
    }

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white overflow-y-auto">
            <div className="flex-1 w-full max-w-md mx-auto flex flex-col">
                {/* Header */}
                <div className="px-6 py-6 flex items-center justify-between sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md">
                    <button
                        onClick={() => setCurrentScreen("profile")}
                        className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-white/10 rounded-full">
                        <Sparkles className="w-4 h-4 text-rose-500" />
                        <span className="font-bold text-lg">{currentUser?.credits || 0}</span>
                        <span className="text-xs text-zinc-400 font-medium">CREDITS</span>
                    </div>
                    <div className="w-10 h-10" /> {/* Spacer */}
                </div>

                <div className="px-6 pb-32">
                    {/* Hero section */}
                    <div className="text-center mt-4 mb-10">
                        <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Get More Vibes
                        </h1>
                        <p className="text-zinc-400 text-lg">
                            Unlock premium features and stand out from the crowd with Love Credits.
                        </p>
                    </div>

                    {/* Features list */}
                    <div className="grid grid-cols-2 gap-4 mb-12">
                        <FeatureItem icon={<Zap className="text-blue-400" />} label="Priority Boost" />
                        <FeatureItem icon={<Gift className="text-rose-400" />} label="Send Gifts" />
                        <FeatureItem icon={<Heart className="text-pink-400" />} label="Unlimited Likes" />
                        <FeatureItem icon={<Star className="text-indigo-400" />} label="Global Passport" />
                    </div>

                    {/* Packages Grid */}
                    <div className="space-y-4">
                        {packages.map((pkg) => (
                            <motion.button
                                key={pkg.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handlePurchase(pkg)}
                                disabled={isLoading !== null}
                                className={`relative w-full p-6 rounded-[32px] text-left border overflow-hidden transition-all ${pkg.popular
                                    ? 'bg-zinc-900 border-rose-500/50 shadow-xl shadow-rose-500/10'
                                    : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                {pkg.popular && (
                                    <div className="absolute top-0 right-0 px-4 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pkg.color} flex items-center justify-center text-white shadow-lg`}>
                                            {pkg.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold">{pkg.amount}</span>
                                                <span className="text-sm font-medium text-zinc-400">Credits</span>
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-1">{pkg.name} Pack</div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xl font-bold">{pkg.price}</div>
                                        {pkg.discount && (
                                            <div className="text-[10px] font-bold text-rose-500 uppercase">{pkg.discount}</div>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Secure checkout notice */}
                    <div className="mt-12 flex flex-col items-center gap-4 text-center">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs py-2 px-4 rounded-full border border-white/5">
                            <ShieldCheck className="w-4 h-4" />
                            SECURE 128-BIT ENCRYPTED CHECKOUT
                        </div>
                        <p className="text-[10px] text-zinc-600 max-w-xs">
                            Payments are processed securely. Your credits will be added to your account instantly upon successful payment. See our Terms of Service for refund policy.
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {successPackage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-zinc-900 border border-white/10 p-10 rounded-[40px] max-w-sm w-full text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-purple-600" />

                            <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-12 h-12 text-rose-500" />
                            </div>

                            <h2 className="text-3xl font-bold mb-2">Awesome!</h2>
                            <p className="text-zinc-400 mb-8">
                                You just added <span className="text-white font-bold">{successPackage.amount} Credits</span> to your account.
                            </p>

                            <Button
                                onClick={() => setSuccessPackage(null)}
                                className="w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-2xl font-bold text-lg"
                            >
                                Start Using Credits
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function FeatureItem({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-3xl bg-zinc-900/40 border border-white/5">
            <div className="flex-shrink-0">{icon}</div>
            <span className="text-xs font-semibold text-zinc-300">{label}</span>
        </div>
    )
}
