"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, ChevronRight, RefreshCw } from "lucide-react"
import { api } from "@/lib/api-client"

interface IcebreakerPanelProps {
    withUserId: string
    onSelect: (text: string) => void
    onClose: () => void
}

export function IcebreakerPanel({ withUserId, onSelect, onClose }: IcebreakerPanelProps) {
    const [icebreakers, setIcebreakers] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchIcebreakers = async () => {
        setIsLoading(true)
        try {
            const res = await api.chat.getIcebreakers(withUserId)
            if (res.status === "success") {
                setIcebreakers(res.icebreakers)
            }
        } catch (err) {
            console.error("Failed to fetch icebreakers:", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchIcebreakers()
    }, [withUserId])

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="p-4 bg-gradient-to-br from-rose-500/10 to-purple-500/10 border border-rose-500/20 rounded-2xl mb-4 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-2">
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-foreground">AI Icebreakers</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Smart Opening Sparks</p>
                </div>
            </div>

            <div className="space-y-2">
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-10 bg-muted/50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    icebreakers.map((text, i) => (
                        <motion.button
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => onSelect(text)}
                            className="w-full text-left p-3 text-sm bg-background/50 hover:bg-background border border-rose-500/10 hover:border-rose-500/30 rounded-xl transition-all group flex items-center justify-between"
                        >
                            <span className="text-foreground/90 font-medium leading-tight line-clamp-2">{text}</span>
                            <ChevronRight className="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                    ))
                )}
            </div>

            <button
                onClick={fetchIcebreakers}
                className="mt-4 w-full py-1.5 flex items-center justify-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:bg-rose-500/5 rounded-lg transition-colors"
                disabled={isLoading}
            >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Sparks
            </button>
        </motion.div>
    )
}
