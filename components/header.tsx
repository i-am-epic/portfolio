"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { MobileMenu } from "./mobile-menu"

interface HeaderProps {
  activePage?: "home" | "works" | "contact"
}

export function Header({ activePage = "home" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="px-16 py-2"
      >
        <motion.div
          className={`flex justify-between items-center px-6 py-2 bg-card rounded-full transition-all duration-300 ${
            scrolled ? "shadow-lg backdrop-blur-md bg-card/90" : ""
          }`}
        >
          <Link href="/" className="px-4 text-xl font-medium">
            nikhil a v
          </Link>
          <nav className="px-4 hidden md:flex space-x-10">
            <Link
              href="/"
              className={`relative ${activePage === "home" ? "text-foreground" : "text-muted-foreground hover:text-foreground transition-colors"}`}
            >
              home.
              {activePage === "home" && (
                <motion.span
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground"
                />
              )}
            </Link>
            <Link
              href="/works"
              className={`relative ${activePage === "works" ? "text-foreground" : "text-muted-foreground hover:text-foreground transition-colors"}`}
            >
              works.
              {activePage === "works" && (
                <motion.span
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground"
                />
              )}
            </Link>
            <Link
              href="/contact"
              className={`relative ${activePage === "contact" ? "text-foreground" : "text-muted-foreground hover:text-foreground transition-colors"}`}
            >
              contact.
              {activePage === "contact" && (
                <motion.span
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground"
                />
              )}
            </Link>
          </nav>
          <motion.button
            className="px-4 md:hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.button>
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />}
      </AnimatePresence>
    </>
  )
}

