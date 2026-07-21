"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import type { DateRange } from "react-day-picker"
import { useTheme } from "next-themes"
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Ellipsis,
  Moon,
  Repeat,
  Search,
  Sun,
  Users,
  MessagesSquare,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ButtonGroup } from "@/components/ui/button-group"
import { Kbd } from "@/components/ui/kbd"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DateRangeFilter } from "@/components/date-range-filter"

const toolbarBtnClass =
  "h-auto min-h-11 min-w-11 shrink-0 flex-col gap-0.5 rounded-none px-2.5 py-2 sm:px-3"

interface ChatHeaderProps {
  participants: string[]
  messageCount: number
  onBack: () => void
  onSwap: () => void
  onScrollToTop: () => void
  onScrollToBottom: () => void
  isSwapped: boolean
  currentSelf: string
  isVisible: boolean
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  minDate?: Date
  maxDate?: Date
  isCalendarOpen: boolean
  onCalendarOpenChange: (open: boolean) => void
  isSearchOpen: boolean
  onSearchOpenChange: (open: boolean) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  matchCount: number
  activeMatchOrdinal: number
  onPrevMatch: () => void
  onNextMatch: () => void
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  )
}

const matchCountFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
})

function formatMatchCount(n: number): string {
  if (n < 1000) return String(n)
  return matchCountFormatter.format(n)
}

interface ToolbarIconButtonProps {
  label: string
  tooltip: ReactNode
  onClick?: () => void
  className?: string
  children: React.ReactNode
  "aria-label": string
  title?: string
}

function ToolbarIconButton({
  label,
  tooltip,
  onClick,
  className,
  children,
  "aria-label": ariaLabel,
  title,
}: ToolbarIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          type="button"
          onClick={onClick}
          aria-label={ariaLabel}
          title={title}
          className={cn(toolbarBtnClass, className)}
        >
          {children}
          <span className="text-xs leading-none font-medium sm:text-sm">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
  )
}

interface ChatMoreMenuProps {
  onScrollToTop: () => void
  onScrollToBottom: () => void
}

