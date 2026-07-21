"use client"

import { useEffect } from "react"

/**
 * Locks the document to a fixed fullscreen shell for Safari/iOS
 * (dynamic toolbar + safe areas) used by /chat and /demo.
 *
 * Syncs CSS vars from visualViewport so the shell tracks the visible
 * area as Safari's top/bottom chrome expands and collapses.
 */
export function ChatFullscreenShell({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add("chat-fullscreen-lock")
    body.classList.add("chat-fullscreen-lock")

    function syncVisualViewport() {
      const vv = window.visualViewport
      if (!vv) {
        html.style.setProperty("--app-height", `${window.innerHeight}px`)
        html.style.setProperty("--vv-top", "0px")
        html.style.setProperty("--vv-bottom", "0px")
        return
      }

      const top = Math.max(0, vv.offsetTop)
      const bottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      html.style.setProperty("--app-height", `${vv.height}px`)
      html.style.setProperty("--vv-top", `${top}px`)
      html.style.setProperty("--vv-bottom", `${bottom}px`)
    }

    syncVisualViewport()

    const vv = window.visualViewport
    vv?.addEventListener("resize", syncVisualViewport)
    vv?.addEventListener("scroll", syncVisualViewport)
    window.addEventListener("resize", syncVisualViewport)
    window.addEventListener("orientationchange", syncVisualViewport)

    return () => {
      vv?.removeEventListener("resize", syncVisualViewport)
      vv?.removeEventListener("scroll", syncVisualViewport)
      window.removeEventListener("resize", syncVisualViewport)
      window.removeEventListener("orientationchange", syncVisualViewport)
      html.classList.remove("chat-fullscreen-lock")
      body.classList.remove("chat-fullscreen-lock")
      html.style.removeProperty("--app-height")
      html.style.removeProperty("--vv-top")
      html.style.removeProperty("--vv-bottom")
    }
  }, [])

  return (
    <div className="chat-fullscreen-shell bg-background text-foreground">
      {children}
    </div>
  )
}
