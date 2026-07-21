"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState(defaultValue)

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)

    onChange()
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [query])

  return matches
}

/** True below Tailwind `md` (768px). Defaults to desktop until mounted. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)", false)
}