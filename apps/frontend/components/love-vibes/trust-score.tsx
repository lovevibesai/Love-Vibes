"use client"

import { cn } from "@/lib/utils"

interface TrustScoreProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export function TrustScore({ score, size = "md", showLabel = false }: TrustScoreProps) {
  const getColor = () => {
    if (score >= 76) return { text: "text-[#4A7C59]", stroke: "#4A7C59" }
    if (score >= 51) return { text: "text-[#D4AF37]", stroke: "#D4AF37" }
    return { text: "text-[#D4635E]", stroke: "#D4635E" }
  }

  const getBgColor = () => {
    if (score >= 76) return "rgba(74, 124, 89, 0.2)"
    if (score >= 51) return "rgba(212, 175, 55, 0.2)"
    return "rgba(212, 99, 94, 0.2)"
  }
  
  const colorInfo = getColor()

  const sizes = {
    sm: { container: "w-8 h-8", stroke: 3, fontSize: "text-[10px]" },
    md: { container: "w-10 h-10", stroke: 4, fontSize: "text-xs" },
    lg: { container: "w-14 h-14", stroke: 4, fontSize: "text-sm" },
  }

  const { container, stroke, fontSize } = sizes[size]
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const offset = circumference - progress

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("relative", container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
          {/* Background circle */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            strokeWidth={stroke}
            stroke={getBgColor()}
          />
          {/* Progress circle */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            stroke={colorInfo.stroke}
            className="transition-all duration-500"
          />
        </svg>
        <div className={cn(
          "absolute inset-0 flex items-center justify-center font-semibold",
          fontSize,
          colorInfo.text
        )}>
          {score}
        </div>
      </div>
      {showLabel && (
        <span className="text-[10px] text-muted-foreground font-medium">Trust</span>
      )}
    </div>
  )
}
