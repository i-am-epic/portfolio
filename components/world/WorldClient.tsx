"use client"

import dynamic from "next/dynamic"
import { Component, type ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PROFILE } from "@/lib/world/worldData"

const World = dynamic(() => import("./World"), {
  ssr: false,
  loading: () => <LoadingScreen label="Loading the world…" />,
})

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="mc-fullscreen mc">
      <div className="mc-spin" />
      <p style={{ color: "#cbd5e1", fontSize: 14 }}>{label}</p>
    </div>
  )
}

function RedirectNotice() {
  return (
    <div className="mc-fullscreen mc">
      <h1 style={{ color: "#ff7a48", textShadow: "2px 2px 0 #000", margin: 0 }}>{PROFILE.name}</h1>
      <p style={{ color: "#cbd5e1", fontSize: 14, maxWidth: 420, lineHeight: 1.6 }}>
        The 3D world is built for desktop. Taking you to the classic portfolio…
      </p>
      <a className="mc-btn mc-btn--accent" href="/classic">Open classic site →</a>
    </div>
  )
}

function WebglFallback() {
  // Brave's fingerprint shields can block WebGL — give a targeted tip.
  const isBrave = typeof navigator !== "undefined" && Boolean((navigator as unknown as { brave?: unknown }).brave)
  return (
    <div className="mc-fullscreen mc">
      <h1 style={{ color: "#ff7a48", textShadow: "2px 2px 0 #000", margin: 0 }}>3D world couldn't start</h1>
      <p style={{ color: "#cbd5e1", fontSize: 14, maxWidth: 460, lineHeight: 1.6 }}>
        Your browser blocked WebGL, which the world needs.
        {isBrave && " On Brave, click the Shields (lion) icon → turn off “Block fingerprinting” for this site, then reload."}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button className="mc-btn mc-btn--accent" onClick={() => location.reload()}>Reload</button>
        <a className="mc-btn mc-btn--ghost" href="/classic">Open classic site →</a>
      </div>
    </div>
  )
}

class WorldErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(err: unknown) {
    console.warn("[world] failed to render:", err)
  }
  render() {
    return this.state.hasError ? <WebglFallback /> : this.props.children
  }
}

export function WorldClient() {
  const router = useRouter()
  const [state, setState] = useState<"checking" | "ok" | "mobile">("checking")

  useEffect(() => {
    const ua = navigator.userAgent || ""
    const uaMobile = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile|Silk/i.test(ua)
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false
    const small = Math.min(window.innerWidth, window.innerHeight) < 760
    // Only real phones/tablets fall back. Desktop browsers (incl. Brave, whose
    // fingerprint shields make WebGL feature-detection unreliable) always get the
    // world; a true WebGL failure is caught by the error boundary below.
    const isMobile = uaMobile || (coarse && small)

    if (isMobile) {
      setState("mobile")
      const t = setTimeout(() => router.replace("/classic"), 1400)
      return () => clearTimeout(t)
    }
    setState("ok")
  }, [router])

  if (state === "mobile") return <RedirectNotice />
  if (state === "checking") return <LoadingScreen label="Preparing world…" />
  return (
    <WorldErrorBoundary>
      <World />
    </WorldErrorBoundary>
  )
}
