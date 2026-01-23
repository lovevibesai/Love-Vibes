"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  X,
  Flag,
  UserX,
  VolumeX,
  AlertTriangle
} from "lucide-react"

interface ChatMenuProps {
  userName: string
  onClose: () => void
  onUnmatch: () => void
  onReport: () => void
  onMute: () => void
}

export function ChatMenu({ userName, onClose, onUnmatch, onReport, onMute }: ChatMenuProps) {
  const [showReportModal, setShowReportModal] = useState(false)
  const [showUnmatchModal, setShowUnmatchModal] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string | null>(null)

  const reportReasons = [
    "Inappropriate messages",
    "Fake profile",
    "Harassment",
    "Spam or scam",
    "Other"
  ]

  if (showReportModal) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4">
        <div className="w-full max-w-md bg-card rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Report {userName}</h2>
            <button
              onClick={() => setShowReportModal(false)}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Help us understand what happened. Your report is anonymous and helps keep Love Vibes safe.
          </p>

          <div className="grid grid-cols-1 gap-2 mb-8">
            {reportReasons.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${selectedReason === reason
                  ? "border-rose-500 bg-rose-500/5 text-rose-500"
                  : "border-border bg-card text-foreground hover:border-border/50"
                  }`}
              >
                <span className="font-semibold">{reason}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <Button
              className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold"
              disabled={!selectedReason}
              onClick={() => {
                onReport()
                onClose()
              }}
            >
              Submit Report
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 bg-transparent border-border rounded-2xl font-bold"
              onClick={() => setShowReportModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (showUnmatchModal) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4">
        <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-8" />

          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Unmatch with {userName}?</h2>
            <p className="text-muted-foreground leading-relaxed">
              This will remove your match and delete all messages. This action cannot be undone.
            </p>
          </div>

          <div className="space-y-3 safe-bottom">
            <Button
              className="w-full h-14 bg-destructive hover:bg-destructive/90 text-white rounded-2xl font-bold"
              onClick={() => {
                onUnmatch()
                onClose()
              }}
            >
              Yes, Unmatch
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 bg-transparent border-border rounded-2xl font-bold"
              onClick={() => setShowUnmatchModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-card rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-8 opacity-50" />

        <div className="space-y-3">
          <button
            onClick={() => {
              onMute()
              onClose()
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-muted transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-background transition-colors">
              <VolumeX className="w-6 h-6 text-foreground" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground">Mute Notifications</p>
              <p className="text-sm text-muted-foreground">Stop receiving alerts</p>
            </div>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-muted transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <Flag className="w-6 h-6 text-amber-500" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground">Report</p>
              <p className="text-sm text-muted-foreground">Report inappropriate behavior</p>
            </div>
          </button>

          <button
            onClick={() => setShowUnmatchModal(true)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-destructive/5 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
              <UserX className="w-6 h-6 text-destructive" />
            </div>
            <div className="text-left">
              <p className="font-bold text-destructive">Unmatch</p>
              <p className="text-sm text-muted-foreground">Remove conversation</p>
            </div>
          </button>
        </div>

        <div className="mt-8 safe-bottom">
          <Button
            variant="outline"
            className="w-full h-14 bg-transparent border-border hover:bg-muted rounded-2xl font-bold text-lg"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
