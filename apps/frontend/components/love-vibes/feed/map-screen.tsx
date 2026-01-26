"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { Map, MapPin, Navigation, User as UserIcon, X } from "lucide-react"
import Image from "next/image"

export function MapScreen({ onClose }: { onClose: () => void }) {
    const { user, matches, loadFeed } = useApp()
    const [nearbyUsers, setNearbyUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const mapRef = useRef<HTMLDivElement>(null)

    // Mock users for the map visual if no real data
    useEffect(() => {
        const fetchNearby = async () => {
            setIsLoading(true)
            // Strict empty state for production deployment unless API is ready
            // In future: const users = await api.feed.getNearby(user.lat, user.lng)
            setTimeout(() => {
                setNearbyUsers([])
                setIsLoading(false)
            }, 1000)
        }

        fetchNearby()
    }, [])

    return (
        <div className="absolute inset-0 z-50 bg-[#1A0814] flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-12 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-2">
                        <Map className="w-5 h-5 text-[#D4AF37]" />
                        Vibe Map
                    </h2>
                    <p className="text-xs text-white/50 font-bold tracking-wider">
                        {nearbyUsers.length} Active Signatures Nearby
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Map Visualization (Radar Style) */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[url('/map-dark.png')] bg-cover bg-center">
                {/* Radar Rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{
                                scale: [0.8, 1.5],
                                opacity: [0.3, 0],
                                borderWidth: ["1px", "0px"]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.8,
                                ease: "linear"
                            }}
                            className="absolute w-[300px] h-[300px] rounded-full border border-[#D4AF37]/30"
                        />
                    ))}
                    <div className="w-4 h-4 bg-[#D4AF37] rounded-full shadow-[0_0_20px_#D4AF37] animate-pulse z-10" />
                </div>

                {/* User Pins */}
                <AnimatePresence>
                    {!isLoading && nearbyUsers.length > 0 ? nearbyUsers.map((user, i) => (
                        <motion.div
                            key={user.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className="absolute"
                            style={{
                                top: `${50 + (Math.random() - 0.5) * 40}%`,
                                left: `${50 + (Math.random() - 0.5) * 40}%`,
                            }}
                        >
                            <div className="relative group cursor-pointer">
                                <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] overflow-hidden relative z-10 bg-black">
                                    <Image
                                        src={user.photoUrl}
                                        alt={user.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#1A0814] rounded-full flex items-center justify-center border border-white/10 z-20">
                                    <MapPin className="w-3 h-3 text-[#D4AF37]" />
                                </div>

                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur px-3 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">{user.name}</span>
                                </div>
                            </div>
                        </motion.div>
                    )) : !isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <p className="text-xs text-white/30 uppercase tracking-widest animate-pulse">Scanning Frequency...</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Action Button */}
            <div className="absolute bottom-8 right-6 z-20">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 rounded-full bg-[#D4AF37] shadow-[0_10px_30px_rgba(212,175,55,0.3)] flex items-center justify-center text-[#1A0814]"
                >
                    <Navigation className="w-6 h-6 fill-current" />
                </motion.button>
            </div>
        </div>
    )
}
