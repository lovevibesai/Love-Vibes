"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Eye, EyeOff, Shield, Users, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

export function VisibilitySettingsScreen() {
    const { setCurrentScreen, user, updateUser } = useApp()
    const [visibility, setVisibility] = useState(user?.interestedIn !== undefined ? "everyone" : "everyone")

    const visibilityOptions = [
        {
            id: "everyone",
            title: "Everyone",
            description: "Show my profile to all members in the field.",
            icon: <Globe className="w-5 h-5 text-primary" />
        },
        {
            id: "vibe-only",
            title: "Vibe Matches Only",
            description: "Only show me to people I've already high-vibed with.",
            icon: <Users className="w-5 h-5 text-primary" />
        },
        {
            id: "incognito",
            title: "Incognito",
            description: "Browse the aura of others without showing your own.",
            icon: <EyeOff className="w-5 h-5 text-primary" />
        }
    ]

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
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Discovery Visibility</h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Control Your Presence</p>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="space-y-3">
                    {visibilityOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setVisibility(option.id)}
                            className={cn(
                                "w-full p-4 rounded-2xl border transition-all text-left flex items-start gap-4",
                                visibility === option.id
                                    ? "bg-primary/5 border-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                    : "bg-card border-border hover:border-primary/30"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                visibility === option.id ? "bg-primary/20" : "bg-muted"
                            )}>
                                {option.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground">{option.title}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{option.description}</p>
                            </div>
                            <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1",
                                visibility === option.id ? "border-primary bg-primary" : "border-muted-foreground/30"
                            )}>
                                {visibility === option.id && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="p-5 rounded-2xl bg-[#1A0814] border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Privacy Protocol</h3>
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed">
                        Changing your visibility affects how the Love Vibes matching engine projects your profile into the resonance field.
                        Incognito mode is an Elite Pulsar feature that requires an active subscription or Boost.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-card">
                <Button
                    className="w-full h-12 gradient-love text-white font-black uppercase tracking-widest"
                    onClick={() => {
                        updateUser({ mode: visibility === "vibe-only" ? "friendship" : "dating" }) // Simplified mapping
                        setCurrentScreen("settings")
                    }}
                >
                    Update Presence
                </Button>
            </div>
        </div>
    )
}
