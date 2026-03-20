"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Command } from "lucide-react"

type CommandItem = {
  id: string
  label: string
  hint: string
  action: () => void
}

export function CommandPalette() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
      if (isShortcut) {
        event.preventDefault()
        setIsOpen((current) => !current)
      }

      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    const onOpenPalette = () => {
      setIsOpen(true)
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("open-command-palette", onOpenPalette)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("open-command-palette", onOpenPalette)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setQuery("")
    }
  }, [isOpen])

  const items = useMemo<CommandItem[]>(
    () => [
      {
        id: "home",
        label: "Go to Home",
        hint: "Landing page",
        action: () => router.push("/"),
      },
      {
        id: "works",
        label: "Open Works",
        hint: "Project archive",
        action: () => router.push("/works"),
      },
      {
        id: "contact",
        label: "Open Contact",
        hint: "Get in touch",
        action: () => router.push("/contact"),
      },
      {
        id: "mail",
        label: "Email Nikhil",
        hint: "niknikhilav@gmail.com",
        action: () => {
          window.location.href = "mailto:niknikhilav@gmail.com"
        },
      },
      {
        id: "resume",
        label: "Download Resume",
        hint: "PDF",
        action: () => {
          window.open(
            "https://www.overleaf.com/download/project/65df30e8fae76cd2408eb935/build/195d1b5085f-bafb1411c1452638/output/output.pdf",
            "_blank"
          )
        },
      },
    ],
    [router]
  )

  const filteredItems = items.filter((item) => {
    const searchable = `${item.label} ${item.hint}`.toLowerCase()
    return searchable.includes(query.toLowerCase())
  })

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 text-sm text-muted-foreground shadow-lg backdrop-blur-md transition hover:text-foreground"
        aria-label="Open command palette"
      >
        <Command size={16} />
        <span>Cmd+K</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div
        className="mx-auto mt-24 w-[92%] max-w-xl rounded-2xl border border-border bg-card p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search actions on ${pathname}`}
          autoFocus
          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground"
        />

        <div className="mt-3 max-h-80 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <p className="rounded-xl px-4 py-3 text-sm text-muted-foreground">No actions found.</p>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action()
                  setIsOpen(false)
                }}
                className="mt-1 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-card-hover"
              >
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.hint}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
