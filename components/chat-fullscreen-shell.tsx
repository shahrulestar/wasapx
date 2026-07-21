"use client"

import { useEffect } from "react"

/**
 * Locks the document to a fixed fullscreen shell for Safari/iOS
 * (dynamic toolbar + safe areas) used by /chat and /demo.
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
    return () => {
      html.classList.remove("chat-fullscreen-lock")
      body.classList.remove("chat-fullscreen-lock")
    }
  }, [])

  return (
    <div className="chat-fullscreen-shell bg-background text-foreground">
      {children}
    </div>
  )
}
