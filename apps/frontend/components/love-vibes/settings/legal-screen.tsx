"use client"

import { useApp } from "@/lib/app-context"
import { ChevronLeft, Scale, Shield, FileText, ExternalLink } from "lucide-react"

interface LegalScreenProps {
    type: "privacy" | "terms"
}

export function LegalScreen({ type }: LegalScreenProps) {
    const { setCurrentScreen, isOnboarded } = useApp()
    const isPrivacy = type === "privacy"

    return (
        <div className="h-full flex flex-col items-center bg-background overflow-hidden font-inter">
            <div className="w-full max-w-md h-full flex flex-col bg-background relative shadow-2xl">
                {/* Header */}
                <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card sticky top-0 z-10 transition-colors">
                    <button
                        onClick={() => setCurrentScreen(isOnboarded ? "settings" : "welcome")}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-all active:scale-95"
                    >
                        <ChevronLeft className="w-6 h-6 text-foreground" />
                    </button>
                    <h1 className="text-lg font-semibold text-foreground">
                        {isPrivacy ? "Privacy Policy" : "Terms of Service"}
                    </h1>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
                    {/* Top Banner */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 transform rotate-3">
                            {isPrivacy ? (
                                <Shield className="w-8 h-8 text-primary" />
                            ) : (
                                <Scale className="w-8 h-8 text-primary" />
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">
                            {isPrivacy ? "Your Data, Protected." : "Community Agreement"}
                        </h2>
                        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                            Last Updated: January 15, 2024
                        </p>
                    </div>

                    {/* Legal Text Sections */}
                    <div className="space-y-6 text-sm leading-relaxed text-foreground/80">
                        <section className="space-y-3">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">1</span>
                                Introduction
                            </h3>
                            <p>
                                Welcome to Love Vibes. This {isPrivacy ? "Privacy Policy" : "Terms of Service"} explains how we {isPrivacy ? "manage your information" : "govern the use of our platform"} to provide a safe and high-integrity dating experience.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">2</span>
                                {isPrivacy ? "Information Collection" : "Eligibility"}
                            </h3>
                            <p>
                                {isPrivacy
                                    ? "We collect information you provide directly to us when you create an account, including your name, photos, and preferences. We also collect metadata about your interactions to improve our matchmaking algorithms."
                                    : "By using Love Vibes, you represent and warrant that you are at least 18 years of age and that you will comply with all applicable local, state, and international laws and regulations."}
                            </p>
                            <ul className="list-disc pl-5 space-y-2 opacity-80">
                                <li>{isPrivacy ? "Identity Verification Data" : "Zero tolerance for harassment"}</li>
                                <li>{isPrivacy ? "Location Services for Discovery" : "Respectful communication required"}</li>
                                <li>{isPrivacy ? "UGC (User Generated Content)" : "Authentic profile requirement"}</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">3</span>
                                {isPrivacy ? "Data Usage" : "Prohibited Conduct"}
                            </h3>
                            <p>
                                {isPrivacy
                                    ? "Your data is used solely to enhance your experience. We do not sell your personal information to third parties. Data is used for smart matching, safety verified badge processing, and personalized 'Vibe Match' scores."
                                    : "You agree not to use the app for any commercial purposes or soliciting. We reserve the right to ban any user who engages in fraudulent behavior, impersonation, or hateful conduct."}
                            </p>
                        </section>

                        {/* Footer Links */}
                        <div className="pt-8 border-t border-border space-y-4">
                            <p className="text-xs text-muted-foreground text-center">
                                Questions? Our support team is here to help.
                            </p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setCurrentScreen("help-center")}
                                    className="w-full h-12 rounded-2xl bg-muted flex items-center justify-between px-4 hover:bg-muted/80 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-muted-foreground" />
                                        <span className="font-medium">Full Documentation</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
