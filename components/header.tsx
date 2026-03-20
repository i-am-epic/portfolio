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
        className="px-[clamp(0px,2vw,16px)] py-2"
      >
        <div
          className={`w-full rounded-full border border-border bg-card px-6 py-3 transition-all duration-300 ${scrolled ? "bg-card/90 shadow-lg backdrop-blur-md" : ""
            }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-xl font-medium">
              nikhil a v.
            </Link>
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {["home", "works", "contact"].map((page) => (
                <Link
                  key={page}
                  href={`/${page === "home" ? "" : page}`}
                  className={`relative ${activePage === page ? "text-foreground" : "text-muted-foreground hover:text-foreground transition-colors"}`}
                >
                  {page}.
                  {activePage === page && (
                    <motion.span
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground"
                    />
                  )}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:text-foreground"
              >
                Cmd+K
              </button>
            </nav>
            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(true)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
