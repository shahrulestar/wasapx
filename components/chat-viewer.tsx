"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { DateRange } from "react-day-picker"
import { ChatBubble, isEncryptionNotice, isSystemLikeMessage } from "@/components/chat-bubble"
import { ChatHeader } from "@/components/chat-header"
import type { ParsedChat } from "@/lib/parse-chat"
import { revokeMediaUrls } from "@/lib/parse-chat"

interface ChatViewerProps {
  chat: ParsedChat
  onBack: () => void
}

function formatDateLabel(date: Date): string {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString()
}

export function ChatViewer({ chat, onBack }: ChatViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastScrollTop = useRef(0)
  const [isBarVisible, setIsBarVisible] = useState(true)
  const [isSwapped, setIsSwapped] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Revoke blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => revokeMediaUrls(chat)
  }, [chat])

  // Attach scroll listener to the native scrollable container
  useEffect(() => {
    const viewport = scrollAreaRef.current
    if (!viewport) return

    let ticking = false

    function handleScroll() {
      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        const currentScrollTop = viewport!.scrollTop
        const delta = currentScrollTop - lastScrollTop.current
        const maxScroll =
          viewport!.scrollHeight - viewport!.clientHeight

        // Only trigger on meaningful scroll (> 2px threshold)
        if (Math.abs(delta) > 2) {
          // Close calendar popover on any scroll
          setIsCalendarOpen(false)

          if (delta > 0) {
            // Scrolling down → hide
            setIsBarVisible(false)
          } else {
            // Scrolling up → show
            setIsBarVisible(true)
          }
        }

        // Always show at top or near bottom
        if (currentScrollTop < 10 || currentScrollTop >= maxScroll - 10) {
          setIsBarVisible(true)
        }

        lastScrollTop.current = currentScrollTop
        ticking = false
      })
    }

    viewport.addEventListener("scroll", handleScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [])

  // Compute min/max dates from the chat
  const chatDateRange = useMemo(() => {
    if (chat.messages.length === 0) return { min: new Date(), max: new Date() }
    const timestamps = chat.messages.map((m) => m.timestamp.getTime())
    return {
      min: new Date(Math.min(...timestamps)),
      max: new Date(Math.max(...timestamps)),
    }
  }, [chat.messages])

  // Filter messages by date range
  const filteredMessages = useMemo(() => {
    if (!dateRange?.from) return chat.messages

    const from = new Date(dateRange.from)
    from.setHours(0, 0, 0, 0)

    const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from)
    to.setHours(23, 59, 59, 999)

    return chat.messages.filter((m) => {
      const t = m.timestamp.getTime()
      return t >= from.getTime() && t <= to.getTime()
    })
  }, [chat.messages, dateRange])

  const nonSystemMessages = filteredMessages.filter(
    (m) => !m.isSystem && !isEncryptionNotice(m.message) && !isSystemLikeMessage(m.message)
  )

  return (
    <div className="flex h-dvh flex-col">
      <div
        ref={scrollAreaRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto w-full max-w-[800px] px-3">
          <div className="flex flex-col gap-1 py-4 pb-28">
            {filteredMessages.map((msg, idx) => {
              const prevMsg = idx > 0 ? filteredMessages[idx - 1] : null
              const showDateSep =
                !prevMsg || !isSameDay(prevMsg.timestamp, msg.timestamp)
              const isPrevSystemLike =
                prevMsg &&
                (prevMsg.isSystem || isEncryptionNotice(prevMsg.message) || isSystemLikeMessage(prevMsg.message))
              const isCurrentSystemLike =
                msg.isSystem || isEncryptionNotice(msg.message) || isSystemLikeMessage(msg.message)
              const showSender =
                !isCurrentSystemLike &&
                (!prevMsg ||
                  prevMsg.sender !== msg.sender ||
                  isPrevSystemLike ||
                  showDateSep)

              return (
                <div key={idx}>
                  {showDateSep && (
                    <div className="flex items-center justify-center py-3">
                      <div className="rounded-lg bg-muted px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                        {formatDateLabel(msg.timestamp)}
                      </div>
                    </div>
                  )}
                  <div className={showSender && !msg.isSystem ? "mt-2" : ""}>
                    <ChatBubble
                      message={msg}
                      isSelf={isSwapped ? msg.sender !== chat.self : msg.sender === chat.self}
                      showSender={showSender}
                      media={chat.media}
                    />
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      <ChatHeader
        participants={chat.participants}
        messageCount={nonSystemMessages.length}
        onBack={onBack}
        onSwap={() => setIsSwapped((prev) => !prev)}
        isSwapped={isSwapped}
        isVisible={isBarVisible}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        minDate={chatDateRange.min}
        maxDate={chatDateRange.max}
        isCalendarOpen={isCalendarOpen}
        onCalendarOpenChange={setIsCalendarOpen}
      />
    </div>
  )
}
