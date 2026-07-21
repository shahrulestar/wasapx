import { memo, type ReactNode } from "react"
import type { ChatMessage } from "@/lib/parse-chat"
import { IMAGE_EXT, VIDEO_EXT, AUDIO_EXT } from "@/lib/parse-chat"
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"

interface ChatBubbleProps {
  message: ChatMessage
  isSelf: boolean
  showSender: boolean
  media?: Record<string, string>
  highlight?: string
  isActiveMatch?: boolean
}

function HighlightedText({
  text,
  highlight,
  isActiveMatch,
}: {
  text: string
  highlight: string
  isActiveMatch: boolean
}) {
  const query = highlight.trim()
  if (!query) return <>{text}</>

  const lower = text.toLowerCase()
  const needle = query.toLowerCase()
  const parts: ReactNode[] = []
  let start = 0
  let key = 0

  while (start < text.length) {
    const idx = lower.indexOf(needle, start)
    if (idx === -1) {
      parts.push(text.slice(start))
      break
    }
    if (idx > start) parts.push(text.slice(start, idx))
    parts.push(
      <mark
        key={key++}
        className={
          isActiveMatch
            ? "rounded-sm bg-primary/80 px-1.5 py-0.5 text-inherit"
            : "rounded-sm bg-primary/45 px-1.5 py-0.5 text-inherit"
        }
      >
        {text.slice(idx, idx + query.length)}
      </mark>
    )
    start = idx + query.length
  }

  return <>{parts}</>
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function formatTime(date: Date): string {
  // Manual format — Node vs browser toLocaleTimeString() disagree and break hydration.
  const h24 = date.getHours()
  const minutes = pad2(date.getMinutes())
  const h12 = h24 % 12 || 12
  const ampm = h24 < 12 ? "AM" : "PM"
  return `${h12}:${minutes} ${ampm}`
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

  return (
    <a href={src} download={filename} rel="noopener noreferrer">
      <Attachment state="done">
        <AttachmentMedia variant="icon" />
        <AttachmentContent>
          <AttachmentTitle>{filename}</AttachmentTitle>
          <AttachmentDescription>Download</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </a>
  )
}

const EMPTY_MEDIA: Record<string, string> = {}

export const ChatBubble = memo(
  function ChatBubble({
    message,
    isSelf,
    showSender,
    media = EMPTY_MEDIA,
    highlight = "",
    isActiveMatch = false,
  }: ChatBubbleProps) {
  if (
    message.isSystem ||
    isEncryptionNotice(message.message) ||
    isSystemLikeMessage(message.message)
  ) {
    const systemText = stripInvisible(message.message)
    return (
      <div className="flex justify-center px-3 py-2">
        <div
          className={
            isActiveMatch
              ? "max-w-[90%] rounded-lg bg-muted-foreground/20 px-3 py-1 text-center text-xs font-medium text-muted-foreground"
              : "max-w-[90%] rounded-lg bg-muted px-3 py-1 text-center text-xs font-medium text-muted-foreground"
          }
        >
          {highlight.trim() ? (
            <HighlightedText
              text={systemText}
              highlight={highlight}
              isActiveMatch={isActiveMatch}
            />
          ) : (
            systemText
          )}
        </div>
      </div>
    )
  }

  const align = isSelf ? "end" : "start"
  const bubbleVariant = isSelf ? "default" : "muted"
  const query = highlight.trim()

  return (
    <Message align={align} className="px-2 sm:px-3">
      <MessageContent className="max-w-[85%]">
        {showSender && !isSelf && (
          <MessageHeader className="text-sm text-primary">{message.sender}</MessageHeader>
        )}
        <Bubble
          variant={bubbleVariant}
          align={align}
          className={
            isActiveMatch
              ? isSelf
                ? "max-w-full *:data-[slot=bubble-content]:bg-primary/70"
                : "max-w-full *:data-[slot=bubble-content]:bg-muted-foreground/25"
              : "max-w-full"
          }
        >
          <BubbleContent>
            <div className="flex flex-col gap-1">
              {message.attachment && media[message.attachment] ? (
                <MediaContent
                  filename={message.attachment}
                  src={media[message.attachment]}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap wrap-break-word">
                  {query ? (
                    <HighlightedText
                      text={message.message}
                      highlight={query}
                      isActiveMatch={isActiveMatch}
                    />
                  ) : (
                    message.message
                  )}
                </p>
              )}
            </div>
          </BubbleContent>
        </Bubble>
        <MessageFooter className="text-[10px] font-normal opacity-70">
          {formatTime(message.timestamp)}
        </MessageFooter>
      </MessageContent>
    </Message>
  )
},
  (prev, next) =>
    prev.message === next.message &&
    prev.isSelf === next.isSelf &&
    prev.showSender === next.showSender &&
    prev.media === next.media &&
    prev.highlight === next.highlight &&
    prev.isActiveMatch === next.isActiveMatch
)
