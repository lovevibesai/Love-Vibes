"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PromptSelection } from "@/components/love-vibes/profile/prompt-selection"
import { api } from "@/lib/api-client"

export function PromptsScreen() {
    const { setCurrentScreen, user } = useApp()
    const [prompts, setPrompts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPrompts()
    }, [])

    const loadPrompts = async () => {
        try {
            const data = await api.prompts.getAll()
            setPrompts(data)
        } catch (e) {
            console.error("Failed to load prompts", e)
        } finally {
            setLoading(false)
        }
    }

    const handleComplete = async (responses: Array<{ prompt_id: string; response_text: string; display_order: number }>) => {
        try {
            await api.prompts.saveResponses(user.id, responses)
            setCurrentScreen("video")
        } catch (e) {
            console.error("Failed to save prompts", e)
            alert("Failed to save your responses. Please try again.")
        }
    }

    const handleSkip = () => {
        setCurrentScreen("video")
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6EDEE] dark:bg-[#1A0814] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F6EDEE] dark:bg-[#1A0814] overflow-y-auto relative flex flex-col items-center">
            <div className="w-full max-w-md min-h-screen relative flex flex-col bg-[#F6EDEE] dark:bg-[#1A0814] text-[#2A0D1F] dark:text-[#F6EDEE] shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-b from-[#F6EDEE] dark:from-[#1A0814] to-transparent backdrop-blur-sm">
                    <div className="flex items-center justify-between p-4">
                        <button onClick={() => setCurrentScreen("profile-setup")} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="text-sm font-medium opacity-60">Step 2 of 3</div>
                        <button onClick={handleSkip} className="text-sm font-medium text-primary hover:underline">
                            Skip
                        </button>
                    </div>
                </div>

                <div className="flex-1 px-6 pb-8">
                    <PromptSelection prompts={prompts} onComplete={handleComplete} />
                </div>
            </div>
        </div>
    )
}
