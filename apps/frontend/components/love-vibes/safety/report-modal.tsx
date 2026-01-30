"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { api } from "@/lib/api-client"
import { Flag, Ban } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReportModalProps {
    reportedUserId: string;
    reportedUserName: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export function ReportModal({ reportedUserId, reportedUserName, isOpen, onClose }: ReportModalProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = isOpen !== undefined ? isOpen : internalOpen
    const setOpen = (val: boolean) => {
        if (!val && onClose) onClose()
        setInternalOpen(val)
    }
    const [reason, setReason] = useState("")
    const [details, setDetails] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async () => {
        if (!reason) return;
        setLoading(true);
        try {
            await api.safety.reportUser(reportedUserId, reason, details);
            toast({
                title: "Report Sent",
                description: "Thank you for keeping our community safe. We will review this shortly.",
            })
            setOpen(false)
        } catch (e) {
            toast({
                title: "Error",
                description: "Could not send report. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false);
        }
    }

    const handleBlock = async () => {
        if (!confirm("Are you sure you want to block this user? You won't see them again.")) return;
        try {
            await api.safety.blockUser(reportedUserId);
            toast({ title: "User Blocked" })
            // In real app, we would refresh the feed here to remove them
        } catch (e) { console.error(e) }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isOpen === undefined ? (
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                        <Flag className="w-4 h-4 mr-2" />
                        Report
                    </Button>
                ) : <span />}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background">
                <DialogHeader>
                    <DialogTitle>Report {reportedUserName}</DialogTitle>
                    <DialogDescription>
                        Help us understand what&apos;s happening.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Select onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SPAM">Spam or Fake Account</SelectItem>
                                <SelectItem value="HARASSMENT">Harassment or Bullying</SelectItem>
                                <SelectItem value="INAPPROPRIATE">Inappropriate Content</SelectItem>
                                <SelectItem value="UNDERAGE">Underage User</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="details">Details (Optional)</Label>
                        <Textarea
                            id="details"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Please provide more context..."
                        />
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={handleBlock} className="text-destructive border-destructive/20 hover:bg-destructive/10">
                        <Ban className="w-4 h-4 mr-2" />
                        Block User
                    </Button>
                    <Button type="submit" onClick={handleSubmit} disabled={loading || !reason}>
                        {loading ? "Sending..." : "Submit Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
