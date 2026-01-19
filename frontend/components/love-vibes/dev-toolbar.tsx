"use client"

import React from "react"

import { useState } from "react"
import { useApp, type AppScreen } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Settings, X, Smartphone, Heart, MessageCircle, User, MapPin, Video, UserCircle, Phone, Sparkles, SlidersHorizontal, Coins } from "lucide-react"

const screens: { id: AppScreen; label: string; icon: React.ReactNode; isOnboarding: boolean }[] = [
  { id: "welcome", label: "Welcome", icon: <Sparkles className="h-4 w-4" />, isOnboarding: true },
  { id: "phone", label: "Phone Verify", icon: <Phone className="h-4 w-4" />, isOnboarding: true },
  { id: "mode", label: "Mode Select", icon: <Heart className="h-4 w-4" />, isOnboarding: true },
  { id: "profile-setup", label: "Profile Setup", icon: <UserCircle className="h-4 w-4" />, isOnboarding: true },
  { id: "video", label: "Video Intro", icon: <Video className="h-4 w-4" />, isOnboarding: true },
  { id: "location", label: "Location", icon: <MapPin className="h-4 w-4" />, isOnboarding: true },
  { id: "feed", label: "Discovery Feed", icon: <Smartphone className="h-4 w-4" />, isOnboarding: false },
  { id: "filters", label: "Filters", icon: <SlidersHorizontal className="h-4 w-4" />, isOnboarding: false },
  { id: "matches", label: "Matches", icon: <MessageCircle className="h-4 w-4" />, isOnboarding: false },
  { id: "chat", label: "Chat", icon: <MessageCircle className="h-4 w-4" />, isOnboarding: false },
  { id: "profile", label: "Profile", icon: <User className="h-4 w-4" />, isOnboarding: false },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" />, isOnboarding: false },
  { id: "credits", label: "Credits Store", icon: <Coins className="h-4 w-4" />, isOnboarding: false },
]

export function DevToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentScreen, setCurrentScreen, setIsOnboarded, isOnboarded } = useApp()

  const handleScreenChange = (screen: AppScreen, isOnboarding: boolean) => {
    setIsOnboarded(!isOnboarding)
    setCurrentScreen(screen)
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 h-12 w-12 rounded-full bg-[#8B3A3A] text-white shadow-lg flex items-center justify-center hover:bg-[#A64D4D] transition-colors"
        aria-label="Open screen preview menu"
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          {/* Menu Panel */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 pb-8 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Preview Screens</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current Screen Indicator */}
            <div className="mb-4 p-3 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground">Currently viewing:</p>
              <p className="font-medium text-foreground capitalize">
                {screens.find(s => s.id === currentScreen)?.label || currentScreen}
                <span className="text-xs text-muted-foreground ml-2">
                  ({isOnboarded ? "Main App" : "Onboarding"})
                </span>
              </p>
            </div>

            {/* Onboarding Screens */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Onboarding Flow</h3>
              <div className="grid grid-cols-2 gap-2">
                {screens.filter(s => s.isOnboarding).map((screen) => (
                  <Button
                    key={screen.id}
                    variant={currentScreen === screen.id && !isOnboarded ? "default" : "outline"}
                    className={`justify-start gap-2 h-auto py-3 ${
                      currentScreen === screen.id && !isOnboarded 
                        ? "bg-[#8B3A3A] hover:bg-[#A64D4D] text-white" 
                        : "bg-transparent"
                    }`}
                    onClick={() => handleScreenChange(screen.id, true)}
                  >
                    {screen.icon}
                    <span className="text-sm">{screen.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Main App Screens */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Main App</h3>
              <div className="grid grid-cols-2 gap-2">
                {screens.filter(s => !s.isOnboarding).map((screen) => (
                  <Button
                    key={screen.id}
                    variant={currentScreen === screen.id && isOnboarded ? "default" : "outline"}
                    className={`justify-start gap-2 h-auto py-3 ${
                      currentScreen === screen.id && isOnboarded 
                        ? "bg-[#8B3A3A] hover:bg-[#A64D4D] text-white" 
                        : "bg-transparent"
                    }`}
                    onClick={() => handleScreenChange(screen.id, false)}
                  >
                    {screen.icon}
                    <span className="text-sm">{screen.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Tap any screen to preview it instantly
            </p>
          </div>
        </div>
      )}
    </>
  )
}
