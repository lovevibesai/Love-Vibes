"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Play, Heart, X, Volume2, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { VoiceRecorder } from "./voice-recorder"

interface VoiceProfile {
    user_id: string
    voice_url: string
    duration: number
    overall_score: number
}

export function VoiceFeedScreen() {
    const { setCurrentScreen, user } = useApp()
    const [profiles, setProfiles] = useState<VoiceProfile[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [showRecorder, setShowRecorder] = useState(false)
    const [hasVoiceProfile, setHasVoiceProfile] = useState(false)

    useEffect(() => {
        loadVoiceFeed()
    }, [])

    const loadVoiceFeed = async () => {
        // TODO: Load from API
        // Mock data for now
        setProfiles([
            { user_id: "1", voice_url: "", duration: 28, overall_score: 85 },
            { user_id: "2", voice_url: "", duration: 30, overall_score: 92 },
        ])
    }

    const handleSwipe = (action: 'like' | 'pass') => {
        if (currentIndex < profiles.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setIsPlaying(false)
        } else {
            // No more profiles
            setCurrentScreen("feed")
        }
    }

    const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
        // TODO: Upload to backend
        setHasVoiceProfile(true)
        setShowRecorder(false)
    }

    if (!hasVoiceProfile && !showRecorder) {
        return (
            <div className="h-full flex flex-col bg-background">
                <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                    <button
                        onClick={() => setCurrentScreen("feed")}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-foreground" />
                    </button>
                    <h1 className="text-lg font-semibold text-foreground">Voice-First Matching</h1>
                </header>

                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-md text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6">
                            <Volume2 className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">Depth First</h2>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            Match based on voice before seeing photos. Create deeper connections by hearing someone's personality, tone, and authenticity first.
                        </p>
                        <div className="space-y-3 mb-8">
                            <div className="flex items-start gap-3 text-left">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-primary text-sm font-bold">1</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Record a 30-second voice note</p>
                            </div>
                            <div className="flex items-start gap-3 text-left">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-primary text-sm font-bold">2</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Swipe on voices (no photos shown)</p>
                            </div>
                            <div className="flex items-start gap-3 text-left">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-primary text-sm font-bold">3</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Mutual like unlocks photos</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowRecorder(true)}
                            className="w-full h-12 gradient-love text-white font-semibold"
                        >
                            Record Your Voice
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (showRecorder) {
        return (
            <div className="h-full flex flex-col bg-background">
                <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                    <button
                        onClick={() => setShowRecorder(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-foreground" />
                    </button>
                    <h1 className="text-lg font-semibold text-foreground">Record Your Voice</h1>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    <p className="text-center text-muted-foreground mb-6">
                        Answer: "What are you looking for in a relationship?"
                    </p>
                    <VoiceRecorder onRecordingComplete={handleRecordingComplete} maxDuration={30} />
                </div>
            </div>
        )
    }

    const currentProfile = profiles[currentIndex]

    return (
        <div className="h-full flex flex-col bg-background">
            <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
                <button
                    onClick={() => setCurrentScreen("feed")}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-semibold text-foreground">Voice Feed</h1>
                    <p className="text-xs text-muted-foreground">{currentIndex + 1} / {profiles.length}</p>
                </div>
                <div className="w-10" />
            </header>

            <div className="flex-1 flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-md"
                    >
                        {/* Voice Waveform Card */}
                        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 mb-6">
                            <div className="flex items-center justify-center gap-1 h-48 mb-6">
                                {Array.from({ length: 30 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1 bg-primary rounded-full transition-all ${isPlaying ? 'animate-pulse' : ''
                                            }`}
                                        style={{
                                            height: `${Math.random() * 80 + 20}%`,
                                            animationDelay: `${i * 0.05}s`,
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="text-center mb-6">
                                <div className="text-4xl font-bold text-foreground mb-2">
                                    {currentProfile.duration}s
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-sm text-muted-foreground">
                                        {currentProfile.overall_score}% Voice Match
                                    </span>
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-full h-14 gradient-love text-white font-semibold rounded-xl"
                            >
                                <Play className="w-6 h-6 mr-2" />
                                {isPlaying ? 'Pause' : 'Play Voice'}
                            </Button>
                        </div>

                        {/* Info */}
                        <div className="text-center mb-6">
                            <p className="text-sm text-muted-foreground">
                                Photos unlock after mutual like 🔒
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                onClick={() => handleSwipe('pass')}
                                variant="outline"
                                size="lg"
                                className="w-16 h-16 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                                <X className="w-7 h-7" />
                            </Button>

                            <Button
                                onClick={() => handleSwipe('like')}
                                size="lg"
                                className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                <Heart className="w-7 h-7 fill-current" />
                            </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
