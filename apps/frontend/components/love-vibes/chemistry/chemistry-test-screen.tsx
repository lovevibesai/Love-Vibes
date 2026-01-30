"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader2 } from "lucide-react"
import { ChemistryTest } from "../chemistry/chemistry-test"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

export function ChemistryTestScreen() {
    const { setCurrentScreen, matchedUser } = useApp()
    const [isTestActive, setIsTestActive] = useState(false)
    const [testResult, setTestResult] = useState<any>(null)
    const [testId, setTestId] = useState<string | null>(null)
    const [isCalculating, setIsCalculating] = useState(false)

    const handleStartDemo = async () => {
        setIsCalculating(true)
        try {
            // For demo purposes, we use a fixed target or mock if no match selected
            const targetId = matchedUser?.id || "demo-target"
            const matchId = "demo-match"
            const res = await api.chemistry.startTest(matchId, targetId)
            setTestId(res.test_id)
            setIsTestActive(true)
        } catch (e) {
            toast.error("Failed to initialize chemistry protocol")
        } finally {
            setIsCalculating(false)
        }
    }

    const handleComplete = async (avgHeartRate: number) => {
        setIsTestActive(false)
        setIsCalculating(true)

        try {
            if (testId) {
                // Submit real data
                await api.chemistry.submitData(testId, [
                    { timestamp: Date.now(), bpm: avgHeartRate }
                ])

                // Get results
                const result = await api.chemistry.getResults(testId)
                setTestResult(result)
            } else {
                throw new Error("Test ID missing");
            }
        } catch (e) {
            toast.error("Biometric analysis interrupted")
        } finally {
            setIsCalculating(false)
        }
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
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Chemistry Test</h1>
                    <p className="text-xs text-muted-foreground">Heart rate synchrony detection</p>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {!isTestActive && !testResult && (
                    <div className="p-6 max-w-md mx-auto">
                        <div className="text-center mb-8">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                                <span className="text-5xl">💓</span>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">Biometric Chemistry</h2>
                            <p className="text-muted-foreground">
                                Measure heart rate synchrony during video calls to detect real chemistry
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="p-4 bg-card rounded-xl border border-border">
                                <h3 className="font-semibold text-foreground mb-2">How it works:</h3>
                                <ol className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">1.</span>
                                        <span>Place your fingertip over your phone&apos;s camera</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">2.</span>
                                        <span>We detect your heart rate using PPG technology</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">3.</span>
                                        <span>Compare patterns with your match during a call</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">4.</span>
                                        <span>Get a chemistry score based on synchrony</span>
                                    </li>
                                </ol>
                            </div>

                            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    <strong>Note:</strong> This is a demo version. In production, this would run during video calls with both users simultaneously.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => setIsTestActive(true)}
                            className="w-full h-12 gradient-love text-white font-semibold"
                        >
                            Start Demo Test
                        </Button>
                    </div>
                )}

                {testResult && (
                    <div className="p-6 max-w-md mx-auto">
                        <div className="text-center mb-8">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <span className="text-5xl">🔥</span>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                {testResult.chemistry_detected ? 'Chemistry Detected!' : 'Keep Getting to Know Each Other'}
                            </h2>
                            <p className="text-muted-foreground">
                                {testResult.chemistry_detected
                                    ? 'Your heart rates elevated and synced during the test'
                                    : 'Chemistry takes time to develop'}
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="p-6 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-2xl border border-rose-500/20">
                                <div className="text-center mb-4">
                                    <div className="text-6xl font-bold text-foreground mb-2">
                                        {testResult.sync_score}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">Synchrony Score</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-foreground">{testResult.user_a_avg_hr}</div>
                                        <div className="text-xs text-muted-foreground">Your BPM</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-foreground">{testResult.user_b_avg_hr}</div>
                                        <div className="text-xs text-muted-foreground">Their BPM</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-card rounded-xl border border-border">
                                <h3 className="font-semibold text-foreground mb-2">What this means:</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {testResult.chemistry_detected
                                        ? 'When heart rates elevate and sync during interaction, it often indicates mutual attraction and emotional connection. This is backed by research in biometric psychology.'
                                        : 'Heart rate patterns can vary based on many factors. Continue getting to know each other through conversation and shared experiences.'}
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => {
                                setTestResult(null)
                                setIsTestActive(false)
                            }}
                            className="w-full h-12 gradient-love text-white font-semibold"
                        >
                            Try Again
                        </Button>
                    </div>
                )}
            </div>

            {/* Chemistry Test Component */}
            <ChemistryTest
                isActive={isTestActive}
                onComplete={handleComplete}
                onCancel={() => setIsTestActive(false)}
            />
        </div>
    )
}
