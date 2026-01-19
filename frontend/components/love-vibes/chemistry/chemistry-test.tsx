"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Activity } from "lucide-react"
import { motion } from "framer-motion"

interface ChemistryTestProps {
    isActive: boolean
    onComplete: (avgHeartRate: number) => void
}

export function ChemistryTest({ isActive, onComplete }: ChemistryTestProps) {
    const [heartRate, setHeartRate] = useState(0)
    const [readings, setReadings] = useState<number[]>([])
    const [countdown, setCountdown] = useState(60)

    useEffect(() => {
        if (!isActive) return

        // Simulate PPG heart rate detection
        // In production, this would use actual camera-based PPG
        const interval = setInterval(() => {
            const simulatedHR = 70 + Math.random() * 30 // 70-100 BPM
            setHeartRate(Math.round(simulatedHR))
            setReadings(prev => [...prev, simulatedHR])
        }, 2000)

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    clearInterval(timer)
                    const avgHR = readings.reduce((a, b) => a + b, 0) / readings.length
                    onComplete(avgHR)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            clearInterval(interval)
            clearInterval(timer)
        }
    }, [isActive])

    if (!isActive) return null

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl p-8 max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-10 h-10 text-white fill-current animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Chemistry Test</h2>
                    <p className="text-muted-foreground">Measuring heart rate synchrony...</p>
                </div>

                {/* Heart Rate Display */}
                <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-2xl p-6 mb-6">
                    <div className="text-center">
                        <div className="text-6xl font-bold text-foreground mb-2 font-mono">
                            {heartRate}
                        </div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wider">
                            BPM
                        </div>
                    </div>

                    {/* Pulse Animation */}
                    <div className="flex items-center justify-center gap-1 mt-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-2 bg-rose-500 rounded-full"
                                animate={{
                                    height: [20, 60, 20],
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.1,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-muted rounded-xl mb-6">
                    <div className="flex items-start gap-3">
                        <Activity className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">How it works:</p>
                            <p>We're using your camera to detect your heart rate. Keep your finger steady over the camera lens for accurate results.</p>
                        </div>
                    </div>
                </div>

                {/* Countdown */}
                <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                        Test completes in
                    </div>
                    <div className="text-3xl font-bold text-primary font-mono">
                        {countdown}s
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((60 - countdown) / 60) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>
        </div>
    )
}
