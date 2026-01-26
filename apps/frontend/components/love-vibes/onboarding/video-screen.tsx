"use client"

import { useState, useEffect, useRef } from "react"
import { useApp } from "@/lib/app-context"
import { api } from "@/lib/api-client"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Video,
  Circle,
  StopCircle,
  Zap,
  ShieldCheck,
  Camera,
  Sparkles,
  Play,
  RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"

export function VideoScreen() {
  const { setCurrentScreen, user, updateUser } = useApp()
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(15)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRecording && recordingTime > 0) {
      timer = setInterval(() => {
        setRecordingTime((t) => t - 1)
      }, 1000)
    } else if (recordingTime === 0) {
      handleStopRecording()
    }
    return () => clearInterval(timer)
  }, [isRecording, recordingTime])

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' })
        setVideoBlob(blob)
        setHasRecorded(true)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(15)
    } catch (err) {
      console.error("Camera/Mic error:", err)
      // Fallback or alert user
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleContinue = async () => {
    if (hasRecorded && videoBlob) {
      setIsUploading(true)
      try {
        const file = new File([videoBlob], "intro.mp4", { type: 'video/mp4' })
        const res = await api.media.upload(file, 'video')
        if (user) {
          await updateUser({
            videoUrl: res.url,
            hasVideoIntro: true
          })
        }
      } catch (err) {
        console.error("Upload failed", err)
      } finally {
        setIsUploading(false)
      }
    }
    setCurrentScreen("location")
  }

  const handleSkip = () => {
    localStorage.setItem('current_screen', 'location');
    setCurrentScreen("location")
  }

  return (
    <div className="h-full flex flex-col bg-[#1A0814] overflow-hidden relative font-sans select-none">
      {/* Deep Space Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[120%] h-[70%] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, #7A1F3D, transparent)' }}
        />
      </div>

      {/* Elite Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 border-b border-white/5 bg-black/5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentScreen("profile-setup")}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all shadow-xl"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black tracking-[0.4em] uppercase text-[#D4AF37] mb-1">Cinematic Capture</span>
          <span className="text-xs font-bold tracking-widest uppercase text-white/40">Step 04 / 05</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleSkip}
          className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-[#D4AF37] transition-colors"
        >
          Skip Protocol
        </motion.button>
      </header>

      {/* Progress Line */}
      <div className="relative h-[2px] w-full bg-white/5">
        <motion.div
          initial={{ width: "65%" }}
          animate={{ width: "85%" }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#D4AF37] to-[#7A1F3D] shadow-[0_0_10px_#D4AF37]"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative z-10 px-8 pt-12 pb-32 space-y-8 flex flex-col items-center">

        <div className="space-y-3 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-2"
          >
            <Camera className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Verification</span>
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Verify Yourself</h1>
          <p className="text-sm text-white/40 font-medium tracking-wide">A quick 15-second video to keep the community real.</p>
        </div>

        {/* Cinematic Viewfinder */}
        <div className="relative w-full max-w-[280px] aspect-[9/16] perspective-1000 group">
          <motion.div
            animate={{ rotateY: [-2, 2, -2], rotateX: [-1, 1, -1] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute inset-0 rounded-[40px] bg-black/40 border-2 border-[#D4AF37]/30 overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {isRecording && (
                <video
                  ref={(ref) => {
                    if (ref && streamRef.current) ref.srcObject = streamRef.current
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                />
              )}
              <AnimatePresence mode="wait">
                {hasRecorded ? (
                  <motion.div
                    key="recorded"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 px-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                      <Play className="w-10 h-10 text-[#D4AF37]" fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-white font-black uppercase tracking-widest text-xs">Video Captured</p>
                      <button
                        onClick={() => {
                          setHasRecorded(false)
                          setRecordingTime(15)
                        }}
                        className="flex items-center gap-2 text-[#D4AF37] font-bold text-[10px] uppercase tracking-widest mt-4 mx-auto hover:opacity-80 transition-opacity"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Re-record
                      </button>
                    </div>
                  </motion.div>
                ) : isRecording ? (
                  <motion.div
                    key="recording"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <div className="text-7xl font-black text-white tracking-tighter mb-4 tabular-nums">
                      {recordingTime}
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_10px_#D4AF37]" />
                      <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Recording...</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                      <Video className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Ready to record</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Corner Markers (High-Tech Feel) */}
            <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]/40 rounded-tl-lg" />
            <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]/40 rounded-tr-lg" />
            <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]/40 rounded-bl-lg" />
            <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]/40 rounded-br-lg" />
          </motion.div>

          {/* Holographic REC Light spill */}
          {isRecording && (
            <div className="absolute -inset-4 bg-[#7A1F3D]/20 blur-3xl pointer-events-none rounded-full" />
          )}
        </div>

        {/* Record Button Container */}
        <div className="flex flex-col items-center gap-6 mt-4">
          {isRecording ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleStopRecording}
              className="w-24 h-24 rounded-full border-4 border-[#7A1F3D] p-2 bg-black/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_#7A1F3D]"
            >
              <div className="w-10 h-10 bg-[#7A1F3D] rounded-lg animate-pulse" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleStartRecording}
              className={cn(
                "w-24 h-24 rounded-full border-4 p-2 bg-black/40 backdrop-blur-md flex items-center justify-center transition-all",
                hasRecorded ? "border-[#D4AF37] shadow-[0_0_30px_#D4AF37]" : "border-white/20 hover:border-white/40"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-full transition-all",
                hasRecorded ? "bg-[#D4AF37]" : "bg-white/10 group-hover:bg-white/20"
              )} />
            </motion.button>
          )}
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
            {isRecording ? "Transmitting..." : hasRecorded ? "Capture Success" : "Sync Pulse"}
          </p>
        </div>
      </div>

      {/* Futuristic Fixed Footer CTA */}
      <motion.div
        layout
        className="fixed bottom-0 left-0 right-0 p-8 pb-10 bg-gradient-to-t from-[#1A0814] via-[#1A0814]/90 to-transparent z-30"
      >
        <div className="max-w-md mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-[#7A1F3D] rounded-[24px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="w-full h-18 rounded-[22px] bg-white text-[#1A0814] font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 relative overflow-hidden"
          >
            <Zap className="w-5 h-5 fill-current" />
            {isUploading ? "Transmitting..." : (hasRecorded ? "Commit & Sync" : "Sync Without Asset")}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent skew-x-[30deg]"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
