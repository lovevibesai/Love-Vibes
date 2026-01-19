"use client"

import { Heart, MessageCircle, User } from "lucide-react"
import { useApp, type AppScreen } from "@/lib/app-context"
import { cn } from "@/lib/utils"

const navItems: { icon: typeof Heart; label: string; screen: AppScreen }[] = [
  { icon: Heart, label: "Discover", screen: "feed" },
  { icon: MessageCircle, label: "Matches", screen: "matches" },
  { icon: User, label: "Profile", screen: "profile" },
]

export function BottomNav() {
  const { currentScreen, setCurrentScreen } = useApp()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen
          const Icon = item.icon
          
          return (
            <button
              key={item.screen}
              onClick={() => setCurrentScreen(item.screen)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A2A4A] focus-visible:ring-offset-2",
                isActive ? "text-[#5A2A4A]" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon 
                className={cn(
                  "w-6 h-6 transition-transform",
                  isActive && "scale-110"
                )} 
                fill={isActive ? "currentColor" : "none"}
              />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
