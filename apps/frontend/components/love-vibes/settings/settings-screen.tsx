"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import {
  ChevronLeft,
  MapPin,
  Eye,
  Bell,
  Shield,
  User,
  LogOut,
  Trash2,
  ChevronRight,
  Lock,
  FileText,
  HelpCircle,
} from "lucide-react"
import { api } from "@/lib/api-client"

export function SettingsScreen() {
  const { setCurrentScreen, user, updateUser } = useApp()
  const { setTheme, resolvedTheme } = useTheme()
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    gifts: true,
    marketing: false,
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleLogout = () => {
    updateUser({ isOnboarded: false })
    setCurrentScreen("welcome")
  }

  const handleUpdateLocation = async () => {
    setIsUpdatingLocation(true)
    try {
      const { Geolocation } = await import('@capacitor/geolocation')
      const position = await Geolocation.getCurrentPosition()
      const { latitude, longitude } = position.coords

      await api.proximity.updateLocation(latitude, longitude)

      const locationString = `Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`
      updateUser({ ...user, userLocation: locationString })

      alert("Location updated successfully!")
    } catch (err) {
      console.error("Failed to update location:", err)
      alert("Could not get location. Please check your permissions.")
    } finally {
      setIsUpdatingLocation(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button
          onClick={() => setCurrentScreen("profile")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Location Section */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Location</h2>
          <button
            className="w-full flex items-center justify-between p-4 bg-card rounded-xl shadow-card disabled:opacity-50"
            onClick={handleUpdateLocation}
            disabled={isUpdatingLocation}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {isUpdatingLocation ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MapPin className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">{user?.userLocation || "Location Not Set"}</p>
                <p className="text-sm text-muted-foreground">{isUpdatingLocation ? "Updating..." : "Tap to update"}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </section>

        {/* Visibility Section */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Visibility</h2>
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 border-b border-border"
              onClick={() => setCurrentScreen("visibility-settings")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Show me to</p>
                  <p className="text-sm text-muted-foreground">Everyone</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Incognito Mode</p>
                  <p className="text-sm text-muted-foreground">Browse without being seen</p>
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Appearance</h2>
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {resolvedTheme === "dark" ? "🌙" : "☀️"}
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Adjust the look of Love Vibes</p>
                </div>
              </div>
              <Switch
                checked={resolvedTheme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </div>
        </section>



        {/* Notifications Section */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Notifications</h2>
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4"
              onClick={() => setCurrentScreen("notification-settings")}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-foreground">Push & Email</p>
                  <p className="text-sm text-muted-foreground">Manage your alerts</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Privacy & Safety */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Privacy & Safety</h2>
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-muted/30 transition-colors"
              onClick={() => setCurrentScreen("blocked-users")}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#4A7C59]" />
                <span className="font-medium text-foreground">Blocked Users</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-muted/30 transition-colors"
              onClick={() => setCurrentScreen("privacy-policy")}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Privacy Policy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              onClick={() => setCurrentScreen("terms-of-service")}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Terms of Service</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Support */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Support</h2>
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              onClick={() => setCurrentScreen("help-center")}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Help Center</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Account Actions */}
        <section className="p-4 pb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Account</h2>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 justify-start gap-3 border-border bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Log Out</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 justify-start gap-3 border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Account</span>
            </Button>
          </div>
        </section>

        {/* App Version */}
        <div className="text-center pb-8">
          <p className="text-sm text-muted-foreground">Love Vibes v1.0.0</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm flex items-end z-50">
          <div className="w-full bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Delete Account?</h2>
              <p className="text-muted-foreground">
                This will permanently delete your profile, matches, and messages. This action cannot be undone.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={handleLogout}
              >
                Yes, Delete My Account
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 bg-transparent"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
