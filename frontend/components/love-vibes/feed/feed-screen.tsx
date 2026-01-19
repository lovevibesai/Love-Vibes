"use client"

import { useState } from "react"
import Image from "next/image"
import { X, Heart, RefreshCw, SlidersHorizontal, RotateCcw } from "lucide-react"
import { SwipeCard } from "./swipe-card"
import { MatchModal } from "./match-modal"
import { ExpandedProfile } from "./expanded-profile"
import { useApp, mockUsers, type User } from "@/lib/app-context"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api-client"
import { useEffect } from "react"
import { ProximityAlert } from "../proximity/proximity-alert"

export function FeedScreen() {
  const { mode, setShowMatchModal, setMatchedUser, showMatchModal, matchedUser, setCurrentScreen, loadFeed } = useApp()
  const [cards, setCards] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [swipedCards, setSwipedCards] = useState<string[]>([])
  const [expandedUser, setExpandedUser] = useState<User | null>(null)
  const [showProximityAlert, setShowProximityAlert] = useState(false)
  const [proximityMatch, setProximityMatch] = useState<User | null>(null)

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true)
      try {
        // In a real app, we'd get actual coords. For now, using default SF coords.
        const results = await loadFeed(37.7749, -122.4194)
        if (results) {
          // Transform backend schema to frontend User type if needed
          const mappedResults = results.map((u: any) => ({
            ...u,
            id: u.id || u._id,
            photoUrl: u.photo_urls ? JSON.parse(u.photo_urls)[0] : u.main_photo_url,
            photos: u.photo_urls ? JSON.parse(u.photo_urls) : [],
          }))
          setCards(mappedResults)
        }
      } catch (e) {
        console.error("Feed fetch error:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchFeed()
  }, [mode, loadFeed])

  const visibleCards = cards.filter((c) => !swipedCards.includes(c.id))
  const isEmpty = visibleCards.length === 0 && !loading

  const handleSwipe = async (userId: string, direction: "left" | "right") => {
    setSwipedCards((prev) => [...prev, userId])

    try {
      if (direction === "right") {
        const res = await api.actions.like(userId)
        if (res.data?.match?.is_match) {
          const matchedUserInfo = cards.find((c) => c.id === userId)
          if (matchedUserInfo) {
            setMatchedUser(matchedUserInfo)
            setShowMatchModal(true)
          }
        }
      } else {
        await api.actions.pass(userId)
      }
    } catch (e) {
      console.error("Swipe failed to sync:", e)
    }
  }

  const handleButtonSwipe = (direction: "left" | "right") => {
    if (visibleCards.length > 0) {
      handleSwipe(visibleCards[0].id, direction)
    }
  }

  const handleReset = () => {
    setSwipedCards([])
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="w-10" />
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Love Vibes"
            width={36}
            height={36}
          />
          <span className="font-light tracking-[0.15em] text-foreground text-sm">
            LOVE VIBES
          </span>
        </div>
        <button
          onClick={() => setCurrentScreen("filters")}
          className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Filters"
        >
          <SlidersHorizontal className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Card Stack */}
      <div className="flex-1 relative px-2 py-4">
        {isEmpty ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {"You're all caught up!"}
            </h2>
            <p className="text-muted-foreground mb-6">
              Check back soon for new vibes, or adjust your preferences to discover more people.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentScreen("filters")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Adjust filters
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        ) : (
          <>
            {visibleCards.slice(0, 2).reverse().map((user, index) => (
              <SwipeCard
                key={user.id}
                user={user}
                isTop={index === visibleCards.slice(0, 2).length - 1}
                onSwipe={(direction) => handleSwipe(user.id, direction)}
                onTap={() => setExpandedUser(user)}
              />
            ))}
          </>
        )}
      </div>

      {/* Action Buttons */}
      {!isEmpty && (
        <div className="flex items-center justify-center gap-4 pb-6 pt-2">
          {/* Pass Button */}
          <button
            onClick={() => handleButtonSwipe("left")}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              "bg-card border-2 border-destructive/20 shadow-card",
              "hover:bg-destructive/5 active:scale-95 transition-all"
            )}
            aria-label="Pass"
          >
            <X className="w-8 h-8 text-destructive" />
          </button>

          {/* Rewind Button */}
          <button
            onClick={() => {
              if (swipedCards.length > 0) {
                setSwipedCards(prev => prev.slice(0, -1))
              }
            }}
            disabled={swipedCards.length === 0}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              "bg-card border-2 border-primary/20 shadow-card",
              "hover:bg-primary/5 active:scale-95 transition-all",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            aria-label="Rewind"
          >
            <RotateCcw className="w-5 h-5 text-primary" />
          </button>

          {/* Like Button */}
          <button
            onClick={() => handleButtonSwipe("right")}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center",
              "bg-primary shadow-modal",
              "hover:bg-primary-hover active:scale-95 transition-all"
            )}
            aria-label="Like"
          >
            <Heart className="w-10 h-10 text-white" fill="currentColor" />
          </button>
        </div>
      )}

      {/* Match Modal */}
      {showMatchModal && matchedUser && (
        <MatchModal user={matchedUser} />
      )}

      {/* Expanded Profile */}
      {expandedUser && (
        <ExpandedProfile
          profile={expandedUser}
          onClose={() => setExpandedUser(null)}
          onLike={() => {
            handleSwipe(expandedUser.id, "right")
            setExpandedUser(null)
          }}
          onPass={() => {
            handleSwipe(expandedUser.id, "left")
            setExpandedUser(null)
          }}
          onSuperLike={() => {
            // Implement Super Like API call if needed
            setExpandedUser(null)
          }}
        />
      )}

      {/* Proximity Alert */}
      {showProximityAlert && proximityMatch && (
        <ProximityAlert
          match={proximityMatch}
          distance={350}
          venue="Blue Bottle Coffee"
          onAccept={() => {
            setShowProximityAlert(false)
          }}
          onDecline={() => {
            setShowProximityAlert(false)
          }}
        />
      )}
    </div>
  )
}
