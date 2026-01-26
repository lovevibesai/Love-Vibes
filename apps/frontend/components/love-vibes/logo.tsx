"use client"

import React from "react"

import Image from "next/image"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { logo: 32, text: "text-lg" },
  md: { logo: 48, text: "text-xl" },
  lg: { logo: 64, text: "text-2xl" },
  xl: { logo: 96, text: "text-3xl" },
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const { logo, text } = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo.png"
        alt="Love Vibes"
        width={logo}
        height={logo}
        className="rounded-xl"
        priority
      />
      {showText && (
        <span 
          className={`font-light tracking-[0.2em] text-foreground ${text}`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          LOVE VIBES
        </span>
      )}
    </div>
  )
}

// Inline SVG heart that matches the logo style
export function LogoHeart({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heartGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3D1F3D" />
          <stop offset="50%" stopColor="#6B3358" />
          <stop offset="100%" stopColor="#D4635E" />
        </linearGradient>
        <linearGradient id="heartStroke" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4A5A0" />
          <stop offset="50%" stopColor="#E8C5C0" />
          <stop offset="100%" stopColor="#D4A5A0" />
        </linearGradient>
      </defs>
      <path
        d="M50 88C50 88 12 60 12 35C12 20 24 10 38 10C44 10 50 14 50 14C50 14 56 10 62 10C76 10 88 20 88 35C88 60 50 88 50 88Z"
        stroke="url(#heartStroke)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

// Gradient background component matching logo
export function GradientBackground({ 
  children, 
  className = "",
  direction = "bottom"
}: { 
  children?: React.ReactNode
  className?: string 
  direction?: "bottom" | "top" | "diagonal"
}) {
  const gradients = {
    bottom: "linear-gradient(180deg, #D4635E 0%, #6B3358 50%, #3D1F3D 100%)",
    top: "linear-gradient(0deg, #D4635E 0%, #6B3358 50%, #3D1F3D 100%)",
    diagonal: "linear-gradient(160deg, #D4635E 0%, #6B3358 50%, #3D1F3D 100%)",
  }

  return (
    <div 
      className={`${className}`}
      style={{ background: gradients[direction] }}
    >
      {children}
    </div>
  )
}
