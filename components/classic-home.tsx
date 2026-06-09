"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { BentoGrid } from "@/components/bento-grid"
import { BentoGridItem } from "@/components/bento-grid-item"
import { SocialLink } from "@/components/social-link"
import AnimatedTitle from "@/components/animate-title"
import ReviewCarousel from "@/components/review"
import CurrentlyPlayingCard from "@/components/currentplaying"

const previewProjects = [
    { title: "Quantos", subtitle: "Private finance terminal (WIP)", href: "https://github.com/i-am-epic" },
    { title: "Helios", subtitle: "Self-healing code project (WIP)", href: "https://github.com/i-am-epic" },
    { title: "TailorPro", subtitle: "Tailor workflow app", href: "https://github.com/i-am-epic/TailorPro" },
    { title: "Family Tree", subtitle: "Graph-based hereditary explorer", href: "https://family-tree-black-nine.vercel.app/" },
    { title: "Nik DevTools", subtitle: "100+ daily dev tools", href: "https://nikdevtools.vercel.app/" },
    { title: "NAVI RAG", subtitle: "Portfolio memory + grounded chat", href: "https://github.com/i-am-epic" },
]

const impactStats = [
    { value: "3+", label: "years of hands-on software experience" },
    { value: "100%", label: "data consistency shipped in production" },
    { value: "70%", label: "sync latency cut on core data flows" },
    { value: "1.1M+", label: "records handled per ingestion batch" },
    { value: "40+", label: "knowledge chunks powering portfolio RAG" },
    { value: "5", label: "countries travelled across Asia" },
    { value: "100+", label: "dev utilities shipped on Nik DevTools" },
    { value: "24/7", label: "shipping mindset during product pushes" },
]

const patchNotes = [
    "Owns high-volume data exports + ETL at ABB. 1.1M+ records, no drama.",
    "Built AI query gen for KQL, SQL, and GraphQL instead of suffering it manually.",
    "Founding-team energy: benchmarks LLMs, ships product, optimizes the ugly bits at 11pm.",
    "Visited Thailand, Malaysia, and Sri Lanka. Travelled Northeast India for 30 days because why not.",
    "Currently obsessed with simulation projects. Physical systems, agent models, market sims — if you have ideas, ping him.",
    "Loves new tech like a kid in a toy store. New framework? Already has a side project planned.",
]

const characterBuild = [
    { label: "Data Systems", score: "SS" },
    { label: "LLMs + RAG", score: "S" },
    { label: "Fast shipping", score: "S" },
    { label: "Founder energy", score: "S" },
    { label: "Product intuition", score: "S" },
    { label: "Debugging under pressure", score: "SS" },
    { label: "Design taste in progress", score: "A+" },
]

