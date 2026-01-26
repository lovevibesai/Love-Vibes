"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, MoreVertical, Send, ImageIcon, Gift, Check, CheckCheck, Sparkles } from "lucide-react"
import { TrustScore } from "../trust-score"
import { GiftSheet } from "./gift-sheet"
import { ChatMenu } from "./chat-menu"
import { IcebreakerPanel } from "./icebreaker-panel"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api-client"
import { playSound } from "@/lib/sounds"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://love-vibes-backend.thelovevibes-ai.workers.dev';

interface Message {
  id: string
  text: string
  sender: "me" | "them"
  timestamp: Date
  read: boolean
  type: "text" | "gift"
  giftName?: string
}

const mockMessages: Message[] = []

function formatMessageTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatDateHeader(date: Date) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

export function ChatScreen() {
  const { setCurrentScreen, matches, user } = useApp()
  const [messages, setMessages] = useState<Message[]>([]) // Production: Start with no messages
  const [inputValue, setInputValue] = useState("")
  const [showGiftSheet, setShowGiftSheet] = useState(false)
  const [showIcebreakers, setShowIcebreakers] = useState(messages.length === 0)
  const [showMenu, setShowMenu] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use the active match
  const activeMatch = matches[0] // Simplified for demo, should be from route params
  const chatPartner = activeMatch?.user
  const chatRoomId = activeMatch?.chatRoomId

  useEffect(() => {
    if (!chatRoomId || !user?.id) return;

    const socket = new WebSocket(`${WS_URL}/ws/chat?match_id=${chatRoomId}&user_id=${user.id}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to Chat Room");
      setIsOnline(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const incomingMsg: Message = {
        id: Math.random().toString(),
        text: data.text,
        sender: data.sender_id === user.id ? "me" : "them",
        timestamp: new Date(data.timestamp),
        read: false,
        type: data.type || "text",
        giftName: data.giftName,
      };
      setMessages(prev => [...prev, incomingMsg]);
      playSound("message");
    };

    socket.onclose = () => {
      console.log("Disconnected from Chat Room");
      setIsOnline(false);
    };

    return () => {
      socket.close();
    };
  }, [chatRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim() || !socketRef.current) return

    const messagePayload = {
      text: inputValue,
      type: "text",
      timestamp: Date.now()
    }

    socketRef.current.send(JSON.stringify(messagePayload))
    setInputValue("")
    playSound("message")
  }

  const handleGiftSend = (giftName: string) => {
    if (!socketRef.current) return

    const messagePayload = {
      text: `Sent a gentle ${giftName}`,
      type: "gift",
      giftName,
      timestamp: Date.now()
    }

    socketRef.current.send(JSON.stringify(messagePayload))
    setShowGiftSheet(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!chatPartner) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">No chat selected</p>
      </div>
    )
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const dateKey = message.timestamp.toDateString()
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-16 border-b border-border bg-card">
        <button
          onClick={() => setCurrentScreen("matches")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={chatPartner.photoUrl || "/placeholder.svg"}
                alt={chatPartner.name}
                className="w-full h-full object-cover"
              />
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-trust-high border-2 border-card" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{chatPartner.name}</h2>
            <span className={`text-xs ${isOnline ? "text-trust-high" : "text-muted-foreground"}`}>
              {isOnline ? "Online" : "Last seen recently"}
            </span>
          </div>
        </div>

        <TrustScore score={chatPartner.trustScore} size="sm" />

        <button
          onClick={() => setShowMenu(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 relative">
        <AnimatePresence>
          {showIcebreakers && (
            <div className="mb-4">
              <IcebreakerPanel
                withUserId={chatPartner.id}
                onSelect={(text) => {
                  setInputValue(text)
                  setShowIcebreakers(false)
                }}
                onClose={() => setShowIcebreakers(false)}
              />
            </div>
          )}
        </AnimatePresence>

        {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
          <div key={dateKey}>
            {/* Date Header */}
            <div className="flex justify-center my-4">
              <span className="px-3 py-1 text-xs font-medium text-muted-foreground bg-muted rounded-full">
                {formatDateHeader(new Date(dateKey))}
              </span>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex mb-3",
                  message.sender === "me" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-3 rounded-[24px] shadow-sm transition-all relative group",
                    message.sender === "me"
                      ? "rounded-br-[4px] shadow-modal"
                      : "rounded-bl-[4px]",
                    message.type === "gift" && "bg-gold/10 border border-gold/30 backdrop-blur-sm"
                  )}
                  style={{
                    background: message.sender === "me" ? "var(--chat-me-bg)" : "var(--chat-them-bg)",
                    color: message.sender === "me" ? "var(--chat-me-text)" : "var(--chat-them-text)",
                  }}
                >
                  {message.type === "gift" ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-gold" />
                      </div>
                      <span className="font-semibold tracking-wide">
                        {message.text}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[16px] leading-[1.5] font-medium tracking-tight">
                      {message.text}
                    </p>
                  )}
                  <div className={cn(
                    "flex items-center justify-end gap-1.5 mt-1.5 opacity-70",
                    message.sender === "me" ? "text-white/80" : "text-muted-foreground"
                  )}>
                    <span className="text-[10px] uppercase font-bold tracking-widest">{formatMessageTime(message.timestamp)}</span>
                    {message.sender === "me" && (
                      message.read
                        ? <CheckCheck className="w-3.5 h-3.5" />
                        : <Check className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card px-4 py-3 safe-bottom">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowGiftSheet(true)}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Send gift"
          >
            <Gift className="w-5 h-5 text-gold" />
          </button>

          <button
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Send image"
          >
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your feelings..."
              rows={1}
              className="w-full px-4 py-2.5 border border-border rounded-2xl resize-none text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none max-h-24"
              style={{ minHeight: "44px" }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={cn(
              "w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all",
              inputValue.trim()
                ? "bg-primary text-white hover:bg-primary-hover"
                : "bg-muted text-muted-foreground"
            )}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Gift Sheet */}
      {showGiftSheet && (
        <GiftSheet
          onClose={() => setShowGiftSheet(false)}
          onSendGift={handleGiftSend}
        />
      )}

      {/* Chat Menu */}
      {showMenu && (
        <ChatMenu
          userName={chatPartner.name || "User"}
          onClose={() => setShowMenu(false)}
          onUnmatch={() => {
            // In a real app, this would call the API
            setCurrentScreen("matches")
          }}
          onReport={() => {
            // In a real app, this would submit the report
            console.log("Report submitted")
          }}
          onMute={() => {
            // In a real app, this would mute notifications
            console.log("Notifications muted")
          }}
        />
      )}
    </div>
  )
}
