"use client"

import { useEffect } from "react"

export function ChunkErrorRecovery() {
    useEffect(() => {
        const maybeReload = (rawMessage: string) => {
            const message = rawMessage.toLowerCase()

            if (!message.includes("chunkloaderror") && !message.includes("loading chunk")) {
                return
            }

            const key = "chunk-reload-attempted"
            if (!sessionStorage.getItem(key)) {
                sessionStorage.setItem(key, "1")
                window.location.reload()
            }
        }

        const rejectionHandler = (event: PromiseRejectionEvent) => {
            const reason = event.reason as { name?: string; message?: string } | undefined
            maybeReload(`${reason?.name || ""} ${reason?.message || ""}`)
        }

        const errorHandler = (event: ErrorEvent) => {
            maybeReload(`${event.message || ""}`)
        }

        window.addEventListener("unhandledrejection", rejectionHandler)
        window.addEventListener("error", errorHandler)
        return () => {
            window.removeEventListener("unhandledrejection", rejectionHandler)
            window.removeEventListener("error", errorHandler)
        }
    }, [])

    return null
}
