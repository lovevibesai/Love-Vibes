"use client"

import React from "react"

import { TrustScore } from "./trust-score"
import { Button } from "@/components/ui/button"
import {
  X,
  Shield,
  CheckCircle,
  MessageCircle,
  Camera,
  Calendar,
  Star
} from "lucide-react"

interface TrustScoreDetailsProps {
  score: number
  onClose: () => void
  isOwnProfile?: boolean
}

interface TrustFactor {
  label: string
  description: string
  points: number
  maxPoints: number
  icon: React.ReactNode
  completed: boolean
}

export function TrustScoreDetails({ score, onClose, isOwnProfile = false }: TrustScoreDetailsProps) {
  const factors: TrustFactor[] = [
    {
      label: "Phone Verified",
      description: "Verified phone number",
      points: 15,
      maxPoints: 15,
      icon: <CheckCircle className="w-5 h-5" />,
      completed: true,
    },
    {
      label: "Photo Verified",
      description: "Selfie verification completed",
      points: score >= 50 ? 20 : 0,
      maxPoints: 20,
      icon: <Camera className="w-5 h-5" />,
      completed: score >= 50,
    },
    {
      label: "Active Member",
      description: "Regular activity on platform",
      points: Math.min(15, Math.floor(score / 5)),
      maxPoints: 15,
      icon: <Calendar className="w-5 h-5" />,
      completed: score >= 30,
    },
    {
      label: "Good Conversations",
      description: "Positive chat interactions",
      points: Math.min(25, Math.floor(score / 3)),
      maxPoints: 25,
      icon: <MessageCircle className="w-5 h-5" />,
      completed: score >= 60,
    },
    {
      label: "Community Standing",
      description: "No reports or violations",
      points: Math.min(25, Math.floor(score / 3)),
      maxPoints: 25,
      icon: <Star className="w-5 h-5" />,
      completed: score >= 75,
    },
  ]

  const getScoreLevel = () => {
    if (score >= 80) return { label: "Excellent", color: "text-trust-high" }
    if (score >= 60) return { label: "Good", color: "text-trust-high" }
    if (score >= 40) return { label: "Building", color: "text-trust-mid" }
    return { label: "New", color: "text-muted-foreground" }
  }

  const level = getScoreLevel()

  return (
    <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm flex items-end z-50">
      <div className="w-full max-h-[85vh] bg-card rounded-t-3xl flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-trust-high" />
            <h2 className="text-lg font-semibold text-foreground">Trust Score</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Score Display */}
          <div className="flex flex-col items-center mb-6">
            <TrustScore score={score} size="lg" showLabel={false} />
            <p className={`mt-3 text-lg font-semibold ${level.color}`}>{level.label}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isOwnProfile ? "Your trust level" : "This user's trust level"}
            </p>
          </div>

          {/* What is Trust Score */}
          <div className="p-4 bg-muted rounded-xl mb-6">
            <h3 className="font-semibold text-foreground mb-2">What is Trust Score?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Trust Score reflects how reliable and genuine a member is based on their verification status,
              activity, and community interactions. Higher scores indicate more trustworthy profiles.
            </p>
          </div>

          {/* Score Breakdown */}
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-4">Score Breakdown</h3>
            <div className="space-y-3">
              {factors.map((factor, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${factor.completed
                    ? "bg-trust-high/5 border-trust-high/20"
                    : "bg-card border-border"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${factor.completed ? "bg-trust-high/10 text-trust-high" : "bg-muted text-muted-foreground"
                        }`}>
                        {factor.icon}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{factor.label}</p>
                        <p className="text-sm text-muted-foreground">{factor.description}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${factor.completed ? "text-trust-high" : "text-muted-foreground"
                      }`}>
                      +{factor.points}/{factor.maxPoints}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips for improving (only show on own profile) */}
          {isOwnProfile && score < 80 && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">Improve Your Score</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                {score < 50 && <li>- Complete selfie verification for +20 points</li>}
                {score < 60 && <li>- Stay active and engage in conversations</li>}
                {score < 75 && <li>- Maintain positive interactions with matches</li>}
              </ul>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="p-4 border-t border-border safe-bottom">
          <Button
            variant="outline"
            className="w-full h-12 bg-transparent"
            onClick={onClose}
          >
            Got It
          </Button>
        </div>
      </div>
    </div>
  )
}
