"use client"

import { useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { X } from "lucide-react"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col p-6"
    >
      <div className="flex justify-between items-center mb-12">
        <Link href="/" className="text-xl font-medium" onClick={onClose}>
          jenny wilson.
        </Link>
        <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <X size={24} />
        </motion.button>
      </div>

      <nav className="flex flex-col space-y-8 items-center justify-center flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Link href="/" className="text-3xl font-medium hover:text-foreground transition-colors" onClick={onClose}>
            home.
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Link
            href="/works"
            className="text-3xl font-medium hover:text-foreground transition-colors"
            onClick={onClose}
          >
            works.
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Link
            href="/contact"
            className="text-3xl font-medium hover:text-foreground transition-colors"
            onClick={onClose}
          >
            contact.
          </Link>
        </motion.div>
      </nav>
    </motion.div>
  )
}

