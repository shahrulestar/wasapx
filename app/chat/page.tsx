"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatLoading } from "@/components/chat-loading"
import { ChatViewer } from "@/components/chat-viewer"
import { clearChat, useChat } from "@/lib/chat-store"

export default function ChatPage() {
  const chat = useChat()
  const router = useRouter()

  useEffect(() => {
    if (!chat) router.replace("/")
  }, [chat, router])

  if (!chat) {
    return (
      <ChatLoading
        label="Opening chat…"
        detail="Loading your conversation"
      />
    )
  }

  function handleBack() {
    clearChat()
    router.push("/")
  }

  return <ChatViewer chat={chat} onBack={handleBack} />
}
