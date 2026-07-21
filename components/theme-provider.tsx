"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // React 19 / Next 16 rejects <script> rendered inside client components.
  // FOUC / system preference is handled by the inline script in app/layout.tsx.
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="wasapx-theme"
      {...props}
      scriptProps={{ type: "application/json" }}
    >
      {children}
    </NextThemesProvider>
  )
}
