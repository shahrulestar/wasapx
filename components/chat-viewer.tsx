"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
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
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastScrollTop = useRef(0)
  const [isBarVisible, setIsBarVisible] = useState(true)
  const detectedSelfIndex = useMemo(() => {
    const idx = chat.participants.indexOf(chat.self)
    return idx === -1 ? 0 : idx
  }, [chat.participants, chat.self])
  const [selfIndex, setSelfIndex] = useState(detectedSelfIndex)
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

  // Compute min/max dates from the chat — use loop to avoid stack overflow with spread on large arrays
  const chatDateRange = useMemo(() => {
    if (chat.messages.length === 0) return { min: new Date(), max: new Date() }
    let min = chat.messages[0].timestamp.getTime()
    let max = min
    for (let i = 1; i < chat.messages.length; i++) {
      const t = chat.messages[i].timestamp.getTime()
      if (t < min) min = t
      if (t > max) max = t
    }
    return { min: new Date(min), max: new Date(max) }
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

  // Memoize non-system message count (previously recomputed on every render)
  const nonSystemMessageCount = useMemo(() => {
    return filteredMessages.filter(
      (m) => !m.isSystem && !isEncryptionNotice(m.message) && !isSystemLikeMessage(m.message)
    ).length
  }, [filteredMessages])

  const currentSelf = chat.participants[selfIndex] ?? chat.self

  // Virtual scrolling — only render messages visible in the viewport + overscan buffer
  const virtualizer = useVirtualizer({
    count: filteredMessages.length,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: () => 72,
    overscan: 20,
  })

  const handleSwap = useCallback(() => {
    setSelfIndex((prev) => (prev + 1) % chat.participants.length)
  }, [chat.participants.length])

  return (
    <div className="flex h-dvh flex-col">
      <div
        ref={scrollAreaRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto w-full max-w-[800px] px-3">
          <div className="pt-4 pb-28">
            <div
              style={{
                height: virtualizer.getTotalSize(),
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const idx = virtualItem.index
                const msg = filteredMessages[idx]
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
                  <div
                    key={virtualItem.key}
                    ref={virtualizer.measureElement}
                    data-index={virtualItem.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    className="pb-1"
                  >
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
                        isSelf={msg.sender === currentSelf}
                        showSender={showSender}
                        media={chat.media}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <ChatHeader
        participants={chat.participants}
        messageCount={nonSystemMessageCount}
        onBack={onBack}
        onSwap={handleSwap}
        isSwapped={selfIndex !== detectedSelfIndex}
        currentSelf={currentSelf}
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
