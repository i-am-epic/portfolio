"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { BentoGridItem } from "@/components/bento-grid-item"

interface ProjectProps {
  project: {
    id: number
    title: string
    subtitle: string
    description: string
    image: string
    year: string
    link: string
    previewUrl?: string
    tags?: string[]
    status?: string
  }
}

export function ProjectCard({ project }: ProjectProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className="group"
    >
      <div className="bg-card rounded-3xl overflow-hidden shadow-lg">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.35fr)_320px]">
          <div className="p-8 md:p-10 flex flex-col justify-between gap-6">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-bold">{project.title}</h2>
                {project.status ? (
                  <span className="rounded-full border border-accent/60 bg-accent/20 px-3 py-1 text-[11px] font-medium text-accent-foreground">
                    {project.status}
                  </span>
                ) : null}
              </div>
              <p className="text-muted-foreground text-lg">{project.subtitle}</p>
            </div>

            <p className="max-w-2xl text-base leading-7 text-foreground/90 md:text-lg">{project.description}</p>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-wrap gap-2">
                {project.tags && project.tags.length > 0 ? (
                  project.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Project</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
                  {project.year}
                </div>
                <Link
                  href={project.link}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-transform duration-300 hover:scale-110"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <ArrowUpRight
                    size={20}
                    className={`transition-transform duration-300 ${isHovered ? "translate-x-0.5 -translate-y-0.5" : ""}`}
                  />
                  <span className="sr-only">View Project</span>
                </Link>
                {project.previewUrl ? (
                  <Link
                    href={project.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    Live Preview
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          <div
            className="relative border-t border-border lg:border-l lg:border-t-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
            <motion.div
              animate={{ scale: isHovered ? 1.04 : 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full"
            >
              <Image
                src={project.image || "/placeholder.svg"}
                alt={project.title}
                width={900}
                height={900}
                className="h-[240px] w-full object-cover lg:h-full"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
