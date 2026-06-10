/**
 * Schema.org JSON-LD builders. Person + WebSite go on every page (root
 * layout); the project ItemList goes on the world/works pages.
 */

import { PROFILE, PROJECTS, SOCIALS } from "@/lib/world/worldData"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"

export const PERSON_ID = `${SITE_URL}/#person`

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: PROFILE.name,
    url: SITE_URL,
    email: `mailto:${PROFILE.email}`,
    jobTitle: "Data Engineer & AI Builder",
    description: PROFILE.tagline,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressCountry: "IN",
    },
    worksFor: { "@type": "Organization", name: "ABB" },
    sameAs: SOCIALS.map((s) => s.href),
    knowsAbout: [
      "Data Engineering",
      "ETL Pipelines",
      "Large Language Models",
      "Retrieval-Augmented Generation",
      "Python",
      "TypeScript",
      "Azure",
      "Finance Analytics",
      "Distributed Systems",
    ],
  }
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    author: { "@id": PERSON_ID },
    inLanguage: "en",
  }
}

export function projectsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Projects by ${PROFILE.name}`,
    itemListElement: PROJECTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareSourceCode",
        name: p.title,
        description: `${p.subtitle}. ${p.description}`,
        url: p.previewUrl || p.link,
        codeRepository: p.link,
        dateCreated: p.year,
        author: { "@id": PERSON_ID },
        keywords: p.tags.join(", "),
      },
    })),
  }
}
