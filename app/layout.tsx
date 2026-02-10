import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "WasapX — Chat Export Viewer",
    template: "%s | WasapX",
  },
  description:
    "Read and display your chat exports locally. Drop a .zip or .txt file to view conversations in a familiar chat layout. Nothing uploads. Everything runs in your browser.",
  keywords: [
    "whatsapp",
    "chat",
    "viewer",
    "export",
    "zip",
    "txt",
    "private",
    "offline",
    "browser",
  ],
  openGraph: {
    siteName: "WasapX — Chat Export Viewer",
    title: "WasapX — Chat Export Viewer",
    description:
      "Read and display your chat exports locally. Drop a .zip or .txt file to view conversations in a familiar chat layout. Nothing uploads. Everything runs in your browser.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "WasapX — Chat Export Viewer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WasapX — Chat Export Viewer",
    description:
      "Read and display your chat exports locally. Drop a .zip or .txt file to view conversations in a familiar chat layout. Nothing uploads. Everything runs in your browser.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
