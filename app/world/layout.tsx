import type { Metadata } from "next"
import localFont from "next/font/local"
import "./world.css"

const monocraft = localFont({
  src: [
    { path: "../../public/fonts/Monocraft.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Monocraft-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-monocraft",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Explore the 3D World",
  description:
    "Walk through Nikhil A V's portfolio as an explorable Minecraft-style 3D world — project chests, an AI villager, and a contact portal.",
}

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  // No fixed sizing here — the world's .mc-root and overlays size themselves with
  // viewport units, which is required because the route template wraps this in an
  // animated motion.div (transform/filter) that would otherwise collapse fixed children.
  return <div className={monocraft.variable}>{children}</div>

}
