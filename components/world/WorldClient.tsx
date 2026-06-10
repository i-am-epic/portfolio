"use client"

import dynamic from "next/dynamic"
import { Component, type ReactNode, useEffect, useState } from "react"
import { useWorld } from "@/lib/world/store"
import { isTouchDevice } from "@/lib/world/touchInput"

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
  const setTouch = useWorld((s) => s.setTouch)
  const [state, setState] = useState<"checking" | "ok">("checking")

  useEffect(() => {
    // Phones and tablets get the world too — with on-screen touch controls
    // instead of pointer lock. Desktop browsers (incl. Brave, whose fingerprint
    // shields make WebGL feature-detection unreliable) always get the world; a
    // true WebGL failure is caught by the error boundary below.
    setTouch(isTouchDevice())
    setState("ok")
  }, [setTouch])

  if (state === "checking") return <LoadingScreen label="Preparing world…" />
  return (
    <WorldErrorBoundary>
      <World />
    </WorldErrorBoundary>
  )
}
