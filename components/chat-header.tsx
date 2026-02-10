"use client"

import type { DateRange } from "react-day-picker"
import { ArrowLeft, Repeat, Users, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ButtonGroup } from "@/components/ui/button-group"
import { ThemeToggle } from "@/components/theme-toggle"
import { DateRangeFilter } from "@/components/date-range-filter"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ChatHeaderProps {
  participants: string[]
  messageCount: number
  onBack: () => void
  onSwap: () => void
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

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-[800px] justify-center px-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-[calc(100%+1rem)]"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Chat info */}
        <div className="flex items-center gap-2 rounded-full border bg-popover/95 px-3 py-1.5 shadow-md backdrop-blur supports-[backdrop-filter]:bg-popover/80">
          <h2 className="text-xs font-semibold">{chatTitle}</h2>
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <MessageSquare className="h-2.5 w-2.5" />
            {messageCount.toLocaleString()}
          </Badge>
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <Users className="h-2.5 w-2.5" />
            {participants.length}
          </Badge>
        </div>

        {/* Button group */}
        <ButtonGroup className="rounded-full border bg-popover/95 shadow-md backdrop-blur supports-[backdrop-filter]:bg-popover/80">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSwap}
                  className={cn("rounded-full", isSwapped && "text-primary")}
                >
                  <Repeat className="h-4 w-4" />
                  <span className="sr-only">Swap sender</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="flex items-center gap-1.5 text-xs">
                <User className="h-3 w-3" />
                You: {currentSelf}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            minDate={minDate}
            maxDate={maxDate}
            open={isCalendarOpen}
            onOpenChange={onCalendarOpenChange}
          />
          <ThemeToggle />
        </ButtonGroup>
      </div>
    </div>
  )
}
