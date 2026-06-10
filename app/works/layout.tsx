import type { Metadata } from "next"
import { projectsJsonLd } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "Projects & Case Studies",
  description:
    "Projects by Nikhil A V across AI, data engineering, finance tooling and backend systems — IPOSuite, Hedge-Vault, Nik DevTools, Quantos and more.",
  alternates: { canonical: "/works" },
}

export default function WorksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsJsonLd()) }}
      />
      {children}
    </>
  )
}
