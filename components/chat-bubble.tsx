import type { ChatMessage } from "@/lib/parse-chat"
import { IMAGE_EXT, VIDEO_EXT, AUDIO_EXT } from "@/lib/parse-chat"
import { cn } from "@/lib/utils"

interface ChatBubbleProps {
  message: ChatMessage
  isSelf: boolean
  showSender: boolean
  media?: Record<string, string>
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/** Strip invisible Unicode chars (LTR mark, zero-width space, etc.) for comparison */
function stripInvisible(text: string): string {
  return text.replace(/[\u200E\u200F\u200B\u200C\u200D\uFEFF]/g, "").trim()
}

export function isEncryptionNotice(text: string): boolean {
  const clean = stripInvisible(text).toLowerCase()
  return clean.includes("end-to-end encrypted")
}

/** Common WhatsApp system message patterns (safety net for messages the parser may miss) */
const SYSTEM_PATTERNS = [
  "blocked this contact",
  "unblocked this contact",
  "blocked this person",
  "unblocked this person",
  "changed their phone number",
  "changed the subject",
  "changed this group",
  "changed the group",
  "was added",
  "was removed",
  "left",
  "added you",
  "removed you",
  "message was deleted",
  "this message was deleted",
  "you deleted this message",
  "waiting for this message",
  "security code changed",
  "disappearing messages",
  "turned on disappearing",
  "turned off disappearing",
  "changed the disappearing",
  "created group",
  "created this group",
  "joined using this group",
  "admin",
]

export function isSystemLikeMessage(text: string): boolean {
  const clean = stripInvisible(text).toLowerCase()
  return SYSTEM_PATTERNS.some((p) => clean.includes(p))
}

function MediaContent({ filename, src }: { filename: string; src: string }) {
  if (IMAGE_EXT.test(filename)) {
    return (
      <div className="overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={filename}
          className="block max-h-72 w-full rounded-lg object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  if (VIDEO_EXT.test(filename)) {
    return (
      <div className="overflow-hidden rounded-lg">
        <video
          src={src}
          controls
          preload="metadata"
          className="block max-h-72 w-full rounded-lg"
        />
      </div>
    )
  }

  if (AUDIO_EXT.test(filename)) {
    return (
      <audio src={src} controls preload="metadata" className="max-w-full" />
    )
  }

  // Fallback: link to download
  return (
    <a
      href={src}
      download={filename}
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm underline underline-offset-2"
    >
      {filename}
    </a>
  )
}

export function ChatBubble({ message, isSelf, showSender, media = {} }: ChatBubbleProps) {
  // Render encryption notice and system messages as centered badge (like date labels)
  if (message.isSystem || isEncryptionNotice(message.message) || isSystemLikeMessage(message.message)) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="rounded-lg bg-muted px-3 py-1 text-center text-xs font-medium text-muted-foreground shadow-sm">
          {stripInvisible(message.message)}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex w-full px-3",
        isSelf ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative max-w-[75%] rounded-xl px-3 pb-1.5 pt-1.5",
          isSelf
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm border border-border bg-card text-card-foreground"
        )}
      >
        {showSender && !isSelf && (
          <p className="mb-0.5 text-xs font-semibold text-primary">
            {message.sender}
          </p>
        )}
        <div className="flex flex-col gap-0.5">
          {message.attachment && media[message.attachment] ? (
            <MediaContent filename={message.attachment} src={media[message.attachment]} />
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.message}
            </p>
          )}
          <p
            className={cn(
              "self-end text-[10px] leading-none",
              isSelf
                ? "text-primary-foreground/70"
                : "text-muted-foreground"
            )}
          >
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  )
}
