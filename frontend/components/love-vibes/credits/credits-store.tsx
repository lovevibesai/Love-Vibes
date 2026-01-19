"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  Coins,
  Gift,
  Sparkles,
  Crown,
  Check
} from "lucide-react"
import { PremiumModal } from "@/components/love-vibes/premium-modal"

interface CreditPackage {
  id: string
  credits: number
  price: number
  popular?: boolean
  bonus?: number
}

const creditPackages: CreditPackage[] = [
  { id: "starter", credits: 50, price: 4.99 },
  { id: "popular", credits: 150, price: 9.99, popular: true, bonus: 25 },
  { id: "value", credits: 350, price: 19.99, bonus: 75 },
  { id: "premium", credits: 800, price: 39.99, bonus: 200 },
]

export function CreditsStore() {
  const { setCurrentScreen, user, updateUser } = useApp()
  const [selectedPackage, setSelectedPackage] = useState<string | null>("popular")
  const [isPurchasing, setIsPurchasing] = useState(false)

  const handlePurchase = () => {
    if (!selectedPackage) return

    setIsPurchasing(true)
    const pkg = creditPackages.find(p => p.id === selectedPackage)

    // Simulate purchase
    setTimeout(() => {
      if (pkg) {
        const totalCredits = pkg.credits + (pkg.bonus || 0)
        updateUser({ credits: (user.credits || 0) + totalCredits })
      }
      setIsPurchasing(false)
      setCurrentScreen("profile")
    }, 1500)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button
          onClick={() => setCurrentScreen("profile")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Get Credits</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Premium Upsell */}
        <section className="p-4 bg-gradient-to-r from-[#D4AF37]/10 to-[#F2D06B]/10 border-b border-[#D4AF37]/20">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-[#D4AF37] text-lg">Love Vibes Gold</h2>
              <p className="text-sm text-foreground/80">Unlock exclusive features</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          <PremiumModal />
        </section>

        {/* Current Balance */}
        <div
          className="p-6"
          style={{ background: "linear-gradient(160deg, #D4635E 0%, #6B3358 50%, #3D1F3D 100%)" }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Coins className="w-8 h-8 text-[#D4AF37]" />
            <span className="text-4xl font-bold text-white">{user.credits || 0}</span>
          </div>
          <p className="text-center text-white/80">Your current balance</p>
        </div>

        {/* What Credits Are For */}
        <div className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Use credits for</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-card rounded-xl shadow-card text-center">
              <Gift className="w-6 h-6 text-[#5A2A4A] mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Send Gifts</p>
            </div>
            <div className="p-3 bg-card rounded-xl shadow-card text-center">
              <Sparkles className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Super Likes</p>
            </div>
            <div className="p-3 bg-card rounded-xl shadow-card text-center">
              <Crown className="w-6 h-6 text-[#D4635E] mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Boost Profile</p>
            </div>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Choose a package</h2>
          <div className="space-y-3">
            {creditPackages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all relative ${selectedPackage === pkg.id
                    ? "border-[#5A2A4A] bg-[#5A2A4A]/5"
                    : "border-border bg-card"
                  }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-[#D4AF37] text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={selectedPackage === pkg.id
                        ? { background: "linear-gradient(160deg, #D4635E 0%, #5A2A4A 100%)" }
                        : { background: "#F0ECEA" }
                      }
                    >
                      <Coins className={`w-6 h-6 ${selectedPackage === pkg.id ? "text-white" : "text-foreground"}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">
                        {pkg.credits} Credits
                        {pkg.bonus && (
                          <span className="text-[#4A7C59] ml-2">+{pkg.bonus} bonus</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${(pkg.price / (pkg.credits + (pkg.bonus || 0)) * 100).toFixed(1)}c per credit
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-foreground">${pkg.price}</span>
                    {selectedPackage === pkg.id && (
                      <div className="w-6 h-6 rounded-full bg-[#5A2A4A] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trust Note */}
        <div className="px-4 pb-4">
          <div className="p-4 bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground text-center">
              Payments are secure and encrypted. Credits never expire.
            </p>
          </div>
        </div>
      </div>

      {/* Purchase Button */}
      <div className="p-4 border-t border-border bg-card safe-bottom">
        <Button
          className="w-full h-12 bg-[#5A2A4A] hover:bg-[#6B3358] text-white font-semibold text-base rounded-xl"
          onClick={handlePurchase}
          disabled={!selectedPackage || isPurchasing}
        >
          {isPurchasing ? "Processing..." : `Purchase ${selectedPackage ? creditPackages.find(p => p.id === selectedPackage)?.credits : 0} Credits`}
        </Button>
      </div>
    </div>
  )
}
