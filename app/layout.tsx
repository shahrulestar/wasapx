import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#252525" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://wasapx.vercel.app"
  ),
  title: {
    default: "WasapX — Chat Export Viewer",
    template: "%s | WasapX",
  },
  description:
    "Open and view your chat exports in a familiar chat layout. Simply drop in a .zip or .txt file—nothing is uploaded, and everything stays in your browser.",
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
      "Open and view your chat exports in a familiar chat layout. Simply drop in a .zip or .txt file—nothing is uploaded, and everything stays in your browser.",
    type: "website",
    images: [
      {
        url: "/image.png",
        width: 1200,
        height: 630,
        alt: "WasapX — Open Chat Export Like Real Chats",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WasapX — Chat Export Viewer",
    description:
      "Open and view your chat exports in a familiar chat layout. Simply drop in a .zip or .txt file—nothing is uploaded, and everything stays in your browser.",
    images: ["/image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* Apply system/user theme before paint. Uses wasapx-theme storage key.
            Missing or "system" → follow prefers-color-scheme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='wasapx-theme';var t=localStorage.getItem(k);var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=t==='dark'||((!t||t==='system')&&d);var el=document.documentElement;el.classList.toggle('dark',dark);el.style.colorScheme=dark?'dark':'light'}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
