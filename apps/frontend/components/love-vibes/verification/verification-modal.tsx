"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShieldCheck, Camera, Check, AlertCircle, RefreshCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api-client"
import { useApp } from "@/lib/app-context"

interface VerificationModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function VerificationModal({ isOpen, onClose, onSuccess }: VerificationModalProps) {
    const { user, updateUser } = useApp()
    const [step, setStep] = useState<"intro" | "camera" | "verification" | "success">("intro")
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (step === "camera") {
            startCamera()
        } else if (step === "verification") {
            simulateVerification()
        }

        return () => {
            stopCamera()
        }
    }, [step, stopCamera])

    const startCamera = async () => {
        try {
            setError(null)

            // Check if we are on a native platform
            const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNative;

            if (isNative) {
                const { Camera, CameraResultType } = await import('@capacitor/camera')
                const image = await Camera.getPhoto({
                    quality: 90,
                    allowEditing: false,
                    resultType: CameraResultType.DataUrl
                });
                if (image.dataUrl) {
                    setCapturedImage(image.dataUrl)
                    setStep("verification")
                }
                return;
            }

            // Web Fallback
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false
            })
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
        } catch (err) {
            console.error("Camera access error:", err)
            setError("Please allow camera access to verify your profile.")
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
    }

    const capturePhoto = async () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current
            const canvas = canvasRef.current
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext("2d")
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                const dataUrl = canvas.toDataURL("image/jpeg")
                setCapturedImage(dataUrl)
                setStep("verification")

                // Real Upload
                try {
                    const blob = await (await fetch(dataUrl)).blob()
                    const file = new File([blob], "verification.jpg", { type: 'image/jpeg' })
                    await api.media.upload(file, 'photo')
                    await updateUser({ verificationStatus: 'verified', isVerified: true })
                    setStep("success")
                } catch (err) {
                    console.error("Verification upload failed", err)
                    setError("Upload failed. Please try again.")
                    setStep("camera")
                }
            }
        }
    }

    const simulateVerification = () => {
        setProgress(0)
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setTimeout(() => setStep("success"), 500)
                    return 100
                }
                return prev + 2
            })
        }, 40)
    }

    const handleFinish = () => {
        onSuccess()
        onClose()
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white/70 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8">
                        {step === "intro" && (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ShieldCheck className="w-10 h-10 text-rose-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Get Verified</h2>
                                <p className="text-zinc-400 mb-8">
                                    Verify your identity to get the <span className="text-rose-400 font-semibold">Verified Badge</span> and build more trust within the community.
                                </p>
                                <div className="space-y-4 text-left mb-8">
                                    <div className="flex gap-4 p-4 rounded-2xl bg-zinc-800/50">
                                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-rose-400 font-bold text-sm">1</span>
                                        </div>
                                        <p className="text-sm text-zinc-300 pt-1">Take a selfie matching the pose shown on screen.</p>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-2xl bg-zinc-800/50">
                                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-rose-400 font-bold text-sm">2</span>
                                        </div>
                                        <p className="text-sm text-zinc-300 pt-1">Our AI will compare it with your profile pictures.</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setStep("camera")}
                                    className="w-full h-14 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-lg font-semibold shadow-rose-600/20 shadow-lg"
                                >
                                    Start Verification
                                </Button>
                            </div>
                        )}

                        {step === "camera" && (
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white mb-4">Position your face</h3>
                                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-black mb-6 border-2 border-zinc-700">
                                    {error ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-zinc-900">
                                            <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                                            <p className="text-zinc-400">{error}</p>
                                            <Button
                                                variant="outline"
                                                onClick={startCamera}
                                                className="mt-4 border-rose-500/50 text-rose-500"
                                            >
                                                Try Again
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                                            />
                                            {/* Face Overlay Guideline */}
                                            <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                                                <div className="w-full h-full border-2 border-rose-500/50 rounded-[100px] shadow-[0_0_0_1000px_rgba(0,0,0,0.4)]" />
                                            </div>
                                            <div className="absolute top-4 left-0 right-0">
                                                <span className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                                                    Live Camera
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {!error && (
                                    <Button
                                        onClick={capturePhoto}
                                        className="w-16 h-16 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                                    >
                                        <Camera className="w-7 h-7" />
                                    </Button>
                                )}
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                        )}

                        {step === "verification" && (
                            <div className="text-center py-8">
                                <div className="relative w-48 h-48 mx-auto mb-8">
                                    <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"
                                        initial={{ rotate: 0 }}
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    />
                                    <div className="absolute inset-4 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                                        <img src={capturedImage!} alt="Selfie" className="w-full h-full object-cover scale-x-[-1] opacity-50" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Analyzing Photos</h3>
                                <p className="text-zinc-400 mb-8">AI is verifying your identity...</p>
                                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-rose-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {step === "success" && (
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <Check className="w-10 h-10 text-white" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-white mb-2">Verified!</h2>
                                <p className="text-zinc-400 mb-8">
                                    Your profile has been successfully verified. Enjoy the trust and safety of Love Vibes.
                                </p>
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-8 flex items-center gap-3">
                                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                    <span className="text-emerald-500 font-medium">Verification Badge Active</span>
                                </div>
                                <Button
                                    onClick={handleFinish}
                                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-lg font-semibold"
                                >
                                    Continue
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
