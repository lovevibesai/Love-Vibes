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
  user: User
  setUser: (user: User) => void
  matches: Match[]
  setMatches: (matches: Match[]) => void
  showMatchModal: boolean
  setShowMatchModal: (show: boolean) => void
  matchedUser: User | null
  setMatchedUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => Promise<void>
  login: (phone: string) => Promise<void>
  registerPasskey: (email: string) => Promise<void>
  loginWithEmail: (email: string) => Promise<void>
  verifyEmailOTP: (email: string, otp: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  loginWithPasskey: () => Promise<void>
  loadFeed: (lat: number, long: number) => Promise<any[] | undefined>
  isLoggingIn: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)




const defaultUser: User = {
  id: "self",
  name: "",
  age: 18,
  bio: "",
  photoUrl: "",
  mode: "dating",
  trustScore: 10,
  isVerified: false,
  credits: 0,
  userLocation: "",
  hasVideoIntro: false,
}

import { api } from "./api-client"
import { startRegistration, startAuthentication } from "@simplewebauthn/browser"
import { useToast } from "@/hooks/use-toast"

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) return "feed";
    return "welcome";
  })
  const [mode, setMode] = useState<AppMode>("dating")
  const [isOnboarded, setIsOnboarded] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('is_onboarded') === 'true') return true;
    return false;
  })
  const [user, setUser] = useState<User>(defaultUser)
  const [matches, setMatches] = useState<Match[]>([])
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedUser, setMatchedUser] = useState<User | null>(null)
  const { toast } = useToast()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Persist Current Screen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_screen', currentScreen);
    }
  }, [currentScreen]);

  // Session Restoration & Profile Refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const storedScreen = localStorage.getItem('current_screen') as AppScreen | null;
      const storedUser = localStorage.getItem('user_data');

      if (storedScreen) {
        setCurrentScreen(storedScreen);
      }

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      }

      if (token) {
        // Refresh profile from server
        api.user.getProfile()
          .then(data => {
            if (data) {
              handleAuthenticatedUser(data);
            }
          })
          .catch(e => {
            console.error("Failed to refresh profile", e);
            if (e.message.includes("Unauthorized")) {
              api.auth.logout();
              setCurrentScreen("welcome");
            }
          });
      }

      const simulatedMatch = localStorage.getItem('simulated_match');
      if (simulatedMatch) {
        try {
          const matchUser = JSON.parse(simulatedMatch);
          setMatchedUser(matchUser);
          setShowMatchModal(true);
          localStorage.removeItem('simulated_match');
        } catch (e) {
          console.error("Failed to parse simulated match", e);
        }
      }
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
      const userId = user?.id || crypto.randomUUID();
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
      localStorage.setItem('current_screen', data.is_new_user ? 'profile-setup' : 'feed');
    } else {
      throw new Error("Invalid OTP");
    }
  }

  const loginWithGoogle = async (idToken: string) => {
    try {
      const data = await api.auth.loginGoogle(idToken);
      handleAuthenticatedUser(data);
    } catch (e) {
      console.error("Google login failed", e);
      throw e;
    }
  }

  const loginWithPasskey = async () => {
    setIsLoggingIn(true);
    try {
      if (!api.auth.getLoginOptions) {
        throw new Error("API client not initialized correctly");
      }

      const options = await api.auth.getLoginOptions();

      if (process.env.NODE_ENV === 'development') {
        console.log("[Passkey] Options:", options);
      }

      const authResp = await startAuthentication(options);

      if (process.env.NODE_ENV === 'development') {
        console.log("[Passkey] Auth Response:", authResp);
      }

      // Retry logic for verification (1 retry)
      let verifyResp;
      try {
        verifyResp = await api.auth.verifyLoginPasskey(authResp);
      } catch (err) {
        console.warn("[Passkey] First verification attempt failed, retrying...", err);
        // Wait briefly before retry
        await new Promise(resolve => setTimeout(resolve, 500));
        verifyResp = await api.auth.verifyLoginPasskey(authResp);
      }

      if (!verifyResp.success) {
        console.warn("[Passkey] Verification failed", verifyResp);
        toast({
          title: "Login Failed",
          description: "Could not verify your passkey. Please try again.",
          variant: "destructive",
        });
        return;
      }

      handleAuthenticatedUser(verifyResp);
    } catch (e: any) {
      console.error("[Passkey] Login failed:", e?.message ?? e);
      toast({
        title: "Login Error",
        description: "Something went wrong. Please try again or use another method.",
        variant: "destructive",
        duration: 4000
      });
    } finally {
      setIsLoggingIn(false);
    }
  }

  const handleAuthenticatedUser = (data: any) => {
    const onboarded = !!data.is_onboarded;
    setIsOnboarded(onboarded);
    localStorage.setItem('is_onboarded', onboarded ? 'true' : 'false');

    if (onboarded && currentScreen === "welcome") {
      setCurrentScreen("feed");
    } else if (!onboarded && (currentScreen === "welcome" || currentScreen === "phone")) {
      setCurrentScreen("profile-setup");
    }

    // Map backend user to frontend User type
    const mappedUser: User = {
      ...defaultUser,
      id: data._id || data.id,
      name: data.name,
      age: data.age,
      bio: data.bio,
      photoUrl: data.main_photo_url || data.photoUrl,
      photos: data.photo_urls ? (typeof data.photo_urls === 'string' ? JSON.parse(data.photo_urls) : data.photo_urls) : [],
      credits: data.credits_balance || 0,
      isVerified: !!data.is_verified,
      verificationStatus: data.verification_status,
      isIdVerified: !!data.is_id_verified,
      mode: data.mode === 1 ? "friendship" : "dating",
      isOnboarded: onboarded,
      userLocation: data.city || data.location,
      hometown: data.hometown,
      height: data.height,
      relationshipGoals: data.relationship_goals ? (typeof data.relationship_goals === 'string' ? JSON.parse(data.relationship_goals) : data.relationship_goals) : [],
      interests: data.interests ? (typeof data.interests === 'string' ? JSON.parse(data.interests) : data.interests) : [],
      drinking: data.drinking,
      smoking: data.smoking,
      exerciseFrequency: data.exercise_frequency,
      diet: data.diet,
      pets: data.pets,
      languages: data.languages ? (typeof data.languages === 'string' ? JSON.parse(data.languages) : data.languages) : [],
      ethnicity: data.ethnicity ? (typeof data.ethnicity === 'string' ? JSON.parse(data.ethnicity) : data.ethnicity) : [],
      religion: data.religion,
      hasChildren: data.has_children,
      wantsChildren: data.wants_children,
      starSign: data.star_sign,
      jobTitle: data.job_title,
      company: data.company,
      school: data.school,
      subscriptionTier: data.subscription_tier || 'free',
      trustScore: data.trust_score || 10,
    };

    setUser(mappedUser);
    localStorage.setItem('user_data', JSON.stringify(mappedUser));
    if (data._id || data.id) {
      localStorage.setItem('user_id', data._id || data.id);
    }
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
    // 1. Optimistic UI Update
    const newUser = { ...user, ...updates };
    setUser(newUser);
    localStorage.setItem('user_data', JSON.stringify(newUser));

    try {
      // 2. Comprehensive Backend Mapping
      // We explicitly map EVERY field to ensure snake_case compatibility
      const backendUpdates: any = {};

      // Strings & Numbers - Direct Mapping
      if (updates.name !== undefined) backendUpdates.name = updates.name;
      if (updates.bio !== undefined) backendUpdates.bio = updates.bio;
      if (updates.age !== undefined) backendUpdates.age = updates.age;
      if (updates.jobTitle !== undefined) backendUpdates.job_title = updates.jobTitle;
      if (updates.company !== undefined) backendUpdates.company = updates.company;
      if (updates.school !== undefined) backendUpdates.school = updates.school;
      if (updates.userLocation !== undefined) backendUpdates.city = updates.userLocation; // Critical Fix: userLocation -> city
      if (updates.hometown !== undefined) backendUpdates.hometown = updates.hometown;
      if (updates.height !== undefined) backendUpdates.height = updates.height;
      if (updates.starSign !== undefined) backendUpdates.star_sign = updates.starSign;
      if (updates.religion !== undefined) backendUpdates.religion = updates.religion;
      if (updates.drinking !== undefined) backendUpdates.drinking = updates.drinking;
      if (updates.smoking !== undefined) backendUpdates.smoking = updates.smoking;
      if (updates.exerciseFrequency !== undefined) backendUpdates.exercise_frequency = updates.exerciseFrequency;
      if (updates.diet !== undefined) backendUpdates.diet = updates.diet;
      if (updates.pets !== undefined) backendUpdates.pets = updates.pets;
      if (updates.hasChildren !== undefined) backendUpdates.has_children = updates.hasChildren;
      if (updates.wantsChildren !== undefined) backendUpdates.wants_children = updates.wantsChildren;

      // URLs
      if (updates.photoUrl !== undefined) backendUpdates.main_photo_url = updates.photoUrl;
      if (updates.videoUrl !== undefined) backendUpdates.video_intro_url = updates.videoUrl;

      // JSON Arrays - Must be stringified for D1/SQLite
      if (updates.photos !== undefined) backendUpdates.photo_urls = JSON.stringify(updates.photos);
      if (updates.interests !== undefined) backendUpdates.interests = JSON.stringify(updates.interests);
      if (updates.relationshipGoals !== undefined) backendUpdates.relationship_goals = JSON.stringify(updates.relationshipGoals);
      if (updates.languages !== undefined) backendUpdates.languages = JSON.stringify(updates.languages);
      if (updates.ethnicity !== undefined) backendUpdates.ethnicity = JSON.stringify(updates.ethnicity);

      // Booleans & Enums & Status
      if (updates.mode !== undefined) backendUpdates.mode = updates.mode === "friendship" ? 1 : 0;
      if (updates.isOnboarded !== undefined) backendUpdates.is_onboarded = updates.isOnboarded ? 1 : 0;
      if (updates.isVerified !== undefined) backendUpdates.is_verified = updates.isVerified ? 1 : 0;
      if (updates.subscriptionTier !== undefined) backendUpdates.subscription_tier = updates.subscriptionTier;
      if (updates.credits !== undefined) backendUpdates.credits_balance = updates.credits;
      if (updates.gender !== undefined) backendUpdates.gender = updates.gender;
      if (updates.interestedIn !== undefined) backendUpdates.interested_in = updates.interestedIn;

      // 3. Send to API
      if (Object.keys(backendUpdates).length > 0) {
        await api.user.updateProfile(backendUpdates);
      }
    } catch (e) {
      console.error("Failed to sync profile update", e);
      // Optional: Revert state if critical, but for now we just log
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
        matches,
        setMatches,
        showMatchModal,
        setShowMatchModal,
        matchedUser,
        setMatchedUser,
        user,
        setUser,
        updateUser,
        login,
        registerPasskey,
        loginWithEmail,
        verifyEmailOTP,
        loginWithGoogle,
        loginWithPasskey,
        loadFeed,
        isLoggingIn
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


