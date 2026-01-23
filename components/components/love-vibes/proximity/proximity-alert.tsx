"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, X } from "lucide-react"
import { type User } from "@/lib/app-context"

interface ProximityAlertProps {
    match: User
    distance: number
    venue: string
    onAccept: () => void
    onDecline: () => void
}

export function ProximityAlert({ match, distance, venue, onAccept, onDecline }: ProximityAlertProps) {
    const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    onDecline()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [onDecline])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-background rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
                {/* Header */}
                <div className="relative h-48 bg-gradient-to-br from-primary to-secondary">
                    <button
                        onClick={onDecline}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/30 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center mx-auto mb-3 animate-pulse">
                                <MapPin className="w-10 h-10 text-white" fill="currentColor" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">Nearby Match!</h2>
                            <p className="text-white/90 text-sm">{distance}m away</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Match Info */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border">
                            <img
                                src={match.photoUrl || "/placeholder.svg"}
                                alt={match.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">{match.name}, {match.age}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{match.bio}</p>
                        </div>
                    </div>

                    {/* Venue Suggestion */}
                    <div className="p-4 bg-muted rounded-xl mb-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground mb-1">Suggested meetup spot</p>
                                <h4 className="font-semibold text-foreground">{venue}</h4>
                                <p className="text-sm text-muted-foreground mt-1">Perfect for a quick coffee ☕</p>
                            </div>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-amber-500/10 rounded-xl">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                            Expires in {formatTime(timeLeft)}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            onClick={onDecline}
                            variant="outline"
                            className="flex-1 h-12"
                        >
                            Not Now
                        </Button>
                        <Button
                            onClick={onAccept}
                            className="flex-1 h-12 gradient-love text-white font-semibold"
                        >
                            Let's Meet!
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
