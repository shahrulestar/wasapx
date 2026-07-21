"use client"

import type { DateRange } from "react-day-picker"
import { ArrowLeft, ArrowDown, ArrowUp, Repeat, Users, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ButtonGroup } from "@/components/ui/button-group"
import { ThemeToggle } from "@/components/theme-toggle"
import { DateRangeFilter } from "@/components/date-range-filter"

interface ChatHeaderProps {
  participants: string[]
  messageCount: number
  onBack: () => void
  onSwap: () => void
  onScrollEdge: () => void
  isAtBottom: boolean
  isSwapped: boolean
  currentSelf: string
  isVisible: boolean
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  minDate?: Date
  maxDate?: Date
  isCalendarOpen: boolean
  onCalendarOpenChange: (open: boolean) => void
}

export function ChatHeader({
  participants,
  messageCount,
  onBack,
  onSwap,
  onScrollEdge,
  isAtBottom,
  isSwapped,
  currentSelf,
  isVisible,
  dateRange,
  onDateRangeChange,
  minDate,
  maxDate,
  isCalendarOpen,
  onCalendarOpenChange,
}: ChatHeaderProps) {
  const chatTitle =
    participants.length <= 2
      ? participants.filter(Boolean).join(" & ")
      : `Group Chat (${participants.length})`

  const participantPreview =
    participants.length > 2
      ? participants.slice(0, 3).join(", ") +
        (participants.length > 3 ? ` +${participants.length - 3}` : "")
      : null

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] transition-transform duration-300 ease-in-out sm:px-3 sm:pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]",
        isVisible ? "translate-y-0" : "pointer-events-none translate-y-[calc(100%+1rem)]"
      )}
    >
      <div className="pointer-events-auto flex w-fit max-w-full flex-col items-center gap-2 sm:gap-3">
        <div className="flex max-w-full flex-col items-center gap-1 rounded-3xl border bg-popover/95 px-3 py-2 backdrop-blur supports-backdrop-filter:bg-popover/80 sm:gap-1.5 sm:px-4 sm:py-2.5">
          <div className="flex max-w-full items-center gap-1.5 sm:gap-2.5">
            <h2 className="min-w-0 truncate text-xs font-medium sm:text-sm">{chatTitle}</h2>
            <Badge variant="secondary" className="shrink-0 gap-1 text-xs sm:gap-1.5 sm:text-sm">
              <MessageSquare className="size-3.5" />
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

        <ButtonGroup className="max-w-full overflow-x-auto overflow-y-hidden rounded-3xl border bg-popover/95 backdrop-blur supports-backdrop-filter:bg-popover/80">
          <Button
            variant="ghost"
            type="button"
            onClick={onBack}
            className="h-auto shrink-0 flex-col gap-0.5 rounded-none px-2.5 py-2 sm:px-3"
          >
            <ArrowLeft className="size-4" />
            <span className="text-xs leading-none font-medium sm:text-sm">Back</span>
          </Button>
          <Button
            variant="ghost"
            type="button"
            onClick={onSwap}
            title={`You: ${currentSelf}`}
            className={cn(
              "h-auto shrink-0 flex-col gap-0.5 rounded-none px-2.5 py-2 sm:px-3",
              isSwapped && "text-primary"
            )}
          >
            <Repeat className="size-4" />
            <span className="text-xs leading-none font-medium sm:text-sm">Swap</span>
          </Button>
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            minDate={minDate}
            maxDate={maxDate}
            open={isCalendarOpen}
            onOpenChange={onCalendarOpenChange}
            showLabel
          />
          <Button
            variant="ghost"
            type="button"
            onClick={onScrollEdge}
            className="h-auto shrink-0 flex-col gap-0.5 rounded-none px-2.5 py-2 sm:px-3"
          >
            {isAtBottom ? (
              <ArrowUp className="size-4" />
            ) : (
              <ArrowDown className="size-4" />
            )}
            <span className="text-xs leading-none font-medium sm:text-sm">
              {isAtBottom ? "Top" : "Bottom"}
            </span>
          </Button>
          <ThemeToggle showLabel />
        </ButtonGroup>
      </div>
    </div>
  )
}
