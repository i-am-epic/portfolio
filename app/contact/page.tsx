"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useInView, useAnimation } from "framer-motion"
import { Spiral } from "@/components/spiral"
import { BentoGrid } from "@/components/bento-grid"
import { BentoGridItem } from "@/components/bento-grid-item"
import { Header } from "@/components/header"

export default function Contact() {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8">
        <Header activePage="contact" />

        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          <BentoGrid>
            <BentoGridItem className="md:col-span-2 md:row-span-1">
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="h-full flex flex-col items-center justify-center p-8 md:p-12 text-center"
              >
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="mb-6"
                >
                  <Spiral />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Let's work together</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  I'm currently available for freelance work. If you have a project that you want to get started, think
                  you need my help with something or just fancy saying hey, then get in touch.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-md"
                >
                  <Link
                    href="mailto:niknikhilav@gmail.com"
                    className="flex justify-center  bg-accent text-accent-foreground rounded-full text-[3vw] sm:text-xl font-medium text-center hover:bg-accent/90 transition-colors py-2 px-4"
                  >
                    niknikhilav@gmail.com
                  </Link>
                </motion.div>
              </motion.div>
            </BentoGridItem>

            <BentoGridItem className="md:col-span-1 md:row-span-1">
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
                  },
                }}
                className="h-full flex flex-col p-8 md:p-12"
              >
                <h2 className="text-2xl font-bold mb-6">Location</h2>
                <p className="text-muted-foreground mb-2">Bengaluru, KA</p>
                <p className="text-muted-foreground">India</p>
              </motion.div>
            </BentoGridItem>

            <BentoGridItem className="md:col-span-1 md:row-span-1">
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 },
                  },
                }}
                className="h-full flex flex-col p-8 md:p-12"
              >
                <h2 className="text-2xl font-bold mb-6">Connect</h2>
                <div className="space-y-2">
                  <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    <Link
                      href="https://linkedin.com/in/nikhilav"
                      className="block text-muted-foreground hover:text-foreground transition-colors"
                    >
                      LinkedIn
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    <Link
                      href="https://dribbble.com/nikboson"
                      className="block text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Dribbble
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    <Link
                      href="https://twitter.com/nikhilav"
                      className="block text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Twitter
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    <Link
                      href="https://instagram.com/nikboson"
                      className="block text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Instagram
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </BentoGridItem>
          </BentoGrid>
        </motion.div>
      </div>
    </div>
  )
}

