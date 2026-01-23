"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type AppMode = "dating" | "friendship"
export type AppScreen = "welcome" | "phone" | "mode" | "profile-setup" | "prompts" | "video" | "location" | "feed" | "matches" | "chat" | "profile" | "settings" | "filters" | "credits" | "expanded-profile" | "location-settings" | "visibility-settings" | "notification-settings" | "blocked-users" | "privacy-policy" | "terms-of-service" | "help-center" | "vibe-windows" | "voice-feed" | "success-stories" | "referral-dashboard" | "chemistry-test" | "mutual-friends" | "boost" | "innovative-features" | "identity-signature" | "social-endorsements"

export interface User {
  id: string
  name?: string
  age?: number
  bio?: string
  photoUrl?: string // Keep for backwards compatibility
  photos?: string[]
  videoUrl?: string
  gender?: number
  interestedIn?: number
  jobTitle?: string
  company?: string
  school?: string
  interests?: string[]

  // Priority Profile Fields
  height?: number // cm
  userLocation?: string // Renamed from 'location' to avoid conflict
  hometown?: string
  relationshipGoals?: string[] // ["long-term", "casual", "friendship"]
  drinking?: string // "never" | "socially" | "regularly" | "prefer-not-say"
  smoking?: string // "never" | "socially" | "regularly" | "trying-quit" | "prefer-not-say"
  exerciseFrequency?: string // "active" | "sometimes" | "rarely"
  diet?: string // "omnivore" | "vegetarian" | "vegan" | "pescatarian"
  pets?: string // "dog" | "cat" | "both" | "neither" | "have-pets"
  languages?: string[] // ["en", "es", "fr"]

  // Extended Fields
  ethnicity?: string[]
  religion?: string
  hasChildren?: string
  wantsChildren?: string
  starSign?: string

  // Verification
  isVerified: boolean
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected'
  isIdVerified?: boolean
  lastActive?: number

  // Monetization
  credits: number // maps to credits_balance in DB
  subscriptionTier?: 'free' | 'plus' | 'platinum'
  subscriptionExpiresAt?: number

  // App State
  mode: AppMode
  trustScore: number
  compatibilityScore?: number
  matchReason?: string
  isOnboarded?: boolean
  hasVideoIntro?: boolean
  distance?: string
}

interface Match {
  id: string
  user: User
  lastMessage?: string
  unread: boolean
  timestamp: Date
  chatRoomId?: string
}

