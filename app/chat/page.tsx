"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatViewer } from "@/components/chat-viewer"
import { clearChat, useChat } from "@/lib/chat-store"

export default function ChatPage() {
  const chat = useChat()
  const router = useRouter()

  useEffect(() => {
    if (!chat) router.replace("/")
  }, [chat, router])

  if (!chat) return null

  function handleBack() {
    clearChat()
    router.push("/")
  }

  return <ChatViewer chat={chat} onBack={handleBack} />
}
