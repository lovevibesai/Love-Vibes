"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, Bell, Mail, MessageSquare, Heart, Star } from "lucide-react"

export function NotificationSettingsScreen() {
    const { setCurrentScreen } = useApp()
    const [pushEnabled, setPushEnabled] = useState(true)
    const [emailEnabled, setEmailEnabled] = useState(false)

    const [toggles, setToggles] = useState({
        newMatch: true,
        newMsg: true,
        giftReceived: true,
        promotions: false,
        security: true
    })

    return (
        <div className="h-full flex flex-col bg-background">
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                <button
                    onClick={() => setCurrentScreen("settings")}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    aria-label="Go back"
                >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Global Toggles */}
                <section className="bg-card rounded-xl shadow-card overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Push Notifications</p>
                                <p className="text-xs text-muted-foreground">Pause all mobile alerts</p>
                            </div>
                        </div>
                        <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Email Notifications</p>
                                <p className="text-xs text-muted-foreground">Receive updates via email</p>
                            </div>
                        </div>
                        <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                    </div>
                </section>

                {/* Granular Controls */}
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-2">Alert Me When</h2>
                <section className="bg-card rounded-xl shadow-card overflow-hidden">
                    {[
                        { id: 'newMatch', label: 'New Match', icon: Heart, color: 'text-rose-500' },
                        { id: 'newMsg', label: 'New Message', icon: MessageSquare, color: 'text-blue-500' },
                        { id: 'giftReceived', label: 'Gift Received', icon: Star, color: 'text-yellow-500' },
                    ].map((item, idx) => (
                        <div key={item.id} className={`flex items-center justify-between p-4 ${idx !== 2 ? 'border-b border-border' : ''}`}>
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                                <span className="font-medium text-foreground">{item.label}</span>
                            </div>
                            <Switch
                                checked={(toggles as any)[item.id]}
                                onCheckedChange={(c) => setToggles(p => ({ ...p, [item.id]: c }))}
                                disabled={!pushEnabled}
                            />
                        </div>
                    ))}
                </section>
            </div>
        </div>
    )
}
