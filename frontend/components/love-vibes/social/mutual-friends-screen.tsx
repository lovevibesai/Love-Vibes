"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Users, Shield, Upload, Check } from "lucide-react"

export function MutualFriendsScreen() {
    const { setCurrentScreen } = useApp()
    const [contactsImported, setContactsImported] = useState(false)
    const [importedCount, setImportedCount] = useState(0)

    const handleImportContacts = () => {
        // TODO: Actual contact import via API
        // Simulate import
        setTimeout(() => {
            setContactsImported(true)
            setImportedCount(127)
        }, 1500)
    }

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                <button
                    onClick={() => setCurrentScreen("settings")}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Mutual Friends</h1>
                    <p className="text-xs text-muted-foreground">Trusted introductions</p>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {!contactsImported ? (
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-8">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                                <Users className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">Find Mutual Connections</h2>
                            <p className="text-muted-foreground">
                                See who you have mutual friends with and get trusted introductions
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="p-4 bg-card rounded-xl border border-border">
                                <h3 className="font-semibold text-foreground mb-3">How it works:</h3>
                                <ol className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">1.</span>
                                        <span>Import your contacts (they're hashed for privacy)</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">2.</span>
                                        <span>See "1 mutual friend" badges on profiles</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">3.</span>
                                        <span>Request an introduction from your mutual friend</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">4.</span>
                                        <span>Your friend approves → instant match with context</span>
                                    </li>
                                </ol>
                            </div>

                            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-green-700 dark:text-green-400">
                                        <p className="font-semibold mb-1">Privacy Protected</p>
                                        <p>Your contacts are hashed (SHA-256) before upload. We never store raw phone numbers or share your contacts with anyone.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                                <h3 className="font-semibold text-foreground mb-2">Why this works:</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Research shows that introductions from mutual friends lead to 3x higher match success rates. Your friends know you best and can vouch for compatibility.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleImportContacts}
                            className="w-full h-12 gradient-love text-white font-semibold"
                        >
                            <Upload className="w-5 h-5 mr-2" />
                            Import Contacts
                        </Button>

                        <p className="text-xs text-center text-muted-foreground mt-4">
                            By importing, you agree to our privacy policy. You can delete your contacts anytime.
                        </p>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-8">
                            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <Check className="w-12 h-12 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">Contacts Imported!</h2>
                            <p className="text-muted-foreground">
                                {importedCount} contacts securely hashed and ready
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-foreground mb-2">{importedCount}</div>
                                    <div className="text-sm text-muted-foreground">Contacts Imported</div>
                                </div>
                            </div>

                            <div className="p-4 bg-card rounded-xl border border-border">
                                <h3 className="font-semibold text-foreground mb-3">What's next?</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Look for "1 mutual friend" badges on profiles</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Tap to see who you have in common</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Request an introduction if interested</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Your friend gets notified and can approve</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    <strong>Note:</strong> You'll also receive introduction requests when your friends want to connect with someone you know. You have full control to approve or decline.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={() => setCurrentScreen("feed")}
                                className="w-full h-12 gradient-love text-white font-semibold"
                            >
                                Start Browsing
                            </Button>
                            <Button
                                onClick={() => setContactsImported(false)}
                                variant="outline"
                                className="w-full h-12"
                            >
                                Manage Contacts
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
