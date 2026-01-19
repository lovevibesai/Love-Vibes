"use client"

import { useState } from "react"
import { X, Heart, Star, Coffee, Flower2, Sparkles, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { cn } from "@/lib/utils"

interface Gift {
  id: string
  name: string
  icon: typeof Heart
  cost: number
  color: string
}

const gifts: Gift[] = [
  { id: "rose", name: "Rose", icon: Flower2, cost: 10, color: "text-destructive" },
  { id: "heart", name: "Heart", icon: Heart, cost: 15, color: "text-primary" },
  { id: "star", name: "Star", icon: Star, cost: 20, color: "text-gold" },
  { id: "coffee", name: "Coffee", icon: Coffee, cost: 25, color: "text-secondary" },
  { id: "sparkle", name: "Sparkle", icon: Sparkles, cost: 30, color: "text-gold" },
  { id: "crown", name: "Crown", icon: Crown, cost: 50, color: "text-gold" },
]

interface GiftSheetProps {
  onClose: () => void
  onSendGift: (giftName: string) => void
}

export function GiftSheet({ onClose, onSendGift }: GiftSheetProps) {
  const { currentUser } = useApp()
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const credits = currentUser?.credits || 100

  const handleSend = () => {
    if (selectedGift && credits >= selectedGift.cost) {
      onSendGift(selectedGift.name)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
      >
        <div
          className="w-full max-w-md bg-card rounded-t-[32px] shadow-2xl animate-in slide-in-from-bottom duration-300 pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gift-sheet-title"
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pb-4">
            <div>
              <h2 id="gift-sheet-title" className="text-lg font-semibold text-foreground">
                Send a Gift
              </h2>
              <p className="text-sm text-muted-foreground">
                You have <span className="font-medium text-gold">{credits} credits</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Gift Grid */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-3 gap-3">
              {gifts.map((gift) => {
                const Icon = gift.icon
                const isSelected = selectedGift?.id === gift.id
                const canAfford = credits >= gift.cost

                return (
                  <button
                    key={gift.id}
                    onClick={() => canAfford && setSelectedGift(gift)}
                    disabled={!canAfford}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : canAfford
                          ? "border-border hover:border-primary/50 bg-card"
                          : "border-border bg-muted/50 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Icon className={cn("w-8 h-8 mb-2", gift.color)} fill="currentColor" />
                    <span className="text-sm font-medium text-foreground">{gift.name}</span>
                    <span className="text-xs text-gold font-medium">{gift.cost} credits</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action */}
          <div className="px-6 pb-6 safe-bottom">
            <Button
              onClick={handleSend}
              disabled={!selectedGift || credits < (selectedGift?.cost || 0)}
              className="w-full h-14 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-base rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {selectedGift
                ? `Send ${selectedGift.name} for ${selectedGift.cost} credits`
                : "Select a gift"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
