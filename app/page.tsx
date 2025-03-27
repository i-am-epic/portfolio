"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView, useAnimation } from "framer-motion"
import { Spiral } from "@/components/spiral"
import { BentoGrid } from "@/components/bento-grid"
import { BentoGridItem } from "@/components/bento-grid-item"
import { SocialLink } from "@/components/social-link"
import { Header } from "@/components/header"
import ReviewCarousel from "@/components/review"
import AnimatedTitle from "@/components/animate-title"
import SpotifyGuessSong from "@/components/spotifysong"
import CurrentlyPlayingCard from "@/components/currentplaying"
import SpotifyGameGrid from "@/components/jamming"

export default function Home() {
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
        <Header activePage="home" />

        {/* Bento Grid Layout */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          <BentoGrid className="md:grid-cols-[59.8%_39.6%] auto-rows-[minmax(0,380px)]">
            {/* Profile Section */}
            <BentoGridItem className="md:col-span-1 md:row-span-1">
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="h-full flex flex-col items-center justify-center md:p-12 text-center"
              >
                {/* Image Wrapper */}
                <div className="mb-3 w-32 h-32   relative mx-auto md:mx-0 overflow-hidden rounded-full">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src="/nik.jpeg"
                      alt="Nikhil A V"
                      fill
                      className="object-cover rounded-full"
                    />
                  </motion.div>
                </div>

                {/* Text Content */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Nikhil A V</h1>

                <p className="text-3xl md:text-3xl font-bold mb-1"></p>
                <AnimatedTitle />

                <p className="text-xl md:text-xl font-bold text-muted-foreground">
                  currently SDE at ABB.
                </p>
              </motion.div>
            </BentoGridItem>

            {/* CTA Section */}
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
                className="h-full flex flex-col items-center justify-center p-8 md:p-12 text-center"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="mb-6"
                >
                  <Spiral />
                </motion.div>
                <h2 className="text-4xl md:text-4xl font-bold mb-4">Have a project</h2>
                <h2 className="text-3xl md:text-3xl font-bold mb-8">in mind?</h2>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="p-2"
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
          </BentoGrid>

          <BentoGrid className="md:grid-cols-[39.6%_59.8%] py-2">

            {/* Social Links Section */}
            <BentoGridItem className="overflow-x-auto scrollbar-hide md:col-span-2 bg-black rounded-xl">
              <motion.div
                initial="hidden"
                animate="visible"
                className="flex gap-4 "
              >
                {/* LinkedIn */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -200 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="flex-1 bg-card text-foreground rounded-md"
                >
                  <SocialLink href="https://linkedin.com/in/nikhilav" label="linkedin." />
                </motion.div>
                {/* GitHub */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -100 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex-1 bg-card text-foreground rounded-md"
                >
                  <SocialLink href="https://github.com/nikhilav" label="github." />
                </motion.div>
                {/* leetcode */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 0 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex-1 bg-card text-foreground rounded-md"
                >
                  <SocialLink href="https://leetcode.com/u/i-am-epic/" label="leetcode." />
                </motion.div>
                {/* Twitter */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 100 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex-1 bg-card text-foreground rounded-md"
                >
                  <SocialLink href="https://twitter.com/nikhilav" label="twitter." />
                </motion.div>
                {/* Unsplash */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 200 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="flex-1 bg-card text-foreground rounded-md"
                >
                  <SocialLink href="https://www.instagram.com/nikboson" label="instagram." />
                </motion.div>
              </motion.div>
            </BentoGridItem>

            {/* About Section */}
            <BentoGridItem className="md:col-span-1 md:row-span-1">
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 },
                  },
                }}
                className="h-full flex flex-col justify-center p-8 md:p-12"
              >
                <h2 className="text-4xl md:text-5xl font-bold ">My Stack</h2>
                <p className="text-xl md:text-xl  text-muted-foreground mb-6">
                  Rated by Me.
                </p>
                <ul className="text-l text-muted-foreground space-y-3">
                  <li className="flex justify-between w-full">
                    <span>Python & C#</span> <span>★★★★★</span>
                  </li>
                  <li className="flex justify-between w-full">
                    <span>Data Engineering</span> <span>★★★★★</span>
                  </li>
                  <li className="flex justify-between w-full">
                    <span>Azure & AWS</span> <span>★★★★☆</span>
                  </li>
                  <li className="flex justify-between w-full">
                    <span>ML & AI</span> <span>★★★★☆</span>
                  </li>
                  <li className="flex justify-between w-full">
                    <span>K8s & Infra</span> <span>★★★★☆</span>
                  </li>
                  <li className="flex justify-between w-full">
                    <span>React & Next.js</span> <span>★★★☆☆</span>
                  </li>
                </ul>
              </motion.div>
            </BentoGridItem>


            <BentoGridItem className="md:col-span-1 md:row-span-1 py-2">
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 },
                  },
                }}
                className="h-full flex flex-col justify-center p-8 md:p-12"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Who Am I?</h2>
                <p className="text-xl text-muted-foreground">

                  A Data Engineer by day, an ML enthusiast by night, and a guy who has spent way too much time debugging things that should "just work."
                  If you love scalable systems, AI-powered data workflows, we’ll get along just fine.
                </p>
              </motion.div>
            </BentoGridItem>

            <ReviewCarousel />
            {/* Portfolio Images */}
            <BentoGridItem className="md:col-span-2 md:row-span-1 h-[300px]">
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.5 },
                  },
                }}
                className="grid grid-cols-2 gap-2 h-full"
              >
                {/* First Image - Links to External URL */}
                <a
                  href="https://example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative bg-muted rounded-3xl overflow-hidden block"
                >
                  <motion.div whileHover={{ scale: 1.3 }} transition={{ duration: 0.5 }}>
                    <Image
                      src="/resume.avif"
                      alt="resume"
                      width={600}
                      height={300}
                      className="w-full h-full object-cover filter grayscale transition-transform duration-700 hover:scale-[1.4] hover:filter-none"
                    />
                  </motion.div>


                  {/* Centered Download Button - Now a Button Instead of <a> */}
                  <div
                    onClick={() => window.open("https://www.overleaf.com/download/project/65df30e8fae76cd2408eb935/build/195d1b5085f-bafb1411c1452638/output/output.pdf", "_blank")}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-lg font-medium rounded-lg px-2 py-1 opacity-0 hover:opacity-100 transition-opacity duration-300"
                  >
                    Download Resume
                  </div>
                </a>
                {/* Second Image - Links to Works Page */}
                <Link
                  href="/works"
                  className="relative bg-muted rounded-3xl overflow-hidden block"
                >
                  <motion.div
                    initial={{ scale: 1.3 }} // Default scale to 1.3
                    whileHover={{ scale: 1.4 }} // Scale slightly more on hover
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src="/project.jpg"
                      alt="projects"
                      width={600}
                      height={300}
                      className="w-full h-full object-cover filter grayscale transition-transform duration-700 hover:scale-[1.4] hover:filter-none"
                    />
                  </motion.div>

                  {/* Overlay Button for Navigation */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-lg font-medium rounded-lg px-6 py-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    Projects
                  </div>
                </Link>
              </motion.div>
            </BentoGridItem>
          </BentoGrid>

          <BentoGrid className="py-2  md:grid-cols-[70%_30%]">

            <BentoGridItem className="md:col-span-1 md:row-span-1 py-2">
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.5 },
                  },
                }}
                className="h-full flex flex-col justify-center p-8 md:p-12"
              >
                <SpotifyGameGrid />
              </motion.div>
            </BentoGridItem>
            <CurrentlyPlayingCard />
            <BentoGridItem className="w-full md:col-span-2 md:row-span-2 py-2">
              <SpotifyGuessSong />
            </BentoGridItem>
            {/* Footer */}
            <BentoGridItem className="md:col-span-2 md:row-span-1">
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.8, delay: 0.6 } },
                }}
                className="h-full flex flex-col md:flex-row justify-between items-center  px-10 py-2"
              >
                <div className="text-lg font-medium mb-4 md:mb-0">nikhil av</div>
                <div className="text-muted-foreground">all rights reserved. © 2025</div>
              </motion.div>
            </BentoGridItem>
          </BentoGrid>
        </motion.div>
      </div>
    </div>
  )
}
