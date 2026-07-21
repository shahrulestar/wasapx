"use client"

import { useSyncExternalStore } from "react"
import type { ParsedChat } from "@/lib/parse-chat"

let chat: ParsedChat | null = null
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return chat
}

function getServerSnapshot() {
  return null
}

function notify() {
  for (const listener of listeners) listener()
}

export function setChat(parsed: ParsedChat) {
  chat = parsed
  notify()
}

export function clearChat() {
  chat = null
  notify()
}

export function getChat() {
  return chat
}

export function useChat() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
