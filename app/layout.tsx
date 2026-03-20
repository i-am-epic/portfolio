import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Sora, Space_Grotesk } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { CommandPalette } from "../components/command-palette"
import { ProfileRagChat } from "@/components/profile-rag-chat"
import { AnimatedFavicon } from "@/components/animated-favicon"
import { SpotifyMiniPlayer } from "@/components/spotify-mini-player"
import { ChunkErrorRecovery } from "@/components/chunk-error-recovery"

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://nikhilav.dev"),
  title: {
    default: "Nikhil A V | Data Engineer & AI Builder",
    template: "%s | Nikhil A V",
  },
  description:
    "Portfolio of Nikhil A V: high-performance data systems, AI products, and end-to-end engineering case studies.",
  keywords: [
    "Nikhil A V",
    "Data Engineer",
    "AI Engineer",
    "Portfolio",
    "Next.js Portfolio",
    "Azure",
    "Machine Learning",
  ],
  openGraph: {
    type: "website",
    title: "Nikhil A V | Data Engineer & AI Builder",
    description:
      "Building scalable data platforms, AI-powered tools, and production-grade backend systems.",
    url: "https://nikhilav.dev",
    siteName: "Nikhil A V Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nikhil A V | Data Engineer & AI Builder",
    description:
      "Case studies and projects in data engineering, AI, and distributed systems.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${spaceGrotesk.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AnimatedFavicon />
          <ChunkErrorRecovery />
          <CommandPalette />
          <ProfileRagChat />
          <SpotifyMiniPlayer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}