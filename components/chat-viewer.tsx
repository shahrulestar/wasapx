"use client"

import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { DateRange } from "react-day-picker"
import Lenis from "lenis"
import "lenis/dist/lenis.css"
import { ChatBubble, isEncryptionNotice, isSystemLikeMessage } from "@/components/chat-bubble"
import { ChatHeader } from "@/components/chat-header"
import { ChatLoading } from "@/components/chat-loading"
import type { ChatMessage, ParsedChat } from "@/lib/parse-chat"
import { revokeMediaUrls } from "@/lib/parse-chat"

interface ChatViewerProps {
  chat: ParsedChat
  onBack: () => void
}

interface MessageRow {
  message: ChatMessage
  showDateSep: boolean
  showSender: boolean
  isSystemLike: boolean
  dateLabel: string | null
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

const BOTTOM_PAD = 160

function formatDateLabel(date: Date): string {
  // Manual format — avoids Node vs browser locale hydration mismatches.
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString()
}

function buildRows(messages: ChatMessage[]): {
  rows: MessageRow[]
  nonSystemCount: number
} {
  const rows: MessageRow[] = new Array(messages.length)
  let nonSystemCount = 0

  for (let idx = 0; idx < messages.length; idx++) {
    const msg = messages[idx]
    const prevMsg = idx > 0 ? messages[idx - 1] : null
    const showDateSep =
      !prevMsg || !isSameDay(prevMsg.timestamp, msg.timestamp)
    const isPrevSystemLike = Boolean(
      prevMsg &&
        (prevMsg.isSystem ||
          isEncryptionNotice(prevMsg.message) ||
          isSystemLikeMessage(prevMsg.message))
    )
    const isSystemLike =
      msg.isSystem ||
      isEncryptionNotice(msg.message) ||
      isSystemLikeMessage(msg.message)
    const showSender =
      !isSystemLike &&
      (!prevMsg ||
        prevMsg.sender !== msg.sender ||
        isPrevSystemLike ||
        showDateSep)

    if (!isSystemLike) nonSystemCount++

    rows[idx] = {
      message: msg,
      showDateSep,
      showSender,
      isSystemLike,
      dateLabel: showDateSep ? formatDateLabel(msg.timestamp) : null,
    }
  }

  return { rows, nonSystemCount }
}

export function ChatViewer({ chat, onBack }: ChatViewerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const scrollContentRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const lastScrollTop = useRef(0)
  const [isBarVisible, setIsBarVisible] = useState(true)
  const detectedSelfIndex = useMemo(() => {
    const idx = chat.participants.indexOf(chat.self)
    return idx === -1 ? 0 : idx
  }, [chat.participants, chat.self])
  const [selfIndex, setSelfIndex] = useState(detectedSelfIndex)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeMatchIndex, setActiveMatchIndex] = useState(0)
  const isSearchOpenRef = useRef(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    return () => revokeMediaUrls(chat)
  }, [chat])

  useEffect(() => {
    const wrapper = scrollAreaRef.current
    const content = scrollContentRef.current
    if (!wrapper || !content) return

    const lenis = new Lenis({
      wrapper,
      content,
      autoRaf: true,
    })
    lenisRef.current = lenis

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
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

  const { rows, nonSystemCount } = useMemo(
    () => buildRows(filteredMessages),
    [filteredMessages]
  )

  const trimmedQuery = searchQuery.trim()

  const matchIndexes = useMemo(() => {
    if (!trimmedQuery) return [] as number[]
    const needle = trimmedQuery.toLowerCase()
    const indexes: number[] = []
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].message.message.toLowerCase().includes(needle)) {
        indexes.push(i)
      }
    }
    return indexes
  }, [rows, trimmedQuery])

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: (index) => (rows[index]?.showDateSep ? 96 : 64),
    overscan: 16,
    paddingStart: 16,
    paddingEnd: BOTTOM_PAD,
  })

  const totalSize = virtualizer.getTotalSize()

  const scrollToIndexSmooth = useCallback(
    (index: number, align: "start" | "center" | "end" = "start") => {
      const lenis = lenisRef.current
      const result = virtualizer.getOffsetForIndex(index, align)
      if (result && lenis) {
        lenis.scrollTo(result[0], { duration: 1.1 })
        return
      }
      virtualizer.scrollToIndex(index, { align, behavior: "smooth" })
    },
    [virtualizer]
  )

  useEffect(() => {
    lenisRef.current?.resize()
  }, [rows.length, totalSize])

  useEffect(() => {
    isSearchOpenRef.current = isSearchOpen
    if (isSearchOpen) setIsBarVisible(true)
  }, [isSearchOpen])

  useEffect(() => {
    if (matchIndexes.length === 0) {
      setActiveMatchIndex(0)
      return
    }
    // Jump to most recent match (WhatsApp-like) when results change.
    setActiveMatchIndex(matchIndexes.length - 1)
  }, [matchIndexes])

  useEffect(() => {
    if (matchIndexes.length === 0) return
    const rowIndex = matchIndexes[activeMatchIndex]
    if (rowIndex === undefined) return
    scrollToIndexSmooth(rowIndex, "center")
  }, [activeMatchIndex, matchIndexes, scrollToIndexSmooth])

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
        const maxScroll = viewport!.scrollHeight - viewport!.clientHeight

        if (Math.abs(delta) > 2) {
          setIsCalendarOpen(false)
          if (!isSearchOpenRef.current) {
            setIsBarVisible(delta < 0)
          }
        }

        if (currentScrollTop < 10 || currentScrollTop >= maxScroll - 10) {
          setIsBarVisible(true)
        }

        lastScrollTop.current = currentScrollTop
        ticking = false
      })
    }

    viewport.addEventListener("scroll", handleScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [rows.length])

  const currentSelf = chat.participants[selfIndex] ?? chat.self

  const handleSwap = useCallback(() => {
    startTransition(() => {
      setSelfIndex((prev) => (prev + 1) % chat.participants.length)
    })
  }, [chat.participants.length])

  const handleScrollToTop = useCallback(() => {
    if (rows.length === 0) return
    scrollToIndexSmooth(0, "start")
  }, [rows.length, scrollToIndexSmooth])

  const handleScrollToBottom = useCallback(() => {
    if (rows.length === 0) return
    scrollToIndexSmooth(rows.length - 1, "end")
  }, [rows.length, scrollToIndexSmooth])

  const handleSearchOpenChange = useCallback((open: boolean) => {
    setIsSearchOpen(open)
    if (!open) {
      setSearchQuery("")
      setActiveMatchIndex(0)
    }
  }, [])

  const handlePrevMatch = useCallback(() => {
    if (matchIndexes.length === 0) return
    setActiveMatchIndex((prev) =>
      prev <= 0 ? matchIndexes.length - 1 : prev - 1
    )
  }, [matchIndexes.length])

  const handleNextMatch = useCallback(() => {
    if (matchIndexes.length === 0) return
    setActiveMatchIndex((prev) =>
      prev >= matchIndexes.length - 1 ? 0 : prev + 1
    )
  }, [matchIndexes.length])

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    startTransition(() => {
      setDateRange(range)
    })
  }, [])

  const activeRowIndex =
    matchIndexes.length > 0 ? matchIndexes[activeMatchIndex] : -1
  const highlightQuery = isSearchOpen ? trimmedQuery : ""

  return (
    <div className="relative h-full min-h-0 w-full flex-1 overflow-hidden">
      {!isReady && (
        <div className="absolute inset-0 z-20 bg-background">
          <ChatLoading
            label="Preparing chat…"
            detail={
              filteredMessages.length > 500
                ? `Loading ${filteredMessages.length.toLocaleString()} messages`
                : "Building your chat layout"
            }
          />
        </div>
      )}

      <div
        ref={scrollAreaRef}
        className="absolute inset-0 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
        aria-hidden={!isReady}
      >
        <div ref={scrollContentRef} className="mx-auto w-full max-w-[800px] px-3">
          <div
            className="relative w-full"
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              if (!row) return null
              const { message: msg, showDateSep, showSender, dateLabel } = row

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute top-0 left-0 w-full pb-1"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {showDateSep && dateLabel && (
                    <div className="flex justify-center py-3">
                      <div className="rounded-lg bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        {dateLabel}
                      </div>
                    </div>
                  )}
                  <div className={showSender && !msg.isSystem ? "mt-2" : ""}>
                    <ChatBubble
                      message={msg}
                      isSelf={
                        row.isSystemLike ? false : msg.sender === currentSelf
                      }
                      showSender={showSender}
                      media={chat.media}
                      highlight={
                        highlightQuery &&
                        msg.message.toLowerCase().includes(highlightQuery.toLowerCase())
                          ? highlightQuery
                          : undefined
                      }
                      isActiveMatch={virtualRow.index === activeRowIndex}
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
        messageCount={nonSystemCount}
        onBack={onBack}
        onSwap={handleSwap}
        onScrollToTop={handleScrollToTop}
        onScrollToBottom={handleScrollToBottom}
        isSwapped={selfIndex !== detectedSelfIndex}
        currentSelf={currentSelf}
        isVisible={(isBarVisible || isSearchOpen) && isReady}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        minDate={chatDateRange.min}
        maxDate={chatDateRange.max}
        isCalendarOpen={isCalendarOpen}
        onCalendarOpenChange={setIsCalendarOpen}
        isSearchOpen={isSearchOpen}
        onSearchOpenChange={handleSearchOpenChange}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        matchCount={matchIndexes.length}
        activeMatchOrdinal={
          matchIndexes.length === 0 ? 0 : activeMatchIndex + 1
        }
        onPrevMatch={handlePrevMatch}
        onNextMatch={handleNextMatch}
      />
    </div>
  )
}
