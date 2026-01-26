"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob, duration: number) => void
    maxDuration?: number
}

export function VoiceRecorder({ onRecordingComplete, maxDuration = 30 }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [duration, setDuration] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder

            const chunks: Blob[] = []
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' })
                setAudioBlob(blob)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
            setDuration(0)

            // Start timer
            timerRef.current = setInterval(() => {
                setDuration(prev => {
                    if (prev >= maxDuration) {
                        stopRecording()
                        return maxDuration
                    }
                    return prev + 1
                })
            }, 1000)
        } catch (error) {
            console.error('Failed to start recording:', error)
            alert('Microphone access denied')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }

    const playAudio = () => {
        if (audioBlob && !audioRef.current) {
            const audio = new Audio(URL.createObjectURL(audioBlob))
            audioRef.current = audio
            audio.onended = () => setIsPlaying(false)
            audio.play()
            setIsPlaying(true)
        } else if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
                setIsPlaying(false)
            } else {
                audioRef.current.play()
                setIsPlaying(true)
            }
        }
    }

    const deleteRecording = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
        }
        setAudioBlob(null)
        setDuration(0)
        setIsPlaying(false)
    }

    const handleComplete = () => {
        if (audioBlob) {
            onRecordingComplete(audioBlob, duration)
        }
    }

    return (
        <div className="space-y-6">
            {/* Recording Visualizer */}
            <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center overflow-hidden">
                {isRecording && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-primary rounded-full animate-pulse"
                                style={{
                                    height: `${Math.random() * 80 + 20}%`,
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            />
                        ))}
                    </div>
                )}

                {!isRecording && !audioBlob && (
                    <div className="text-center">
                        <Mic className="w-16 h-16 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Tap to record your voice</p>
                    </div>
                )}

                {audioBlob && !isRecording && (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                            {isPlaying ? (
                                <Pause className="w-8 h-8 text-primary" />
                            ) : (
                                <Play className="w-8 h-8 text-primary" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">Tap to play</p>
                    </div>
                )}
            </div>

            {/* Timer */}
            <div className="text-center">
                <div className="text-4xl font-bold text-foreground font-mono">
                    {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                    {isRecording ? 'Recording...' : audioBlob ? 'Recording complete' : `Max ${maxDuration} seconds`}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                {!audioBlob && !isRecording && (
                    <Button
                        onClick={startRecording}
                        size="lg"
                        className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90"
                    >
                        <Mic className="w-8 h-8" />
                    </Button>
                )}

                {isRecording && (
                    <Button
                        onClick={stopRecording}
                        size="lg"
                        className="w-20 h-20 rounded-full bg-destructive hover:bg-destructive/90"
                    >
                        <Square className="w-8 h-8" />
                    </Button>
                )}

                {audioBlob && !isRecording && (
                    <>
                        <Button
                            onClick={playAudio}
                            size="lg"
                            className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90"
                        >
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </Button>
                        <Button
                            onClick={deleteRecording}
                            size="lg"
                            variant="outline"
                            className="w-16 h-16 rounded-full"
                        >
                            <Trash2 className="w-6 h-6" />
                        </Button>
                    </>
                )}
            </div>

            {/* Complete Button */}
            {audioBlob && !isRecording && (
                <Button
                    onClick={handleComplete}
                    className="w-full h-12 gradient-love text-white font-semibold"
                >
                    Use This Recording
                </Button>
            )}
        </div>
    )
}
