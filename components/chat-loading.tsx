import { Loader2 } from "lucide-react"

interface ChatLoadingProps {
  label?: string
  detail?: string
}

export function ChatLoading({
  label = "Preparing chat…",
  detail = "Building your chat layout",
}: ChatLoadingProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 px-6">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  )
}
