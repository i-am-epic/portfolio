import type { MetadataRoute } from "next"
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: "Nikhil A V",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0b0d12",
    theme_color: "#0b0d12",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  }
}