export default function ClassicHome() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto py-8">
                <Header activePage="home" />

                <BentoGrid className="md:grid-cols-5">
                    <BentoGridItem className="md:col-span-3 min-h-[460px] p-8 md:p-10">
                        <div className="flex h-full flex-col justify-start pt-2">
                            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">AI x Data x Product</p>
                            <h1 className="text-gradient-brand text-4xl font-bold leading-[1.08] md:text-6xl">Nikhil A V</h1>
                            <div className="mt-2 text-2xl font-semibold md:text-3xl">
                                <AnimatedTitle />
                            </div>
                            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
                                Building fast data systems, market intelligence products, and AI workflows that actually ship.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">3+ years experience</span>
                                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">ABB</span>
                                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">ABB India</span>
                                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Startup founding team</span>
                                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">ETL at scale</span>
                                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">RAG systems</span>
                                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Finance tools</span>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Building at ABB, previously at ABB India, and shipping startup products end-to-end. Always open to strong cofounder-level collaborators.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3 pb-2">
                                <Link
                                    href="mailto:niknikhilav@gmail.com"
                                    className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent/90"
                                >
                                    Let us build together
                                </Link>
                                <Link
                                    href="/works"
                                    className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition hover:text-foreground"
                                >
                                    See case studies
                                </Link>
                            </div>
                        </div>
                    </BentoGridItem>

                    <BentoGridItem className="relative md:col-span-2 overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,122,72,0.16),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(119,166,255,0.1),transparent_28%)]" />
                        <Image
                            src="/nik.png"
                            alt="Nikhil"
                            fill
                            className="object-cover object-top scale-[1.03] grayscale-[15%] contrast-105 brightness-[0.92]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute left-4 top-4 rounded-2xl border border-border bg-card/70 px-4 py-3 text-xs backdrop-blur-md">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Current build</p>
                            <p className="mt-1 text-sm font-medium text-foreground">AI tools, data systems, and product experiments</p>
                        </div>
                        <div className="absolute bottom-4 left-4 rounded-full border border-border bg-card/80 px-4 py-2 text-xs backdrop-blur-md">
                            Bengaluru • Open to ambitious products
                        </div>
                    </BentoGridItem>
                </BentoGrid>

                <BentoGrid className="py-2 md:grid-cols-5">
                    <BentoGridItem className="md:col-span-3 min-h-[360px] p-8">
                        <h2 className="mb-4 text-3xl font-bold">Project Highlights</h2>
                        <p className="mb-5 text-sm text-muted-foreground">Recent builds and what is shipping next</p>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {previewProjects.map((item) => (
                                <a
                                    key={item.title}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-2xl border border-border bg-card-hover p-4 transition hover:-translate-y-1"
                                >
                                    <p className="text-lg font-semibold">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                                </a>
                            ))}
                        </div>
                    </BentoGridItem>

                    <BentoGridItem className="md:col-span-2 p-8">
                        <h2 className="mb-3 text-3xl font-bold">Builder Quest</h2>
                        <p className="mb-4 text-sm text-muted-foreground">Gamified roadmap for this portfolio</p>
                        <div className="space-y-3">
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">FamilyTree v2</p>
                                <div className="h-2 rounded-full bg-card-hover">
                                    <div className="h-2 w-[74%] rounded-full bg-accent" />
                                </div>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">TailorPro polish</p>
                                <div className="h-2 rounded-full bg-card-hover">
                                    <div className="h-2 w-[66%] rounded-full bg-accent" />
                                </div>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">NAVI memory upgrades</p>
                                <div className="h-2 rounded-full bg-card-hover">
                                    <div className="h-2 w-[61%] rounded-full bg-accent" />
                                </div>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Quantos alpha dashboard</p>
                                <div className="h-2 rounded-full bg-card-hover">
                                    <div className="h-2 w-[57%] rounded-full bg-accent" />
                                </div>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Helios evaluator loop</p>
                                <div className="h-2 rounded-full bg-card-hover">
                                    <div className="h-2 w-[48%] rounded-full bg-accent" />
                                </div>
                            </div>
                        </div>
                    </BentoGridItem>
                </BentoGrid>

                <BentoGrid className="py-2 md:grid-cols-3">
                    <BentoGridItem className="p-8">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Impact board</p>
                        <div className="mt-5 grid grid-cols-2 gap-4">
                            {impactStats.map((item) => (
                                <div key={item.label} className="rounded-2xl border border-border bg-card-hover/60 p-4">
                                    <p className="bg-gradient-to-br from-orange-300 to-blue-400 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">{item.value}</p>
                                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </BentoGridItem>

                    <BentoGridItem className="p-8">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Patch notes</p>
                        <div className="mt-5 space-y-2 overflow-y-auto">
                            {patchNotes.map((note, index) => (
                                <div key={note} className="rounded-2xl border border-border bg-card-hover/50 px-4 py-3 text-sm text-foreground/90">
                                    <span className="mr-2 text-accent">0{index + 1}.</span>
                                    {note}
                                </div>
                            ))}
                        </div>
                    </BentoGridItem>

                    <BentoGridItem className="p-8">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Character build</p>
                        <div className="mt-5 space-y-3">
                            {characterBuild.map((item) => (
                                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                                    <span className="text-sm text-foreground">{item.label}</span>
                                    <span className="rounded-full bg-card-hover px-3 py-1 text-xs font-medium text-muted-foreground">{item.score}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Calm in prod, dangerous near a slow batch job, and suspiciously willing to build side quests after work.
                        </p>
                    </BentoGridItem>
                </BentoGrid>

                <BentoGrid className="py-2 md:grid-cols-2">
                    <ReviewCarousel />
                    <CurrentlyPlayingCard />

                    <BentoGridItem className="md:col-span-2 bg-black rounded-xl">
                        <div className="flex flex-wrap items-center justify-center gap-2 p-3">
                            <div className="w-[180px]"><SocialLink href="https://linkedin.com/in/nikhilav" label="linkedin." /></div>
                            <div className="w-[180px]"><SocialLink href="https://github.com/nikhilav" label="github." /></div>
                            <div className="w-[180px]"><SocialLink href="https://leetcode.com/u/i-am-epic/" label="leetcode." /></div>
                            <div className="w-[180px]"><SocialLink href="https://twitter.com/nikhilav" label="twitter." /></div>
                            <div className="w-[180px]"><SocialLink href="https://www.instagram.com/nikboson" label="instagram." /></div>
                        </div>
                    </BentoGridItem>
                </BentoGrid>
            </div>
        </div>
    )
}
