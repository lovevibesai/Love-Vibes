"use client"

import { useApp } from "@/lib/app-context"
import {
    ChevronLeft,
    Clock as Timer,
    ChevronRight,
    Mic2,
    Heart,
    Zap,
    Activity,
    Users
} from "lucide-react"

export function InnovativeFeaturesScreen() {
    const { setCurrentScreen } = useApp()

    const features = [
        {
            id: "identity-signature",
            title: "The Elite Signature",
            subtitle: "AI status validation card",
            icon: <Zap className="w-5 h-5 text-yellow-500" />,
            tag: "Elite"
        },
        {
            id: "vibe-windows",
            title: "Vibe Windows",
            subtitle: "Schedule your matching times",
            icon: <Timer className="w-5 h-5 text-primary" />,
            tag: "Demo"
        },
        {
            id: "voice-feed",
            title: "Voice-First Matching",
            subtitle: "Match on voice before photos",
            icon: <Mic2 className="w-5 h-5 text-primary" />,
            tag: "Beta"
        },
        {
            id: "chemistry-test",
            title: "Chemistry Test",
            subtitle: "Heart rate sync detection",
            icon: <Activity className="w-5 h-5 text-primary" />,
            tag: "Hot"
        },
        {
            id: "mutual-friends",
            title: "Mutual Friends",
            subtitle: "Trusted introductions",
            icon: <Users className="w-5 h-5 text-primary" />,
        }
    ]

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                <button
                    onClick={() => setCurrentScreen("settings")}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    aria-label="Go back"
                >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <h1 className="text-lg font-semibold text-foreground">Innovative Features</h1>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border border border-border">
                    {features.map((feature) => (
                        <button
                            key={feature.id}
                            className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left"
                            onClick={() => setCurrentScreen(feature.id as any)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                    {feature.icon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-foreground">{feature.title}</p>
                                        {feature.tag && (
                                            <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-[8px] font-black uppercase text-primary tracking-tighter">
                                                {feature.tag}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{feature.subtitle}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                    ))}
                </div>

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <h3 className="text-sm font-bold text-primary mb-2">Experimental Features</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        These features are currently in active development or demonstration mode.
                        Some may require manual triggers via the Control Center.
                    </p>
                </div>
            </div>
        </div>
    )
}
