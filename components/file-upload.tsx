"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, FileText, FileArchive, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ParsedChat } from "@/lib/parse-chat"
import { parseFile } from "@/lib/parse-chat"

interface FileUploadProps {
  onParsed: (chat: ParsedChat) => void
}

export function FileUpload({ onParsed }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const resetInput = useCallback(() => {
    if (inputRef.current) inputRef.current.value = ""
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      const isValid =
        file.name.endsWith(".txt") ||
        file.name.endsWith(".zip") ||
        file.type === "text/plain" ||
        file.type === "application/zip" ||
        file.type === "application/x-zip-compressed"

      if (!isValid) {
        setError("Please upload a .txt or .zip file exported from WhatsApp.")
        resetInput()
        return
      }

      setError(null)
      setFileName(file.name)
      setIsLoading(true)

      try {
        const parsed = await parseFile(file)
        if (parsed.messages.length === 0) {
          setError(
            "No messages found. Please check that the file is a valid WhatsApp chat export."
          )
          setIsLoading(false)
          resetInput()
          return
        }
        onParsed(parsed)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to parse the file."
        )
      } finally {
        setIsLoading(false)
        resetInput()
      }
    },
    [onParsed, resetInput]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <Card
      className={`w-full max-w-lg border-2 border-dashed transition-colors ${
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50"
      }`}
    >
      <CardContent className="p-0">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="flex flex-col items-center justify-center gap-4 px-6 py-12"
        >
          {isLoading ? (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Parsing {fileName}...
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reading your WhatsApp chat
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drag and drop your chat export
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports .txt and .zip files from WhatsApp
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  .txt
                </div>
                <div className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
                  <FileArchive className="h-3.5 w-3.5" />
                  .zip
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                Browse Files
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept=".txt,.zip"
                className="hidden"
                onChange={handleInputChange}
                aria-label="Upload WhatsApp chat file"
              />
            </>
          )}

          {error && (
            <p className="mt-2 text-center text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
