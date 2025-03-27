"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface BentoGridItemProps {
  className?: string
  children: React.ReactNode
}

export function BentoGridItem({ className, children }: BentoGridItemProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-3xl overflow-hidden relative group",
        "before:absolute before:inset-0 before:z-100 before:bg-noise-pattern before:opacity-[0.35] before:pointer-events-none",
        "after:absolute after:inset-0 after:z-1000 after:rounded-3xl after:pointer-events-none after:shadow-inner after:shadow-black/5",
        className,
      )}
    >
      {children}
    </div>
  )
}
