"use client"

import { useEffect } from "react"
import { Moon, Sun } from "lucide-react"
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

export function ThemeToggle({ size = "icon", showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()

  function handleToggle() {
    const next = (resolvedTheme ?? theme) === "dark" ? "light" : "dark"
    setTheme(next)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key !== "d" && event.key !== "D") return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      const next = (resolvedTheme ?? theme) === "dark" ? "light" : "dark"
      setTheme(next)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [theme, resolvedTheme, setTheme])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={showLabel ? "default" : size}
            className={
              showLabel
                ? "h-auto shrink-0 flex-col gap-0.5 rounded-none px-2.5 py-2 sm:px-3"
                : "rounded-full"
            }
            onClick={handleToggle}
          >
            <span className="relative size-4">
              <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute inset-0 size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </span>
            {showLabel ? (
              <span className="text-xs leading-none font-medium sm:text-sm">Theme</span>
            ) : (
              <span className="sr-only">Toggle theme</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-1.5 text-sm">
          Toggle theme
          <Kbd>D</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
