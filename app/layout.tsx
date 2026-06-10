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
import { ScrollWall } from "@/components/scroll-wall"
import { SlotLauncher } from "@/components/slot-launcher"
import { WorldPortal } from "@/components/world-portal"
import { personJsonLd, webSiteJsonLd } from "@/lib/structured-data"

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
    "Portfolio of Nikhil A V: high-performance data systems, AI products, and an explorable 3D voxel world of engineering case studies.",
  keywords: [
    "Nikhil A V",
    "Data Engineer",
    "AI Engineer",
    "Portfolio",
    "3D Portfolio",
    "Gamified Portfolio",
    "Next.js Portfolio",
    "Azure",
    "Machine Learning",
    "Bengaluru",
  ],
  authors: [{ name: "Nikhil A V", url: "https://nikhilav.dev" }],
  creator: "Nikhil A V",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Nikhil A V | Data Engineer & AI Builder",
    description:
      "Building scalable data platforms, AI-powered tools, and production-grade backend systems. Explore the portfolio as a walkable 3D world.",
    url: "https://nikhilav.dev",
    siteName: "Nikhil A V Portfolio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nikhil A V | Data Engineer & AI Builder",
    description:
      "Case studies and projects in data engineering, AI, and distributed systems — explorable as a 3D world.",
    creator: "@nikhilav",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning: browser extensions (Grammarly, etc.) inject
          data-* attributes onto <body> before React hydrates. */}
      <body className={`${sora.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([personJsonLd(), webSiteJsonLd()]) }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AnimatedFavicon />
          <ChunkErrorRecovery />
          <CommandPalette />
          <ProfileRagChat />
          <SpotifyMiniPlayer />
          <ScrollWall />
          <SlotLauncher />
          <WorldPortal />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}