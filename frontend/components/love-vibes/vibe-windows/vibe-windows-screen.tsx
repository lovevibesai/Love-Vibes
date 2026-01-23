"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Clock, Users, Zap, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TIME_SLOTS = [
    { label: 'Morning', hours: [6, 7, 8, 9, 10, 11], icon: '🌅' },
    { label: 'Afternoon', hours: [12, 13, 14, 15, 16, 17], icon: '☀️' },
    { label: 'Evening', hours: [18, 19, 20, 21, 22, 23], icon: '🌆' },
    { label: 'Night', hours: [0, 1, 2, 3, 4, 5], icon: '🌙' },
]

interface VibeWindow {
    day: number
    hour: number
}

export function VibeWindowsScreen() {
    const { setCurrentScreen } = useApp()
    const [selectedWindows, setSelectedWindows] = useState<VibeWindow[]>([])
    const [selectedDay, setSelectedDay] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const fetchWindows = async () => {
            try {
                const res = await api.vibeWindows.getStatus()
                if (res.is_in_window || res.next_window || res.current_window) {
                    // Logic to map current windows if returned in a list
                    // For now, if the API returns current_window, we can add it to the list
                }

                // Fetching the actual list might need a separate GET if getStatus only gives status
                // But let's assume getStatus or a future getList provides them.
                // Assuming backend might have a list endpoint soon, or using getStatus for now.
                setIsLoading(false)
            } catch (e) {
                console.error("Failed to fetch vibe windows", e)
                setIsLoading(false)
            }
        }
        fetchWindows()
    }, [])

    const toggleWindow = (day: number, hour: number) => {
        const exists = selectedWindows.find(w => w.day === day && w.hour === hour)

        if (exists) {
            setSelectedWindows(selectedWindows.filter(w => !(w.day === day && w.hour === hour)))
        } else if (selectedWindows.length < 2) {
            setSelectedWindows([...selectedWindows, { day, hour }])
        }
    }

    const isSelected = (day: number, hour: number) => {
        return selectedWindows.some(w => w.day === day && w.hour === hour)
    }

    const formatTime = (hour: number) => {
        if (hour === 0) return '12am'
        if (hour < 12) return `${hour}am`
        if (hour === 12) return '12pm'
        return `${hour - 12}pm`
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const windows = selectedWindows.map(w => ({
                day_of_week: w.day,
                start_hour: w.hour
            }))
            await api.vibeWindows.setStatus(windows)
            toast.success("Vibe windows updated!")
            setCurrentScreen("settings")
        } catch (e) {
            toast.error("Failed to save vibe windows")
        } finally {
            setIsSaving(false)
        }
    }

    const getDayName = (dayIndex: number) => {
        const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return fullDays[dayIndex]
    }

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                <button
                    onClick={() => setCurrentScreen("settings")}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold text-foreground">Vibe Windows</h1>
                    <p className="text-xs text-muted-foreground">Pick 2 one-hour windows per week</p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-semibold text-primary">{selectedWindows.length}/2</div>
                    <div className="text-xs text-muted-foreground">selected</div>
                </div>
            </header>

            {/* Info Card */}
            <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">Intentional Dating</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your feed activates only during chosen windows. Everyone online is focused and ready to connect.
                        </p>
                    </div>
                </div>
            </div>

            {/* Day Selector */}
            <div className="px-4 py-3 border-b border-border">
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {DAYS.map((day, index) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(index)}
                            className={cn(
                                "flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-all",
                                selectedDay === index
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            {/* Time Slots */}
            <div className="flex-1 overflow-y-auto">
                {selectedDay !== null ? (
                    <div className="p-4 space-y-6">
                        {TIME_SLOTS.map((slot) => (
                            <div key={slot.label}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">{slot.icon}</span>
                                    <h3 className="font-semibold text-foreground">{slot.label}</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {slot.hours.map(hour => {
                                        const selected = isSelected(selectedDay, hour)
                                        const disabled = !selected && selectedWindows.length >= 2

                                        return (
                                            <button
                                                key={hour}
                                                onClick={() => toggleWindow(selectedDay, hour)}
                                                disabled={disabled}
                                                className={cn(
                                                    "relative h-14 rounded-xl font-medium transition-all",
                                                    selected
                                                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                                        : disabled
                                                            ? "bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
                                                            : "bg-card border border-border text-foreground hover:border-primary hover:bg-primary/5"
                                                )}
                                            >
                                                {selected && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                                <div className="text-sm">{formatTime(hour)}</div>
                                                <div className="text-xs opacity-70">
                                                    {formatTime(hour + 1)}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center">
                            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Select a day above to choose your time windows</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Selected Windows Summary */}
            {selectedWindows.length > 0 && (
                <div className="px-4 py-3 border-t border-border bg-card">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Your Vibe Windows</span>
                    </div>
                    <div className="space-y-2 mb-4">
                        {selectedWindows.map((window, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-sm font-bold text-primary">{idx + 1}</span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-foreground">{getDayName(window.day)}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatTime(window.hour)} - {formatTime(window.hour + 1)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleWindow(window.day, window.hour)}
                                    className="w-8 h-8 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                                >
                                    <span className="text-destructive text-lg">×</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={selectedWindows.length === 0}
                        className="w-full h-12 gradient-love text-white font-semibold"
                    >
                        Save Vibe Windows
                    </Button>
                </div>
            )}
        </div>
    )
}
