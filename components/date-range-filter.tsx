"use client"

import { CalendarDays, X } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateRangeFilterProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  minDate?: Date
  maxDate?: Date
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DateRangeFilter({
  dateRange,
  onDateRangeChange,
  minDate,
  maxDate,
  open,
  onOpenChange,
}: DateRangeFilterProps) {
  const hasFilter = dateRange?.from !== undefined

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("rounded-full", hasFilter && "text-primary")}
        >
          <CalendarDays className="h-4 w-4" />
          <span className="sr-only">Filter by date</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        side="top"
        align="center"
        sideOffset={8}
      >
        <div className="flex flex-col">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from ?? maxDate}
            selected={dateRange}
            onSelect={onDateRangeChange}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            numberOfMonths={1}
            captionLayout="dropdown"
            startMonth={minDate}
            endMonth={maxDate}
          />
          {hasFilter && (
            <div className="border-t px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 text-xs"
                onClick={() => onDateRangeChange(undefined)}
              >
                <X className="h-3 w-3" />
                Clear filter
              </Button>
            </div>
          )}
          {hasFilter && (
            <div className="border-t px-3 py-2 text-center text-[10px] text-muted-foreground">
              {dateRange?.from && format(dateRange.from, "MMM d, yyyy")}
              {dateRange?.to && ` — ${format(dateRange.to, "MMM d, yyyy")}`}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
