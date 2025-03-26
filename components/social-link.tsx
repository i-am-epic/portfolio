"use client"

import Link from "next/link"
import { motion } from "framer-motion"

const MotionLink = motion(Link)

interface SocialLinkProps {
  href: string
  label: string
}

export function SocialLink({ href, label }: SocialLinkProps) {
  return (
    <MotionLink
      href={href}
      initial={{ backgroundColor: "hsl(var(--card))" }}
      whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--card-hover))" }}
      transition={{ duration: 0.3 }}
      className="w-full inline-flex items-center justify-center rounded-full px-2 py-2 text-lg font-medium transition-colors"
    >
      {label}
    </MotionLink>
  )
}
