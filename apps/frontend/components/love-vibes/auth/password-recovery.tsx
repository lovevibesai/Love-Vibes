"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from "lucide-react"

import { api } from "@/lib/api-client"

export function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
    const [email, setEmail] = useState("")
    const [emailSent, setEmailSent] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSendReset = async () => {
        setIsLoading(true)
        try {
            await api.auth.requestPasswordReset(email)
            setEmailSent(true)
        } catch (error) {
            console.error(error)
            alert("Failed to send reset email. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                <button
                    onClick={onBack}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <h1 className="text-lg font-semibold text-foreground">Reset Password</h1>
            </header>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {!emailSent ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                    <Lock className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">Forgot Password?</h2>
                                <p className="text-muted-foreground">
                                    Enter your email and we'll send you a reset link
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="pl-10 h-12"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSendReset}
                                    disabled={!email}
                                    className="w-full h-12 gradient-love text-white font-semibold"
                                >
                                    Send Reset Link
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
                                <p className="text-muted-foreground">
                                    We've sent a password reset link to <strong>{email}</strong>
                                </p>
                            </div>

                            <div className="p-4 bg-card rounded-xl border border-border mb-6">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Click the link in the email to reset your password. The link expires in 1 hour.
                                    If you don't see the email, check your spam folder.
                                </p>
                            </div>

                            <Button
                                onClick={onBack}
                                variant="outline"
                                className="w-full h-12"
                            >
                                Back to Login
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export function ResetPasswordScreen({ token, onSuccess }: { token: string; onSuccess: () => void }) {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleResetPassword = () => {
        if (password !== confirmPassword) {
            alert("Passwords don't match")
            return
        }
        // TODO: Call API to reset password with token
        onSuccess()
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="px-4 py-3 border-b border-border bg-card">
                <h1 className="text-lg font-semibold text-foreground">Create New Password</h1>
            </header>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Create New Password</h2>
                        <p className="text-muted-foreground">
                            Choose a strong password for your account
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="pl-10 pr-10 h-12"
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="pl-10 h-12"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleResetPassword}
                            disabled={!password || !confirmPassword || isLoading}
                            className="w-full h-12 gradient-love text-white font-semibold"
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
