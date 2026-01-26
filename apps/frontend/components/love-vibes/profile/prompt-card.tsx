"use client"

import { cn } from "@/lib/utils"

interface PromptCardProps {
    promptText: string
    responseText: string
    category?: string
    className?: string
}

export function PromptCard({ promptText, responseText, category, className }: PromptCardProps) {
    return (
        <div className={cn("bg-card rounded-2xl p-5 border border-border shadow-card", className)}>
            <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif font-semibold text-foreground text-lg leading-tight">
                        {promptText}
                    </h4>
                    {category && (
                        <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded-full">
                            {category}
                        </span>
                    )}
                </div>
                <p className="text-foreground leading-relaxed">
                    {responseText}
                </p>
            </div>
        </div>
    )
}
