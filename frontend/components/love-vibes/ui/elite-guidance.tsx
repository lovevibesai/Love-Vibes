"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Info, X, Zap } from "lucide-react"

interface GuidanceItem {
    title: string
    content: string
}

interface EliteGuidanceProps {
    feature: string
    how: string
    why: string
    value: string
}

export function EliteGuidance({ feature, how, why, value }: EliteGuidanceProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all shadow-xl"
                aria-label="Feature Information"
            >
                <Info className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-sm bg-[#1A0814] border border-[#D4AF37]/30 rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-3xl pointer-events-none rounded-full" />

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center border border-[#D4AF37]/30">
                                        <Zap className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black uppercase tracking-widest text-sm">{feature}</h3>
                                        <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Protocol Intelligence</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <GuidanceBlock label="How it works" content={how} />
                                <GuidanceBlock label="Why it works" content={why} />
                                <GuidanceBlock label="Added Value" content={value} />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsOpen(false)}
                                className="w-full h-14 mt-10 rounded-2xl bg-white text-[#1A0814] font-black uppercase tracking-[0.3em] text-[10px] shadow-xl"
                            >
                                Understood
                            </motion.button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

function GuidanceBlock({ label, content }: { label: string; content: string }) {
    return (
        <div className="space-y-1.5">
            <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-[0.3em] opacity-60">{label}</p>
            <p className="text-xs text-white/70 font-medium leading-relaxed tracking-wide">{content}</p>
        </div>
    )
}
