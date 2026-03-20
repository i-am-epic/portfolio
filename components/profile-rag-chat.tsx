"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PanelRightClose } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export function ProfileRagChat() {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm NAVI. I can help with Nikhil's work, projects, resume, finance chats, travel stories, and also general questions with a fun spin. Ask anything 👇",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const submitMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage: ChatMessage = { role: "user", content: trimmed }
    const updated = [...messages, userMessage]
    setMessages(updated)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: updated }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || "Failed")
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: payload.answer || "No response." },
      ])
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Something went wrong"
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Hmm, couldn't get that one: ${msg}` },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed z-[95] bg-card/95 backdrop-blur-md ${isMobile
                ? "bottom-0 left-0 right-0 h-[68vh] border-t border-border"
                : "right-0 top-0 h-full w-[92vw] max-w-sm border-l border-border"
              }`}
          >
            {/* Animated gradient top bar */}
            <div
              className="absolute left-0 right-0 top-0 h-[2px]"
              style={{
                background: "linear-gradient(90deg, #ff7a48, #77a6ff, #ff7a48)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2.8s linear infinite",
              }}
            />

            <div className="flex h-full flex-col p-4 pt-5">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight">NAVI</h2>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Nikhil's AI · ask anything</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-border p-2 text-muted-foreground transition hover:text-foreground"
                  aria-label="Minimize NAVI"
                >
                  <PanelRightClose size={15} />
                </button>
              </div>

              {/* Messages */}
              <div
                className={`mb-3 flex-1 space-y-2 overflow-y-auto rounded-2xl border border-border bg-background/60 p-3 ${isMobile ? "max-h-[44vh]" : ""
                  }`}
              >
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`max-w-[92%] rounded-xl px-3 py-2 text-sm leading-6 ${message.role === "user"
                        ? "ml-auto bg-accent text-accent-foreground"
                        : "bg-card-hover text-foreground navi-prose"
                      }`}
                  >
                    {message.role === "user" ? (
                      message.content
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ children }) => <h2 className="mt-3 mb-1 text-sm font-bold text-foreground">{children}</h2>,
                          h3: ({ children }) => <h3 className="mt-2 mb-1 text-xs font-bold text-foreground/90">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                          em: ({ children }) => <em className="italic text-foreground/80">{children}</em>,
                          ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc space-y-0.5">{children}</ul>,
                          ol: ({ children }) => <ol className="my-1.5 ml-4 list-decimal space-y-0.5">{children}</ol>,
                          li: ({ children }) => <li className="text-sm leading-6">{children}</li>,
                          blockquote: ({ children }) => (
                            <blockquote className="my-2 border-l-2 border-accent pl-3 italic text-muted-foreground">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children, className }) => {
                            const isBlock = className?.includes("language-")
                            return isBlock ? (
                              <pre className="my-2 overflow-x-auto rounded-xl border border-border bg-background/80 p-3 text-xs">
                                <code>{children}</code>
                              </pre>
                            ) : (
                              <code className="rounded bg-background/70 px-1 py-0.5 text-[11px] font-mono text-orange-300">
                                {children}
                              </code>
                            )
                          },
                          table: ({ children }) => (
                            <div className="my-2 overflow-x-auto">
                              <table className="w-full text-xs border-collapse">{children}</table>
                            </div>
                          ),
                          thead: ({ children }) => <thead className="border-b border-border">{children}</thead>,
                          th: ({ children }) => (
                            <th className="px-3 py-1.5 text-left font-semibold text-foreground">{children}</th>
                          ),
                          td: ({ children }) => (
                            <td className="border-t border-border/40 px-3 py-1.5 text-muted-foreground">{children}</td>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent underline underline-offset-2 hover:no-underline"
                            >
                              {children}
                            </a>
                          ),
                          hr: () => <hr className="my-3 border-border" />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                ))}
                {isLoading ? (
                  <div className="max-w-[80%] rounded-xl bg-card-hover px-3 py-2 text-sm text-muted-foreground">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                ) : null}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      submitMessage()
                    }
                  }}
                  placeholder="Ask about Nikhil..."
                  className="flex-1 rounded-xl border border-border bg-background/60 px-4 py-2 text-sm outline-none focus:border-accent/60"
                />
                <button
                  onClick={submitMessage}
                  disabled={isLoading}
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent/90 disabled:opacity-60"
                >
                  →
                </button>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* Collapsed tab — animated glow so users notice it */}
      {!isOpen ? (
        <div
          className={`fixed z-[90] ${isMobile ? "bottom-6 right-0" : "right-0 top-1/2 -translate-y-1/2"
            }`}
        >
          <div className="relative">
            {/* Glow blob behind the tab */}
            <div className="absolute inset-0 rounded-l-2xl bg-gradient-to-b from-orange-400/40 to-blue-400/30 blur-md animate-pulse" />
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={`relative flex items-center gap-1.5 rounded-l-2xl border border-r-0 border-orange-400/50 bg-card/95 backdrop-blur-md transition hover:border-orange-400 ${isMobile ? "flex-row px-4 py-2.5 gap-2" : "flex-col px-2.5 py-5"
                }`}
              aria-label="Open NAVI assistant"
            >
              <span
                className={`font-bold text-foreground ${isMobile ? "text-sm" : "text-[11px] [writing-mode:vertical-lr] rotate-180 tracking-[0.3em]"
                  }`}
              >
                NAVI
              </span>
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
