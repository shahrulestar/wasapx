"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChatViewer } from "@/components/chat-viewer"
import { DEMO_CHAT_TEXT } from "@/lib/demo-chat"
import { parseChatText } from "@/lib/parse-chat"

export default function DemoPage() {
  const router = useRouter()
  const chat = useMemo(
    () => parseChatText(DEMO_CHAT_TEXT, "ali_abu_whatsapp.txt"),
    []
  )

  return <ChatViewer chat={chat} onBack={() => router.push("/")} />
}
