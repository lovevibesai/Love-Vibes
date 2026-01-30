"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, HelpCircle, MessageSquare, Search, ChevronDown, ChevronUp, Sparkles, Shield, CreditCard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface FAQItem {
    id: string
    question: string
    answer: string
    category: "account" | "safety" | "billing"
}

const FAQ_DATA: FAQItem[] = [
    {
        id: "f1",
        question: "How do AI Sparks ✨ work?",
        answer: "Our proprietary AI analyzes common interests and lifestyle values between you and your match. It then generates 3 custom icebreakers to help you start a meaningful conversation instantly.",
        category: "account"
    },
    {
        id: "f2",
        question: "Is my data secure?",
        answer: "Absolutely. We use industry-standard encryption and geosharded workers to ensure your location and personal data are only shared with relevant matches under your control.",
        category: "safety"
    },
    {
        id: "f3",
        question: "How do I get a Verified Badge?",
        answer: "Go to Profile > Verify. You'll need to take a live selfie that our biometric system compares against your profile photos. Once verified, you'll receive the blue checkmark.",
        category: "safety"
    },
    {
        id: "f4",
        question: "What are Love Credits used for?",
        answer: "Credits can be used for à la carte premium features like sending Virtual Gifts, Boosting your profile, or using AI Spark refreshes.",
        category: "billing"
    }
]

export function HelpCenterScreen() {
    const { setCurrentScreen } = useApp()
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const filteredFaqs = FAQ_DATA.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="h-full flex flex-col items-center bg-background overflow-hidden font-inter">
            <div className="w-full max-w-md h-full flex flex-col bg-background relative shadow-2xl">
                {/* Header */}
                <header className="flex flex-col gap-4 px-4 pt-4 pb-6 border-b border-border bg-card sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentScreen("settings")}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-all active:scale-95"
                        >
                            <ChevronLeft className="w-6 h-6 text-foreground" />
                        </button>
                        <h1 className="text-lg font-semibold text-foreground">Help Center</h1>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search help articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 bg-muted/50 border-none rounded-2xl focus-visible:ring-primary/20"
                        />
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Support Categories */}
                    <div className="grid grid-cols-3 gap-3">
                        <CategoryButton icon={<Sparkles className="w-5 h-5" />} label="Features" color="text-yellow-500" />
                        <CategoryButton icon={<Shield className="w-5 h-5" />} label="Safety" color="text-green-500" />
                        <CategoryButton icon={<CreditCard className="w-5 h-5" />} label="Billing" color="text-blue-500" />
                    </div>

                    {/* FAQ List */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-2">Frequently Asked Questions</h2>
                        <div className="space-y-2">
                            {filteredFaqs.map((faq) => (
                                <div
                                    key={faq.id}
                                    className="bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300"
                                >
                                    <button
                                        onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                                        className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                                    >
                                        <span className="font-semibold text-sm text-foreground pr-4">{faq.question}</span>
                                        {expandedId === faq.id ? (
                                            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {expandedId === faq.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}

                            {filteredFaqs.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-sm text-muted-foreground">No matches found for &quot;{searchQuery}&quot;</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Support Section */}
                    <div className="p-6 rounded-3xl bg-primary text-primary-foreground space-y-4 shadow-xl shadow-primary/20 mt-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold">Still need help?</h3>
                                <p className="text-sm text-white/80">Our team is available 24/7.</p>
                            </div>
                        </div>
                        <Button className="w-full h-12 bg-white text-primary hover:bg-white/90 rounded-2xl font-bold">
                            Contact Support
                        </Button>
                    </div>

                    <div className="text-center pb-6">
                        <p className="text-xs text-muted-foreground font-mono">
                            Version: 1.0.0 (Production-Stable)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CategoryButton({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
    return (
        <button className="flex flex-col items-center gap-2 p-3 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-all active:scale-95 group">
            <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center transform group-hover:scale-110 transition-transform ${color}`}>
                {icon}
            </div>
            <span className="text-xs font-semibold text-foreground">{label}</span>
        </button>
    )
}
