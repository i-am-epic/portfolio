"use client"

import { CSSProperties, MouseEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { ExternalLink, PauseCircle, PlayCircle, SkipBack, SkipForward } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

// Mobile: a draggable glassy circle that snaps to the screen sides (default top-left).
function SpotifyBubble({ image, track, url, isPlaying }: { image: string; track: string; url: string; isPlaying: boolean }) {
    const SIZE = 56
    const [pos, setPos] = useState({ x: 12, y: 88 })
    const [dragging, setDragging] = useState(false)
    const drag = useRef({ active: false, moved: false, dx: 0, dy: 0 })

    const onDown = (e: ReactPointerEvent) => {
        drag.current = { active: true, moved: false, dx: e.clientX - pos.x, dy: e.clientY - pos.y }
        setDragging(true)
        ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    }
    const onMove = (e: ReactPointerEvent) => {
        if (!drag.current.active) return
        if (Math.abs(e.movementX) + Math.abs(e.movementY) > 2) drag.current.moved = true
        setPos({ x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy })
    }
    const onUp = () => {
        if (!drag.current.active) return
        drag.current.active = false
        setDragging(false)
        const w = window.innerWidth, h = window.innerHeight
        setPos((p) => ({
            x: p.x + SIZE / 2 < w / 2 ? 12 : w - SIZE - 12, // snap to nearest side
            y: Math.min(Math.max(p.y, 70), h - SIZE - 100),
        }))
        if (!drag.current.moved) window.open(url, "_blank", "noopener,noreferrer")
    }

    const style: CSSProperties = {
        position: "fixed", left: pos.x, top: pos.y, width: SIZE, height: SIZE, borderRadius: "50%",
        zIndex: 120, overflow: "hidden", touchAction: "none", cursor: dragging ? "grabbing" : "grab",
        boxShadow: "0 8px 22px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.55)",
        WebkitBackdropFilter: "blur(8px) saturate(1.5)", backdropFilter: "blur(8px) saturate(1.5)",
        background: "rgba(18,28,40,0.5)",
        transition: dragging ? "none" : "left 0.3s cubic-bezier(0.34,1.3,0.5,1), top 0.18s ease",
    }
    return (
        <div style={style} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} aria-label={`Spotify: ${track}`}>
            <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
            <span style={{ position: "absolute", right: 3, bottom: 3, width: 11, height: 11, borderRadius: "50%", background: isPlaying ? "#1db954" : "rgba(255,255,255,0.7)", boxShadow: isPlaying ? "0 0 7px #1db954" : "none" }} />
        </div>
    )
}

type SongPayload = {
    item?: {
        name?: string
        album?: { images?: Array<{ url: string }> }
        artists?: Array<{ name: string }>
        external_urls?: { spotify?: string }
    }
}

type SpotifyApiResponse = {
    currentlyPlaying?: SongPayload | null
    lastPlayed?: {
        items?: Array<{
            track?: SongPayload["item"]
        }>
    } | null
}

export function SpotifyMiniPlayer() {
    const pathname = usePathname()
    const isMobile = useIsMobile()
    const [song, setSong] = useState<SongPayload | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    useEffect(() => {
        let mounted = true

        const load = async () => {
            try {
                const response = await fetch("/api/spotify", { cache: "no-store" })
                if (!response.ok) return
                const data = (await response.json()) as SpotifyApiResponse

                if (!mounted) return

                if (data.currentlyPlaying?.item) {
                    setSong(data.currentlyPlaying)
                    setIsPlaying(true)
                    return
                }

                if (data.lastPlayed?.items?.[0]?.track) {
                    setSong({ item: data.lastPlayed.items[0].track })
                    setIsPlaying(false)
                    return
                }

                setSong(null)
            } catch {
                setSong(null)
            }
        }

        load()
        const id = window.setInterval(load, 30000)

        return () => {
            mounted = false
            window.clearInterval(id)
        }
    }, [])

    const image = useMemo(() => song?.item?.album?.images?.[0]?.url || "/placeholder.svg", [song])
    const track = song?.item?.name || "No live track"
    const artist = song?.item?.artists?.[0]?.name || "Spotify"
    const url = song?.item?.external_urls?.spotify || "https://open.spotify.com"

    const handlePointerMove = (event: MouseEvent<HTMLAnchorElement>) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100
        const y = ((event.clientY - rect.top) / rect.height) * 100
        event.currentTarget.style.setProperty("--mx", `${x.toFixed(2)}%`)
        event.currentTarget.style.setProperty("--my", `${y.toFixed(2)}%`)
    }

    const handlePointerLeave = (event: MouseEvent<HTMLAnchorElement>) => {
        event.currentTarget.style.setProperty("--mx", "50%")
        event.currentTarget.style.setProperty("--my", "50%")
    }

    const glassStyle: CSSProperties = {
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 12,
        top: "auto",
        right: "auto",
        ["--mx" as string]: "50%",
        ["--my" as string]: "50%",
    }

    // The 3D world (/world) has its own in-world jukebox, so hide the global mini player there.
    if (pathname?.startsWith("/world")) return null

    // On phones, use a small draggable circle that snaps to the sides instead of the wide bar.
    if (isMobile) return <SpotifyBubble image={image} track={track} url={url} isPlaying={isPlaying} />

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass z-[60] w-[min(92vw,720px)] !rounded-[999px] px-3 py-2 md:px-4 text-white transition hover:scale-[1.003]"
            style={glassStyle}
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
            aria-label="Open track in Spotify"
        >
            <div className="liquid-glass-filter" />
            <div className="liquid-glass-overlay" />
            <div className="liquid-glass-specular" />

            <div className="liquid-glass-content">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="relative h-10 w-10 md:h-11 md:w-11 shrink-0 overflow-hidden rounded-xl border border-white/25 shadow-lg shadow-black/30">
                        <Image src={image} alt={track} fill className="object-cover" />
                    </div>

                    <div className="min-w-0 flex-1 md:w-[26%] md:max-w-[320px] md:flex-none">
                        <p className="line-clamp-1 text-sm md:text-xl font-semibold tracking-tight text-white/95">{track}</p>
                        <p className="line-clamp-1 text-xs text-white/70">{artist}</p>
                    </div>

                    <div className="mx-2 hidden flex-1 sm:block">
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${isPlaying ? "w-[58%] bg-emerald-300" : "w-[36%] bg-white/55"
                                    }`}
                            />
                        </div>
                    </div>

                    <span className="hidden text-[10px] uppercase tracking-[0.14em] text-white/66 lg:inline">
                        {isPlaying ? "Now playing" : "Recently played"}
                    </span>

                    <div className="ml-2 md:ml-3 flex shrink-0 items-center gap-2 md:gap-2.5 text-white/90">
                        <SkipBack size={16} className="hidden sm:block" />
                        {isPlaying ? <PauseCircle size={19} /> : <PlayCircle size={19} />}
                        <SkipForward size={16} className="hidden sm:block" />
                        <ExternalLink size={14} className="ml-1 text-white/75" />
                    </div>
                </div>
            </div>
        </a>
    )
}
