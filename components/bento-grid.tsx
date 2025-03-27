import type React from "react"
import { cn } from "@/lib/utils"

interface BentoGridProps {
  className?: string
  children: React.ReactNode
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-[clamp(0px,2vw,16px)] auto-rows-auto px-[clamp(0px,2vw,16px)]",
        className
      )}
    >
      {children}
    </div>
  )
}
