"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/file-upload"
import { ThemeToggle } from "@/components/theme-toggle"
import { LearnHelp } from "@/components/learn-help"
import { GithubStarButton } from "@/components/github-star-button"
import { setChat } from "@/lib/chat-store"
import type { ParsedChat } from "@/lib/parse-chat"

export default function Home() {
  const router = useRouter()

  function handleParsed(parsed: ParsedChat) {
    setChat(parsed)
    router.push("/chat")
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-[800px] flex-1 flex-col items-center justify-center gap-8 px-3 pb-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            WasapX
          </h1>
          <p className="max-w-md text-balance text-sm text-muted-foreground sm:text-base">
            Open and view your chat exports in a familiar chat layout. Simply
            drop in a{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
              .zip
            </code>{" "}
            or{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
              .txt
            </code>{" "}
            file—nothing is uploaded, and everything stays in your browser.
          </p>
        </div>

        <FileUpload onParsed={handleParsed} />

        <p className="max-w-md text-center text-xs text-muted-foreground">
          Export from WhatsApp as{" "}
          <span className="font-medium text-foreground">Without Media</span>.
          Images, videos, and other media are not supported.
        </p>

        <div className="flex items-center gap-1">
          <LearnHelp />

          <Button variant="ghost" size="sm" asChild>
            <Link href="/demo">
              <Play data-icon="inline-start" />
              Demo
            </Link>
          </Button>

          <GithubStarButton />

          <ThemeToggle size="icon-sm" />
        </div>
      </main>
    </div>
  )
}
