"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { BottomNav } from "./bottom-nav"
import { DevToolbar } from "./dev-toolbar"
import { WelcomeScreen } from "./onboarding/welcome-screen"
import { PhoneScreen } from "./onboarding/phone-screen"
import { ModeScreen } from "./onboarding/mode-screen"
import { ProfileSetupScreen } from "./onboarding/profile-setup-screen"
import { PromptsScreen } from "./onboarding/prompts-screen"
import { VideoScreen } from "./onboarding/video-screen"
import { LocationScreen } from "./onboarding/location-screen"
import { FeedScreen } from "./feed/feed-screen"
import { FiltersScreen } from "./feed/filters-screen"
import { MatchesScreen } from "./matches/matches-screen"
import { ChatScreen } from "./chat/chat-screen"
import { ProfileScreen } from "./profile/profile-screen"
import { SettingsScreen } from "./settings/settings-screen"
import { CreditsStore } from "./credits/credits-store"
import { NotificationSettingsScreen } from "./settings/notification-settings-screen"
import { LoveVibesSplash } from "./splash-screen"
import { BlockedUsersScreen } from "./settings/blocked-users-screen"
import { LegalScreen } from "./settings/legal-screen"
import { HelpCenterScreen } from "./settings/help-center-screen"
import { VibeWindowsScreen } from "./vibe-windows/vibe-windows-screen"
import { VoiceFeedScreen } from "./voice/voice-feed-screen"
import { SuccessStoriesScreen } from "./success/success-stories-screen"
import { ReferralDashboardScreen } from "./referrals/referral-dashboard-screen"
import { ChemistryTestScreen } from "./chemistry/chemistry-test-screen"
import { MutualFriendsScreen } from "./social/mutual-friends-screen"
import { BoostScreen } from "./boost/boost-screen"
import { InnovativeFeaturesScreen } from "./settings/innovative-features-screen"
import { IdentitySignatureScreen } from "./viral/identity-signature-screen"


export function LoveVibesApp() {
  const { currentScreen, isOnboarded } = useApp()
  const [showSplash, setShowSplash] = useState(true)

  // Show splash on first render

  if (showSplash) {
    return <LoveVibesSplash onComplete={() => setShowSplash(false)} />
  }

  // Onboarding screens
  if (!isOnboarded) {
    return (
      <div className="h-screen max-w-md mx-auto">
        {currentScreen === "welcome" && <WelcomeScreen />}
        {currentScreen === "phone" && <PhoneScreen />}
        {currentScreen === "mode" && <ModeScreen />}
        {currentScreen === "profile-setup" && <ProfileSetupScreen />}
        {currentScreen === "prompts" && <PromptsScreen />}
        {currentScreen === "video" && <VideoScreen />}
        {currentScreen === "location" && <LocationScreen />}
        {!["welcome", "phone", "mode", "profile-setup", "prompts", "video", "location"].includes(currentScreen) && <WelcomeScreen />}
        <DevToolbar />
      </div>
    )
  }

  // Main app screens with bottom navigation
  const showBottomNav = ["feed", "matches", "profile", "innovative-features"].includes(currentScreen)

  return (
    <div className="h-screen flex flex-col max-w-md mx-auto">
      <main className="flex-1 overflow-hidden">
        {currentScreen === "feed" && <FeedScreen />}
        {currentScreen === "filters" && <FiltersScreen />}
        {currentScreen === "matches" && <MatchesScreen />}
        {currentScreen === "chat" && <ChatScreen />}
        {currentScreen === "profile" && <ProfileScreen />}

        {currentScreen === "settings" && <SettingsScreen />}
        {currentScreen === "credits" && <CreditsStore />}
        {currentScreen === "notification-settings" && <NotificationSettingsScreen />}
        {currentScreen === "blocked-users" && <BlockedUsersScreen />}
        {currentScreen === "privacy-policy" && <LegalScreen type="privacy" />}
        {currentScreen === "terms-of-service" && <LegalScreen type="terms" />}
        {currentScreen === "help-center" && <HelpCenterScreen />}
        {currentScreen === "vibe-windows" && <VibeWindowsScreen />}
        {currentScreen === "voice-feed" && <VoiceFeedScreen />}
        {currentScreen === "success-stories" && <SuccessStoriesScreen />}
        {currentScreen === "referral-dashboard" && <ReferralDashboardScreen />}
        {currentScreen === "chemistry-test" && <ChemistryTestScreen />}
        {currentScreen === "mutual-friends" && <MutualFriendsScreen />}
        {currentScreen === "boost" && <BoostScreen />}
        {currentScreen === "innovative-features" && <InnovativeFeaturesScreen />}
        {currentScreen === "identity-signature" && <IdentitySignatureScreen />}
        {/* Redirect legacy social-endorsements to new dashboard */}
        {currentScreen === "social-endorsements" && <ReferralDashboardScreen />}
      </main>
      {showBottomNav && <BottomNav />}
      <DevToolbar />
    </div>
  )
}
