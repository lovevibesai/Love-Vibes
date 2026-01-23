"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Shield, AlertTriangle, Ban, Eye, Check, X } from "lucide-react"

interface Report {
    id: string
    reporter_id: string
    reported_user_id: string
    reported_user_name: string
    reason: string
    description: string
    created_at: number
    status: string
}

export function AdminModerationScreen({ onBack }: { onBack: () => void }) {
    const [reports, setReports] = useState<Report[]>([])
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)

    useEffect(() => {
        loadReports()
    }, [])

    const loadReports = () => {
        // TODO: Load from API
        // Mock data
        setReports([
            {
                id: "1",
                reporter_id: "user1",
                reported_user_id: "user2",
                reported_user_name: "John Doe",
                reason: "inappropriate_content",
                description: "Inappropriate photos in profile",
                created_at: Date.now() - 3600000,
                status: "pending",
            },
            {
                id: "2",
                reporter_id: "user3",
                reported_user_id: "user4",
                reported_user_name: "Jane Smith",
                reason: "harassment",
                description: "Sending unwanted messages",
                created_at: Date.now() - 7200000,
                status: "pending",
            },
        ])
    }

    const handleAction = (reportId: string, action: 'dismiss' | 'warn' | 'ban') => {
        // TODO: Call API
        setReports(reports.filter(r => r.id !== reportId))
        setSelectedReport(null)
    }

    const getReasonLabel = (reason: string) => {
        const labels: Record<string, string> = {
            inappropriate_content: "Inappropriate Content",
            harassment: "Harassment",
            spam: "Spam",
            fake_profile: "Fake Profile",
            other: "Other",
        }
        return labels[reason] || reason
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                <button
                    onClick={onBack}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold text-foreground">Moderation Dashboard</h1>
                    <p className="text-xs text-muted-foreground">{reports.length} pending reports</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-destructive" />
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {!selectedReport ? (
                    <div className="p-4 space-y-3">
                        {reports.length === 0 ? (
                            <div className="text-center py-12">
                                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
                                <p className="text-muted-foreground">No pending reports to review</p>
                            </div>
                        ) : (
                            reports.map((report) => (
                                <button
                                    key={report.id}
                                    onClick={() => setSelectedReport(report)}
                                    className="w-full p-4 bg-card rounded-xl border border-border hover:border-primary transition-colors text-left"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground">{report.reported_user_name}</h3>
                                            <p className="text-sm text-muted-foreground">{getReasonLabel(report.reason)}</p>
                                        </div>
                                        <div className="px-2 py-1 bg-amber-500/20 text-amber-700 text-xs font-medium rounded">
                                            Pending
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {new Date(report.created_at).toLocaleString()}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="p-6 max-w-2xl mx-auto">
                        <div className="mb-6">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="text-sm text-primary hover:underline mb-4"
                            >
                                ← Back to reports
                            </button>

                            <div className="p-6 bg-card rounded-2xl border border-border">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground mb-1">{selectedReport.reported_user_name}</h2>
                                        <p className="text-sm text-muted-foreground">User ID: {selectedReport.reported_user_id}</p>
                                    </div>
                                    <div className="px-3 py-1 bg-destructive/20 text-destructive text-sm font-medium rounded-lg">
                                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                                        {getReasonLabel(selectedReport.reason)}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">Report Details</h3>
                                        <p className="text-muted-foreground leading-relaxed">{selectedReport.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Reported by:</span>
                                            <p className="font-medium text-foreground">{selectedReport.reporter_id}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Reported at:</span>
                                            <p className="font-medium text-foreground">
                                                {new Date(selectedReport.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground mb-3">Take Action</h3>

                            <Button
                                onClick={() => handleAction(selectedReport.id, 'dismiss')}
                                variant="outline"
                                className="w-full h-12 justify-start"
                            >
                                <X className="w-5 h-5 mr-3" />
                                Dismiss Report (No violation found)
                            </Button>

                            <Button
                                onClick={() => handleAction(selectedReport.id, 'warn')}
                                className="w-full h-12 justify-start bg-amber-500 hover:bg-amber-600 text-white"
                            >
                                <AlertTriangle className="w-5 h-5 mr-3" />
                                Warn User (Send warning message)
                            </Button>

                            <Button
                                onClick={() => handleAction(selectedReport.id, 'ban')}
                                className="w-full h-12 justify-start bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                                <Ban className="w-5 h-5 mr-3" />
                                Ban User (Permanent suspension)
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
