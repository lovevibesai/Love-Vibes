"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfilePrompt {
    id: string
    prompt_text: string
    category: string
}

interface PromptSelectionProps {
    prompts: ProfilePrompt[]
    onComplete: (responses: Array<{ prompt_id: string; response_text: string; display_order: number }>) => void
}

export function PromptSelection({ prompts, onComplete }: PromptSelectionProps) {
    const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])
    const [responses, setResponses] = useState<Record<string, string>>({})
    const [currentStep, setCurrentStep] = useState<'select' | 'respond'>('select')

    const handlePromptToggle = (promptId: string) => {
        if (selectedPrompts.includes(promptId)) {
            setSelectedPrompts(selectedPrompts.filter(id => id !== promptId))
        } else if (selectedPrompts.length < 3) {
            setSelectedPrompts([...selectedPrompts, promptId])
        }
    }

    const handleNext = () => {
        if (selectedPrompts.length === 3) {
            setCurrentStep('respond')
        }
    }

    const handleResponseChange = (promptId: string, text: string) => {
        setResponses({ ...responses, [promptId]: text })
    }

    const handleComplete = () => {
        const promptResponses = selectedPrompts.map((promptId, index) => ({
            prompt_id: promptId,
            response_text: responses[promptId] || '',
            display_order: index
        }))
        onComplete(promptResponses)
    }

    const canComplete = selectedPrompts.length === 3 && selectedPrompts.every(id => (responses[id]?.trim()?.length || 0) >= 3)

    if (currentStep === 'select') {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-serif font-bold text-white mb-2">
                        Choose Your Prompts
                    </h2>
                    <p className="text-white/70">
                        Select 3 prompts to showcase your personality ({selectedPrompts.length}/3)
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {prompts.map((prompt) => {
                        const isSelected = selectedPrompts.includes(prompt.id)
                        return (
                            <button
                                key={prompt.id}
                                onClick={() => handlePromptToggle(prompt.id)}
                                className={cn(
                                    "w-full p-4 rounded-2xl border-2 text-left transition-all",
                                    isSelected
                                        ? "border-primary bg-primary/20"
                                        : "border-white/10 bg-white/5 hover:border-primary/50"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={cn("font-medium", isSelected ? "text-white" : "text-white/70")}>{prompt.prompt_text}</p>
                                        <p className="text-xs text-white/40 capitalize mt-1">{prompt.category}</p>
                                    </div>
                                    {isSelected && (
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>

                <Button
                    className="w-full h-14 gradient-love text-white rounded-2xl font-bold"
                    onClick={handleNext}
                    disabled={selectedPrompts.length !== 3}
                >
                    Continue
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-serif font-bold text-white mb-2">
                    Share Your Answers
                </h2>
                <p className="text-white/70">
                    Write responses that show who you are
                </p>
            </div>

            <div className="space-y-6">
                {selectedPrompts.map((promptId) => {
                    const prompt = prompts.find(p => p.id === promptId)
                    if (!prompt) return null

                    return (
                        <div key={promptId} className="space-y-2">
                            <label className="font-medium text-white">{prompt.prompt_text}</label>
                            <Textarea
                                value={responses[promptId] || ''}
                                onChange={(e) => handleResponseChange(promptId, e.target.value)}
                                placeholder="Share your answer..."
                                className="min-h-[100px] resize-none bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                maxLength={150}
                            />
                            <p className="text-xs text-white/40 text-right">
                                {responses[promptId]?.length || 0}/150
                            </p>
                        </div>
                    )
                })}
            </div>

            <div className="flex gap-3">
                <Button
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl border-white/10 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => setCurrentStep('select')}
                >
                    Back
                </Button>
                <Button
                    className="flex-1 h-14 gradient-love text-white rounded-2xl font-bold"
                    onClick={handleComplete}
                    disabled={!canComplete}
                >
                    Complete
                </Button>
            </div>
        </div>
    )
}
