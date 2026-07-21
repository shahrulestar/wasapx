"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import type { DateRange } from "react-day-picker"
import { ChatBubble, isEncryptionNotice, isSystemLikeMessage } from "@/components/chat-bubble"
import { ChatHeader } from "@/components/chat-header"
import type { ParsedChat } from "@/lib/parse-chat"
import { revokeMediaUrls } from "@/lib/parse-chat"

interface ChatViewerProps {
  chat: ParsedChat
  onBack: () => void
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

function formatDateLabel(date: Date): string {
  // Manual format — avoids Node vs browser locale hydration mismatches.
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
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
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    return () => revokeMediaUrls(chat)
  }, [chat])

  useEffect(() => {
    const viewport = scrollAreaRef.current
    if (!viewport) return

    let ticking = false

    function updateAtBottom() {
      const maxScroll = viewport!.scrollHeight - viewport!.clientHeight
      setIsAtBottom(maxScroll <= 10 || viewport!.scrollTop >= maxScroll - 10)
    }

    function handleScroll() {
      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        const currentScrollTop = viewport!.scrollTop
        const delta = currentScrollTop - lastScrollTop.current
        const maxScroll = viewport!.scrollHeight - viewport!.clientHeight

        if (Math.abs(delta) > 2) {
          setIsCalendarOpen(false)
          setIsBarVisible(delta < 0)
        }

        if (currentScrollTop < 10 || currentScrollTop >= maxScroll - 10) {
          setIsBarVisible(true)
        }

        setIsAtBottom(maxScroll <= 10 || currentScrollTop >= maxScroll - 10)
        lastScrollTop.current = currentScrollTop
        ticking = false
      })
    }

    updateAtBottom()
    viewport.addEventListener("scroll", handleScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [])

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

  const nonSystemMessageCount = useMemo(() => {
    return filteredMessages.filter(
      (m) => !m.isSystem && !isEncryptionNotice(m.message) && !isSystemLikeMessage(m.message)
    ).length
  }, [filteredMessages])

  const currentSelf = chat.participants[selfIndex] ?? chat.self

  const handleSwap = useCallback(() => {
    setSelfIndex((prev) => (prev + 1) % chat.participants.length)
  }, [chat.participants.length])

  const handleScrollEdge = useCallback(() => {
    const viewport = scrollAreaRef.current
    if (!viewport) return
    viewport.scrollTo({
      top: isAtBottom ? 0 : viewport.scrollHeight,
      behavior: "smooth",
    })
  }, [isAtBottom])

  return (
    <div className="relative h-full min-h-0 w-full flex-1 overflow-hidden">
      <div
        ref={scrollAreaRef}
        className="absolute inset-0 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
      >
        <div className="mx-auto w-full max-w-[800px] px-3">
          <div className="flex flex-col pt-4 pb-[calc(9rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(8rem+env(safe-area-inset-bottom,0px))]">
            {isMounted &&
              filteredMessages.map((msg, idx) => {
              const prevMsg = idx > 0 ? filteredMessages[idx - 1] : null
              const showDateSep =
                !prevMsg || !isSameDay(prevMsg.timestamp, msg.timestamp)
              const isPrevSystemLike =
                prevMsg &&
                (prevMsg.isSystem ||
                  isEncryptionNotice(prevMsg.message) ||
                  isSystemLikeMessage(prevMsg.message))
              const isCurrentSystemLike =
                msg.isSystem ||
                isEncryptionNotice(msg.message) ||
                isSystemLikeMessage(msg.message)
              const showSender =
                !isCurrentSystemLike &&
                (!prevMsg ||
                  prevMsg.sender !== msg.sender ||
                  isPrevSystemLike ||
                  showDateSep)

              return (
                <div key={`${msg.timestamp.getTime()}-${idx}`} className="pb-1">
                  {showDateSep && (
                    <div className="flex justify-center py-3">
                      <div className="rounded-lg bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
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

      <ChatHeader
        participants={chat.participants}
        messageCount={nonSystemMessageCount}
        onBack={onBack}
        onSwap={handleSwap}
        onScrollEdge={handleScrollEdge}
        isAtBottom={isAtBottom}
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
