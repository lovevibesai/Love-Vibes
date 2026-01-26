"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { api } from "./api-client"
import { startRegistration, startAuthentication } from "@simplewebauthn/browser"

export type AppMode = "dating" | "friendship"
export type AppScreen = "welcome" | "phone" | "mode" | "profile-setup" | "prompts" | "video" | "location" | "feed" | "matches" | "chat" | "profile" | "settings" | "filters" | "credits" | "expanded-profile" | "location-settings" | "visibility-settings" | "notification-settings" | "blocked-users" | "privacy-policy" | "terms-of-service" | "help-center" | "vibe-windows" | "voice-feed" | "success-stories" | "referral-dashboard" | "chemistry-test" | "mutual-friends" | "boost" | "innovative-features" | "identity-signature" | "social-endorsements"

export interface User {
  id: string
  name?: string
  age?: number
  bio?: string
  photoUrl?: string
  photos?: string[]
  videoUrl?: string
  gender?: number
  interestedIn?: number
  jobTitle?: string
  company?: string
  school?: string
  interests?: string[]
  height?: number
  userLocation?: string
  hometown?: string
  relationshipGoals?: string[]
  drinking?: string
  smoking?: string
  exerciseFrequency?: string
  diet?: string
  pets?: string
  languages?: string[]
  ethnicity?: string[]
  religion?: string
  hasChildren?: string
  wantsChildren?: string
  starSign?: string
  isVerified: boolean
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected'
  isIdVerified?: boolean
  lastActive?: number
  credits: number
  subscriptionTier?: 'free' | 'plus' | 'platinum'
  subscriptionExpiresAt?: number
  mode: AppMode
  trustScore: number
  isOnboarded?: boolean
  hasVideoIntro?: boolean
}

export interface Match {
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
  currentUser: User
  setCurrentUser: (user: User) => void
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

const AppContext = createContext<AppContextType | undefined>(undefined)

// Mapping Helpers
const mapBackendToUser = (data: any): User => {
  const onboarded = !!data.is_onboarded;
  const parseJson = (val: any) => {
    if (!val) return [];
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return []; }
    }
    return val;
  };

  return {
    id: data._id || data.id,
    name: data.name,
    age: data.age,
    bio: data.bio,
    photoUrl: data.main_photo_url || data.photoUrl,
    photos: parseJson(data.photo_urls),
    credits: data.credits_balance || 0,
    isVerified: !!data.is_verified,
    verificationStatus: data.verification_status,
    isIdVerified: !!data.is_id_verified,
    mode: data.mode === 1 ? "friendship" : "dating",
    isOnboarded: onboarded,
    userLocation: data.city || data.location,
    hometown: data.hometown,
    height: data.height,
    relationshipGoals: parseJson(data.relationship_goals),
    interests: parseJson(data.interests),
    drinking: data.drinking,
    smoking: data.smoking,
    exerciseFrequency: data.exercise_frequency,
    diet: data.diet,
    pets: data.pets,
    languages: parseJson(data.languages),
    ethnicity: parseJson(data.ethnicity),
    religion: data.religion,
    hasChildren: data.has_children,
    wantsChildren: data.wants_children,
    starSign: data.star_sign,
    jobTitle: data.job_title,
    company: data.company,
    school: data.school,
    subscriptionTier: data.subscription_tier || 'free',
    trustScore: data.trust_score || 10,
    hasVideoIntro: !!data.video_intro_url,
  };
};

