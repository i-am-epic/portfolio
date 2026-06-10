import type { Metadata } from "next"
import ClassicHome from "@/components/classic-home"

export const metadata: Metadata = {
  title: "Classic Portfolio",
  description:
    "The classic bento-grid portfolio of Nikhil A V — data engineering, AI products and finance tooling, without the 3D world.",
  alternates: { canonical: "/classic" },
}

export default function ClassicPage() {
  return <ClassicHome />
}
