import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from "@/components/theme-provider"
import { FirebaseInit } from "@/components/firebase-init"
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://love-vibes-frontend.pages.dev'),
  title: 'Love Vibes',
  description: 'Elite connections, your way',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.png' },
    ],
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Love Vibes',
    description: 'Elite connections, your way',
    images: [{ url: '/logo.png', width: 1024, height: 1024 }],
    type: 'website',
    url: 'https://love-vibes-frontend.pages.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Love Vibes',
    description: 'Elite connections, your way',
    images: ['/logo.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-balance bg-black overflow-hidden`}>
        <FirebaseInit />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Mobile Enforced Viewport */}
          <div className="flex justify-center items-center min-h-screen bg-[#1A0814]">
            <main className="w-full max-w-md h-[100dvh] relative overflow-hidden bg-background shadow-2xl">
              {children}
            </main>
          </div>

          {/* Optional: Desktop Blocker Overlay */}
          <div className="hidden lg:flex fixed inset-0 z-[10000] bg-black items-center justify-center p-12 text-center flex-col">
            <h1 className="text-4xl font-black text-[#D4AF37] mb-4">MOBILE ONLY</h1>
            <p className="text-white/60 max-w-xs uppercase tracking-widest text-xs leading-relaxed">
              Love Vibes is a sovereign mobile experience. Please access this protocol from your mobile device for full resonance.
            </p>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
