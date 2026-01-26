"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Check, Star, Zap, Heart } from "lucide-react"

export function PremiumModal() {
    const [open, setOpen] = useState(false)

    const features = [
        { icon: Heart, label: "Unlimited Likes", desc: "Swipe as much as you want" },
        { icon: Star, label: "See Who Likes You", desc: "Match instantly with admirers" },
        { icon: Zap, label: "5 Super Likes / Week", desc: "Stand out from the crowd" },
        { icon: Check, label: "Advanced Filters", desc: "Find exactly who you want" },
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F2D06B] hover:opacity-90 text-[#3D1F3D] font-bold border-0"
                >
                    <Star className="w-4 h-4 mr-2" fill="currentColor" />
                    GET GOLD
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#3D1F3D] text-white border-[#D4AF37]/20 p-0 overflow-hidden">
                <div className="bg-gradient-to-b from-[#D4AF37]/20 to-transparent p-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D4AF37] to-[#F2D06B] rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                        <Star className="w-8 h-8 text-[#3D1F3D]" fill="currentColor" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F2D06B]">
                            LOVE VIBES GOLD
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-white/80 mt-2">Unlock the full experience</p>
                </div>

                <div className="p-6 space-y-4">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#D4AF37]">
                                <f.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold">{f.label}</p>
                                <p className="text-xs text-white/60">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 pt-0">
                    <Button className="w-full h-12 bg-gradient-to-r from-[#D4AF37] to-[#F2D06B] text-[#3D1F3D] font-bold text-lg hover:brightness-110 border-0">
                        Upgrade for $14.99/mo
                    </Button>
                    <p className="text-center text-xs text-white/40 mt-3">Recurring billing. Cancel anytime.</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
