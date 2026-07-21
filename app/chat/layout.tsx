import type { Metadata, Viewport } from "next"
import { ChatFullscreenShell } from "@/components/chat-fullscreen-shell"

export const metadata: Metadata = {
  title: "Chat",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WasapX",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Keep the layout stable when Safari's toolbar expands/collapses.
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#252525" },
  ],
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ChatFullscreenShell>{children}</ChatFullscreenShell>
}
