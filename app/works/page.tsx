"use client"

import { useEffect, useRef } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import { Header } from "@/components/header"
import { ProjectCard } from "@/components/project-card"
import { BentoGridItem } from "@/components/bento-grid-item"
import { BentoGrid } from "@/components/bento-grid"

export default function Works() {
  const projects = [
    {
      id: 1,
      title: "IPOSuite (IPO Screening and Analysis Platform)",
      subtitle: "Python, React, Node, NLP, FastAPI, Chatbot, RAG",
      description:
        "Developed a comprehensive IPO analysis platform providing real-time updates on 100+ IPOs. Integrated NLP-based RAG chatbot for extracting key insights from DRHP/RHP documents, with portfolio management and community features to aid investment decisions.",
      image: "/placeholder.svg",
      year: "2024",
      link: "https://github.com/i-am-epic/IPOSuite",
    },
    {
      id: 2,
      title: "Telemetry Data Ingestion Optimization",
      subtitle: "Python, Asyncio, Aiohttp, Azure Event Hub",
      description:
        "Optimized Python scripts for telemetry data ingestion, achieving higher throughput by leveraging asyncio and aiohttp for concurrent requests.",
      image: "/placeholder.svg",
      year: "2024",
      link: "https://example.com/telemetry-optimization",
    },
    {
      id: 3,
      title: "Scalable Data Processing Pipeline",
      subtitle: "Azure, Kubernetes, Horizontal Pod Autoscaler (HPA), gRPC",
      description:
        "Developed a scalable data processing pipeline handling millions of telemetry events, optimizing Kubernetes HPA and gRPC keepalive settings.",
      image: "/placeholder.svg",
      year: "2024",
      link: "https://example.com/scalable-data-pipeline",
    },
    {
      id: 4,
      title: "AI-Powered IPO Investment Model",
      subtitle: "Machine Learning, NLP, Financial Data Analysis",
      description:
        "Built an AI model analyzing DRHP/RHP documents to predict IPO investment potential using NLP and financial indicators.",
      image: "/placeholder.svg",
      year: "2024",
      link: "https://example.com/ipo-ai-model",
    },
    {
      id: 5,
      title: "High-Performance Data Streaming with ADX",
      subtitle: "Azure Data Explorer (ADX), Event Hub, Streaming Ingestion",
      description:
        "Optimized real-time data ingestion and analytics using ADX, fine-tuning batch policies, cluster configurations, and reducing query latencies.",
      image: "/placeholder.svg",
      year: "2024",
      link: "https://example.com/adx-optimization",
    },
    {
      id: 6,
      title: "LandMarker (Property Valuation Platform)",
      subtitle: "AI/ML, Python, React, Maps API, MongoDB, Keras",
      description:
        "Built a land valuation platform to estimate property prices using Google Maps API and AI models. Integrated a recommendation system for personalized accommodation suggestions, collaborating with a team of 4 to develop a scalable, cloud-based architecture.",
      image: "/placeholder.svg",
      year: "2023",
      link: "https://github.com/i-am-epic/LandMarker",
    },
    {
      id: 7,
      title: "So-cio (Social Media Community Platform)",
      subtitle: "Python, FastAPI, NoSQL, JWT, React",
      description:
        "Developed 50+ REST APIs for core social platform features including posting, commenting, voting, and user authentication. Enhanced security using JWT authentication, reducing unauthorized access attempts by 40%. Designed for high-performance, handling 500+ active users with low latency.",
      image: "/placeholder.svg",
      year: "2022",
      link: "https://github.com/i-am-epic/So-cio",
    },
    {
      id: 8,
      title: "Vision Sudoku (Image-Based Sudoku Solver)",
      subtitle: "Python, OpenCV, NumPy, ML, Image Recognition",
      description:
        "Developed an image recognition tool using OpenCV to detect and solve Sudoku puzzles with a 95% accuracy rate. Optimized image processing pipeline for faster performance, solving puzzles in under 3 seconds.",
      image: "/placeholder.svg",
      year: "2020",
      link: "https://github.com/i-am-epic/SudokuSolver",
    },
  ];

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
      <div className="container mx-auto p-8">
        <Header activePage="works" />

        <BentoGrid className="gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <BentoGridItem className="md:col-span-2 lg:col-span-3 p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Projects</h2>
              <p className="text-xl text-muted-foreground mb-4">
                A collection of my recent projects and collaborations. Each project represents a unique challenge and solution.
              </p>
            </motion.div>
          </BentoGridItem>
          </BentoGrid>
          <BentoGrid className="gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-2">


          {projects.map((project) => (
                      <BentoGridItem className="md:col-span-2 lg:col-span-3">

              <ProjectCard project={project} />
              </BentoGridItem>

          ))}
        </BentoGrid>
      </div>
    </div>
  )
}
