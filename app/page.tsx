"use client"

import { useState } from "react"
import { MessageSquareText, CircleHelp, ShieldCheck, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { FileUpload } from "@/components/file-upload"
import { ChatViewer } from "@/components/chat-viewer"
import { ThemeToggle } from "@/components/theme-toggle"
import type { ParsedChat } from "@/lib/parse-chat"

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

export default function Home() {
  const [chat, setChat] = useState<ParsedChat | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerStep, setDrawerStep] = useState<"learn" | "privacy">("learn")

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
          <p className="max-w-md text-sm sm:text-base text-muted-foreground">
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

        <div className="flex items-center gap-1">
          <Drawer
            open={drawerOpen}
            onOpenChange={(open) => {
              setDrawerOpen(open)
              if (!open) setDrawerStep("learn")
            }}
          >
            <DrawerTrigger asChild>
              <Button variant="ghost" size="sm">
                <CircleHelp className="h-4 w-4" />
                Learn
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-md">
                {drawerStep === "learn" ? (
                  <>
                    <DrawerHeader>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <BookOpen className="h-6 w-6 text-green-600" />
                      </div>
                      <DrawerTitle className="text-center">
                        How to Export WhatsApp Chats
                      </DrawerTitle>
                      <DrawerDescription className="text-center">
                        Follow these steps to export a chat from WhatsApp.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-2">
                      <ol className="space-y-3 text-sm text-foreground">
                        <li className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            1
                          </span>
                          <span>
                            Open <strong>WhatsApp</strong> on your phone.
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            2
                          </span>
                          <span>
                            Go to the <strong>chat</strong> you want to export.
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            3
                          </span>
                          <span>
                            Tap the <strong>three-dot menu</strong> (Android) or
                            the <strong>contact/group name</strong> (iOS) at the
                            top.
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            4
                          </span>
                          <span>
                            Select <strong>More</strong> &rarr;{" "}
                            <strong>Export chat</strong> (Android) or scroll down
                            and tap <strong>Export Chat</strong> (iOS).
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            5
                          </span>
                          <span>
                            Choose <strong>Without Media</strong> when prompted.
                            Media exports are not supported yet.
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            6
                          </span>
                          <span>
                            Save the exported{" "}
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold">
                              .zip
                            </code>{" "}
                            or{" "}
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold">
                              .txt
                            </code>{" "}
                            file to your device.
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            7
                          </span>
                          <span>
                            Open <strong>WasapX</strong> and drag & drop the
                            file — done!
                          </span>
                        </li>
                      </ol>
                    </div>
                    <DrawerFooter>
                      <Button
                        className="bg-green-600 text-white hover:bg-green-700 border-green-600"
                        onClick={() => setDrawerStep("privacy")}
                      >
                        Got it
                      </Button>
                    </DrawerFooter>
                  </>
                ) : (
                  <>
                    <DrawerHeader>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <ShieldCheck className="h-6 w-6 text-green-600" />
                      </div>
                      <DrawerTitle className="text-center">
                        Your Privacy is Protected
                      </DrawerTitle>
                      <DrawerDescription className="text-center">
                        Here&apos;s how WasapX keeps your data safe.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-2">
                      <ul className="space-y-3 text-sm text-foreground">
                        <li className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            1
                          </span>
                          <span>
                            <strong>100% client-side</strong> — All file parsing
                            and rendering happens entirely in your browser. No
                            server processing.
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            2
                          </span>
                          <span>
                            <strong>No uploads</strong> — Your chat files are
                            never sent to any server. Everything stays on your
                            device.
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            3
                          </span>
                          <span>
                            <strong>No cookies or tracking</strong> — No
                            accounts, no sign-in, no cookies. Zero personal data
                            collected.
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            4
                          </span>
                          <span>
                            <strong>Nothing is stored</strong> — Once you close
                            or refresh the tab, all data is gone. No local
                            storage, no cache.
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            5
                          </span>
                          <span>
                            <strong>Open source</strong> — The entire codebase is
                            public on GitHub. You can inspect every line of code.
                          </span>
                        </li>
                      </ul>
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button className="bg-green-600 text-white hover:bg-green-700 border-green-600">
                          Understood
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </>
                )}
              </div>
            </DrawerContent>
          </Drawer>

          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://github.com/shahrulestar/wasapx"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="h-4 w-4" />
              Star on Github
            </a>
          </Button>
        </div>
      </main>
    </div>
  )
}
