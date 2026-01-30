"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Heart, Trophy, Share2, Copy, Check } from "lucide-react"

interface SuccessStory {
    id: string
    user_a_name: string
    user_b_name: string
    user_a_photo: string
    user_b_photo: string
    story_text: string
    relationship_length: string
    created_at: number
}

export function SuccessStoriesScreen() {
    const { setCurrentScreen } = useApp()
    const [stories, setStories] = useState<SuccessStory[]>([])
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        loadStories()
    }, [])

    const loadStories = async () => {
        // In a real app, this would load from the API
        const SUCCESS_STORIES: SuccessStory[] = [
            {
                id: "s1",
                user_a_name: "Alex",
                user_b_name: "Jordan",
                user_a_photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
                user_b_photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
                story_text: "We connected over our shared love for minimalist design and deep tech.",
                relationship_length: "6 months",
                created_at: Date.now(),
            }
        ]
        setStories(SUCCESS_STORIES)
    }

    const handleShare = () => {
        navigator.clipboard.writeText("Check out Love Vibes - where real connections happen!")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                <button
                    onClick={() => setCurrentScreen("feed")}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Success Stories</h1>
                    <p className="text-xs text-muted-foreground">Real couples, real love</p>
                </div>
            </header>

            {/* Hero Section */}
            <div className="p-6 bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-b border-border">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-white fill-current" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Love Found Here</h2>
                    <p className="text-muted-foreground mb-4">
                        Join thousands of couples who found their perfect match
                    </p>
                    <Button
                        onClick={handleShare}
                        variant="outline"
                        className="gap-2"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Share Love Vibes'}
                    </Button>
                </div>
            </div>

            {/* Stories List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4 max-w-2xl mx-auto">
                    {stories.map((story) => (
                        <div
                            key={story.id}
                            className="bg-card rounded-2xl shadow-card overflow-hidden border border-border"
                        >
                            {/* Couple Photos */}
                            <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={story.user_a_photo}
                                        alt={story.user_a_name}
                                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                                    />
                                    <Heart className="w-8 h-8 text-rose-500 fill-current" />
                                    <img
                                        src={story.user_b_photo}
                                        alt={story.user_b_name}
                                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                                    />
                                </div>
                            </div>

                            {/* Story Content */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-foreground">
                                        {story.user_a_name} & {story.user_b_name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Trophy className="w-4 h-4 text-primary" />
                                        <span>{story.relationship_length}</span>
                                    </div>
                                </div>
                                <p className="text-foreground leading-relaxed italic">
                                    &quot;{story.story_text}&quot;
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Your Story CTA */}
                <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Found Your Match?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Share your love story and inspire others to find their perfect connection.
                    </p>
                    <Button className="w-full gradient-love text-white font-semibold">
                        Submit Your Story
                    </Button>
                </div>
            </div>
        </div>
    )
}
