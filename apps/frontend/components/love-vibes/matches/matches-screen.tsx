"use client"

import { useApp, type Match } from "@/lib/app-context"
import { Heart, MessageCircle } from "lucide-react"
import { TrustScore } from "../trust-score"
import { cn } from "@/lib/utils"

function formatTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

function MatchItem({ match, onClick }: { match: Match; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-card-elevated">
          <img
            src={match.user.photoUrl || "/placeholder.svg"}
            alt={match.user.name}
            className="w-full h-full object-cover"
          />
        </div>
        {match.unread && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">1</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={cn(
            "text-base font-semibold text-foreground truncate",
            match.unread && "font-bold"
          )}>
            {match.user.name}
          </h3>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {formatTime(match.timestamp)}
          </span>
        </div>
        <p className={cn(
          "text-sm truncate",
          match.unread ? "text-foreground font-medium" : "text-muted-foreground"
        )}>
          {match.lastMessage || "Send the first message!"}
        </p>
      </div>
    </button>
  )
}

export function MatchesScreen() {
  const { matches, setCurrentScreen } = useApp()

  const handleMatchClick = () => {
    setCurrentScreen("chat")
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">Matches</h1>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10">
          <Heart className="w-4 h-4 text-primary" fill="currentColor" />
          <span className="text-sm font-medium text-primary">{matches.length}</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No matches yet
            </h2>
            <p className="text-muted-foreground text-sm">
              Your vibe attracts your tribe. Keep swiping to find your match!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* New Matches Section */}
            <div className="py-4">
              <h2 className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                New Matches
              </h2>
              <div className="flex gap-4 px-6 overflow-x-auto pb-2">
                {matches.slice(0, 5).map((match) => (
                  <button
                    key={match.id}
                    onClick={handleMatchClick}
                    className="flex flex-col items-center flex-shrink-0"
                  >
                    <div className="relative mb-2">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
                        <img
                          src={match.user.photoUrl || "/placeholder.svg"}
                          alt={match.user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <TrustScore score={match.user.trustScore} size="sm" />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {match.user.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Section */}
            <div className="py-4">
              <h2 className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Messages
              </h2>
              <div>
                {matches.map((match) => (
                  <MatchItem
                    key={match.id}
                    match={match}
                    onClick={handleMatchClick}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