function ChatMoreMenu({ onScrollToTop, onScrollToBottom }: ChatMoreMenuProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const themeLabel = isDark ? "Light" : "Dark"

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key !== "d" && event.key !== "D") return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [resolvedTheme, setTheme])

  function handleScrollToTop() {
    setOpen(false)
    onScrollToTop()
  }

  function handleScrollToBottom() {
    setOpen(false)
    onScrollToBottom()
  }

  function handleToggleTheme() {
    setOpen(false)
    setTheme(isDark ? "light" : "dark")
  }

  const triggerButton = (
    <Button
      variant="ghost"
      type="button"
      aria-label="More actions"
      className={toolbarBtnClass}
    >
      <Ellipsis />
      <span className="text-xs leading-none font-medium sm:text-sm">More</span>
    </Button>
  )

  const menuActionClass =
    "flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"

  const menuActions = (
    <>
      <button
        type="button"
        onClick={handleScrollToTop}
        className={menuActionClass}
      >
        <ArrowUp />
        Jump to top
      </button>
      <button
        type="button"
        onClick={handleScrollToBottom}
        className={menuActionClass}
      >
        <ArrowDown />
        Jump to bottom
      </button>
      <button
        type="button"
        onClick={handleToggleTheme}
        className={menuActionClass}
        aria-label={`Switch to ${themeLabel.toLowerCase()} theme`}
      >
        {isDark ? <Sun /> : <Moon />}
        <span className="flex-1">{themeLabel} theme</span>
      </button>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">More actions</TooltipContent>
        </Tooltip>
        <DrawerContent className="min-h-[30%]">
          <DrawerHeader>
            <DrawerTitle>More</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-1 px-2 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
            {menuActions}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">More actions</TooltipContent>
      </Tooltip>
      <DropdownMenuContent side="top" align="end" className="min-w-48 w-auto">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="min-h-11 gap-3"
            onSelect={handleScrollToTop}
          >
            <ArrowUp />
            Jump to top
          </DropdownMenuItem>
          <DropdownMenuItem
            className="min-h-11 gap-3"
            onSelect={handleScrollToBottom}
          >
            <ArrowDown />
            Jump to bottom
          </DropdownMenuItem>
          <DropdownMenuItem
            className="min-h-11 gap-3"
            onSelect={handleToggleTheme}
            aria-label={`Switch to ${themeLabel.toLowerCase()} theme`}
          >
            {isDark ? <Sun /> : <Moon />}
            <span className="flex-1">{themeLabel} theme</span>
            <Kbd className="hidden lg:inline-flex">D</Kbd>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ChatHeader({
  participants,
  messageCount,
  onBack,
  onSwap,
  onScrollToTop,
  onScrollToBottom,
  isSwapped,
  currentSelf,
  isVisible,
  dateRange,
  onDateRangeChange,
  minDate,
  maxDate,
  isCalendarOpen,
  onCalendarOpenChange,
  isSearchOpen,
  onSearchOpenChange,
  searchQuery,
  onSearchQueryChange,
  matchCount,
  activeMatchOrdinal,
  onPrevMatch,
  onNextMatch,
}: ChatHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus()
  }, [isSearchOpen])

  const chatTitle =
    participants.length <= 2
      ? participants.filter(Boolean).join(" & ")
      : `Group Chat (${participants.length})`

  const participantPreview =
    participants.length > 2
      ? participants.slice(0, 3).join(", ") +
        (participants.length > 3 ? ` +${participants.length - 3}` : "")
      : null

  const hasSearchQuery = searchQuery.trim().length > 0
  const matchLabel =
    matchCount === 0
      ? "0"
      : `${formatMatchCount(activeMatchOrdinal)} / ${formatMatchCount(matchCount)}`

  return (
    <div
      className={cn(
        // absolute inside the vv-sized shell — not fixed to the layout viewport,
        // so Safari's collapsing chrome does not cover the bar.
        "pointer-events-none absolute inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] transition-transform duration-300 ease-in-out sm:px-3 sm:pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]",
        isVisible ? "translate-y-0" : "pointer-events-none translate-y-[calc(100%+1rem+env(safe-area-inset-bottom,0px))]"
      )}
    >
      <div className="pointer-events-auto flex w-fit max-w-full flex-col items-center gap-2 sm:gap-3">
        <div className="flex max-w-full flex-col items-center gap-1 rounded-3xl border bg-popover/95 px-3 py-2 backdrop-blur supports-backdrop-filter:bg-popover/80 sm:gap-1.5 sm:px-4 sm:py-2.5">
          <div className="flex max-w-full items-center gap-1.5 sm:gap-2.5">
            <h2 className="min-w-0 truncate text-xs font-medium sm:text-sm">{chatTitle}</h2>
            <Badge variant="secondary" className="shrink-0 gap-1 text-xs sm:gap-1.5 sm:text-sm">
              <MessagesSquare className="size-3.5" />
              {messageCount.toLocaleString()}
            </Badge>
            <Badge variant="secondary" className="shrink-0 gap-1 text-xs sm:gap-1.5 sm:text-sm">
              <Users className="size-3.5" />
              {participants.length}
            </Badge>
          </div>
          {participantPreview && (
            <p className="max-w-[min(100%,24rem)] truncate text-xs text-muted-foreground sm:text-sm">
              {participantPreview}
            </p>
          )}
        </div>

        {isSearchOpen ? (
          <div className="flex w-[min(100%,28rem)] max-w-full items-center gap-1 rounded-3xl border bg-popover/95 px-2 py-1.5 backdrop-blur supports-backdrop-filter:bg-popover/80 sm:gap-1.5 sm:px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search messages…"
              className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Search messages"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {hasSearchQuery && (
              <>
                <span
                  className="shrink-0 px-1 text-xs text-muted-foreground tabular-nums sm:text-sm"
                  title={
                    matchCount === 0
                      ? "0 matches"
                      : `${activeMatchOrdinal.toLocaleString()} / ${matchCount.toLocaleString()}`
                  }
                >
                  {matchLabel}
                </span>
                <Button
                  variant="ghost"
                  type="button"
                  size="icon-sm"
                  className="size-11"
                  onClick={onPrevMatch}
                  disabled={matchCount === 0}
                  aria-label="Previous match"
                >
                  <ChevronUp />
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  size="icon-sm"
                  className="size-11"
                  onClick={onNextMatch}
                  disabled={matchCount === 0}
                  aria-label="Next match"
                >
                  <ChevronDown />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              type="button"
              size="icon-sm"
              className="size-11"
              onClick={() => onSearchOpenChange(false)}
              aria-label="Close search"
            >
              <X />
            </Button>
          </div>
        ) : (
          <TooltipProvider>
            <ButtonGroup className="max-w-full overflow-x-auto overflow-y-hidden rounded-3xl border bg-popover/95 backdrop-blur supports-backdrop-filter:bg-popover/80 [&_[data-slot=button]]:rounded-none!">
              <ToolbarIconButton
                label="Back"
                tooltip="Go back"
                aria-label="Go back"
                onClick={onBack}
              >
                <ArrowLeft />
              </ToolbarIconButton>
              <ToolbarIconButton
                label="Swap"
                tooltip={`You: ${currentSelf}`}
                aria-label={`Swap sides. Current self: ${currentSelf}`}
                title={`You: ${currentSelf}`}
                onClick={onSwap}
                className={isSwapped ? "text-primary" : undefined}
              >
                <Repeat />
              </ToolbarIconButton>
              <DateRangeFilter
                dateRange={dateRange}
                onDateRangeChange={onDateRangeChange}
                minDate={minDate}
                maxDate={maxDate}
                open={isCalendarOpen}
                onOpenChange={onCalendarOpenChange}
                showLabel
              />
              <ToolbarIconButton
                label="Search"
                tooltip="Search messages"
                aria-label="Search messages"
                onClick={() => onSearchOpenChange(true)}
              >
                <Search />
              </ToolbarIconButton>
              <ChatMoreMenu
                onScrollToTop={onScrollToTop}
                onScrollToBottom={onScrollToBottom}
              />
            </ButtonGroup>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
