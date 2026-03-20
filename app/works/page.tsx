"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import { Header } from "@/components/header"
import { ProjectCard } from "@/components/project-card"
import { BentoGridItem } from "@/components/bento-grid-item"
import { BentoGrid } from "@/components/bento-grid"

type ProjectCategory = "All" | "AI" | "Data" | "Backend" | "Cloud" | "Performance"

export default function Works() {
  const projects = [
    {
      id: 0,
      title: "Quantos",
      subtitle: "Private, Finance Terminal, Work in Progress",
      description:
        "A finance-terminal direction focused on market context, research workflows, and fast decision support. Early-stage and actively seeking feedback/collaboration.",
      image: "/projects/quantos.svg",
      year: "2026",
      link: "https://github.com/i-am-epic",
      previewUrl: "https://github.com/i-am-epic",
      status: "WIP",
      tags: ["Data", "Backend", "AI"],
    },
    {
      id: 11,
      title: "Helios",
      subtitle: "Self-Healing Code, AI Agents, Work in Progress",
      description:
        "A self-healing code project exploring issue detection, safe auto-fix flows, and developer-in-the-loop remediation. In progress and open to people who want to build this with him.",
      image: "/projects/helios.svg",
      year: "2026",
      link: "https://github.com/i-am-epic",
      previewUrl: "https://github.com/i-am-epic",
      status: "WIP",
      tags: ["AI", "Backend", "Performance"],
    },
    {
      id: 1,
      title: "TailorPro",
      subtitle: "Dart, Product UX, Order Workflow",
      description:
        "A beautifully designed app for tailors to manage customer records, orders, delivery status, and daily shop operations with practical UX.",
      image: "/projects/mydarzi.svg",
      year: "2026",
      link: "https://github.com/i-am-epic/TailorPro",
      previewUrl: "https://github.com/i-am-epic/TailorPro",
      status: "Active",
      tags: ["Backend", "Cloud"],
    },
    {
      id: 2,
      title: "FamilyTree",
      subtitle: "JavaScript, Graph UX, LLM-ready relations",
      description:
        "Interactive family tree explorer with hereditary relationship mapping and LLM-friendly structure for asking relation-based questions.",
      image: "/projects/family-tree.svg",
      year: "2025",
      link: "https://github.com/i-am-epic/FamilyTree",
      previewUrl: "https://family-tree-black-nine.vercel.app/",
      tags: ["Data", "Backend"],
    },
    {
      id: 3,
      title: "Nik DevTools",
      subtitle: "JavaScript, Productivity, Utility Platform",
      description:
        "A practical toolkit bundling 100+ utility tools developers use frequently, designed to reduce context switching and speed up everyday work.",
      image: "/projects/devtools.svg",
      year: "2025",
      link: "https://github.com/i-am-epic/devtools",
      previewUrl: "https://nikdevtools.vercel.app/",
      tags: ["Backend", "Performance"],
    },
    {
      id: 4,
      title: "HouseAsAInvestment",
      subtitle: "Python, Finance Modeling, Decision Support",
      description:
        "A finance-first tool to evaluate whether buying a house as an investment beats alternate market options based on modeled return scenarios.",
      image: "/projects/house-investment.svg",
      year: "2025",
      link: "https://github.com/i-am-epic/HouseAsAInvestment",
      previewUrl: "https://github.com/i-am-epic/HouseAsAInvestment",
      tags: ["Data", "Performance"],
    },
    {
      id: 5,
      title: "MakeME",
      subtitle: "HTML, LLM Game Loop, Leaderboards",
      description:
        "A playful LLM game where users complete challenge prompts, get AI-scored responses, and compete through a fun leaderboard loop.",
      image: "/projects/makeme.svg",
      year: "2025",
      link: "https://github.com/i-am-epic/MakeME",
      previewUrl: "https://github.com/i-am-epic/MakeME",
      tags: ["AI", "Backend"],
    },
    {
      id: 6,
      title: "IPOSuite",
      subtitle: "Python, React, FastAPI, NLP, RAG",
      description:
        "IPO screening and analysis platform with a RAG chatbot that extracts financial insights from DRHP and RHP documents.",
      image: "/project.jpg",
      year: "2024",
      link: "https://github.com/i-am-epic/IPOSuite",
      previewUrl: "https://github.com/i-am-epic/IPOSuite",
      tags: ["AI", "Data", "Backend"],
    },
    {
      id: 7,
      title: "Hedge-Vault",
      subtitle: "Python, AI/ML, Options, Risk Engine",
      description:
        "AI-driven portfolio risk project with options pricing (Monte Carlo and Black-Scholes), strategy backtesting, and portfolio analytics.",
      image: "/projects/hedgevault.svg",
      year: "2025",
      link: "https://github.com/i-am-epic/Hedge-Vault",
      previewUrl: "https://github.com/i-am-epic/Hedge-Vault",
      tags: ["AI", "Data"],
    },
    {
      id: 8,
      title: "Quantos-terminal",
      subtitle: "TypeScript, Finance Tooling, Terminal UI",
      description:
        "A public finance tool terminal exploring fast market workflows and terminal-like interactions for analytics and decision support.",
      image: "/projects/quantos-terminal.svg",
      year: "2026",
      link: "https://github.com/i-am-epic/Quantos-terminal",
      previewUrl: "https://github.com/i-am-epic/Quantos-terminal",
      status: "New",
      tags: ["Data", "Backend", "Performance"],
    },
    {
      id: 9,
      title: "jaunt-vibe",
      subtitle: "Flutter, Travel UX, Product Experiment",
      description:
        "Flutter app exploration for travel experiences and vibe-based product interactions, tied to broader Jaunt ideas.",
      image: "/projects/jaunt-vibe.svg",
      year: "2025",
      link: "https://github.com/i-am-epic/jaunt-vibe",
      previewUrl: "https://github.com/i-am-epic/jaunt-vibe",
      tags: ["Cloud", "Backend"],
    },
    {
      id: 10,
      title: "ipodigest",
      subtitle: "Python, Market Data, IPO Research",
      description:
        "A practical IPO-focused tool to aggregate and summarize information for faster investor research and monitoring.",
      image: "/projects/ipodigest.svg",
      year: "2024",
      link: "https://github.com/i-am-epic/ipodigest",
      previewUrl: "https://github.com/i-am-epic/ipodigest",
      tags: ["Data", "Backend"],
    },
    {
      id: 12,
      title: "ABBReferralPortal",
      subtitle: "Internal Product, Workflow Automation",
      description:
        "A practical internal referral workflow tool focused on structured submissions and team collaboration flow.",
      image: "/projects/abb-referral.svg",
      year: "2025",
      link: "https://github.com/i-am-epic/ABBReferralPortal",
      previewUrl: "https://github.com/i-am-epic/ABBReferralPortal",
      tags: ["Backend", "Cloud"],
    },
    {
      id: 13,
      title: "TripPlanner",
      subtitle: "Python, Route Planning, Travel Intelligence",
      description:
        "Travel planning engine exploration with itinerary logic and AI-friendly flow structure for recommendations.",
      image: "/projects/tripplanner.svg",
      year: "2025",
      link: "https://github.com/i-am-epic",
      previewUrl: "https://github.com/i-am-epic",
      tags: ["AI", "Data", "Backend"],
    },
    {
      id: 14,
      title: "IPOscreener",
      subtitle: "Python, Market Screening, Finance Analytics",
      description:
        "Early IPO screening utility that laid the foundation for deeper finance products like IPOSuite and related tools.",
      image: "/projects/iposcreener.svg",
      year: "2023",
      link: "https://github.com/i-am-epic/IPOscreener",
      previewUrl: "https://github.com/i-am-epic/IPOscreener",
      tags: ["Data", "Backend"],
    },
    {
      id: 15,
      title: "Stock-investor-on-PE",
      subtitle: "Python, Automation, Market Signals",
      description:
        "Automation project using valuation filters to identify stocks with favorable P/E opportunities in sector context.",
      image: "/projects/stock-pe.svg",
      year: "2020",
      link: "https://github.com/i-am-epic/Stock-investor-on-PE",
      previewUrl: "https://github.com/i-am-epic/Stock-investor-on-PE",
      tags: ["Data", "Performance"],
    },
    {
      id: 16,
      title: "LearnMorse",
      subtitle: "C++, Flutter-era Utility App",
      description:
        "A learning app built around Morse training patterns and quick practice loops; one of his early product experiments.",
      image: "/projects/learnmorse.svg",
      year: "2024",
      link: "https://github.com/i-am-epic/LearnMorse",
      previewUrl: "https://github.com/i-am-epic/LearnMorse",
      tags: ["Backend", "Performance"],
    },
  ];
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("All")
  const categories: ProjectCategory[] = ["All", "AI", "Data", "Backend", "Cloud", "Performance"]

  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((project) => project.tags.includes(activeCategory))

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

              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${activeCategory === category
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>
          </BentoGridItem>
        </BentoGrid>
        <BentoGrid className="gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-2">


          {filteredProjects.map((project) => (
            <BentoGridItem key={project.id} className="md:col-span-2 lg:col-span-3">

              <ProjectCard project={project} />
            </BentoGridItem>

          ))}
        </BentoGrid>
      </div>
    </div>
  )
}
