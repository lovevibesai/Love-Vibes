"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, UserX, UserCheck, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface BlockedUser {
    id: string
    name: string
    photo: string
    blockedAt: string
}

const MOCK_BLOCKED_USERS: BlockedUser[] = [
    {
        id: "b1",
        name: "Alex Johnson",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
        blockedAt: "Jan 12, 2024"
    },
    {
        id: "b2",
        name: "Sarah Miller",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
        blockedAt: "Dec 28, 2023"
    }
]

export function BlockedUsersScreen() {
    const { setCurrentScreen } = useApp()
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(MOCK_BLOCKED_USERS)
    const [unblockingId, setUnblockingId] = useState<string | null>(null)

    const handleUnblock = (id: string) => {
        setUnblockingId(id)
        // Simulate API call
        setTimeout(() => {
            setBlockedUsers(prev => prev.filter(user => user.id !== id))
            setUnblockingId(null)
        }, 1000)
    }

    return (
        <div className="h-full flex flex-col items-center bg-background overflow-hidden">
            <div className="w-full max-w-md h-full flex flex-col bg-background relative shadow-2xl">
                {/* Header */}
                <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card sticky top-0 z-10">
                    <button
                        onClick={() => setCurrentScreen("settings")}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-foreground" />
                    </button>
                    <h1 className="text-lg font-semibold text-foreground">Blocked Users</h1>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-6 flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">Privacy Protection</p>
                            <p className="text-xs text-muted-foreground">Blocked users cannot see your profile or send you messages.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {blockedUsers.length > 0 ? (
                                blockedUsers.map((user) => (
                                    <motion.div
                                        key={user.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-center justify-between p-3 bg-card rounded-2xl border border-border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={user.photo}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover grayscale"
                                            />
                                            <div>
                                                <p className="font-semibold text-foreground">{user.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">Blocked: {user.blockedAt}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleUnblock(user.id)}
                                            disabled={unblockingId === user.id}
                                            className="rounded-full gap-2 border-primary/20 hover:bg-primary/10 text-primary"
                                        >
                                            {unblockingId === user.id ? (
                                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <UserCheck className="w-4 h-4" />
                                                    Unblock
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-20 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <UserX className="w-10 h-10 text-muted-foreground opacity-20" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground">No Blocked Users</h3>
                                    <p className="text-sm text-muted-foreground px-10">
                                        When you block someone, they will appear here. You can unblock them at any time.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