interface AppContextType {
  currentScreen: AppScreen
  setCurrentScreen: (screen: AppScreen) => void
  mode: AppMode
  setMode: (mode: AppMode) => void
  isOnboarded: boolean
  setIsOnboarded: (value: boolean) => void
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  matches: Match[]
  setMatches: (matches: Match[]) => void
  showMatchModal: boolean
  setShowMatchModal: (show: boolean) => void
  matchedUser: User | null
  setMatchedUser: (user: User | null) => void
  user: User
  updateUser: (updates: Partial<User>) => Promise<void>
  login: (phone: string) => Promise<void>
  registerPasskey: (email: string) => Promise<void>
  loginWithEmail: (email: string) => Promise<void>
  verifyEmailOTP: (email: string, otp: string) => Promise<void>
  loadFeed: (lat: number, long: number) => Promise<any[] | undefined>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Mock data for demo
const mockUsers: User[] = [
  {
    id: "1",
    name: "Emma",
    age: 28,
    bio: "Coffee enthusiast, book lover, and sunset chaser. Looking for someone to share adventures with.",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
    mode: "dating",
    trustScore: 85,
    isVerified: true,
    credits: 100,
    distance: "2 miles away",
    hasVideoIntro: true,
  },
  {
    id: "2",
    name: "Sophie",
    age: 26,
    bio: "Yoga instructor by day, foodie by night. Let's explore new restaurants together!",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
    mode: "dating",
    trustScore: 92,
    isVerified: true,
    credits: 150,
    distance: "5 miles away",
    hasVideoIntro: true,
  },
  {
    id: "3",
    name: "Olivia",
    age: 30,
    bio: "Art curator with a passion for travel. Always planning my next adventure.",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
    mode: "dating",
    trustScore: 78,
    isVerified: false,
    credits: 75,
    distance: "1 mile away",
    hasVideoIntro: false,
  },
  {
    id: "4",
    name: "Maya",
    age: 25,
    bio: "Music teacher who loves hiking and spontaneous road trips. Looking for genuine connections.",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    mode: "friendship",
    trustScore: 88,
    isVerified: true,
    credits: 200,
    distance: "3 miles away",
    hasVideoIntro: true,
  },
]

const defaultUser: User = {
  id: "self",
  name: "You",
  age: 25,
  bio: "Add a bio to tell others about yourself",
  photoUrl: "",
  mode: "dating",
  trustScore: 65,
  isVerified: false,
  credits: 50,
  userLocation: "San Francisco, CA",
  hasVideoIntro: false,
}

const mockMatches: Match[] = [
  {
    id: "m1",
    user: mockUsers[0],
    lastMessage: "Hey! How was your weekend?",
    unread: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    chatRoomId: "mock-do-1",
  },
  {
    id: "m2",
    user: mockUsers[1],
    lastMessage: "That restaurant was amazing!",
    unread: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    chatRoomId: "mock-do-2",
  },
]

import { api } from "./api-client"
import { startRegistration, startAuthentication } from "@simplewebauthn/browser"

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) return "feed";
    return "welcome";
  })
  const [mode, setMode] = useState<AppMode>("dating")
  const [isOnboarded, setIsOnboarded] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) return true;
    return false;
  })
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [matches, setMatches] = useState<Match[]>(mockMatches)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedUser, setMatchedUser] = useState<User | null>(null)
  const [user, setUser] = useState<User>(defaultUser)

  // Session Restoration & Dev Tools Sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const storedUserId = localStorage.getItem('user_id');
      const simulatedMatch = localStorage.getItem('simulated_match');

      if (token && storedUserId) {
        // In a real app, we'd fetch profile here. 
        // For dev convenience, we'll just set as onboarded if token exists
        setIsOnboarded(true);
        setCurrentScreen("feed");
      }

      if (simulatedMatch) {
        try {
          const matchUser = JSON.parse(simulatedMatch);
          setMatchedUser(matchUser);
          setShowMatchModal(true);
          localStorage.removeItem('simulated_match'); // Clear it after use
        } catch (e) {
          console.error("Failed to parse simulated match", e);
        }
      }

      // Clear skip_splash if it was set
      localStorage.removeItem('skip_splash');
    }
  }, []);

  // Real Integration
  const login = async (phone: string) => {
    try {
      const data = await api.auth.loginLegacy(phone);
      handleAuthenticatedUser(data);
    } catch (e) {
      console.error("Login failed", e);
      throw e;
    }
  }

  const registerPasskey = async (email: string) => {
    try {
      const userId = currentUser?.id || crypto.randomUUID();
      const options = await api.auth.getRegisterOptions(userId, email);
      const regResp = await startRegistration(options);
      const verifyResp = await api.auth.verifyRegister(userId, email, regResp);

      if (verifyResp.success) {
        handleAuthenticatedUser(verifyResp);
      }
    } catch (e) {
      console.error("Passkey registration failed", e);
      throw e;
    }
  }

  const loginWithEmail = async (email: string) => {
    await api.auth.loginEmail(email);
  }

  const verifyEmailOTP = async (email: string, otp: string) => {
    const data = await api.auth.verifyEmailOTP(email, otp);
    if (data.success) {
      handleAuthenticatedUser(data);
    } else {
      throw new Error("Invalid OTP");
    }
  }

  const handleAuthenticatedUser = (data: any) => {
    if (data.is_new_user) {
      setCurrentScreen("profile-setup");
    } else {
      setCurrentScreen("feed");
      setIsOnboarded(true);
    }

    // Map backend user to frontend User type
    const mappedUser: User = {
      ...defaultUser,
      id: data._id || data.id,
      name: data.name,
      age: data.age,
      bio: data.bio,
      photoUrl: data.main_photo_url || data.photoUrl,
      photos: data.photo_urls ? JSON.parse(data.photo_urls) : [],
      credits: data.credits_balance || 0,
      isVerified: !!data.is_verified,
      mode: data.mode === 1 ? "friendship" : "dating",
    };

    setUser(mappedUser);
    setCurrentUser(mappedUser);
  }

  const loadFeed = async (lat: number, long: number) => {
    try {
      const res = await api.feed.getRecs(lat, long);
      if (res.data?.results) {
        // Feed is typically handled locally in FeedScreen state, 
        // but we can store it here if needed or just return it.
        return res.data.results;
      }
    } catch (e) {
      console.error("Failed to load feed", e);
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }))
    try {
      // Map frontend fields to backend schema if necessary
      const backendUpdates = {
        ...updates,
        photo_urls: updates.photos ? JSON.stringify(updates.photos) : undefined,
        relationship_goals: updates.relationshipGoals ? JSON.stringify(updates.relationshipGoals) : undefined,
        interests: updates.interests ? JSON.stringify(updates.interests) : undefined,
      };
      await api.user.updateProfile(backendUpdates);
    } catch (e) {
      console.error("Failed to sync profile update", e);
    }
  }

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        mode,
        setMode,
        isOnboarded,
        setIsOnboarded,
        currentUser,
        setCurrentUser,
        matches,
        setMatches,
        showMatchModal,
        setShowMatchModal,
        matchedUser,
        setMatchedUser,
        user,
        updateUser,
        login,
        registerPasskey,
        loginWithEmail,
        verifyEmailOTP,
        loadFeed
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export { mockUsers, mockMatches }
