"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // React 19 / Next 16 rejects <script> rendered inside client components.
  // Mark the FOUC script as non-JS so the dev overlay does not block taps.
  return (
    <NextThemesProvider
      {...props}
      scriptProps={{ type: "application/json" }}
    >
      {children}
    </NextThemesProvider>
  )
}
