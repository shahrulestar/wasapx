"use client"

import type { ComponentType, ReactNode } from "react"
import Link from "next/link"
import { BookOpen, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

const EXPORT_STEPS = [
  <>
    Open <strong>WhatsApp</strong> on your phone.
  </>,
  <>
    Go to the <strong>chat</strong> you want to export.
  </>,
  <>
    Tap the <strong>three-dot menu</strong> (Android) or the{" "}
    <strong>contact/group name</strong> (iOS) at the top.
  </>,
  <>
    Select <strong>More</strong> &rarr; <strong>Export chat</strong> (Android)
    or scroll down and tap <strong>Export Chat</strong> (iOS).
  </>,
  <>
    Choose <strong>Without Media</strong> when prompted. WasapX does not support
    images, videos, voice notes, or other media — text-only exports work best.
  </>,
  <>
    Save the exported{" "}
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold">
      .zip
    </code>{" "}
    or{" "}
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold">
      .txt
    </code>{" "}
    file to your device.
  </>,
  <>
    Open <strong>WasapX</strong> and drag & drop the file — done!
  </>,
]

const PRIVACY_POINTS = [
  <>
    <strong>100% client-side</strong> — All file parsing and rendering happens
    entirely in your browser. No server processing.
  </>,
  <>
    <strong>No uploads</strong> — Your chat files are never sent to any server.
    Everything stays on your device.
  </>,
  <>
    <strong>No cookies or tracking</strong> — No accounts, no sign-in, no
    cookies. Zero personal data collected.
  </>,
  <>
    <strong>Nothing is stored</strong> — Once you close or refresh the tab, all
    data is gone. No local storage, no cache.
  </>,
  <>
    <strong>Open source</strong> — The entire codebase is public on GitHub. You
    can inspect every line of code.
  </>,
]

function StepList({ items }: { items: ReactNode[] }) {
  return (
    <ol className="flex flex-col gap-3 text-sm text-foreground">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {index + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  )
}

export interface LearnContentProps {
  step: "learn" | "privacy"
  onGotIt: () => void
  onUnderstood: () => void
  Header: ComponentType<{ children: ReactNode; className?: string }>
  Title: ComponentType<{ children: ReactNode; className?: string }>
  Description: ComponentType<{ children: ReactNode; className?: string }>
  Footer: ComponentType<{ children: ReactNode; className?: string }>
}

export function LearnContent({
  step,
  onGotIt,
  onUnderstood,
  Header,
  Title,
  Description,
  Footer,
}: LearnContentProps) {
  if (step === "learn") {
    return (
      <>
        <Header className="items-center text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="size-6 text-primary" />
          </div>
          <Title>How to Export WhatsApp Chats</Title>
          <Description>
            Export <strong>Without Media</strong> — this tool views text chats
            only, not images or other attachments.
          </Description>
        </Header>
        <div className="px-4 pb-2 sm:px-0">
          <StepList items={EXPORT_STEPS} />
        </div>
        <Footer className="flex flex-col gap-2 sm:flex-col">
          <Button className="w-full" onClick={onGotIt}>
            Got it
          </Button>
          <Button variant="secondary" className="w-full" asChild>
            <Link href="/demo">See example chat</Link>
          </Button>
        </Footer>
      </>
    )
  }

  return (
    <>
      <Header className="items-center text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="size-6 text-primary" />
        </div>
        <Title>Your Privacy is Protected</Title>
        <Description>
          Here&apos;s how WasapX keeps your data safe.
        </Description>
      </Header>
      <div className="px-4 pb-2 sm:px-0">
        <StepList items={PRIVACY_POINTS} />
      </div>
      <Footer>
        <Button className="w-full" onClick={onUnderstood}>
          Understood
        </Button>
      </Footer>
    </>
  )
}
