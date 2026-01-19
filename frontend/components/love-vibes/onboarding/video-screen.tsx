"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Video, Circle, StopCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function VideoScreen() {
  const { setCurrentScreen, currentUser, setCurrentUser } = useApp()
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(15)
  const [hasRecorded, setHasRecorded] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRecording && recordingTime > 0) {
      timer = setInterval(() => {
        setRecordingTime((t) => t - 1)
      }, 1000)
    } else if (recordingTime === 0) {
      setIsRecording(false)
      setHasRecorded(true)
    }
    return () => clearInterval(timer)
  }, [isRecording, recordingTime])

  const handleStartRecording = () => {
    setIsRecording(true)
    setRecordingTime(15)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setHasRecorded(true)
  }

  const handleContinue = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        videoUrl: hasRecorded ? "https://example.com/video.mp4" : undefined,
      })
    }
    setCurrentScreen("location")
  }

  const handleSkip = () => {
    setCurrentScreen("location")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14">
        <button
          onClick={() => setCurrentScreen("profile-setup")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={handleSkip}
          className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
        >
          Skip
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
                i <= 4 ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 flex flex-col">
        <h1 className="text-2xl font-semibold text-foreground mb-2 text-center">
          Record a video intro
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Show your personality in 15 seconds
        </p>

        {/* Camera Preview */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-3xl overflow-hidden bg-foreground/90 shadow-modal">
            {/* Mock camera preview */}
            <div className="absolute inset-0 flex items-center justify-center">
              {hasRecorded ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-trust-high/20 flex items-center justify-center mb-3 mx-auto">
                    <Video className="w-8 h-8 text-trust-high" />
                  </div>
                  <p className="text-white font-medium">Video recorded!</p>
                  <button 
                    onClick={() => {
                      setHasRecorded(false)
                      setRecordingTime(15)
                    }}
                    className="text-white/70 text-sm mt-2 underline"
                  >
                    Record again
                  </button>
                </div>
              ) : isRecording ? (
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">
                    {recordingTime}
                  </div>
                  <p className="text-white/70">Recording...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Video className="w-12 h-12 text-white/50 mb-3 mx-auto" />
                  <p className="text-white/70">Tap to record</p>
                </div>
              )}
            </div>

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                <span className="text-white text-sm font-medium">REC</span>
              </div>
            )}
          </div>

          {/* Record Button */}
          <div className="mt-8">
            {isRecording ? (
              <button
                onClick={handleStopRecording}
                className="w-20 h-20 rounded-full bg-destructive flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                aria-label="Stop recording"
              >
                <StopCircle className="w-10 h-10 text-white" fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform",
                  hasRecorded ? "bg-trust-high" : "bg-primary"
                )}
                aria-label="Start recording"
              >
                <Circle className="w-10 h-10 text-white" fill="currentColor" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 safe-bottom">
        <Button
          onClick={handleContinue}
          className="w-full h-14 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-base rounded-xl transition-all active:scale-[0.98]"
        >
          {hasRecorded ? "Save & Continue" : "Continue without video"}
        </Button>
      </div>
    </div>
  )
}
