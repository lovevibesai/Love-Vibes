"use client"

import { useApp, type AppMode } from "@/lib/app-context"
import { ArrowLeft, Heart, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export function ModeScreen() {
  const { setCurrentScreen, mode, setMode } = useApp()

  const handleModeSelect = (selectedMode: AppMode) => {
    setMode(selectedMode)
    setCurrentScreen("profile-setup")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center px-4 h-14">
        <button
          onClick={() => setCurrentScreen("phone")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Progress */}
      <div className="px-6 mb-8">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full flex-1 transition-colors",
                i <= 2 ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6">
        <h1 className="text-2xl font-semibold text-foreground mb-2 text-center">
          {"What are you looking for?"}
        </h1>
        <p className="text-muted-foreground text-center mb-10">
          You can change this anytime
        </p>

        {/* Mode Cards */}
        <div className="space-y-4">
          {/* Dating Mode */}
          <button
            onClick={() => handleModeSelect("dating")}
            className={cn(
              "w-full p-6 rounded-2xl text-left transition-all relative overflow-hidden group",
              "border-2",
              mode === "dating"
                ? "border-[#5A2A4A] bg-[#5A2A4A]/5 shadow-modal"
                : "border-border hover:border-[#5A2A4A]/50"
            )}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
              style={{ background: "linear-gradient(160deg, #D4635E 0%, #6B3358 50%, #3D1F3D 100%)" }}
            />
            <div className="relative flex items-start gap-4">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(160deg, #D4635E 0%, #6B3358 50%, #3D1F3D 100%)" }}
              >
                <Heart className="w-7 h-7 text-white" fill="currentColor" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Looking for Love
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Find romantic connections and meaningful relationships
                </p>
              </div>
            </div>
          </button>

          {/* Friendship Mode */}
          <button
            onClick={() => handleModeSelect("friendship")}
            className={cn(
              "w-full p-6 rounded-2xl text-left transition-all relative overflow-hidden group",
              "border-2",
              mode === "friendship"
                ? "border-[#D4635E] bg-[#D4635E]/5 shadow-modal"
                : "border-border hover:border-[#D4635E]/50"
            )}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
              style={{ background: "linear-gradient(160deg, #D4AF37 0%, #D4635E 50%, #6B3358 100%)" }}
            />
            <div className="relative flex items-start gap-4">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(160deg, #D4AF37 0%, #D4635E 50%, #6B3358 100%)" }}
              >
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Seeking Friendship
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Connect with like-minded people for genuine friendships
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
