"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MapPin, Navigation, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function LocationScreen() {
  const { setCurrentScreen, setIsOnboarded } = useApp()
  const [showManual, setShowManual] = useState(false)
  const [city, setCity] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEnableLocation = () => {
    setIsLoading(true)
    // Simulate location request
    setTimeout(() => {
      setIsLoading(false)
      setIsOnboarded(true)
      setCurrentScreen("feed")
    }, 1500)
  }

  const handleManualSubmit = () => {
    if (city.length > 0) {
      setIsOnboarded(true)
      setCurrentScreen("feed")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center px-4 h-14">
        <button
          onClick={() => setCurrentScreen("video")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full flex-1 transition-colors",
                "bg-primary"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 flex flex-col items-center">
        <h1 className="text-2xl font-semibold text-foreground mb-2 text-center">
          Find vibes nearby
        </h1>
        <p className="text-muted-foreground text-center mb-10 max-w-xs">
          We use your location to show you people around you
        </p>

        {/* Illustration */}
        <div className="relative w-48 h-48 mb-10">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-primary/15" />
          <div className="absolute inset-8 rounded-full bg-primary/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full gradient-love flex items-center justify-center shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          
          {/* Floating dots */}
          <div className="absolute top-4 right-8 w-3 h-3 rounded-full bg-secondary" />
          <div className="absolute bottom-8 left-4 w-2 h-2 rounded-full bg-primary" />
          <div className="absolute top-12 left-2 w-2 h-2 rounded-full bg-gold" />
        </div>

        {showManual ? (
          <div className="w-full max-w-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search for your city..."
                className="h-14 pl-12 border-border focus:border-primary focus:ring-primary"
              />
            </div>
            <button
              onClick={() => setShowManual(false)}
              className="text-primary text-sm font-medium mt-4 block mx-auto"
            >
              Use device location instead
            </button>
          </div>
        ) : (
          <>
            <Button
              onClick={handleEnableLocation}
              disabled={isLoading}
              className="w-full max-w-sm h-14 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-base rounded-xl transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Getting location...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  <span>Enable Location</span>
                </div>
              )}
            </Button>

            <button
              onClick={() => setShowManual(true)}
              className="text-muted-foreground text-sm font-medium mt-4 hover:text-foreground transition-colors"
            >
              Enter location manually
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      {showManual && (
        <div className="p-6 safe-bottom">
          <Button
            onClick={handleManualSubmit}
            disabled={city.length === 0}
            className="w-full h-14 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-base rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}
