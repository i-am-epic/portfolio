"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { BentoGrid } from "@/components/bento-grid"
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
  }
}

export function ProjectCard({ project }: ProjectProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (

    <BentoGridItem className="">
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
        <div className="bg-card rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{project.title}</h2>
              <p className="text-muted-foreground text-lg">{project.subtitle}</p>
            </div>

            <div className="flex flex-col md:items-end gap-4 md:text-right">
              <p className="text-lg max-w-md">{project.description}</p>

              <Link
                href={project.link}
                className="mt-2 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-black hover:scale-110 transition-transform duration-300"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <ArrowUpRight
                  size={20}
                  className={`transition-transform duration-300 ${isHovered ? "translate-x-0.5 -translate-y-0.5" : ""
                    }`}
                />
                <span className="sr-only">View Project</span>
              </Link>
            </div>
          </div>

          {/* Image */}
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <motion.div
              animate={{
                scale: isHovered ? 1.05 : 1,
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <Image
                src={project.image || "/placeholder.svg"}
                alt={project.title}
                width={1200}
                height={800}
                className="w-full object-cover aspect-[16/9] transition-transform duration-300 ease-in-out"
              />
            </motion.div>

            <div className="absolute bottom-8 right-8 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm z-20">
              {project.year}
            </div>
          </div>
        </div>
      </motion.div>
    </BentoGridItem>

  )
}