const mapUserToBackend = (updates: Partial<User>): any => {
  const backend: any = {};
  if (updates.name !== undefined) backend.name = updates.name;
  if (updates.bio !== undefined) backend.bio = updates.bio;
  if (updates.age !== undefined) backend.age = updates.age;
  if (updates.jobTitle !== undefined) backend.job_title = updates.jobTitle;
  if (updates.company !== undefined) backend.company = updates.company;
  if (updates.school !== undefined) backend.school = updates.school;
  if (updates.userLocation !== undefined) backend.city = updates.userLocation;
  if (updates.hometown !== undefined) backend.hometown = updates.hometown;
  if (updates.height !== undefined) backend.height = updates.height;
  if (updates.starSign !== undefined) backend.star_sign = updates.starSign;
  if (updates.religion !== undefined) backend.religion = updates.religion;
  if (updates.drinking !== undefined) backend.drinking = updates.drinking;
  if (updates.smoking !== undefined) backend.smoking = updates.smoking;
  if (updates.exerciseFrequency !== undefined) backend.exercise_frequency = updates.exerciseFrequency;
  if (updates.diet !== undefined) backend.diet = updates.diet;
  if (updates.pets !== undefined) backend.pets = updates.pets;
  if (updates.hasChildren !== undefined) backend.has_children = updates.hasChildren;
  if (updates.wantsChildren !== undefined) backend.wants_children = updates.wantsChildren;
  if (updates.photoUrl !== undefined) backend.main_photo_url = updates.photoUrl;
  if (updates.videoUrl !== undefined) backend.video_intro_url = updates.videoUrl;

  if (updates.photos !== undefined) backend.photo_urls = JSON.stringify(updates.photos);
  if (updates.interests !== undefined) backend.interests = JSON.stringify(updates.interests);
  if (updates.relationshipGoals !== undefined) backend.relationship_goals = JSON.stringify(updates.relationshipGoals);
  if (updates.languages !== undefined) backend.languages = JSON.stringify(updates.languages);
  if (updates.ethnicity !== undefined) backend.ethnicity = JSON.stringify(updates.ethnicity);

  if (updates.mode !== undefined) backend.mode = updates.mode === "friendship" ? 1 : 0;
  if (updates.isOnboarded !== undefined) backend.is_onboarded = updates.isOnboarded ? 1 : 0;
  if (updates.isVerified !== undefined) backend.is_verified = updates.isVerified ? 1 : 0;
  if (updates.subscriptionTier !== undefined) backend.subscription_tier = updates.subscriptionTier;
  if (updates.credits !== undefined) backend.credits_balance = updates.credits;
  if (updates.gender !== undefined) backend.gender = updates.gender;
  if (updates.interestedIn !== undefined) backend.interested_in = updates.interestedIn;

  return backend;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("welcome")
  const [mode, setMode] = useState<AppMode>("dating")
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [user, setUser] = useState<User>(defaultUser)
  const [matches, setMatches] = useState<Match[]>([])
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedUser, setMatchedUser] = useState<User | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { toast } = useToast()

  const handleAuthenticatedUser = useCallback((data: any) => {
    const mappedUser = mapBackendToUser(data);
    setUser(mappedUser);
    setIsOnboarded(mappedUser.isOnboarded || false);

    localStorage.setItem('user_data', JSON.stringify(mappedUser));
    localStorage.setItem('is_onboarded', mappedUser.isOnboarded ? 'true' : 'false');
    if (mappedUser.id) localStorage.setItem('user_id', mappedUser.id);

    if (mappedUser.isOnboarded && currentScreen === "welcome") {
      setCurrentScreen("feed");
    } else if (!mappedUser.isOnboarded && (currentScreen === "welcome" || currentScreen === "phone")) {
      setCurrentScreen("profile-setup");
    }
  }, [currentScreen]);

  // Session Restoration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('auth_token');
    const storedScreen = localStorage.getItem('current_screen') as AppScreen | null;
    const storedUser = localStorage.getItem('user_data');

    if (storedScreen) setCurrentScreen(storedScreen);
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) { console.error(e); }
    }

    if (token) {
      api.user.getProfile()
        .then(data => data && handleAuthenticatedUser(data))
        .catch(e => {
          if (e.message.includes("Unauthorized")) {
            api.auth.logout();
            setCurrentScreen("welcome");
          }
        });
    }
  }, [handleAuthenticatedUser]);

  // Persist Screen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_screen', currentScreen);
    }
  }, [currentScreen]);

  const login = async (phone: string) => {
    try {
      const data = await api.auth.loginLegacy(phone);
      handleAuthenticatedUser(data);
    } catch (e) { throw e; }
  }

  const registerPasskey = async (email: string) => {
    try {
      const userId = user?.id === "self" ? crypto.randomUUID() : user.id;
      const options = await api.auth.getRegisterOptions(userId, email);
      const regResp = await startRegistration(options);
      const verifyResp = await api.auth.verifyRegister(userId, email, regResp);
      if (verifyResp.success) handleAuthenticatedUser(verifyResp);
    } catch (e) { throw e; }
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

  const loginWithGoogle = async (idToken: string) => {
    try {
      const data = await api.auth.loginGoogle(idToken);
      handleAuthenticatedUser(data);
    } catch (e: any) {
      toast({
        title: "Google Sign-In Failed",
        description: e?.message || "Please try another method.",
        variant: "destructive",
      });
      setCurrentScreen("phone");
    }
  }

  const loginWithPasskey = async () => {
    setIsLoggingIn(true);
    try {
      const options = await api.auth.getLoginOptions();
      const authResp = await startAuthentication(options);
      const verifyResp = await api.auth.verifyLoginPasskey(authResp);
      if (verifyResp.success) {
        handleAuthenticatedUser(verifyResp);
      } else {
        throw new Error("Verification failed");
      }
    } catch (e: any) {
      toast({
        title: "Login Error",
        description: e?.message || "Passkey login failed.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    const previousUser = user;
    const newUser = { ...user, ...updates };
    setUser(newUser);
    localStorage.setItem('user_data', JSON.stringify(newUser));

    try {
      const backendUpdates = mapUserToBackend(updates);
      if (Object.keys(backendUpdates).length > 0) {
        await api.user.updateProfile(backendUpdates);
      }
    } catch (e) {
      setUser(previousUser);
      localStorage.setItem('user_data', JSON.stringify(previousUser));
      toast({
        title: "Update Failed",
        description: "Your changes couldn't be saved. Please try again.",
        variant: "destructive",
      });
    }
  }

  const loadFeed = async (lat: number, long: number) => {
    try {
      const res = await api.feed.getRecs(lat, long);
      return res.data?.results;
    } catch (e) { console.error(e); }
  }

  return (
    <AppContext.Provider
      value={{
        currentScreen, setCurrentScreen,
        mode, setMode,
        isOnboarded, setIsOnboarded,
        matches, setMatches,
        showMatchModal, setShowMatchModal,
        matchedUser, setMatchedUser,
        user, setUser,
        currentUser: user, setCurrentUser: setUser,
        updateUser,
        login, registerPasskey,
        loginWithEmail, verifyEmailOTP,
        loginWithGoogle, loginWithPasskey,
        loadFeed, isLoggingIn
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within an AppProvider")
  return context
}
