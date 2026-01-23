"use client"

import { useEffect, useState } from "react"
import { useApp, type User } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MatchModalProps {
  user: User
}

export function MatchModal({ user }: MatchModalProps) {
  const { setShowMatchModal, setCurrentScreen, currentUser } = useApp()
  const [showConfetti, setShowConfetti] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    // Trigger haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }

    // Show confetti
    setTimeout(() => setShowConfetti(true), 200)
    setTimeout(() => setIsAnimating(false), 500)
  }, [])

  const handleSendMessage = () => {
    setShowMatchModal(false)
    setCurrentScreen("chat")
  }

  const handleKeepSwiping = () => {
    setShowMatchModal(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
    >
      {/* Backdrop - Logo gradient */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #2A0D1F 0%, #7A1F3D 50%, #C84A4A 100%)" }}
      />

      {/* Confetti - Rose gold and gold tones */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-3 h-3 rounded-sm animate-confetti",
                i % 5 === 0 && "bg-[#E6C38A]", // Soft Gold
                i % 5 === 1 && "bg-white",
                i % 5 === 2 && "bg-[#D4A5A0]", // Rose Gold
                i % 5 === 3 && "bg-white/70",
                i % 5 === 4 && "bg-[#F1D6A3]"  // Champagne Gold
              )}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8 text-center">
        {/* Profile Photos */}
        <div className={cn(
          "flex items-center justify-center mb-8 transition-all duration-500",
          isAnimating ? "scale-0" : "scale-100"
        )}>
          {/* Current User Photo */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-modal">
              <img
                src={currentUser?.photoUrl || "/placeholder.svg"}
                alt="You"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-[#C84A4A]" fill="currentColor" />
            </div>
          </div>

          {/* Matched User Photo */}
          <div className="relative -ml-6">
            <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-modal">
              <img
                src={user.photoUrl || "/placeholder.svg"}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-[#C84A4A]" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1
          id="match-title"
          className={cn(
            "font-serif text-4xl font-medium text-[#E6C38A] mb-3 transition-all duration-500 delay-200",
            isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          )}
        >
          A new connection is waiting ❤️
        </h1>

        <p className={cn(
          "text-white/90 text-lg mb-10 transition-all duration-500 delay-300",
          isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        )}>
          You and {user.name} have felt a spark
        </p>

        {/* Actions */}
        <div className={cn(
          "w-full max-w-xs space-y-3 transition-all duration-500 delay-400",
          isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        )}>
          <Button
            onClick={handleSendMessage}
            className="w-full h-14 bg-white text-[#2A0D1F] hover:bg-white/95 font-semibold text-base rounded-2xl shadow-modal transition-transform active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Send a Gentle Message
          </Button>

          <button
            onClick={handleKeepSwiping}
            className="w-full h-14 text-white/80 hover:text-white font-medium text-base transition-colors"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  )
}
