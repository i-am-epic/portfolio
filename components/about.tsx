"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="about" className="py-20 md:py-32 bg-zinc-900">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Column - Text */}
          <div className="order-2 md:order-1">
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-6">
              About Our Studio
            </motion.h2>

            <motion.p variants={itemVariants} className="text-white/80 mb-6">
              We are a creative digital agency specializing in web design, development, and digital marketing. With over
              10 years of experience, we've helped businesses of all sizes establish their online presence and achieve
              their goals.
            </motion.p>

            <motion.p variants={itemVariants} className="text-white/80 mb-8">
              Our team of designers, developers, and strategists work together to create digital experiences that are
              not only visually stunning but also functional and effective.
            </motion.p>

            <motion.div variants={itemVariants}>
              <a
                href="#contact"
                className="inline-block border-2 border-white px-6 py-3 rounded-full font-medium hover:bg-white hover:text-black transition-colors"
              >
                Get in Touch
              </a>
            </motion.div>
          </div>

          {/* Right Column - Image */}
          <motion.div variants={itemVariants} className="order-1 md:order-2">
            <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20" />
              <img
                src="/placeholder.svg?height=500&width=600"
                alt="Our team at work"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

