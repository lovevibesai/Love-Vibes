"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { motion, AnimatePresence } from "framer-motion"
import {
    ChevronLeft,
    Zap,
    ShieldCheck,
    Share2,
    Sparkles,
    Trophy,
    BrainCircuit,
    MessageSquareHeart,
    UserCheck
} from "lucide-react"

const SIGNATURE_TRAITS = [
    { id: "eq", label: "Emotional Intelligence", value: "98th Percentile", icon: <BrainCircuit className="w-4 h-4" /> },
    { id: "comm", label: "Communication Flow", value: "High-Frequency", icon: <MessageSquareHeart className="w-4 h-4" /> },
    { id: "authenticity", label: "Authenticity", value: "Verified Alpha", icon: <UserCheck className="w-4 h-4" /> },
]

export function IdentitySignatureScreen() {
    const { setCurrentScreen } = useApp()
    const [isScanning, setIsScanning] = useState(true)
    const [showCard, setShowCard] = useState(false)

    useEffect(() => {
        const scanTimer = setTimeout(() => {
            setIsScanning(false)
            setShowCard(true)
        }, 3000)
        return () => clearTimeout(scanTimer)
    }, [])

    return (
        <div className="h-full flex flex-col bg-[#0A0A0A] text-white">
            {/* Header */}
            <header className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
                <button onClick={() => setCurrentScreen("innovative-features")} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-sm font-black tracking-[0.2em] uppercase text-[#D4AF37]">The Elite Signature</h1>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Status Verification Protocol</span>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center relative">
                <AnimatePresence mode="wait">
                    {isScanning ? (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-8"
                        >
                            <div className="relative w-64 h-64">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 90, 180, 270, 360],
                                        opacity: [0.3, 0.6, 0.3]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-[#D4AF37]/30"
                                />
                                <div className="absolute inset-4 rounded-full border border-[#D4AF37]/10 flex items-center justify-center bg-[#D4AF37]/5">
                                    <Zap className="w-16 h-16 text-[#D4AF37] animate-pulse" />
                                </div>

                                {/* Scan Line */}
                                <motion.div
                                    animate={{ top: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_15px_#D4AF37] z-10"
                                />
                            </div>

                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold tracking-tight">Analyzing Vibe Signature...</h3>
                                <p className="text-sm text-white/40 font-medium">Processing profile, voice, and interaction patterns.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="card"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="w-full max-w-sm"
                        >
                            {/* The Elite Signature Card */}
                            <div className="relative group perspective-1000">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37] to-[#7A1F3D] rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

                                <div className="relative bg-[#0F0F0F] border border-white/10 rounded-3xl overflow-hidden p-6 flex flex-col gap-6 shadow-2xl">
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Verified Status</span>
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tighter italic">Sovereign Alpha</h2>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                            <Zap className="w-6 h-6 text-[#D4AF37]" />
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid gap-4">
                                        {SIGNATURE_TRAITS.map((trait) => (
                                            <div key={trait.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-[#D4AF37]/60">{trait.icon}</div>
                                                    <span className="text-xs font-bold text-white/60">{trait.label}</span>
                                                </div>
                                                <span className="text-sm font-black tracking-tight">{trait.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer Decoration */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                        <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "94%" }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#7A1F3D]"
                                            />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Rank #1,204 Global</span>
                                    </div>

                                    {/* Watermark */}
                                    <div className="absolute bottom-[-20px] right-[-20px] opacity-[0.03] rotate-[-15deg]">
                                        <Sparkles className="w-40 h-40" />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-4 mt-8 w-full">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Export to Story
                                </motion.button>
                                <button className="w-full py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2">
                                    <Trophy className="w-3 h-3" />
                                    View All Perks
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Aesthetic Background Elements */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7A1F3D]/10 blur-[120px] rounded-full" />
            </div>
        </div>
    )
}
