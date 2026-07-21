"use client"

import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ThemeToggleProps {
  size?: "icon" | "icon-sm" | "icon-lg"
  showLabel?: boolean
}

type ThemeMode = "system" | "light" | "dark"

const THEME_ORDER: ThemeMode[] = ["system", "light", "dark"]

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

function nextTheme(current: string | undefined): ThemeMode {
  const index = THEME_ORDER.indexOf((current as ThemeMode) || "system")
  return THEME_ORDER[(index + 1) % THEME_ORDER.length]
}

export function ThemeToggle({ size = "icon", showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const mode: ThemeMode =
    mounted && (theme === "light" || theme === "dark" || theme === "system")
      ? theme
      : "system"

  function handleToggle() {
    setTheme(nextTheme(mode))
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key !== "d" && event.key !== "D") return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      setTheme(nextTheme(theme === "light" || theme === "dark" || theme === "system" ? theme : "system"))
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [theme, setTheme])

  const label =
    mode === "system" ? "System" : mode === "dark" ? "Dark" : "Light"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            size={showLabel ? "default" : size}
            className={
              showLabel
                ? "h-auto shrink-0 flex-col gap-0.5 rounded-none px-2.5 py-2 sm:px-3"
                : "rounded-full"
            }
            onClick={handleToggle}
            aria-label={`Theme: ${label}. Click to change.`}
          >
            <span className="relative size-4">
              {mode === "system" ? (
                <Monitor className="size-4" />
              ) : (
                <>
                  <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute inset-0 size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </>
              )}
            </span>
            {showLabel ? (
              <span className="text-xs leading-none font-medium sm:text-sm">
                {label}
              </span>
            ) : (
              <span className="sr-only">Theme: {label}</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-1.5 text-sm">
          Theme: {label}
          <Kbd>D</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
