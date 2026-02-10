"use client"

import { useState } from "react"
import { MessageSquareText } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { ChatViewer } from "@/components/chat-viewer"
import { ThemeToggle } from "@/components/theme-toggle"
import type { ParsedChat } from "@/lib/parse-chat"

export default function Home() {
  const [chat, setChat] = useState<ParsedChat | null>(null)

  if (chat) {
    return <ChatViewer chat={chat} onBack={() => setChat(null)} />
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto w-full max-w-[800px] px-3">
        <header className="flex items-center justify-end py-4">
          <ThemeToggle />
        </header>
      </div>

      <main className="mx-auto flex w-full max-w-[800px] flex-1 flex-col items-center justify-center gap-8 px-3 pb-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <MessageSquareText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            WasapX
          </h1>
          <p className="max-w-md text-muted-foreground">
            Read and display your WhatsApp chat exports. Just drop a{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold text-foreground">
              .zip
            </code>{" "}
            or{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold text-foreground">
              .txt
            </code>{" "}
            file below. Everything stays in your browser.
          </p>
        </div>

        <FileUpload onParsed={setChat} />

        <p className="text-xs text-muted-foreground">
          No data is uploaded to any server. Your chats remain private.
        </p>
      </main>
    </div>
  )
}
