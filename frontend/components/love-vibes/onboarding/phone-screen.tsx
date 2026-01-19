"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function PhoneScreen() {
  const { setCurrentScreen, login } = useApp()
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"phone" | "verify">("phone")
  const [loading, setLoading] = useState(false)

  const isPhoneValid = phone.length >= 10
  const isCodeValid = code.length === 6

  const handlePhoneSubmit = () => {
    if (isPhoneValid) {
      setStep("verify")
    }
  }

  const handleVerifySubmit = async () => {
    if (isCodeValid) {
      setLoading(true)
      try {
        await login(phone)
      } catch (e) {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center px-4 h-14">
        <button
          onClick={() => step === "phone" ? setCurrentScreen("welcome") : setStep("phone")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Progress */}
      <div className="px-6 mb-8">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full flex-1 transition-colors",
                i === 1 ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6">
        {step === "phone" ? (
          <>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {"What's your number?"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {"We'll send you a verification code"}
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex items-center justify-center w-20 h-14 border border-border rounded-lg bg-card text-foreground font-medium">
                  +1
                </div>
                <div className="relative flex-1">
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="(555) 123-4567"
                    className="h-14 text-lg border-border focus:border-primary focus:ring-primary"
                    maxLength={10}
                  />
                  {isPhoneValid && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-trust-high flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Enter your code
            </h1>
            <p className="text-muted-foreground mb-8">
              Sent to +1 {phone}
            </p>

            <div className="space-y-4">
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="h-14 text-2xl text-center tracking-[0.5em] font-mono border-border focus:border-primary focus:ring-primary"
                maxLength={6}
              />
              <button className="text-primary font-medium text-sm">
                Resend code
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 safe-bottom">
        <Button
          onClick={step === "phone" ? handlePhoneSubmit : handleVerifySubmit}
          disabled={step === "phone" ? !isPhoneValid : !isCodeValid}
          className="w-full h-14 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-base rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
